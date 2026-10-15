'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePostgresInsertPayload } from '@supabase/supabase-js';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ConvRow {
  id: string;
  user_a_id: string;
  user_b_id: string;
  last_message_at: string | null;
  last_message_content: string | null;
  last_message_sender_id: string | null;
  user_a_display_name: string | null;
  user_a_avatar_url: string | null;
  user_b_display_name: string | null;
  user_b_avatar_url: string | null;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image' | 'quote_request';
  read_at: string | null;
  created_at: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(ts: string | null): string {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'maintenant';
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (diff < 86400 * 7) return d.toLocaleDateString('fr-FR', { weekday: 'short' });
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

function initials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

// ─── Couleur d'avatar déterministe ──────────────────────────────────────────

const AVATAR_COLORS = ['#59364A', '#C77D69', '#A8B5A2', '#8B6B7A', '#D4956B'];
function avatarColor(id: string): string {
  let n = 0;
  for (const c of id) n = (n * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

// ─── Composant principal ─────────────────────────────────────────────────────

function MessagesPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [me, setMe] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConvRow[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ─── Auth guard ─────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) => {
      if (!data.user) { router.replace('/connexion'); return; }
      setMe(data.user.id);
    });
  }, []);

  // ─── Charger les conversations ───────────────────────────────────────────

  const fetchConversations = useCallback(async () => {
    if (!me) return;
    setLoadingConvs(true);
    const { data } = await supabase
      .from('v_conversations')
      .select('*')
      .or(`user_a_id.eq.${me},user_b_id.eq.${me}`)
      .order('last_message_at', { ascending: false, nullsFirst: false });
    setConversations((data ?? []) as ConvRow[]);
    setLoadingConvs(false);
  }, [me]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Ouvrir directement une conversation si ?conv= dans l'URL
  useEffect(() => {
    const convParam = searchParams?.get('conv');
    if (convParam) setActiveConvId(convParam);
  }, [searchParams]);

  // ─── Charger les messages d'une conversation ─────────────────────────────

  const fetchMessages = useCallback(async (convId: string) => {
    setLoadingMsgs(true);
    const { data } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, content, type, read_at, created_at')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(100);
    setMessages((data ?? []) as Message[]);
    setLoadingMsgs(false);
  }, []);

  // ─── Supabase Realtime : subscribe aux nouveaux messages ─────────────────

  useEffect(() => {
    if (!activeConvId) return;
    fetchMessages(activeConvId);

    // Unsubscribe canal précédent
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`messages-${activeConvId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConvId}` },
        (payload: RealtimePostgresInsertPayload<Message>) => {
          setMessages((prev: Message[]) => {
            const newMsg = payload.new as Message;
            if (prev.some((m: Message) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Mettre à jour le last_message dans la liste
          setConversations((prev: ConvRow[]) =>
            prev.map((c: ConvRow) => c.id === activeConvId
              ? { ...c, last_message_content: (payload.new as Message).content, last_message_at: (payload.new as Message).created_at }
              : c
            )
          );
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [activeConvId]);

  // Scroll vers le bas quand les messages changent
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Marquer messages comme lus ─────────────────────────────────────────

  useEffect(() => {
    if (!activeConvId || !me) return;
    supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', activeConvId)
      .neq('sender_id', me)
      .is('read_at', null)
      .then(() => {});
  }, [activeConvId, messages.length]);

  // ─── Envoyer un message ──────────────────────────────────────────────────

  const sendMessage = async () => {
    if (!draft.trim() || !activeConvId || !me || sending) return;
    const content = draft.trim();
    setDraft('');
    setSending(true);

    const { error } = await supabase.from('messages').insert({
      conversation_id: activeConvId,
      sender_id: me,
      content,
      type: 'text',
    });

    if (!error) {
      // Mettre à jour last_message_at de la conversation
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', activeConvId);
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: { key: string; shiftKey: boolean; preventDefault: () => void }) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─── Données de l'interlocutrice ────────────────────────────────────────

  function otherUser(conv: ConvRow) {
    if (!me) return { name: '', avatar: null, id: '' };
    if (conv.user_a_id === me) {
      return { name: conv.user_b_display_name ?? 'Utilisatrice', avatar: conv.user_b_avatar_url, id: conv.user_b_id };
    }
    return { name: conv.user_a_display_name ?? 'Utilisatrice', avatar: conv.user_a_avatar_url, id: conv.user_a_id };
  }

  function unreadCount(conv: ConvRow): number {
    if (conv.id !== activeConvId) return 0; // à améliorer avec un vrai compteur
    return 0;
  }

  const activeConv = conversations.find((c: ConvRow) => c.id === activeConvId);
  const activeOther = activeConv ? otherUser(activeConv) : null;

  // ─── Rendu liste conversations (vue mobile) ──────────────────────────────

  const renderConvList = () => (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {loadingConvs ? (
        <div style={{ padding: 32, textAlign: 'center', color: '#bbb' }}>
          <div style={{ fontSize: 28 }}>💬</div>
          <p style={{ marginTop: 8, fontSize: 14 }}>Chargement…</p>
        </div>
      ) : conversations.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💌</div>
          <p style={{ fontWeight: 600, color: '#59364A', fontSize: 16, marginBottom: 8 }}>Aucune conversation</p>
          <p style={{ fontSize: 14, lineHeight: 1.5 }}>Trouvez une prestataire et contactez-la pour démarrer un échange.</p>
          <button
            onClick={() => router.push('/rechercher')}
            style={{ marginTop: 20, background: '#59364A', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
          >
            Rechercher une prestataire
          </button>
        </div>
      ) : (
        conversations.map(conv => {
          const other = otherUser(conv);
          const isActive = conv.id === activeConvId;
          const isMine = conv.last_message_sender_id === me;
          return (
            <button
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                padding: '14px 16px', border: 'none', textAlign: 'left', cursor: 'pointer',
                background: isActive ? '#f3edf0' : '#fff',
                borderBottom: '1px solid #f0ebe4',
                transition: 'background 0.15s',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                background: other.avatar ? 'transparent' : avatarColor(other.id),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 18, overflow: 'hidden',
              }}>
                {other.avatar
                  ? <img src={other.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initials(other.name)}
              </div>
              {/* Contenu */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#292929', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {other.name}
                  </span>
                  <span style={{ fontSize: 11, color: '#bbb', flexShrink: 0, marginLeft: 8 }}>
                    {timeAgo(conv.last_message_at)}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                  {isMine && <span style={{ color: '#C77D69' }}>Vous : </span>}
                  {conv.last_message_content ?? 'Démarrer la conversation…'}
                </p>
              </div>
            </button>
          );
        })
      )}
    </div>
  );

  // ─── Rendu vue conversation ouverte ─────────────────────────────────────

  const renderConversation = () => {
    if (!activeConvId || !activeOther) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Header */}
        <div style={{ background: '#59364A', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <button onClick={() => setActiveConvId(null)} style={{ background: 'none', border: 'none', color: '#FAF7F2', fontSize: 22, cursor: 'pointer', padding: 0, lineHeight: 1 }}>←</button>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', background: activeOther.avatar ? 'transparent' : avatarColor(activeOther.id),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 16, overflow: 'hidden', flexShrink: 0,
          }}>
            {activeOther.avatar
              ? <img src={activeOther.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials(activeOther.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#FAF7F2', fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeOther.name}
            </div>
          </div>
          <button
            onClick={() => router.push(`/profil/${activeOther.id}`)}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FAF7F2', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
          >
            Voir profil
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', background: '#FAF7F2', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loadingMsgs ? (
            <div style={{ textAlign: 'center', color: '#bbb', marginTop: 40, fontSize: 14 }}>Chargement…</div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#bbb', marginTop: 60 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>👋</div>
              <p style={{ fontSize: 14 }}>Envoyez votre premier message à {activeOther.name}</p>
            </div>
          ) : (
            messages.map(msg => {
              const isMine = msg.sender_id === me;
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  {msg.type === 'quote_request' ? (
                    <div style={{
                      maxWidth: '80%', background: '#fff', border: '1.5px solid #C77D69',
                      borderRadius: 14, padding: '12px 16px',
                    }}>
                      <div style={{ fontSize: 11, color: '#C77D69', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>📋 Demande de devis</div>
                      <p style={{ margin: 0, fontSize: 14, color: '#292929', lineHeight: 1.5 }}>{msg.content}</p>
                      <div style={{ fontSize: 11, color: '#bbb', marginTop: 6, textAlign: isMine ? 'right' : 'left' }}>
                        {timeAgo(msg.created_at)}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      maxWidth: '75%',
                      background: isMine ? '#59364A' : '#fff',
                      color: isMine ? '#FAF7F2' : '#292929',
                      borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      padding: '10px 14px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
                    }}>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                      <div style={{ fontSize: 10, color: isMine ? 'rgba(250,247,242,0.6)' : '#bbb', marginTop: 4, textAlign: 'right' }}>
                        {timeAgo(msg.created_at)}
                        {isMine && msg.read_at && ' · ✓✓'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Zone de saisie */}
        <div style={{ borderTop: '1px solid #e8e1d9', background: '#fff', padding: '10px 12px', display: 'flex', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
          <textarea
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Votre message…"
            rows={1}
            style={{
              flex: 1, border: '1.5px solid #e0d8d2', borderRadius: 12, padding: '10px 14px',
              fontSize: 14, resize: 'none', outline: 'none', background: '#FAF7F2',
              fontFamily: 'inherit', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#59364A')}
            onBlur={e => (e.currentTarget.style.borderColor = '#e0d8d2')}
          />
          <button
            onClick={sendMessage}
            disabled={!draft.trim() || sending}
            style={{
              width: 42, height: 42, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: draft.trim() && !sending ? '#59364A' : '#ddd',
              color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.2s',
            }}
          >
            {sending ? '…' : '↑'}
          </button>
        </div>
      </div>
    );
  };

  // ─── Layout principal ─────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100dvh', background: '#FAF7F2', fontFamily: "'Segoe UI', system-ui, sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* Header principal (visible seulement sur la liste) */}
      {!activeConvId && (
        <header style={{ background: '#59364A', padding: '16px', position: 'sticky', top: 0, zIndex: 100 }}>
          <h1 style={{ color: '#FAF7F2', margin: 0, fontSize: 20, fontWeight: 700 }}>Messages</h1>
        </header>
      )}

      {/* Contenu */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: activeConvId ? '100dvh' : undefined }}>
        {activeConvId ? renderConversation() : renderConvList()}
      </div>

      {/* Nav bar bottom (uniquement sur la liste) */}
      {!activeConvId && (
        <nav style={{ background: '#fff', borderTop: '1px solid #e8e1d9', display: 'flex', justifyContent: 'space-around', padding: '10px 0 20px', position: 'sticky', bottom: 0 }}>
          {[
            { icon: '🏠', label: 'Accueil', href: '/' },
            { icon: '🔍', label: 'Rechercher', href: '/rechercher' },
            { icon: '➕', label: 'Publier', href: '/publier' },
            { icon: '💬', label: 'Messages', href: '/messages', active: true },
            { icon: '👤', label: 'Profil', href: '/mon-profil' },
          ].map(item => (
            <button key={item.href} onClick={() => router.push(item.href)}
              style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', padding: '0 8px' }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span style={{ fontSize: 10, color: item.active ? '#59364A' : '#aaa', fontWeight: item.active ? 700 : 400 }}>{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

// Wrapper Suspense requis pour useSearchParams dans Next.js App Router
export default function MessagesPageWrapper() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF7F2', color: '#bbb' }}>Chargement…</div>}>
      <MessagesPage />
    </Suspense>
  );
}

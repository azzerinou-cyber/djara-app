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

interface QuoteItem { name: string; price: number; }
interface QuoteData { items: QuoteItem[]; total: number; note?: string; }

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image' | 'quote_request';
  metadata: { status?: 'pending' | 'accepted' | 'refused' } | null;
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

const AVATAR_COLORS = ['#59364A', '#C77D69', '#A8B5A2', '#8B6B7A', '#D4956B'];
function avatarColor(id: string): string {
  let n = 0;
  for (const c of id) n = (n * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

function parseQuote(content: string): QuoteData | null {
  try { return JSON.parse(content) as QuoteData; } catch { return null; }
}

function formatPrice(p: number) {
  return p.toLocaleString('fr-DZ') + ' DA';
}

// ─── Formulaire devis ────────────────────────────────────────────────────────

interface DevisFormProps {
  onSend: (data: QuoteData) => Promise<void>;
  onClose: () => void;
}

function DevisForm({ onSend, onClose }: DevisFormProps) {
  const [items, setItems] = useState<QuoteItem[]>([{ name: '', price: 0 }]);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const addItem = () => setItems(prev => [...prev, { name: '', price: 0 }]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof QuoteItem, val: string) => {
    setItems(prev => prev.map((item, idx) =>
      idx === i ? { ...item, [field]: field === 'price' ? Number(val) || 0 : val } : item
    ));
  };

  const total = items.reduce((s, it) => s + it.price, 0);
  const valid = items.every(it => it.name.trim() && it.price > 0);

  const handleSend = async () => {
    if (!valid || sending) return;
    setSending(true);
    await onSend({ items, total, note: note.trim() || undefined });
    setSending(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480,
        padding: '24px 20px 32px', maxHeight: '80vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: '#59364A', fontSize: 17, fontWeight: 700 }}>📋 Créer un devis</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}>×</button>
        </div>

        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
            <input
              value={item.name}
              onChange={e => updateItem(i, 'name', e.target.value)}
              placeholder="Prestation (ex : Coiffure)"
              style={{ flex: 2, border: '1.5px solid #e0d8d2', borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none' }}
            />
            <input
              type="number"
              value={item.price || ''}
              onChange={e => updateItem(i, 'price', e.target.value)}
              placeholder="Prix DA"
              min={0}
              style={{ flex: 1, border: '1.5px solid #e0d8d2', borderRadius: 8, padding: '9px 10px', fontSize: 14, outline: 'none' }}
            />
            {items.length > 1 && (
              <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: '#e57', fontSize: 18, cursor: 'pointer', padding: '0 4px' }}>×</button>
            )}
          </div>
        ))}

        <button
          onClick={addItem}
          style={{ background: 'none', border: '1.5px dashed #C77D69', borderRadius: 8, color: '#C77D69', padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 14, width: '100%' }}
        >
          + Ajouter une prestation
        </button>

        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Note facultative (délai, conditions…)"
          rows={2}
          style={{ width: '100%', border: '1.5px solid #e0d8d2', borderRadius: 8, padding: '9px 12px', fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 14 }}
        />

        <div style={{ background: '#f3edf0', borderRadius: 10, padding: '10px 14px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: '#59364A', fontSize: 14 }}>Total</span>
          <span style={{ fontWeight: 700, color: '#59364A', fontSize: 16 }}>{formatPrice(total)}</span>
        </div>

        <button
          onClick={handleSend}
          disabled={!valid || sending}
          style={{
            width: '100%', background: valid && !sending ? '#59364A' : '#ccc', color: '#fff',
            border: 'none', borderRadius: 12, padding: '13px', fontWeight: 700, fontSize: 15, cursor: valid ? 'pointer' : 'default',
          }}
        >
          {sending ? 'Envoi…' : 'Envoyer le devis'}
        </button>
      </div>
    </div>
  );
}

// ─── Carte devis dans le chat ────────────────────────────────────────────────

interface QuoteCardProps {
  msg: Message;
  isMine: boolean;
  onAccept: (msgId: string) => Promise<void>;
  onRefuse: (msgId: string) => Promise<void>;
}

function QuoteCard({ msg, isMine, onAccept, onRefuse }: QuoteCardProps) {
  const quote = parseQuote(msg.content);
  const status = msg.metadata?.status ?? 'pending';
  const [acting, setActing] = useState(false);

  if (!quote) return (
    <div style={{ maxWidth: '80%', background: '#fff', border: '1.5px solid #C77D69', borderRadius: 14, padding: '12px 16px' }}>
      <p style={{ margin: 0, fontSize: 14, color: '#292929' }}>{msg.content}</p>
    </div>
  );

  const statusColor = status === 'accepted' ? '#2d8a4e' : status === 'refused' ? '#c0392b' : '#C77D69';
  const statusLabel = status === 'accepted' ? '✓ Devis accepté' : status === 'refused' ? '✗ Devis refusé' : null;

  const handleAccept = async () => {
    if (acting) return;
    setActing(true);
    await onAccept(msg.id);
    setActing(false);
  };

  const handleRefuse = async () => {
    if (acting) return;
    setActing(true);
    await onRefuse(msg.id);
    setActing(false);
  };

  return (
    <div style={{
      maxWidth: '82%',
      background: '#fff',
      border: `1.5px solid ${statusColor}`,
      borderRadius: 14,
      padding: '14px 16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    }}>
      {/* Titre */}
      <div style={{ fontSize: 11, color: statusColor, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 }}>
        📋 DEVIS
      </div>

      {/* Lignes */}
      {quote.items.map((item, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 14, color: '#292929' }}>
            {i === 0 ? '💇' : '💄'} {item.name}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#59364A' }}>{formatPrice(item.price)}</span>
        </div>
      ))}

      {/* Séparateur */}
      <div style={{ borderTop: '1px solid #e8e1d9', margin: '10px 0' }} />

      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: quote.note ? 6 : 0 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#292929' }}>Total : {formatPrice(quote.total)}</span>
      </div>

      {/* Note */}
      {quote.note && (
        <p style={{ margin: '6px 0 0', fontSize: 12, color: '#888', lineHeight: 1.4 }}>{quote.note}</p>
      )}

      {/* Heure */}
      <div style={{ fontSize: 10, color: '#bbb', marginTop: 8, textAlign: 'right' }}>{timeAgo(msg.created_at)}</div>

      {/* Actions ou statut */}
      {statusLabel ? (
        <div style={{ marginTop: 10, fontWeight: 700, fontSize: 13, color: statusColor, textAlign: 'center' }}>
          {statusLabel}
        </div>
      ) : !isMine ? (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            onClick={handleAccept}
            disabled={acting}
            style={{
              flex: 1, background: acting ? '#ccc' : '#59364A', color: '#fff',
              border: 'none', borderRadius: 8, padding: '10px', cursor: acting ? 'default' : 'pointer',
              fontWeight: 700, fontSize: 13,
            }}
          >
            {acting ? '…' : '✓ Accepter'}
          </button>
          <button
            onClick={handleRefuse}
            disabled={acting}
            style={{
              flex: 1, background: '#fff', color: acting ? '#ccc' : '#c0392b',
              border: `1.5px solid ${acting ? '#ccc' : '#c0392b'}`, borderRadius: 8, padding: '10px',
              cursor: acting ? 'default' : 'pointer', fontWeight: 700, fontSize: 13,
            }}
          >
            {acting ? '…' : '✕ Refuser'}
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 10, fontSize: 12, color: '#bbb', textAlign: 'center' }}>En attente de réponse…</div>
      )}
    </div>
  );
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
  const [showDevisForm, setShowDevisForm] = useState(false);

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

  useEffect(() => {
    const convParam = searchParams?.get('conv');
    if (convParam) setActiveConvId(convParam);
  }, [searchParams]);

  // ─── Charger les messages ────────────────────────────────────────────────

  const fetchMessages = useCallback(async (convId: string) => {
    setLoadingMsgs(true);
    const { data } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, content, type, metadata, read_at, created_at')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(100);
    setMessages((data ?? []) as Message[]);
    setLoadingMsgs(false);
  }, []);

  // ─── Realtime ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!activeConvId) return;
    fetchMessages(activeConvId);

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
          setConversations((prev: ConvRow[]) =>
            prev.map((c: ConvRow) => c.id === activeConvId
              ? { ...c, last_message_content: (payload.new as Message).content, last_message_at: (payload.new as Message).created_at }
              : c
            )
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConvId}` },
        (payload) => {
          // Mise à jour du statut du devis (metadata)
          setMessages((prev: Message[]) =>
            prev.map((m: Message) => m.id === payload.new.id ? { ...m, ...(payload.new as Message) } : m)
          );
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [activeConvId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  // ─── Envoyer un message texte ────────────────────────────────────────────

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
      await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', activeConvId);
    }
    setSending(false);
    inputRef.current?.focus();
  };

  // ─── Envoyer un devis ────────────────────────────────────────────────────

  const sendDevis = async (data: QuoteData) => {
    if (!activeConvId || !me) return;
    const { error } = await supabase.from('messages').insert({
      conversation_id: activeConvId,
      sender_id: me,
      content: JSON.stringify(data),
      type: 'quote_request',
      metadata: { status: 'pending' },
    });
    if (!error) {
      await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', activeConvId);
    }
    setShowDevisForm(false);
  };

  // ─── Accepter un devis ───────────────────────────────────────────────────

  const acceptDevis = async (msgId: string) => {
    if (!activeConvId || !me) return;
    // Mettre à jour le statut dans metadata
    await supabase
      .from('messages')
      .update({ metadata: { status: 'accepted' } })
      .eq('id', msgId);
    // Envoyer un message de confirmation
    await supabase.from('messages').insert({
      conversation_id: activeConvId,
      sender_id: me,
      content: '✓ J\'ai accepté votre devis. À bientôt !',
      type: 'text',
    });
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', activeConvId);
    // Recharger les messages pour refléter le changement
    fetchMessages(activeConvId);
  };

  // ─── Refuser un devis ────────────────────────────────────────────────────

  const refuseDevis = async (msgId: string) => {
    if (!activeConvId || !me) return;
    await supabase
      .from('messages')
      .update({ metadata: { status: 'refused' } })
      .eq('id', msgId);
    await supabase.from('messages').insert({
      conversation_id: activeConvId,
      sender_id: me,
      content: 'Merci pour votre devis, mais je ne souhaite pas donner suite.',
      type: 'text',
    });
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', activeConvId);
    fetchMessages(activeConvId);
  };

  const handleKeyDown = (e: { key: string; shiftKey: boolean; preventDefault: () => void }) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  function otherUser(conv: ConvRow) {
    if (!me) return { name: '', avatar: null, id: '' };
    if (conv.user_a_id === me) return { name: conv.user_b_display_name ?? 'Utilisatrice', avatar: conv.user_b_avatar_url, id: conv.user_b_id };
    return { name: conv.user_a_display_name ?? 'Utilisatrice', avatar: conv.user_a_avatar_url, id: conv.user_a_id };
  }

  const activeConv = conversations.find((c: ConvRow) => c.id === activeConvId);
  const activeOther = activeConv ? otherUser(activeConv) : null;

  // ─── Liste conversations ─────────────────────────────────────────────────

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
          <button onClick={() => router.push('/rechercher')} style={{ marginTop: 20, background: '#59364A', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            Rechercher une prestataire
          </button>
        </div>
      ) : (
        conversations.map(conv => {
          const other = otherUser(conv);
          const isActive = conv.id === activeConvId;
          const isMine = conv.last_message_sender_id === me;
          return (
            <button key={conv.id} onClick={() => setActiveConvId(conv.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
              padding: '14px 16px', border: 'none', textAlign: 'left', cursor: 'pointer',
              background: isActive ? '#f3edf0' : '#fff', borderBottom: '1px solid #f0ebe4', transition: 'background 0.15s',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                background: other.avatar ? 'transparent' : avatarColor(other.id),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 18, overflow: 'hidden',
              }}>
                {other.avatar ? <img src={other.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(other.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#292929', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{other.name}</span>
                  <span style={{ fontSize: 11, color: '#bbb', flexShrink: 0, marginLeft: 8 }}>{timeAgo(conv.last_message_at)}</span>
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

  // ─── Vue conversation ────────────────────────────────────────────────────

  const renderConversation = () => {
    if (!activeConvId || !activeOther) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: '#59364A', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <button onClick={() => setActiveConvId(null)} style={{ background: 'none', border: 'none', color: '#FAF7F2', fontSize: 22, cursor: 'pointer', padding: 0, lineHeight: 1 }}>←</button>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: activeOther.avatar ? 'transparent' : avatarColor(activeOther.id),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 16, overflow: 'hidden', flexShrink: 0,
          }}>
            {activeOther.avatar ? <img src={activeOther.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(activeOther.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#FAF7F2', fontWeight: 700, fontSize: 15 }}>{activeOther.name}</div>
          </div>
          <button onClick={() => router.push(`/profil/${activeOther.id}`)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FAF7F2', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            Voir profil
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '16px 16px 8px', background: '#FAF7F2', display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                    <QuoteCard msg={msg} isMine={isMine} onAccept={acceptDevis} onRefuse={refuseDevis} />
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

        {/* Barre de saisie — une seule ligne, flexShrink:0, ne disparaît jamais */}
        <div style={{
          background: '#fff', borderTop: '1px solid #e8e1d9',
          flexShrink: 0, padding: '10px 12px 14px',
          display: 'flex', alignItems: 'flex-end', gap: 8,
        }}>
          {/* Bouton devis — icône à gauche */}
          <button
            onClick={() => setShowDevisForm(true)}
            title="Envoyer un devis"
            style={{
              width: 42, height: 42, borderRadius: '50%', border: '2px solid #C77D69',
              background: '#f3edf0', color: '#59364A', fontSize: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            📋
          </button>
          {/* Textarea */}
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
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#59364A')}
            onBlur={e => (e.currentTarget.style.borderColor = '#e0d8d2')}
          />
          {/* Bouton envoi */}
          <button
            onClick={sendMessage}
            disabled={!draft.trim() || sending}
            style={{
              width: 42, height: 42, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: draft.trim() && !sending ? '#59364A' : '#ddd',
              color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            {sending ? '…' : '↑'}
          </button>
        </div>
      </div>
    );
  };

  // ─── Layout ───────────────────────────────────────────────────────────────

  return (
    <div style={{ height: '100dvh', background: '#FAF7F2', fontFamily: "'Segoe UI', system-ui, sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {!activeConvId && (
        <header style={{ background: '#59364A', padding: '16px', flexShrink: 0 }}>
          <h1 style={{ color: '#FAF7F2', margin: 0, fontSize: 20, fontWeight: 700 }}>Messages</h1>
        </header>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {activeConvId ? renderConversation() : renderConvList()}
      </div>

      {!activeConvId && (
        <nav style={{ background: '#fff', borderTop: '1px solid #e8e1d9', display: 'flex', justifyContent: 'space-around', padding: '10px 0 20px', position: 'sticky', bottom: 0 }}>
          {[
            { icon: '🏠', label: 'Accueil', href: '/' },
            { icon: '🔍', label: 'Rechercher', href: '/rechercher' },
            { icon: '➕', label: 'Publier', href: '/publier' },
            { icon: '💬', label: 'Messages', href: '/messages', active: true },
            { icon: '👤', label: 'Profil', href: '/mon-profil' },
          ].map(item => (
            <button key={item.href} onClick={() => router.push(item.href)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', padding: '0 8px' }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span style={{ fontSize: 10, color: item.active ? '#59364A' : '#aaa', fontWeight: item.active ? 700 : 400 }}>{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* Formulaire devis */}
      {showDevisForm && (
        <DevisForm onSend={sendDevis} onClose={() => setShowDevisForm(false)} />
      )}
    </div>
  );
}

export default function MessagesPageWrapper() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF7F2', color: '#bbb' }}>Chargement…</div>}>
      <MessagesPage />
    </Suspense>
  );
}

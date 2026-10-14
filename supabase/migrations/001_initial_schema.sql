-- ============================================================
-- DJARA — Schéma initial de base de données
-- Migration 001 — À exécuter dans l'éditeur SQL Supabase
-- ============================================================

-- Extension PostGIS pour la géolocalisation
create extension if not exists postgis;

-- ============================================================
-- TABLE : profiles
-- Profil public de chaque utilisatrice
-- ============================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  phone        text,
  wilaya       text,
  commune      text,
  bio          text,
  avatar_url   text,
  trust_level  smallint not null default 1 check (trust_level between 1 and 4),
  is_active    boolean not null default true,
  is_verified  boolean not null default false,
  -- Géolocalisation approximative (centroïde de la commune, jamais l'adresse exacte)
  location     geography(Point, 4326),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is 'Profil public des utilisatrices DJARA';
comment on column public.profiles.trust_level is '1=téléphone, 2=identité, 3=qualifications, 4=historique positif';
comment on column public.profiles.location is 'Coordonnées approximatives (centroïde commune) — jamais l adresse exacte';

-- ============================================================
-- TABLE : categories
-- Catégories et sous-catégories de services
-- ============================================================
create table if not exists public.categories (
  id          serial primary key,
  parent_id   int references public.categories(id),
  slug        text not null unique,
  name_fr     text not null,
  name_ar     text not null,
  icon        text,
  sort_order  smallint default 0,
  is_active   boolean not null default true
);

comment on table public.categories is 'Catégories de services (arborescence parent/enfant)';

-- Données initiales — catégories principales
insert into public.categories (slug, name_fr, name_ar, icon, sort_order) values
  ('maison',      'Maison & Quotidien',   'المنزل والحياة اليومية', '🍳', 1),
  ('beaute',      'Beauté & Bien-être',   'الجمال والعناية',        '💄', 2),
  ('education',   'Éducation',            'التعليم',                '📚', 3),
  ('artisanat',   'Couture & Artisanat',  'الخياطة والحرف',         '🧵', 4),
  ('digital',     'Digital & Création',   'الرقمي والإبداع',        '💻', 5),
  ('evenements',  'Événements',           'الفعاليات',              '🎉', 6)
on conflict (slug) do nothing;

-- Sous-catégories — Maison
insert into public.categories (parent_id, slug, name_fr, name_ar, sort_order)
select id, slug, name_fr, name_ar, sort_order from (values
  ('maison-cuisine',    'Cuisine traditionnelle',    'الطبخ التقليدي',   1),
  ('maison-patisserie', 'Pâtisserie',                'الحلويات',         2),
  ('maison-couture',    'Couture',                   'الخياطة',          3),
  ('maison-repassage',  'Repassage',                 'الكوي',            4),
  ('maison-menage',     'Aide ménagère',             'المساعدة المنزلية',5)
) as v(slug, name_fr, name_ar, sort_order)
cross join (select id from public.categories where slug = 'maison') c
on conflict (slug) do nothing;

-- Sous-catégories — Beauté
insert into public.categories (parent_id, slug, name_fr, name_ar, sort_order)
select id, slug, name_fr, name_ar, sort_order from (values
  ('beaute-coiffure',   'Coiffure féminine', 'تصفيف الشعر',   1),
  ('beaute-maquillage', 'Maquillage',        'المكياج',        2),
  ('beaute-soins',      'Soins esthétiques', 'العناية الجمالية',3),
  ('beaute-henne',      'Henné',             'الحناء',         4),
  ('beaute-onglerie',   'Onglerie',          'تجميل الأظافر',  5)
) as v(slug, name_fr, name_ar, sort_order)
cross join (select id from public.categories where slug = 'beaute') c
on conflict (slug) do nothing;

-- ============================================================
-- TABLE : services
-- Annonces publiées par les prestataires
-- ============================================================
create table if not exists public.services (
  id            uuid primary key default gen_random_uuid(),
  provider_id   uuid not null references public.profiles(id) on delete cascade,
  category_id   int references public.categories(id),
  title         text not null,
  description   text,
  price_min     int,   -- en DA
  price_max     int,
  price_unit    text default 'séance',  -- séance, heure, forfait, etc.
  is_remote     boolean not null default false,
  is_available  boolean not null default true,
  images        text[],
  wilaya        text,
  commune       text,
  -- Géolocalisation approximative héritée du profil
  location      geography(Point, 4326),
  views_count   int not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.services is 'Annonces de services publiées par les prestataires';

-- Index géospatial pour les recherches par proximité
create index if not exists services_location_idx on public.services using gist(location);
create index if not exists services_provider_idx on public.services(provider_id);
create index if not exists services_category_idx on public.services(category_id);
create index if not exists services_wilaya_idx on public.services(wilaya);

-- ============================================================
-- TABLE : bookings
-- Demandes de prestation entre cliente et prestataire
-- ============================================================
create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  service_id    uuid not null references public.services(id),
  client_id     uuid not null references public.profiles(id),
  provider_id   uuid not null references public.profiles(id),
  status        text not null default 'pending'
                  check (status in ('pending','accepted','refused','cancelled','completed','disputed')),
  scheduled_at  timestamptz,
  message       text,
  provider_note text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- Empêcher l'auto-réservation
  constraint no_self_booking check (client_id <> provider_id)
);

comment on table public.bookings is 'Demandes de prestation entre clientes et prestataires';

create index if not exists bookings_client_idx   on public.bookings(client_id);
create index if not exists bookings_provider_idx on public.bookings(provider_id);
create index if not exists bookings_status_idx   on public.bookings(status);

-- ============================================================
-- TABLE : conversations
-- Fils de messagerie entre deux utilisatrices
-- ============================================================
create table if not exists public.conversations (
  id          uuid primary key default gen_random_uuid(),
  user_a      uuid not null references public.profiles(id),
  user_b      uuid not null references public.profiles(id),
  booking_id  uuid references public.bookings(id),
  created_at  timestamptz not null default now(),
  -- Une seule conversation par paire
  constraint unique_pair check (user_a < user_b),
  unique (user_a, user_b)
);

-- ============================================================
-- TABLE : messages
-- Messages individuels dans une conversation
-- ============================================================
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id),
  body            text,
  image_url       text,
  is_read         boolean not null default false,
  created_at      timestamptz not null default now(),
  constraint has_content check (body is not null or image_url is not null)
);

create index if not exists messages_conversation_idx on public.messages(conversation_id, created_at);

-- ============================================================
-- TABLE : reviews
-- Évaluations après une prestation terminée
-- ============================================================
create table if not exists public.reviews (
  id             uuid primary key default gen_random_uuid(),
  booking_id     uuid not null unique references public.bookings(id),
  reviewer_id    uuid not null references public.profiles(id),
  provider_id    uuid not null references public.profiles(id),
  rating         smallint not null check (rating between 1 and 5),
  punctuality    smallint check (punctuality between 1 and 5),
  communication  smallint check (communication between 1 and 5),
  quality        smallint check (quality between 1 and 5),
  comment        text,
  is_flagged     boolean not null default false,
  created_at     timestamptz not null default now()
);

create index if not exists reviews_provider_idx on public.reviews(provider_id);

-- ============================================================
-- TABLE : reports
-- Signalements de comportements abusifs
-- ============================================================
create table if not exists public.reports (
  id            uuid primary key default gen_random_uuid(),
  reporter_id   uuid not null references public.profiles(id),
  reported_id   uuid references public.profiles(id),
  service_id    uuid references public.services(id),
  message_id    uuid references public.messages(id),
  reason        text not null,
  details       text,
  status        text not null default 'pending' check (status in ('pending','reviewed','resolved','dismissed')),
  created_at    timestamptz not null default now()
);

-- ============================================================
-- TABLE : blocks
-- Liste de blocages entre utilisatrices
-- ============================================================
create table if not exists public.blocks (
  blocker_id  uuid not null references public.profiles(id),
  blocked_id  uuid not null references public.profiles(id),
  created_at  timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint no_self_block check (blocker_id <> blocked_id)
);

-- ============================================================
-- VUES UTILITAIRES
-- ============================================================

-- Statistiques de note par prestataire (dénormalisé pour perf)
create or replace view public.provider_stats as
select
  p.id as provider_id,
  count(r.id)                             as review_count,
  round(avg(r.rating)::numeric, 1)        as avg_rating,
  count(b.id) filter (where b.status = 'completed') as completed_count
from public.profiles p
left join public.reviews r  on r.provider_id = p.id
left join public.bookings b on b.provider_id = p.id
group by p.id;

-- ============================================================
-- FONCTION : trigger updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at  before update on public.profiles  for each row execute function public.set_updated_at();
create trigger services_updated_at  before update on public.services  for each row execute function public.set_updated_at();
create trigger bookings_updated_at  before update on public.bookings  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles      enable row level security;
alter table public.services      enable row level security;
alter table public.bookings      enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;
alter table public.reviews       enable row level security;
alter table public.reports       enable row level security;
alter table public.blocks        enable row level security;
alter table public.categories    enable row level security;

-- --- PROFILES ---
-- Lecture publique (profils actifs uniquement — sans données sensibles)
create policy "Profils actifs lisibles par toutes" on public.profiles
  for select using (is_active = true);

-- Chaque utilisatrice peut lire son propre profil complet
create policy "Lecture profil propre" on public.profiles
  for select using (auth.uid() = id);

-- Chaque utilisatrice peut modifier uniquement son profil
create policy "Modification profil propre" on public.profiles
  for update using (auth.uid() = id);

-- Création du profil uniquement pour l'utilisatrice elle-même
create policy "Création profil propre" on public.profiles
  for insert with check (auth.uid() = id);

-- --- CATEGORIES ---
create policy "Catégories lisibles par toutes" on public.categories
  for select using (is_active = true);

-- --- SERVICES ---
-- Lecture publique des services actifs
create policy "Services actifs lisibles" on public.services
  for select using (is_active = true);

-- Prestataire : créer/modifier/supprimer ses propres services
create policy "Gestion services propres" on public.services
  for all using (auth.uid() = provider_id);

-- --- BOOKINGS ---
-- Visible uniquement par la cliente ou la prestataire concernée
create policy "Booking visible par les parties" on public.bookings
  for select using (auth.uid() = client_id or auth.uid() = provider_id);

-- Cliente : créer une demande
create policy "Créer une demande" on public.bookings
  for insert with check (auth.uid() = client_id);

-- Prestataire : mettre à jour le statut
create policy "Prestataire met à jour statut" on public.bookings
  for update using (auth.uid() = provider_id or auth.uid() = client_id);

-- --- CONVERSATIONS ---
create policy "Conversation visible par les parties" on public.conversations
  for select using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Créer une conversation" on public.conversations
  for insert with check (auth.uid() = user_a or auth.uid() = user_b);

-- --- MESSAGES ---
create policy "Messages de ses conversations" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

create policy "Envoyer un message" on public.messages
  for insert with check (auth.uid() = sender_id);

create policy "Marquer message lu" on public.messages
  for update using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

-- --- REVIEWS ---
create policy "Avis lisibles publiquement" on public.reviews
  for select using (not is_flagged);

create policy "Créer un avis après prestation" on public.reviews
  for insert with check (
    auth.uid() = reviewer_id
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and b.client_id = auth.uid()
        and b.status = 'completed'
    )
  );

-- --- REPORTS ---
create policy "Signalement par toute utilisatrice connectée" on public.reports
  for insert with check (auth.uid() = reporter_id);

-- --- BLOCKS ---
create policy "Voir ses blocages" on public.blocks
  for select using (auth.uid() = blocker_id);

create policy "Bloquer quelqu'un" on public.blocks
  for insert with check (auth.uid() = blocker_id);

create policy "Débloquer" on public.blocks
  for delete using (auth.uid() = blocker_id);

-- ============================================================
-- FONCTION : recherche géolocalisée sécurisée
-- Retourne les services dans un rayon donné SANS exposer les coords exactes
-- ============================================================
create or replace function public.search_services_nearby(
  lat        float8,
  lng        float8,
  radius_km  float8 default 10,
  cat_slug   text   default null,
  max_price  int    default null
)
returns table (
  service_id   uuid,
  title        text,
  provider_name text,
  category_fr  text,
  category_ar  text,
  category_icon text,
  wilaya       text,
  commune      text,
  price_min    int,
  price_max    int,
  price_unit   text,
  is_available boolean,
  is_remote    boolean,
  avg_rating   numeric,
  review_count bigint,
  trust_level  smallint,
  is_verified  boolean,
  distance_km  float8
) language sql security definer as $$
  select
    s.id                                            as service_id,
    s.title,
    p.display_name                                  as provider_name,
    c.name_fr                                       as category_fr,
    c.name_ar                                       as category_ar,
    c.icon                                          as category_icon,
    s.wilaya,
    s.commune,
    s.price_min,
    s.price_max,
    s.price_unit,
    s.is_available,
    s.is_remote,
    coalesce(ps.avg_rating, 0)                      as avg_rating,
    coalesce(ps.review_count, 0)                    as review_count,
    p.trust_level,
    p.is_verified,
    round((st_distance(
      s.location,
      st_setsrid(st_makepoint(lng, lat), 4326)::geography
    ) / 1000)::numeric, 1)::float8                  as distance_km
  from public.services s
  join public.profiles p on p.id = s.provider_id
  left join public.categories c on c.id = s.category_id
  left join public.provider_stats ps on ps.provider_id = s.provider_id
  left join public.categories parent_c on parent_c.id = c.parent_id
  where s.is_active = true
    and p.is_active = true
    and (
      s.is_remote = true
      or (
        s.location is not null
        and st_dwithin(
          s.location,
          st_setsrid(st_makepoint(lng, lat), 4326)::geography,
          radius_km * 1000
        )
      )
    )
    and (cat_slug is null or parent_c.slug = cat_slug or c.slug = cat_slug)
    and (max_price is null or s.price_min <= max_price)
  order by
    case when s.is_remote then 999999 else
      st_distance(s.location, st_setsrid(st_makepoint(lng, lat), 4326)::geography)
    end asc,
    ps.avg_rating desc nulls last
  limit 50;
$$;

-- Recherche par wilaya (sans GPS)
create or replace function public.search_services_by_wilaya(
  p_wilaya   text,
  cat_slug   text default null,
  max_price  int  default null
)
returns table (
  service_id    uuid,
  title         text,
  provider_name text,
  category_fr   text,
  category_ar   text,
  category_icon text,
  wilaya        text,
  commune       text,
  price_min     int,
  price_max     int,
  price_unit    text,
  is_available  boolean,
  is_remote     boolean,
  avg_rating    numeric,
  review_count  bigint,
  trust_level   smallint,
  is_verified   boolean
) language sql security definer as $$
  select
    s.id            as service_id,
    s.title,
    p.display_name  as provider_name,
    c.name_fr       as category_fr,
    c.name_ar       as category_ar,
    c.icon          as category_icon,
    s.wilaya,
    s.commune,
    s.price_min,
    s.price_max,
    s.price_unit,
    s.is_available,
    s.is_remote,
    coalesce(ps.avg_rating, 0)     as avg_rating,
    coalesce(ps.review_count, 0)   as review_count,
    p.trust_level,
    p.is_verified
  from public.services s
  join public.profiles p on p.id = s.provider_id
  left join public.categories c on c.id = s.category_id
  left join public.provider_stats ps on ps.provider_id = s.provider_id
  left join public.categories parent_c on parent_c.id = c.parent_id
  where s.is_active = true
    and p.is_active = true
    and (s.wilaya = p_wilaya or s.is_remote = true)
    and (cat_slug is null or parent_c.slug = cat_slug or c.slug = cat_slug)
    and (max_price is null or s.price_min <= max_price)
  order by ps.avg_rating desc nulls last
  limit 50;
$$;

-- Pago protegido: el comprador paga con Stripe, el dinero queda retenido y se transfiere
-- al vendedor cuando el comprador confirma la entrega. Solo el servidor (service role)
-- escribe en estas tablas; los usuarios solo leen lo suyo.

alter type public.listing_status add value if not exists 'reservado';

-- Cuenta de cobro (Stripe Connect) de cada vendedor. Privada: solo la ve su dueño.
create table public.seller_payouts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  stripe_account_id text not null unique,
  ready boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.seller_payouts enable row level security;
create policy "payouts: solo el dueño" on public.seller_payouts
  for select to authenticated using (user_id = auth.uid());

-- ¿Acepta este vendedor pago protegido? (sin exponer su cuenta de Stripe)
create or replace function public.seller_accepts_payments(p_seller uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.seller_payouts sp
    join public.profiles p on p.id = sp.user_id
    where sp.user_id = p_seller and sp.ready and p.org_id = public.my_org()
  )
$$;
grant execute on function public.seller_accepts_payments(uuid) to authenticated;

create type public.order_status as enum ('pendiente', 'pagado', 'liberado', 'reembolsado', 'cancelado');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'eur',
  status public.order_status not null default 'pendiente',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  stripe_transfer_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  released_at timestamptz
);
alter table public.orders enable row level security;
create index orders_listing_idx on public.orders (listing_id, status);

-- Solo un pedido pagado (pendiente de entrega) por anuncio.
create unique index orders_one_paid_per_listing on public.orders (listing_id) where status = 'pagado';

create policy "orders: comprador o vendedor" on public.orders
  for select to authenticated using (buyer_id = auth.uid() or seller_id = auth.uid());

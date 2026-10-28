-- Pasillo: marketplace de segunda mano cerrado a una organización
-- Todo filtrado por org_id mediante RLS. El teléfono vive en una tabla aparte
-- (contact_info) que solo ve su dueño; los demás lo obtienen vía reveal_phone().

create extension if not exists citext;

-- ───────────────────────── organizations ─────────────────────────
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain citext not null unique
);
alter table public.organizations enable row level security;

insert into public.organizations (name, domain) values ('Demo Org', 'demo.test');

-- ───────────────────────── profiles ─────────────────────────
-- "users" del PRD. name null = perfil sin completar.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references public.organizations(id),
  email citext not null,
  name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Teléfono privado: solo lo lee su dueño.
create table public.contact_info (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  phone text not null check (length(trim(phone)) >= 6)
);
alter table public.contact_info enable row level security;

-- ───────────────────────── helpers ─────────────────────────
create or replace function public.my_org() returns uuid
language sql stable security definer set search_path = public as $$
  select org_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_profile_complete() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    join public.contact_info c on c.user_id = p.id
    where p.id = auth.uid() and coalesce(trim(p.name), '') <> ''
  )
$$;

-- Usada por el formulario de registro antes de pedir el código (anon).
create or replace function public.is_domain_allowed(email text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organizations
    where domain = lower(split_part(email, '@', 2))
  )
$$;
grant execute on function public.is_domain_allowed(text) to anon, authenticated;

-- Al crear un usuario de auth: rechazar dominios no permitidos y crear su perfil.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_org uuid;
begin
  select id into v_org from public.organizations
  where domain = lower(split_part(new.email, '@', 2));
  if v_org is null then
    raise exception 'Dominio de email no permitido';
  end if;
  insert into public.profiles (id, org_id, email) values (new.id, v_org, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS profiles / contact_info
create policy "profiles: misma org" on public.profiles
  for select to authenticated using (org_id = public.my_org());
create policy "profiles: editar el propio" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and org_id = public.my_org());
revoke update on public.profiles from authenticated;
grant update (name) on public.profiles to authenticated;

create policy "contact_info: solo el dueño" on public.contact_info
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ───────────────────────── listings ─────────────────────────
create type public.listing_category as enum (
  'libros_apuntes', 'electronica', 'muebles', 'material_oficina', 'ropa', 'otros'
);
create type public.listing_status as enum ('activo', 'vendido');

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null default public.my_org() references public.organizations(id),
  seller_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title text not null check (length(trim(title)) between 3 and 100),
  description text not null check (length(trim(description)) between 1 and 2000),
  price numeric(10,2) not null check (price >= 0),
  category public.listing_category not null,
  photo_url text not null,
  status public.listing_status not null default 'activo',
  buyer_id uuid references public.profiles(id),
  sold_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.listings enable row level security;
create index listings_org_status_idx on public.listings (org_id, status, created_at desc);

create policy "listings: ver misma org" on public.listings
  for select to authenticated using (org_id = public.my_org());
create policy "listings: publicar con perfil completo" on public.listings
  for insert to authenticated
  with check (seller_id = auth.uid() and org_id = public.my_org() and public.is_profile_complete());
create policy "listings: editar los propios" on public.listings
  for update to authenticated using (seller_id = auth.uid()) with check (seller_id = auth.uid());
create policy "listings: borrar los propios" on public.listings
  for delete to authenticated using (seller_id = auth.uid());

-- Los campos de venta solo se cambian vía mark_sold().
revoke update on public.listings from authenticated;
grant update (title, description, price, category, photo_url) on public.listings to authenticated;

-- ───────────────────────── contact_reveals ─────────────────────────
create table public.contact_reveals (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);
alter table public.contact_reveals enable row level security;

-- El vendedor ve quién reveló en sus anuncios; cada comprador ve los suyos.
create policy "reveals: vendedor o comprador" on public.contact_reveals
  for select to authenticated using (
    buyer_id = auth.uid()
    or exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid())
  );

-- Registra la revelación y devuelve el teléfono del vendedor.
create or replace function public.reveal_phone(p_listing_id uuid) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_listing public.listings;
  v_phone text;
begin
  if auth.uid() is null then raise exception 'Necesitas iniciar sesión'; end if;
  if not public.is_profile_complete() then raise exception 'Completa tu perfil primero'; end if;

  select * into v_listing from public.listings where id = p_listing_id;
  if v_listing.id is null or v_listing.org_id <> public.my_org() then
    raise exception 'Anuncio no encontrado';
  end if;

  if v_listing.seller_id <> auth.uid() then
    insert into public.contact_reveals (listing_id, buyer_id)
    values (p_listing_id, auth.uid())
    on conflict (listing_id, buyer_id) do nothing;
  end if;

  select phone into v_phone from public.contact_info where user_id = v_listing.seller_id;
  return v_phone;
end;
$$;
grant execute on function public.reveal_phone(uuid) to authenticated;

-- Marca como vendido; el comprador debe estar entre quienes revelaron el teléfono.
create or replace function public.mark_sold(p_listing_id uuid, p_buyer_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.listings where id = p_listing_id and seller_id = auth.uid()) then
    raise exception 'Solo el vendedor puede marcarlo como vendido';
  end if;
  if p_buyer_id is not null and not exists (
    select 1 from public.contact_reveals where listing_id = p_listing_id and buyer_id = p_buyer_id
  ) then
    raise exception 'El comprador debe haber visto tu teléfono';
  end if;
  update public.listings
     set status = 'vendido', buyer_id = p_buyer_id, sold_at = now()
   where id = p_listing_id;
end;
$$;
grant execute on function public.mark_sold(uuid, uuid) to authenticated;

-- ───────────────────────── ratings ─────────────────────────
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  from_user uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  to_user uuid not null references public.profiles(id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  unique (listing_id, from_user),
  check (from_user <> to_user)
);
alter table public.ratings enable row level security;

create policy "ratings: ver misma org" on public.ratings
  for select to authenticated using (
    exists (select 1 from public.profiles p where p.id = to_user and p.org_id = public.my_org())
  );
-- Solo vendedor↔comprador de un anuncio vendido.
create policy "ratings: valorar tras una venta" on public.ratings
  for insert to authenticated with check (
    from_user = auth.uid()
    and exists (
      select 1 from public.listings l
      where l.id = listing_id and l.status = 'vendido' and l.buyer_id is not null
        and ((l.seller_id = auth.uid() and to_user = l.buyer_id)
          or (l.buyer_id = auth.uid() and to_user = l.seller_id))
    )
  );

-- Reputación calculada al vuelo (no se guarda).
create view public.user_reputation with (security_invoker = true) as
  select p.id as user_id,
         round(avg(r.stars)::numeric, 1) as avg_stars,
         count(r.id)::int as rating_count
  from public.profiles p
  left join public.ratings r on r.to_user = p.id
  group by p.id;
grant select on public.user_reputation to authenticated;

-- ───────────────────────── storage ─────────────────────────
insert into storage.buckets (id, name, public) values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

create policy "photos: lectura pública" on storage.objects
  for select using (bucket_id = 'listing-photos');
create policy "photos: subir en tu carpeta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "photos: borrar las tuyas" on storage.objects
  for delete to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);

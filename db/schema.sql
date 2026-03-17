create extension if not exists pgcrypto;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'BRL',
  category text not null default 'geral',
  is_active boolean not null default true,
  stock integer not null default 0 check (stock >= 0),
  variations jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_active_idx on products(is_active);
create index if not exists products_category_idx on products(category);
create index if not exists products_title_idx on products using gin (to_tsvector('simple', title));

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'BRL',
  category text not null default 'geral',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists services_active_idx on services(is_active);
create index if not exists services_category_idx on services(category);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending',
  currency text not null default 'BRL',
  subtotal_cents integer not null default 0,
  total_cents integer not null default 0,
  stripe_session_id text,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_idx on orders(created_at desc);
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_stripe_session_idx on orders(stripe_session_id);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid,
  title_snapshot text not null,
  unit_price_cents integer not null,
  quantity integer not null check (quantity > 0),
  variation_snapshot jsonb not null default '{}'::jsonb
);

create index if not exists order_items_order_idx on order_items(order_id);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  ip text,
  user_agent text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_idx on audit_logs(created_at desc);
create index if not exists audit_logs_entity_idx on audit_logs(entity_type, entity_id);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at before update on products
for each row execute function set_updated_at();

drop trigger if exists services_set_updated_at on services;
create trigger services_set_updated_at before update on services
for each row execute function set_updated_at();

create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

alter table admins enable row level security;
alter table products enable row level security;
alter table services enable row level security;

drop policy if exists admins_self_read on admins;
create policy admins_self_read on admins
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists products_public_read on products;
create policy products_public_read on products
for select
to anon, authenticated
using (is_active = true);

drop policy if exists products_admin_all on products;
create policy products_admin_all on products
for all
to authenticated
using (exists (select 1 from admins a where a.user_id = auth.uid()))
with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists services_admin_all on services;
create policy services_admin_all on services
for all
to authenticated
using (exists (select 1 from admins a where a.user_id = auth.uid()))
with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists services_public_read on services;
create policy services_public_read on services
for select
to anon, authenticated
using (is_active = true);

drop policy if exists storage_product_images_public_read on storage.objects;
create policy storage_product_images_public_read on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists storage_product_images_admin_write on storage.objects;
create policy storage_product_images_admin_write on storage.objects
for all
to authenticated
using (bucket_id = 'product-images' and exists (select 1 from admins a where a.user_id = auth.uid()))
with check (bucket_id = 'product-images' and exists (select 1 from admins a where a.user_id = auth.uid()));

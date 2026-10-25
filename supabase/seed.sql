-- Synthetic local-only records. Never place real contact information in this file.

insert into app_private.villas (
  id,
  slug,
  name,
  villa_type,
  bedrooms,
  built_up_area_sq_ft,
  plot_area_sq_ft,
  construction_status,
  availability_status,
  pricing_status,
  lifecycle_state
)
values (
  '10000000-0000-4000-8000-000000000001',
  'sample-garden-villa',
  'Sample Garden Villa',
  'Garden Villa',
  3,
  2180,
  1500,
  'planned',
  'unverified',
  'contact_owner',
  'draft'
)
on conflict (id) do nothing;

insert into app_private.content_items (
  id,
  content_key,
  page_path,
  content_type
)
values (
  '20000000-0000-4000-8000-000000000001',
  'home.hero',
  '/',
  'section'
)
on conflict (id) do nothing;

insert into app_private.content_versions (
  id,
  content_item_id,
  version_number,
  locale,
  lifecycle_state,
  title,
  body
)
values (
  '30000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  1,
  'en',
  'draft',
  'Synthetic homepage draft',
  '{"heading":"Sample heading","summary":"Synthetic content for local development only."}'::jsonb
)
on conflict (id) do nothing;

insert into app_private.visit_settings (id)
values (true)
on conflict (id) do nothing;

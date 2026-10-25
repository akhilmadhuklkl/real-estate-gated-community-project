-- T0058: Phase 3 canonical operations schema.
-- Canonical administrative data stays outside the exposed public schema.

create schema if not exists app_private;

revoke all on schema app_private from public, anon, authenticated;
grant usage on schema app_private to service_role;

create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

revoke all on function app_private.set_updated_at() from public, anon, authenticated;

create table app_private.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  status text not null default 'invited' check (status in ('invited', 'active', 'suspended', 'revoked')),
  locale text not null default 'en' check (locale in ('en', 'ml', 'hi', 'ar', 'te', 'ta', 'kn')),
  invited_at timestamptz,
  activated_at timestamptz,
  suspended_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check ((status <> 'active') or activated_at is not null),
  check ((status <> 'suspended') or suspended_at is not null),
  check ((status <> 'revoked') or revoked_at is not null)
);

create table app_private.role_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_private.profiles(user_id) on delete cascade,
  role text not null check (role in ('owner', 'content_manager', 'sales_representative', 'ai_reviewer', 'auditor')),
  granted_by uuid references app_private.profiles(user_id) on delete restrict,
  granted_at timestamptz not null default timezone('utc', now()),
  revoked_by uuid references app_private.profiles(user_id) on delete restrict,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, role),
  check ((revoked_at is null and revoked_by is null) or (revoked_at is not null and revoked_by is not null))
);

create unique index role_assignments_one_active_owner
  on app_private.role_assignments (role)
  where role = 'owner' and revoked_at is null;
create index role_assignments_active_user_idx
  on app_private.role_assignments (user_id, role)
  where revoked_at is null;

create table app_private.villas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 120),
  villa_type text not null check (char_length(villa_type) between 1 and 80),
  bedrooms smallint check (bedrooms between 1 and 20),
  built_up_area_sq_ft numeric(10,2) check (built_up_area_sq_ft > 0),
  plot_area_sq_ft numeric(10,2) check (plot_area_sq_ft > 0),
  construction_status text not null default 'planned' check (construction_status in ('planned', 'under_construction', 'completed', 'on_hold')),
  availability_status text not null default 'unverified' check (availability_status in ('unverified', 'available', 'reserved', 'sold', 'not_released')),
  pricing_status text not null default 'contact_owner' check (pricing_status in ('contact_owner', 'verified', 'withheld', 'not_applicable')),
  price_amount numeric(14,2) check (price_amount is null or price_amount >= 0),
  price_currency char(3) check (price_currency is null or price_currency ~ '^[A-Z]{3}$'),
  facts_verified_at timestamptz,
  facts_verified_by uuid references app_private.profiles(user_id) on delete restrict,
  lifecycle_state text not null default 'draft' check (lifecycle_state in ('draft', 'review', 'approved', 'published', 'archived')),
  created_by uuid references app_private.profiles(user_id) on delete restrict,
  updated_by uuid references app_private.profiles(user_id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check ((price_amount is null and price_currency is null) or (price_amount is not null and price_currency is not null)),
  check ((pricing_status <> 'verified') or (price_amount is not null and facts_verified_at is not null and facts_verified_by is not null)),
  check ((availability_status = 'unverified') or (facts_verified_at is not null and facts_verified_by is not null))
);

create index villas_lifecycle_idx on app_private.villas (lifecycle_state, updated_at desc);
create index villas_availability_idx on app_private.villas (availability_status) where lifecycle_state = 'published';

create table app_private.villa_versions (
  id uuid primary key default gen_random_uuid(),
  villa_id uuid not null references app_private.villas(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  change_summary text not null check (char_length(change_summary) between 1 and 500),
  authority_reference text,
  effective_from timestamptz,
  effective_until timestamptz,
  created_by uuid references app_private.profiles(user_id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  unique (villa_id, version_number),
  check (effective_until is null or effective_from is null or effective_until > effective_from)
);

create table app_private.content_items (
  id uuid primary key default gen_random_uuid(),
  content_key text not null unique check (content_key ~ '^[a-z0-9]+(?:[._-][a-z0-9]+)*$'),
  page_path text not null check (page_path ~ '^/'),
  content_type text not null check (content_type in ('page', 'section', 'legal', 'contact', 'configuration')),
  current_published_version_id uuid,
  created_by uuid references app_private.profiles(user_id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table app_private.content_versions (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references app_private.content_items(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  locale text not null default 'en' check (locale in ('en', 'ml', 'hi', 'ar', 'te', 'ta', 'kn')),
  lifecycle_state text not null default 'draft' check (lifecycle_state in ('draft', 'review', 'approved', 'published', 'archived')),
  title text,
  body jsonb not null check (jsonb_typeof(body) = 'object'),
  qualification text,
  submitted_at timestamptz,
  approved_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz,
  created_by uuid references app_private.profiles(user_id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  unique (content_item_id, locale, version_number),
  check ((lifecycle_state <> 'review') or submitted_at is not null),
  check ((lifecycle_state not in ('approved', 'published')) or approved_at is not null),
  check ((lifecycle_state <> 'published') or published_at is not null),
  check ((lifecycle_state <> 'archived') or archived_at is not null)
);

alter table app_private.content_items
  add constraint content_items_current_version_fk
  foreign key (current_published_version_id)
  references app_private.content_versions(id)
  on delete set null;

create index content_versions_workflow_idx on app_private.content_versions (lifecycle_state, created_at desc);

create table app_private.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_bucket text not null check (storage_bucket in ('public-media', 'protected-originals', 'quarantine')),
  object_path text not null check (object_path <> '' and object_path !~ '(^|/)\.\.(/|$)'),
  original_filename text not null,
  mime_type text not null,
  byte_size bigint not null check (byte_size > 0 and byte_size <= 52428800),
  sha256_hex char(64) not null check (sha256_hex ~ '^[0-9a-f]{64}$'),
  access_level text not null check (access_level in ('public', 'protected', 'quarantined')),
  rights_status text not null default 'unverified' check (rights_status in ('unverified', 'approved', 'restricted', 'expired')),
  scan_status text not null default 'pending' check (scan_status in ('pending', 'clean', 'rejected', 'failed')),
  source_reference text,
  expires_at timestamptz,
  replaced_by_id uuid references app_private.media_assets(id) on delete set null,
  uploaded_by uuid references app_private.profiles(user_id) on delete restrict,
  approved_by uuid references app_private.profiles(user_id) on delete restrict,
  approved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (storage_bucket, object_path),
  check ((access_level <> 'public') or (storage_bucket = 'public-media' and rights_status = 'approved' and scan_status = 'clean' and approved_at is not null and approved_by is not null)),
  check ((access_level <> 'quarantined') or storage_bucket = 'quarantine')
);

create index media_assets_review_idx on app_private.media_assets (access_level, rights_status, scan_status, created_at desc);
create index media_assets_hash_idx on app_private.media_assets (sha256_hex);

create table app_private.documents (
  id uuid primary key default gen_random_uuid(),
  media_asset_id uuid not null references app_private.media_assets(id) on delete restrict,
  document_type text not null check (document_type in ('brochure', 'floor_plan', 'specification', 'legal', 'authority', 'knowledge_source', 'other')),
  title text not null check (char_length(title) between 1 and 200),
  source_authority text,
  issued_at date,
  verified_at timestamptz,
  verified_by uuid references app_private.profiles(user_id) on delete restrict,
  retrieval_state text not null default 'excluded' check (retrieval_state in ('excluded', 'review', 'eligible', 'active', 'retired')),
  expires_at timestamptz,
  created_by uuid references app_private.profiles(user_id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check ((retrieval_state not in ('eligible', 'active')) or (verified_at is not null and verified_by is not null and source_authority is not null))
);

create index documents_retrieval_idx on app_private.documents (retrieval_state, updated_at desc);

create table app_private.enquiries (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique check (public_reference ~ '^ENQ-[A-Z0-9]{10,20}$'),
  name text not null check (char_length(name) between 1 and 120),
  email text check (email is null or char_length(email) between 3 and 254),
  phone text check (phone is null or char_length(phone) between 7 and 24),
  message text not null check (char_length(message) between 1 and 4000),
  preferred_contact text check (preferred_contact in ('email', 'phone', 'whatsapp')),
  consent_version text not null,
  consented_at timestamptz not null,
  source_page text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'assigned', 'contacted', 'qualified', 'closed', 'deleted')),
  assigned_to uuid references app_private.profiles(user_id) on delete restrict,
  retention_until timestamptz not null,
  closed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (email is not null or phone is not null),
  check ((status <> 'assigned') or assigned_to is not null),
  check ((status <> 'closed') or closed_at is not null),
  check ((status <> 'deleted') or deleted_at is not null)
);

create index enquiries_status_idx on app_private.enquiries (status, created_at desc);
create index enquiries_assignee_idx on app_private.enquiries (assigned_to, status) where assigned_to is not null;
create index enquiries_retention_idx on app_private.enquiries (retention_until) where deleted_at is null;

create table app_private.enquiry_status_history (
  id bigint generated always as identity primary key,
  enquiry_id uuid not null references app_private.enquiries(id) on delete cascade,
  from_status text,
  to_status text not null check (to_status in ('new', 'reviewing', 'assigned', 'contacted', 'qualified', 'closed', 'deleted')),
  reason text,
  changed_by uuid references app_private.profiles(user_id) on delete restrict,
  changed_at timestamptz not null default timezone('utc', now())
);

create index enquiry_history_parent_idx on app_private.enquiry_status_history (enquiry_id, changed_at desc);

create table app_private.visit_settings (
  id boolean primary key default true check (id),
  timezone text not null default 'Asia/Kolkata',
  visit_duration_minutes smallint not null default 60 check (visit_duration_minutes between 15 and 480),
  minimum_lead_minutes integer not null default 1440 check (minimum_lead_minutes between 0 and 43200),
  maximum_concurrent_visits smallint not null default 1 check (maximum_concurrent_visits between 1 and 20),
  operating_hours jsonb not null default '{}'::jsonb check (jsonb_typeof(operating_hours) = 'object'),
  blackout_dates jsonb not null default '[]'::jsonb check (jsonb_typeof(blackout_dates) = 'array'),
  updated_by uuid references app_private.profiles(user_id) on delete restrict,
  updated_at timestamptz not null default timezone('utc', now())
);

create table app_private.visits (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique check (public_reference ~ '^VIS-[A-Z0-9]{10,20}$'),
  enquiry_id uuid references app_private.enquiries(id) on delete set null,
  visitor_name text not null check (char_length(visitor_name) between 1 and 120),
  visitor_email text check (visitor_email is null or char_length(visitor_email) between 3 and 254),
  visitor_phone text check (visitor_phone is null or char_length(visitor_phone) between 7 and 24),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'requested' check (status in ('requested', 'confirmed', 'completed', 'cancelled', 'no_show')),
  assigned_to uuid references app_private.profiles(user_id) on delete restrict,
  consent_version text not null,
  consented_at timestamptz not null,
  confirmation_note text,
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (ends_at > starts_at),
  check (visitor_email is not null or visitor_phone is not null),
  check ((status <> 'confirmed') or assigned_to is not null),
  check ((status <> 'cancelled') or cancelled_at is not null),
  check ((status <> 'completed') or completed_at is not null)
);

create index visits_schedule_idx on app_private.visits (starts_at, ends_at) where status in ('requested', 'confirmed');
create index visits_assignee_idx on app_private.visits (assigned_to, starts_at) where assigned_to is not null;

create table app_private.visit_status_history (
  id bigint generated always as identity primary key,
  visit_id uuid not null references app_private.visits(id) on delete cascade,
  from_status text,
  to_status text not null check (to_status in ('requested', 'confirmed', 'completed', 'cancelled', 'no_show')),
  reason text,
  changed_by uuid references app_private.profiles(user_id) on delete restrict,
  changed_at timestamptz not null default timezone('utc', now())
);

create index visit_history_parent_idx on app_private.visit_status_history (visit_id, changed_at desc);

create table app_private.approvals (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('villa', 'content_version', 'media_asset', 'document', 'knowledge_release', 'configuration', 'export', 'deletion', 'release')),
  subject_id uuid not null,
  decision text not null default 'pending' check (decision in ('pending', 'approved', 'rejected', 'withdrawn')),
  requested_by uuid references app_private.profiles(user_id) on delete restrict,
  requested_at timestamptz not null default timezone('utc', now()),
  decided_by uuid references app_private.profiles(user_id) on delete restrict,
  decided_at timestamptz,
  rationale text,
  evidence jsonb not null default '{}'::jsonb check (jsonb_typeof(evidence) = 'object'),
  expires_at timestamptz,
  check ((decision = 'pending' and decided_by is null and decided_at is null) or (decision <> 'pending' and decided_by is not null and decided_at is not null))
);

create unique index approvals_one_pending_subject_idx
  on app_private.approvals (subject_type, subject_id)
  where decision = 'pending';
create index approvals_queue_idx on app_private.approvals (decision, requested_at);

create table app_private.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique check (char_length(idempotency_key) between 8 and 200),
  category text not null check (category in ('enquiry', 'visit', 'approval', 'expiry', 'ai_release', 'incident', 'security', 'recovery')),
  template_key text not null,
  recipient_reference text not null,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'retry', 'failed', 'suppressed')),
  attempt_count smallint not null default 0 check (attempt_count between 0 and 10),
  next_attempt_at timestamptz,
  provider_reference text,
  safe_failure_code text,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index notification_dispatch_idx
  on app_private.notification_outbox (status, next_attempt_at, created_at)
  where status in ('pending', 'retry');

create table app_private.audit_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default timezone('utc', now()),
  actor_user_id uuid references app_private.profiles(user_id) on delete restrict,
  actor_type text not null check (actor_type in ('user', 'system', 'worker')),
  action text not null check (char_length(action) between 3 and 120),
  target_type text not null check (char_length(target_type) between 1 and 80),
  target_id text,
  request_id uuid,
  environment text not null check (environment in ('local', 'preview', 'production')),
  outcome text not null check (outcome in ('success', 'denied', 'failed')),
  context jsonb not null default '{}'::jsonb check (jsonb_typeof(context) = 'object')
);

create index audit_events_time_idx on app_private.audit_events (occurred_at desc);
create index audit_events_actor_idx on app_private.audit_events (actor_user_id, occurred_at desc) where actor_user_id is not null;
create index audit_events_target_idx on app_private.audit_events (target_type, target_id, occurred_at desc);

create or replace function app_private.reject_audit_mutation()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  raise exception 'audit events are append-only' using errcode = '55000';
end;
$$;

revoke all on function app_private.reject_audit_mutation() from public, anon, authenticated;

create trigger audit_events_immutable
before update or delete on app_private.audit_events
for each row execute function app_private.reject_audit_mutation();

create trigger profiles_set_updated_at before update on app_private.profiles for each row execute function app_private.set_updated_at();
create trigger villas_set_updated_at before update on app_private.villas for each row execute function app_private.set_updated_at();
create trigger content_items_set_updated_at before update on app_private.content_items for each row execute function app_private.set_updated_at();
create trigger media_assets_set_updated_at before update on app_private.media_assets for each row execute function app_private.set_updated_at();
create trigger documents_set_updated_at before update on app_private.documents for each row execute function app_private.set_updated_at();
create trigger enquiries_set_updated_at before update on app_private.enquiries for each row execute function app_private.set_updated_at();
create trigger visits_set_updated_at before update on app_private.visits for each row execute function app_private.set_updated_at();
create trigger notification_outbox_set_updated_at before update on app_private.notification_outbox for each row execute function app_private.set_updated_at();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'role_assignments', 'villas', 'villa_versions', 'content_items',
    'content_versions', 'media_assets', 'documents', 'enquiries',
    'enquiry_status_history', 'visit_settings', 'visits', 'visit_status_history',
    'approvals', 'notification_outbox', 'audit_events'
  ]
  loop
    execute format('alter table app_private.%I enable row level security', table_name);
    execute format('alter table app_private.%I force row level security', table_name);
    execute format('revoke all on table app_private.%I from public, anon, authenticated', table_name);
    execute format('grant all on table app_private.%I to service_role', table_name);
  end loop;
end;
$$;

grant usage, select on all sequences in schema app_private to service_role;

comment on schema app_private is 'Canonical Phase 3 operations data; not exposed through the public Data API.';
comment on table app_private.audit_events is 'Append-only administrative and system audit evidence. Context must exclude secrets and raw contact content.';
comment on column app_private.notification_outbox.recipient_reference is 'Opaque application reference; do not store a raw destination in this column.';

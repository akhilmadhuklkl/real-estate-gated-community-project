begin;

select plan(14);

select has_schema('app_private', 'private application schema exists');
select has_table('app_private', 'profiles', 'profiles table exists');
select has_table('app_private', 'villas', 'villas table exists');
select has_table('app_private', 'content_versions', 'content versions table exists');
select has_table('app_private', 'media_assets', 'media assets table exists');
select has_table('app_private', 'enquiries', 'enquiries table exists');
select has_table('app_private', 'visits', 'visits table exists');
select has_table('app_private', 'approvals', 'approvals table exists');
select has_table('app_private', 'notification_outbox', 'notification outbox exists');
select has_table('app_private', 'audit_events', 'audit events table exists');

select ok(
  (select bool_and(relrowsecurity and relforcerowsecurity)
   from pg_class
   join pg_namespace on pg_namespace.oid = pg_class.relnamespace
   where pg_namespace.nspname = 'app_private' and pg_class.relkind = 'r'),
  'RLS is enabled and forced on every private table'
);

select is(
  (select count(*)::bigint
   from information_schema.role_table_grants
   where table_schema = 'app_private'
     and grantee in ('anon', 'authenticated')),
  0::bigint,
  'browser roles have no direct private table grants'
);

select throws_ok(
  $$insert into app_private.villas (slug, name, villa_type, pricing_status, price_amount, price_currency)
    values ('invalid-price', 'Invalid Price', 'Test', 'verified', 100000, 'INR')$$,
  '23514',
  null,
  'verified price requires verification evidence'
);

insert into app_private.audit_events (
  actor_type, action, target_type, environment, outcome
) values (
  'system', 'schema.contract.test', 'migration', 'local', 'success'
);

select throws_ok(
  $$delete from app_private.audit_events where action = 'schema.contract.test'$$,
  '55000',
  'audit events are append-only',
  'audit events reject deletion'
);

select * from finish();
rollback;

-- Explicitly deny browser roles until T0059 installs reviewed role-aware policies.
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
    execute format(
      'create policy deny_all_until_t0059 on app_private.%I for all to anon, authenticated using (false) with check (false)',
      table_name
    );
  end loop;
end;
$$;

-- Cover foreign-key columns used during joins and referenced-row updates/deletes.
create index approvals_decided_by_idx on app_private.approvals (decided_by);
create index approvals_requested_by_idx on app_private.approvals (requested_by);
create index content_items_created_by_idx on app_private.content_items (created_by);
create index content_items_current_version_idx on app_private.content_items (current_published_version_id);
create index content_versions_created_by_idx on app_private.content_versions (created_by);
create index documents_created_by_idx on app_private.documents (created_by);
create index documents_media_asset_idx on app_private.documents (media_asset_id);
create index documents_verified_by_idx on app_private.documents (verified_by);
create index enquiry_history_changed_by_idx on app_private.enquiry_status_history (changed_by);
create index media_assets_approved_by_idx on app_private.media_assets (approved_by);
create index media_assets_replaced_by_idx on app_private.media_assets (replaced_by_id);
create index media_assets_uploaded_by_idx on app_private.media_assets (uploaded_by);
create index role_assignments_granted_by_idx on app_private.role_assignments (granted_by);
create index role_assignments_revoked_by_idx on app_private.role_assignments (revoked_by);
create index villa_versions_created_by_idx on app_private.villa_versions (created_by);
create index villas_created_by_idx on app_private.villas (created_by);
create index villas_facts_verified_by_idx on app_private.villas (facts_verified_by);
create index villas_updated_by_idx on app_private.villas (updated_by);
create index visit_settings_updated_by_idx on app_private.visit_settings (updated_by);
create index visit_history_changed_by_idx on app_private.visit_status_history (changed_by);
create index visits_enquiry_idx on app_private.visits (enquiry_id);

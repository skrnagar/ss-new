-- Run in Supabase SQL Editor (requires owner on storage.objects).
-- Only needed if file uploads to knowledge-resources fail after npm run db:bootstrap.

DROP POLICY IF EXISTS knowledge_resources_select_public ON storage.objects;
DROP POLICY IF EXISTS knowledge_resources_insert_authenticated ON storage.objects;
DROP POLICY IF EXISTS knowledge_resources_update_owner ON storage.objects;
DROP POLICY IF EXISTS knowledge_resources_delete_owner ON storage.objects;

CREATE POLICY knowledge_resources_select_public ON storage.objects FOR SELECT
  USING (bucket_id = 'knowledge-resources');

CREATE POLICY knowledge_resources_insert_authenticated ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'knowledge-resources' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY knowledge_resources_update_owner ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'knowledge-resources' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'knowledge-resources' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY knowledge_resources_delete_owner ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'knowledge-resources' AND (storage.foldername(name))[1] = auth.uid()::text);

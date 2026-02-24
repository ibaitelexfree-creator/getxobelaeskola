
-- MANUAL SETUP SCRIPT: Trigger for Logbook File Cleanup
-- =====================================================================
-- This script sets up a database trigger to call a Supabase Edge Function whenever
-- a record is deleted from 'horas_navegacion' (referred to as 'Logbook' or 'Bitácora').
-- The Edge Function handles the deletion of the associated GPX file from the storage bucket.
--
-- IMPORTANT:
-- This script contains PLACEHOLDERS that MUST be replaced before execution.
-- Alternatively, you can configure this via the Supabase Dashboard (Database -> Webhooks).
-- =====================================================================

-- 1. Enable pg_net extension if not already enabled (required for making HTTP requests from the database)
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

-- 2. Define the Trigger Function
CREATE OR REPLACE FUNCTION public.trigger_delete_logbook_files()
RETURNS TRIGGER AS $$
DECLARE
  -- Replace with your project's Edge Function URL
  -- Example: https://<project_ref>.supabase.co/functions/v1/delete-logbook-files
  edge_function_url TEXT := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/delete-logbook-files';

  -- Replace with your Service Role Key (from Project Settings -> API)
  -- This is required to authorize the request if Verify JWT is enabled on the function.
  service_role_key TEXT := 'YOUR_SERVICE_ROLE_KEY';
BEGIN
  -- Perform the HTTP POST request asynchronously using pg_net
  PERFORM net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
          'type', 'DELETE',
          'table', TG_TABLE_NAME,
          'schema', TG_TABLE_SCHEMA,
          'old_record', row_to_json(OLD)
      )
  );

  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't prevent the deletion
    RAISE WARNING 'Failed to trigger logbook file cleanup: %', SQLERRM;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the Trigger on the 'horas_navegacion' table
-- Note: 'horas_navegacion' is the table storing sailing hours and GPX tracks.
-- If you are using a table named 'bitacora_logbook', please update the table name below.

DROP TRIGGER IF EXISTS on_logbook_delete ON public.horas_navegacion;

CREATE TRIGGER on_logbook_delete
  AFTER DELETE ON public.horas_navegacion
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_delete_logbook_files();

-- Documentation comment
COMMENT ON FUNCTION public.trigger_delete_logbook_files IS 'Trigger function to call delete-logbook-files Edge Function. Requires manual configuration of edge_function_url and service_role_key.';

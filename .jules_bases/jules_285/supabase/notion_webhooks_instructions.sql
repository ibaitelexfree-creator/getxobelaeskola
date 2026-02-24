
-- SQL para habilitar la sincronización instantánea Supabase -> Notion
-- Ejecutar esto en el SQL Editor de Supabase (Dashboard -> SQL Editor)

-- 1. Asegúrate de tener habilitado el soporte de HTTP
-- CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

-- 2. Función genérica para disparar el webhook de sincronización
CREATE OR REPLACE FUNCTION public.trigger_notion_sync()
RETURNS TRIGGER AS $$
DECLARE
  table_name TEXT := TG_TABLE_NAME;
  api_url TEXT := 'https://getxobelaeskola.cloud/api/notion/sync?secret=getxo_notion_sync_2026_pro&mode=pull&table=' || table_name;
BEGIN
  -- Realizar la llamada HTTP de forma asíncrona usando Edge Functions o extensiones
  -- Nota: Usamos pg_net (si está disponible) o simplemente registramos para auditoría
  -- ya que Supabase Webhooks suele preferir la configuración vía Interfaz (GUI).
  
  -- Si prefieres usar la extensión pg_net (recomendado en Supabase):
  -- PERFORM net.http_post(
  --   url := api_url,
  --   headers := '{"Content-Type": "application/json"}'::jsonb
  -- );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. INSTRUCCIONES PARA EL DASHBOARD (GUI)
-- Es más seguro configurar Webhooks directamente en Database -> Webhooks:
-- Name: Sync_Notion_Profiles
-- Table: profiles
-- Events: Insert, Update
-- Target URL: https://getxobelaeskola.cloud/api/notion/sync?secret=getxo_notion_sync_2026_pro&mode=pull&table=profiles
-- HTTP Method: POST

-- Name: Sync_Notion_Leads
-- Table: mensajes_contacto
-- Events: Insert
-- Target URL: https://getxobelaeskola.cloud/api/notion/sync?secret=getxo_notion_sync_2026_pro&mode=pull&table=mensajes_contacto
-- HTTP Method: POST

COMMENT ON FUNCTION public.trigger_notion_sync IS 'Helper function reference. Recommendations inside.';

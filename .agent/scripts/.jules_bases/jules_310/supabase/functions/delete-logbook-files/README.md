# Delete Logbook Files Edge Function

This Supabase Edge Function is designed to automatically delete associated GPX files from the `academy-assets` storage bucket when a logbook entry (sailing record) is deleted from the database.

## Prerequisites

- Supabase project initialized.
- `pg_net` extension enabled (if using SQL trigger method).
- `academy-assets` storage bucket exists.

## Target Table

The function expects to receive a `DELETE` webhook payload. It looks for a `gpx_url` field in the `old_record`.
Currently, the application uses the `horas_navegacion` table to store sailing hours and GPX tracks.
If you refer to this table as `bitacora_logbook`, please ensure you configure the trigger on `horas_navegacion` (or the correct table name if you have renamed it).

## Deployment

To deploy this function to your Supabase project:

```bash
supabase functions deploy delete-logbook-files
```

Make sure you have logged in with `supabase login`.

## Configuration (Setting up the Trigger)

There are two ways to set up the database trigger that calls this function.

### Method A: Supabase Dashboard (Recommended)

This method is safer as it handles secrets and URLs automatically.

1.  Go to your Supabase Dashboard.
2.  Navigate to **Database** -> **Webhooks**.
3.  Click **Create a new webhook**.
4.  **Name**: `delete-logbook-files`
5.  **Table**: `horas_navegacion` (or `bitacora_logbook`)
6.  **Events**: Select `DELETE`.
7.  **Type**: `Supabase Edge Function`.
8.  **Edge Function**: Select `delete-logbook-files` from the dropdown.
9.  **Method**: `POST`.
10. Click **Create webhook**.

### Method B: Manual SQL Setup

If you prefer to use SQL or need to script the setup, you can use the provided `trigger_setup.sql` file.

1.  Open `supabase/functions/delete-logbook-files/trigger_setup.sql`.
2.  Replace `YOUR_PROJECT_REF` with your Supabase project reference ID.
3.  Replace `YOUR_SERVICE_ROLE_KEY` with your project's service role key (found in Project Settings -> API).
4.  Execute the SQL script in the Supabase SQL Editor.

**Warning:** Be careful not to commit the `trigger_setup.sql` file with your actual secrets to version control.

## Function Logic

The function:
1.  Receives a webhook payload.
2.  Checks if the event type is `DELETE`.
3.  Extracts the `gpx_url` from the `old_record`.
4.  If a URL exists, it calls the Supabase Storage API to remove the file from `academy-assets`.

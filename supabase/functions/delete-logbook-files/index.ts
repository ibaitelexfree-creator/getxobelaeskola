// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const payload = await req.json()
    const { type, old_record, table, schema } = payload

    console.log(`Received webhook: ${type} on ${schema}.${table}`)

    // Only proceed if it's a DELETE event on the expected table
    // Note: The table name in webhook payload matches the database table name
    if (type === 'DELETE' && old_record) {
      const gpxUrl = old_record.gpx_url

      if (gpxUrl) {
        console.log(`Deleting file: ${gpxUrl}`)

        // The gpx_url is stored as a relative path in the 'academy-assets' bucket
        // e.g., tracks/USER_ID/FILE_NAME.gpx
        const { data, error } = await supabaseClient
          .storage
          .from('academy-assets')
          .remove([gpxUrl])

        if (error) {
          console.error('Error deleting file:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          })
        }

        console.log('File deleted successfully:', data)
      } else {
        console.log('No gpx_url found in deleted record. Skipping storage cleanup.')
      }
    } else {
      console.log('Not a DELETE event or missing old_record. Skipping.')
    }

    return new Response(JSON.stringify({ message: 'Processed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

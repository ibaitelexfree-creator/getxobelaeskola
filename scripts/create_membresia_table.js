const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const sql = `CREATE TABLE IF NOT EXISTS public.tipos_membresia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    nombre_eu TEXT,
    descripcion TEXT,
    descripcion_eu TEXT,
    precio_anual NUMERIC(10,2),
    precio_mensual NUMERIC(10,2),
    beneficio TEXT NOT NULL,
    beneficio_eu TEXT,
    max_salidas INT,
    incluye_entrenamientos BOOLEAN DEFAULT false,
    categoria TEXT DEFAULT 'vela',
    activo BOOLEAN DEFAULT true,
    orden INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);`;

const rlsSql = `ALTER TABLE public.tipos_membresia ENABLE ROW LEVEL SECURITY;`;
const policySql = `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tipos_membresia' AND policyname='Public read tipos_membresia') THEN CREATE POLICY "Public read tipos_membresia" ON public.tipos_membresia FOR SELECT USING (true); END IF; END $$;`;

async function runSql(sqlStr) {
    const r = await fetch(url + '/rest/v1/rpc/exec_sql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': key,
            'Authorization': 'Bearer ' + key
        },
        body: JSON.stringify({ sql_string: sqlStr })
    });
    return { status: r.status, body: await r.text() };
}

(async () => {
    // Try the RPC approach first
    let result = await runSql(sql);
    console.log('CREATE TABLE via RPC:', result.status, result.body.substring(0, 200));

    if (result.status === 404) {
        console.log('\nRPC not available. Trying Supabase Management API...');

        // Extract project ref from URL
        const ref = url.replace('https://', '').replace('.supabase.co', '');
        console.log('Project ref:', ref);

        // Try direct pg connection via management API
        const mgmtUrl = `https://api.supabase.com/v1/projects/${ref}/database/query`;
        const r2 = await fetch(mgmtUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + key
            },
            body: JSON.stringify({ query: sql })
        });
        console.log('Management API:', r2.status, (await r2.text()).substring(0, 200));
    }
})();


const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tablesToCheck = [
    'profiles',
    'cursos',
    'inscripciones',
    'reservas_alquiler',
    'servicios_alquiler',
    'marketing_campaigns',
    'marketing_history',
    'maintenance_logs',
    'boats',
    'sessions',
    'session_edits',
    'bitacora_personal',
    'legal_consents',
    'habilidades',
    'habilidades_alumno',
    'certificados',
    'logros',
    'logros_alumno',
    'historial_financiero',
    'progreso_alumno'
];

async function checkTable(table) {
    try {
        const { error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            return `❌ Table "${table}" error: ${error.message}`;
        } else {
            return `✅ Table "${table}" exists.`;
        }
    } catch (e) {
        return `❌ Table "${table}" crash: ${e.message}`;
    }
}

async function checkSchema() {
    console.log('--- Table Existence Check ---');
    for (const table of tablesToCheck) {
        const result = await checkTable(table);
        console.log(result);
    }

    console.log('\n--- Column Presence Check ---');

    const columnChecks = [
        { table: 'profiles', columns: ['stripe_customer_id', 'stripe_subscription_id', 'status_socio', 'fecha_fin_periodo', 'xp', 'total_xp'] },
        { table: 'cursos', columns: ['stripe_product_id'] },
        { table: 'servicios_alquiler', columns: ['stripe_product_id'] },
        { table: 'inscripciones', columns: ['stripe_session_id'] },
        { table: 'reservas_alquiler', columns: ['stripe_session_id'] },
        { table: 'marketing_campaigns', columns: ['curso_trigger_id', 'dias_espera', 'curso_objetivo_id', 'cupon_codigo', 'descuento_porcentaje'] },
        { table: 'progreso_alumno', columns: ['alumno_id', 'tipo_entidad', 'estado'] },
        { table: 'certificados', columns: ['numero_certificado', 'perfil_id', 'curso_id', 'verificacion_hash'] }
    ];

    for (const check of columnChecks) {
        try {
            const { error } = await supabase.from(check.table).select(check.columns.join(',')).limit(1);
            if (error) {
                console.log(`❌ ${check.table} missing some columns: ${error.message}`);
            } else {
                console.log(`✅ ${check.table} columns are complete (${check.columns.join(', ')}).`);
            }
        } catch (e) {
            console.log(`❌ ${check.table} column check crash: ${e.message}`);
        }
    }

    console.log('\n--- RPC Functions Check ---');
    const rpcsToCheck = ['add_xp', 'award_xp_on_completion', 'award_xp_on_achievement', 'handle_updated_at'];
    for (const rpc of rpcsToCheck) {
        try {
            const { error } = await supabase.rpc(rpc, { p_user_id: '00000000-0000-0000-0000-000000000000', p_amount: 0 });
            if (error && error.message && error.message.includes('does not exist')) {
                console.log(`❌ RPC "${rpc}" does not exist.`);
            } else {
                console.log(`✅ RPC "${rpc}" exists (or detected by message).`);
            }
        } catch (e) {
            console.log(`❌ RPC "${rpc}" crash: ${e.message}`);
        }
    }
}

checkSchema().catch(e => console.error('Global failure:', e));

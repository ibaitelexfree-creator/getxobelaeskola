import { createAdminClient } from '../supabase/admin';
import { resend, DEFAULT_FROM_EMAIL } from '../resend';
import { stripe } from '../stripe';

export async function processMarketingAutomations() {
    const supabase = createAdminClient();

    // 1. Fetch active campaigns
    const { data: campaigns, error: campaignError } = await supabase
        .from('marketing_campaigns')
        .select(`
            *,
            trigger_course:curso_trigger_id(nombre_es, nombre_eu),
            target_course:curso_objetivo_id(nombre_es, nombre_eu, slug)
        `)
        .eq('activo', true);

    if (campaignError || !campaigns) {
        console.error('Error fetching campaigns:', campaignError);
        return { success: false, error: campaignError };
    }

    let totalSent = 0;

    for (const campaign of (campaigns as any[])) {
        console.log(`Processing campaign: ${campaign.nombre}`);

        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - (campaign.dias_espera || 90));

        // Logical check:
        // - Bought TRIGGER course at least campaign.dias_espera ago
        // - Hasn't bought TARGET course EVER
        // - Hasn't received THIS campaign EVER

        const { data: triggerInscriptions, error: insError } = await supabase
            .from('inscripciones')
            .select('perfil_id, profiles(nombre, email)')
            .eq('curso_id', campaign.curso_trigger_id)
            .lte('created_at', daysAgo.toISOString());

        if (insError || !triggerInscriptions) {
            console.error(`Error fetching inscriptions for campaign ${campaign.id}:`, insError);
            continue;
        }

        const candidates = triggerInscriptions as any[];
        console.log(`Found ${candidates.length} possible candidates who took the trigger course.`);
        if (candidates.length === 0) continue;

        // 2. Batch check: already bought target course
        const profileIds = candidates.map(ins => ins.perfil_id);
        const { data: boughtTargetData, error: boughtError } = await supabase
            .from('inscripciones')
            .select('perfil_id')
            .eq('curso_id', campaign.curso_objetivo_id)
            .in('perfil_id', profileIds);

        if (boughtError) {
            console.error(`Error batch checking target course for campaign ${campaign.id}:`, boughtError);
            continue;
        }
        const boughtTargetSet = new Set(boughtTargetData?.map(ins => ins.perfil_id) || []);

        // 3. Batch check: already received this campaign
        const { data: historyData, error: historyError } = await supabase
            .from('marketing_history')
            .select('perfil_id')
            .eq('campana_id', campaign.id)
            .in('perfil_id', profileIds);

        if (historyError) {
            console.error(`Error batch checking history for campaign ${campaign.id}:`, historyError);
            continue;
        }
        const historySet = new Set(historyData?.map(h => h.perfil_id) || []);

        for (const ins of candidates) {
            const profileId = ins.perfil_id;

            // Skip if already bought target course
            if (boughtTargetSet.has(profileId)) continue;

            // Skip if already received this campaign
            if (historySet.has(profileId)) continue;

            // 4. Get User Email (Prefer email from profile if available to avoid Auth API call)
            let email = ins.profiles?.email;

            if (!email) {
                const { data: userResponse, error: userError } = await supabase.auth.admin.getUserById(profileId);
                email = userResponse?.user?.email;

                if (userError || !email) {
                    console.warn(`Could not get email for profile ${profileId}:`, userError);
                    continue;
                }
            }

            // 5. Generate Dynamic Coupon if configured
            let finalCode = campaign.cupon_codigo || 'WELCOME10';

            if (stripe && campaign.stripe_coupon_id) {
                try {
                    const promoCode = await (stripe as any).promotionCodes.create({
                        coupon: campaign.stripe_coupon_id,
                        max_redemptions: 1,
                        metadata: {
                            perfil_id: profileId,
                            campana_id: campaign.id
                        }
                    });
                    finalCode = promoCode.code;
                    console.log(`Generated dynamic Stripe code: ${finalCode} for ${email}`);
                } catch (stripeErr) {
                    console.error('Error creating Stripe promotion code:', stripeErr);
                    // Fallback to static code if specified, otherwise skip to avoid sending invalid offer
                    if (!campaign.cupon_codigo) continue;
                }
            }

            // 6. Send Email
            const profileName = (ins.profiles as any)?.nombre || 'Navegante';
            const emailSent = await sendAutomationEmail(email, profileName, campaign, finalCode);

            if (emailSent) {
                // 7. Log history
                await (supabase as any).from('marketing_history').insert({
                    campana_id: campaign.id,
                    perfil_id: profileId
                });
                totalSent++;
                console.log(`Successfully sent marketing email to ${email} for campaign ${campaign.nombre}`);
            }
        }
    }

    return { success: true, totalSent };
}

async function sendAutomationEmail(email: string, name: string, campaign: any, dynamicCode?: string) {
    if (!resend) {
        console.log(`[SIMULATION] Sending email to ${email} for campaign ${campaign.nombre} with code ${dynamicCode}`);
        return true;
    }

    const targetCourseName = campaign.target_course?.nombre_es || 'Siguiente nivel';
    const triggerCourseName = campaign.trigger_course?.nombre_es || 'Tu último curso';
    const discount = campaign.descuento_porcentaje || 10;
    const code = dynamicCode || campaign.cupon_codigo || 'BIENVENIDODEBUE';
    const slug = campaign.target_course?.slug || '';

    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px; padding: 20px 0; background: linear-gradient(135deg, #003366 0%, #0056b3 100%); border-radius: 8px 8px 0 0;">
                <h2 style="color: #ffffff; margin: 0; letter-spacing: 1px;">GETXO BELA ESKOLA</h2>
            </div>
            
            <h2 style="color: #003366; text-align: center; font-size: 24px;">¡Hola, ${name}!</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #444; text-align: center;">
                Ha pasado un tiempo desde que disfrutamos navegando juntos en el curso de <strong>${triggerCourseName}</strong>. 
                Esperamos que el gusanillo de la vela siga ahí. ¡Te echamos de menos en el agua!
            </p>
            
            <div style="background-color: #f8faff; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center; border: 1px dashed #0056b3;">
                <h3 style="color: #0056b3; margin-top: 0; font-size: 20px;">¿Listo para el siguiente nivel?</h3>
                <p style="font-size: 17px; margin-bottom: 20px; color: #555;">
                    Queremos que sigas progresando. Apúntate ahora al curso de <br>
                    <strong style="font-size: 20px; color: #003366;">${targetCourseName}</strong>
                </p>
                
                <div style="font-size: 32px; font-weight: 800; color: #e63946; margin: 25px 0;">
                    -${discount}% DESCUENTO
                </div>
                
                <div style="margin-bottom: 30px;">
                    <p style="font-size: 14px; color: #666; margin-bottom: 8px;">Tu código promocional personal:</p>
                    <span style="font-family: 'Courier New', Courier, monospace; background: #ffffff; border: 2px solid #eee; padding: 10px 20px; border-radius: 6px; font-weight: bold; font-size: 20px; color: #333; display: inline-block;">${code}</span>
                </div>
                
                <a href="https://getxobelaeskola.cloud/es/courses/${slug}" 
                   style="background: linear-gradient(135deg, #003366 0%, #0056b3 100%); color: white; padding: 16px 35px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(0,51,102,0.3);">
                    RESERVAR AHORA
                </a>
            </div>
            
            <p style="font-size: 14px; color: #777; line-height: 1.6; text-align: center; font-style: italic;">
                "No puedes cambiar el viento, pero puedes ajustar las velas." <br>
                ¡Nos vemos pronto en el Puerto Deportivo de Getxo!
            </p>
            
            <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
                <p style="font-size: 12px; color: #999; margin: 5px 0;">
                    <strong>Getxo Getxo Bela Eskola</strong><br>
                    Puerto Deportivo El Abra-Getxo, Local 2<br>
                    48992 Getxo, Bizkaia
                </p>
                <div style="margin-top: 15px;">
                    <a href="#" style="color: #0056b3; text-decoration: none; font-size: 11px;">Términos y condiciones</a> | 
                    <a href="#" style="color: #0056b3; text-decoration: none; font-size: 11px;">Darme de baja</a>
                </div>
            </div>
        </div>
    `;

    try {
        await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: email,
            subject: `🎁 ¡- ${discount}% de descuento para tu curso de ${targetCourseName}!`,
            html: html
        });
        return true;
    } catch (error) {
        console.error('Error sending marketing email:', error);
        return false;
    }
}

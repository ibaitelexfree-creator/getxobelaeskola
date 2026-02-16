import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import StudentProfileSidebar from '@/components/student/StudentProfileSidebar';
import MembershipWidget from '@/components/student/MembershipWidget';
import { redirect } from 'next/navigation';
import DashboardRefresh from '@/components/student/DashboardRefresh';

export default async function StudentDashboard({
    params: { locale }
}: {
    params: { locale: string };
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    interface DashboardItem {
        id: string;
        estado_pago?: string;
        fecha_reserva?: string;
        ediciones_curso?: { fecha_inicio: string; cursos?: { nombre_es: string; nombre_eu: string; slug: string } };
        metadata?: { start_date: string };
        cursos?: { nombre_es: string; nombre_eu: string; slug: string };
        servicios_alquiler?: { nombre_es: string; nombre_eu: string };
        hora_inicio?: string;
        opcion_seleccionada?: string;
        estado_entrega?: string;
    }

    if (!user) {
        redirect(`/${locale}/auth/login`);
    }

    // Use admin client to ensure we control the filtering strictly and bypass potentially misconfigured RLS
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabaseAdmin = createAdminClient();

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Redirect Staff/Admin to their management panel
    if (profile?.rol === 'admin' || profile?.rol === 'instructor') {
        redirect(`/${locale}/staff`);
    }

    const { data: inscripciones } = await supabaseAdmin
        .from('inscripciones')
        .select('*, ediciones_curso(fecha_inicio, cursos(nombre_es, nombre_eu, slug)), cursos(nombre_es, nombre_eu, slug)')
        .eq('perfil_id', user.id)
        .order('created_at', { ascending: false });

    const { data: rentals } = await supabaseAdmin
        .from('reservas_alquiler')
        .select('*, servicios_alquiler(*)')
        .eq('perfil_id', user.id)
        .order('fecha_reserva', { ascending: true });

    const hasAnyData = (inscripciones?.length || 0) > 0 || (rentals?.length || 0) > 0;

    // --- ACADEMY STATS INTEGRATION ---
    const { count: academyLevels } = await supabaseAdmin
        .from('progreso_alumno')
        .select('*', { count: 'exact', head: true })
        .eq('alumno_id', user.id)
        .eq('tipo_entidad', 'nivel')
        .eq('estado', 'completado');

    const { count: academyCerts } = await supabaseAdmin
        .from('certificados')
        .select('*', { count: 'exact', head: true })
        .eq('alumno_id', user.id);

    // Check if user has started anything in academy
    const { count: academyProgress } = await supabaseAdmin
        .from('progreso_alumno')
        .select('*', { count: 'exact', head: true })
        .eq('alumno_id', user.id);

    const hasAcademyActivity = (academyProgress || 0) > 0;
    // -------------------------------

    const getStatusInfo = (item: DashboardItem) => {
        const isPaid = item.estado_pago === 'pagado';
        if (!isPaid) return { label: 'PENDIENTE DE PAGO', color: 'text-amber-500 border-amber-500/30', paid: false };

        const dateStr = item.fecha_reserva || (item.ediciones_curso?.fecha_inicio) || item.metadata?.start_date;
        if (!dateStr) return { label: 'PENDIENTE', color: 'text-green-500 border-green-500/30', paid: true };

        const itemDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (itemDate < today) return { label: 'COMPLETADO', color: 'text-white/40 border-white/10', paid: true };
        return { label: 'PENDIENTE', color: 'text-green-500 border-green-500/30', paid: true };
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Split Inscripciones
    const upcomingInscripciones = inscripciones?.filter(ins => {
        const dateStr = ins.ediciones_curso?.fecha_inicio || ins.metadata?.start_date;
        if (!dateStr) return true; // Keep if no date assigned yet
        return new Date(dateStr) >= today;
    }) || [];

    const pastInscripciones = inscripciones?.filter(ins => {
        const dateStr = ins.ediciones_curso?.fecha_inicio || ins.metadata?.start_date;
        if (!dateStr) return false;
        return new Date(dateStr) < today;
    }) || [];

    // Split Rentals
    const upcomingRentals = rentals?.filter(rent => {
        if (!rent.fecha_reserva) return true;
        const date = new Date(rent.fecha_reserva);
        return date >= today;
    }) || [];

    const pastRentals = rentals?.filter(rent => {
        if (!rent.fecha_reserva) return false;
        const date = new Date(rent.fecha_reserva);
        return date < today;
    }) || [];

    return (
        <main className="min-h-screen pt-32 pb-24 px-6 relative">
            <div className="bg-mesh" />

            <div className="container mx-auto">
                <header className="mb-16">
                    <span className="text-accent uppercase tracking-widest text-xs font-semibold mb-4 block">
                        Área de Alumno
                    </span>
                    <h1 className="text-4xl md:text-7xl font-display mb-4">
                        Hola, <span className="italic">{profile?.nombre || 'Navegante'}</span>
                    </h1>
                    <p className="text-foreground/40 font-light">Gestiona tus cursos y certificaciones.</p>
                </header>

                {/* Polling / Refresh logic for new purchases */}
                <DashboardRefresh hasData={hasAnyData} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-16">
                        {/* Membership Section */}
                        <MembershipWidget
                            status={profile?.status_socio || 'no_socio'}
                            locale={locale}
                        />

                        {/* Academy Digital Widget */}
                        <section>
                            <div className="flex justify-between items-end mb-8">
                                <h2 className="text-xs uppercase tracking-widest text-accent font-bold">Campus Virtual</h2>
                                <Link href={`/${locale}/academy/dashboard`} className="text-[10px] uppercase tracking-widest text-foreground/40 hover:text-accent transition-colors">
                                    Ir al Panel Académico +
                                </Link>
                            </div>

                            <div className="bg-gradient-to-r from-[#0a1628] to-[#0f213a] p-8 border border-accent/20 rounded-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl pointer-events-none group-hover:scale-110 transition-transform duration-700">🎓</div>

                                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                                    <div>
                                        <h3 className="text-2xl font-display italic text-white mb-2">Academia Digital</h3>
                                        <p className="text-white/60 text-sm max-w-md mb-6">
                                            {hasAcademyActivity
                                                ? 'Continúa tu formación online, completa unidades y obtén certificaciones oficiales.'
                                                : 'Accede a cursos teóricos online, exámenes oficiales y simulacros de navegación.'}
                                        </p>

                                        <div className="flex gap-6 mb-8 md:mb-0">
                                            <div>
                                                <div className="text-2xl font-bold text-accent">{academyLevels || 0}</div>
                                                <div className="text-[9px] uppercase tracking-widest text-white/40">Niveles</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-accent">{academyCerts || 0}</div>
                                                <div className="text-[9px] uppercase tracking-widest text-white/40">Certificados</div>
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/${locale}/academy/dashboard`}
                                        className="px-8 py-3 bg-accent text-nautical-black font-bold uppercase tracking-widest text-xs rounded hover:bg-white transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]"
                                    >
                                        {hasAcademyActivity ? 'Continuar Aprendiendo' : 'Empezar Ahora'}
                                    </Link>
                                </div>
                            </div>
                        </section>

                        {/* Courses Section */}
                        <section>
                            <h2 className="text-xs uppercase tracking-widest text-accent mb-8 font-bold">Tus Próximos Cursos Presenciales</h2>

                            {upcomingInscripciones && upcomingInscripciones.length > 0 ? (
                                <div className="space-y-6">
                                    {upcomingInscripciones.map((ins: DashboardItem) => {
                                        const edition = ins.ediciones_curso;
                                        const course = ins.cursos || edition?.cursos;
                                        const courseName = course
                                            ? (locale === 'es' ? course.nombre_es : course.nombre_eu)
                                            : 'Reserva de Curso';

                                        const status = getStatusInfo(ins);

                                        return (
                                            <div key={ins.id} className="bg-card p-6 border border-card-border flex justify-between items-center group hover:border-accent/30 transition-all rounded-sm">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 bg-accent/10 flex items-center justify-center text-accent text-xl rounded-sm">
                                                        ⛵
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-display text-white group-hover:text-accent transition-colors">
                                                            {courseName}
                                                        </h3>
                                                        <p className="text-xs text-foreground/40 font-light">
                                                            {edition?.fecha_inicio
                                                                ? `Comienza el ${new Date(edition.fecha_inicio).toLocaleDateString()}`
                                                                : (ins.metadata?.start_date
                                                                    ? `Comienza el ${new Date(ins.metadata.start_date).toLocaleDateString()}`
                                                                    : 'Pendiente de asignar fecha')}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-3">
                                                    <span className={`text-[9px] uppercase tracking-widest px-3 py-1 border font-bold ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                    {!status.paid && (
                                                        <Link
                                                            href={`/${locale}/courses/${course?.slug || ''}`}
                                                            className="text-[9px] uppercase tracking-widest bg-accent text-nautical-black px-4 py-1.5 font-bold hover:bg-white transition-all"
                                                        >
                                                            Pagar Ahora
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-card p-8 border border-card-border text-center rounded-sm">
                                    <p className="text-foreground/40 text-xs font-light mb-6">No tienes cursos próximos programados.</p>
                                    <Link href={`/${locale}/courses`} className="px-6 py-3 border border-accent text-accent text-[9px] uppercase tracking-widest hover:bg-accent hover:text-nautical-black transition-all">
                                        Explorar Catálogo
                                    </Link>
                                </div>
                            )}
                        </section>

                        {/* Rentals Section */}
                        <section>
                            <div className="flex justify-between items-end mb-8">
                                <h2 className="text-xs uppercase tracking-widest text-accent font-bold">Próximos Alquileres</h2>
                                <Link href={`/${locale}/rental`} className="text-[10px] uppercase tracking-widest text-foreground/40 hover:text-accent transition-colors">Nuevo Alquiler +</Link>
                            </div>

                            {upcomingRentals && upcomingRentals.length > 0 ? (
                                <div className="space-y-6">
                                    {upcomingRentals.map((rent: DashboardItem) => {
                                        const service = rent.servicios_alquiler;
                                        const name = locale === 'es' ? service?.nombre_es : service?.nombre_eu;
                                        const status = getStatusInfo(rent);

                                        return (
                                            <div key={rent.id} className="bg-card p-6 border border-card-border flex justify-between items-center group hover:border-accent/30 transition-all rounded-sm">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 bg-white/5 flex items-center justify-center text-accent text-xl rounded-sm">
                                                        🏄‍♂️
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-display text-white group-hover:text-accent transition-colors">
                                                            {name}
                                                        </h3>
                                                        <p className="text-xs text-foreground/40 font-light">
                                                            {rent.fecha_reserva ? new Date(rent.fecha_reserva).toLocaleDateString() : 'Fecha pendiente'} - {rent.hora_inicio?.slice(0, 5)}h
                                                            {rent.opcion_seleccionada && rent.opcion_seleccionada !== 'Estándar' && (
                                                                <span className="text-brass-gold ml-2">• {rent.opcion_seleccionada}</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-3 text-right">
                                                    <span className={`text-[9px] uppercase tracking-widest px-3 py-1 border font-bold ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                    {!status.paid && (
                                                        <Link
                                                            href={`/${locale}/rental`}
                                                            className="text-[9px] uppercase tracking-widest bg-accent text-nautical-black px-4 py-1.5 font-bold hover:bg-white transition-all"
                                                        >
                                                            Pagar Reserva
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-card p-8 border border-card-border text-center rounded-sm">
                                    <p className="text-foreground/40 font-light mb-6">No tienes alquileres próximos.</p>
                                    <Link href={`/${locale}/rental`} className="px-8 py-4 border border-accent text-accent text-[9px] uppercase tracking-widest hover:bg-accent hover:text-nautical-black transition-all">
                                        Reservar Material
                                    </Link>
                                </div>
                            )}
                        </section>

                        {/* History Section */}
                        {(pastInscripciones.length > 0 || pastRentals.length > 0) && (
                            <section className="pt-8 border-t border-white/5">
                                <h2 className="text-xs uppercase tracking-widest text-foreground/20 mb-8 font-bold">Historial Reciente</h2>
                                <div className="space-y-4 opacity-50 hover:opacity-100 transition-opacity">
                                    {[...pastInscripciones, ...pastRentals].map((item: DashboardItem) => {
                                        const isRental = !!item.servicios_alquiler;
                                        const name = isRental
                                            ? (locale === 'es' ? item.servicios_alquiler?.nombre_es : item.servicios_alquiler?.nombre_eu)
                                            : ((item.cursos || item.ediciones_curso?.cursos)
                                                ? (locale === 'es' ? (item.cursos?.nombre_es || item.ediciones_curso?.cursos?.nombre_es) : (item.cursos?.nombre_eu || item.ediciones_curso?.cursos?.nombre_eu))
                                                : 'Actividad pasada');

                                        const dateStr = item.fecha_reserva || item.ediciones_curso?.fecha_inicio || item.metadata?.start_date;

                                        return (
                                            <div key={item.id} className="flex justify-between items-center py-3 px-6 bg-white/[0.02] border border-white/5 rounded-sm">
                                                <div className="flex items-center gap-4 text-xs">
                                                    <span className="text-foreground/40">{dateStr ? new Date(dateStr).toLocaleDateString() : '--/--/--'}</span>
                                                    <span className="text-white font-medium">{name}</span>
                                                </div>
                                                <span className="text-[8px] uppercase tracking-widest text-foreground/40">Completado</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <StudentProfileSidebar
                            profile={profile}
                            email={user?.email || ''}
                            locale={locale}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}

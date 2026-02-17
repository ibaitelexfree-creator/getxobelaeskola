import { getTranslations } from 'next-intl/server';
import StudentDashboardClient from './StudentDashboardClient';

export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale }));
}

export default async function StudentDashboard({
    params: { locale }
}: {
    params: { locale: string };
}) {
    const t = await getTranslations('student_dashboard');

    // Pass raw translations as a plain object to avoid serialization issues
    const translations = {
        eyebrow: t('eyebrow'),
        welcome: t('welcome'),
        subtitle: t('subtitle'),
        academy_widget: {
            title: t('academy_widget.title'),
            go_to_panel: t('academy_widget.go_to_panel'),
            card_title: t('academy_widget.card_title'),
            card_desc_active: t('academy_widget.card_desc_active'),
            card_desc_inactive: t('academy_widget.card_desc_inactive'),
            stats_levels: t('academy_widget.stats_levels'),
            stats_certs: t('academy_widget.stats_certs'),
            btn_continue: t('academy_widget.btn_continue'),
            btn_start: t('academy_widget.btn_start')
        },
        courses_section: {
            title: t('courses_section.title'),
            empty_title: t('courses_section.empty_title'),
            empty_subtitle: t('courses_section.empty_subtitle'),
            btn_explore: t('courses_section.btn_explore')
        },
        rentals_section: {
            title: t('rentals_section.title'),
            new_rental: t('rentals_section.new_rental'),
            empty_title: t('rentals_section.empty_title'),
            empty_subtitle: t('rentals_section.empty_subtitle'),
            btn_reserve: t('rentals_section.btn_reserve')
        },
        history_section: {
            title: t('history_section.title'),
            completed: t('history_section.completed')
        }
    };

    return <StudentDashboardClient locale={locale} translations={translations} />;
}


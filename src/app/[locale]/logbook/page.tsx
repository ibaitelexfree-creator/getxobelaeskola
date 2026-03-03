import LogbookMain from './LogbookMain';

export default function LogbookPage({ params: { locale } }: { params: { locale: string } }) {
    return <LogbookMain locale={locale} />;
}

import Image from 'next/image';
import { User } from 'lucide-react';

interface PublicProfileHeaderProps {
    profile: {
        nombre: string;
        apellidos: string;
        avatar_url?: string;
        rol?: string;
        bio_es?: string;
        bio_eu?: string;
    };
}

export default function PublicProfileHeader({ profile }: PublicProfileHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-accent/20 bg-white/5 flex items-center justify-center">
                {profile.avatar_url ? (
                    <Image
                        src={profile.avatar_url}
                        alt={`${profile.nombre} ${profile.apellidos}`}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <User size={48} className="text-white/20" />
                )}
            </div>
            <div className="text-center md:text-left">
                <h1 className="text-4xl font-display font-bold text-white italic">
                    {profile.nombre} {profile.apellidos}
                </h1>
                <p className="text-accent text-sm font-bold uppercase tracking-widest mt-2">
                    {profile.rol || 'Alumno'}
                </p>
                {profile.bio_es && (
                    <p className="text-white/60 mt-4 max-w-lg italic font-serif leading-relaxed">
                        "{profile.bio_es}"
                    </p>
                )}
            </div>
        </div>
    );
}

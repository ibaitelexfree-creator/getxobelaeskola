export default function Loading() {
    return (
        <div className="min-h-screen bg-nautical-black flex items-center justify-center relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-blue-600/5 blur-[120px] animate-pulse" />

            <div className="relative z-10 flex flex-col items-center gap-8 animate-in fade-in duration-700">
                {/* Nautical Compass Spinner */}
                <div className="relative w-24 h-24">
                    {/* Outer Ring */}
                    <div className="absolute inset-0 border-2 border-white/10 rounded-full" />

                    {/* Spinning Ring */}
                    <div className="absolute inset-0 border-t-2 border-accent rounded-full animate-spin duration-[2s]" />

                    {/* Inner Compass Star */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 relative animate-pulse">
                            <span className="absolute inset-0 flex items-center justify-center text-4xl transform -rotate-45">
                                ✦
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <p className="text-accent uppercase tracking-[0.4em] text-[10px] font-black animate-pulse">
                        LOADING
                    </p>
                    <p className="text-white/40 text-sm font-display italic">
                        Preparando la travesía...
                    </p>
                </div>
            </div>
        </div>
    );
}

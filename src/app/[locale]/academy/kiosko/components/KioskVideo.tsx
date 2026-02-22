"use client";

import React from "react";

export default function KioskVideo() {
	return (
		<div className="w-full h-full bg-black relative flex items-center justify-center">
			<video
				className="w-full h-full object-cover"
				autoPlay
				muted
				loop
				playsInline
				src="https://videos.pexels.com/video-files/2422501/2422501-hd_1920_1080_25fps.mp4"
			/>
			<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
			<div className="absolute bottom-12 left-12 text-white font-display italic text-6xl drop-shadow-lg">
				Academia Náutica
			</div>
		</div>
	);
}

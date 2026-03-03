import React from "react";

export default function DashboardSkeleton() {
	return (
		<div className="flex flex-col lg:flex-row gap-8 min-h-screen bg-nautical-black/5 p-4 lg:p-8 pt-32 animate-pulse overflow-hidden">
			{/* Sidebar Skeleton */}
			<aside className="w-full lg:w-80 space-y-8 flex-shrink-0">
				<div className="bg-card p-8 border border-card-border rounded-sm backdrop-blur-md">
					<div className="flex flex-col items-center text-center mb-8">
						<div className="w-24 h-24 rounded-full bg-white/5 mb-4" />
						<div className="h-6 w-32 bg-white/5 rounded-sm mb-2" />
						<div className="h-3 w-40 bg-white/5 rounded-sm" />
						<div className="mt-6 flex flex-col items-center gap-2">
							<div className="h-8 w-20 bg-white/5 rounded-sm" />
							<div className="h-2 w-24 bg-white/5 rounded-sm" />
						</div>
					</div>
					<div className="space-y-6">
						<div className="h-2 w-full bg-white/5 rounded-sm" />
						<div className="h-10 w-full bg-white/5 rounded-sm" />
						<div className="h-10 w-full bg-white/5 rounded-sm" />
						<div className="h-24 w-full bg-white/5 rounded-sm" />
					</div>
				</div>
			</aside>

			{/* Main Content Skeleton */}
			<main className="flex-1 space-y-12 max-w-5xl z-10 w-full">
				<header>
					<div className="h-3 w-20 bg-accent/20 rounded-sm mb-4" />
					<div className="h-16 md:h-24 w-full md:w-3/4 bg-white/5 rounded-sm mb-4" />
					<div className="h-4 w-1/2 bg-white/5 rounded-sm" />
				</header>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
					<div className="lg:col-span-2 space-y-16">
						{/* Membership Widget Skeleton */}
						<div className="h-48 w-full bg-white/5 rounded-sm border border-white/5" />

						{/* Academy Widget Skeleton */}
						<section>
							<div className="flex justify-between items-end mb-8">
								<div className="h-2 w-24 bg-accent/20 rounded-sm" />
								<div className="h-2 w-16 bg-white/5 rounded-sm" />
							</div>
							<div className="h-64 w-full bg-white/5 border border-white/5 rounded-sm" />
						</section>

						{/* Courses Section Skeleton */}
						<section>
							<div className="h-3 w-32 bg-accent/20 rounded-sm mb-8" />
							<div className="space-y-6">
								<div className="h-24 w-full bg-white/5 border border-white/5 rounded-sm" />
								<div className="h-24 w-full bg-white/5 border border-white/5 rounded-sm" />
							</div>
						</section>
					</div>

					{/* Right Column Skeleton */}
					<div className="lg:col-span-1 space-y-8">
						<div className="h-96 w-full bg-white/5 border border-white/5 rounded-sm" />
						<div className="h-48 w-full bg-white/5 border border-white/5 rounded-sm" />
					</div>
				</div>
			</main>
		</div>
	);
}

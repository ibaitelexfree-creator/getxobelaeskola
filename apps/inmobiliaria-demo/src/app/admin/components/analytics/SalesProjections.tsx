'use client';

import React from 'react';

export default function SalesProjections({ externalData }: { externalData?: any }) {
    return (
        <div className="p-4 bg-zinc-900 rounded-xl text-white">
            <h3 className="text-xl font-bold mb-4">Sales Projections</h3>
            <p className="text-zinc-500">Data loaded. Waiting for interaction.</p>
        </div>
    );
}

<<<<<<< HEAD
'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const generateData = () => {
    const data: { timestamp: number; value: number }[] = [];
    const now = Date.now();
    for (let i = 0; i < 24; i++) {
        data.push({
            timestamp: now + i * 3600 * 1000, // Every hour
            value: Math.floor(Math.random() * 100),
        });
    }
    return data;
};

const data = generateData();

const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function TestChartPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div>Loading Chart...</div>;

    return (
        <div style={{ width: '100%', height: '400px', padding: '50px' }}>
            <h1>Recharts Test - Nuevo Eje Temporal (Time Scale)</h1>
            <div style={{ width: '100%', height: '300px', background: '#1a1a1a', borderRadius: '8px', padding: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis
                            dataKey="timestamp"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={formatTime}
                            stroke="#888"
                        />
                        <YAxis stroke="#888" />
                        <Tooltip
                            labelFormatter={(label) => formatTime(label)}
                            contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }}
                        />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div style={{ marginTop: '20px', color: '#666' }}>
                <p>Verificación del eje temporal continuo usando timestamps y formateo dinámico.</p>
            </div>
        </div>
    );
}
=======
'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Page A', uv: 400, pv: 2400, amt: 2400 },
    { name: 'Page B', uv: 300, pv: 1398, amt: 2210 },
    { name: 'Page C', uv: 200, pv: 9800, amt: 2290 },
];

export default function TestChartPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div>Loading Chart...</div>;

    return (
        <div style={{ width: '100%', height: '400px', padding: '50px' }}>
            <h1>Recharts Test</h1>
            <div style={{ width: '100%', height: '300px', background: '#ccc' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
>>>>>>> pr-286

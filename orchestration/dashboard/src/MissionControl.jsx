import React, { useState, useEffect } from "react";

const cyan = "#00e5ff";
const green = "#00ff9f";
const orange = "#ff6b35";
const purple = "#b388ff";
const yellow = "#ffd600";
const dark = "#0a0e1a";
const card = "#0f1629";
const border = "#1e2d4a";

const PhaseBadge = ({ phase, status, vote }) => {
    const isCompleted = status === 'COMPLETED';
    const isFailed = status === 'FAILED';
    const color = isFailed ? orange : (isCompleted ? green : cyan);

    return (
        <div style={{
            padding: "10px 15px", borderRadius: 8, background: `${color}15`,
            border: `1px solid ${color}40`, minWidth: 150, textAlign: 'center'
        }}>
            <div style={{ fontSize: 10, color: '#667', letterSpacing: 1, marginBottom: 4 }}>{phase}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{status}</div>
            {vote && (
                <div style={{
                    fontSize: 11, marginTop: 6, fontWeight: 800,
                    color: vote === 'OK' ? green : orange
                }}>
                    VOTE: {vote}
                </div>
            )}
        </div>
    );
};

export const MissionControl = () => {
    const [swarms, setSwarms] = useState([]);
    const [selectedSwarm, setSelectedSwarm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rateLimits, setRateLimits] = useState([]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // 5s refresh for "real-time"
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [swarmsRes, rateRes] = await Promise.all([
                fetch('/api/v2/swarms').then(res => res.json()),
                fetch('/api/rate-limit/metrics').then(res => res.json()).catch(() => ({}))
            ]);

            setSwarms(swarmsRes);
            setRateLimits(rateRes); // Set whole object to access stats and logs

            if (selectedSwarm) {
                const detailRes = await fetch(`/api/v2/swarms/${selectedSwarm.id}`).then(res => res.json());
                setSelectedSwarm(detailRes);
            } else if (swarmsRes.length > 0 && !selectedSwarm) {
                // Auto-select latest if none chosen
                const firstDetail = await fetch(`/api/v2/swarms/${swarmsRes[0].id}`).then(res => res.json());
                setSelectedSwarm(firstDetail);
            }
            setLoading(false);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        }
    };

    const getPhaseTask = (role) => {
        return selectedSwarm?.tasks?.find(t => t.agent_role.toUpperCase() === role.toUpperCase());
    };

    const findAlerts = () => {
        const alerts = [];
        // Grok RCA triggers in history
        selectedSwarm?.history?.forEach(h => {
            const isRCA = h.event_type?.includes('RCA') || h.event_type?.includes('FALLBACK') ||
                h.message?.includes('RCA') || h.description?.includes('RCA');
            if (isRCA) {
                alerts.push({
                    type: 'RCA',
                    message: h.message || h.description || h.event_type,
                    time: h.created_at || h.timestamp || new Date()
                });
            }
        });

        // Rate Guard waits from logs
        const logs = rateLimits?.logs || [];
        logs.slice(0, 10).forEach(rl => {
            if (rl.status_code === 429 || rl.is_blocked) {
                alerts.push({
                    type: 'LIMIT',
                    message: `Blocked: ${rl.model_name} (${rl.provider})`,
                    time: rl.created_at
                });
            }
        });
        return alerts;
    };

    if (loading) return <div style={{ padding: 40, color: cyan }}>📡 Syncing with Orchestrator Core...</div>;

    const alerts = findAlerts();

    return (
        <div style={{ padding: "30px", background: dark, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "1.8rem", color: "#fff", display: "flex", alignItems: "center", gap: 15 }}>
                        🕹️ Mission Control <span style={{ fontSize: 12, background: green, color: '#000', padding: '2px 8px', borderRadius: 4 }}>LIVE RELAY</span>
                    </h1>
                    <p style={{ margin: "5px 0 0", color: "#667", fontSize: 13 }}>Monitoring swarm handoffs and context propagation.</p>
                </div>

                <select
                    onChange={(e) => {
                        const s = swarms.find(sw => sw.id === e.target.value);
                        if (s) setSelectedSwarm(null); // Force reload
                        fetchData();
                    }}
                    style={{ background: card, border: `1px solid ${border}`, color: "#fff", padding: "8px 12px", borderRadius: 6 }}
                >
                    {swarms.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                    ))}
                </select>
            </div>

            {/* Main Monitor Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 20 }}>

                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* RELAY PATH */}
                    <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 25 }}>
                        <h3 style={{ margin: "0 0 20px 0", fontSize: 14, color: cyan, letterSpacing: 1 }}>FLOW RELAY: ARCHITECT → DATA → UI</h3>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", position: "relative" }}>
                            {/* Horizontal Line background */}
                            <div style={{ position: "absolute", top: "50%", left: "10%", right: "10%", height: 2, background: `${border}`, zIndex: 0 }} />

                            <div style={{ zIndex: 1 }}><PhaseBadge phase="ARCHITECT" status={getPhaseTask('ARCHITECT')?.status || 'PENDING'} vote={getPhaseTask('ARCHITECT')?.response_payload?.vote} /></div>
                            <div style={{ color: border, fontSize: 24 }}>➔</div>
                            <div style={{ zIndex: 1 }}><PhaseBadge phase="DATA MASTER" status={getPhaseTask('DATA')?.status || 'PENDING'} vote={getPhaseTask('DATA')?.response_payload?.vote} /></div>
                            <div style={{ color: border, fontSize: 24 }}>➔</div>
                            <div style={{ zIndex: 1 }}><PhaseBadge phase="UI ENGINE" status={getPhaseTask('UI')?.status || 'PENDING'} vote={getPhaseTask('UI')?.response_payload?.vote} /></div>
                        </div>
                    </div>

                    {/* CONTEXT ACCUMULATOR */}
                    <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 25, flex: 1 }}>
                        <h3 style={{ margin: "0 0 15px 0", fontSize: 14, color: purple, letterSpacing: 1 }}>ACCUMULATED CONTEXT (PROPAGATION)</h3>
                        <div style={{ maxHeight: 300, overflowY: "auto", background: "#050810", padding: 15, borderRadius: 8, border: `1px solid ${border}80` }}>
                            {selectedSwarm?.tasks?.map((t, idx) => (
                                <div key={t.id} style={{ marginBottom: 20 }}>
                                    <div style={{ fontSize: 11, color: purple, fontWeight: 700, marginBottom: 8, borderBottom: `1px solid ${purple}30` }}>
                                        Step {idx + 1}: Received at {t.agent_role}
                                    </div>
                                    <pre style={{ fontSize: 10, color: "#889", whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                        {t.request_payload?.previousContext || "(No previous context)"}
                                    </pre>
                                    {t.response_payload && (
                                        <div style={{ marginTop: 10, padding: 10, background: `${green}05`, borderLeft: `2px solid ${green}40` }}>
                                            <div style={{ fontSize: 10, color: green, marginBottom: 5 }}>Produced by {t.agent_role}:</div>
                                            <div style={{ fontSize: 10, color: "#aab" }}>
                                                {t.agent_role === 'ARCHITECT' && t.response_payload.schema_sql ? "Successfully generated schema and plan." : ""}
                                                {t.agent_role === 'DATA' && t.response_payload.migrations_sql ? "Successfully implemented server logic." : ""}
                                                {/* Confirm architect_plan reached data */}
                                                {t.agent_role === 'DATA' && t.request_payload?.previousContext?.includes('schema_sql') && (
                                                    <span style={{ color: cyan }}> [✓ Architect Handshake Verified]</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )) || <div style={{ color: '#445' }}>No propagation data available for this swarm.</div>}
                        </div>
                    </div>
                </div>

                {/* SIDEBAR: ALERTS & RECENT LOGS */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* ACTIVE ALERTS */}
                    <div style={{ background: `${orange}10`, border: `1px solid ${orange}40`, borderRadius: 12, padding: 20 }}>
                        <h3 style={{ margin: "0 0 15px 0", fontSize: 12, color: orange, letterSpacing: 1, display: "flex", alignItems: "center", gap: 8 }}>
                            🚨 ACTIVE ALERTS {alerts.length > 0 && <span style={{ background: orange, color: '#000', borderRadius: '50%', width: 14, height: 14, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{alerts.length}</span>}
                        </h3>
                        {alerts.length === 0 ? (
                            <div style={{ fontSize: 11, color: '#556' }}>No active alerts or throttles.</div>
                        ) : (
                            alerts.map((al, idx) => (
                                <div key={idx} style={{ marginBottom: 12, padding: "8px 12px", background: "#201010", borderRadius: 6, borderLeft: `3px solid ${orange}` }}>
                                    <div style={{ fontSize: 10, color: orange, fontWeight: 700 }}>{al.type} TRIGGERED</div>
                                    <div style={{ fontSize: 11, color: "#fbb", marginTop: 4 }}>{al.message}</div>
                                    <div style={{ fontSize: 9, color: "#544", marginTop: 4 }}>{new Date(al.time).toLocaleTimeString()}</div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* QUOTA MONITOR */}
                    <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 20 }}>
                        <h3 style={{ margin: "0 0 15px 0", fontSize: 12, color: green, letterSpacing: 1 }}>API QUOTA MONITOR</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {rateLimits?.stats && Object.entries(rateLimits.stats).map(([model, s]) => (
                                <div key={model}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#fff", marginBottom: 4 }}>
                                        <span>{model.split('/').pop()}</span>
                                        <span>{s.hour}/{s.limits.hour} ph</span>
                                    </div>
                                    <div style={{ height: 4, background: "#1a253a", borderRadius: 2, overflow: "hidden" }}>
                                        <div style={{
                                            width: `${Math.min(100, (s.hour / s.limits.hour) * 100)}%`,
                                            height: "100%",
                                            background: (s.hour / s.limits.hour) > 0.8 ? orange : green
                                        }} />
                                    </div>
                                </div>
                            ))}
                            {!rateLimits?.stats && <div style={{ fontSize: 10, color: '#556' }}>Connecting to RateGuard...</div>}
                        </div>
                    </div>

                    {/* RECENT HISTORY */}
                    <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 20, flex: 1 }}>
                        <h3 style={{ margin: "0 0 15px 0", fontSize: 12, color: yellow, letterSpacing: 1 }}>EVENT SNAPSHOT</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {selectedSwarm?.history?.slice(0, 10).map((h, idx) => (
                                <div key={idx} style={{ fontSize: 10, paddingBottom: 10, borderBottom: `1px solid ${border}40` }}>
                                    <div style={{ color: h.event_type?.includes('FAIL') ? orange : green, fontWeight: 700 }}>{h.event_type}</div>
                                    <div style={{ color: "#889", marginTop: 2 }}>{h.message || h.description}</div>
                                </div>
                            )) || <div style={{ color: '#445' }}>No history found.</div>}
                        </div>
                    </div>
                </div>

            </div>

            {/* FULL RELAY LOG FOOTER */}
            <div style={{ marginTop: 20, background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                    <h3 style={{ margin: 0, fontSize: 13, color: '#667', textTransform: 'uppercase' }}>Full Relay Transmission Log (Raw Payload Analysis)</h3>
                    <button style={{ background: 'transparent', border: `1px solid ${cyan}`, color: cyan, borderRadius: 4, fontSize: 10, padding: '4px 8px', cursor: 'pointer' }}>Download JSON</button>
                </div>
                <div style={{ fontSize: 10, color: "#567", background: "#050810", padding: 15, borderRadius: 6, fontFamily: "monospace", maxHeight: 200, overflowY: "auto" }}>
                    {selectedSwarm ? JSON.stringify(selectedSwarm, null, 2) : "Select a swarm to view raw logs."}
                </div>
            </div>
        </div>
    );
};

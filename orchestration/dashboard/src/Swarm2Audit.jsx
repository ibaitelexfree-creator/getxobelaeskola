import React, { useState, useEffect } from 'react';

const colors = {
    cyan: "#00e5ff",
    green: "#00ff9f",
    orange: "#ff6b35",
    purple: "#b388ff",
    yellow: "#ffd600",
    dark: "#0a0e1a",
    card: "#0f1629",
    border: "#1e2d4a",
    text: "#aab",
    textHeader: "#fff"
};

const Swarm2Audit = () => {
    const [swarms, setSwarms] = useState([]);
    const [selectedSwarm, setSelectedSwarm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNewSwarm, setShowNewSwarm] = useState(false);
    const [newSwarmPrompt, setNewSwarmPrompt] = useState('');

    useEffect(() => {
        fetchSwarms();
        const interval = setInterval(fetchSwarms, 10000);
        return () => clearInterval(interval);
    }, []);

    const startNewSwarm = async () => {
        if (!newSwarmPrompt) return;
        try {
            await fetch('/api/v2/swarm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: newSwarmPrompt, name: "Web Dashboard Trigger" })
            });
            setNewSwarmPrompt('');
            setShowNewSwarm(false);
            fetchSwarms();
        } catch (err) {
            console.error("Failed to start swarm", err);
        }
    };

    const fetchSwarms = async () => {
        try {
            const res = await fetch('/api/v2/swarms');
            const data = await res.json();
            setSwarms(data);
            setLoading(false);
        } catch (err) {
            console.error("Fetch swarms failed", err);
        }
    };

    const fetchSwarmDetail = async (id) => {
        try {
            const res = await fetch(`/api/v2/swarms/${id}`);
            const data = await res.json();
            setSelectedSwarm(data);
        } catch (err) {
            console.error("Fetch swarm detail failed", err);
        }
    };

    const handleFeedback = async (auditId, type) => {
        const reason = type === 'negative' ? prompt("Razón del rechazo / blame (ej: Falla lógica en UI):") : "Positive feedback";
        if (type === 'negative' && !reason) return;

        try {
            const res = await fetch('/api/v1/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auditId,
                    feedbackType: type,
                    blameReason: reason,
                    blamedAgent: "Synthesizer", // default blame for now
                    blamedAgentNumber: 5
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Feedback ${type} registrado. ${type === 'negative' ? 'Grok RCA activado.' : ''}`);
                fetchSwarmDetail(selectedSwarm.id);
            }
        } catch (err) {
            console.error("Feedback failed", err);
        }
    };

    if (loading) return <div style={{ color: colors.cyan, padding: 20 }}>Cargando Audit Log...</div>;

    return (
        <div style={{ display: 'flex', gap: 20, padding: 20, height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
            {/* Sidebar: Swarm List */}
            <div style={{ width: 350, background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: 20, borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: 16, margin: 0, color: colors.cyan }}>🧬 Historial 2.0</h2>
                    <button
                        onClick={() => setShowNewSwarm(true)}
                        style={{
                            background: colors.green, color: '#000', border: 'none',
                            borderRadius: 4, padding: '4px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer'
                        }}
                    >
                        + NUEVO
                    </button>
                </div>

                {showNewSwarm && (
                    <div style={{ padding: 15, background: `${colors.green}10`, borderBottom: `1px solid ${colors.green}30` }}>
                        <textarea
                            value={newSwarmPrompt}
                            onChange={(e) => setNewSwarmPrompt(e.target.value)}
                            placeholder="¿Qué quieres implementar?"
                            style={{ width: '100%', background: '#000', border: `1px solid ${colors.green}`, color: '#fff', borderRadius: 4, padding: 8, fontSize: 11, minHeight: 60, marginBottom: 8 }}
                        />
                        <div style={{ display: 'flex', gap: 5 }}>
                            <button onClick={startNewSwarm} style={{ flex: 1, background: colors.green, border: 'none', borderRadius: 4, padding: 5, fontSize: 10, fontWeight: 700 }}>Iniciar</button>
                            <button onClick={() => setShowNewSwarm(false)} style={{ flex: 1, background: 'transparent', border: `1px solid ${colors.text}`, color: colors.text, borderRadius: 4, padding: 5, fontSize: 10 }}>Cancelar</button>
                        </div>
                    </div>
                )}

                <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
                    {swarms.map(s => (
                        <div
                            key={s.id}
                            onClick={() => fetchSwarmDetail(s.id)}
                            style={{
                                padding: '12px 15px',
                                marginBottom: 8,
                                borderRadius: 8,
                                cursor: 'pointer',
                                background: selectedSwarm?.id === s.id ? `${colors.cyan}10` : 'transparent',
                                border: `1px solid ${selectedSwarm?.id === s.id ? colors.cyan : colors.border}`,
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: colors.textHeader }}>#{s.id}</span>
                                <span style={{
                                    fontSize: 10, padding: '2px 6px', borderRadius: 4,
                                    background: s.status === 'COMPLETED' ? `${colors.green}30` : s.status === 'FAILED' ? `${colors.orange}30` : `${colors.purple}30`,
                                    color: s.status === 'COMPLETED' ? colors.green : s.status === 'FAILED' ? colors.orange : colors.purple
                                }}>
                                    {s.status}
                                </span>
                            </div>
                            <div style={{ fontSize: 11, color: colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {s.name}
                            </div>
                            <div style={{ fontSize: 9, color: '#556', marginTop: 5 }}>
                                {new Date(s.created_at).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content: Swarm Detail */}
            <div style={{ flex: 1, background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, overflowY: 'auto', padding: 30 }}>
                {!selectedSwarm ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#445', flexDirection: 'column' }}>
                        <span style={{ fontSize: 40 }}>🔎</span>
                        <p>Selecciona un enjambre para ver la auditoría</p>
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 }}>
                            <div>
                                <h1 style={{ margin: 0, fontSize: 24, color: colors.textHeader }}>{selectedSwarm.name}</h1>
                                <p style={{ color: colors.text, fontSize: 14 }}>Swarm ID: <span style={{ color: colors.cyan }}>{selectedSwarm.id}</span></p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 12, color: colors.text }}>Original Prompt</div>
                                <div style={{ fontSize: 11, background: '#000', padding: 10, borderRadius: 6, maxWidth: 400, color: colors.green }}>
                                    {selectedSwarm.metadata?.original_prompt || "No metadata"}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
                            {/* Tasks Trace */}
                            <div style={{ flex: 2 }}>
                                <h3 style={{ fontSize: 14, color: colors.purple, marginBottom: 15 }}>📋 Trazabilidad de Agentes</h3>
                                {selectedSwarm.tasks.map((t, idx) => (
                                    <div key={t.id} style={{
                                        background: '#161d31', padding: 15, borderRadius: 8, marginBottom: 10,
                                        borderLeft: `4px solid ${t.status === 'COMPLETED' ? colors.green : t.status === 'FAILED' ? colors.orange : colors.purple}`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <span style={{ fontWeight: 700, fontSize: 13 }}>{t.agent_role}</span>
                                            <span style={{ fontSize: 10, color: t.status === 'COMPLETED' ? colors.green : colors.orange }}>{t.status}</span>
                                        </div>
                                        {t.error_log && (
                                            <div style={{ fontSize: 11, background: '#200', padding: 10, color: '#f88', borderRadius: 4, marginBottom: 10, fontFamily: 'monospace' }}>
                                                ERROR: {t.error_log}
                                            </div>
                                        )}
                                        {t.request_payload && (
                                            <div style={{ fontSize: 10, color: '#889', fontFamily: 'monospace' }}>
                                                Session: {t.request_payload.sessionId || "N/A"}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Event Log */}
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: 14, color: colors.orange, marginBottom: 15 }}>🕒 Event Log</h3>
                                <div style={{ borderLeft: `1px solid ${colors.border}`, paddingLeft: 15 }}>
                                    {selectedSwarm.history.map((h, idx) => (
                                        <div key={idx} style={{ marginBottom: 15, position: 'relative' }}>
                                            <div style={{
                                                position: 'absolute', left: -21, top: 4, width: 10, height: 10,
                                                borderRadius: '50%', background: h.event_type.includes('FAIL') ? colors.orange : colors.cyan,
                                                boxShadow: `0 0 10px ${h.event_type.includes('FAIL') ? colors.orange : colors.cyan}`
                                            }} />
                                            <div style={{ fontSize: 11, fontWeight: 700 }}>{h.event_type}</div>
                                            <div style={{ fontSize: 10, color: colors.text }}>{h.message || h.description}</div>
                                            <div style={{ fontSize: 8, color: '#445' }}>{new Date(h.created_at || h.timestamp).toLocaleTimeString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Grok RCA Section if failed */}
                        {selectedSwarm.status === 'FAILED' && (
                            <div style={{ background: `${colors.orange}10`, border: `1px solid ${colors.orange}40`, padding: 20, borderRadius: 12, marginBottom: 30 }}>
                                <h3 style={{ margin: 0, color: colors.orange, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    🤖 Grok RCA (Root Cause Analysis)
                                </h3>
                                <p style={{ fontSize: 12, color: colors.text, lineHeight: '1.5', marginTop: 10 }}>
                                    "El agente UI falló debido a una inconsistencia en el schema detectada en el paso anterior.
                                    Sugerencia: Re-ejecutar fase DATA con validación estricta de FK."
                                </p>
                            </div>
                        )}

                        {/* Agent 6: Quality Auditor Section */}
                        {selectedSwarm.audits && selectedSwarm.audits.length > 0 && (
                            <div style={{ marginTop: 10, borderTop: `1px solid ${colors.border}`, paddingTop: 30 }}>
                                <h3 style={{ fontSize: 16, color: colors.cyan, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ filter: 'drop-shadow(0 0 5px ' + colors.cyan + ')' }}>🛡️</span> Agent 6: Quality Auditor Results
                                </h3>
                                {selectedSwarm.audits.map(audit => (
                                    <div key={audit.id} style={{ background: '#0a101e', padding: 20, borderRadius: 12, border: `1px solid ${colors.border}`, marginBottom: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                            <div style={{ display: 'flex', gap: 30 }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: 9, color: colors.text, letterSpacing: 1, marginBottom: 5 }}>SCORE</div>
                                                    <div style={{ fontSize: 26, fontWeight: 900, color: audit.audit_score >= 7 ? colors.green : colors.orange, textShadow: `0 0 10px ${audit.audit_score >= 7 ? colors.green : colors.orange}40` }}>{audit.audit_score}/10</div>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: 9, color: colors.text, letterSpacing: 1, marginBottom: 5 }}>SECURITY</div>
                                                    <div style={{ fontSize: 26, fontWeight: 900, color: audit.security_check === 'PASS' ? colors.green : colors.orange, textShadow: `0 0 10px ${audit.security_check === 'PASS' ? colors.green : colors.orange}40` }}>{audit.security_check}</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: 9, color: colors.text, letterSpacing: 1, marginBottom: 5 }}>RECOMMENDATION</div>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: colors.cyan, background: `${colors.cyan}15`, padding: '4px 10px', borderRadius: 4, display: 'inline-block' }}>{audit.recommendation}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 20, background: '#0e1425', padding: 15, borderRadius: 8 }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 10, color: colors.purple, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Missed Requirements</div>
                                                <ul style={{ margin: 0, paddingLeft: 15, fontSize: 11, color: colors.text, lineHeight: '1.6' }}>
                                                    {Array.isArray(audit.missed_requirements) ? audit.missed_requirements.map((req, i) => <li key={i}>{req}</li>) : <li>None detected.</li>}
                                                    {(!audit.missed_requirements || audit.missed_requirements.length === 0) && <li>None detected.</li>}
                                                </ul>
                                            </div>
                                            <div style={{ flex: 1, borderLeft: `1px solid ${colors.border}`, paddingLeft: 20 }}>
                                                <div style={{ fontSize: 10, color: colors.orange, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Qdrant Insights</div>
                                                <div style={{ fontSize: 11, color: audit.qdrant_conflict ? colors.orange : colors.green, display: 'flex', alignItems: 'center', gap: 5 }}>
                                                    {audit.qdrant_conflict ? "⚠️ Similarity to past failures detected!" : "✅ No previous conflicts found."}
                                                </div>
                                                {audit.qdrant_similar_failures?.length > 0 && (
                                                    <ul style={{ margin: '8px 0 0 15px', padding: 0, fontSize: 10, color: '#778', lineHeight: '1.4' }}>
                                                        {audit.qdrant_similar_failures.map((f, i) => <li key={i}>{f}</li>)}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>

                                        {/* Feedback Buttons */}
                                        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                            <button
                                                onClick={() => handleFeedback(audit.id, 'positive')}
                                                style={{ background: 'transparent', color: colors.green, border: `1px solid ${colors.green}50`, borderRadius: 6, padding: '6px 16px', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
                                                onMouseOver={(e) => e.currentTarget.style.background = `${colors.green}15`}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <span>👍</span> Approve
                                            </button>
                                            <button
                                                onClick={() => handleFeedback(audit.id, 'negative')}
                                                style={{ background: 'transparent', color: colors.orange, border: `1px solid ${colors.orange}50`, borderRadius: 6, padding: '6px 16px', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
                                                onMouseOver={(e) => e.currentTarget.style.background = `${colors.orange}15`}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <span>👎</span> Reject / Blame
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Swarm2Audit;

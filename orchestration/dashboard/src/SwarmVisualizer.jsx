import React, { useState } from "react";

const cyan = "#00e5ff";
const green = "#00ff9f";
const orange = "#ff6b35";
const purple = "#b388ff";
const yellow = "#ffd600";
const dark = "#0a0e1a";
const card = "#0f1629";
const border = "#1e2d4a";

const NodeTree = ({ plan, nodes, color }) => {
    const [expanded, setExpanded] = useState({});
    const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

    const renderNode = (node, depth = 0) => {
        const hasChildren = node.children && node.children.length > 0;
        const isOpen = expanded[node.id] !== false;
        const indent = depth * 16;

        return (
            <div key={node.id} style={{ marginLeft: indent }}>
                <div
                    onClick={() => hasChildren && toggle(node.id)}
                    style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "5px 10px",
                        marginBottom: 3, borderRadius: 6, cursor: hasChildren ? "pointer" : "default",
                        background: depth === 0 ? `${color}18` : "transparent",
                        border: depth === 0 ? `1px solid ${color}40` : "1px solid transparent",
                        transition: "all 0.2s",
                    }}
                >
                    {hasChildren && (
                        <span style={{ color, fontSize: 10, width: 12, transition: "transform 0.2s", display: "inline-block", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                    )}
                    {!hasChildren && <span style={{ width: 12, display: "inline-block" }} />}
                    <span style={{
                        fontSize: 10, padding: "2px 7px", borderRadius: 4,
                        background: `${color}25`, color, fontFamily: "monospace", whiteSpace: "nowrap"
                    }}>{node.type}</span>
                    <span style={{ fontSize: 11, color: depth === 0 ? "#fff" : "#aab", fontWeight: depth === 0 ? 600 : 400 }}>{node.label}</span>
                    {node.badge && (
                        <span style={{ marginLeft: "auto", fontSize: 9, padding: "1px 6px", borderRadius: 10, background: node.badgeColor || `${color}30`, color: node.badgeColor ? "#000" : color, fontWeight: 700 }}>
                            {node.badge}
                        </span>
                    )}
                </div>
                {hasChildren && isOpen && (
                    <div style={{ borderLeft: `1px dashed ${color}30`, marginLeft: 18, paddingLeft: 4 }}>
                        {node.children.map(c => renderNode(c, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ flex: 1, background: card, borderRadius: 12, border: `1px solid ${color}40`, padding: 20, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 4, height: 28, borderRadius: 2, background: color }} />
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color, letterSpacing: 1 }}>{plan}</div>
                    <div style={{ fontSize: 10, color: "#667" }}>Árbol de nodos n8n</div>
                </div>
            </div>
            <div style={{ overflowY: "auto", maxHeight: 600 }}>
                {nodes.map(n => renderNode(n))}
            </div>
        </div>
    );
};

const plan2Nodes = [
    {
        id: "p2-1", type: "WEBHOOK", label: "Entrada Telegram /cicd", badge: "TRIGGER", badgeColor: cyan, color: cyan,
        children: [
            {
                id: "p2-1-1", type: "HTTP", label: "Grok — Análisis tarea + Lee history BBDD",
                children: [
                    { id: "p2-1-1-1", type: "POSTGRES", label: "Leer últimos 10 swarms similares" },
                    { id: "p2-1-1-2", type: "CODE", label: "Decide: paralelo | secuencial", badge: "RCA" },
                ]
            },
            {
                id: "p2-1-2", type: "POSTGRES", label: "Crear swarm_id + lock + registro BBDD",
                children: [
                    { id: "p2-1-2-1", type: "IF", label: "¿Lock activo? → bloquear duplicados" },
                ]
            }
        ]
    },
    {
        id: "p2-2", type: "SWITCH", label: "Router: Modo Paralelo vs Secuencial", badge: "ORQUESTADOR",
        children: [
            {
                id: "p2-2-1", type: "HTTP", label: "Jules Architect — Grok 4.1 Fast",
                children: [
                    { id: "p2-2-1-1", type: "LOOP", label: "Retry 1/3 → 2/3 → 3/3" },
                    { id: "p2-2-1-2", type: "CODE", label: "Backoff exponencial: 10s → 30s → 90s", badge: "AUTO-HEAL" },
                    { id: "p2-2-1-3", type: "POSTGRES", label: "Guardar checkpoint + output" },
                ]
            },
            {
                id: "p2-2-2", type: "HTTP", label: "Jules Data Master — Grok 4.1 Fast",
                children: [
                    { id: "p2-2-2-1", type: "LOOP", label: "Retry 1/3 → 2/3 → 3/3" },
                    { id: "p2-2-2-2", type: "CODE", label: "Backoff exponencial: 10s → 30s → 90s", badge: "AUTO-HEAL" },
                    { id: "p2-2-2-3", type: "POSTGRES", label: "Guardar checkpoint + output" },
                ]
            },
            {
                id: "p2-2-3", type: "HTTP", label: "Jules UI — Grok 4.1 Fast",
                children: [
                    { id: "p2-2-3-1", type: "LOOP", label: "Retry 1/3 → 2/3 → 3/3" },
                    { id: "p2-2-3-2", type: "CODE", label: "Backoff exponencial: 10s → 30s → 90s", badge: "AUTO-HEAL" },
                    { id: "p2-2-3-3", type: "POSTGRES", label: "Guardar checkpoint + output" },
                ]
            }
        ]
    },
    {
        id: "p2-3", type: "ERROR", label: "Error Trigger — Sub-workflow global", badge: "SAFETY NET",
        children: [
            { id: "p2-3-1", type: "HTTP", label: "Grok 4 — RCA del error" },
            { id: "p2-3-2", type: "IF", label: "¿Reasignar experto? ¿Reintentar mismo?" },
            { id: "p2-3-3", type: "POSTGRES", label: "Update estado: RETRYING | BLOCKED" },
        ]
    },
    {
        id: "p2-4", type: "HTTP", label: "Grok 4 — Review final 30s antes de PR", badge: "VALIDACIÓN",
        children: [
            { id: "p2-4-1", type: "IF", label: "¿OK? → Merge | ¿Fixes? → HUMAN_REVIEW" },
            { id: "p2-4-2", type: "HTTP", label: "GitHub API — Merge feature + PR production" },
        ]
    },
    {
        id: "p2-5", type: "HTTP", label: "Jules UI — Telegram Inline Keyboard", badge: "NOTIF",
        children: [
            { id: "p2-5-1", type: "WEBHOOK", label: "Callback: merge | retry | cancel | reasignar" },
            { id: "p2-5-2", type: "POSTGRES", label: "Grok escribe lesson_learned en history" },
        ]
    },
    {
        id: "p2-6", type: "QDRANT", label: "🧠 RAG Qdrant — Contexto Git histórico", badge: "MEMORIA", badgeColor: purple,
        children: [
            { id: "p2-6-1", type: "HTTP", label: "Embed error actual → buscar en Qdrant" },
            { id: "p2-6-2", type: "CODE", label: "Top-5 soluciones similares de Git" },
            { id: "p2-6-3", type: "HTTP", label: "Inyectar contexto en prompt de Grok" },
        ]
    }
];

const plan3Nodes = [
    {
        id: "p3-1", type: "WEBHOOK", label: "Entrada GitHub Push / Telegram /cicd", badge: "TRIGGER", badgeColor: green,
        children: [
            { id: "p3-1-1", type: "REDIS", label: "Queue Mode — Encolar tarea", badge: "COLA" },
            { id: "p3-1-2", type: "POSTGRES", label: "Crear sesión UUID + registro BBDD" },
        ]
    },
    {
        id: "p3-2", type: "HTTP", label: "Grok / Gemini Flash — Clasificar tarea", badge: "ORQUESTADOR",
        children: [
            { id: "p3-2-1", type: "POSTGRES", label: "Leer memoria PostgreSQL LTM (sesión UUID)" },
            { id: "p3-2-2", type: "CODE", label: "Decidir: Arch + Data paralelo → UI secuencial" },
        ]
    },
    {
        id: "p3-3", type: "PARALLEL", label: "Fan-out: Ejecución Paralela", badge: "CONCURRENCIA",
        children: [
            {
                id: "p3-3-1", type: "HTTP", label: "Jules Architect — Gemini Flash",
                children: [
                    { id: "p3-3-1-1", type: "CODE", label: "Git diff → análisis seguridad + deuda técnica" },
                    { id: "p3-3-1-2", type: "HTTP", label: "Propone parche en rama self-healing" },
                    { id: "p3-3-1-3", type: "POSTGRES", label: "Voto de confianza → BBDD" },
                ]
            },
            {
                id: "p3-3-2", type: "HTTP", label: "Jules Data Master — Gemini Flash",
                children: [
                    { id: "p3-3-2-1", type: "POSTGRES", label: "Auditar migraciones PostgreSQL" },
                    { id: "p3-3-2-2", type: "CODE", label: "SQL correctivo si hay inconsistencia" },
                    { id: "p3-3-2-3", type: "POSTGRES", label: "Voto de confianza → BBDD" },
                ]
            }
        ]
    },
    {
        id: "p3-4", type: "HTTP", label: "Jules UI — Gemini Flash (tras Arch+Data)", badge: "SECUENCIAL",
        children: [
            { id: "p3-4-1", type: "CODE", label: "Build final + Tests UI" },
            { id: "p3-4-2", type: "POSTGRES", label: "Voto de confianza → BBDD" },
        ]
    },
    {
        id: "p3-5", type: "IF", label: "¿Los 3 votos OK?", badge: "CERTIFICACIÓN",
        children: [
            { id: "p3-5-1", type: "HTTP", label: "GitHub API — Merge + PR production" },
            { id: "p3-5-2", type: "S3", label: "Espejo auditoría inmutable (logs IA)" },
        ]
    },
    {
        id: "p3-6", type: "HTTP", label: "Jules UI — Telegram menú dinámico", badge: "NOTIF",
        children: [
            { id: "p3-6-1", type: "WEBHOOK", label: "Callback: aprobar | rollback | estadísticas" },
        ]
    },
    {
        id: "p3-7", type: "QDRANT", label: "🧠 RAG Qdrant — Contexto Git histórico", badge: "MEMORIA", badgeColor: purple,
        children: [
            { id: "p3-7-1", type: "HTTP", label: "Embed diff → buscar en Qdrant" },
            { id: "p3-7-2", type: "CODE", label: "Recuperar commits similares pasados" },
            { id: "p3-7-3", type: "HTTP", label: "Contexto en Gemini Flash prompt" },
        ]
    }
];

const QdrantCard = ({ color, plan, points }) => (
    <div style={{ background: `${color}08`, border: `1px solid ${color}30`, borderRadius: 10, padding: 16 }}>
        <div style={{ color, fontWeight: 700, marginBottom: 12, fontSize: 12, letterSpacing: 1 }}>{plan} + Qdrant</div>
        {points.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: 12 }}>{p.icon}</span>
                <span style={{ fontSize: 11, color: "#aab", lineHeight: 1.5 }}>{p.text}</span>
            </div>
        ))}
    </div>
);

const ProsCons = ({ plan, color, pros, contras }) => (
    <div style={{ background: card, borderRadius: 10, border: `1px solid ${color}30`, padding: 20 }}>
        <div style={{ color, fontWeight: 700, marginBottom: 16, fontSize: 13 }}>{plan}</div>
        <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: "#4a9", letterSpacing: 2, marginBottom: 8 }}>✅ PROS</div>
            {pros.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 11, color: "#aab" }}>
                    <span style={{ color: "#4a9", flexShrink: 0 }}>+</span>{p}
                </div>
            ))}
        </div>
        <div>
            <div style={{ fontSize: 10, color: "#e55", letterSpacing: 2, marginBottom: 8 }}>❌ CONTRAS</div>
            {contras.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 11, color: "#aab" }}>
                    <span style={{ color: "#e55", flexShrink: 0 }}>−</span>{c}
                </div>
            ))}
        </div>
    </div>
);

const SectionTitle = ({ icon, title }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: 0.5 }}>{title}</span>
        <div style={{ flex: 1, height: 1, background: border }} />
    </div>
);

const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: 12 };
const th = (color) => ({
    padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700,
    color: color || "#667", letterSpacing: 1,
    background: color ? `${color}15` : "#0d1424",
    borderBottom: `1px solid ${border}`,
});
const td = (color, bold) => ({
    padding: "9px 14px", color: color ? color : "#aab", fontWeight: bold ? 700 : 400,
    borderBottom: `1px solid ${border}10`, fontSize: 12,
});

const TableSection = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, marginBottom: 40 }}>
        {/* Puntuación individual */}
        <div>
            <SectionTitle icon="📊" title="Puntuación Individual" />
            <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={th()}>Criterio</th>
                            <th style={th(cyan)}>Plan 2 🚀 Mejorado</th>
                            <th style={th(green)}>Plan 3 📄 Estratégico</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ["Claridad arquitectural", "9/10", "9.5/10"],
                            ["Autonomía del sistema", "9.5/10", "9/10"],
                            ["Robustez ante fallos", "9.8/10", "8.5/10"],
                            ["Implementabilidad real", "8/10", "9.5/10"],
                            ["Control humano", "10/10", "9/10"],
                            ["Documentación/Trazabilidad", "8.5/10", "10/10"],
                            ["Inteligencia adaptativa", "9.5/10", "8/10"],
                        ].map(([label, p2, p3], i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? "#0d1424" : "transparent" }}>
                                <td style={td()}>{label}</td>
                                <td style={td(cyan)}>{p2}</td>
                                <td style={td(green)}>{p3}</td>
                            </tr>
                        ))}
                        <tr style={{ background: "#0d1830", fontWeight: 700 }}>
                            <td style={td()}>🏆 PUNTUACIÓN GLOBAL</td>
                            <td style={td(cyan, true)}>9.2/10</td>
                            <td style={td(green, true)}>9.1/10</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* Comparativa completa */}
        <div>
            <SectionTitle icon="⚡" title="Tabla Comparativa Completa" />
            <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={th()}>Factor</th>
                            <th style={th(cyan)}>Plan 2 🚀 Mejorado</th>
                            <th style={th(green)}>Plan 3 📄 Estratégico</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ["Factor Autonomía", "95%", "88%"],
                            ["Probabilidad de error", "8%", "15%"],
                            ["Tiempo implementación", "4–5 semanas", "3 semanas"],
                            ["Nodos n8n estimados", "45–60 nodos", "35–45 nodos"],
                            ["Flujos separados", "8–10 flujos", "6–8 flujos"],
                            ["Motor IA principal", "Grok 4 + Grok 4.1 Fast", "Gemini Flash modo fast"],
                            ["Sistema de retries", "Backoff exponencial 10s→30s→90s", "Secuencial estándar"],
                            ["Memoria histórica", "Grok aprende patrones activos", "PostgreSQL LTM persistente"],
                            ["Interfaz humana", "Botones inline Telegram ✅", "Menús dinámicos Telegram ✅"],
                            ["Concurrencia", "Lock por swarm_id + Redis", "Redis Queue Mode nativo"],
                            ["Auditoría", "Alta (history + lesson_learned)", "Espejo externo inmutable"],
                            ["Seguridad", "Scan secrets en build", "Específica para votación"],
                            ["RAG Qdrant Git", "Inyectado en RCA de Grok", "Inyectado en Gemini prompts"],
                        ].map(([label, p2, p3], i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? "#0d1424" : "transparent" }}>
                                <td style={td()}>{label}</td>
                                <td style={td(cyan)}>{p2}</td>
                                <td style={td(green)}>{p3}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Pros y contras */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <ProsCons
                plan="Plan 2 🚀 Mejorado"
                color={cyan}
                pros={[
                    "Grok con RCA real y memoria de patrones",
                    "Backoff exponencial → cero retries tontos",
                    "Botones inline Telegram nativos",
                    "Lock swarm_id elimina duplicados",
                    "Sistema auto-mejorante sin código extra",
                    "Review final de Grok antes del PR",
                    "RAG Qdrant potencia el RCA directamente",
                ]}
                contras={[
                    "Alta complejidad de implementación",
                    "Requiere Grok con acceso BBDD en tiempo real",
                    "Sin plan de rollback formal documentado",
                    "Más piezas que coordinar",
                ]}
            />
            <ProsCons
                plan="Plan 3 📄 Estratégico"
                color={green}
                pros={[
                    "Plan de implantación día a día muy concreto",
                    "Redis Queue Mode para paralelismo real",
                    "Espejo auditoría inmutable (crítico votación)",
                    "Gobernanza Git muy bien definida",
                    "Mejor para equipos grandes y auditorías",
                    "Sistema de votos de confianza multi-Jules",
                    "RAG Qdrant en cada análisis de diff",
                ]}
                contras={[
                    "Menos inteligencia adaptativa que Plan 2",
                    "Retries más simples sin backoff",
                    "Más burocrático para proyectos pequeños",
                    "Gemini menos potente que Grok para RCA",
                ]}
            />
        </div>

        {/* Costes */}
        <div>
            <SectionTitle icon="💰" title="Coste en Tokens" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{ background: card, borderRadius: 10, border: `1px solid ${border}`, padding: 20 }}>
                    <div style={{ color: cyan, fontWeight: 700, marginBottom: 14, fontSize: 13 }}>Plan 2 — Grok</div>
                    <table style={{ ...tableStyle, fontSize: 11 }}>
                        <thead><tr><th style={th()}>Modelo</th><th style={th(cyan)}>Input /M</th><th style={th(cyan)}>Output /M</th></tr></thead>
                        <tbody>
                            {[["Grok 4.1 Fast (Jules)", "$0.20", "$0.50"], ["Grok 4 (RCA + review)", "$3.00", "$15.00"], ["Batch API", "−50%", "−50%"], ["Caché prompts", "−75%", "—"]].map(([m, i, o], idx) => (
                                <tr key={idx} style={{ background: idx % 2 === 0 ? "#0d1424" : "transparent" }}>
                                    <td style={td()}>{m}</td><td style={td(cyan)}>{i}</td><td style={td(cyan)}>{o}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ background: card, borderRadius: 10, border: `1px solid ${border}`, padding: 20 }}>
                    <div style={{ color: green, fontWeight: 700, marginBottom: 14, fontSize: 13 }}>Coste por Swarm / Mensual</div>
                    <table style={{ ...tableStyle, fontSize: 11 }}>
                        <thead><tr><th style={th()}>Escenario</th><th style={th(green)}>Swarms/mes</th><th style={th(green)}>Coste</th></tr></thead>
                        <tbody>
                            {[["Uso ligero (1-2/día)", "~40", "$2–$5"], ["Uso medio (5-10/día)", "~200", "$10–$30"], ["Uso intenso + fallos", "~600", "$40–$100"], ["Con caché activado", "cualquiera", "−60% total"]].map(([e, s, c], idx) => (
                                <tr key={idx} style={{ background: idx % 2 === 0 ? "#0d1424" : "transparent" }}>
                                    <td style={td()}>{e}</td><td style={td(green)}>{s}</td><td style={td(green)}>{c}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* RAG Qdrant */}
        <div>
            <SectionTitle icon="🧠" title="¿Cómo encaja tu RAG de Qdrant con el Git?" />
            <div style={{ background: `${purple}12`, border: `1px solid ${purple}40`, borderRadius: 12, padding: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                    <QdrantCard color={cyan} plan="Plan 2" points={[
                        { icon: "1️⃣", text: "Jules detecta error → genera embedding del error" },
                        { icon: "2️⃣", text: "n8n llama Qdrant: busca los 5 errores más similares en tu historial Git" },
                        { icon: "3️⃣", text: "Recupera: commits que solucionaron ese patrón, archivos modificados, qué Jules lo resolvió" },
                        { icon: "4️⃣", text: "Inyecta contexto en el prompt de Grok para el RCA" },
                        { icon: "5️⃣", text: "Grok decide con memoria real: 'esta vez Architect falló igual en auth.ts → aplicar mismo fix'" },
                        { icon: "6️⃣", text: "Al cerrar el swarm, Grok escribe lesson_learned que también se vectoriza en Qdrant" },
                    ]} />
                    <QdrantCard color={green} plan="Plan 3" points={[
                        { icon: "1️⃣", text: "Webhook GitHub recibe push → extrae el diff completo" },
                        { icon: "2️⃣", text: "n8n vectoriza el diff y consulta Qdrant: commits similares pasados" },
                        { icon: "3️⃣", text: "Recupera: pull requests relacionadas, archivos de riesgo histórico, migraciones previas" },
                        { icon: "4️⃣", text: "Jules Architect recibe contexto RAG antes de analizar el código" },
                        { icon: "5️⃣", text: "Jules Data Master usa RAG para saber qué esquemas han fallado antes" },
                        { icon: "6️⃣", text: "Espejo de auditoría también se vectoriza → Qdrant crece con cada deploy" },
                    ]} />
                </div>
                <div style={{ background: `${purple}20`, borderRadius: 8, padding: 16, borderLeft: `3px solid ${purple}` }}>
                    <div style={{ color: purple, fontWeight: 700, marginBottom: 8, fontSize: 13 }}>🔑 IMPACTO REAL DEL RAG EN AMBOS PLANES</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                        {[
                            ["🎯 Error rate", "8% → 3%", "Con contexto histórico real"],
                            ["⚡ Tiempo RCA", "−70%", "No analiza desde cero, ya sabe"],
                            ["🔁 Retries evitados", "+40%", "Elige fix correcto al 1er intento"],
                        ].map(([icon, val, desc]) => (
                            <div key={icon} style={{ textAlign: "center", padding: 12, background: `${purple}15`, borderRadius: 8 }}>
                                <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                                <div style={{ color: purple, fontWeight: 700, fontSize: 16 }}>{val}</div>
                                <div style={{ color: "#889", fontSize: 10 }}>{desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const SwarmVisualizer = () => {
    const [tab, setTab] = useState("tables");

    return (
        <div style={{ background: dark, minHeight: "100vh", fontFamily: "'IBM Plex Mono', 'Courier New', monospace", color: "#ccd" }}>
            {/* Header */}
            <div style={{ background: card, borderBottom: `1px solid ${border}`, padding: "20px 32px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${cyan}, ${purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚙</div>
                <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>SWARM CI/CD 2.0</div>
                    <div style={{ fontSize: 10, color: "#557", letterSpacing: 2 }}>ANÁLISIS COMPARATIVO · PLAN 2 vs PLAN 3 + QDRANT RAG</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    {[["tables", "📊 Tablas + Análisis"], ["nodes", "🔧 Árboles de Nodos"]].map(([key, label]) => (
                        <button key={key} onClick={() => setTab(key)} style={{
                            padding: "8px 18px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: 1,
                            border: tab === key ? `1px solid ${cyan}` : `1px solid ${border}`,
                            background: tab === key ? `${cyan}20` : "transparent",
                            color: tab === key ? cyan : "#667",
                            transition: "all 0.2s",
                        }}>{label}</button>
                    ))}
                </div>
            </div>

            <div style={{ padding: "32px", maxWidth: 1400, margin: "0 auto" }}>
                {tab === "tables" && <TableSection />}
                {tab === "nodes" && (
                    <div>
                        <SectionTitle icon="🔧" title="Árboles de Nodos n8n — Side by Side" />
                        <div style={{ background: `${orange}10`, border: `1px solid ${orange}30`, borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 11, color: orange }}>
                            💡 Haz clic en cualquier nodo con ▶ para expandir/colapsar sus sub-nodos. Los nodos morados <span style={{ color: purple }}>🧠 QDRANT</span> son los puntos de integración con tu RAG de Git.
                        </div>
                        <div style={{ display: "flex", gap: 20 }}>
                            <NodeTree plan="Plan 2 🚀 — Grok + Backoff + RCA" nodes={plan2Nodes} color={cyan} />
                            <NodeTree plan="Plan 3 📄 — Gemini Flash + Queue + Auditoría" nodes={plan3Nodes} color={green} />
                        </div>

                        {/* Leyenda de tipos */}
                        <div style={{ marginTop: 24, background: card, borderRadius: 10, border: `1px solid ${border}`, padding: 20 }}>
                            <SectionTitle icon="📌" title="Leyenda de Tipos de Nodo" />
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                {[
                                    ["WEBHOOK", cyan, "Entrada HTTP / Telegram"],
                                    ["HTTP", "#4fc3f7", "Llamada API (Grok/Gemini/GitHub)"],
                                    ["POSTGRES", "#81c784", "Base de datos PostgreSQL"],
                                    ["REDIS", "#ff8a65", "Cola de mensajes / Lock"],
                                    ["CODE", "#fff176", "Lógica JS personalizada"],
                                    ["IF", "#f48fb1", "Condición / Router"],
                                    ["LOOP", "#ce93d8", "Bucle de reintentos"],
                                    ["ERROR", "#ef9a9a", "Error Trigger sub-workflow"],
                                    ["PARALLEL", "#80deea", "Ejecución paralela fan-out"],
                                    ["SWITCH", "#ffe082", "Router multi-ruta"],
                                    ["S3", "#a5d6a7", "Almacenamiento auditoría"],
                                    ["QDRANT", purple, "RAG vectorial de tu Git"],
                                ].map(([type, color, desc]) => (
                                    <div key={type} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: `${color}10`, borderRadius: 6, border: `1px solid ${color}30` }}>
                                        <span style={{ fontSize: 10, padding: "2px 6px", background: `${color}25`, color, borderRadius: 4, fontFamily: "monospace" }}>{type}</span>
                                        <span style={{ fontSize: 10, color: "#778" }}>{desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Diferencias clave entre árboles */}
                        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                            {[
                                { color: cyan, title: "Plan 2 — Lo que tiene de único", items: ["Error Trigger global como safety net", "Backoff exponencial en cada Jules", "Grok RCA decide reasignación inteligente", "Checkpoint por Jules (reanuda sin empezar)", "Lesson_learned al final del swarm"] },
                                { color: green, title: "Plan 3 — Lo que tiene de único", items: ["Redis Queue Mode desde el primer nodo", "Fan-out paralelo nativo (Arch + Data)", "Sistema de votos de confianza 3 Jules", "Espejo S3 inmutable para auditoría", "UUID de sesión en cada Pull Request"] },
                            ].map(({ color, title, items }) => (
                                <div key={title} style={{ background: `${color}08`, border: `1px solid ${color}30`, borderRadius: 10, padding: 16 }}>
                                    <div style={{ color, fontWeight: 700, fontSize: 12, marginBottom: 12 }}>{title}</div>
                                    {items.map((item, i) => (
                                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 11, color: "#aab" }}>
                                            <span style={{ color, flexShrink: 0 }}>→</span>{item}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer recomendación */}
                <div style={{ background: `${yellow}10`, border: `1px solid ${yellow}30`, borderRadius: 12, padding: 20, marginTop: 20 }}>
                    <div style={{ color: yellow, fontWeight: 700, marginBottom: 10, fontSize: 13 }}>🏆 RECOMENDACIÓN FINAL: Híbrido Plan 2 + Plan 3 + Qdrant</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                        {[
                            { color: cyan, label: "Del Plan 2 tomar", items: ["Grok 4 para RCA", "Backoff exponencial", "Lock swarm_id", "Lesson_learned activo"] },
                            { color: green, label: "Del Plan 3 tomar", items: ["Redis Queue Mode", "Espejo auditoría S3", "Sistema votos Jules", "UUID por sesión PR"] },
                            { color: purple, label: "Qdrant en ambos", items: ["Embedding de errores", "Top-5 fixes similares", "Contexto en prompts", "Se vectoriza al cerrar"] },
                        ].map(({ color, label, items }) => (
                            <div key={label} style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 8, padding: 14 }}>
                                <div style={{ color, fontSize: 11, fontWeight: 700, marginBottom: 10 }}>{label}</div>
                                {items.map((item, i) => <div key={i} style={{ fontSize: 11, color: "#aab", marginBottom: 5 }}>✓ {item}</div>)}
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 14, padding: 12, background: `${yellow}15`, borderRadius: 8, fontSize: 12, color: "#ccc" }}>
                        Con esta combinación: <span style={{ color: yellow, fontWeight: 700 }}>% Error → ~3% · Autonomía → ~97% · Coste mensual → $15–$50</span> · Y los créditos xAI cubren los primeros meses gratis.
                    </div>
                </div>
            </div>
        </div>
    );
};

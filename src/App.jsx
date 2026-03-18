import { useState, useEffect, useRef } from "react";

const STAGES = [
  { id: "problems", num: 1, icon: "🔍", label: "Customer Problems + Insight", color: "#7C3AED", tagline: "Ground everything in reality.",
    aiPrompts: ["Synthesize these pain points into a sharp insight statement", "What unmet need is hiding beneath these pain points?", "How would a 10x solution address these problems?", "What pattern connects all these customer pain points?"],
    fields: [
      { key: "painPoints", label: "Key Customer Pain Points", placeholder: "What are the top pain points customers are experiencing?\ne.g. Long wait times, confusing onboarding, lack of proactive communication...", multi: true, rows: 4 },
      { key: "unmetNeeds", label: "Unmet Needs", placeholder: "What do customers need that isn't being met?\ne.g. They need to feel informed at every step without having to ask...", multi: true, rows: 3 },
      { key: "insightStatements", label: "Insight Statements", placeholder: "Synthesize your findings into insight statements.\ne.g. 'Customers don't mind waiting — they mind not knowing why they're waiting.'", multi: true, rows: 3 },
    ]
  },
  { id: "ideation", num: 2, icon: "💡", label: "Moonshot Ideation", color: "#2563EB", tagline: "Push beyond incremental thinking.",
    aiPrompts: ["Generate 5 bold 10x ideas for this problem", "What's the 'impossible' experience we should design toward?", "How would we solve this if the current system didn't exist?", "What cross-industry analogy could inspire a breakthrough here?"],
    fields: [
      { key: "tenxIdeas", label: "10x Ideas", placeholder: "What are your boldest, most ambitious ideas?\ne.g. A self-resolving support system that predicts issues before customers notice them...", multi: true, rows: 4 },
      { key: "impossibleExperiences", label: '"Impossible" Experiences', placeholder: "What experience would feel like magic to the customer?\ne.g. Zero-effort onboarding where the product configures itself to each user...", multi: true, rows: 3 },
      { key: "boldHypotheses", label: "Bold Hypotheses", placeholder: "What bold hypotheses emerge from your ideation?\ne.g. If we eliminate step 3 entirely, NPS will increase by 20+ points...", multi: true, rows: 3 },
    ]
  },
  { id: "experimentdesign", num: 3, icon: "🧪", label: "Experiment Design", color: "#059669", tagline: "Turn ideas into testable bets.",
    aiPrompts: ["Help me write a sharp hypothesis statement", "What's the minimum viable test for this idea?", "What success metrics matter most here?", "What could invalidate this experiment before it starts?"],
    fields: [
      { key: "hypothesis", label: "Hypothesis", placeholder: "State your testable hypothesis.\ne.g. 'We believe that proactive status updates will reduce inbound support contacts by 40%.'", multi: true, rows: 3 },
      { key: "successMetrics", label: "Success Metrics", placeholder: "How will you measure success?\ne.g. CSAT: baseline 3.6 → target 4.2 | Response time: 8hrs → 2hrs | Resolution rate: 62% → 80%", multi: true, rows: 3 },
      { key: "testPlan", label: "Test Plan", placeholder: "How will you run the experiment?\ne.g. Pilot with 200 users over 3 weeks using a shadow system alongside current process...", multi: true, rows: 4 },
    ]
  },
  { id: "prototype", num: 4, icon: "🛠️", label: "Rapid Prototype", color: "#D97706", tagline: "Make it real — fast and scrappy.",
    aiPrompts: ["What's the scrappiest way to prototype this?", "What does a pilot-ready concept look like?", "What assumptions does this prototype need to validate?", "How do we make this testable in 5 days or less?"],
    fields: [
      { key: "mockups", label: "Mockups / Flows / Lightweight Builds", placeholder: "Describe or link your prototype artifacts.\ne.g. Figma wireframes of the new status update flow, Loom walkthrough, paper prototype photos...", multi: true, rows: 4 },
      { key: "pilotConcept", label: "Pilot-Ready Concept", placeholder: "Describe the concept ready for piloting.\ne.g. A WhatsApp notification system that sends proactive updates at 3 key journey stages...", multi: true, rows: 4 },
    ]
  },
  { id: "roadmap", num: 5, icon: "🗺️", label: "Experiment Roadmap", color: "#0891B2", tagline: "Plan execution.",
    aiPrompts: ["Help me build a realistic experiment timeline", "Who should own each part of this rollout?", "What are the biggest execution risks?", "How do we phase this rollout to reduce risk?"],
    fields: [
      { key: "timeline", label: "Timeline", placeholder: "Outline your experiment timeline.\ne.g. Week 1: Setup & brief team | Week 2–3: Pilot with segment A | Week 4: Measure & analyse...", multi: true, rows: 4 },
      { key: "owners", label: "Owners", placeholder: "Who is responsible for what?\ne.g. Sprint Lead: Miriam | Tech: Dev team | Customer comms: CX Manager | Data: Analytics lead...", multi: true, rows: 3 },
      { key: "rolloutPlan", label: "Rollout Plan", placeholder: "How will you scale from pilot to full rollout?\ne.g. Phase 1: 200 users | Phase 2: Full segment (2,000) | Phase 3: All customers if metrics hit...", multi: true, rows: 3 },
    ]
  },
  { id: "learn", num: 6, icon: "🎯", label: "Learn, Decide, Iterate", color: "#DC2626", tagline: "Lessons learned. What's next?",
    aiPrompts: ["Help me synthesise what worked and what didn't", "What's the validated learning from this experiment?", "How do I frame a kill or iterate decision positively?", "What would Astro Teller say about these results?"],
    decisionPaths: [
      { id: "scale", label: "Scale It", icon: "🚀", color: "#059669", desc: "Pour fuel on this." },
      { id: "iterate", label: "Iterate", icon: "🔄", color: "#D97706", desc: "Refine and re-test." },
      { id: "kill", label: "Kill It", icon: "💀", color: "#DC2626", desc: "Celebrate the learning." }
    ],
    fields: [
      { key: "whatWorked", label: "What Worked / What Didn't", placeholder: "Be honest and specific.\ne.g. Worked: Proactive SMS updates reduced inbound calls by 32%. Didn't: Email open rates were too low...", multi: true, rows: 4 },
      { key: "validatedLearning", label: "Validated Learning", placeholder: "What do you now know that you didn't before?\ne.g. Customers respond better to channel X than Y. The pain point was timing, not content...", multi: true, rows: 3 },
    ]
  },
];

const TEMPLATES = [
  { id: "cx", label: "CX Innovation", icon: "✨", desc: "Customer Experience transformation" },
  { id: "service", label: "Service Design", icon: "🗺️", desc: "Service blueprint redesign" },
  { id: "program", label: "Customer Program", icon: "🏗️", desc: "Program design & innovation" },
  { id: "blank", label: "Moonshot Sprint", icon: "🚀", desc: "Open-ended 10x innovation" },
];

const ARTIFACT_TYPES = [
  { id: "journey", label: "Customer Journey Map", icon: "🗺️", color: "#7C3AED", desc: "Stages, touchpoints, pain points, emotional curve" },
  { id: "blueprint", label: "Service Blueprint", icon: "📐", color: "#2563EB", desc: "Frontstage, backstage, support systems, failure points" },
  { id: "persona", label: "Customer Personas", icon: "👤", color: "#059669", desc: "Needs, behaviors, emotional states, jobs-to-be-done" },
  { id: "hmw", label: "HMW Bank", icon: "💡", color: "#D97706", desc: "Living How Might We question library" },
  { id: "insights", label: "Insight Repository", icon: "🧠", color: "#0891B2", desc: "Key insights accumulated across sprints" },
  { id: "custom", label: "Custom Artifact", icon: "📄", color: "#6B7280", desc: "Upload or create your own artifact" },
];

const ARTIFACT_TEMPLATES = {
  journey: `# Customer Journey Map\n\n## Customer: [Persona Name]\n## Scenario: [Job-to-be-done]\n\n---\n\n### Stage 1 — Awareness\n- **Touchpoints:** \n- **Customer Actions:** \n- **Thoughts/Feelings:** \n- **Pain Points:** \n- **Opportunities:** \n\n### Stage 2 — Consideration\n- **Touchpoints:** \n- **Customer Actions:** \n- **Thoughts/Feelings:** \n- **Pain Points:** \n- **Opportunities:** \n\n### Stage 3 — Decision\n- **Touchpoints:** \n- **Customer Actions:** \n- **Thoughts/Feelings:** \n- **Pain Points:** \n- **Opportunities:** \n\n---\n\n## Moments of Truth\n1. \n2. \n3. \n\n## Emotional Curve Summary\n[Describe the overall emotional arc]`,
  blueprint: `# Service Blueprint\n\n## Service: [Service Name]\n## Customer Scenario: [Scenario]\n\n---\n\n### FRONTSTAGE (Customer-Visible)\n\n| Stage | Customer Action | Touchpoint | Employee Action |\n|-------|----------------|-----------|-----------------||\n| | | | |\n\n---\n\n### BACKSTAGE (Invisible to Customer)\n\n| Stage | Backstage Process | Supporting Systems | Failure Points |\n|-------|------------------|-------------------|----------------|\n| | | | |\n\n---\n\n## Key Failure Points\n1. \n2. \n3. `,
  persona: `# Customer Persona\n\n## Name: [Persona Name]\n## Archetype: [e.g. "The Overwhelmed Manager"]\n\n---\n\n### Goals & Motivations\n- \n- \n\n### Frustrations & Pain Points\n- \n- \n\n### Jobs-to-be-Done\n- **Functional:** \n- **Emotional:** \n- **Social:** \n\n### Quote\n> "[A quote that captures their worldview]"`,
  hmw: `# HMW (How Might We) Bank\n\n## Project: [Project Name]\n\n---\n\n### 🔴 High Priority HMWs\n- HMW \n- HMW \n\n### 💡 Wild & Bold\n- HMW \n- HMW \n\n---\n\n## Retired HMWs\n- `,
  insights: `# Insight Repository\n\n## Project: [Project Name]\n\n---\n\n### Sprint 1 Insights\n**Key Findings:**\n- \n**Surprises:**\n- \n\n---\n\n### Patterns Across Sprints\n- \n\n### Golden Nuggets\n1. \n2. `,
  custom: `# [Artifact Title]\n\n## Purpose\n[Describe what this artifact is for]\n\n---\n\n## Content\n\n[Add your content here]`,
};

const INNOVATION_TIPS = [
  "🚀 10x is often easier than 10% — audacity unlocks creative energy",
  "🎯 Fall in love with the problem, not your solution",
  "⚔️ Kill signals are a gift — they free you to find better ideas",
  "🌟 Wild ideas are data — log every one as a potential breakthrough signal",
  "🤩 Chase Holy S**t moments over clear milestones",
  "🛡️ Psychological safety is infrastructure, not a perk",
];

const uid = () => Date.now() + Math.random();

const getDecisionPath = (decisionId) => {
  const learnStage = STAGES.find(s => s.id === "learn");
  return learnStage?.decisionPaths?.find(p => p.id === decisionId) || null;
};

function Inp({ value, onChange, placeholder, multiline, rows = 3 }) {
  const base = { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", lineHeight: 1.6, fontFamily: "Inter,sans-serif" };
  return multiline
    ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{ ...base, resize: "vertical" }} />
    : <input value={value} onChange={onChange} placeholder={placeholder} style={base} />;
}

function HoverCard({ children, color, onClick, style = {} }) {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${h && color ? color + "88" : "rgba(255,255,255,0.1)"}`, borderRadius: 16, padding: 22, cursor: onClick ? "pointer" : "default", transition: "border-color 0.2s", ...style }}>
      {children}
    </div>
  );
}

function AIAssistant({ stage, template, sprintName, hypothesis }) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [prompt, setPrompt] = useState("");
  const s = STAGES.find(x => x.id === stage);
  const tmpl = TEMPLATES.find(t => t.id === template)?.label || "Moonshot Sprint";
  const ask = async (q) => {
    const userQ = q || prompt;
    if (!userQ.trim()) return;
    setLoading(true); setResponse(""); setPrompt("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `You are a Moonshot Sprint Partner — expert in Google X methodology, Service Design, CX Innovation. Sprint: "${sprintName}" | Template: ${tmpl} | Stage: ${s?.label}${hypothesis ? `\nHypothesis: "${hypothesis}"` : ""}. Be bold, push 10x thinking. 3-4 punchy sections with emojis.`,
          messages: [{ role: "user", content: userQ }],
        }),
      });
      const data = await res.json();
      setResponse(data.content?.map(b => b.text || "").join("") || "Try again!");
    } catch { setResponse("⚡ Connection issue — try again!"); }
    setLoading(false);
  };
  return (
    <div style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", borderRadius: 16, padding: 22, color: "#fff", border: "1px solid rgba(124,58,237,0.3)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ fontSize: 26 }}>🤖</div>
        <div><div style={{ fontWeight: 800 }}>Moonshot AI Partner</div><div style={{ fontSize: 11, opacity: 0.5 }}>Stage {s?.num}: {s?.label}</div></div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
        {(s?.aiPrompts || []).map(q => <button key={q} onClick={() => ask(q)} style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#c4b5fd", borderRadius: 20, padding: "5px 12px", fontSize: 11, cursor: "pointer" }}>{q}</button>)}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => e.key === "Enter" && ask()} placeholder={`Ask about ${s?.label}...`} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none" }} />
        <button onClick={() => ask()} style={{ background: "#1e1b4b", border: "1px solid rgba(124,58,237,0.5)", borderRadius: 10, padding: "10px 18px", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Ask</button>
      </div>
      {loading && <div style={{ textAlign: "center", padding: 16, opacity: 0.6 }}>🚀 Thinking in 10x mode...</div>}
      {response && <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 16, fontSize: 13, lineHeight: 1.75, maxHeight: 300, overflowY: "auto", whiteSpace: "pre-wrap" }}>{response}</div>}
    </div>
  );
}

function HealthScore({ sd }) {
  const checks = [
    !!sd?.problems?.painPoints,
    !!sd?.ideation?.tenxIdeas,
    !!sd?.experimentdesign?.hypothesis,
    !!sd?.prototype?.pilotConcept,
    !!sd?.roadmap?.timeline,
    !!sd?.decision,
  ];
  const overall = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const color = overall >= 70 ? "#059669" : overall >= 40 ? "#D97706" : "#7C3AED";
  return (
    <div style={{ background: "linear-gradient(135deg,#0f0c29,#302b63)", borderRadius: 16, padding: 22, color: "#fff" }}>
      <div style={{ fontSize: 11, opacity: 0.5, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Innovation Health</div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 48, fontWeight: 900, color, lineHeight: 1 }}>{overall}</div>
        <div><div style={{ fontWeight: 700, color }}>{overall >= 70 ? "Moonshot Ready 🚀" : overall >= 40 ? "Building Signal ⚡" : "Exploring 🌱"}</div><div style={{ fontSize: 11, opacity: 0.4 }}>Sprint completion</div></div>
      </div>
      {STAGES.map((s, i) => (
        <div key={s.id} style={{ marginBottom: 9 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
            <span style={{ opacity: 0.6 }}>{s.icon} {s.label}</span>
            <span style={{ color: checks[i] ? s.color : "rgba(255,255,255,0.3)" }}>{checks[i] ? "✓" : "—"}</span>
          </div>
          <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3 }}>
            <div style={{ height: "100%", width: checks[i] ? "100%" : "0%", background: s.color, borderRadius: 3, transition: "width 0.5s" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function StageContent({ stageId, sd, setSd }) {
  const stage = STAGES.find(s => s.id === stageId);
  const sc = stage?.color || "#7C3AED";
  const upd = (key, val) => setSd(p => ({ ...p, [stageId]: { ...(p?.[stageId] || {}), [key]: val } }));

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {(stage?.fields || []).map(f => (
        <div key={f.key} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{f.label}</div>
          <div style={{ fontSize: 12, opacity: 0.45, marginBottom: 12, lineHeight: 1.7 }}>
            {f.placeholder.split("\n").map((line, i) => <div key={i}>{line}</div>)}
          </div>
          <Inp value={sd?.[stageId]?.[f.key] || ""} onChange={e => upd(f.key, e.target.value)} placeholder="Enter your response here..." multiline={f.multi} rows={f.rows} />
        </div>
      ))}
      {stageId === "learn" && (
        <div style={{ background: `${sc}10`, border: `1px solid ${sc}44`, borderRadius: 14, padding: 22 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Decision</div>
          <div style={{ fontSize: 12, opacity: 0.45, marginBottom: 16 }}>Based on your learnings — what's the call?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {(stage?.decisionPaths || []).map(path => (
              <div key={path.id} onClick={() => setSd(p => ({ ...p, decision: path.id }))}
                style={{ background: sd?.decision === path.id ? `${path.color}22` : "rgba(255,255,255,0.04)", border: `2px solid ${sd?.decision === path.id ? path.color : "rgba(255,255,255,0.1)"}`, borderRadius: 14, padding: "18px 12px", cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{path.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: sd?.decision === path.id ? path.color : "#fff" }}>{path.label}</div>
                <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>{path.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceCanvas({ project, artifacts, setArtifacts, sprintData, projectSprints }) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [openArtifact, setOpenArtifact] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const fileRef = useRef();

  const projArtifacts = artifacts[project.id] || [];

  const addArtifact = (type, content = "", name = "", fromUpload = false, fromTemplate = false) => {
    const atype = ARTIFACT_TYPES.find(t => t.id === type);
    const art = { id: uid(), type, name: name || atype?.label, content: content || ARTIFACT_TEMPLATES[type] || "", fromUpload, fromTemplate, created: new Date().toLocaleDateString(), updatedAt: new Date().toLocaleDateString() };
    setArtifacts(prev => ({ ...prev, [project.id]: [...(prev[project.id] || []), art] }));
    setShowAdd(false); setSelectedType(null); setOpenArtifact(art.id);
  };

  const updateArtifact = (id, content) => setArtifacts(prev => ({ ...prev, [project.id]: prev[project.id].map(a => a.id === id ? { ...a, content, updatedAt: new Date().toLocaleDateString() } : a) }));
  const deleteArtifact = (id) => { setArtifacts(prev => ({ ...prev, [project.id]: prev[project.id].filter(a => a.id !== id) })); if (openArtifact === id) setOpenArtifact(null); };

  const handleUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => addArtifact(selectedType || "custom", ev.target.result, file.name, true);
    reader.readAsText(file);
  };

  const generateFromTemplate = async (type) => {
    const atype = ARTIFACT_TYPES.find(t => t.id === type);
    setAiLoading(true);
    const sprintCtx = projectSprints.map(sp => {
      const sd = sprintData[sp.id] || {};
      return `Sprint: "${sp.name}" | Pain Points: "${sd.problems?.painPoints || ""}" | Hypothesis: "${sd.experimentdesign?.hypothesis || ""}" | Learnings: "${sd.learn?.validatedLearning || ""}"`;
    }).join("\n");
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1500,
          system: `You are an expert Service Designer. Generate a rich, partially pre-filled ${atype?.label} template. Use sprint context to make it specific. Leave sections for the user to complete with [bracket placeholders]. Format clearly in markdown.`,
          messages: [{ role: "user", content: `Project: "${project.name}" | Client: "${project.client || ""}" | Goal: "${project.goal || ""}"\n\nSprint context:\n${sprintCtx || "No sprints yet"}\n\nGenerate a ${atype?.label} template.` }],
        }),
      });
      const data = await res.json();
      const content = data.content?.map(b => b.text || "").join("") || ARTIFACT_TEMPLATES[type];
      addArtifact(type, content, "", false, true);
    } catch { addArtifact(type, "", "", false, true); }
    setAiLoading(false);
  };

  const getSuggestion = async () => {
    setAiLoading(true); setAiSuggestion(""); setShowSuggestion(true);
    const sprintCtx = projectSprints.map(sp => {
      const sd = sprintData[sp.id] || {};
      return `Sprint "${sp.name}": PainPoints="${sd.problems?.painPoints || ""}" Hypothesis="${sd.experimentdesign?.hypothesis || ""}" Learning="${sd.learn?.validatedLearning || ""}" Decision="${sd.decision || ""}"`;
    }).join("\n");
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 800,
          system: `You are a Service Design expert. Based on sprint activity, suggest specific artifact updates. Be concrete. Max 4 suggestions, 2-3 sentences each.`,
          messages: [{ role: "user", content: `Project: "${project.name}"\nExisting artifacts: ${projArtifacts.map(a => a.name).join(", ") || "none"}\n\nSprint activity:\n${sprintCtx || "No sprint data yet"}\n\nWhat artifact updates would you recommend?` }],
        }),
      });
      const data = await res.json();
      setAiSuggestion(data.content?.map(b => b.text || "").join("") || "Complete some sprint stages first to get suggestions.");
    } catch { setAiSuggestion("⚡ Connection issue — try again!"); }
    setAiLoading(false);
  };

  const openArt = projArtifacts.find(a => a.id === openArtifact);

  if (openArt) return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setOpenArtifact(null)} style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8, padding: "6px 14px", color: "#fff", cursor: "pointer", fontSize: 12 }}>← Back</button>
        <div style={{ fontSize: 20 }}>{ARTIFACT_TYPES.find(t => t.id === openArt.type)?.icon}</div>
        <div style={{ fontWeight: 700 }}>{openArt.name}</div>
        <div style={{ fontSize: 11, opacity: 0.4, marginLeft: 8 }}>Updated {openArt.updatedAt}</div>
        <button onClick={() => deleteArtifact(openArt.id)} style={{ marginLeft: "auto", background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, padding: "5px 12px", color: "#f87171", cursor: "pointer", fontSize: 11 }}>Delete</button>
      </div>
      <textarea value={openArt.content} onChange={e => updateArtifact(openArt.id, e.target.value)}
        style={{ width: "100%", minHeight: 500, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 20, color: "#fff", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: openArt.fromTemplate ? "Calibri,'Gill Sans',sans-serif" : "ui-monospace,monospace", lineHeight: 1.8 }} />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
        <div><div style={{ fontWeight: 800, fontSize: 17 }}>🗂️ Service Canvas</div><div style={{ fontSize: 12, opacity: 0.45, marginTop: 3 }}>Living artifacts for {project.name}</div></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={getSuggestion} style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.35)", borderRadius: 10, padding: "9px 16px", color: "#c4b5fd", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✨ Smart Suggestions</button>
          <button onClick={() => setShowAdd(true)} style={{ background: "#1e1b4b", border: "1px solid rgba(124,58,237,0.5)", borderRadius: 10, padding: "9px 16px", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Add Artifact</button>
        </div>
      </div>
      {showSuggestion && (
        <div style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 14, padding: 20, marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>✨ AI Artifact Suggestions</div>
            <button onClick={() => setShowSuggestion(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
          {aiLoading ? <div style={{ opacity: 0.5, fontSize: 13 }}>🔍 Analysing your sprint activity...</div>
            : <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", opacity: 0.85 }}>{aiSuggestion}</div>}
        </div>
      )}
      {projArtifacts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 18 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🗂️</div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No artifacts yet</div>
          <div style={{ fontSize: 13, opacity: 0.4, marginBottom: 24 }}>Upload a document or generate an AI-powered template.</div>
          <button onClick={() => setShowAdd(true)} style={{ background: "#1e1b4b", border: "1px solid rgba(124,58,237,0.5)", borderRadius: 10, padding: "11px 24px", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>+ Add First Artifact</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 14 }}>
          {projArtifacts.map(art => {
            const atype = ARTIFACT_TYPES.find(t => t.id === art.type);
            return (
              <HoverCard key={art.id} color={atype?.color} onClick={() => setOpenArtifact(art.id)}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, background: `${atype?.color}22`, border: `1px solid ${atype?.color}44`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{atype?.icon}</div>
                  {art.fromUpload && <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 20, padding: "2px 8px", fontSize: 10, opacity: 0.6 }}>📎 Uploaded</div>}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{art.name}</div>
                <div style={{ fontSize: 11, opacity: 0.45, marginBottom: 12, lineHeight: 1.5 }}>{atype?.desc}</div>
                <div style={{ fontSize: 11, color: atype?.color, opacity: 0.7 }}>Updated {art.updatedAt}</div>
              </HoverCard>
            );
          })}
          <div onClick={() => setShowAdd(true)} style={{ background: "rgba(124,58,237,0.03)", border: "1px dashed rgba(124,58,237,0.2)", borderRadius: 16, padding: 22, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 150 }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(124,58,237,0.2)"}>
            <div style={{ fontSize: 26, opacity: 0.4 }}>＋</div>
            <div style={{ fontSize: 12, color: "#a78bfa", opacity: 0.65, fontWeight: 600 }}>Add Artifact</div>
          </div>
        </div>
      )}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 24 }}>
          <div style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 560, border: "1px solid rgba(124,58,237,0.3)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>Add Service Artifact</div>
            <div style={{ fontSize: 12, opacity: 0.4, marginBottom: 22 }}>Choose a type, then upload or generate with AI</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 22 }}>
              {ARTIFACT_TYPES.map(t => (
                <div key={t.id} onClick={() => setSelectedType(t.id)} style={{ background: selectedType === t.id ? `${t.color}22` : "rgba(255,255,255,0.04)", border: `1px solid ${selectedType === t.id ? t.color : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 22 }}>{t.icon}</div>
                  <div><div style={{ fontSize: 12, fontWeight: 700 }}>{t.label}</div><div style={{ fontSize: 10, opacity: 0.4, marginTop: 2 }}>{t.desc}</div></div>
                </div>
              ))}
            </div>
            {selectedType && (
              <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 11, opacity: 0.4, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>How would you like to add it?</div>
                <button onClick={() => fileRef.current?.click()} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "14px 16px", color: "#fff", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 24 }}>📎</div>
                  <div><div style={{ fontWeight: 700, fontSize: 13 }}>Upload a Document</div><div style={{ fontSize: 11, opacity: 0.45 }}>Upload a .txt, .md, or .csv file</div></div>
                </button>
                <input ref={fileRef} type="file" accept=".txt,.md,.csv,.json" onChange={handleUpload} style={{ display: "none" }} />
                <button onClick={() => generateFromTemplate(selectedType)} disabled={aiLoading} style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.35)", borderRadius: 12, padding: "14px 16px", color: "#fff", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, opacity: aiLoading ? 0.6 : 1 }}>
                  <div style={{ fontSize: 24 }}>✨</div>
                  <div><div style={{ fontWeight: 700, fontSize: 13 }}>Generate AI-Powered Template</div><div style={{ fontSize: 11, opacity: 0.45 }}>Pre-filled using your sprint context · Editable · Calibri font</div></div>
                </button>
                <button onClick={() => addArtifact(selectedType, "", "", false, true)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "14px 16px", color: "#fff", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 24 }}>📄</div>
                  <div><div style={{ fontWeight: 700, fontSize: 13 }}>Start with Blank Template</div><div style={{ fontSize: 11, opacity: 0.45 }}>Standard template structure · Calibri font</div></div>
                </button>
              </div>
            )}
            {aiLoading && <div style={{ textAlign: "center", padding: 12, color: "#a78bfa", fontSize: 13 }}>✨ Generating template from your sprint context...</div>}
            <button onClick={() => { setShowAdd(false); setSelectedType(null); }} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, padding: 12, color: "#fff", cursor: "pointer", marginTop: 4 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("projects");
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [projectTab, setProjectTab] = useState("sprints");
  const [activeSprint, setActiveSprint] = useState(null);
  const [activeStage, setActiveStage] = useState("problems");
  const [activeTab, setActiveTab] = useState("stage");
  const [tip, setTip] = useState(0);
  const [sprintData, setSprintData] = useState({});
  const [artifacts, setArtifacts] = useState({});
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewSprint, setShowNewSprint] = useState(false);
  const [npForm, setNpForm] = useState({ name: "", type: "", client: "", goal: "" });
  const [nsForm, setNsForm] = useState({ name: "", template: "cx", goal: "" });

  useEffect(() => { const t = setInterval(() => setTip(p => (p + 1) % INNOVATION_TIPS.length), 5000); return () => clearInterval(t); }, []);

  const setSd = (sprintId, updater) => setSprintData(prev => ({ ...prev, [sprintId]: typeof updater === "function" ? updater(prev[sprintId] || {}) : { ...(prev[sprintId] || {}), ...updater } }));
  const createProject = () => {
    if (!npForm.name.trim()) return;
    setProjects(prev => [...prev, { id: uid(), ...npForm, sprints: [], created: new Date().toLocaleDateString() }]);
    setShowNewProject(false); setNpForm({ name: "", type: "", client: "", goal: "" });
  };
  const createSprint = () => {
    if (!nsForm.name.trim()) return;
    const s = { id: uid(), ...nsForm, created: new Date().toLocaleDateString() };
    setProjects(prev => prev.map(p => p.id === activeProject.id ? { ...p, sprints: [...(p.sprints || []), s] } : p));
    setActiveProject(prev => ({ ...prev, sprints: [...(prev.sprints || []), s] }));
    setShowNewSprint(false); setNsForm({ name: "", template: "cx", goal: "" });
  };
  const openSprint = (sprint) => { setActiveSprint(sprint); setActiveStage("problems"); setActiveTab("stage"); setView("sprint"); };
  const sd = sprintData[activeSprint?.id] || {};
  const setActiveSd = (updater) => setSd(activeSprint?.id, updater);

  // ── PROJECTS ───────────────────────────────────────────────────────────────
  if (view === "projects") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0d0d1a 0%,#1a1040 100%)", fontFamily: "Inter,sans-serif", color: "#fff" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, background: "linear-gradient(90deg,#a78bfa,#60a5fa,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>🚀 Moonshot Sprint Partner</div>
            <div style={{ fontSize: 12, opacity: 0.4, marginTop: 4 }}>Service Design · CX Innovation · Customer Program Design · Google X Methodology</div>
          </div>
          <button onClick={() => setShowNewProject(true)} style={{ background: "#1e1b4b", border: "1px solid rgba(124,58,237,0.5)", borderRadius: 12, padding: "11px 22px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ New Project</button>
        </div>
        <div style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 10, padding: "9px 16px", fontSize: 12, color: "#c4b5fd", marginBottom: 32 }}>{INNOVATION_TIPS[tip]}</div>
        {projects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 20 }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🌌</div>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>No projects yet</div>
            <div style={{ fontSize: 14, opacity: 0.4, marginBottom: 28 }}>Create your first project to start running Moonshot Sprints.</div>
            <button onClick={() => setShowNewProject(true)} style={{ background: "#1e1b4b", border: "1px solid rgba(124,58,237,0.5)", borderRadius: 12, padding: "12px 28px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>+ Create First Project</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 11, opacity: 0.35, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Projects</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
              {projects.map(p => {
                const artCount = (artifacts[p.id] || []).length;
                return (
                  <HoverCard key={p.id} color="#7C3AED" onClick={() => { setActiveProject(p); setProjectTab("sprints"); setView("project"); }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <div style={{ width: 44, height: 44, background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.35)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏢</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <div style={{ background: "rgba(124,58,237,0.15)", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#a78bfa" }}>{p.sprints?.length || 0} sprints</div>
                        {artCount > 0 && <div style={{ background: "rgba(8,145,178,0.15)", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#22d3ee" }}>{artCount} artifacts</div>}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{p.name}</div>
                    {p.client && <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 4 }}>{p.client}</div>}
                    {p.goal && <div style={{ fontSize: 12, opacity: 0.45, marginBottom: 12, lineHeight: 1.5 }}>{p.goal}</div>}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                      <div style={{ fontSize: 11, color: "#fff", opacity: 0.3 }}>{p.created}</div>
                      <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>Open →</div>
                    </div>
                  </HoverCard>
                );
              })}
              <div onClick={() => setShowNewProject(true)} style={{ background: "rgba(124,58,237,0.04)", border: "1px dashed rgba(124,58,237,0.25)", borderRadius: 16, padding: 22, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 160 }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(124,58,237,0.55)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(124,58,237,0.25)"}>
                <div style={{ fontSize: 28, opacity: 0.5 }}>＋</div>
                <div style={{ fontSize: 13, color: "#a78bfa", opacity: 0.7, fontWeight: 600 }}>New Project</div>
              </div>
            </div>
          </>
        )}
      </div>
      {showNewProject && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 500, border: "1px solid rgba(124,58,237,0.3)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>🏢 New Project</div>
            <div style={{ fontSize: 13, opacity: 0.4, marginBottom: 24 }}>A project holds sprints and service artifacts</div>
            <div style={{ display: "grid", gap: 16 }}>
              {[["PROJECT NAME *", "name", "e.g. Customer Onboarding Transformation", false], ["CLIENT / TEAM", "client", "e.g. Acme Corp", false], ["PROJECT TYPE", "type", "e.g. Service Design · CX Innovation", false], ["GOAL / NORTH STAR", "goal", "What's the 10x ambition?", true]].map(([lbl, key, ph, multi]) => (
                <div key={key}>
                  <label style={{ fontSize: 11, opacity: 0.45, letterSpacing: 1.5, display: "block", marginBottom: 6 }}>{lbl}</label>
                  <Inp value={npForm[key]} onChange={e => setNpForm(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} multiline={multi} rows={2} />
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowNewProject(false)} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, padding: 13, color: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={createProject} style={{ flex: 2, background: "#1e1b4b", border: "1px solid rgba(124,58,237,0.5)", borderRadius: 10, padding: 13, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>Create Project →</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── PROJECT ────────────────────────────────────────────────────────────────
  if (view === "project") {
    const proj = projects.find(p => p.id === activeProject?.id) || activeProject;
    const projSprints = proj.sprints || [];
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0d0d1a 0%,#1a1040 100%)", fontFamily: "Inter,sans-serif", color: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 13 }}>
            <button onClick={() => setView("projects")} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", padding: 0 }}>Projects</button>
            <span style={{ opacity: 0.3 }}>›</span>
            <span style={{ opacity: 0.7 }}>{proj.name}</span>
          </div>
          <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 16, padding: 24, marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{proj.name}</div>
              {proj.client && <div style={{ fontSize: 13, opacity: 0.5 }}>{proj.client}{proj.type ? ` · ${proj.type}` : ""}</div>}
              {proj.goal && <div style={{ fontSize: 13, opacity: 0.6, marginTop: 6, lineHeight: 1.5 }}>🎯 {proj.goal}</div>}
            </div>
            {projectTab === "sprints" && <button onClick={() => setShowNewSprint(true)} style={{ background: "#1e1b4b", border: "1px solid rgba(124,58,237,0.5)", borderRadius: 12, padding: "11px 20px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>+ New Sprint</button>}
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
            {[["sprints", "🔬 Sprints", projSprints.length], ["canvas", "🗂️ Service Canvas", (artifacts[proj.id] || []).length]].map(([id, lbl, count]) => (
              <button key={id} onClick={() => setProjectTab(id)} style={{ background: projectTab === id ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.04)", border: `1px solid ${projectTab === id ? "#7C3AED" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: "10px 20px", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: projectTab === id ? 700 : 400, display: "flex", alignItems: "center", gap: 8 }}>
                {lbl} <span style={{ background: projectTab === id ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.1)", borderRadius: 20, padding: "1px 8px", fontSize: 11 }}>{count}</span>
              </button>
            ))}
          </div>
          {projectTab === "sprints" && (
            projSprints.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 24px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 20 }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🔬</div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No sprints yet</div>
                <div style={{ fontSize: 14, opacity: 0.4, marginBottom: 24 }}>Launch your first sprint inside this project.</div>
                <button onClick={() => setShowNewSprint(true)} style={{ background: "#1e1b4b", border: "1px solid rgba(124,58,237,0.5)", borderRadius: 12, padding: "11px 24px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Launch First Sprint</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
                {projSprints.map(sprint => {
                  const ssd = sprintData[sprint.id] || {};
                  const tmpl = TEMPLATES.find(t => t.id === sprint.template);
                  const dp = getDecisionPath(ssd.decision);
                  const filledCount = [!!ssd.problems?.painPoints, !!ssd.ideation?.tenxIdeas, !!ssd.experimentdesign?.hypothesis, !!ssd.prototype?.pilotConcept, !!ssd.roadmap?.timeline, !!ssd.decision].filter(Boolean).length;
                  return (
                    <HoverCard key={sprint.id} color="#2563EB" onClick={() => openSprint(sprint)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div style={{ fontSize: 26 }}>{tmpl?.icon}</div>
                        {dp && <div style={{ background: `${dp.color}22`, border: `1px solid ${dp.color}55`, borderRadius: 20, padding: "2px 9px", fontSize: 11, color: dp.color, fontWeight: 700 }}>{dp.icon} {dp.label}</div>}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{sprint.name}</div>
                      <div style={{ fontSize: 11, opacity: 0.45, marginBottom: 12 }}>{tmpl?.label}</div>
                      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                        {STAGES.map((s, i) => <div key={s.id} title={s.label} style={{ flex: 1, height: 4, borderRadius: 2, background: i < filledCount ? s.color : "rgba(255,255,255,0.1)" }} />)}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div style={{ fontSize: 11, color: "#fff", opacity: 0.3 }}>{sprint.created}</div>
                        <div style={{ fontSize: 12, color: "#60a5fa", fontWeight: 600 }}>Open →</div>
                      </div>
                    </HoverCard>
                  );
                })}
                <div onClick={() => setShowNewSprint(true)} style={{ background: "rgba(37,99,235,0.04)", border: "1px dashed rgba(37,99,235,0.25)", borderRadius: 16, padding: 22, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 150 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(37,99,235,0.55)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(37,99,235,0.25)"}>
                  <div style={{ fontSize: 26, opacity: 0.5 }}>＋</div>
                  <div style={{ fontSize: 13, color: "#60a5fa", opacity: 0.7, fontWeight: 600 }}>New Sprint</div>
                </div>
              </div>
            )
          )}
          {projectTab === "canvas" && <ServiceCanvas project={proj} artifacts={artifacts} setArtifacts={setArtifacts} sprintData={sprintData} projectSprints={projSprints} />}
        </div>
        {showNewSprint && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
            <div style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 500, border: "1px solid rgba(37,99,235,0.3)" }}>
              <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>🔬 New Sprint</div>
              <div style={{ fontSize: 13, opacity: 0.4, marginBottom: 24 }}>Inside: {proj.name}</div>
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, opacity: 0.45, letterSpacing: 1.5, display: "block", marginBottom: 6 }}>SPRINT NAME *</label>
                  <Inp value={nsForm.name} onChange={e => setNsForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Reduce resolution time 10x" />
                </div>
                <div>
                  <label style={{ fontSize: 11, opacity: 0.45, letterSpacing: 1.5, display: "block", marginBottom: 8 }}>SPRINT TEMPLATE</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {TEMPLATES.map(t => (
                      <div key={t.id} onClick={() => setNsForm(p => ({ ...p, template: t.id }))} style={{ background: nsForm.template === t.id ? "rgba(37,99,235,0.25)" : "rgba(255,255,255,0.04)", border: `1px solid ${nsForm.template === t.id ? "#2563EB" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer" }}>
                        <div style={{ fontSize: 18 }}>{t.icon}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>{t.label}</div>
                        <div style={{ fontSize: 10, opacity: 0.4, marginTop: 2 }}>{t.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, opacity: 0.45, letterSpacing: 1.5, display: "block", marginBottom: 6 }}>SPRINT GOAL & SMART CRITERIA</label>
                  <Inp value={nsForm.goal} onChange={e => setNsForm(p => ({ ...p, goal: e.target.value }))} placeholder="Specific, Measurable, Achievable, Relevant, Time-bound..." multiline rows={2} />
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button onClick={() => setShowNewSprint(false)} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, padding: 13, color: "#fff", cursor: "pointer" }}>Cancel</button>
                  <button onClick={createSprint} style={{ flex: 2, background: "#1e1b4b", border: "1px solid rgba(37,99,235,0.5)", borderRadius: 10, padding: 13, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>Launch Sprint →</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── SPRINT ─────────────────────────────────────────────────────────────────
  const proj = projects.find(p => p.id === activeProject?.id) || activeProject;
  const stage = STAGES.find(s => s.id === activeStage);
  const sc = stage?.color || "#7C3AED";
  const dp = getDecisionPath(sd?.decision);

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", fontFamily: "Inter,sans-serif", color: "#fff" }}>
      <div style={{ background: "linear-gradient(90deg,#0f0c29,#1a1040)", padding: "11px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap" }}>
        <button onClick={() => setView("projects")} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontSize: 12, padding: 0 }}>Projects</button>
        <span style={{ opacity: 0.3, fontSize: 12 }}>›</span>
        <button onClick={() => setView("project")} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontSize: 12, padding: 0 }}>{proj?.name}</button>
        <span style={{ opacity: 0.3, fontSize: 12 }}>›</span>
        <span style={{ fontSize: 12, opacity: 0.7 }}>{activeSprint?.name}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {[["stage", "📋 Stage"], ["ai", "🤖 AI"], ["health", "🌡️ Health"], ["brief", "📄 Brief"]].map(([id, lbl]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{ background: activeTab === id ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.05)", border: `1px solid ${activeTab === id ? "#7C3AED" : "transparent"}`, borderRadius: 8, padding: "6px 12px", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: activeTab === id ? 700 : 400 }}>{lbl}</button>
          ))}
        </div>
      </div>
      <div style={{ background: "#0f0c29", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "9px 20px", display: "flex", gap: 6, overflowX: "auto" }}>
        {STAGES.map(s => (
          <button key={s.id} onClick={() => setActiveStage(s.id)} style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: activeStage === s.id ? `${s.color}22` : "rgba(255,255,255,0.04)", border: `1px solid ${activeStage === s.id ? s.color : "rgba(255,255,255,0.1)"}`, borderRadius: 9, padding: "7px 13px", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: activeStage === s.id ? 700 : 400 }}>
            {s.icon} {s.num}. {s.label}
          </button>
        ))}
      </div>
      <div style={{ padding: "20px 24px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ background: `${sc}18`, border: `1px solid ${sc}44`, borderRadius: 14, padding: "14px 20px", marginBottom: 22, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 32 }}>{stage?.icon}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>Stage {stage?.num}: {stage?.label}</div>
            <div style={{ fontSize: 13, opacity: 0.5, marginTop: 2 }}>{stage?.tagline}</div>
          </div>
        </div>
        {activeTab === "stage" && <StageContent stageId={activeStage} sd={sd} setSd={setActiveSd} />}
        {activeTab === "ai" && <AIAssistant stage={activeStage} template={activeSprint?.template} sprintName={activeSprint?.name} hypothesis={sd?.experimentdesign?.hypothesis} />}
        {activeTab === "health" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <HealthScore sd={sd} />
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 22 }}>
              <div style={{ fontWeight: 700, marginBottom: 16 }}>📋 Sprint Snapshot</div>
              {[["Template", TEMPLATES.find(t => t.id === activeSprint?.template)?.label],
                ["Pain Points", sd?.problems?.painPoints],
                ["10x Ideas", sd?.ideation?.tenxIdeas],
                ["Hypothesis", sd?.experimentdesign?.hypothesis],
                ["Pilot Concept", sd?.prototype?.pilotConcept],
                ["Decision", dp?.label]].map(([lbl, val]) => (
                <div key={lbl} style={{ padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 12 }}>
                  <div style={{ fontSize: 12, opacity: 0.4, width: 120, flexShrink: 0 }}>{lbl}</div>
                  <div style={{ fontSize: 13, opacity: val ? 1 : 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{val || "Not set"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "brief" && (
          <div style={{ background: "linear-gradient(135deg,#0f0c29,#1a1a2e)", borderRadius: 16, padding: 28, border: "1px solid rgba(124,58,237,0.2)" }}>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 2 }}>{activeSprint?.name}</div>
            <div style={{ fontSize: 13, opacity: 0.4, marginBottom: 24 }}>{proj?.name} · {TEMPLATES.find(t => t.id === activeSprint?.template)?.label}</div>
            {[["🎯 Sprint Goal", activeSprint?.goal],
              ["🔍 Key Pain Points", sd?.problems?.painPoints],
              ["💡 Unmet Needs", sd?.problems?.unmetNeeds],
              ["🧠 Insight Statements", sd?.problems?.insightStatements],
              ["🚀 10x Ideas", sd?.ideation?.tenxIdeas],
              ["✨ Impossible Experiences", sd?.ideation?.impossibleExperiences],
              ["💡 Bold Hypotheses", sd?.ideation?.boldHypotheses],
              ["🧪 Hypothesis", sd?.experimentdesign?.hypothesis],
              ["📊 Success Metrics", sd?.experimentdesign?.successMetrics],
              ["🛠️ Pilot Concept", sd?.prototype?.pilotConcept],
              ["🗺️ Timeline", sd?.roadmap?.timeline],
              ["👥 Owners", sd?.roadmap?.owners],
              ["✅ What Worked", sd?.learn?.whatWorked],
              ["🧠 Validated Learning", sd?.learn?.validatedLearning]].map(([lbl, val]) => val ? (
              <div key={lbl} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, opacity: 0.35, letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>{lbl}</div>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "11px 16px", fontSize: 14, lineHeight: 1.6 }}>{val}</div>
              </div>
            ) : null)}
            {dp && (
              <div style={{ marginTop: 20, background: `${dp.color}18`, border: `1px solid ${dp.color}44`, borderRadius: 14, padding: 18, textAlign: "center" }}>
                <div style={{ fontSize: 32 }}>{dp.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 18, marginTop: 6 }}>Decision: {dp.label}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

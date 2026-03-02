import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import p5 from "p5";
import {
  Box, Grid, Paper, Stack, Typography, Tooltip, IconButton, useTheme,
} from "@mui/material";
import RestartAltIcon   from "@mui/icons-material/RestartAlt";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowIcon    from "@mui/icons-material/PlayArrow";
import PauseIcon        from "@mui/icons-material/Pause";
import ContentCopyIcon  from "@mui/icons-material/ContentCopy";

const stepSoundFile    = "/DSA/step.mp3";
const successSoundFile = "/DSA/success.mp3";
const failSoundFile    = "/DSA/fail.mp3";

const getExampleColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  return {
    nodeFill: {
      default:   isDark ? "#1e3a5f" : "#dbeafe",
      highlight: isDark ? "#ca8a04" : "#fde68a",
      inserted:  isDark ? "#5b21b6" : "#ddd6fe",
      found:     isDark ? "#166534" : "#bbf7d0",
      lcp:       isDark ? "#065f46" : "#a7f3d0",
      branch:    isDark ? "#7c2d12" : "#fed7aa",
    },
    nodeStroke: {
      default:   isDark ? "#60a5fa" : "#3b82f6",
      highlight: isDark ? "#fbbf24" : "#d97706",
      inserted:  isDark ? "#a78bfa" : "#7c3aed",
      found:     isDark ? "#4ade80" : "#16a34a",
      lcp:       isDark ? "#10b981" : "#059669",
      branch:    isDark ? "#f97316" : "#ea580c",
    },
    edgeColor:  isDark ? "#475569" : "#94a3b8",
    edgeActive: isDark ? "#fbbf24" : "#d97706",
    edgeLcp:    isDark ? "#10b981" : "#059669",
    textColor:  isDark ? "#f1f5f9" : "#1e293b",
    background: {
      canvas:  isDark ? "#000000" : "#ffffff",
      default: isDark ? "linear-gradient(135deg,#000000 0%,#0a0a0a 100%)"
                      : "linear-gradient(135deg,#f0f2f5 0%,#e0e7ff 100%)",
      paper:   isDark ? "#000000" : "#ffffff",
      surface: isDark ? "rgba(0,0,0,0.95)" : "rgba(255,255,255,0.95)",
    },
    text: {
      primary:   isDark ? "#f1f5f9" : "#2c3e50",
      secondary: isDark ? "#94a3b8" : "#7f8c8d",
    },
    stepListBox: {
      background: isDark ? "linear-gradient(145deg,#000000,#0a0a0a)"
                         : "linear-gradient(145deg,#e2e8f0,#f8fafc)",
      boxShadow:  isDark
        ? "inset 4px 4px 8px #000000, inset -4px -4px 8px #1a1a1a"
        : "inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff",
      scrollbarThumb: isDark ? "#333333" : "#bdc3c7",
    },
    legendBackground: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)",
    iconButton: {
      background:      isDark ? "#0a0a0a" : "#ffffff",
      border:          isDark ? "#333333" : "#e0e0e0",
      hoverBackground: isDark ? "#1a1a1a" : "#f0f2f5",
    },
    paper: {
      boxShadow: isDark ? "0 8px 32px 0 rgba(0,0,0,0.3)"
                        : "0 8px 32px 0 rgba(44,62,80,0.12)",
    },
  };
};

const NODE_R    = 20;
const LEVEL_GAP = 65;

class TrieNode {
  constructor(char = "") { this.char = char; this.children = {}; this.isEnd = false; this.state = "default"; this.x = 0; this.y = 0; }
}

function cloneTrie(node) {
  if (!node) return null;
  const n = new TrieNode(node.char);
  n.isEnd = node.isEnd; n.state = node.state; n.x = node.x; n.y = node.y;
  for (const [k, v] of Object.entries(node.children)) n.children[k] = cloneTrie(v);
  return n;
}

function countLeaves(node) {
  const keys = Object.keys(node.children);
  if (!keys.length) return 1;
  return keys.reduce((s, k) => s + countLeaves(node.children[k]), 0);
}

function assignPositions(node, W, depth = 0, x0 = 0, x1 = null) {
  if (x1 === null) x1 = W;
  node.x = (x0 + x1) / 2; node.y = 50 + depth * LEVEL_GAP;
  const keys = Object.keys(node.children).sort(), tot = countLeaves(node);
  let cur = x0;
  for (const k of keys) {
    const child = node.children[k], frac = countLeaves(child) / tot;
    assignPositions(child, W, depth + 1, cur, cur + frac * (x1 - x0));
    cur += frac * (x1 - x0);
  }
}

function resetStates(node) {
  node.state = "default";
  for (const k of Object.keys(node.children)) resetStates(node.children[k]);
}

function buildAllSteps(words) {
  const steps = [];
  const root  = new TrieNode("");
  function snap(msg, sound) { steps.push({ trie: cloneTrie(root), msg, sound }); }

  snap(`Example: find LCP of ${words.map(w => `"${w}"`).join(", ")}`, "step");

  // Insert
  for (const word of words) {
    snap(`--- Inserting "${word}" ---`, "step");
    let node = root;
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      node.state = "highlight";
      snap(`At "${node.char || "root"}" — following '${ch}'`, "step");
      if (!node.children[ch]) {
        node.children[ch] = new TrieNode(ch);
        node.children[ch].state = "inserted";
        snap(`New node '${ch}' created`, "step");
      } else {
        node.children[ch].state = "highlight";
        snap(`Node '${ch}' already exists`, "step");
      }
      node.state = "default";
      node = node.children[ch];
    }
    node.isEnd = true; node.state = "inserted";
    snap(`"${word}" — end-of-word ★`, "success");
    resetStates(root);
    snap(`Trie after inserting "${word}"`, null);
  }

  // LCP traversal
  snap("All words inserted. Traversing for LCP...", "step");
  let curr = root, lcp = "";

  while (curr) {
    curr.state = "highlight";
    snap(`At node "${curr.char || "root"}" — checking: is end-of-word? does it branch?`, "step");

    if (curr.isEnd) {
      curr.state = "branch";
      snap(`"${curr.char}" is end-of-word — a complete word ends here. LCP stops`, "fail");
      break;
    }

    const keys = Object.keys(curr.children);
    if (!keys.length) {
      curr.state = "lcp";
      snap(`Leaf node reached. LCP traversal ends`, "step");
      break;
    }

    if (keys.length > 1) {
      curr.state = "branch";
      snap(`BRANCH POINT at "${curr.char || "root"}" — children: ${keys.sort().join(", ")}. LCP stops here`, "fail");
      break;
    }

    const ch = keys[0];
    curr.state = "lcp";
    lcp += ch;
    snap(`Single child '${ch}' → LCP grows to "${lcp}"`, "step");
    curr.children[ch].state = "highlight";
    snap(`Moving to node '${ch}'`, "step");
    curr = curr.children[ch];
  }

  // Final highlight
  resetStates(root);
  let p = root;
  for (const ch of lcp) {
    p.state = "lcp"; p = p.children[ch]; p.state = "lcp";
  }
  snap(
    lcp.length
      ? `✅ Longest Common Prefix = "${lcp}"`
      : `✅ Longest Common Prefix = "" (no common prefix)`,
    "success"
  );

  return steps;
}

// ─── Component ─────────────────────────────────────────────────────────────────
const LCP_EX1 = () => {
  const theme   = useTheme();
  const colors  = getExampleColors(theme);
  const colorsRef = useRef(colors);
  useEffect(() => { colorsRef.current = colors; }, [colors]);

  const sketchRef   = useRef();
  const stepListRef = useRef(null);
  const toastRef    = useRef();
  const audioRefs   = useRef({});

  const [status,    setStatus]    = useState("Ready");
  const [stepList,  setStepList]  = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDone,    setIsDone]    = useState(false);

  const stateRef = useRef({ steps: [], stepIndex: 0, running: false, paused: true });
  useEffect(() => { if (stepListRef.current) stepListRef.current.scrollTop = stepListRef.current.scrollHeight; }, [stepList]);

  useLayoutEffect(() => {
    audioRefs.current.step    = new Audio(stepSoundFile);
    audioRefs.current.success = new Audio(successSoundFile);
    audioRefs.current.fail    = new Audio(failSoundFile);

    const playSound = (t) => {
      if (!t || !audioRefs.current[t]) return;
      audioRefs.current[t].currentTime = 0; audioRefs.current[t].play().catch(() => {});
    };

    const WORDS = ["flower", "flow", "flight"];
    const displayTrieRef = { current: new TrieNode("") };

    const sketch = (p) => {
      p.setup = () => {
        const cont = sketchRef.current;
        p.createCanvas(cont.offsetWidth, cont.offsetHeight).parent(cont);
        p.textAlign(p.CENTER, p.CENTER);
        p.reset();
      };

      p.draw = () => {
        const c = colorsRef.current;
        p.background(c.background.canvas);
        assignPositions(displayTrieRef.current, p.width);
        drawTrie(p, displayTrieRef.current, c);
        const s = stateRef.current;
        if (s.running && !s.paused && p.frameCount % 35 === 0) performStep();
      };

      function drawTrie(p, node, c) {
        for (const k of Object.keys(node.children).sort()) {
          const child = node.children[k];
          const bothLcp    = node.state === "lcp" && child.state === "lcp";
          const bothActive = !bothLcp && node.state !== "default" && child.state !== "default";
          p.stroke(bothLcp ? c.edgeLcp : bothActive ? c.edgeActive : c.edgeColor);
          p.strokeWeight(bothLcp ? 3 : bothActive ? 2.5 : 1.5);
          p.line(node.x, node.y, child.x, child.y);
          drawTrie(p, child, c);
        }
        if (node.char !== "") {
          p.fill(c.nodeFill[node.state] || c.nodeFill.default);
          p.stroke(c.nodeStroke[node.state] || c.nodeStroke.default);
          p.strokeWeight(node.state !== "default" ? 2.5 : 1.5);
          p.ellipse(node.x, node.y, NODE_R * 2, NODE_R * 2);
          p.noStroke(); p.fill(c.textColor); p.textSize(13); p.textStyle(p.BOLD);
          p.text(node.char, node.x, node.y); p.textStyle(p.NORMAL);
          if (node.isEnd) { p.fill(c.nodeStroke.found || "#16a34a"); p.textSize(10); p.text("★", node.x, node.y + NODE_R + 8); }
        }
      }

      function performStep() {
        const s = stateRef.current;
        if (s.stepIndex >= s.steps.length) {
          s.running = false; s.paused = true; setIsPlaying(false); setIsDone(true); return;
        }
        const step = s.steps[s.stepIndex];
        displayTrieRef.current = cloneTrie(step.trie);
        const msg = `Step ${s.stepIndex + 1}: ${step.msg}`;
        setStatus(msg); setStepList(prev => [...prev, msg]);
        playSound(step.sound); s.stepIndex++;
      }

      p.reset = () => {
        const s = stateRef.current;
        s.steps = buildAllSteps(WORDS);
        s.stepIndex = 0; s.running = false; s.paused = true;
        displayTrieRef.current = new TrieNode("");
        setStatus(`Ready — Words: ${WORDS.map(w => `"${w}"`).join(", ")} | Expected LCP: "fl"`);
        setStepList([]); setIsPlaying(false); setIsDone(false);
      };

      p.step  = () => { if (isDone) return; const s = stateRef.current; s.paused = true; s.running = false; setIsPlaying(false); performStep(); };
      p.run   = () => { if (isDone) return; const s = stateRef.current; s.running = true; s.paused = false; setIsPlaying(true); };
      p.pause = () => { const s = stateRef.current; s.paused = true; s.running = false; setIsPlaying(false); };
    };

    const p5Inst = new p5(sketch, sketchRef.current);
    if (sketchRef.current) Object.assign(sketchRef.current, { reset: p5Inst.reset, step: p5Inst.step, run: p5Inst.run, pause: p5Inst.pause });
    return () => p5Inst.remove();
  }, []);

  const copySteps = async () => {
    try {
      await navigator.clipboard.writeText(stepList.join("\n"));
      const t = toastRef.current;
      if (t) { t.style.visibility = "visible"; t.style.opacity = 1; setTimeout(() => { t.style.opacity = 0; t.style.visibility = "hidden"; }, 2000); }
    } catch { alert("Failed to copy."); }
  };

  const ic  = colors.iconButton;
  const sty = {
    container:    { p: { xs: 2, sm: 4 }, background: colors.background.default, border: "1px solid #e0e0e0" },
    canvasWrapper:{ position: "relative", borderRadius: "24px", border: "1px solid #e0e0e0", overflow: "hidden", boxShadow: colors.paper.boxShadow, background: colors.background.surface, display: "flex", justifyContent: "center", alignItems: "center" },
    canvasBox:    { width: "100%", maxWidth: 800, aspectRatio: "16/9" },
    stepListBox:  { height: "260px", overflowY: "auto", mt: 1, p: 1.5, borderRadius: "12px", border: "1px solid #e0e0e0", background: colors.stepListBox.background, boxShadow: colors.stepListBox.boxShadow, "&::-webkit-scrollbar": { width: "8px" }, "&::-webkit-scrollbar-thumb": { background: colors.stepListBox.scrollbarThumb, borderRadius: "4px" } },
  };

  return (
    <Box sx={sty.container}>
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom sx={{ color: colors.text.primary }}>Example 1</Typography>
        <Typography variant="body2" sx={{ color: colors.text.secondary }}>
          Words: "flower", "flow", "flight" → Expected LCP: <strong>"fl"</strong>
        </Typography>
      </Box>

      {/* Controls */}
      <Box sx={{ p: 1, mb: 2, display: "flex", justifyContent: "center", gap: 1.5 }}>
        {[
          { title: "Reset",                    icon: <RestartAltIcon />,   onClick: () => sketchRef.current.reset() },
          { title: "Next Step",                icon: <ArrowForwardIcon />, onClick: () => sketchRef.current.step(), disabled: isDone || isPlaying },
          { title: isPlaying ? "Playing":"Run",icon: <PlayArrowIcon />,    onClick: () => sketchRef.current.run(),  disabled: isDone || isPlaying },
          { title: "Pause",                    icon: <PauseIcon />,        onClick: () => sketchRef.current.pause(),disabled: isDone || !isPlaying },
        ].map(({ title, icon, onClick, disabled }) => (
          <Tooltip key={title} title={title}><span>
            <IconButton onClick={onClick} disabled={disabled}
              sx={{ color: colors.text.primary, background: ic.background, border: `1px solid ${ic.border}`, "&:hover": { background: ic.hoverBackground } }}>
              {icon}
            </IconButton>
          </span></Tooltip>
        ))}
      </Box>

      {/* Legend */}
      <Box sx={{ mb: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Stack direction="row" spacing={1.5} flexWrap="wrap" justifyContent="center"
          sx={{ p: 1.5, borderRadius: 2, background: colors.legendBackground }}>
          <LegendItem color={colors.nodeFill.highlight} stroke={colors.nodeStroke.highlight} text="Traversing"    textColor={colors.text.primary} />
          <LegendItem color={colors.nodeFill.inserted}  stroke={colors.nodeStroke.inserted}  text="Inserted"      textColor={colors.text.primary} />
          <LegendItem color={colors.nodeFill.lcp}       stroke={colors.nodeStroke.lcp}       text="LCP Path"      textColor={colors.text.primary} />
          <LegendItem color={colors.nodeFill.branch}    stroke={colors.nodeStroke.branch}    text="Branch / Stop" textColor={colors.text.primary} />
        </Stack>
        <Typography variant="body1" sx={{ mt: 1.5, color: colors.text.primary }}>Status: {status}</Typography>
      </Box>

      {/* Canvas + Steps */}
      <Grid container spacing={{ xs: 2, md: 4 }} justifyContent="center" alignItems="stretch">
        <Grid item xs={12} md={8}>
          <Box sx={sty.canvasWrapper}>
            <Box sx={sty.canvasBox}>
              <div ref={sketchRef} style={{ width: "100%", height: "100%" }} />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: { xs: 1.5, md: 2 }, width: "100%", display: "flex", flexDirection: "column", gap: 2, bgcolor: colors.background.paper }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ color: colors.text.primary }}>Execution Steps</Typography>
              <Tooltip title="Copy Steps">
                <IconButton onClick={copySteps} size="small"
                  sx={{ color: colors.text.primary, background: ic.background, border: `1px solid ${ic.border}`, "&:hover": { background: ic.hoverBackground } }}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            <Box ref={stepListRef} sx={sty.stepListBox}>
              {stepList.map((s, i) => (
                <Typography key={i} variant="body2" sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap", mb: 0.5, color: colors.text.primary }}>{s}</Typography>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <div ref={toastRef} style={{ visibility: "hidden", opacity: 0, position: "fixed", bottom: 30, right: 30, backgroundColor: "#333", color: "#fff", padding: "10px 16px", borderRadius: 8, transition: "opacity 0.3s" }}>
        ✅ Steps copied!
      </div>
    </Box>
  );
};

const LegendItem = ({ color, stroke, text, textColor }) => (
  <Stack direction="row" spacing={0.8} alignItems="center">
    <Box sx={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: color, border: `2px solid ${stroke}` }} />
    <Typography variant="body2" sx={{ fontWeight: 500, color: textColor, fontSize: "0.75rem" }}>{text}</Typography>
  </Stack>
);

export default LCP_EX1;

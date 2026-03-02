import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import p5 from "p5";
import {
  Box,
  Grid,
  Paper,
  Stack,
  Typography,
  Tooltip,
  IconButton,
  useTheme,
  alpha,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const stepSoundFile    = "/DSA/step.mp3";
const successSoundFile = "/DSA/success.mp3";
const failSoundFile    = "/DSA/fail.mp3";

// ─── Theme colors ─────────────────────────────────────────────────────────────
const getExampleColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  return {
    primary: isDark ? "#60a5fa" : "#2c3e50",
    node: {
      default:   isDark ? "#1e293b" : "#dbeafe",
      highlight: isDark ? "#fbbf24" : "#fde68a",
      found:     isDark ? "#34d399" : "#6ee7b7",
      inserted:  isDark ? "#818cf8" : "#c7d2fe",
      endOfWord: isDark ? "#34d399" : "#10b981",
      border:    isDark ? "#475569" : "#93c5fd",
      text:      isDark ? "#f1f5f9" : "#1e293b",
    },
    edge:          isDark ? "#475569" : "#93c5fd",
    edgeHighlight: isDark ? "#fbbf24" : "#f59e0b",
    background: {
      default: isDark
        ? "linear-gradient(135deg, #000000 0%, #0a0a0a 100%)"
        : "linear-gradient(135deg, #f0f2f5 0%, #e0e7ff 100%)",
      paper:   isDark ? "#000000" : "#ffffff",
      surface: isDark ? "rgba(0,0,0,0.95)" : "rgba(255,255,255,0.95)",
    },
    text: { primary: isDark ? "#f1f5f9" : "#2c3e50", secondary: isDark ? "#94a3b8" : "#7f8c8d" },
    stepListBox: {
      background: isDark ? "linear-gradient(145deg, #000000, #0a0a0a)" : "linear-gradient(145deg, #e2e8f0, #f8fafc)",
      boxShadow:  isDark ? "inset 4px 4px 8px #000000, inset -4px -4px 8px #1a1a1a" : "inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff",
      scrollbarThumb: isDark ? "#333333" : "#bdc3c7",
    },
    legendBackground: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)",
    iconButton: {
      background:     isDark ? "#0a0a0a" : "#ffffff",
      border:         isDark ? "#333333" : "#e0e0e0",
      hoverBackground:isDark ? "#1a1a1a" : "#f0f2f5",
    },
    paper: {
      boxShadow: isDark ? "0 8px 32px 0 rgba(0,0,0,0.3)" : "0 8px 32px 0 rgba(44,62,80,0.12)",
    },
  };
};

// ─── Shared Trie DS ───────────────────────────────────────────────────────────
class TNode {
  constructor(ch = "") {
    this.char = ch; this.children = {}; this.isEndOfWord = false;
    this.state = "default"; this.x = 0; this.y = 0;
    this.id = Math.random().toString(36).slice(2);
  }
}

const NODE_R = 20;
const LEVEL_GAP = 65;

function layout(root, W) {
  const GAP = 44;
  function lc(n) {
    const k = Object.keys(n.children);
    return k.length === 0 ? 1 : k.reduce((s, c) => s + lc(n.children[c]), 0);
  }
  function ax(n, xl) {
    const w = lc(n) * (NODE_R * 2 + GAP);
    n.x = xl + w / 2;
    let cx = xl;
    for (const c of Object.keys(n.children)) {
      const cw = lc(n.children[c]) * (NODE_R * 2 + GAP);
      ax(n.children[c], cx); cx += cw;
    }
  }
  function ay(n, d) { n.y = 55 + d * LEVEL_GAP; for (const c of Object.keys(n.children)) ay(n.children[c], d + 1); }
  ax(root, 0); ay(root, 0);
  let mn = Infinity, mx = -Infinity;
  function fb(n) { if (n.x < mn) mn = n.x; if (n.x > mx) mx = n.x; for (const c of Object.keys(n.children)) fb(n.children[c]); }
  fb(root);
  const off = (W - (mx - mn)) / 2 - mn;
  function sh(n) { n.x += off; for (const c of Object.keys(n.children)) sh(n.children[c]); }
  sh(root);
}

// The fixed demo scenario: insert these words step-by-step, then search
const SCENARIO = [
  { op: "insert", word: "cat" },
  { op: "insert", word: "car" },
  { op: "insert", word: "card" },
  { op: "insert", word: "care" },
  { op: "insert", word: "bat" },
  { op: "search", word: "car" },
  { op: "search", word: "cart" },
];

const Trie_EX1 = () => {
  const theme  = useTheme();
  const colors = getExampleColors(theme);
  const isDark = theme?.palette?.mode === "dark";
  const colorsRef = useRef(colors);
  useEffect(() => { colorsRef.current = colors; }, [colors]);

  const sketchRef   = useRef();
  const stepListRef = useRef(null);
  const audioRefs   = useRef({});
  const toastRef    = useRef();

  const [status,      setStatus]      = useState("Ready – press ▶ or Next Step");
  const [stepList,    setStepList]    = useState([]);
  const [isSorted,    setIsSorted]    = useState(false);   // scenario finished
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (stepListRef.current) stepListRef.current.scrollTop = stepListRef.current.scrollHeight;
  }, [stepList]);

  useLayoutEffect(() => {
    let pInst = null;
    let running = false;
    let paused  = true;
    let stepNum = 1;

    // Live trie root
    const root = new TNode();

    const preloadAudio = () => {
      try {
        audioRefs.current.step    = new Audio(stepSoundFile);
        audioRefs.current.success = new Audio(successSoundFile);
        audioRefs.current.fail    = new Audio(failSoundFile);
      } catch (e) { console.error(e); }
    };
    const playSound = (t) => {
      const a = audioRefs.current[t];
      if (a) { a.currentTime = 0; a.play().catch(() => {}); }
    };

    // ── scenario state
    let scenarioIdx = 0;
    let opPhase = "idle";  // idle | traversing | done
    let pathNodes = [];
    let pathStep  = 0;
    let pendingOp = null;
    let pendingMessages = [];

    function resetNodeStates(n) {
      n.state = "default";
      for (const c of Object.keys(n.children)) resetNodeStates(n.children[c]);
    }

    // Build path for insert
    function buildInsertPath(word) {
      let node = root;
      const path = [root];
      const msgs = [`Inserting "${word}": start at root`];
      const newOnes = [];
      for (const ch of word) {
        if (!node.children[ch]) {
          node.children[ch] = new TNode(ch);
          newOnes.push(node.children[ch]);
        }
        node = node.children[ch];
        path.push(node);
        msgs.push(`"${ch}" node ${newOnes.includes(node) ? "(new)" : "(exists)"}`);
      }
      node.isEndOfWord = true;
      const finalStates = path.map((n, i) => (i === 0 ? "default" : newOnes.includes(n) ? "inserted" : "found"));
      return { path, msgs, finalStates, successMsg: `✅ "${word}" inserted` };
    }

    // Build path for search
    function buildSearchPath(word) {
      let node = root;
      const path = [root];
      const msgs = [`Searching "${word}": start at root`];
      let found = true;
      for (const ch of word) {
        if (!node.children[ch]) { found = false; break; }
        node = node.children[ch];
        path.push(node);
        msgs.push(`Found "${ch}" node ✓`);
      }
      if (found && !node.isEndOfWord) found = false;
      const finalStates = path.map(() => found ? "found" : "deleted");
      finalStates[0] = "default";
      return { path, msgs, finalStates, successMsg: found ? `✅ "${word}" found!` : `❌ "${word}" not found` };
    }

    function startNextScenarioStep() {
      if (scenarioIdx >= SCENARIO.length) {
        const msg = "Scenario complete!";
        setStatus(msg);
        setStepList(prev => [...prev, msg]);
        setIsSorted(true);
        running = false;
        paused  = true;
        setIsPlaying(false);
        playSound("success");
        return;
      }
      resetNodeStates(root);
      const { op, word } = SCENARIO[scenarioIdx];
      scenarioIdx++;
      const built = op === "insert" ? buildInsertPath(word) : buildSearchPath(word);
      pendingOp       = built;
      pathNodes       = built.path;
      pathStep        = 0;
      opPhase         = "traversing";
      pendingMessages = built.msgs;
    }

    function advanceStep() {
      if (opPhase === "idle" || opPhase === "done") {
        startNextScenarioStep();
        return;
      }
      if (opPhase === "traversing") {
        if (pathStep < pathNodes.length) {
          pathNodes[pathStep].state = "highlight";
          const msg = `Step ${stepNum++}: ${pendingMessages[pathStep] || ""}`;
          setStatus(msg);
          setStepList(prev => [...prev, msg]);
          playSound("step");
          pathStep++;
        }
        if (pathStep >= pathNodes.length) {
          // Apply final states
          pathNodes.forEach((n, i) => { n.state = pendingOp.finalStates[i] || "default"; });
          const finalMsg = `Step ${stepNum++}: ${pendingOp.successMsg}`;
          setStatus(finalMsg);
          setStepList(prev => [...prev, finalMsg]);
          playSound(pendingOp.successMsg.startsWith("✅") ? "success" : "fail");
          opPhase = "done";
          setIsAnimating(false);
        }
      }
    }

    const sketch = (p) => {
      p.setup = () => {
        const container = sketchRef.current;
        const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
        canvas.parent(container);
        p.textAlign(p.CENTER, p.CENTER);
        p.textFont("monospace");
        preloadAudio();
      };

      p.draw = () => {
        const c = colorsRef.current;
        p.background(c.background.paper === "#000000" ? "#000000" : "#ffffff");
        layout(root, p.width);
        drawEdges(p, root, c);
        drawNodes(p, root, c);
        if (running && !paused && p.frameCount % 35 === 0) {
          setIsAnimating(true);
          advanceStep();
        }
      };

      function drawEdges(p, n, c) {
        for (const [, child] of Object.entries(n.children)) {
          const hl = n.state !== "default" && child.state !== "default";
          p.stroke(hl ? c.edgeHighlight : c.edge);
          p.strokeWeight(hl ? 2.5 : 1.5);
          p.line(n.x, n.y, child.x, child.y);
          drawEdges(p, child, c);
        }
      }

      function drawNodes(p, n, c) {
        const fc = {
          default:  c.node.default,
          highlight:c.node.highlight,
          found:    c.node.found,
          deleted:  c.node.found, // repurpose deleted slot as red-ish
          inserted: c.node.inserted,
        };
        p.fill(fc[n.state] || c.node.default);
        p.stroke(n.isEndOfWord ? c.node.endOfWord : c.node.border);
        p.strokeWeight(n.isEndOfWord ? 3 : 1.5);
        p.ellipse(n.x, n.y, NODE_R * 2, NODE_R * 2);
        p.noStroke(); p.fill(c.node.text); p.textSize(13);
        p.text(n.char === "" ? "◉" : n.char, n.x, n.y);
        if (n.isEndOfWord && n.char !== "") {
          p.fill(c.node.endOfWord); p.textSize(9);
          p.text("★", n.x + NODE_R - 3, n.y - NODE_R + 3);
        }
        for (const ch of Object.keys(n.children)) drawNodes(p, n.children[ch], c);
      }

      p.reset = () => {
        // Clear trie
        root.children = {}; root.isEndOfWord = false; root.state = "default";
        scenarioIdx = 0; opPhase = "idle"; pathNodes = []; pathStep = 0;
        pendingOp = null; stepNum = 1; running = false; paused = true;
        setStatus("Ready – press ▶ or Next Step");
        setStepList([]);
        setIsSorted(false);
        setIsPlaying(false);
        setIsAnimating(false);
      };

      p.step = () => {
        if (isSorted) return;
        paused = true; running = false; setIsPlaying(false);
        setIsAnimating(true);
        advanceStep();
      };

      p.run = () => {
        if (isSorted) return;
        running = true; paused = false; setIsPlaying(true);
      };

      p.pause = () => {
        paused = true; running = false; setIsPlaying(false);
      };

      pInst = p;
    };

    const p5Instance = new p5(sketch, sketchRef.current);
    if (sketchRef.current) {
      Object.assign(sketchRef.current, {
        reset: p5Instance.reset,
        step:  p5Instance.step,
        run:   p5Instance.run,
        pause: p5Instance.pause,
      });
    }
    return () => p5Instance.remove();
  }, []);

  const copySteps = async () => {
    try {
      await navigator.clipboard.writeText(stepList.join("\n"));
      const t = toastRef.current;
      if (t) {
        t.innerText = "Steps copied!";
        t.style.visibility = "visible"; t.style.opacity = 1;
        setTimeout(() => { t.style.opacity = 0; t.style.visibility = "hidden"; }, 2000);
      }
    } catch { alert("Failed to copy."); }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, background: colors.background.default, border: "1px solid #e0e0e0" }}>
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom sx={{ color: colors.text.primary }}>
          Example 1 — Insert &amp; Search: cat, car, card, care, bat
        </Typography>
      </Box>

      <Box sx={{ p: 1, mb: 2, display: "flex", justifyContent: "center", gap: 1.5 }}>
        <Tooltip title="Reset">
          <IconButton onClick={() => sketchRef.current.reset()} sx={{ color: colors.text.primary, background: colors.iconButton.background, border: `1px solid ${colors.iconButton.border}` }}>
            <RestartAltIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Next Step">
          <IconButton onClick={() => sketchRef.current.step()} disabled={isSorted || isPlaying} sx={{ color: colors.text.primary, background: colors.iconButton.background, border: `1px solid ${colors.iconButton.border}` }}>
            <ArrowForwardIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={isPlaying ? "Playing" : "Run"}>
          <IconButton onClick={() => sketchRef.current.run()} disabled={isSorted || isPlaying} sx={{ background: isPlaying ? colors.node.found : colors.iconButton.background, color: colors.text.primary, border: `1px solid ${colors.iconButton.border}` }}>
            <PlayArrowIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Pause">
          <IconButton onClick={() => sketchRef.current.pause()} disabled={isSorted || !isPlaying} sx={{ color: colors.text.primary, background: colors.iconButton.background, border: `1px solid ${colors.iconButton.border}` }}>
            <PauseIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Legend */}
      <Box sx={{ mb: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Stack direction="row" spacing={2} sx={{ p: 1.5, borderRadius: 2, background: colors.legendBackground, flexWrap: "wrap", justifyContent: "center" }}>
          <LI color={colors.node.default}   text="Unvisited"  tc={colors.text.primary} />
          <LI color={colors.node.highlight}  text="Traversing" tc={colors.text.primary} />
          <LI color={colors.node.inserted}   text="Inserted"   tc={colors.text.primary} />
          <LI color={colors.node.found}      text="Found / Exists" tc={colors.text.primary} />
          <LI color={colors.node.endOfWord}  text="End of Word ★" tc={colors.text.primary} />
        </Stack>
        <Typography variant="body1" sx={{ mt: 2, color: colors.text.primary }}>Status: {status}</Typography>
      </Box>

      <Grid container spacing={{ xs: 2, md: 4 }} justifyContent="center" alignItems="stretch">
        <Grid item xs={12} md={8}>
          <Box sx={{ position: "relative", borderRadius: "24px", border: "1px solid #e0e0e0", overflow: "hidden", boxShadow: colors.paper.boxShadow, background: colors.background.surface, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Box sx={{ width: "100%", maxWidth: 800, aspectRatio: "16 / 9" }}>
              <div ref={sketchRef} style={{ width: "100%", height: "100%" }} />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: { xs: 1.5, md: 2 }, width: "100%", display: "flex", flexDirection: "column", gap: 2, mx: "auto", bgcolor: colors.background.paper }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ color: colors.text.primary }}>Execution Steps</Typography>
              <Tooltip title="Copy Steps">
                <IconButton onClick={copySteps} size="small" sx={{ color: colors.text.primary, background: colors.iconButton.background, border: `1px solid ${colors.iconButton.border}` }}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            <Box ref={stepListRef} sx={{ height: "280px", overflowY: "auto", p: 1.5, borderRadius: "12px", border: "1px solid #e0e0e0", background: colors.stepListBox.background, boxShadow: colors.stepListBox.boxShadow, "&::-webkit-scrollbar": { width: "8px" }, "&::-webkit-scrollbar-thumb": { background: colors.stepListBox.scrollbarThumb, borderRadius: "4px" } }}>
              {stepList.map((s, i) => (
                <Typography key={i} variant="body2" sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap", mb: 0.5, color: colors.text.primary }}>{s}</Typography>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <div ref={toastRef} style={{ visibility: "hidden", opacity: 0, position: "fixed", bottom: 30, right: 30, backgroundColor: "#333", color: "#fff", padding: "10px 16px", borderRadius: 8, transition: "opacity 0.3s" }} />
    </Box>
  );
};

const LI = ({ color, text, tc }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Box sx={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: color, border: "2px solid rgba(0,0,0,0.1)" }} />
    <Typography variant="body2" sx={{ fontWeight: 500, color: tc }}>{text}</Typography>
  </Stack>
);

export default Trie_EX1;

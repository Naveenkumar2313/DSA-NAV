import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import p5 from "p5";
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Typography,
  Tooltip,
  IconButton,
  TextField,
  useTheme,
  alpha,
  Chip
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

// Import sound files
import stepSoundFile from "/step.mp3";
import successSoundFile from "/success.mp3";
import failSoundFile from "/fail.mp3";

// ─── Theme-aware colors ────────────────────────────────────────────────────────
const getSimulationColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  return {
    nodeFill: {
      default: isDark ? "#1e3a5f" : "#dbeafe",
      highlight: isDark ? "#ca8a04" : "#fde68a",
      inserted: isDark ? "#5b21b6" : "#ddd6fe",
      found: isDark ? "#166534" : "#bbf7d0",
      lcp: isDark ? "#065f46" : "#a7f3d0", // teal — LCP path
      branch: isDark ? "#7c2d12" : "#fed7aa" // orange — branch point
    },
    nodeStroke: {
      default: isDark ? "#60a5fa" : "#3b82f6",
      highlight: isDark ? "#fbbf24" : "#d97706",
      inserted: isDark ? "#a78bfa" : "#7c3aed",
      found: isDark ? "#4ade80" : "#16a34a",
      lcp: isDark ? "#10b981" : "#059669",
      branch: isDark ? "#f97316" : "#ea580c"
    },
    edgeColor: isDark ? "#475569" : "#94a3b8",
    edgeActive: isDark ? "#fbbf24" : "#d97706",
    edgeLcp: isDark ? "#10b981" : "#059669",
    textColor: isDark ? "#f1f5f9" : "#1e293b",
    background: {
      canvas: isDark ? "#000000" : "#ffffff",
      default: isDark
        ? "linear-gradient(135deg,#222A45 0%,#222A45 100%)"
        : "linear-gradient(135deg,#f0f2f5 0%,#e0e7ff 100%)",
      paper: isDark ? "#000000" : "#ffffff"
    },
    text: {
      primary: isDark ? "#f1f5f9" : "#2c3e50",
      secondary: isDark ? "#94a3b8" : "#7f8c8d"
    },
    stepListBox: {
      background: isDark
        ? "linear-gradient(145deg,#222A45,#2d3548)"
        : "linear-gradient(145deg,#e2e8f0,#f8fafc)",
      boxShadow: isDark
        ? "inset 4px 4px 8px #222A45, inset -4px -4px 8px #2d3548"
        : "inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff",
      scrollbarThumb: isDark ? "#1a1a1a" : "#bdc3c7"
    },
    legendBackground: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)",
    iconButton: {
      background: isDark ? "#0a0a0a" : "#ffffff",
      border: isDark ? "#333333" : "#e0e0e0",
      hoverBackground: isDark ? "#1a1a1a" : "#f0f2f5"
    },
    input: {
      background: isDark ? "#000000" : "#ffffff",
      border: isDark ? "#333333" : "#e0e0e0",
      hoverBorder: isDark ? "#2a2a2a" : "#bdbdbd",
      focusBorder: isDark ? "#60a5fa" : "#3b82f6",
      text: isDark ? "#f1f5f9" : "#2c3e50",
      label: isDark ? "#94a3b8" : "#64748b"
    },
    paper: {
      boxShadow: isDark ? "0 8px 32px 0 rgba(0,0,0,0.3)" : "0 8px 32px 0 rgba(44,62,80,0.12)"
    }
  };
};

// ─── Trie helpers ──────────────────────────────────────────────────────────────
const NODE_R = 22;
const LEVEL_GAP = 70;

class TrieNode {
  constructor(char = "") {
    this.char = char;
    this.children = {};
    this.isEnd = false;
    this.state = "default"; // default | highlight | inserted | lcp | branch
    this.x = 0;
    this.y = 0;
  }
}

function cloneTrie(node) {
  if (!node) return null;
  const n = new TrieNode(node.char);
  n.isEnd = node.isEnd;
  n.state = node.state;
  n.x = node.x;
  n.y = node.y;
  for (const [k, v] of Object.entries(node.children)) n.children[k] = cloneTrie(v);
  return n;
}

function countLeaves(node) {
  const keys = Object.keys(node.children);
  if (!keys.length) return 1;
  return keys.reduce((s, k) => s + countLeaves(node.children[k]), 0);
}

function assignPositions(node, canvasWidth, depth = 0, xStart = 0, xEnd = null) {
  if (xEnd === null) xEnd = canvasWidth;
  node.x = (xStart + xEnd) / 2;
  node.y = 50 + depth * LEVEL_GAP;
  const keys = Object.keys(node.children).sort();
  const total = countLeaves(node);
  let cur = xStart;
  for (const k of keys) {
    const child = node.children[k];
    const frac = countLeaves(child) / total;
    assignPositions(child, canvasWidth, depth + 1, cur, cur + frac * (xEnd - xStart));
    cur += frac * (xEnd - xStart);
  }
}

function resetStates(node) {
  node.state = "default";
  for (const k of Object.keys(node.children)) resetStates(node.children[k]);
}

// ─── LCP step builder ─────────────────────────────────────────────────────────
function buildLCPSteps(words) {
  const steps = [];
  const root = new TrieNode("");

  function snap(msg, sound) {
    steps.push({ trie: cloneTrie(root), msg, sound });
  }

  snap(`Starting LCP for: ${words.map((w) => `"${w}"`).join(", ")}`, "step");

  // Insert all words
  for (const word of words) {
    snap(`--- Inserting "${word}" into Trie ---`, "step");
    let node = root;
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      node.state = "highlight";
      snap(`At "${node.char || "root"}" — following '${ch}'`, "step");
      if (!node.children[ch]) {
        node.children[ch] = new TrieNode(ch);
        node.children[ch].state = "inserted";
        snap(`Created new node '${ch}'`, "step");
      } else {
        node.children[ch].state = "highlight";
        snap(`Node '${ch}' already exists`, "step");
      }
      node.state = "default";
      node = node.children[ch];
    }
    node.isEnd = true;
    node.state = "inserted";
    snap(`"${word}" inserted — end-of-word marked ★`, "success");
    resetStates(root);
    snap(`Trie after inserting "${word}"`, null);
  }

  // Now find LCP
  snap("All words inserted. Now traversing to find Longest Common Prefix...", "step");

  let curr = root;
  let lcp = "";

  while (curr) {
    curr.state = "highlight";
    snap(`Visiting node "${curr.char || "root"}" — checking conditions`, "step");

    // Condition 1: end-of-word?
    if (curr.isEnd) {
      curr.state = "branch";
      snap(
        `Node "${curr.char}" is end-of-word — a word ends here, LCP cannot extend further`,
        "fail"
      );
      break;
    }

    const childKeys = Object.keys(curr.children);

    // Condition 2: no children?
    if (childKeys.length === 0) {
      curr.state = "lcp";
      snap(`No children — reached a leaf. LCP traversal complete`, "step");
      break;
    }

    // Condition 3: branching?
    if (childKeys.length > 1) {
      curr.state = "branch";
      snap(
        `Node "${curr.char || "root"}" has ${childKeys.length} children (${childKeys
          .sort()
          .join(", ")}) — this is a BRANCH POINT. LCP ends here`,
        "fail"
      );
      break;
    }

    // Single child — extend LCP
    const ch = childKeys[0];
    const child = curr.children[ch];
    curr.state = "lcp";
    lcp += ch;
    snap(`Single child '${ch}' found — LCP extends to "${lcp}"`, "step");
    child.state = "highlight";
    snap(`Moving to node '${ch}'`, "step");
    curr = child;
  }

  // Highlight entire LCP path
  resetStates(root);
  let pathNode = root;
  for (const ch of lcp) {
    pathNode.state = "lcp";
    pathNode = pathNode.children[ch];
    pathNode.state = "lcp";
  }
  snap(
    lcp.length
      ? `✅ Longest Common Prefix = "${lcp}" (length ${lcp.length})`
      : `✅ Longest Common Prefix = "" (empty — no common prefix)`,
    "success"
  );

  return { steps, lcp };
}

// ─── Main Component ────────────────────────────────────────────────────────────
const LCPLab = ({ showSnackbar }) => {
  const theme = useTheme();
  const colors = getSimulationColors(theme);
  const colorsRef = useRef(colors);
  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  const canvasRef = useRef(null);
  const stepListRef = useRef(null);

  const [wordInput, setWordInput] = useState("");
  const [wordList, setWordList] = useState([]);
  const [status, setStatus] = useState("Add at least 2 words, then click Find LCP");
  const [stepList, setStepList] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lcpResult, setLcpResult] = useState(null);

  const stepsRef = useRef([]);
  const stepIndexRef = useRef(0);
  const timeoutRef = useRef(null);
  const audioRefs = useRef({});
  const displayTrieRef = useRef(new TrieNode(""));

  useEffect(() => {
    if (stepListRef.current) stepListRef.current.scrollTop = stepListRef.current.scrollHeight;
  }, [stepList]);

  const playSound = (type) => {
    if (!type) return;
    const a = audioRefs.current[type];
    if (a) {
      a.currentTime = 0;
      a.play().catch(() => {});
    }
  };

  // ── Canvas setup ──────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    audioRefs.current.step = new Audio(stepSoundFile);
    audioRefs.current.success = new Audio(successSoundFile);
    audioRefs.current.fail = new Audio(failSoundFile);

    const sketch = (p) => {
      p.setup = () => {
        const cont = canvasRef.current;
        p.createCanvas(cont.offsetWidth, cont.offsetHeight).parent(cont);
        p.textAlign(p.CENTER, p.CENTER);
      };

      p.draw = () => {
        const c = colorsRef.current;
        p.background(c.background.canvas);
        const root = displayTrieRef.current;
        assignPositions(root, p.width);
        drawTrie(p, root, c);
      };

      p.windowResized = () => {
        const cont = canvasRef.current;
        if (cont) p.resizeCanvas(cont.offsetWidth, cont.offsetHeight);
      };
    };

    const p5Inst = new p5(sketch, canvasRef.current);
    return () => p5Inst.remove();
  }, []);

  // ── Draw helpers ──────────────────────────────────────────────────────────
  function drawTrie(p, node, c) {
    for (const k of Object.keys(node.children).sort()) {
      const child = node.children[k];
      const bothLcp = node.state === "lcp" && child.state === "lcp";
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
      p.noStroke();
      p.fill(c.textColor);
      p.textSize(14);
      p.textStyle(p.BOLD);
      p.text(node.char, node.x, node.y);
      p.textStyle(p.NORMAL);
      if (node.isEnd) {
        p.fill(c.nodeStroke.found || "#16a34a");
        p.textSize(11);
        p.text("★", node.x, node.y + NODE_R + 10);
      }
    }
  }

  // ── Step controls ─────────────────────────────────────────────────────────
  const applyStep = useCallback((idx) => {
    const step = stepsRef.current[idx];
    if (!step) return;
    displayTrieRef.current = cloneTrie(step.trie);
    const msg = `Step ${idx + 1}: ${step.msg}`;
    setStatus(msg);
    setStepList((prev) => [...prev, msg]);
    if (step.sound) playSound(step.sound);
  }, []);

  const handleStep = useCallback(() => {
    if (!stepsRef.current.length) {
      showSnackbar("Add words and click Find LCP first.", "warning");
      return;
    }
    if (stepIndexRef.current >= stepsRef.current.length) {
      showSnackbar("Already complete.", "info");
      return;
    }
    applyStep(stepIndexRef.current++);
  }, [applyStep, showSnackbar]);

  const handleRun = useCallback(() => {
    if (isPlaying) {
      clearTimeout(timeoutRef.current);
      setIsPlaying(false);
      return;
    }
    if (!stepsRef.current.length) {
      showSnackbar("Add words and click Find LCP first.", "warning");
      return;
    }
    if (stepIndexRef.current >= stepsRef.current.length) {
      showSnackbar("Already complete.", "info");
      return;
    }
    setIsPlaying(true);
    const run = () => {
      if (stepIndexRef.current >= stepsRef.current.length) {
        setIsPlaying(false);
        return;
      }
      applyStep(stepIndexRef.current++);
      timeoutRef.current = setTimeout(run, 850);
    };
    run();
  }, [isPlaying, applyStep, showSnackbar]);

  // ── Add / Remove words ────────────────────────────────────────────────────
  const handleAddWord = useCallback(() => {
    const w = wordInput
      .trim()
      .toLowerCase()
      .replace(/[^a-z]/g, "");
    if (!w) {
      showSnackbar("Enter a valid word (a-z).", "warning");
      return;
    }
    if (wordList.includes(w)) {
      showSnackbar(`"${w}" already added.`, "info");
      return;
    }
    if (wordList.length >= 8) {
      showSnackbar("Maximum 8 words.", "warning");
      return;
    }
    setWordList((prev) => [...prev, w]);
    setWordInput("");
  }, [wordInput, wordList, showSnackbar]);

  const handleRemoveWord = useCallback((w) => {
    setWordList((prev) => prev.filter((x) => x !== w));
  }, []);

  // ── Find LCP ──────────────────────────────────────────────────────────────
  const handleFindLCP = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIsPlaying(false);
    if (wordList.length < 2) {
      showSnackbar("Add at least 2 words.", "warning");
      return;
    }

    const { steps, lcp } = buildLCPSteps(wordList);
    stepsRef.current = steps;
    stepIndexRef.current = 0;
    setStepList([]);
    setLcpResult(lcp);

    applyStep(0);
    stepIndexRef.current = 1;
  }, [wordList, applyStep, showSnackbar]);

  const handleReset = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIsPlaying(false);
    displayTrieRef.current = new TrieNode("");
    stepsRef.current = [];
    stepIndexRef.current = 0;
    setStepList([]);
    setWordList([]);
    setWordInput("");
    setStatus("Add at least 2 words, then click Find LCP");
    setLcpResult(null);
  }, []);

  const ic = colors.iconButton;

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      color: colors.input.text,
      bgcolor: colors.input.background,
      "& fieldset": { borderColor: colors.input.border },
      "&:hover fieldset": { borderColor: colors.input.hoverBorder },
      "&.Mui-focused fieldset": { borderColor: colors.input.focusBorder }
    },
    "& .MuiInputLabel-root": { color: colors.input.label },
    "& .MuiInputLabel-root.Mui-focused": { color: colors.input.focusBorder }
  };

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        background: colors.background.default,
        borderRadius: "20px",
        border: "1px solid #e0e0e0",
        boxShadow: colors.paper.boxShadow
      }}
    >
      <Typography variant="h5" align="center" sx={{ mb: 2, color: colors.text.primary }}>
        Simulator — Longest Common Prefix
      </Typography>

      {/* Word input */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: colors.background.paper, border: "1px solid #e0e0e0" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <TextField
            size="small"
            label="Add word (a-z)"
            value={wordInput}
            onChange={(e) => setWordInput(e.target.value.toLowerCase().replace(/[^a-z]/g, ""))}
            onKeyPress={(e) => e.key === "Enter" && handleAddWord()}
            sx={{ ...inputSx, flexGrow: 1 }}
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddWord}
            sx={{
              borderColor: colors.input.focusBorder,
              color: colors.input.focusBorder,
              "&:hover": {
                borderColor: colors.input.focusBorder,
                bgcolor: alpha(colors.input.focusBorder, 0.08)
              }
            }}
          >
            Add
          </Button>
          <Button
            variant="contained"
            onClick={handleFindLCP}
            disabled={wordList.length < 2}
            sx={{
              bgcolor: colors.nodeStroke.lcp,
              "&:hover": { bgcolor: alpha(colors.nodeStroke.lcp, 0.8) },
              "&:disabled": { opacity: 0.4 }
            }}
          >
            Find LCP
          </Button>
        </Stack>

        {/* Word chips */}
        {wordList.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2, gap: 1 }}>
            {wordList.map((w) => (
              <Chip
                key={w}
                label={w}
                onDelete={() => handleRemoveWord(w)}
                deleteIcon={<DeleteIcon />}
                sx={{
                  bgcolor: colors.nodeFill.inserted,
                  color: colors.text.primary,
                  border: `1px solid ${colors.nodeStroke.inserted}`,
                  "& .MuiChip-deleteIcon": { color: colors.text.secondary }
                }}
              />
            ))}
          </Stack>
        )}
      </Paper>

      {/* LCP result banner */}
      {lcpResult !== null && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 2,
            textAlign: "center",
            bgcolor: lcpResult.length ? colors.nodeFill.lcp : colors.nodeFill.branch,
            border: `1.5px solid ${
              lcpResult.length ? colors.nodeStroke.lcp : colors.nodeStroke.branch
            }`
          }}
        >
          <Typography variant="h6" sx={{ color: colors.text.primary }}>
            Longest Common Prefix:{" "}
            <strong>{lcpResult.length ? `"${lcpResult}"` : `"" (empty)`}</strong>
          </Typography>
        </Box>
      )}

      {/* Legend */}
      <Box sx={{ mb: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Stack
          direction="row"
          spacing={1.5}
          flexWrap="wrap"
          justifyContent="center"
          sx={{ p: 1.5, borderRadius: 2, background: colors.legendBackground }}
        >
          <LegendItem
            color={colors.nodeFill.highlight}
            stroke={colors.nodeStroke.highlight}
            text="Traversing"
            textColor={colors.text.primary}
          />
          <LegendItem
            color={colors.nodeFill.inserted}
            stroke={colors.nodeStroke.inserted}
            text="Inserted"
            textColor={colors.text.primary}
          />
          <LegendItem
            color={colors.nodeFill.lcp}
            stroke={colors.nodeStroke.lcp}
            text="LCP Path"
            textColor={colors.text.primary}
          />
          <LegendItem
            color={colors.nodeFill.branch}
            stroke={colors.nodeStroke.branch}
            text="Branch / Stop"
            textColor={colors.text.primary}
          />
          <LegendItem
            color={colors.nodeFill.default}
            stroke={colors.nodeStroke.default}
            text="Default"
            textColor={colors.text.primary}
          />
        </Stack>
        <Typography
          variant="body1"
          sx={{ mt: 1.5, color: colors.text.primary, textAlign: "center" }}
        >
          {status}
        </Typography>
      </Box>

      {/* Canvas + Steps */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Box
            ref={canvasRef}
            sx={{
              position: "relative",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: colors.paper.boxShadow,
              background: colors.background.canvas,
              border: "1px solid #e0e0e0",
              minHeight: "480px",
              height: "100%"
            }}
          />
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              p: 2,
              minHeight: "480px",
              maxHeight: "480px",
              display: "flex",
              flexDirection: "column",
              bgcolor: colors.background.paper,
              border: "1px solid #e0e0e0"
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ color: colors.text.primary }}>
                Execution Steps
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Reset">
                  <IconButton
                    size="small"
                    onClick={handleReset}
                    sx={{
                      color: colors.text.primary,
                      background: ic.background,
                      border: `1px solid ${ic.border}`,
                      "&:hover": { background: ic.hoverBackground }
                    }}
                  >
                    <RestartAltIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Next Step">
                  <IconButton
                    size="small"
                    onClick={handleStep}
                    disabled={isPlaying}
                    sx={{
                      color: colors.text.primary,
                      background: ic.background,
                      border: `1px solid ${ic.border}`,
                      "&:hover": { background: ic.hoverBackground }
                    }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={isPlaying ? "Pause" : "Run"}>
                  <IconButton
                    size="small"
                    onClick={handleRun}
                    sx={{
                      background: isPlaying ? colors.nodeFill.highlight : colors.nodeFill.found
                    }}
                  >
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
            <Box
              ref={stepListRef}
              sx={{
                flexGrow: 1,
                overflowY: "auto",
                mt: 1,
                p: 1.5,
                borderRadius: "12px",
                border: "1px solid #e0e0e0",
                background: colors.stepListBox.background,
                boxShadow: colors.stepListBox.boxShadow,
                "&::-webkit-scrollbar": { width: "8px" },
                "&::-webkit-scrollbar-thumb": {
                  background: colors.stepListBox.scrollbarThumb,
                  borderRadius: "4px"
                }
              }}
            >
              {stepList.map((s, i) => (
                <Typography
                  key={i}
                  variant="body2"
                  sx={{
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    mb: 0.5,
                    color: colors.text.primary
                  }}
                >
                  {s}
                </Typography>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

const LegendItem = ({ color, stroke, text, textColor }) => (
  <Stack direction="row" spacing={0.8} alignItems="center">
    <Box
      sx={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        backgroundColor: color,
        border: `2px solid ${stroke}`
      }}
    />
    <Typography variant="body2" sx={{ fontWeight: 500, color: textColor, fontSize: "0.75rem" }}>
      {text}
    </Typography>
  </Stack>
);

export default LCPLab;

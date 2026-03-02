import React, { useState, useCallback, useEffect, useRef } from "react";
import p5 from "p5";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Stack,
  IconButton,
  Tooltip,
  Chip
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReplayIcon from "@mui/icons-material/Replay";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";

import stepSoundFile from "/step.mp3";
import successSoundFile from "/success.mp3";
import failSoundFile from "/fail.mp3";

const getSimulationColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  return {
    primary: isDark ? "#60a5fa" : "#1976d2",
    secondary: isDark ? "#64b5f6" : "#89CFF0",
    success: isDark ? "#4ade80" : "#4CAF50",
    successLight: isDark ? "#86efac" : "#b9fbc0",
    warning: isDark ? "#fbbf24" : "#FFC107",
    warningLight: isDark ? "#fcd34d" : "#ffecb3",
    accent: isDark ? "#a78bfa" : "#ddd6fe",
    accentStroke: isDark ? "#a78bfa" : "#7c3aed",
    info: isDark ? "#4a5568" : "#E0E0E0",
    error: isDark ? "#f87171" : "#d32f2f",
    background: {
      default: isDark ? "#222A45" : "#f7f9fc",
      paper: isDark ? "#222A45" : "#ffffff",
      canvas: isDark ? "#000000" : "#ffffff",
      log: isDark ? "#1a2038" : "#fafafa"
    },
    text: {
      primary: isDark ? "#f1f5f9" : "#1e293b",
      secondary: isDark ? "#cbd5e1" : "#64748b"
    },
    border: isDark ? "#333333" : "#e0e0e0",
    node: {
      default: isDark ? "#1a1a1a" : "#E0E0E0",
      visited: isDark ? "#64b5f6" : "#89CFF0",
      current: isDark ? "#fbbf24" : "#FFC107",
      prefix: isDark ? "#a78bfa" : "#ddd6fe",
      result: isDark ? "#4ade80" : "#b9fbc0"
    },
    nodeStroke: {
      default: isDark ? "#60a5fa" : "#90a4ae",
      prefix: isDark ? "#a78bfa" : "#7c3aed",
      result: isDark ? "#22c55e" : "#388E3C"
    }
  };
};

// ─── Trie helpers ──────────────────────────────────────────────────────────────
function makePNode(char, p, colors) {
  return {
    char,
    children: {},
    isEnd: false,
    wordCount: 0,
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    scale: 1,
    targetScale: 1,
    color: p.color(colors.node.default),
    targetColor: p.color(colors.node.default),
    state: "default"
  };
}

function insertWord(root, word, p, colors) {
  let curr = root;
  for (const ch of word) {
    if (!curr.children[ch]) curr.children[ch] = makePNode(ch, p, colors);
    curr.children[ch].wordCount++;
    curr = curr.children[ch];
  }
  curr.isEnd = true;
}

function collectAllNodes(root) {
  const all = [];
  function dfs(n) {
    all.push(n);
    for (const k of Object.keys(n.children).sort()) dfs(n.children[k]);
  }
  dfs(root);
  return all;
}

function layoutNodes(root, W, H) {
  const levels = [];
  const q = [{ node: root, depth: 0 }];
  while (q.length) {
    const { node, depth } = q.shift();
    if (!levels[depth]) levels[depth] = [];
    levels[depth].push(node);
    for (const k of Object.keys(node.children).sort())
      q.push({ node: node.children[k], depth: depth + 1 });
  }
  const LH = Math.min(H / (levels.length + 1), 110);
  levels.forEach((lv, d) => {
    const gap = W / (lv.length + 1);
    lv.forEach((node, i) => {
      node.targetX = gap * (i + 1);
      node.targetY = 70 + LH * d;
      node.x = node.targetX;
      node.y = node.targetY;
    });
  });
}

function buildPrefixSteps(root, allNodes, prefix, colors_dummy) {
  // Return array of {states, msg, sound}
  const steps = [];
  function snap(msg, sound) {
    steps.push({ states: allNodes.map((n) => ({ node: n, state: n.state })), msg, sound });
  }
  function resetAll() {
    allNodes.forEach((n) => {
      n.state = "default";
    });
  }

  resetAll();
  snap(`Searching prefix "${prefix}" in the trie...`, "step");

  let node = root,
    ok = true;
  for (const ch of prefix) {
    node.state = "current";
    snap(`At node "${node.char || "root"}" — looking for child '${ch}'`, "step");
    if (!node.children[ch]) {
      node.state = "default";
      snap(`'${ch}' not found — prefix "${prefix}" doesn't exist. Count = 0`, "fail");
      ok = false;
      break;
    }
    node.state = "prefix";
    node = node.children[ch];
    node.state = "current";
    snap(`Found '${ch}' (wordCount = ${node.wordCount})`, "step");
    node.state = "prefix";
  }

  if (ok) {
    node.state = "result";
    snap(`Reached end of prefix "${prefix}" — wordCount = ${node.wordCount}`, "success");
    snap(`✅ Words with prefix "${prefix}" = ${node.wordCount}`, "success");
  }

  return {
    steps,
    count: ok
      ? root.children[prefix[0]]
        ? (() => {
            let n = root;
            for (const ch of prefix) {
              if (!n.children[ch]) return 0;
              n = n.children[ch];
            }
            return n.wordCount;
          })()
        : 0
      : 0
  };
}

// ─── Component ─────────────────────────────────────────────────────────────────
const NWPLab = ({ showSnackbar }) => {
  const theme = useTheme();
  const colors = getSimulationColors(theme);
  const colorsRef = useRef(colors);
  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  const sketchRef = useRef();
  const logRef = useRef(null);
  const audioRefs = useRef({});
  const p5Ref = useRef(null); // hold p5 instance

  // Trie state (held in refs so p5 can access live)
  const trieRootRef = useRef(null);
  const allNodesRef = useRef([]);
  const stepsRef = useRef([]);
  const stepIdxRef = useRef(0);

  const [wordInput, setWordInput] = useState("");
  const [prefixInput, setPrefixInput] = useState("");
  const [wordList, setWordList] = useState([]);
  const [log, setLog] = useState("");
  const [statusMsg, setStatusMsg] = useState("Status: Add words, then search a prefix.");
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [resultCount, setResultCount] = useState(null);
  const [stepNum, setStepNum] = useState(1);

  const timerRef = useRef(null);
  const isRunRef = useRef(false);
  const isFinRef = useRef(false);
  const stepNumRef = useRef(1);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const playSound = (t) => {
    if (!audioRefs.current[t]) return;
    audioRefs.current[t].currentTime = 0;
    audioRefs.current[t].play().catch(() => {});
  };

  // ── p5 sketch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const sketch = (p) => {
      p.setup = () => {
        audioRefs.current.step = new Audio(stepSoundFile);
        audioRefs.current.success = new Audio(successSoundFile);
        audioRefs.current.fail = new Audio(failSoundFile);
        const cont = sketchRef.current;
        p.createCanvas(cont.offsetWidth, cont.offsetHeight).parent(cont);
        p.textAlign(p.CENTER, p.CENTER);
        // Build empty trie root
        trieRootRef.current = makePNode("", p, colorsRef.current);
        allNodesRef.current = [trieRootRef.current];
      };

      p.draw = () => {
        const c = colorsRef.current;
        p.background(c.background.canvas);
        const allNodes = allNodesRef.current;
        allNodes.forEach((n) => {
          n.x = p.lerp(n.x, n.targetX, 0.09);
          n.y = p.lerp(n.y, n.targetY, 0.09);
          n.scale = p.lerp(n.scale, n.targetScale, 0.1);
          n.color = p.lerpColor(n.color, n.targetColor, 0.12);
          switch (n.state) {
            case "current":
              n.targetColor = p.color(c.warning);
              n.targetScale = 1.28 + p.sin(p.frameCount * 0.12) * 0.07;
              break;
            case "visited":
              n.targetColor = p.color(c.secondary);
              n.targetScale = 1.0;
              break;
            case "prefix":
              n.targetColor = p.color(c.accent);
              n.targetScale = 1.12;
              break;
            case "result":
              n.targetColor = p.color(c.successLight);
              n.targetScale = 1.22;
              break;
            default:
              n.targetColor = p.color(c.node.default);
              n.targetScale = 1.0;
              break;
          }
        });
        drawEdges(p);
        drawNodes(p);
      };

      function drawEdges(p) {
        const c = colorsRef.current;
        function recurse(node) {
          for (const k of Object.keys(node.children).sort()) {
            const child = node.children[k];
            const isPfx =
              (child.state === "prefix" || child.state === "result" || child.state === "current") &&
              (node.state === "prefix" || node.state === "result" || node.state === "current");
            if (isPfx) {
              p.push();
              p.stroke(c.warning);
              p.strokeWeight(3);
              p.drawingContext.setLineDash([8, 5]);
              p.line(node.x, node.y, child.x, child.y);
              p.drawingContext.setLineDash([]);
              const mid = p5.Vector.lerp(
                p.createVector(node.x, node.y),
                p.createVector(child.x, child.y),
                0.55
              );
              const ang = p.atan2(child.y - node.y, child.x - node.x);
              p.translate(mid.x, mid.y);
              p.rotate(ang);
              p.fill(c.warning);
              p.noStroke();
              p.triangle(0, 0, -14, -6, -14, 6);
              p.pop();
            } else {
              p.stroke(c.text.secondary);
              p.strokeWeight(2);
              p.line(node.x, node.y, child.x, child.y);
            }
            recurse(child);
          }
        }
        if (trieRootRef.current) recurse(trieRootRef.current);
      }

      function drawNodes(p) {
        const c = colorsRef.current;
        const R = 24;
        function recurse(node) {
          if (node.char !== "") {
            if (node.state === "result") {
              p.noStroke();
              p.fill(p.red(node.color), p.green(node.color), p.blue(node.color), 55);
              p.ellipse(node.x, node.y, (R + 12) * 2 * node.scale, (R + 12) * 2 * node.scale);
            }
            p.stroke(c.primary);
            p.strokeWeight(2.5);
            p.fill(node.color);
            p.ellipse(node.x, node.y, R * 2 * node.scale, R * 2 * node.scale);
            p.noStroke();
            p.fill(c.text.primary);
            p.textSize(14);
            p.textStyle(p.BOLD);
            p.text(node.char, node.x, node.y - 4);
            p.textStyle(p.NORMAL);
            p.textSize(10);
            p.fill(c.accentStroke);
            p.text(`#${node.wordCount}`, node.x, node.y + 8);
            p.textSize(14);
            if (node.isEnd) {
              p.fill(node.state === "result" ? c.success : c.accentStroke);
              p.textSize(11);
              p.text("★", node.x, node.y + R + 10);
              p.textSize(14);
            }
          }
          for (const k of Object.keys(node.children).sort()) recurse(node.children[k]);
        }
        if (trieRootRef.current) recurse(trieRootRef.current);
      }

      p.windowResized = () => {
        const cont = sketchRef.current;
        if (cont) {
          p.resizeCanvas(cont.offsetWidth, cont.offsetHeight);
          if (trieRootRef.current) layoutNodes(trieRootRef.current, p.width, p.height);
        }
      };
    };

    const p5Inst = new p5(sketch, sketchRef.current);
    p5Ref.current = p5Inst;
    return () => p5Inst.remove();
  }, []);

  // Rebuild trie whenever wordList changes
  const rebuildTrie = useCallback((words) => {
    const p = p5Ref.current;
    if (!p) return;
    const c = colorsRef.current;
    const newRoot = makePNode("", p, c);
    for (const w of words) insertWord(newRoot, w, p, c);
    trieRootRef.current = newRoot;
    allNodesRef.current = collectAllNodes(newRoot);
    layoutNodes(
      newRoot,
      sketchRef.current?.offsetWidth || 700,
      sketchRef.current?.offsetHeight || 400
    );
    // reset step state
    stepsRef.current = [];
    stepIdxRef.current = 0;
    stepNumRef.current = 1;
    setIsFinished(false);
    isFinRef.current = false;
    setIsRunning(false);
    isRunRef.current = false;
    setResultCount(null);
    setLog("");
    setStepNum(1);
    clearTimeout(timerRef.current);
  }, []);

  // ── Word management ───────────────────────────────────────────────────────────
  const handleAddWord = () => {
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
    if (wordList.length >= 10) {
      showSnackbar("Max 10 words.", "warning");
      return;
    }
    const next = [...wordList, w];
    setWordList(next);
    setWordInput("");
    rebuildTrie(next);
  };

  const handleRemoveWord = (w) => {
    const next = wordList.filter((x) => x !== w);
    setWordList(next);
    rebuildTrie(next);
  };

  // ── Search prefix ─────────────────────────────────────────────────────────────
  const handleSearch = () => {
    const prefix = prefixInput
      .trim()
      .toLowerCase()
      .replace(/[^a-z]/g, "");
    if (!prefix) {
      showSnackbar("Enter a prefix to search.", "warning");
      return;
    }
    if (wordList.length === 0) {
      showSnackbar("Add words first.", "warning");
      return;
    }
    clearTimeout(timerRef.current);
    setIsRunning(false);
    isRunRef.current = false;
    setIsFinished(false);
    isFinRef.current = false;
    setLog("");
    setStepNum(1);
    stepNumRef.current = 1;
    setResultCount(null);

    // Reset node states
    allNodesRef.current.forEach((n) => {
      n.state = "default";
    });

    const { steps, count } = buildPrefixSteps(trieRootRef.current, allNodesRef.current, prefix);
    stepsRef.current = steps;
    stepIdxRef.current = 0;
    setResultCount(count);
    setStatusMsg(`Ready to search prefix "${prefix}"`);
  };

  // ── Step/Run/Pause ────────────────────────────────────────────────────────────
  const performStep = useCallback(() => {
    const steps = stepsRef.current;
    const idx = stepIdxRef.current;
    if (idx >= steps.length) {
      setIsFinished(true);
      isFinRef.current = true;
      setIsRunning(false);
      isRunRef.current = false;
      return;
    }
    const s = steps[idx];
    s.states.forEach(({ node, state }) => {
      node.state = state;
    });
    const msg = `Step ${stepNumRef.current++}: ${s.msg}`;
    setStepNum(stepNumRef.current);
    setStatusMsg(msg);
    setLog((prev) => prev + msg + "\n");
    if (s.sound) playSound(s.sound);
    stepIdxRef.current++;
    if (stepIdxRef.current >= steps.length) {
      setIsFinished(true);
      isFinRef.current = true;
      setIsRunning(false);
      isRunRef.current = false;
    }
  }, []);

  const handleStep = () => {
    if (stepsRef.current.length === 0) {
      showSnackbar("Search a prefix first.", "warning");
      return;
    }
    if (isFinRef.current) {
      showSnackbar("Done. Reset to search again.", "info");
      return;
    }
    clearTimeout(timerRef.current);
    setIsRunning(false);
    isRunRef.current = false;
    performStep();
  };

  const handleRunPause = () => {
    if (stepsRef.current.length === 0) {
      showSnackbar("Search a prefix first.", "warning");
      return;
    }
    if (isFinRef.current) {
      showSnackbar("Done. Reset to search again.", "info");
      return;
    }
    if (isRunRef.current) {
      clearTimeout(timerRef.current);
      setIsRunning(false);
      isRunRef.current = false;
      return;
    }
    setIsRunning(true);
    isRunRef.current = true;
    const tick = () => {
      if (!isRunRef.current || isFinRef.current) return;
      performStep();
      timerRef.current = setTimeout(tick, 700);
    };
    tick();
  };

  const handlePrev = () => {
    if (stepIdxRef.current <= 0) return;
    clearTimeout(timerRef.current);
    setIsRunning(false);
    isRunRef.current = false;
    stepIdxRef.current = Math.max(0, stepIdxRef.current - 1);
    const idx = Math.max(0, stepIdxRef.current - 1);
    if (idx >= 0 && stepsRef.current[idx]) {
      stepsRef.current[idx].states.forEach(({ node, state }) => {
        node.state = state;
      });
    }
    if (stepNumRef.current > 1) stepNumRef.current--;
    setStepNum(stepNumRef.current);
    setLog(
      (prev) => prev.split("\n").slice(0, -2).join("\n") + (prev.split("\n").length > 2 ? "\n" : "")
    );
    setIsFinished(false);
    isFinRef.current = false;
  };

  const handleReset = () => {
    clearTimeout(timerRef.current);
    setIsRunning(false);
    isRunRef.current = false;
    setIsFinished(false);
    isFinRef.current = false;
    stepsRef.current = [];
    stepIdxRef.current = 0;
    stepNumRef.current = 1;
    allNodesRef.current.forEach((n) => {
      n.state = "default";
    });
    setLog("");
    setStatusMsg("Status: Reset. Add words or search a new prefix.");
    setResultCount(null);
    setStepNum(1);
  };

  const handleFullReset = () => {
    handleReset();
    setWordList([]);
    setPrefixInput("");
    rebuildTrie([]);
    setStatusMsg("Status: Add words, then search a prefix.");
  };

  const handleCopyLog = () => {
    navigator.clipboard
      .writeText(log)
      .then(() => showSnackbar("Log copied!", "success"))
      .catch(() => showSnackbar("Copy failed.", "error"));
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      color: colors.text.primary,
      "& fieldset": { borderColor: colors.border },
      "&:hover fieldset": { borderColor: colors.primary },
      "&.Mui-focused fieldset": { borderColor: colors.primary }
    },
    "& .MuiInputLabel-root": { color: colors.text.secondary }
  };

  return (
    <Box sx={{ bgcolor: colors.background.default, minHeight: "100vh", p: { xs: 2, md: 3 } }}>
      <audio
        ref={(el) => {
          if (el) audioRefs.current.step = el;
        }}
        src={stepSoundFile}
        preload="auto"
      />
      <audio
        ref={(el) => {
          if (el) audioRefs.current.success = el;
        }}
        src={successSoundFile}
        preload="auto"
      />
      <audio
        ref={(el) => {
          if (el) audioRefs.current.fail = el;
        }}
        src={failSoundFile}
        preload="auto"
      />

      <Typography
        variant="h5"
        align="center"
        sx={{ mb: 2, color: colors.text.primary, fontWeight: 700 }}
      >
        Simulator — Number of Words with Given Prefix
      </Typography>

      {/* Controls paper */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          bgcolor: colors.background.paper,
          borderRadius: "16px",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.07)"
        }}
      >
        <Grid container spacing={2} alignItems="flex-start">
          {/* Add word */}
          <Grid item xs={12} md={5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                fullWidth
                size="small"
                label="Add word (a-z)"
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value.toLowerCase().replace(/[^a-z]/g, ""))}
                onKeyPress={(e) => e.key === "Enter" && handleAddWord()}
                sx={inputSx}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddWord}
                sx={{ whiteSpace: "nowrap", borderColor: colors.primary, color: colors.primary }}
              >
                Add
              </Button>
            </Stack>
            {/* Word chips */}
            {wordList.length > 0 && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1.5, gap: 0.5 }}>
                {wordList.map((w) => (
                  <Chip
                    key={w}
                    label={w}
                    size="small"
                    onDelete={() => handleRemoveWord(w)}
                    deleteIcon={<DeleteIcon />}
                    sx={{
                      bgcolor: colors.accent,
                      color: colors.text.primary,
                      border: `1px solid ${colors.accentStroke}`,
                      "& .MuiChip-deleteIcon": { color: colors.text.secondary }
                    }}
                  />
                ))}
              </Stack>
            )}
          </Grid>

          {/* Prefix search */}
          <Grid item xs={12} md={5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                fullWidth
                size="small"
                label="Search prefix (a-z)"
                value={prefixInput}
                onChange={(e) =>
                  setPrefixInput(e.target.value.toLowerCase().replace(/[^a-z]/g, ""))
                }
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                sx={inputSx}
              />
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                sx={{ whiteSpace: "nowrap", bgcolor: colors.primary, "&:hover": { opacity: 0.88 } }}
              >
                Search
              </Button>
            </Stack>
            {/* Result banner */}
            {resultCount !== null && (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1,
                  borderRadius: 2,
                  textAlign: "center",
                  bgcolor: resultCount > 0 ? colors.successLight : colors.warningLight,
                  border: `1px solid ${resultCount > 0 ? colors.success : colors.warning}`
                }}
              >
                <Typography variant="body1" sx={{ color: colors.text.primary, fontWeight: 700 }}>
                  {resultCount > 0
                    ? `"${prefixInput}" → ${resultCount} word${resultCount !== 1 ? "s" : ""}`
                    : `"${prefixInput}" not found — count = 0`}
                </Typography>
              </Box>
            )}
          </Grid>

          {/* Reset */}
          <Grid item xs={12} md={2} sx={{ display: "flex", alignItems: "flex-start" }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<ReplayIcon />}
              onClick={handleFullReset}
            >
              Full Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3} alignItems="stretch">
        {/* Canvas */}
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              height: "100%",
              p: 1.5,
              minHeight: 480,
              bgcolor: colors.background.canvas,
              borderRadius: "16px",
              boxShadow: "0px 4px 20px rgba(0,0,0,0.07)"
            }}
          >
            <div ref={sketchRef} style={{ width: "100%", height: "100%", minHeight: 460 }} />
          </Paper>
        </Grid>

        {/* Log & controls */}
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              bgcolor: colors.background.paper,
              borderRadius: "16px",
              boxShadow: "0px 4px 20px rgba(0,0,0,0.07)"
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="h6" sx={{ color: colors.text.primary, fontWeight: 600 }}>
                Log & Status
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Reset steps">
                  <IconButton
                    size="small"
                    onClick={handleReset}
                    sx={{ color: colors.text.secondary }}
                  >
                    <ReplayIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Prev Step">
                  <IconButton
                    size="small"
                    onClick={handlePrev}
                    disabled={stepIdxRef.current <= 0}
                    sx={{ color: colors.text.secondary }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Next Step">
                  <IconButton
                    size="small"
                    onClick={handleStep}
                    disabled={isRunning}
                    sx={{ color: colors.text.secondary }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={isRunning ? "Pause" : "Run"}>
                  <IconButton
                    size="small"
                    onClick={handleRunPause}
                    sx={{ background: isRunning ? colors.warningLight : colors.successLight }}
                  >
                    {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            <Typography
              variant="body2"
              sx={{ mb: 1, color: colors.text.secondary, fontStyle: "italic" }}
            >
              {statusMsg}
            </Typography>

            {/* Legend */}
            <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mb: 1.5 }}>
              {[
                { color: colors.warning, label: "Current" },
                { color: colors.secondary, label: "Inserted" },
                { color: colors.accent, label: "Prefix Path" },
                { color: colors.successLight, label: "Result" },
                { color: colors.node.default, label: "Unvisited" }
              ].map(({ color, label }) => (
                <Stack key={label} direction="row" spacing={0.5} alignItems="center">
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      bgcolor: color,
                      border: "1.5px solid rgba(0,0,0,0.15)"
                    }}
                  />
                  <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                    {label}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Box
              ref={logRef}
              sx={{
                flexGrow: 1,
                minHeight: 200,
                maxHeight: 320,
                overflowY: "auto",
                bgcolor: colors.background.log,
                borderRadius: 1,
                p: 1,
                border: `1px solid ${colors.border}`,
                fontFamily: "monospace",
                fontSize: "0.8rem",
                color: colors.text.primary,
                whiteSpace: "pre-wrap"
              }}
            >
              {log || (
                <span style={{ color: colors.text.secondary, fontStyle: "italic" }}>
                  Steps will appear here...
                </span>
              )}
            </Box>

            <Button
              variant="contained"
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyLog}
              sx={{ mt: 1.5, bgcolor: colors.accentStroke, "&:hover": { opacity: 0.85 } }}
            >
              Copy Log
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NWPLab;

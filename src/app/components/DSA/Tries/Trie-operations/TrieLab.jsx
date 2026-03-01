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
  ToggleButtonGroup,
  ToggleButton
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

// Sound files
const stepSoundFile = "/DSA/step.mp3";
const successSoundFile = "/DSA/success.mp3";
const failSoundFile = "/DSA/fail.mp3";

// ─── Theme-aware colors ───────────────────────────────────────────────────────
const getSimulationColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  return {
    primary:   { main: isDark ? "#60a5fa" : "#2c3e50" },
    node: {
      default:    isDark ? "#1e293b" : "#dbeafe",
      highlight:  isDark ? "#fbbf24" : "#fde68a",
      found:      isDark ? "#34d399" : "#6ee7b7",
      deleted:    isDark ? "#f87171" : "#fca5a5",
      inserted:   isDark ? "#818cf8" : "#c7d2fe",
      endOfWord:  isDark ? "#34d399" : "#10b981",
      border:     isDark ? "#475569" : "#93c5fd",
      text:       isDark ? "#f1f5f9" : "#1e293b",
    },
    edge:       isDark ? "#475569" : "#93c5fd",
    edgeHighlight: isDark ? "#fbbf24" : "#f59e0b",
    background: {
      default: isDark
        ? "linear-gradient(135deg, #222A45 0%, #222A45 100%)"
        : "linear-gradient(135deg, #f0f2f5 0%, #e0e7ff 100%)",
      paper:   isDark ? "#000000" : "#ffffff",
    },
    text:  { primary: isDark ? "#f1f5f9" : "#2c3e50", secondary: isDark ? "#94a3b8" : "#7f8c8d" },
    stepListBox: {
      background: isDark
        ? "linear-gradient(145deg, #222A45, #2d3548)"
        : "linear-gradient(145deg, #e2e8f0, #f8fafc)",
      boxShadow: isDark
        ? "inset 4px 4px 8px #222A45, inset -4px -4px 8px #2d3548"
        : "inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff",
      scrollbarThumb: isDark ? "#1a1a1a" : "#bdc3c7",
    },
    legendBackground: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)",
    paper: {
      boxShadow: isDark
        ? "0 8px 32px 0 rgba(0,0,0,0.3)"
        : "0 8px 32px 0 rgba(44,62,80,0.12)",
    },
    input: {
      background: isDark ? "#000000" : "#ffffff",
      border:     isDark ? "#333333" : "#e0e0e0",
      hoverBorder: isDark ? "#2a2a2a" : "#bdbdbd",
      focusBorder: isDark ? "#60a5fa" : "#3b82f6",
      text:       isDark ? "#f1f5f9" : "#2c3e50",
      label:      isDark ? "#94a3b8" : "#64748b",
    },
  };
};

// ─── TrieNode data structure ─────────────────────────────────────────────────
class TrieNode {
  constructor(char = "") {
    this.char       = char;
    this.children   = {};
    this.isEndOfWord= false;
    this.id         = Math.random().toString(36).slice(2);
    // visual props (set by layout engine)
    this.x = 0;
    this.y = 0;
    this.state = "default"; // default | highlight | found | deleted | inserted
  }
}

// ─── Trie data structure ─────────────────────────────────────────────────────
class Trie {
  constructor() { this.root = new TrieNode(""); }

  insert(word) {
    const path = [this.root];
    let node = this.root;
    const newNodes = [];
    for (const ch of word) {
      if (!node.children[ch]) {
        node.children[ch] = new TrieNode(ch);
        newNodes.push(node.children[ch]);
      }
      node = node.children[ch];
      path.push(node);
    }
    node.isEndOfWord = true;
    return { path, newNodes };
  }

  search(word) {
    const path = [this.root];
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) return { path, found: false };
      node = node.children[ch];
      path.push(node);
    }
    return { path, found: node.isEndOfWord };
  }

  delete(word) {
    const { path, found } = this.search(word);
    if (!found) return { path, deleted: false };

    const deleteHelper = (node, word, depth) => {
      if (!node) return false;
      if (depth === word.length) {
        if (!node.isEndOfWord) return false;
        node.isEndOfWord = false;
        return Object.keys(node.children).length === 0;
      }
      const ch = word[depth];
      if (!node.children[ch]) return false;
      const shouldDelete = deleteHelper(node.children[ch], word, depth + 1);
      if (shouldDelete) {
        delete node.children[ch];
        return Object.keys(node.children).length === 0 && !node.isEndOfWord;
      }
      return false;
    };

    deleteHelper(this.root, word, 0);
    return { path, deleted: true };
  }

  // Serialise the whole tree for cloning (deep copy)
  clone() {
    const t = new Trie();
    const copyNode = (src, dst) => {
      dst.char        = src.char;
      dst.isEndOfWord = src.isEndOfWord;
      dst.id          = src.id;
      dst.state       = src.state;
      for (const [ch, child] of Object.entries(src.children)) {
        const newChild = new TrieNode(ch);
        dst.children[ch] = newChild;
        copyNode(child, newChild);
      }
    };
    copyNode(this.root, t.root);
    return t;
  }
}

// ─── Layout engine: assign x,y to every node ─────────────────────────────────
const NODE_RADIUS = 22;
const LEVEL_GAP   = 70;

function computeLayout(root, canvasW, canvasH) {
  // BFS level-order, track subtree widths for centering
  const GAP_X = 50;

  // 1. Count leaves for subtree sizing
  function leafCount(node) {
    const keys = Object.keys(node.children);
    if (keys.length === 0) return 1;
    return keys.reduce((s, k) => s + leafCount(node.children[k]), 0);
  }

  // 2. Assign x via recursive x-placement
  function assignX(node, xLeft) {
    const lc = leafCount(node);
    const width = lc * (NODE_RADIUS * 2 + GAP_X);
    node.x = xLeft + width / 2;
    let childX = xLeft;
    for (const ch of Object.keys(node.children)) {
      const child = node.children[ch];
      const cw = leafCount(child) * (NODE_RADIUS * 2 + GAP_X);
      assignX(child, childX);
      childX += cw;
    }
  }

  // 3. Assign y by depth
  function assignY(node, depth) {
    node.y = 60 + depth * LEVEL_GAP;
    for (const ch of Object.keys(node.children)) assignY(node.children[ch], depth + 1);
  }

  assignX(root, 0);
  assignY(root, 0);

  // Centre horizontally
  let minX = Infinity, maxX = -Infinity;
  function findBounds(node) {
    if (node.x < minX) minX = node.x;
    if (node.x > maxX) maxX = node.x;
    for (const ch of Object.keys(node.children)) findBounds(node.children[ch]);
  }
  findBounds(root);

  const treeWidth = maxX - minX;
  const offsetX = (canvasW - treeWidth) / 2 - minX;
  function shift(node) {
    node.x += offsetX;
    for (const ch of Object.keys(node.children)) shift(node.children[ch]);
  }
  shift(root);
}

// ─── Main Component ───────────────────────────────────────────────────────────
const TrieLab = ({ showSnackbar }) => {
  const theme  = useTheme();
  const colors = getSimulationColors(theme);
  const isDark = theme?.palette?.mode === "dark";
  const colorsRef = useRef(colors);
  useEffect(() => { colorsRef.current = colors; }, [colors]);

  const canvasRef   = useRef(null);
  const stepListRef = useRef(null);
  const audioRefs   = useRef({});
  const timeoutRefs = useRef([]);

  const [wordInput, setWordInput]   = useState("");
  const [operation, setOperation]   = useState("insert"); // insert | search | delete
  const [status, setStatus]         = useState("Ready. Enter a word and choose an operation.");
  const [stepList, setStepList]     = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Mutable trie lives in a ref so p5 draw loop always sees current state
  const trieRef = useRef(new Trie());

  useEffect(() => {
    if (stepListRef.current)
      stepListRef.current.scrollTop = stepListRef.current.scrollHeight;
  }, [stepList]);

  const playSound = (type) => {
    const a = audioRefs.current[type];
    if (a) { a.currentTime = 0; a.play().catch(() => {}); }
  };

  const clearTimeouts = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  };

  // ── p5 setup ──────────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const sketch = (p) => {
      p.setup = () => {
        const container = canvasRef.current;
        const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
        canvas.parent(container);
        p.textAlign(p.CENTER, p.CENTER);
        p.textFont("monospace");
      };

      p.draw = () => {
        const c = colorsRef.current;
        p.background(c.background.paper === "#000000" ? "#000000" : "#ffffff");
        drawTrie(p);
      };

      p.windowResized = () => {
        const container = canvasRef.current;
        if (container) p.resizeCanvas(container.offsetWidth, container.offsetHeight);
      };

      function drawTrie(p) {
        const trie = trieRef.current;
        const c    = colorsRef.current;
        computeLayout(trie.root, p.width, p.height);

        // Draw edges first
        drawEdges(p, trie.root, c);
        // Draw nodes on top
        drawNodes(p, trie.root, c);
      }

      function drawEdges(p, node, c) {
        for (const [, child] of Object.entries(node.children)) {
          const isHighlighted =
            node.state !== "default" && child.state !== "default";
          p.stroke(isHighlighted ? c.edgeHighlight : c.edge);
          p.strokeWeight(isHighlighted ? 2.5 : 1.5);
          p.line(node.x, node.y, child.x, child.y);
          drawEdges(p, child, c);
        }
      }

      function drawNodes(p, node, c) {
        const stateColors = {
          default:  c.node.default,
          highlight:c.node.highlight,
          found:    c.node.found,
          deleted:  c.node.deleted,
          inserted: c.node.inserted,
        };

        const fillColor = stateColors[node.state] || c.node.default;
        p.fill(fillColor);
        p.stroke(node.isEndOfWord ? c.node.endOfWord : c.node.border);
        p.strokeWeight(node.isEndOfWord ? 3 : 1.5);
        p.ellipse(node.x, node.y, NODE_RADIUS * 2, NODE_RADIUS * 2);

        // Node label
        p.noStroke();
        p.fill(c.node.text);
        p.textSize(14);
        p.text(node.char === "" ? "◉" : node.char, node.x, node.y);

        // isEndOfWord star indicator
        if (node.isEndOfWord && node.char !== "") {
          p.fill(c.node.endOfWord);
          p.noStroke();
          p.textSize(10);
          p.text("★", node.x + NODE_RADIUS - 4, node.y - NODE_RADIUS + 4);
        }

        for (const ch of Object.keys(node.children)) drawNodes(p, node.children[ch], c);
      }
    };

    const p5Instance = new p5(sketch, canvasRef.current);

    audioRefs.current.step    = new Audio(stepSoundFile);
    audioRefs.current.success = new Audio(successSoundFile);
    audioRefs.current.fail    = new Audio(failSoundFile);

    return () => p5Instance.remove();
  }, []);

  // ── Reset all node states ─────────────────────────────────────────────────
  const resetNodeStates = useCallback((node) => {
    node.state = "default";
    for (const ch of Object.keys(node.children)) resetNodeStates(node.children[ch]);
  }, []);

  // ── Animate a path step by step ──────────────────────────────────────────
  const animatePath = useCallback((path, finalStates, messages, onDone) => {
    setIsAnimating(true);
    clearTimeouts();

    path.forEach((node, idx) => {
      const t = setTimeout(() => {
        node.state = "highlight";
        const msg = messages[idx];
        if (msg) {
          setStatus(msg);
          setStepList(prev => [...prev, msg]);
          playSound("step");
        }
      }, idx * 450);
      timeoutRefs.current.push(t);
    });

    const finalT = setTimeout(() => {
      // Apply final states
      path.forEach((node, idx) => {
        node.state = finalStates[idx] || "default";
      });
      if (onDone) onDone();
      setIsAnimating(false);
    }, path.length * 450 + 200);
    timeoutRefs.current.push(finalT);
  }, []);

  // ── INSERT ────────────────────────────────────────────────────────────────
  const handleInsert = useCallback(() => {
    const word = wordInput.trim().toLowerCase();
    if (!word) { showSnackbar("Please enter a word.", "warning"); return; }
    if (!/^[a-z]+$/.test(word)) { showSnackbar("Only lowercase letters a-z allowed.", "warning"); return; }
    if (isAnimating) return;

    const { path, newNodes } = trieRef.current.insert(word);
    const messages = path.map((node, i) => {
      if (i === 0) return `Inserting "${word}": starting at root`;
      return `Step ${i}: at node "${node.char}"${newNodes.includes(node) ? " (new node created)" : ""}`;
    });
    messages.push(`✅ "${word}" inserted successfully!`);

    const finalPath = [...path];
    const finalMsg  = `✅ "${word}" inserted successfully!`;

    const finalStates = path.map((n) => newNodes.includes(n) ? "inserted" : "found");
    finalStates[0] = "default"; // root stays neutral

    animatePath(path, finalStates, messages, () => {
      setStatus(finalMsg);
      setStepList(prev => [...prev, finalMsg]);
      playSound("success");
      // Fade back
      setTimeout(() => {
        resetNodeStates(trieRef.current.root);
        setStatus(`"${word}" is now in the Trie.`);
      }, 1200);
    });
  }, [wordInput, isAnimating, animatePath, resetNodeStates, showSnackbar]);

  // ── SEARCH ────────────────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    const word = wordInput.trim().toLowerCase();
    if (!word) { showSnackbar("Please enter a word.", "warning"); return; }
    if (!/^[a-z]+$/.test(word)) { showSnackbar("Only lowercase letters a-z allowed.", "warning"); return; }
    if (isAnimating) return;

    const { path, found } = trieRef.current.search(word);
    const messages = path.map((node, i) => {
      if (i === 0) return `Searching "${word}": starting at root`;
      return `Step ${i}: found node "${node.char}" ✓`;
    });

    const finalState = found ? "found" : "deleted";
    const finalMsg   = found
      ? `✅ "${word}" found in the Trie!`
      : `❌ "${word}" NOT found in the Trie.`;

    const finalStates = path.map(() => finalState);
    finalStates[0] = "default";

    animatePath(path, finalStates, messages, () => {
      setStatus(finalMsg);
      setStepList(prev => [...prev, finalMsg]);
      playSound(found ? "success" : "fail");
      setTimeout(() => {
        resetNodeStates(trieRef.current.root);
      }, 1500);
    });
  }, [wordInput, isAnimating, animatePath, resetNodeStates, showSnackbar]);

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    const word = wordInput.trim().toLowerCase();
    if (!word) { showSnackbar("Please enter a word.", "warning"); return; }
    if (!/^[a-z]+$/.test(word)) { showSnackbar("Only lowercase letters a-z allowed.", "warning"); return; }
    if (isAnimating) return;

    const { path, deleted } = trieRef.current.delete(word);

    if (!deleted) {
      const failMsg = `❌ "${word}" not found — nothing to delete.`;
      setStatus(failMsg);
      setStepList(prev => [...prev, failMsg]);
      playSound("fail");
      // Still highlight path to show where search failed
      const messages = path.map((node, i) =>
        i === 0 ? `Delete "${word}": searching from root` : `Step ${i}: at node "${node.char}"`
      );
      animatePath(path, path.map(() => "deleted"), messages, () => {
        setTimeout(() => resetNodeStates(trieRef.current.root), 1200);
      });
      return;
    }

    const messages = path.map((node, i) =>
      i === 0
        ? `Delete "${word}": tracing path from root`
        : `Step ${i}: visiting "${node.char}"${i === path.length - 1 ? " — removing end marker" : ""}`
    );

    const finalStates = path.map(() => "deleted");
    finalStates[0] = "default";

    animatePath(path, finalStates, messages, () => {
      const finalMsg = `🗑 "${word}" deleted from the Trie.`;
      setStatus(finalMsg);
      setStepList(prev => [...prev, finalMsg]);
      playSound("success");
      setTimeout(() => resetNodeStates(trieRef.current.root), 1200);
    });
  }, [wordInput, isAnimating, animatePath, resetNodeStates, showSnackbar]);

  // ── Handle GO button ──────────────────────────────────────────────────────
  const handleGo = () => {
    if (operation === "insert") handleInsert();
    else if (operation === "search") handleSearch();
    else handleDelete();
  };

  // ── RESET ─────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    clearTimeouts();
    setIsAnimating(false);
    trieRef.current = new Trie();
    setStatus("Ready. Enter a word and choose an operation.");
    setStepList([]);
    setWordInput("");
  }, []);

  const opColor = {
    insert: colors.node.inserted,
    search: colors.node.found,
    delete: colors.node.deleted,
  };

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        background: colors.background.default,
        borderRadius: "20px",
        border: "1px solid #e0e0e0",
        boxShadow: colors.paper.boxShadow,
      }}
    >
      <Typography variant="h5" align="center" sx={{ mb: 2, color: colors.text.primary }}>
        Simulator
      </Typography>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: colors.background.paper, borderRadius: "12px", border: "1px solid #e0e0e0" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              size="small"
              label="Word (a-z only)"
              value={wordInput}
              onChange={(e) => setWordInput(e.target.value.toLowerCase().replace(/[^a-z]/g, ""))}
              onKeyPress={(e) => e.key === "Enter" && handleGo()}
              disabled={isAnimating}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: colors.input.text,
                  bgcolor: colors.input.background,
                  "& fieldset": { borderColor: colors.input.border },
                  "&:hover fieldset": { borderColor: colors.input.hoverBorder },
                  "&.Mui-focused fieldset": { borderColor: colors.input.focusBorder },
                },
                "& .MuiInputLabel-root": { color: colors.input.label },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.input.focusBorder },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <ToggleButtonGroup
              value={operation}
              exclusive
              onChange={(_, v) => { if (v) setOperation(v); }}
              size="small"
              fullWidth
              disabled={isAnimating}
              sx={{
                "& .MuiToggleButton-root": {
                  color: colors.text.secondary,
                  borderColor: colors.input.border,
                  "&.Mui-selected": {
                    color: "#fff",
                    bgcolor: opColor[operation],
                    "&:hover": { bgcolor: opColor[operation] },
                  },
                },
              }}
            >
              <ToggleButton value="insert"><AddIcon fontSize="small" sx={{ mr: 0.5 }} />Insert</ToggleButton>
              <ToggleButton value="search"><SearchIcon fontSize="small" sx={{ mr: 0.5 }} />Search</ToggleButton>
              <ToggleButton value="delete"><DeleteIcon fontSize="small" sx={{ mr: 0.5 }} />Delete</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleGo}
              disabled={isAnimating}
              sx={{
                bgcolor: opColor[operation],
                color: "#fff",
                "&:hover": { bgcolor: alpha(opColor[operation], 0.85) },
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              {operation.charAt(0).toUpperCase() + operation.slice(1)}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Legend + Status */}
      <Box sx={{ mb: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            p: 1.5,
            borderRadius: 2,
            background: colors.legendBackground,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <LegendItem color={colors.node.default}   text="Unvisited"  textColor={colors.text.primary} />
          <LegendItem color={colors.node.highlight}  text="Traversing" textColor={colors.text.primary} />
          <LegendItem color={colors.node.inserted}   text="Inserted"   textColor={colors.text.primary} />
          <LegendItem color={colors.node.found}      text="Found"      textColor={colors.text.primary} />
          <LegendItem color={colors.node.deleted}    text="Not Found / Deleted" textColor={colors.text.primary} />
          <LegendItem color={colors.node.endOfWord}  text="End of Word (★)" textColor={colors.text.primary} border />
        </Stack>
        <Typography variant="body1" sx={{ mt: 2, color: colors.text.primary, fontWeight: 500 }}>
          {status}
        </Typography>
      </Box>

      {/* Canvas + Step List */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Box
            ref={canvasRef}
            sx={{
              position: "relative",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 8px 32px 0 rgba(44,62,80,0.12)",
              background: colors.background.paper,
              border: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "480px",
              height: "100%",
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
              border: "1px solid #e0e0e0",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ color: colors.text.primary }}>
                Execution Steps
              </Typography>
              <Tooltip title="Reset Trie">
                <IconButton
                  size="small"
                  onClick={handleReset}
                  disabled={isAnimating}
                  sx={{
                    color: colors.text.primary,
                    background: colors.background.paper,
                    border: "1px solid #e0e0e0",
                    "&:hover": { background: alpha(colors.primary.main, 0.08) },
                  }}
                >
                  <RestartAltIcon />
                </IconButton>
              </Tooltip>
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
                  borderRadius: "4px",
                },
              }}
            >
              {stepList.length === 0 ? (
                <Typography variant="body2" sx={{ color: colors.text.secondary, fontStyle: "italic" }}>
                  Steps will appear here...
                </Typography>
              ) : (
                stepList.map((step, i) => (
                  <Typography
                    key={i}
                    variant="body2"
                    sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap", mb: 0.5, color: colors.text.primary }}
                  >
                    {step}
                  </Typography>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

const LegendItem = ({ color, text, textColor, border }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Box
      sx={{
        width: 18, height: 18,
        borderRadius: "50%",
        backgroundColor: color,
        border: border ? `3px solid #10b981` : "2px solid rgba(0,0,0,0.1)",
      }}
    />
    <Typography variant="body2" sx={{ fontWeight: 500, color: textColor }}>{text}</Typography>
  </Stack>
);

export default TrieLab;

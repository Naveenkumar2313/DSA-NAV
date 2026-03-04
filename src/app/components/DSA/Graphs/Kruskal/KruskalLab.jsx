import React, { useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Controls,
  Background
} from "react-flow-renderer";
import { useTheme } from "@mui/material/styles";

// Material UI Imports
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Paper,
  Grid,
  Stack,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";

// Material UI Icons
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReplayIcon from "@mui/icons-material/Replay";
import BuildIcon from "@mui/icons-material/Build";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

// --- Theme Colors Function ---
const getSimulationColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  return {
    primary: {
      main: isDark ? "#60a5fa" : "#1976d2",
      light: isDark ? "#93c5fd" : "#64b5f6",
      dark: isDark ? "#2563eb" : "#1565c0"
    },
    secondary: {
      main: isDark ? "#a78bfa" : "#673ab7",
      light: isDark ? "#c4b5fd" : "#9575cd"
    },
    success: {
      main: isDark ? "#4ade80" : "#4CAF50",
      light: isDark ? "#86efac" : "#81c784"
    },
    warning: {
      main: isDark ? "#fbbf24" : "#FFC107",
      light: isDark ? "#fcd34d" : "#ffecb3"
    },
    error: {
      main: isDark ? "#f87171" : "#d32f2f"
    },
    background: {
      default: isDark ? "#222A45" : "#f7f9fc",
      paper: isDark ? "#222A45" : "#ffffff",
      card: isDark ? "#0a0a0a" : "#f1f5f9",
      log: isDark ? "#1a2038" : "#fafafa",
      logborder: isDark ? "#333333" : "#eeeeee"
    },
    text: {
      primary: isDark ? "#f1f5f9" : "#1e293b",
      secondary: isDark ? "#cbd5e1" : "#64748b",
      muted: isDark ? "#94a3b8" : "#9e9e9e"
    },
    border: isDark ? "#333333" : "#e0e0e0",
    divider: isDark ? "#2d3548" : "#e2e8f0",
    node: {
      default: isDark ? "#1a1a1a" : "#ffffff",
      visited: isDark ? "#60a5fa" : "#2196F3",
      visitedBorder: isDark ? "#3b82f6" : "#1976D2",
      current: isDark ? "#fbbf24" : "#FFC107",
      currentBorder: isDark ? "#f59e0b" : "#FFA000",
      found: isDark ? "#4ade80" : "#4CAF50",
      foundBorder: isDark ? "#22c55e" : "#388E3C",
      mst: isDark ? "#ec4899" : "#E91E63"
    },
    edge: {
      default: isDark ? "#2a2a2a" : "#b1b1b7",
      visited: isDark ? "#60a5fa" : "#1976D2",
      mst: isDark ? "#ec4899" : "#E91E63"
    },
    flow: {
      background: isDark ? "#000000" : "#ffffff"
    }
  };
};

// Custom timeout hook
const useTimeout = (callback, delay) => {
  const callbackRef = React.useRef(callback);
  const timeoutRef = React.useRef();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const set = useCallback(() => {
    timeoutRef.current = setTimeout(() => callbackRef.current(), delay);
  }, [delay]);

  const clear = useCallback(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    return clear;
  }, [delay, set, clear]);

  return { set, clear };
};

const KruskalLab = ({ showSnackbar }) => {
  const theme = useTheme();
  const colors = getSimulationColors(theme);
  const themeMode = theme?.palette?.mode || "light";

  // --- Refs ---
  const successAudioRef = useRef(null);
  const failAudioRef = useRef(null);
  const stepAudioRef = useRef(null);
  const logContainerRef = useRef(null);

  // React Flow State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Simulation State
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [sortedEdges, setSortedEdges] = useState([]);
  const [mstEdges, setMstEdges] = useState([]);
  const [processedEdges, setProcessedEdges] = useState([]);
  const [currentEdgeIdx, setCurrentEdgeIdx] = useState(0);
  const [traversalLog, setTraversalLog] = useState("");
  const [stepCounter, setStepCounter] = useState(1);
  const [isStepping, setIsStepping] = useState(false);
  const [history, setHistory] = useState([]);
  const [totalWeight, setTotalWeight] = useState(0);

  // UI State
  const [layoutMode, setLayoutMode] = useState("circular");
  const [nodeCount, setNodeCount] = useState(6);
  const [nodeValues, setNodeValues] = useState(
    Array.from({ length: 6 }, (_, i) => String.fromCharCode(65 + i))
  );
  const [edgesInput, setEdgesInput] = useState([
    { from: "0", to: "1", weight: "4" },
    { from: "0", to: "2", weight: "2" },
    { from: "1", to: "2", weight: "1" },
    { from: "1", to: "3", weight: "5" },
    { from: "2", to: "3", weight: "8" },
    { from: "3", to: "4", weight: "2" },
    { from: "3", to: "5", weight: "6" },
    { from: "4", to: "5", weight: "3" }
  ]);
  const [statusMessage, setStatusMessage] = useState("Status: Build a graph to start.");
  const [animationSpeed] = useState(800);
  const [isGraphBuilt, setIsGraphBuilt] = useState(false);

  // --- Audio Logic ---
  const playSound = (type) => {
    let audioRef;
    if (type === "success") audioRef = successAudioRef;
    else if (type === "failure") audioRef = failAudioRef;
    else audioRef = stepAudioRef;

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => console.error("Audio play failed:", error));
    }
  };

  const appendToLog = (message) => {
    setTraversalLog((prev) => prev + message);
  };

  const simulationTimeout = useTimeout(performStep, animationSpeed);

  // --- Simulation Control Handlers ---
  const resetSimulation = useCallback(() => {
    simulationTimeout.clear();
    setIsRunning(false);
    setIsFinished(false);
    setIsStepping(false);
    setSortedEdges([]);
    setMstEdges([]);
    setProcessedEdges([]);
    setTraversalLog("");
    setStepCounter(1);
    setCurrentEdgeIdx(0);
    setHistory([]);
    setTotalWeight(0);
    setStatusMessage("Status: Ready");
    setNodes((nds) => nds.map((n) => ({ ...n, style: {} })));
    setEdges((eds) => eds.map((e) => ({ ...e, style: {}, animated: false })));
    setIsGraphBuilt(false);
  }, [setNodes, setEdges, simulationTimeout]);

  // --- Graph Building Logic ---
  const handleBuildGraph = useCallback(() => {
    if (nodeCount <= 0) {
      showSnackbar("Please enter a valid number of nodes.", "error");
      return;
    }

    resetSimulation();

    let newNodes = [];
    let newEdges = [];

    newNodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: `${i}`,
      data: { label: nodeValues[i] || `N${i}` },
      position: { x: 0, y: 0 }
    }));

    const validEdges = edgesInput.filter(
      (e) =>
        e.from &&
        e.to &&
        e.weight &&
        !isNaN(parseInt(e.from)) &&
        !isNaN(parseInt(e.to)) &&
        !isNaN(parseInt(e.weight)) &&
        parseInt(e.from) < nodeCount &&
        parseInt(e.to) < nodeCount &&
        parseInt(e.from) !== parseInt(e.to)
    );

    validEdges.forEach((edge) => {
      const fromIdx = parseInt(edge.from);
      const toIdx = parseInt(edge.to);
      const weight = parseInt(edge.weight);

      newEdges.push({
        id: `e${fromIdx}-${toIdx}`,
        source: `${fromIdx}`,
        target: `${toIdx}`,
        type: "smoothstep",
        animated: false,
        data: { weight }
      });
    });

    const positionedNodes = positionNodesLayout(newNodes, layoutMode);

    setNodes(positionedNodes);
    setEdges(newEdges);

    // Sort edges by weight for Kruskal's
    const edgeList = newEdges.map((e) => ({
      id: e.id,
      from: e.source,
      to: e.target,
      weight: e.data.weight,
      original: e
    }));
    const sorted = [...edgeList].sort((a, b) => a.weight - b.weight);
    setSortedEdges(sorted);

    setStatusMessage("Graph built. Ready for Kruskal's Algorithm!");
    showSnackbar("Graph built successfully!", "success");
    setIsGraphBuilt(true);
  }, [nodeCount, nodeValues, edgesInput, layoutMode, resetSimulation, showSnackbar]);

  const positionNodesLayout = (nodes, layout) => {
    const width = 600;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;

    if (layout === "circular") {
      const radius = Math.min(width, height) * 0.35;
      return nodes.map((node, i) => {
        const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
        return {
          ...node,
          position: {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          }
        };
      });
    } else if (layout === "grid") {
      const cols = Math.ceil(Math.sqrt(nodes.length));
      const spacing = 120;
      return nodes.map((node, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        return {
          ...node,
          position: {
            x: col * spacing + 50,
            y: row * spacing + 50
          }
        };
      });
    } else {
      return nodes.map((node, i) => ({
        ...node,
        position: {
          x: (i % 4) * 150 + 100,
          y: Math.floor(i / 4) * 120 + 50
        }
      }));
    }
  };

  // DSU Implementation
  class DSU {
    constructor(n) {
      this.parent = Array.from({ length: n }, (_, i) => i);
      this.rank = Array(n).fill(0);
    }

    find(x) {
      if (this.parent[x] !== x) {
        this.parent[x] = this.find(this.parent[x]);
      }
      return this.parent[x];
    }

    union(x, y) {
      const px = this.find(x);
      const py = this.find(y);
      if (px === py) return false;

      if (this.rank[px] < this.rank[py]) {
        this.parent[px] = py;
      } else if (this.rank[px] > this.rank[py]) {
        this.parent[py] = px;
      } else {
        this.parent[py] = px;
        this.rank[px]++;
      }
      return true;
    }
  }

  // --- Simulation Core Logic ---
  function performStep() {
    if (currentEdgeIdx >= sortedEdges.length) {
      if (!isFinished) {
        simulationTimeout.clear();
        playSound("success");
        setStatusMessage(`✓ MST Complete! Total Weight: ${totalWeight}`);
        appendToLog(`\nMinimum Spanning Tree Complete!\nTotal Weight: ${totalWeight}\n`);
        setIsRunning(false);
        setIsFinished(true);
      }
      return;
    }

    const dsu = new DSU(nodeCount);
    mstEdges.forEach((e) => {
      dsu.union(parseInt(e.from), parseInt(e.to));
    });

    const edge = sortedEdges[currentEdgeIdx];
    const fromIdx = parseInt(edge.from);
    const toIdx = parseInt(edge.to);

    if (dsu.union(fromIdx, toIdx)) {
      // Edge is part of MST
      setMstEdges((prev) => [...prev, edge]);
      setTotalWeight((prev) => prev + edge.weight);
      appendToLog(`Step ${stepCounter}: Edge (${edge.from}-${edge.to}) weight ${edge.weight} ✓ ACCEPTED\n`);
      playSound("step");
    } else {
      // Edge creates cycle
      appendToLog(`Step ${stepCounter}: Edge (${edge.from}-${edge.to}) weight ${edge.weight} ✗ REJECTED (cycle)\n`);
    }

    setProcessedEdges((prev) => [...prev, edge]);
    setCurrentEdgeIdx((prev) => prev + 1);
    setStepCounter((prev) => prev + 1);

    setHistory((prev) => [
      ...prev,
      {
        mstEdges: [...mstEdges],
        processedEdges: [...processedEdges],
        currentEdgeIdx,
        traversalLog,
        stepCounter,
        statusMessage,
        totalWeight
      }
    ]);
  }

  useEffect(() => {
    if (isRunning && !isFinished) {
      simulationTimeout.set();
    }
    if (isStepping) {
      performStep();
      setIsStepping(false);
      setIsRunning(false);
    }
  }, [isRunning, isFinished, isStepping]);

  const handleRunPause = () => {
    if (!isGraphBuilt) {
      showSnackbar("Please build a graph first.", "warning");
      return;
    }
    if (nodes.length === 0) {
      showSnackbar("Please build a graph first.", "warning");
      return;
    }
    if (isFinished) {
      showSnackbar("Algorithm is complete. Please reset.", "info");
      return;
    }

    if (isRunning) {
      simulationTimeout.clear();
      setStatusMessage(`Status: Paused at Step ${stepCounter - 1}`);
    } else {
      if (sortedEdges.length === 0) {
        const edgeList = edges.map((e) => ({
          id: e.id,
          from: e.source,
          to: e.target,
          weight: e.data?.weight || 1
        }));
        const sorted = [...edgeList].sort((a, b) => a.weight - b.weight);
        setSortedEdges(sorted);
      }
      setStatusMessage("Status: Running Kruskal's Algorithm...");
    }
    setIsRunning(!isRunning);
  };

  const handleStep = () => {
    if (!isGraphBuilt) {
      showSnackbar("Please build a graph first.", "warning");
      return;
    }
    if (isFinished) {
      showSnackbar("Algorithm is complete. Please reset.", "info");
      return;
    }
    simulationTimeout.clear();
    setIsRunning(false);
    setIsStepping(true);
  };

  const handlePrevStep = () => {
    if (history.length === 0) return;

    simulationTimeout.clear();
    const lastState = history[history.length - 1];

    setMstEdges(lastState.mstEdges);
    setProcessedEdges(lastState.processedEdges);
    setCurrentEdgeIdx(lastState.currentEdgeIdx);
    setTraversalLog(lastState.traversalLog);
    setStepCounter(lastState.stepCounter);
    setStatusMessage(lastState.statusMessage);
    setTotalWeight(lastState.totalWeight);
    setIsRunning(false);

    setHistory((prev) => prev.slice(0, -1));
  };

  // --- Style updates based on state ---
  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => {
        const isMST = mstEdges.some((e) => e.id === edge.id);
        const isProcessing = processedEdges.some((e) => e.id === edge.id) && !isMST;

        return {
          ...edge,
          style: {
            stroke: isMST ? colors.node.mst : isProcessing ? colors.edge.visited : colors.edge.default,
            strokeWidth: isMST ? 4 : 2.5,
            opacity: 1
          },
          animated: isMST ? true : false,
          label: edge.data?.weight?.toString() || "1"
        };
      })
    );
  }, [mstEdges, processedEdges, setEdges, colors]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [traversalLog]);

  // --- UI Handlers ---
  const handleNodeCountChange = (event) => {
    const count = Math.min(parseInt(event.target.value) || 0, 12);
    setNodeCount(count);
    setNodeValues(Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i)));
  };

  const handleCopySteps = () => {
    navigator.clipboard
      .writeText(traversalLog)
      .then(() => showSnackbar("✓ Steps copied to clipboard!", "success"))
      .catch(() => showSnackbar("✗ Failed to copy steps.", "error"));
  };

  return (
    <Box
      key={`kruskal-lab-${themeMode}`}
      sx={{
        bgcolor: colors.background.default,
        minHeight: "100vh",
        width: "100%",
        p: { xs: 2, md: 3 }
      }}
    >
      <audio ref={stepAudioRef} src="/DSA/step.mp3" preload="auto"></audio>
      <audio ref={successAudioRef} src="/DSA/success.mp3" preload="auto"></audio>
      <audio ref={failAudioRef} src="/DSA/fail.mp3" preload="auto"></audio>

      <Typography
        variant="h5"
        align="center"
        sx={{ mb: 2, color: colors.text.primary, fontWeight: 700 }}
      >
        Kruskal's Algorithm Simulator
      </Typography>

      <Paper
        sx={{
          p: 2,
          mb: 3,
          bgcolor: colors.background.paper,
          boxShadow:
            colors.background.default === "#000000"
              ? "0px 4px 20px rgba(0, 0, 0, 0.3)"
              : "0px 4px 20px rgba(0, 0, 0, 0.05)",
          borderRadius: "16px"
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: colors.text.secondary }}>Layout</InputLabel>
              <Select
                value={layoutMode}
                label="Layout"
                onChange={(e) => setLayoutMode(e.target.value)}
                sx={{
                  color: colors.text.primary,
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.border },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: colors.primary.main },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.primary.main
                  },
                  "& .MuiSvgIcon-root": { color: colors.text.secondary }
                }}
              >
                <MenuItem value="circular">Circular</MenuItem>
                <MenuItem value="grid">Grid</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Number of Nodes"
              type="number"
              value={nodeCount}
              onChange={handleNodeCountChange}
              inputProps={{ min: 2, max: 12 }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: colors.text.primary,
                  "& fieldset": { borderColor: colors.border },
                  "&:hover fieldset": { borderColor: colors.primary.main },
                  "&.Mui-focused fieldset": { borderColor: colors.primary.main }
                },
                "& .MuiInputLabel-root": { color: colors.text.secondary }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<BuildIcon />}
              onClick={handleBuildGraph}
              sx={{
                bgcolor: colors.primary.main,
                "&:hover": { bgcolor: colors.primary.dark }
              }}
            >
              Build Graph
            </Button>
          </Grid>

          {isGraphBuilt && (
            <Grid item xs={12}>
              <Box
                sx={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  p: 1.5,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 2,
                  bgcolor: colors.background.log
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: "medium", color: colors.text.primary }}
                >
                  Edges (From → To → Weight)
                </Typography>
                <Grid container spacing={1.5}>
                  {edgesInput.map((edge, i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          label="From"
                          type="number"
                          value={edge.from}
                          onChange={(e) => {
                            const newEdges = [...edgesInput];
                            newEdges[i].from = e.target.value;
                            setEdgesInput(newEdges);
                          }}
                          size="small"
                          inputProps={{ min: 0, max: nodeCount - 1 }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              color: colors.text.primary,
                              "& fieldset": { borderColor: colors.border }
                            },
                            width: "50px"
                          }}
                        />
                        <Typography sx={{ color: colors.text.primary }}>→</Typography>
                        <TextField
                          label="To"
                          type="number"
                          value={edge.to}
                          onChange={(e) => {
                            const newEdges = [...edgesInput];
                            newEdges[i].to = e.target.value;
                            setEdgesInput(newEdges);
                          }}
                          size="small"
                          inputProps={{ min: 0, max: nodeCount - 1 }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              color: colors.text.primary,
                              "& fieldset": { borderColor: colors.border }
                            },
                            width: "50px"
                          }}
                        />
                        <Typography sx={{ color: colors.text.primary }}>W:</Typography>
                        <TextField
                          label="Weight"
                          type="number"
                          value={edge.weight}
                          onChange={(e) => {
                            const newEdges = [...edgesInput];
                            newEdges[i].weight = e.target.value;
                            setEdgesInput(newEdges);
                          }}
                          size="small"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              color: colors.text.primary,
                              "& fieldset": { borderColor: colors.border }
                            },
                            width: "60px"
                          }}
                        />
                      </Stack>
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <Button
                      size="small"
                      onClick={() =>
                        setEdgesInput([...edgesInput, { from: "", to: "", weight: "" }])
                      }
                      sx={{ color: colors.primary.main }}
                    >
                      + Add Edge
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              height: "100%",
              p: 1.5,
              minHeight: 500,
              bgcolor: colors.flow.background,
              boxShadow:
                colors.background.default === "#000000"
                  ? "0px 4px 20px rgba(0, 0, 0, 0.3)"
                  : "0px 4px 20px rgba(0, 0, 0, 0.05)",
              borderRadius: "16px"
            }}
          >
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
              >
                <Controls showInteractive={false} />
                <Background color={colors.text.muted} />
              </ReactFlow>
            </ReactFlowProvider>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              bgcolor: colors.background.paper,
              boxShadow:
                colors.background.default === "#000000"
                  ? "0px 4px 20px rgba(0, 0, 0, 0.3)"
                  : "0px 4px 20px rgba(0, 0, 0, 0.05)",
              borderRadius: "16px"
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1, flexShrink: 0 }}
            >
              <Typography variant="h6" sx={{ color: colors.text.primary, fontWeight: 600 }}>
                Log & Status
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Reset">
                  <IconButton
                    size="small"
                    onClick={resetSimulation}
                    sx={{ color: colors.text.secondary }}
                  >
                    <ReplayIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Previous Step">
                  <IconButton
                    size="small"
                    onClick={handlePrevStep}
                    disabled={history.length === 0}
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
                    sx={{ background: isRunning ? colors.warning.light : colors.success.light }}
                  >
                    {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
            <Typography
              variant="body2"
              sx={{ mb: 1, color: colors.text.secondary, fontStyle: "italic", flexShrink: 0 }}
            >
              {statusMessage}
            </Typography>
            <Box
              sx={{
                flexGrow: 1,
                minHeight: 200,
                bgcolor: colors.background.log,
                borderRadius: 1,
                p: 1,
                border: `1px solid ${colors.background.logborder}`,
                overflowY: "auto"
              }}
            >
              <TextField
                inputRef={logContainerRef}
                value={traversalLog}
                multiline
                fullWidth
                readOnly
                variant="standard"
                sx={{
                  height: "100%",
                  "& .MuiInputBase-root": {
                    height: "100%",
                    alignItems: "flex-start",
                    color: colors.text.primary
                  },
                  "& .MuiInputBase-input": {
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                    overflowY: "auto !important",
                    height: "100% !important",
                    color: colors.text.primary
                  }
                }}
                InputProps={{ disableUnderline: true }}
              />
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopySteps}
              sx={{
                mt: 1.5,
                flexShrink: 0,
                bgcolor: colors.secondary.main,
                "&:hover": { bgcolor: colors.secondary.light }
              }}
            >
              Copy Log
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KruskalLab;

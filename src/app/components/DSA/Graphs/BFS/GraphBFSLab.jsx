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
  FormControlLabel
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
      foundBorder: isDark ? "#22c55e" : "#388E3C"
    },
    edge: {
      default: isDark ? "#2a2a2a" : "#b1b1b7",
      visited: isDark ? "#60a5fa" : "#1976D2",
      traversed: isDark ? "#fbbf24" : "#FFA000"
    },
    flow: {
      background: isDark ? "#000000" : "#ffffff"
    }
  };
};

// A custom hook for managing the simulation timeout
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

const GraphBFSLab = ({ showSnackbar }) => {
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
  const [simulationQueue, setSimulationQueue] = useState([]);
  const [visitedSet, setVisitedSet] = useState(new Set());
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [traversalLog, setTraversalLog] = useState("");
  const [stepCounter, setStepCounter] = useState(1);
  const [isStepping, setIsStepping] = useState(false);
  const [history, setHistory] = useState([]);

  // UI State
  const [targetValue, setTargetValue] = useState("");
  const [layoutMode, setLayoutMode] = useState("circular");
  const [nodeCount, setNodeCount] = useState(7);
  const [nodeValues, setNodeValues] = useState(
    Array.from({ length: 7 }, (_, i) => String.fromCharCode(65 + i))
  );
  const [edgesInput, setEdgesInput] = useState([
    { from: "0", to: "1" },
    { from: "0", to: "2" },
    { from: "1", to: "3" },
    { from: "1", to: "4" },
    { from: "2", to: "5" },
    { from: "2", to: "6" }
  ]);
  const [statusMessage, setStatusMessage] = useState("Status: Build a graph to start.");
  const [animationSpeed] = useState(600);
  const [isGraphBuilt, setIsGraphBuilt] = useState(false);
  const [isDirected, setIsDirected] = useState(false);
  const [startNodeId, setStartNodeId] = useState("0");

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

  // --- Utility Functions ---
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
    setSimulationQueue([]);
    setVisitedSet(new Set());
    setTraversalLog("");
    setStepCounter(1);
    setCurrentNodeId(null);
    setHistory([]);
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

    // Build edges based on input
    if (layoutMode === "manual") {
      const validEdges = edgesInput.filter(
        (e) =>
          e.from &&
          e.to &&
          !isNaN(parseInt(e.from)) &&
          !isNaN(parseInt(e.to)) &&
          parseInt(e.from) < nodeCount &&
          parseInt(e.to) < nodeCount
      );

      validEdges.forEach((edge) => {
        newEdges.push({
          id: `e${edge.from}-${edge.to}`,
          source: `${edge.from}`,
          target: `${edge.to}`,
          type: "smoothstep",
          animated: false,
          markerEnd: isDirected ? { type: "arrowclosed" } : undefined
        });

        // Add reverse edge if undirected
        if (!isDirected) {
          newEdges.push({
            id: `e${edge.to}-${edge.from}`,
            source: `${edge.to}`,
            target: `${edge.from}`,
            type: "smoothstep",
            animated: false,
            style: { opacity: 0 } // Hidden reverse edge for undirected graphs
          });
        }
      });
    } else {
      // Auto layout - create a sample graph structure
      const edgesList = [];
      if (layoutMode === "circular") {
        // Create a circular graph with some cross edges
        for (let i = 0; i < nodeCount; i++) {
          const next = (i + 1) % nodeCount;
          edgesList.push({ from: i, to: next });
          
          // Add some cross connections
          if (i < nodeCount - 2) {
            edgesList.push({ from: i, to: i + 2 });
          }
        }
      } else if (layoutMode === "grid") {
        // Create a grid-like graph
        const cols = Math.ceil(Math.sqrt(nodeCount));
        for (let i = 0; i < nodeCount; i++) {
          // Right neighbor
          if ((i + 1) % cols !== 0 && i + 1 < nodeCount) {
            edgesList.push({ from: i, to: i + 1 });
          }
          // Bottom neighbor
          if (i + cols < nodeCount) {
            edgesList.push({ from: i, to: i + cols });
          }
        }
      }

      edgesList.forEach((edge) => {
        newEdges.push({
          id: `e${edge.from}-${edge.to}`,
          source: `${edge.from}`,
          target: `${edge.to}`,
          type: "smoothstep",
          animated: false,
          markerEnd: isDirected ? { type: "arrowclosed" } : undefined
        });

        if (!isDirected) {
          newEdges.push({
            id: `e${edge.to}-${edge.from}`,
            source: `${edge.to}`,
            target: `${edge.from}`,
            type: "smoothstep",
            animated: false,
            style: { opacity: 0 }
          });
        }
      });
    }

    // Position nodes based on layout
    const positionedNodes = positionNodesLayout(newNodes, layoutMode);

    setNodes(positionedNodes);
    setEdges(newEdges);
    setStatusMessage("Graph built. Ready to search!");
    showSnackbar("Graph built successfully!", "success");
    setIsGraphBuilt(true);
  }, [nodeCount, nodeValues, edgesInput, layoutMode, isDirected, resetSimulation, showSnackbar]);

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
      // Manual - random or user-defined
      return nodes.map((node, i) => ({
        ...node,
        position: {
          x: (i % 4) * 150 + 100,
          y: Math.floor(i / 4) * 120 + 50
        }
      }));
    }
  };

  // --- Simulation Core Logic ---
  function performStep() {
    setHistory((prev) => [
      ...prev,
      {
        simulationQueue,
        visitedSet,
        currentNodeId,
        traversalLog,
        stepCounter,
        statusMessage,
        isFinished
      }
    ]);

    playSound("step");
    if (simulationQueue.length === 0) {
      setStatusMessage(`Target '${targetValue}' not found.`);
      appendToLog(`\nTarget '${targetValue}' not found.`);
      playSound("failure");
      setIsRunning(false);
      setIsFinished(true);
      setCurrentNodeId(null);
      return;
    }

    const newQueue = [...simulationQueue];
    const nodeId = newQueue.shift();
    const node = nodes.find((n) => n.id === nodeId);

    setCurrentNodeId(nodeId);
    setStatusMessage(`Dequeued ${node.data.label}.`);

    if (visitedSet.has(nodeId)) {
      appendToLog(`Step ${stepCounter}: Node ${node.data.label} already visited. Skipping.\n`);
      setStepCounter((c) => c + 1);
      setSimulationQueue(newQueue);
      return;
    }

    const newVisited = new Set(visitedSet).add(nodeId);
    setVisitedSet(newVisited);
    appendToLog(`Step ${stepCounter}: Visiting ${node.data.label}.\n`);
    setStepCounter((c) => c + 1);

    if (node.data.label === targetValue) {
      simulationTimeout.clear();
      playSound("success");
      setStatusMessage(`✓ Found: ${targetValue}!`);
      appendToLog(`Target found! Halting simulation.\n`);
      setIsRunning(false);
      setIsFinished(true);
      return;
    }

    // Get neighbors from edges
    const neighbors = edges
      .filter((e) => e.source === nodeId && e.style?.opacity !== 0)
      .map((e) => e.target);

    let neighborsLog = "Adding to queue: ";
    let pushedSomething = false;
    neighbors.forEach((neighborId) => {
      if (!newVisited.has(neighborId)) {
        newQueue.push(neighborId);
        const neighborNode = nodes.find((n) => n.id === neighborId);
        neighborsLog += `${neighborNode.data.label} `;
        pushedSomething = true;
      }
    });

    if (pushedSomething) {
      appendToLog(neighborsLog + "\n");
    } else {
      appendToLog("No unvisited neighbors to add.\n");
    }

    setSimulationQueue(newQueue);
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
  }, [isRunning, isFinished, simulationQueue, isStepping]);

  const handleRunPause = () => {
    if (isGraphBuilt && !targetValue.trim()) {
      showSnackbar("Please enter a search target first.", "error");
      return;
    }
    if (nodes.length === 0) {
      showSnackbar("Please build a graph first.", "warning");
      return;
    }
    if (isFinished) {
      showSnackbar("Search is complete. Please reset.", "info");
      return;
    }

    if (isRunning) {
      simulationTimeout.clear();
      setStatusMessage(`Status: Paused at Step ${stepCounter - 1}`);
    } else {
      if (simulationQueue.length === 0 && visitedSet.size === 0) {
        setSimulationQueue([startNodeId]);
      }
      setStatusMessage("Status: Running...");
    }
    setIsRunning(!isRunning);
  };

  const handleStep = () => {
    if (isGraphBuilt && !targetValue.trim()) {
      showSnackbar("Please enter a search target first.", "error");
      return;
    }
    if (nodes.length === 0) {
      showSnackbar("Please build a graph first.", "warning");
      return;
    }
    if (isFinished) {
      showSnackbar("Search is complete. Please reset.", "info");
      return;
    }
    simulationTimeout.clear();
    setIsRunning(false);
    if (simulationQueue.length === 0 && visitedSet.size === 0) {
      setSimulationQueue([startNodeId]);
    }
    setIsStepping(true);
  };

  const handlePrevStep = () => {
    if (history.length === 0) return;

    simulationTimeout.clear();
    const lastState = history[history.length - 1];

    setSimulationQueue(lastState.simulationQueue);
    setVisitedSet(lastState.visitedSet);
    setCurrentNodeId(lastState.currentNodeId);
    setTraversalLog(lastState.traversalLog);
    setStepCounter(lastState.stepCounter);
    setStatusMessage(lastState.statusMessage);
    setIsFinished(lastState.isFinished);
    setIsRunning(false);

    setHistory((prev) => prev.slice(0, -1));
  };

  // --- Style updates based on state ---
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const isCurrent = node.id === currentNodeId;
        const isVisited = visitedSet.has(node.id);
        const isFound = isVisited && node.data.label === targetValue && targetValue.trim() !== "";

        const style = {
          transition: "all 0.5s ease",
          border: `2px solid ${colors.border}`,
          borderRadius: "50%",
          backgroundColor: colors.node.default,
          color: colors.text.primary,
          width: 50,
          height: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        };
        if (isFound) {
          style.backgroundColor = colors.node.found;
          style.color = "white";
          style.border = `3px solid ${colors.node.foundBorder}`;
          style.boxShadow = `0 0 15px ${colors.node.found}`;
        } else if (isCurrent) {
          style.backgroundColor = colors.node.current;
          style.border = `3px solid ${colors.node.currentBorder}`;
          style.boxShadow = `0 0 15px ${colors.node.current}`;
        } else if (isVisited) {
          style.backgroundColor = colors.node.visited;
          style.color = "white";
          style.border = `3px solid ${colors.node.visitedBorder}`;
        }
        return { ...node, style };
      })
    );
    setEdges((eds) =>
      eds.map((edge) => {
        const sourceVisited = visitedSet.has(edge.source);
        const targetVisited = visitedSet.has(edge.target);
        const isTraversing = edge.source === currentNodeId;

        return {
          ...edge,
          animated: isTraversing && !visitedSet.has(edge.target),
          style: {
            ...edge.style,
            stroke:
              sourceVisited && targetVisited
                ? colors.edge.visited
                : isTraversing
                ? colors.edge.traversed
                : colors.edge.default,
            strokeWidth: sourceVisited && targetVisited ? 3 : 2.5,
            opacity: edge.style?.opacity !== undefined ? edge.style.opacity : 1
          }
        };
      })
    );
  }, [currentNodeId, visitedSet, setNodes, setEdges, targetValue, colors]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [traversalLog]);

  // --- UI Handlers ---
  const handleNodeCountChange = (event) => {
    const count = Math.min(parseInt(event.target.value) || 0, 15);
    setNodeCount(count);
    setNodeValues(Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i)));
    setEdgesInput(
      Array.from({ length: Math.max(0, count - 1) }, (_, i) => ({
        from: `${i}`,
        to: `${i + 1}`
      }))
    );
  };

  const handleCopySteps = () => {
    navigator.clipboard
      .writeText(traversalLog)
      .then(() => showSnackbar("✓ Steps copied to clipboard!", "success"))
      .catch(() => showSnackbar("✗ Failed to copy steps.", "error"));
  };

  // --- Render ---
  return (
    <Box
      key={`graph-bfs-lab-${themeMode}`}
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
        Graph BFS Simulator
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
          <Grid item xs={12} md={isGraphBuilt ? 2.5 : 3}>
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
                <MenuItem value="manual">Manual Edges</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={isGraphBuilt ? 2 : 2.5}>
            <TextField
              fullWidth
              size="small"
              label="Number of Nodes"
              type="number"
              value={nodeCount}
              onChange={handleNodeCountChange}
              inputProps={{ min: 1, max: 15 }}
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
          <Grid item xs={12} md={isGraphBuilt ? 1.5 : 2}>
            <TextField
              fullWidth
              size="small"
              label="Start Node"
              type="number"
              value={startNodeId}
              onChange={(e) => setStartNodeId(e.target.value)}
              inputProps={{ min: 0, max: nodeCount - 1 }}
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
          {isGraphBuilt && (
            <Grid item xs={12} md={2.5}>
              <TextField
                fullWidth
                size="small"
                label="Search Target"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value.toUpperCase())}
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
          )}
          <Grid item xs={12} md={isGraphBuilt ? 1.5 : 2}>
            <FormControlLabel
              control={
                <Switch
                  checked={isDirected}
                  onChange={(e) => setIsDirected(e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: colors.primary.main
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: colors.primary.main
                    }
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: colors.text.primary }}>
                  Directed
                </Typography>
              }
            />
          </Grid>
          <Grid item xs={12} md={isGraphBuilt ? 2 : 2.5}>
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
          {layoutMode === "manual" && (
            <Grid item xs={12}>
              <Box
                sx={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  p: 1.5,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 2
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: "medium", color: colors.text.primary }}
                >
                  Edges (From → To)
                </Typography>
                <Grid container spacing={2}>
                  {edgesInput.map((edge, i) => (
                    <Grid item xs={6} sm={4} md={3} key={i}>
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              color: colors.text.primary,
                              "& fieldset": { borderColor: colors.border }
                            },
                            "& .MuiInputLabel-root": { color: colors.text.secondary }
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              color: colors.text.primary,
                              "& fieldset": { borderColor: colors.border }
                            },
                            "& .MuiInputLabel-root": { color: colors.text.secondary }
                          }}
                        />
                      </Stack>
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <Button
                      size="small"
                      onClick={() =>
                        setEdgesInput([...edgesInput, { from: "", to: "" }])
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
                border: `1px solid ${colors.background.logborder}`
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

export default GraphBFSLab;

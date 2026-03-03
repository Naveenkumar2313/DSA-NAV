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
  Snackbar,
  Alert
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
      visited: isDark ? "#60a5fa" : "#1976D2"
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

const DFSLab = () => {
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
  const [simulationStack, setSimulationStack] = useState([]);
  const [visitedSet, setVisitedSet] = useState(new Set());
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [traversalLog, setTraversalLog] = useState("");
  const [stepCounter, setStepCounter] = useState(1);
  const [isStepping, setIsStepping] = useState(false);
  const [history, setHistory] = useState([]);

    // --- Snackbar State ---
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // UI State
  const [targetValue, setTargetValue] = useState("");
  const [layoutMode, setLayoutMode] = useState("auto");
  const [nodeCount, setNodeCount] = useState(7);
  const [nodeValues, setNodeValues] = useState(
    Array.from({ length: 7 }, (_, i) => String.fromCharCode(65 + i))
  );
  const [edgesInput, setEdgesInput] = useState(
    Array.from({ length: 6 }, () => ({ parent: "", child: "" }))
  );
  const [statusMessage, setStatusMessage] = useState("Status: Build a graph to start.");
  const [animationSpeed] = useState(600);
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

  // --- Utility Functions ---
  const appendToLog = (message) => {
    setTraversalLog((prev) => prev + message + "\n");
  };

  const simulationTimeout = useTimeout(performStep, animationSpeed);

  // --- Simulation Control Handlers ---
  const resetSimulation = useCallback(() => {
    simulationTimeout.clear();
    setIsRunning(false);
    setIsFinished(false);
    setIsStepping(false);
    setSimulationStack([]);
    setVisitedSet(new Set());
    setTraversalLog("");
    setStepCounter(1);
    setCurrentNodeId(null);
    setHistory([]);
    setStatusMessage("Status: Ready");
    setNodes((nds) => nds.map((n) => ({ ...n, style: {} })));
    setEdges((eds) => eds.map((e) => ({ ...e, style: {}, animated: false })));
    setIsGraphBuilt(true); // Keep the graph displayed
  }, [setNodes, setEdges, simulationTimeout]);

  // --- Graph Building Logic ---
  const handleBuildGraph = useCallback(() => {
    if (nodeCount <= 0) {
      showSnackbar("Please enter a valid number of nodes.", "error");
      return;
    }

    resetSimulation();
    setIsGraphBuilt(false);


    let newNodes = [];
    let newEdges = [];

    newNodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: `${i}`,
      data: { label: nodeValues[i] || `N${i}` },
      position: { x: Math.random() * 400, y: Math.random() * 400 }
    }));

    if (layoutMode === "manual") {
      newEdges = edgesInput
        .map((edge) => ({
          id: `e${edge.parent}-${edge.child}`,
          source: `${edge.parent}`,
          target: `${edge.child}`
        }))
        .filter(
          (e) =>
            e.source &&
            e.target &&
            !isNaN(parseInt(e.source)) &&
            !isNaN(parseInt(e.target)) &&
            parseInt(e.source) < nodeCount &&
            parseInt(e.target) < nodeCount
        );
    } else {
        for (let i = 1; i < nodeCount; i++) {
            const target = Math.floor(Math.random() * i);
            newEdges.push({ id: `e${i}-${target}`, source: `${i}`, target: `${target}` });
        }
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setStatusMessage("Graph built. Ready to search!");
    showSnackbar("Graph built successfully!", "success");
    setIsGraphBuilt(true);
  }, [nodeCount, nodeValues, edgesInput, layoutMode, resetSimulation]);

  // --- Simulation Core Logic ---
  function performStep() {
    setHistory((prev) => [
      ...prev,
      {
        simulationStack,
        visitedSet,
        currentNodeId,
        traversalLog,
        stepCounter,
        statusMessage,
        isFinished
      }
    ]);

    if (simulationStack.length === 0) {
      setStatusMessage(`Target '${targetValue}' not found.`);
      appendToLog(`Target '${targetValue}' not found.`);
      playSound("failure");
      setIsRunning(false);
      setIsFinished(true);
      setCurrentNodeId(null);
      return;
    }
    
    playSound("step");

    const newStack = [...simulationStack];
    const nodeId = newStack.pop();
    const node = nodes.find((n) => n.id === nodeId);

    setCurrentNodeId(nodeId);
    setStatusMessage(`Popped ${node.data.label} from stack.`);

    if (visitedSet.has(nodeId)) {
      appendToLog(`Step ${stepCounter}: Node ${node.data.label} already visited. Skipping.`);
      setStepCounter((c) => c + 1);
      setSimulationStack(newStack);
      if(isRunning) {
        simulationTimeout.set();
      }
      return;
    }

    const newVisited = new Set(visitedSet).add(nodeId);
    setVisitedSet(newVisited);
    appendToLog(`Step ${stepCounter}: Visiting ${node.data.label}.`);
    setStepCounter((c) => c + 1);

    if (node.data.label === targetValue) {
      simulationTimeout.clear();
      playSound("success");
      setStatusMessage(` Found: ${targetValue}!`);
      appendToLog(`Target found! Halting simulation.`);
      setIsRunning(false);
      setIsFinished(true);
      return;
    }

    const neighbors = edges
        .filter((e) => e.source === nodeId || e.target === nodeId)
        .map((e) => (e.source === nodeId ? e.target : e.source));

    let neighborsLog = "Pushing to stack: ";
    let pushedSomething = false;
    // Push in reverse to get a more "natural" traversal if the graph is tree-like
    for(let i = neighbors.length - 1; i >= 0; i--) {
        const neighborId = neighbors[i];
        if (!newVisited.has(neighborId) && !newStack.includes(neighborId)) {
            newStack.push(neighborId);
            const neighborNode = nodes.find((n) => n.id === neighborId);
            neighborsLog += `${neighborNode.data.label} `;
            pushedSomething = true;
        }
    }


    if (pushedSomething) {
      appendToLog(neighborsLog);
    } else {
      appendToLog("No unvisited neighbors to push.");
    }

    setSimulationStack(newStack);
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
  }, [isRunning, isFinished, simulationStack, isStepping]);

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
      resetSimulation();
      setSimulationStack([nodes[0].id]);
      setIsRunning(true);
      setStatusMessage("Status: Running...");
      return;
    }

    if (isRunning) {
      simulationTimeout.clear();
      setStatusMessage(`Status: Paused at Step ${stepCounter - 1}`);
    } else {
      if (simulationStack.length === 0 && visitedSet.size === 0) {
        setSimulationStack([nodes[0].id]);
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
    if (simulationStack.length === 0 && visitedSet.size === 0) {
      setSimulationStack([nodes[0].id]);
    }
    setIsStepping(true);
  };

  const handlePrevStep = () => {
    if (history.length === 0) return;

    simulationTimeout.clear();
    const lastState = history[history.length - 1];

    setSimulationStack(lastState.simulationStack);
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
          border: `2px solid #e0e0e0`,
          borderRadius: "50%",
          backgroundColor: colors.node.default,
          color: colors.text.primary
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
      eds.map((edge) => ({
        ...edge,
        animated: edge.source === currentNodeId && !visitedSet.has(edge.target),
        style: {
          stroke:
            visitedSet.has(edge.source) && visitedSet.has(edge.target)
              ? colors.edge.visited
              : colors.edge.default,
          strokeWidth: 2.5
        }
      }))
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
      Array.from({ length: Math.max(0, count - 1) }, () => ({ parent: "", child: "" }))
    );
  };

  const handleCopySteps = () => {
    navigator.clipboard
      .writeText(traversalLog)
      .then(() => showSnackbar("Steps copied to clipboard!", "success"))
      .catch(() => showSnackbar("Failed to copy steps.", "error"));
  };
  
    const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // --- Render ---
  return (
    <Box
      key={`dfs-lab-${themeMode}`}
      sx={{
        bgcolor: colors.background.default,
        minHeight: "100vh",
        width: "100%",
        p: { xs: 2, md: 3 }
      }}
    >
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    
      <audio ref={stepAudioRef} src="/DSA/step.mp3" preload="auto"></audio>
      <audio ref={successAudioRef} src="/DSA/success.mp3" preload="auto"></audio>
      <audio ref={failAudioRef} src="/DSA/fail.mp3" preload="auto"></audio>

      <Typography
        variant="h5"
        align="center"
        sx={{ mb: 2, color: colors.text.primary, fontWeight: 700 }}
      >
        DFS Simulator
      </Typography>

      <Paper
        sx={{
          p: 2,
          mb: 3,
          bgcolor: colors.background.paper,
          boxShadow:
            themeMode === "dark"
              ? "0px 4px 20px rgba(0, 0, 0, 0.3)"
              : "0px 4px 20px rgba(0, 0, 0, 0.05)",
          borderRadius: "16px"
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={isGraphBuilt ? 3 : 4}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: colors.text.secondary }}>Layout</InputLabel>
              <Select
                value={layoutMode}
                label="Layout"
                onChange={(e) => setLayoutMode(e.target.value)}
                disabled={isRunning}
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
                <MenuItem value="auto">Auto (Random)</MenuItem>
                <MenuItem value="manual">Manual Edges</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={isGraphBuilt ? 3 : 4}>
            <TextField
              fullWidth
              size="small"
              label="Number of Nodes"
              type="number"
              value={nodeCount}
              onChange={handleNodeCountChange}
              disabled={isRunning}
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
          {isGraphBuilt && (
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Search Target"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value.toUpperCase())}
                 disabled={isRunning}
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
          <Grid item xs={12} md={isGraphBuilt ? 3 : 4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<BuildIcon />}
              onClick={handleBuildGraph}
              disabled={isRunning}
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
                  maxHeight: "150px",
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
                  Edges (Node1 - Node2)
                </Typography>
                <Grid container spacing={2}>
                  {Array.from({ length: nodeCount > 1 ? nodeCount - 1 : 0 }).map((_, i) => (
                    <Grid item xs={6} sm={4} md={3} key={i}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          label="Node 1"
                          type="number"
                          value={edgesInput[i]?.parent || ""}
                          disabled={isRunning}
                          onChange={(e) => {
                            const newEdges = [...edgesInput];
                            if (!newEdges[i]) newEdges[i] = {};
                            newEdges[i].parent = e.target.value;
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
                        <Typography sx={{ color: colors.text.primary }}>-</Typography>
                        <TextField
                          label="Node 2"
                          type="number"
                          value={edgesInput[i]?.child || ""}
                          disabled={isRunning}
                          onChange={(e) => {
                            const newEdges = [...edgesInput];
                            if (!newEdges[i]) newEdges[i] = {};
                            newEdges[i].child = e.target.value;
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
                themeMode === "dark"
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
                themeMode === "dark"
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
                    disabled={history.length === 0 || isRunning}
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
                border: `1px solid ${colors.background.logBorder}`
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

export default DFSLab;

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
  Tooltip
} from "@mui/material";

// Material UI Icons
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReplayIcon from "@mui/icons-material/Replay";
import BuildIcon from "@mui/icons-material/Build";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

// Theme-aware color function for simulation
const getSimulationColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  return {
    background: {
      default: isDark ? "#222A45" : "#f7f9fc",
      paper: isDark ? "#222A45" : "#ffffff",
      log: isDark ? "#1a2038" : "#fafafa",
      logborder: isDark ? "#333333" : "#eee"
    },
    text: {
      primary: isDark ? "#f1f5f9" : "#1e3a8a",
      secondary: isDark ? "#94a3b8" : "#64748b",
      muted: isDark ? "#cbd5e1" : "#475569"
    },
    border: {
      primary: isDark ? "#1a1a1a" : "#e0e0e0"
    },
    node: {
      default: isDark ? "#0a0a0a" : "#ffffff",
      defaultBorder: isDark ? "#94a3b8" : "#555",
      visited: isDark ? "#1e40af" : "#2196F3",
      visitedBorder: isDark ? "#3b82f6" : "#1976D2",
      current: isDark ? "#f59e0b" : "#FFC107",
      currentBorder: isDark ? "#d97706" : "#FFA000",
      found: isDark ? "#22c55e" : "#4CAF50",
      foundBorder: isDark ? "#16a34a" : "#388E3C"
    },
    edge: {
      default: isDark ? "#2a2a2a" : "#b1b1b7",
      visited: isDark ? "#3b82f6" : "#1976D2"
    },
    button: {
      warning: isDark ? "#b45309" : "#FFF9C4",
      success: isDark ? "#166534" : "#C8E6C9"
    },
    controls: {
      background: isDark ? "#000000" : "#ffffff",
      border: isDark ? "#333333" : "#e0e0e0",
      iconColor: isDark ? "#f1f5f9" : "#1e3a8a"
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

const DFSLab = ({ showSnackbar }) => {
  // Theme setup
  const theme = useTheme();
  const colors = getSimulationColors(theme);
  const themeMode = theme?.palette?.mode || "light";
  const isDark = themeMode === "dark";

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

  // UI State
  const [targetValue, setTargetValue] = useState("");
  const [layoutMode, setLayoutMode] = useState("auto");
  const [nodeCount, setNodeCount] = useState(7);
  const [nodeValues, setNodeValues] = useState(["A", "B", "C", "D", "E", "F", "G"]);
  const [edgesInput, setEdgesInput] = useState([
    { parent: "0", child: "1" },
    { parent: "0", child: "2" },
    { parent: "1", child: "3" },
    { parent: "1", child: "4" },
    { parent: "2", child: "5" },
    { parent: "2", child: "6" }
  ]);
  const [statusMessage, setStatusMessage] = useState("Status: Build a tree to start.");
  const [animationSpeed] = useState(600);
  const [isTreeBuilt, setIsTreeBuilt] = useState(false);

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
    setSimulationStack([]);
    setVisitedSet(new Set());
    setTraversalLog("");
    setStepCounter(1);
    setCurrentNodeId(null);
    setHistory([]);
    setStatusMessage("Status: Ready");
    setNodes((nds) => nds.map((n) => ({ ...n, style: {} })));
    setEdges((eds) => eds.map((e) => ({ ...e, style: {}, animated: false })));
    setIsTreeBuilt(false);
  }, [setNodes, setEdges, simulationTimeout]);

  // --- Tree Building Logic ---
  const handleBuildTree = useCallback(() => {
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
      for (let i = 0; i < nodeCount; i++) {
        const leftChild = 2 * i + 1;
        const rightChild = 2 * i + 2;
        if (leftChild < nodeCount) {
          newEdges.push({ id: `e${i}-${leftChild}`, source: `${i}`, target: `${leftChild}` });
        }
        if (rightChild < nodeCount) {
          newEdges.push({ id: `e${i}-${rightChild}`, source: `${i}`, target: `${rightChild}` });
        }
      }
    }

    const adjacency = new Map(newNodes.map((n) => [n.id, []]));
    const inDegree = new Map(newNodes.map((n) => [n.id, 0]));
    newEdges.forEach((edge) => {
      adjacency.set(edge.source, [...(adjacency.get(edge.source) || []), edge.target]);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });

    const rootNodeId =
      newNodes.find((n) => inDegree.get(n.id) === 0)?.id || (newNodes.length > 0 ? "0" : null);

    const levels = new Map();
    const positionedNodeIds = new Set();

    const assignLevels = (nodeId, depth) => {
      if (!nodeId || positionedNodeIds.has(nodeId)) return;
      if (!levels.has(depth)) levels.set(depth, []);
      levels.get(depth).push(nodeId);
      positionedNodeIds.add(nodeId);
      const children = adjacency.get(nodeId) || [];
      children.forEach((childId) => assignLevels(childId, depth + 1));
    };

    if (rootNodeId) assignLevels(rootNodeId, 0);

    const positionedNodes = newNodes.map((node) => {
      for (const [level, nodesInLevel] of levels.entries()) {
        const nodeIndex = nodesInLevel.indexOf(node.id);
        if (nodeIndex !== -1) {
          const y = level * 100;
          const x = (nodeIndex - (nodesInLevel.length - 1) / 2) * 150;
          return { ...node, position: { x, y } };
        }
      }
      return { ...node, position: { x: Math.random() * 200, y: Math.random() * 200 } };
    });

    setNodes(positionedNodes);
    setEdges(newEdges);
    setStatusMessage(" Tree built. Ready to search!");
    showSnackbar(" Tree built successfully!", "success");
    setIsTreeBuilt(true);
  }, [nodeCount, nodeValues, edgesInput, layoutMode, resetSimulation, showSnackbar]);

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

    playSound("step");
    if (simulationStack.length === 0) {
      const foundNode = nodes.find((n) => n.data.label === targetValue);
      const wasFound = foundNode && visitedSet.has(foundNode.id);
      const finalMessage = wasFound
        ? `Found: ${targetValue}`
        : `Target '${targetValue}' not found.`;

      if (wasFound) playSound("success");
      else playSound("failure");

      setStatusMessage(finalMessage);
      appendToLog(`\n${finalMessage}`);
      setIsRunning(false);
      setIsFinished(true);
      setCurrentNodeId(null);
      return;
    }

    const newStack = [...simulationStack];
    const nodeId = newStack.pop();
    const node = nodes.find((n) => n.id === nodeId);

    setCurrentNodeId(nodeId);
    setStatusMessage(`Popped ${node.data.label} from stack.`);

    if (visitedSet.has(nodeId)) {
      appendToLog(`Step ${stepCounter}: Node ${node.data.label} already visited. Skipping.\n`);
      setStepCounter((c) => c + 1);
      setSimulationStack(newStack);
      return;
    }

    const newVisited = new Set(visitedSet).add(nodeId);
    setVisitedSet(newVisited);
    appendToLog(`Step ${stepCounter}: Visiting ${node.data.label}.\n`);
    setStepCounter((c) => c + 1);

    if (node.data.label === targetValue) {
      simulationTimeout.clear();
      playSound("success");
      setStatusMessage(`Found: ${targetValue}!`);
      appendToLog(`Target found! Halting simulation.\n`);
      setIsRunning(false);
      setIsFinished(true);
      return;
    }

    const children = edges
      .filter((e) => e.source === nodeId)
      .map((e) => e.target)
      .reverse();

    let childrenLog = "Pushing to stack: ";
    let pushedSomething = false;
    children.forEach((childId) => {
      if (!newVisited.has(childId)) {
        newStack.push(childId);
        const childNode = nodes.find((n) => n.id === childId);
        childrenLog += `${childNode.data.label} `;
        pushedSomething = true;
      }
    });

    if (pushedSomething) {
      appendToLog(childrenLog + "\n");
    } else {
      appendToLog("No unvisited children to push.\n");
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
    if (isTreeBuilt && !targetValue.trim()) {
      showSnackbar("Please enter a search target first.", "error");
      return;
    }
    if (nodes.length === 0) {
      showSnackbar("Please build a tree first.", "warning");
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
      if (simulationStack.length === 0 && visitedSet.size === 0) {
        setSimulationStack([nodes[0].id]);
      }
      setStatusMessage("Status: Running...");
    }
    setIsRunning(!isRunning);
  };

  const handleStep = () => {
    if (isTreeBuilt && !targetValue.trim()) {
      showSnackbar("Please enter a search target first.", "error");
      return;
    }
    if (nodes.length === 0) {
      showSnackbar("Please build a tree first.", "warning");
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
          border: `2px solid ${colors.node.defaultBorder}`,
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
          style.color = "#000";
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
      .then(() => showSnackbar(" Steps copied to clipboard!", "success"))
      .catch(() => showSnackbar(" Failed to copy steps.", "error"));
  };

  // --- Render ---
  return (
    <Box
      key={`dfslab-${themeMode}`}
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

      <Typography variant="h5" align="center" sx={{ mb: 2, color: colors.text.primary }}>
        Simulator
      </Typography>

      <Paper
        sx={{
          p: 2,
          mb: 3,
          bgcolor: colors.background.paper,
          boxShadow: isDark
            ? "0px 4px 20px rgba(0, 0, 0, 0.3)"
            : "0px 4px 20px rgba(0, 0, 0, 0.05)",
          borderRadius: "16px"
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={isTreeBuilt ? 3 : 4}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: colors.text.secondary }}>Layout</InputLabel>
              <Select
                value={layoutMode}
                label="Layout"
                onChange={(e) => setLayoutMode(e.target.value)}
                sx={{
                  color: colors.text.primary,
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.border.primary }
                }}
              >
                <MenuItem value="auto">Auto (Binary Tree)</MenuItem>
                <MenuItem value="manual">Manual Edges</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={isTreeBuilt ? 3 : 4}>
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
                  "& fieldset": { borderColor: colors.border.primary }
                },
                "& .MuiInputLabel-root": { color: colors.text.secondary }
              }}
            />
          </Grid>
          {isTreeBuilt && (
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Search Target"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value.toUpperCase())}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: colors.text.primary,
                    "& fieldset": { borderColor: colors.border.primary }
                  },
                  "& .MuiInputLabel-root": { color: colors.text.secondary }
                }}
              />
            </Grid>
          )}
          <Grid item xs={12} md={isTreeBuilt ? 3 : 4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<BuildIcon />}
              onClick={handleBuildTree}
            >
              Build Tree
            </Button>
          </Grid>
          {layoutMode === "manual" && (
            <Grid item xs={12}>
              <Box
                sx={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  p: 1.5,
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: 2
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: "medium", color: colors.text.primary }}
                >
                  Edges (Parent → Child)
                </Typography>
                <Grid container spacing={2}>
                  {Array.from({ length: nodeCount > 1 ? nodeCount - 1 : 0 }).map((_, i) => (
                    <Grid item xs={6} sm={4} md={3} key={i}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          label="Parent"
                          type="number"
                          value={edgesInput[i]?.parent || ""}
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
                              "& fieldset": { borderColor: colors.border.primary }
                            },
                            "& .MuiInputLabel-root": { color: colors.text.secondary }
                          }}
                        />
                        <Typography sx={{ color: colors.text.primary }}>→</Typography>
                        <TextField
                          label="Child"
                          type="number"
                          value={edgesInput[i]?.child || ""}
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
                              "& fieldset": { borderColor: colors.border.primary }
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
              bgcolor: colors.background.paper,
              boxShadow: isDark
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
                style={{ background: colors.background.paper }}
              >
                <Controls
                  showInteractive={false}
                  style={{
                    background: colors.controls.background,
                    border: `1px solid ${colors.controls.border}`,
                    borderRadius: "8px"
                  }}
                />
                <Background color={isDark ? "#1a1a1a" : "#aaa"} gap={16} />
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
              boxShadow: isDark
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
              <Typography variant="h6" sx={{ color: colors.text.primary }}>
                Log & Status
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Reset">
                  <IconButton
                    size="small"
                    onClick={resetSimulation}
                    sx={{ color: colors.text.muted }}
                  >
                    <ReplayIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Previous Step">
                  <IconButton
                    size="small"
                    onClick={handlePrevStep}
                    disabled={history.length === 0}
                    sx={{ color: colors.text.muted }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Next Step">
                  <IconButton
                    size="small"
                    onClick={handleStep}
                    disabled={isRunning}
                    sx={{ color: colors.text.muted }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={isRunning ? "Pause" : "Run"}>
                  <IconButton
                    size="small"
                    onClick={handleRunPause}
                    sx={{ background: isRunning ? colors.button.warning : colors.button.success }}
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
                  "& .MuiInputBase-root": { height: "100%", alignItems: "flex-start" },
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
              color="secondary"
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopySteps}
              sx={{ mt: 1.5, flexShrink: 0 }}
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

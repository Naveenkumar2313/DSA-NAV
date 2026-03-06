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
    balanced: {
      main: isDark ? "#4ade80" : "#27ae60",
      light: isDark ? "#86efac" : "#a9dfbf"
    },
    unbalanced: {
      main: isDark ? "#ff6b6b" : "#e74c3c",
      light: isDark ? "#fca5a5" : "#ef9a9a"
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
      processed: isDark ? "#4ade80" : "#4CAF50",
      processedBorder: isDark ? "#22c55e" : "#388E3C",
      balanced: isDark ? "#4ade80" : "#27ae60",
      balancedBorder: isDark ? "#22c55e" : "#1e8449",
      unbalanced: isDark ? "#ff6b6b" : "#e74c3c",
      unbalancedBorder: isDark ? "#ef4444" : "#c62828"
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

const BBTLab = ({ showSnackbar }) => {
  const theme = useTheme();
  const colors = getSimulationColors(theme);
  const themeMode = theme?.palette?.mode || "light";

  // --- Refs ---
  const successAudioRef = useRef(null);
  const failAudioRef = useRef(null);
  const stepAudioRef = useRef(null);
  const logContainerRef = useRef(null);
  const originalLabelsRef = useRef({});
  const childrenMapRef = useRef({});

  // React Flow State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Simulation State
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [traversalLog, setTraversalLog] = useState("");
  const [stepCounter, setStepCounter] = useState(1);
  const [isStepping, setIsStepping] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [visitedSet, setVisitedSet] = useState(new Set());
  const [processedSet, setProcessedSet] = useState(new Set());
  const [balancedNodes, setBalancedNodes] = useState(new Set());
  const [unbalancedNodes, setUnbalancedNodes] = useState(new Set());

  // Algorithm-specific state
  const [dfsSteps, setDfsSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [nodeHeights, setNodeHeights] = useState({});
  const [isBalancedResult, setIsBalancedResult] = useState(null);

  // UI State
  const [layoutMode, setLayoutMode] = useState("auto");
  const [nodeCount, setNodeCount] = useState(7);
  const [nodeValues, setNodeValues] = useState(
    Array.from({ length: 7 }, (_, i) => String.fromCharCode(65 + i))
  );
  const [edgesInput, setEdgesInput] = useState(
    Array.from({ length: 6 }, () => ({ parent: "", child: "" }))
  );
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

  const appendToLog = (message) => {
    setTraversalLog((prev) => prev + message);
  };

  const simulationTimeout = useTimeout(performStep, animationSpeed);

  // --- Pre-compute DFS steps for balanced binary tree check ---
  const precomputeBalancedSteps = useCallback((adjacency, rootId, nodeMap) => {
    const steps = [];
    const childrenMap = {};

    // Build children map from adjacency
    const visited = new Set();
    const buildChildren = (nodeId) => {
      visited.add(nodeId);
      childrenMap[nodeId] = [];
      const neighbors = adjacency.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          childrenMap[nodeId].push(neighbor);
          buildChildren(neighbor);
        }
      }
    };
    buildChildren(rootId);

    childrenMapRef.current = childrenMap;

    // DFS post-order to check balance
    const dfs = (nodeId) => {
      const nodeLabel = nodeMap[nodeId];
      steps.push({
        type: "visit",
        nodeId,
        nodeValue: nodeLabel,
        message: `Visiting node '${nodeLabel}'`
      });

      const children = childrenMap[nodeId] || [];
      let leftHeight = 0, rightHeight = 0;

      if (children.length >= 1) {
        leftHeight = dfs(children[0]);
        steps.push({
          type: "return_left",
          nodeId,
          nodeValue: nodeLabel,
          childValue: nodeMap[children[0]],
          height: leftHeight,
          message: `Back to '${nodeLabel}': left height = ${leftHeight === -1 ? "-1 (unbalanced)" : leftHeight}`
        });

        if (leftHeight === -1) {
          steps.push({
            type: "compute",
            nodeId,
            nodeValue: nodeLabel,
            leftHeight,
            rightHeight: "skipped",
            nodeHeight: -1,
            isBalanced: false,
            message: `Node '${nodeLabel}': Left subtree is unbalanced → propagate -1`
          });
          return -1;
        }
      }

      if (children.length >= 2) {
        rightHeight = dfs(children[1]);
        steps.push({
          type: "return_right",
          nodeId,
          nodeValue: nodeLabel,
          childValue: nodeMap[children[1]],
          height: rightHeight,
          message: `Back to '${nodeLabel}': right height = ${rightHeight === -1 ? "-1 (unbalanced)" : rightHeight}`
        });

        if (rightHeight === -1) {
          steps.push({
            type: "compute",
            nodeId,
            nodeValue: nodeLabel,
            leftHeight,
            rightHeight,
            nodeHeight: -1,
            isBalanced: false,
            message: `Node '${nodeLabel}': Right subtree is unbalanced → propagate -1`
          });
          return -1;
        }
      }

      const diff = Math.abs(leftHeight - rightHeight);
      const balanced = diff <= 1;
      const nodeHeight = balanced ? 1 + Math.max(leftHeight, rightHeight) : -1;

      steps.push({
        type: "compute",
        nodeId,
        nodeValue: nodeLabel,
        leftHeight,
        rightHeight,
        diff,
        nodeHeight,
        isBalanced: balanced,
        message: balanced
          ? `Node '${nodeLabel}': leftH=${leftHeight}, rightH=${rightHeight}, |diff|=${diff} ≤ 1 → Balanced ✓, height=${nodeHeight}`
          : `Node '${nodeLabel}': leftH=${leftHeight}, rightH=${rightHeight}, |diff|=${diff} > 1 → UNBALANCED ✗`
      });

      return nodeHeight;
    };

    dfs(rootId);
    return steps;
  }, []);

  // --- Simulation Control Handlers ---
  const resetSimulation = useCallback(() => {
    simulationTimeout.clear();
    setIsRunning(false);
    setIsFinished(false);
    setIsStepping(false);
    setVisitedSet(new Set());
    setProcessedSet(new Set());
    setBalancedNodes(new Set());
    setUnbalancedNodes(new Set());
    setTraversalLog("");
    setStepCounter(1);
    setCurrentNodeId(null);
    setHistory([]);
    setDfsSteps([]);
    setCurrentStepIndex(-1);
    setNodeHeights({});
    setIsBalancedResult(null);
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

    // Store original labels
    const origLabels = {};
    positionedNodes.forEach((n) => { origLabels[n.id] = n.data.label; });
    originalLabelsRef.current = origLabels;

    setNodes(positionedNodes);
    setEdges(newEdges);

    // Pre-compute balanced check steps
    const nodeMap = {};
    newNodes.forEach((n) => { nodeMap[n.id] = n.data.label; });
    const steps = precomputeBalancedSteps(adjacency, rootNodeId, nodeMap);
    setDfsSteps(steps);

    setStatusMessage("Tree built. Ready to check if balanced!");
    showSnackbar("Tree built successfully!", "success");
    setIsTreeBuilt(true);
  }, [nodeCount, nodeValues, edgesInput, layoutMode, resetSimulation, showSnackbar, precomputeBalancedSteps]);

  // --- Simulation Core Logic ---
  function performStep() {
    setHistory((prev) => [
      ...prev,
      {
        visitedSet,
        processedSet,
        balancedNodes,
        unbalancedNodes,
        currentNodeId,
        traversalLog,
        stepCounter,
        statusMessage,
        isFinished,
        currentStepIndex,
        nodeHeights,
        isBalancedResult
      }
    ]);

    playSound("step");

    if (currentStepIndex >= dfsSteps.length - 1) {
      // All steps complete
      const lastCompute = dfsSteps.filter(s => s.type === "compute").pop();
      const result = lastCompute ? lastCompute.isBalanced : true;

      setIsBalancedResult(result);
      if (result) {
        setStatusMessage("Algorithm complete! Tree is BALANCED ✓");
        appendToLog(`\nAlgorithm complete! Tree is BALANCED ✓\n`);
        playSound("success");
      } else {
        setStatusMessage("Algorithm complete! Tree is UNBALANCED ✗");
        appendToLog(`\nAlgorithm complete! Tree is UNBALANCED ✗\n`);
        playSound("failure");
      }
      setIsRunning(false);
      setIsFinished(true);
      setCurrentNodeId(null);
      return;
    }

    const nextIndex = currentStepIndex + 1;
    setCurrentStepIndex(nextIndex);
    const step = dfsSteps[nextIndex];

    setCurrentNodeId(step.nodeId);

    if (step.type === "visit") {
      const newVisited = new Set(visitedSet).add(step.nodeId);
      setVisitedSet(newVisited);
      setStatusMessage(`Visiting: ${step.nodeValue}`);
      appendToLog(`Step ${stepCounter}: ${step.message}\n`);
      setStepCounter((c) => c + 1);
    } else if (step.type === "return_left" || step.type === "return_right") {
      setStatusMessage(step.message);
      appendToLog(`Step ${stepCounter}: ${step.message}\n`);
      setStepCounter((c) => c + 1);
    } else if (step.type === "compute") {
      const newProcessed = new Set(processedSet).add(step.nodeId);
      setProcessedSet(newProcessed);
      const newHeights = { ...nodeHeights, [step.nodeId]: step.nodeHeight };
      setNodeHeights(newHeights);

      if (step.isBalanced) {
        const newBalanced = new Set(balancedNodes).add(step.nodeId);
        setBalancedNodes(newBalanced);
      } else {
        const newUnbalanced = new Set(unbalancedNodes).add(step.nodeId);
        setUnbalancedNodes(newUnbalanced);
      }

      setStatusMessage(step.message);
      appendToLog(`Step ${stepCounter}: ${step.message}\n`);
      setStepCounter((c) => c + 1);
    }
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
  }, [isRunning, isFinished, currentStepIndex, isStepping]);

  const handleRunPause = () => {
    if (nodes.length === 0) {
      showSnackbar("Please build a tree first.", "warning");
      return;
    }
    if (isFinished) {
      showSnackbar("Computation is complete. Please reset.", "info");
      return;
    }

    if (isRunning) {
      simulationTimeout.clear();
      setStatusMessage(`Status: Paused at Step ${stepCounter - 1}`);
    } else {
      setStatusMessage("Status: Running...");
    }
    setIsRunning(!isRunning);
  };

  const handleStep = () => {
    if (nodes.length === 0) {
      showSnackbar("Please build a tree first.", "warning");
      return;
    }
    if (isFinished) {
      showSnackbar("Computation is complete. Please reset.", "info");
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

    setVisitedSet(lastState.visitedSet);
    setProcessedSet(lastState.processedSet);
    setBalancedNodes(lastState.balancedNodes);
    setUnbalancedNodes(lastState.unbalancedNodes);
    setCurrentNodeId(lastState.currentNodeId);
    setTraversalLog(lastState.traversalLog);
    setStepCounter(lastState.stepCounter);
    setStatusMessage(lastState.statusMessage);
    setIsFinished(lastState.isFinished);
    setCurrentStepIndex(lastState.currentStepIndex);
    setNodeHeights(lastState.nodeHeights);
    setIsBalancedResult(lastState.isBalancedResult);
    setIsRunning(false);

    setHistory((prev) => prev.slice(0, -1));
  };

  // --- Style updates based on state ---
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const isCurrent = node.id === currentNodeId;
        const isVisited = visitedSet.has(node.id);
        const isProcessed = processedSet.has(node.id);
        const isBalanced = balancedNodes.has(node.id);
        const isUnbalanced = unbalancedNodes.has(node.id);
        const height = nodeHeights[node.id];

        const style = {
          transition: "all 0.5s ease",
          border: `2px solid #e0e0e0`,
          borderRadius: "50%",
          backgroundColor: colors.node.default,
          color: colors.text.primary
        };

        if (isUnbalanced) {
          style.backgroundColor = colors.node.unbalanced;
          style.color = "white";
          style.border = `3px solid ${colors.node.unbalancedBorder}`;
          style.boxShadow = `0 0 15px ${colors.node.unbalanced}`;
        } else if (isBalanced && isProcessed) {
          style.backgroundColor = colors.node.balanced;
          style.color = "white";
          style.border = `3px solid ${colors.node.balancedBorder}`;
        } else if (isCurrent) {
          style.backgroundColor = colors.node.current;
          style.border = `3px solid ${colors.node.currentBorder}`;
          style.boxShadow = `0 0 15px ${colors.node.current}`;
        } else if (isProcessed) {
          style.backgroundColor = colors.node.processed;
          style.color = "white";
          style.border = `3px solid ${colors.node.processedBorder}`;
        } else if (isVisited) {
          style.backgroundColor = colors.node.visited;
          style.color = "white";
          style.border = `3px solid ${colors.node.visitedBorder}`;
        }

        const originalLabel = originalLabelsRef.current[node.id] || node.data.label;
        const label = height !== undefined
          ? `${originalLabel} (h=${height})`
          : originalLabel;

        return { ...node, data: { ...node.data, label }, style };
      })
    );
    setEdges((eds) =>
      eds.map((edge) => {
        return {
          ...edge,
          animated: edge.source === currentNodeId && !visitedSet.has(edge.target),
          style: {
            stroke:
              visitedSet.has(edge.source) && visitedSet.has(edge.target)
                ? colors.edge.visited
                : colors.edge.default,
            strokeWidth: 2.5
          }
        };
      })
    );
  }, [currentNodeId, visitedSet, processedSet, balancedNodes, unbalancedNodes, nodeHeights, setNodes, setEdges, colors]);

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

  // --- Render ---
  return (
    <Box
      key={`bbt-lab-${themeMode}`}
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
        Balanced Binary Tree Check — Simulator
      </Typography>

      {isTreeBuilt && isBalancedResult !== null && (
        <Typography
          variant="h6"
          align="center"
          sx={{ mb: 2, color: isBalancedResult ? colors.balanced.main : colors.unbalanced.main, fontWeight: 600 }}
        >
          {isBalancedResult ? "✓ Tree is Balanced" : "✗ Tree is Unbalanced"}
        </Typography>
      )}

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
          <Grid item xs={12} md={4}>
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
                <MenuItem value="auto">Auto (Binary Tree)</MenuItem>
                <MenuItem value="manual">Manual Edges</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<BuildIcon />}
              onClick={handleBuildTree}
              sx={{
                bgcolor: colors.primary.main,
                "&:hover": { bgcolor: colors.primary.dark }
              }}
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
                  border: `1px solid #e0e0e0`,
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
                              "& fieldset": { borderColor: colors.border }
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
                  <span>
                    <IconButton
                      size="small"
                      onClick={handlePrevStep}
                      disabled={history.length === 0}
                      sx={{ color: colors.text.secondary }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Next Step">
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleStep}
                      disabled={isRunning}
                      sx={{ color: colors.text.secondary }}
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                  </span>
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

export default BBTLab;

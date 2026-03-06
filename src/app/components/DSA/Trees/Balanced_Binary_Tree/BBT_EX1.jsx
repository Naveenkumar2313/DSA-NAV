import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import p5 from "p5";
import { Box, Grid, Paper, Stack, Typography, Tooltip, IconButton, useTheme } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

// Import sound files
const stepSoundFile = "/DSA/step.mp3";
const successSoundFile = "/DSA/success.mp3";
const failSoundFile = "/DSA/fail.mp3";

// --- THEME-AWARE COLOR DEFINITIONS ---
const getExampleColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  return {
    primary: isDark ? "#90caf9" : "#2c3e50",
    secondary: isDark ? "#64b5f6" : "#89CFF0",
    success: isDark ? "#81c784" : "#b9fbc0",
    warning: isDark ? "#ffb74d" : "#FFD700",
    info: isDark ? "#4a5568" : "#E0E0E0",
    error: isDark ? "#e57373" : "#e57373",
    balanced: isDark ? "#4ade80" : "#27ae60",
    unbalanced: isDark ? "#ff6b6b" : "#e74c3c",
    heightColor: isDark ? "#a78bfa" : "#8e44ad",
    background: {
      default: isDark ? "#121212" : "#f0f2f5",
      paper: isDark ? "#000000" : "#ffffff",
      canvas: isDark ? "#000000" : "#ffffff",
      container: isDark ? "#000000" : "#f0f2f5"
    },
    text: {
      primary: isDark ? "#ffffff" : "#2c3e50",
      secondary: isDark ? "#b0bec5" : "#7f8c8d"
    },
    border: isDark ? "#000000" : "#e0e0e0",
    buttons: {
      bg: isDark ? "#1a1a1a" : "#ffffff",
      hoverBg: isDark ? "#333333" : "#f0f2f5",
      playBg: isDark ? "#2e7d32" : "#b9fbc0",
      pauseBg: isDark ? "#ef6c00" : "#ffe0b2",
      resetBg: isDark ? "#c62828" : "#ffcdd2"
    },
    stepListBox: {
      background: isDark ? "#000000" : "linear-gradient(90deg, #e0e7ff 0%, #f0f2f5 100%)",
      shadow: isDark ? "none" : "0 1px 4px 0 rgba(160,196,255,0.08)"
    }
  };
};

const getStyles = (colors, isDark) => ({
  container: {
    p: { xs: 2, sm: 4 },
    minHeight: "100vh",
    background: isDark ? "#000000" : "linear-gradient(135deg, #f0f2f5 0%, #e0e7ff 100%)"
  },
  canvasWrapper: {
    position: "relative",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: isDark
      ? "none"
      : "0 8px 32px 0 rgba(44, 62, 80, 0.12), 0 1.5px 6px 0 rgba(160,196,255,0.08)",
    background: colors.background.paper,
    border: `1px solid ${colors.border}`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  canvasBox: {
    width: "100%",
    maxWidth: 800,
    aspectRatio: "16 / 9"
  },
  stepListBox: {
    overflowY: "auto",
    mt: 1,
    p: 1.5,
    borderRadius: 3,
    background: colors.stepListBox.background,
    border: `1.5px solid ${colors.border}`,
    boxShadow: colors.stepListBox.shadow,
    maxHeight: { xs: 200, md: 420 }
  }
});

const BBT_EX1 = () => {
  const theme = useTheme();
  const colors = getExampleColors(theme);
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  const styles = getStyles(colors, isDark);
  const colorsRef = useRef(colors);

  const sketchRef = useRef();
  const [stepList, setStepList] = useState([]);
  const [statusText, setStatusText] = useState("Status: Ready");
  const [isPlaying, setIsPlaying] = useState(false);
  const [resultText, setResultText] = useState("Result: —");

  const audioRefs = useRef({});
  const stepListRef = useRef(null);

  // Update colorsRef when theme changes
  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  useEffect(() => {
    if (stepListRef.current) {
      stepListRef.current.scrollTop = stepListRef.current.scrollHeight;
    }
  }, [stepList]);

  useLayoutEffect(() => {
    let stepNumber = 1;
    let nodes = [], root;
    let running = false, paused = true;
    let computeComplete = false;
    let history = [];
    let pInstance = null;
    let isBalancedResult = null;

    // Pre-computed DFS traversal steps for the algorithm
    let dfsSteps = [];
    let currentStepIndex = -1;

    function layoutTree(root, x, y, xSpacing, ySpacing) {
      root.targetX = x;
      root.targetY = y;
      if (root.left) {
        layoutTree(root.left, x - xSpacing, y + ySpacing, xSpacing / 2, ySpacing);
      }
      if (root.right) {
        layoutTree(root.right, x + xSpacing, y + ySpacing, xSpacing / 2, ySpacing);
      }
    }

    class Node {
      constructor(value, p) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.targetX = 0;
        this.targetY = 0;
        this.x = 0;
        this.y = 0;
        this.visited = false;
        this.processed = false;
        this.isCurrent = false;
        this.isBalancedNode = null; // null = not checked, true = balanced, false = unbalanced
        this.heightValue = null;
        this.scale = 1;
        this.targetScale = 1;
        this.color = p.color(colorsRef.current.info);
        this.targetColor = p.color(colorsRef.current.info);
      }
      update(p) {
        this.x = p.lerp(this.x, this.targetX, 0.08);
        this.y = p.lerp(this.y, this.targetY, 0.08);
        this.scale = p.lerp(this.scale, this.targetScale, 0.1);
        this.color = p.lerpColor(this.color, this.targetColor, 0.1);
      }
    }

    const preloadAudio = () => {
      try {
        audioRefs.current.step = new Audio(stepSoundFile);
        audioRefs.current.success = new Audio(successSoundFile);
        audioRefs.current.fail = new Audio(failSoundFile);
      } catch (e) {
        console.error("Audio files not found.", e);
      }
    };

    const playSound = (soundType) => {
      if (audioRefs.current[soundType]) {
        audioRefs.current[soundType].currentTime = 0;
        audioRefs.current[soundType].play().catch((e) => console.error("Error playing sound:", e));
      }
    };

    // Pre-compute all DFS steps for the balanced binary tree check algorithm
    function precomputeSteps(node) {
      if (!node) return 0;

      // Step: visiting this node
      dfsSteps.push({
        type: "visit",
        nodeValue: node.value,
        message: `Visiting node '${node.value}'`
      });

      const leftHeight = precomputeSteps(node.left);

      if (node.left) {
        dfsSteps.push({
          type: "return_left",
          nodeValue: node.value,
          childValue: node.left.value,
          height: leftHeight,
          message: `Back to '${node.value}': left height = ${leftHeight === -1 ? "-1 (unbalanced)" : leftHeight}`
        });
      }

      if (leftHeight === -1) {
        dfsSteps.push({
          type: "compute",
          nodeValue: node.value,
          leftHeight,
          rightHeight: "skipped",
          nodeHeight: -1,
          isBalanced: false,
          message: `Node '${node.value}': Left subtree is unbalanced → propagate -1`
        });
        return -1;
      }

      const rightHeight = precomputeSteps(node.right);

      if (node.right) {
        dfsSteps.push({
          type: "return_right",
          nodeValue: node.value,
          childValue: node.right.value,
          height: rightHeight,
          message: `Back to '${node.value}': right height = ${rightHeight === -1 ? "-1 (unbalanced)" : rightHeight}`
        });
      }

      if (rightHeight === -1) {
        dfsSteps.push({
          type: "compute",
          nodeValue: node.value,
          leftHeight,
          rightHeight,
          nodeHeight: -1,
          isBalanced: false,
          message: `Node '${node.value}': Right subtree is unbalanced → propagate -1`
        });
        return -1;
      }

      const diff = Math.abs(leftHeight - rightHeight);
      const balanced = diff <= 1;
      const nodeHeight = balanced ? 1 + Math.max(leftHeight, rightHeight) : -1;

      dfsSteps.push({
        type: "compute",
        nodeValue: node.value,
        leftHeight,
        rightHeight,
        diff,
        nodeHeight,
        isBalanced: balanced,
        message: balanced
          ? `Node '${node.value}': leftH=${leftHeight}, rightH=${rightHeight}, |diff|=${diff} ≤ 1 → Balanced ✓, height=${nodeHeight}`
          : `Node '${node.value}': leftH=${leftHeight}, rightH=${rightHeight}, |diff|=${diff} > 1 → UNBALANCED ✗`
      });

      return nodeHeight;
    }

    const sketch = (p) => {
      pInstance = p;

      const createTree = (p) => {
        // Example 1: A balanced binary tree
        //        A
        //       / \
        //      B   C
        //     / \   \
        //    D   E   F
        const A = new Node("A", p);
        const B = new Node("B", p);
        const C = new Node("C", p);
        const D = new Node("D", p);
        const E = new Node("E", p);
        const F = new Node("F", p);

        A.left = B;
        A.right = C;
        B.left = D;
        B.right = E;
        C.right = F;

        nodes = [A, B, C, D, E, F];
        root = A;

        const w = p.width;
        const h = p.height;
        layoutTree(A, w / 2, h * 0.15, w * 0.22, h * 0.25);

        nodes.forEach((node) => {
          node.x = node.targetX;
          node.y = node.targetY;
        });

        // Pre-compute DFS steps
        dfsSteps = [];
        precomputeSteps(root);
      };

      p.setup = () => {
        const container = sketchRef.current;
        if (container) {
          const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
          canvas.parent(container);
        }
        preloadAudio();
        p.reset();
      };

      p.draw = () => {
        p.background(colorsRef.current.background.canvas);
        updateNodeStates(p);
        drawEdges(p);
        drawNodes(p);
        drawResultInfo(p);

        if (running && !paused && !computeComplete && p.frameCount % 60 === 0) {
          executeStep();
        }
      };

      const updateNodeStates = (p) => {
        for (let node of nodes) {
          if (node.isBalancedNode === false) {
            node.targetColor = p.color(colorsRef.current.unbalanced);
            node.targetScale = 1.15;
          } else if (node.isBalancedNode === true && node.processed) {
            node.targetColor = p.color(colorsRef.current.balanced);
            node.targetScale = 1;
          } else if (node.isCurrent) {
            node.targetColor = p.color(colorsRef.current.warning);
            node.targetScale = 1.2 + p.sin(p.frameCount * 0.1) * 0.1;
          } else if (node.processed) {
            node.targetColor = p.color(colorsRef.current.success);
            node.targetScale = 1;
          } else if (node.visited) {
            node.targetColor = p.color(colorsRef.current.secondary);
            node.targetScale = 1;
          } else {
            node.targetColor = p.color(colorsRef.current.info);
            node.targetScale = 1;
          }
          node.update(p);
        }
      };

      const drawEdges = (p) => {
        p.stroke(colorsRef.current.text.secondary);
        p.strokeWeight(2);
        for (let node of nodes) {
          if (node.left) p.line(node.x, node.y, node.left.x, node.left.y);
          if (node.right) p.line(node.x, node.y, node.right.x, node.right.y);
        }
      };

      const drawNodes = (p) => {
        p.textAlign(p.CENTER, p.CENTER);

        for (let node of nodes) {
          p.stroke(colorsRef.current.primary);
          p.strokeWeight(2.5);
          p.fill(node.color);
          p.ellipse(node.x, node.y, 50 * node.scale, 50 * node.scale);

          p.noStroke();
          p.fill(colorsRef.current.text.primary);
          p.textSize(16);
          p.text(node.value, node.x, node.y);

          // Draw height value below the node
          if (node.heightValue !== null) {
            p.textSize(11);
            p.fill(colorsRef.current.heightColor);
            p.text(`h=${node.heightValue}`, node.x, node.y + 32);
          }
        }
      };

      const drawResultInfo = (p) => {
        // Draw result in top-right corner
        p.textAlign(p.RIGHT, p.TOP);
        p.textSize(14);
        p.noStroke();
        if (isBalancedResult !== null) {
          p.fill(isBalancedResult ? colorsRef.current.balanced : colorsRef.current.unbalanced);
          p.text(isBalancedResult ? "✓ Balanced" : "✗ Unbalanced", p.width - 40, 15);
        }
      };

      const executeStep = () => {
        if (currentStepIndex >= dfsSteps.length - 1) {
          // All steps done
          computeComplete = true;
          running = false;
          setIsPlaying(false);
          nodes.forEach((n) => (n.isCurrent = false));

          // Determine final result
          const lastCompute = dfsSteps.filter(s => s.type === "compute").pop();
          isBalancedResult = lastCompute ? lastCompute.isBalanced : true;

          if (isBalancedResult) {
            playSound("success");
            setStatusText("Complete! Tree is BALANCED ✓");
            setResultText("Result: ✓ Balanced");
          } else {
            playSound("fail");
            setStatusText("Complete! Tree is UNBALANCED ✗");
            setResultText("Result: ✗ Unbalanced");
          }
          setStepList((prev) => [...prev, `Step ${stepNumber++}: Algorithm complete. Tree is ${isBalancedResult ? "BALANCED ✓" : "UNBALANCED ✗"}`]);
          return;
        }

        // Save history
        history.push({
          nodes: nodes.map((n) => ({
            value: n.value,
            visited: n.visited,
            processed: n.processed,
            isCurrent: n.isCurrent,
            isBalancedNode: n.isBalancedNode,
            heightValue: n.heightValue,
            color: { levels: n.color.levels },
            targetColor: { levels: n.targetColor.levels }
          })),
          stepIndex: currentStepIndex,
          stepNumber,
          isBalancedResult
        });

        currentStepIndex++;
        const step = dfsSteps[currentStepIndex];
        const node = nodes.find((n) => n.value === step.nodeValue);

        nodes.forEach((n) => (n.isCurrent = false));

        if (step.type === "visit") {
          node.visited = true;
          node.isCurrent = true;
          setStatusText(`Visiting: ${step.nodeValue}`);
          setStepList((prev) => [...prev, `Step ${stepNumber++}: ${step.message}`]);
          playSound("step");
        } else if (step.type === "return_left" || step.type === "return_right") {
          node.isCurrent = true;
          setStatusText(step.message);
          setStepList((prev) => [...prev, `Step ${stepNumber++}: ${step.message}`]);
          playSound("step");
        } else if (step.type === "compute") {
          node.isCurrent = true;
          node.processed = true;
          node.heightValue = step.nodeHeight;
          node.isBalancedNode = step.isBalanced;
          setStatusText(step.message);
          setStepList((prev) => [...prev, `Step ${stepNumber++}: ${step.message}`]);
          playSound("step");
        }
      };

      p.reset = () => {
        createTree(p);
        stepNumber = 1;
        history = [];
        currentStepIndex = -1;
        isBalancedResult = null;
        setStepList([]);
        setStatusText("Status: Ready");
        setResultText("Result: —");
        running = false;
        paused = true;
        computeComplete = false;
        setIsPlaying(false);
        p.loop();
      };

      p.step = () => {
        if (computeComplete) return;
        paused = true;
        setIsPlaying(false);
        executeStep();
      };

      p.run = () => {
        if (computeComplete || (running && !paused)) return;
        running = true;
        paused = false;
        setIsPlaying(true);
      };

      p.pause = () => {
        paused = true;
        running = false;
        setIsPlaying(false);
      };

      p.prevStep = () => {
        if (history.length === 0) return;
        paused = true;
        setIsPlaying(false);
        const prev = history.pop();
        nodes.forEach((node, i) => {
          node.visited = prev.nodes[i].visited;
          node.processed = prev.nodes[i].processed;
          node.isCurrent = prev.nodes[i].isCurrent;
          node.isBalancedNode = prev.nodes[i].isBalancedNode;
          node.heightValue = prev.nodes[i].heightValue;
          node.color = p.color(prev.nodes[i].color.levels);
          node.targetColor = p.color(prev.nodes[i].targetColor.levels);
        });
        currentStepIndex = prev.stepIndex;
        stepNumber = prev.stepNumber;
        isBalancedResult = prev.isBalancedResult;
        computeComplete = false;
        setResultText("Result: —");
        setStepList((prevList) => prevList.slice(0, -1));
        const lastStatus = history.length > 0 ? "Stepping back..." : "Status: Ready";
        setStatusText(lastStatus);
      };
    };

    const p5Instance = new p5(sketch, sketchRef.current);
    if (sketchRef.current) {
      Object.assign(sketchRef.current, {
        reset: p5Instance.reset,
        step: p5Instance.step,
        run: p5Instance.run,
        pause: p5Instance.pause,
        prevStep: p5Instance.prevStep
      });
    }
    return () => {
      p5Instance.remove();
    };
  }, []);

  return (
    <Box sx={styles.container}>
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom sx={{ color: colors.text.primary, fontWeight: 700 }}>
          Example 1: Balanced Binary Tree
        </Typography>
        <Typography variant="h6" sx={{ color: resultText.includes("✓") ? colors.balanced : resultText.includes("✗") ? colors.unbalanced : colors.text.secondary, fontWeight: 600 }}>
          {resultText}
        </Typography>
      </Box>

      <Box sx={{ p: 1, mb: 2, display: "flex", justifyContent: "center", gap: 1.5 }}>
        <Tooltip title="Reset">
          <IconButton
            onClick={() => sketchRef.current.reset()}
            sx={{
              color: isDark ? "#ffffff" : colors.text.primary,
              bgcolor: colors.buttons.resetBg,
              border: `1px solid ${colors.border}`,
              "&:hover": { bgcolor: colors.buttons.hoverBg }
            }}
          >
            <RestartAltIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Previous Step">
          <IconButton
            onClick={() => sketchRef.current.prevStep()}
            sx={{
              color: colors.text.primary,
              bgcolor: colors.buttons.bg,
              border: `1px solid ${colors.border}`,
              "&:hover": { bgcolor: colors.buttons.hoverBg }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Next Step">
          <IconButton
            onClick={() => sketchRef.current.step()}
            sx={{
              color: colors.text.primary,
              bgcolor: colors.buttons.bg,
              border: `1px solid ${colors.border}`,
              "&:hover": { bgcolor: colors.buttons.hoverBg }
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Run">
          <IconButton
            onClick={() => sketchRef.current.run()}
            sx={{
              color: isDark ? "#ffffff" : colors.text.primary,
              bgcolor: isPlaying ? colors.buttons.pauseBg : colors.buttons.playBg,
              border: `1px solid ${colors.border}`,
              "&:hover": { bgcolor: colors.buttons.hoverBg }
            }}
          >
            <PlayArrowIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Pause">
          <IconButton
            onClick={() => sketchRef.current.pause()}
            sx={{
              color: isDark ? "#ffffff" : colors.text.primary,
              bgcolor: colors.buttons.pauseBg,
              border: `1px solid ${colors.border}`,
              "&:hover": { bgcolor: colors.buttons.hoverBg }
            }}
          >
            <PauseIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ mb: 3, display: "flex", justifyContent: "center", width: "100%" }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            p: 1.5,
            borderRadius: 2,
            background: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.7)",
            flexWrap: "wrap",
            justifyContent: "center",
            border: `1px solid ${colors.border}`
          }}
        >
          <LegendItem color={colors.warning} text="Current" textColor={colors.text.primary} />
          <LegendItem color={colors.secondary} text="Visiting" textColor={colors.text.primary} />
          <LegendItem color={colors.success} text="Processed" textColor={colors.text.primary} />
          <LegendItem color={colors.balanced} text="Balanced ✓" textColor={colors.text.primary} />
          <LegendItem color={colors.unbalanced} text="Unbalanced ✗" textColor={colors.text.primary} />
          <LegendItem color={colors.info} text="Not Visited" textColor={colors.text.primary} />
        </Stack>
      </Box>

      <Grid container spacing={{ xs: 2, md: 4 }} justifyContent="center" alignItems="flex-start">
        <Grid item xs={12} md={7} lg={8}>
          <Box sx={styles.canvasWrapper}>
            <Box sx={styles.canvasBox}>
              <div ref={sketchRef} style={{ width: "100%", height: "100%" }} />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={5} lg={4}>
          <Paper
            sx={(theme) => ({
              p: { xs: 1.5, md: 2 },
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing(2),
              height: "100%",
              mx: "auto",
              bgcolor: colors.background.paper,
              backgroundImage: "none",
              border: `1px solid ${colors.border}`
            })}
            elevation={isDark ? 0 : 3}
          >
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography variant="h6" sx={{ color: colors.text.primary }}>
                  Execution Steps
                </Typography>
              </Stack>
              <Box ref={stepListRef} sx={styles.stepListBox}>
                {stepList.map((step, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      mb: 0.5,
                      color: colors.text.primary
                    }}
                  >
                    {step}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const LegendItem = ({ color, text, textColor }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Box
      sx={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        backgroundColor: color,
        border: "2px solid rgba(0,0,0,0.1)"
      }}
    />
    <Typography variant="body2" sx={{ fontWeight: 500, color: textColor }}>
      {text}
    </Typography>
  </Stack>
);

export default BBT_EX1;

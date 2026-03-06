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
    pathFound: isDark ? "#4ade80" : "#2ecc71",
    pathNotFound: isDark ? "#f87171" : "#e74c3c",
    currentPath: isDark ? "#a78bfa" : "#8e44ad",
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

const PS_EX1 = () => {
  const theme = useTheme();
  const colors = getExampleColors(theme);
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  const styles = getStyles(colors, isDark);
  const colorsRef = useRef(colors);

  const sketchRef = useRef();
  const [stepList, setStepList] = useState([]);
  const [statusText, setStatusText] = useState("Status: Ready");
  const [isPlaying, setIsPlaying] = useState(false);
  const [resultText, setResultText] = useState("");

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
    let pathEdges = [];

    // Pre-computed DFS traversal steps for the algorithm
    let dfsSteps = [];
    let currentStepIndex = -1;
    let targetSum = 22;
    let foundPath = false;
    let successPathNodes = [];

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
        this.isOnPath = false;
        this.isLeaf = false;
        this.runningSum = null;
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

    // Pre-compute all DFS steps for the path sum algorithm
    function precomputeSteps(node, currentSum, path) {
      if (!node) return;

      const newSum = currentSum + node.value;

      // Step: visiting this node
      dfsSteps.push({
        type: "visit",
        nodeValue: node.value,
        runningSum: newSum,
        path: [...path, node.value],
        message: `Visiting node '${node.value}', running sum = ${newSum}`
      });

      // Check if leaf
      if (!node.left && !node.right) {
        const isMatch = newSum === targetSum;
        dfsSteps.push({
          type: "leaf_check",
          nodeValue: node.value,
          runningSum: newSum,
          isMatch,
          path: [...path, node.value],
          message: isMatch
            ? `🎯 Leaf '${node.value}': sum = ${newSum} === ${targetSum}. PATH FOUND!`
            : `❌ Leaf '${node.value}': sum = ${newSum} ≠ ${targetSum}. Backtrack.`
        });
        if (isMatch && !foundPath) {
          foundPath = true;
          successPathNodes = [...path, node.value];
        }
        return;
      }

      precomputeSteps(node.left, newSum, [...path, node.value]);

      if (node.left) {
        dfsSteps.push({
          type: "backtrack",
          nodeValue: node.value,
          runningSum: newSum,
          message: `Back to '${node.value}' (sum = ${newSum}), try right subtree`
        });
      }

      precomputeSteps(node.right, newSum, [...path, node.value]);

      if (node.right) {
        dfsSteps.push({
          type: "backtrack",
          nodeValue: node.value,
          runningSum: newSum,
          message: `Back to '${node.value}' (sum = ${newSum}), done with subtrees`
        });
      }
    }

    const sketch = (p) => {
      pInstance = p;

      const createTree = (p) => {
        // Example 1: Classic Path Sum tree (LeetCode example)
        //        5
        //       / \
        //      4   8
        //     /   / \
        //    11  13  4
        //   / \       \
        //  7   2       1
        // Target Sum = 22
        // Path: 5 -> 4 -> 11 -> 2

        const n5 = new Node(5, p);
        const n4 = new Node(4, p);
        const n8 = new Node(8, p);
        const n11 = new Node(11, p);
        const n13 = new Node(13, p);
        const n4b = new Node(4, p);
        n4b._id = "4b";
        const n7 = new Node(7, p);
        const n2 = new Node(2, p);
        const n1 = new Node(1, p);

        n5.left = n4;
        n5.right = n8;
        n4.left = n11;
        n8.left = n13;
        n8.right = n4b;
        n11.left = n7;
        n11.right = n2;
        n4b.right = n1;

        nodes = [n5, n4, n8, n11, n13, n4b, n7, n2, n1];
        root = n5;

        const w = p.width;
        const h = p.height;
        layoutTree(n5, w / 2, h * 0.12, w * 0.22, h * 0.22);

        nodes.forEach((node) => {
          node.x = node.targetX;
          node.y = node.targetY;
        });

        // Pre-compute DFS steps
        dfsSteps = [];
        foundPath = false;
        successPathNodes = [];
        precomputeSteps(root, 0, []);
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
        drawTargetInfo(p);

        if (running && !paused && !computeComplete && p.frameCount % 60 === 0) {
          executeStep();
        }
      };

      const updateNodeStates = (p) => {
        for (let node of nodes) {
          if (node.isOnPath) {
            node.targetColor = p.color(colorsRef.current.pathFound);
            node.targetScale = 1.15;
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
        // Draw main tree structure
        p.stroke(colorsRef.current.text.secondary);
        p.strokeWeight(2);
        for (let node of nodes) {
          if (node.left) p.line(node.x, node.y, node.left.x, node.left.y);
          if (node.right) p.line(node.x, node.y, node.right.x, node.right.y);
        }

        // Draw path edges with highlight
        for (const edge of pathEdges) {
          p.push();
          p.stroke(p.color(colorsRef.current.pathFound));
          p.strokeWeight(4);
          p.drawingContext.setLineDash([8, 6]);
          p.line(edge.from.x, edge.from.y, edge.to.x, edge.to.y);
          p.drawingContext.setLineDash([]);

          const fromVec = p.createVector(edge.from.x, edge.from.y);
          const toVec = p.createVector(edge.to.x, edge.to.y);
          const midPoint = p5.Vector.lerp(fromVec, toVec, 0.5);
          const angle = p.atan2(toVec.y - fromVec.y, toVec.x - fromVec.x);

          let arrowSize = 10;
          p.translate(midPoint.x, midPoint.y);
          p.rotate(angle);
          p.fill(p.color(colorsRef.current.pathFound));
          p.noStroke();
          p.triangle(0, 0, -arrowSize * 1.5, -arrowSize * 0.7, -arrowSize * 1.5, arrowSize * 0.7);
          p.pop();
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

          // Draw running sum below the node
          if (node.runningSum !== null) {
            p.textSize(11);
            p.fill(colorsRef.current.currentPath);
            p.text(`Σ=${node.runningSum}`, node.x, node.y + 42);
          }
        }
      };

      const drawTargetInfo = (p) => {
        // Draw target sum value in top-right corner
        p.textAlign(p.RIGHT, p.TOP);
        p.textSize(14);
        p.noStroke();
        p.fill(colorsRef.current.text.primary);
        p.text(`Target Sum: ${targetSum}`, p.width - 50, 15);
      };

      const executeStep = () => {
        if (currentStepIndex >= dfsSteps.length - 1) {
          // All steps done
          computeComplete = true;
          running = false;
          setIsPlaying(false);
          nodes.forEach((n) => (n.isCurrent = false));

          // Highlight the successful path if found
          if (foundPath) {
            highlightSuccessPath();
            playSound("success");
            setResultText(`✅ Path Found! Sum = ${targetSum}`);
            setStatusText(`Complete! Path found with sum = ${targetSum}`);
          } else {
            playSound("fail");
            setResultText(`❌ No Path Found for sum = ${targetSum}`);
            setStatusText(`Complete! No path found with sum = ${targetSum}`);
          }
          setStepList((prev) => [...prev, `Step ${stepNumber++}: Algorithm complete.`]);
          return;
        }

        // Save history
        history.push({
          nodes: nodes.map((n) => ({
            value: n.value,
            visited: n.visited,
            processed: n.processed,
            isCurrent: n.isCurrent,
            isOnPath: n.isOnPath,
            runningSum: n.runningSum,
            color: { levels: n.color.levels },
            targetColor: { levels: n.targetColor.levels }
          })),
          stepIndex: currentStepIndex,
          stepNumber,
          pathEdges: [...pathEdges]
        });

        currentStepIndex++;
        const step = dfsSteps[currentStepIndex];
        const node = nodes.find((n) => n.value === step.nodeValue);

        nodes.forEach((n) => (n.isCurrent = false));

        if (step.type === "visit") {
          node.visited = true;
          node.isCurrent = true;
          node.runningSum = step.runningSum;
          setStatusText(`Visiting: ${step.nodeValue}, sum = ${step.runningSum}`);
          setStepList((prev) => [...prev, `Step ${stepNumber++}: ${step.message}`]);
          playSound("step");
        } else if (step.type === "leaf_check") {
          node.isCurrent = true;
          node.processed = true;
          if (step.isMatch) {
            playSound("success");
          } else {
            playSound("step");
          }
          setStatusText(step.message);
          setStepList((prev) => [...prev, `Step ${stepNumber++}: ${step.message}`]);
        } else if (step.type === "backtrack") {
          node.isCurrent = true;
          setStatusText(step.message);
          setStepList((prev) => [...prev, `Step ${stepNumber++}: ${step.message}`]);
          playSound("step");
        }
      };

      const highlightSuccessPath = () => {
        if (successPathNodes.length === 0) return;

        // Find the actual nodes matching the path values in order
        const pathNodeRefs = [];
        let current = root;

        const findPath = (node, values, idx) => {
          if (!node || idx >= values.length) return false;
          if (node.value !== values[idx]) return false;

          pathNodeRefs.push(node);
          node.isOnPath = true;

          if (idx === values.length - 1) return true;

          if (findPath(node.left, values, idx + 1)) return true;
          if (findPath(node.right, values, idx + 1)) return true;

          pathNodeRefs.pop();
          node.isOnPath = false;
          return false;
        };

        findPath(root, successPathNodes, 0);

        // Create edges along the path
        for (let i = 0; i < pathNodeRefs.length - 1; i++) {
          pathEdges.push({ from: pathNodeRefs[i], to: pathNodeRefs[i + 1] });
        }
      };

      p.reset = () => {
        createTree(p);
        stepNumber = 1;
        history = [];
        pathEdges = [];
        currentStepIndex = -1;
        setStepList([]);
        setStatusText("Status: Ready");
        setResultText("");
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
          node.isOnPath = prev.nodes[i].isOnPath;
          node.runningSum = prev.nodes[i].runningSum;
          node.color = p.color(prev.nodes[i].color.levels);
          node.targetColor = p.color(prev.nodes[i].targetColor.levels);
        });
        currentStepIndex = prev.stepIndex;
        stepNumber = prev.stepNumber;
        pathEdges = prev.pathEdges;
        computeComplete = false;
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
          Example 1: Path Sum (Target = 22)
        </Typography>
        <Typography variant="h6" sx={{ color: resultText.includes("✅") ? colors.pathFound : colors.pathNotFound, fontWeight: 600 }}>
          {resultText || "Target Sum: 22"}
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
          <LegendItem color={colors.pathFound} text="Path Found" textColor={colors.text.primary} />
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

export default PS_EX1;

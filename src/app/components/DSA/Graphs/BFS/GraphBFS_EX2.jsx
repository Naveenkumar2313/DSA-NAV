import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import p5 from "p5";
import { Box, Grid, Paper, Stack, Typography, Tooltip, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
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

const GraphBFS_EX2 = () => {
  const theme = useTheme();
  const colors = getExampleColors(theme);
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  const styles = getStyles(colors, isDark);
  const colorsRef = useRef(colors);

  const sketchRef = useRef();
  const [stepList, setStepList] = useState([]);
  const [statusText, setStatusText] = useState("Status: Ready");
  const [isPlaying, setIsPlaying] = useState(false);

  const DEFAULT_TARGET = "H";
  const audioRefs = useRef({});
  const stepListRef = useRef(null);

  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  useEffect(() => {
    if (stepListRef.current) {
      stepListRef.current.scrollTop = stepListRef.current.scrollHeight;
    }
  }, [stepList]);

  useLayoutEffect(() => {
    let visitCounter = 1;
    let stepNumber = 1;
    let nodes = [];
    let edges = [];
    let queue = [],
      current = null;
    let running = false,
      paused = true;
    let searchComplete = false;
    let history = [];
    let pInstance = null;
    let traversedEdges = [];

    class Node {
      constructor(value, x, y, p) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.visited = false;
        this.found = false;
        this.isCurrent = false;
        this.visitOrder = null;
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

    class Edge {
      constructor(from, to) {
        this.from = from;
        this.to = to;
        this.visited = false;
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

    const sketch = (p) => {
      pInstance = p;

      const createGraph = (p) => {
        const w = p.width;
        const h = p.height;

        // Create a more complex grid-like graph
        // Layout: 3 rows, 3 columns
        const nodePositions = [
          { value: "A", x: w * 0.2, y: h * 0.2 },
          { value: "B", x: w * 0.5, y: h * 0.2 },
          { value: "C", x: w * 0.8, y: h * 0.2 },
          { value: "D", x: w * 0.2, y: h * 0.5 },
          { value: "E", x: w * 0.5, y: h * 0.5 },
          { value: "F", x: w * 0.8, y: h * 0.5 },
          { value: "G", x: w * 0.2, y: h * 0.8 },
          { value: "H", x: w * 0.5, y: h * 0.8 },
          { value: "I", x: w * 0.8, y: h * 0.8 }
        ];

        nodes = nodePositions.map((pos) => new Node(pos.value, pos.x, pos.y, p));

        // Create edges for a grid graph with some diagonal connections
        const connections = [
          [0, 1],
          [1, 2], // Row 1 horizontal
          [0, 3],
          [1, 4],
          [2, 5], // Column connections
          [3, 4],
          [4, 5], // Row 2 horizontal
          [3, 6],
          [4, 7],
          [5, 8], // Column connections
          [6, 7],
          [7, 8], // Row 3 horizontal
          [0, 4],
          [2, 4], // Diagonal connections to center
          [4, 6],
          [4, 8], // More diagonals
          [1, 3],
          [1, 5] // Additional connections
        ];

        edges = [];
        connections.forEach(([fromIdx, toIdx]) => {
          edges.push(new Edge(nodes[fromIdx], nodes[toIdx]));
          edges.push(new Edge(nodes[toIdx], nodes[fromIdx])); // Undirected graph
        });
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
        const currentColors = colorsRef.current;
        p.background(currentColors.background.canvas);
        updateNodeStates(p);
        drawEdges(p);
        drawNodes(p);

        if (running && !paused && !searchComplete && p.frameCount % 60 === 0) {
          bfsStep();
        }
      };

      const updateNodeStates = (p) => {
        for (let node of nodes) {
          if (node.found) {
            node.targetColor = p.color(colorsRef.current.success);
            node.targetScale = 1.15;
          } else if (node.isCurrent) {
            node.targetColor = p.color(colorsRef.current.warning);
            node.targetScale = 1.2 + p.sin(p.frameCount * 0.1) * 0.1;
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
        // Draw base graph edges
        p.stroke(colorsRef.current.text.secondary);
        p.strokeWeight(2);
        const drawn = new Set();

        for (let edge of edges) {
          const key1 = `${edge.from.value}-${edge.to.value}`;
          const key2 = `${edge.to.value}-${edge.from.value}`;

          if (!drawn.has(key1) && !drawn.has(key2)) {
            p.line(edge.from.x, edge.from.y, edge.to.x, edge.to.y);
            drawn.add(key1);
          }
        }

        // Draw traversed edges with animation
        for (const tEdge of traversedEdges) {
          p.push();

          const fromVec = p.createVector(tEdge.from.x, tEdge.from.y);
          const toVec = p.createVector(tEdge.to.x, tEdge.to.y);

          p.stroke(p.color(colorsRef.current.warning));
          p.strokeWeight(3);
          p.drawingContext.setLineDash([8, 6]);
          p.line(fromVec.x, fromVec.y, toVec.x, toVec.y);
          p.drawingContext.setLineDash([]);

          const midPoint = p5.Vector.lerp(fromVec, toVec, 0.5);
          const angle = p.atan2(toVec.y - fromVec.y, toVec.x - fromVec.x);

          let arrowSize = 10;
          p.translate(midPoint.x, midPoint.y);
          p.rotate(angle);
          p.fill(p.color(colorsRef.current.warning));
          p.noStroke();
          p.triangle(0, 0, -arrowSize * 1.5, -arrowSize * 0.7, -arrowSize * 1.5, arrowSize * 0.7);

          p.pop();
        }
      };

      const drawNodes = (p) => {
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(16);
        p.textFont("Inter, sans-serif");

        for (let node of nodes) {
          p.stroke(colorsRef.current.primary);
          p.strokeWeight(2.5);
          p.fill(node.color);
          p.ellipse(node.x, node.y, 50 * node.scale, 50 * node.scale);

          p.noStroke();
          p.fill(colorsRef.current.text.primary);
          const label = node.visitOrder !== null ? `${node.value}(${node.visitOrder})` : node.value;
          p.text(label, node.x, node.y);
        }
      };

      const getNeighbors = (node) => {
        return edges.filter((e) => e.from === node).map((e) => e.to);
      };

      const bfsStep = () => {
        if (queue.length === 0 && !searchComplete) {
          setStatusText(`Target '${DEFAULT_TARGET}' not found.`);
          setStepList((prev) => [...prev, `Step ${stepNumber++}: Target not found.`]);
          playSound("fail");
          searchComplete = true;
          running = false;
          setIsPlaying(false);
          nodes.forEach((n) => (n.isCurrent = false));
          return;
        }

        if (searchComplete) return;

        history.push({
          nodes: nodes.map((n) => ({
            ...n,
            color: { levels: n.color.levels },
            targetColor: { levels: n.targetColor.levels }
          })),
          queue: [...queue],
          current: current,
          visitCounter,
          stepNumber,
          searchComplete,
          traversedEdges: [...traversedEdges]
        });

        const lastCurrent = current;
        current = queue.shift();
        nodes.forEach((n) => (n.isCurrent = n === current));

        if (lastCurrent && current) {
          traversedEdges.push({ from: lastCurrent, to: current });
        }

        if (!current.visited) {
          current.visited = true;
          current.visitOrder = visitCounter++;

          if (current.value === DEFAULT_TARGET) {
            current.found = true;
            setStatusText(`✓ Found '${DEFAULT_TARGET}'!`);
            setStepList((prev) => [...prev, `Step ${stepNumber++}: Found '${DEFAULT_TARGET}'!`]);
            playSound("success");
            searchComplete = true;
            running = false;
            setIsPlaying(false);
            nodes.forEach((n) => (n.isCurrent = false));
            return;
          }

          setStatusText(`Visiting: ${current.value}`);
          setStepList((prev) => [...prev, `Step ${stepNumber++}: Visiting '${current.value}'`]);
          playSound("step");

          const neighbors = getNeighbors(current);
          for (let neighbor of neighbors) {
            if (!neighbor.visited && !queue.includes(neighbor)) {
              queue.push(neighbor);
            }
          }
        } else {
          if (running && !paused) bfsStep();
        }
      };

      p.reset = () => {
        createGraph(p);
        visitCounter = 1;
        stepNumber = 1;
        history = [];
        traversedEdges = [];
        setStepList([]);
        setStatusText("Status: Ready");
        queue = [nodes[0]]; // Start from node A
        current = null;
        running = false;
        paused = true;
        searchComplete = false;
        setIsPlaying(false);
        p.loop();
      };

      p.step = () => {
        if (searchComplete) return;
        paused = true;
        setIsPlaying(false);
        bfsStep();
      };

      p.run = () => {
        if (searchComplete || (running && !paused)) return;
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
          Object.assign(node, prev.nodes[i]);
          node.color = p.color(prev.nodes[i].color.levels);
          node.targetColor = p.color(prev.nodes[i].targetColor.levels);
        });
        queue = prev.queue.map((sNode) => nodes.find((n) => n.value === sNode.value));
        current = prev.current ? nodes.find((n) => n.value === prev.current.value) : null;
        visitCounter = prev.visitCounter;
        stepNumber = prev.stepNumber;
        searchComplete = prev.searchComplete;
        traversedEdges = prev.traversedEdges;
        setStepList((prevList) => prevList.slice(0, -1));
        const lastStatus =
          history.length > 0
            ? current
              ? `Visiting: ${current.value}`
              : "Status: Ready"
            : "Status: Ready";
        setStatusText(lastStatus);
        nodes.forEach((n) => (n.isCurrent = n === current));
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
        <Typography variant="h5" gutterBottom sx={{ color: colors.text.primary }}>
          Element to be found: "{DEFAULT_TARGET}"
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
            background: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)",
            border: `1px solid ${colors.border}`,
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          <LegendItem color={colors.warning} text="Current" textColor={colors.text.primary} />
          <LegendItem color={colors.secondary} text="Visited" textColor={colors.text.primary} />
          <LegendItem color={colors.success} text="Found" textColor={colors.text.primary} />
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
            sx={{
              p: { xs: 1.5, md: 2 },
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              height: "100%",
              mx: "auto",
              bgcolor: colors.background.paper,
              backgroundImage: "none",
              border: `1px solid ${colors.border}`
            }}
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

export default GraphBFS_EX2;

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
    inQueue: isDark ? "#ce93d8" : "#9c27b0", // Purple for Priority Queue
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

const Dijkstra_EX1 = () => {
  const theme = useTheme();
  const colors = getExampleColors(theme);
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  const styles = getStyles(colors, isDark);
  const colorsRef = useRef(colors);

  const sketchRef = useRef();
  const [stepList, setStepList] = useState([]);
  const [statusText, setStatusText] = useState("Status: Ready");
  const [isPlaying, setIsPlaying] = useState(false);

  const DEFAULT_TARGET = "F";
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

    class Node {
      constructor(value, x, y, p) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.visited = false;
        this.isPath = false;
        this.inQueue = false;
        this.isCurrent = false;
        this.distance = Infinity;
        this.previous = null;
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
      constructor(from, to, weight) {
        this.from = from;
        this.to = to;
        this.weight = weight;
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
        const centerX = w / 2;
        const centerY = h / 2;
        const radius = Math.min(w, h) * 0.3;

        const nodeData = [
          { value: "A", angle: -90 },
          { value: "B", angle: -30 },
          { value: "C", angle: 30 },
          { value: "D", angle: 90 },
          { value: "E", angle: 150 },
          { value: "F", angle: 210 }
        ];

        nodes = nodeData.map((data) => {
          const angle = (data.angle * Math.PI) / 180;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          return new Node(data.value, x, y, p);
        });

        // Add Weights
        edges = [
          new Edge(nodes[0], nodes[1], 4), // A-B
          new Edge(nodes[0], nodes[2], 2), // A-C
          new Edge(nodes[1], nodes[0], 4), // B-A
          new Edge(nodes[1], nodes[3], 5), // B-D
          new Edge(nodes[1], nodes[4], 1), // B-E
          new Edge(nodes[2], nodes[0], 2), // C-A
          new Edge(nodes[2], nodes[5], 4), // C-F
          new Edge(nodes[3], nodes[1], 5), // D-B
          new Edge(nodes[4], nodes[1], 1), // E-B
          new Edge(nodes[4], nodes[5], 2), // E-F
          new Edge(nodes[5], nodes[2], 4), // F-C
          new Edge(nodes[5], nodes[4], 2) // F-E
        ];
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

        if (running && !paused && !searchComplete && p.frameCount % 60 === 0) {
          dijkstraStep();
        }
      };

      const updateNodeStates = (p) => {
        for (let node of nodes) {
          if (node.isPath) {
            node.targetColor = p.color(colorsRef.current.success);
            node.targetScale = 1.15;
          } else if (node.isCurrent) {
            node.targetColor = p.color(colorsRef.current.warning);
            node.targetScale = 1.2 + p.sin(p.frameCount * 0.1) * 0.1;
          } else if (node.inQueue) {
            node.targetColor = p.color(colorsRef.current.inQueue);
            node.targetScale = 1.05;
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
        const drawn = new Set();

        for (let edge of edges) {
          const key1 = `${edge.from.value}-${edge.to.value}`;
          const key2 = `${edge.to.value}-${edge.from.value}`;

          if (!drawn.has(key1) && !drawn.has(key2)) {
            // Check if this edge is part of the shortest path
            let isPathEdge = false;
            if (edge.to.previous === edge.from && edge.to.isPath && edge.from.isPath)
              isPathEdge = true;
            if (edge.from.previous === edge.to && edge.from.isPath && edge.to.isPath)
              isPathEdge = true;

            if (isPathEdge) {
              p.stroke(colorsRef.current.success);
              p.strokeWeight(4);
            } else {
              p.stroke(colorsRef.current.text.secondary);
              p.strokeWeight(2);
            }

            p.line(edge.from.x, edge.from.y, edge.to.x, edge.to.y);
            drawn.add(key1);

            // Draw Weight
            const midX = (edge.from.x + edge.to.x) / 2;
            const midY = (edge.from.y + edge.to.y) / 2;
            p.fill(colorsRef.current.text.primary);
            p.noStroke();
            p.textSize(14);
            p.textAlign(p.CENTER, p.CENTER);

            // Draw a tiny background for the text
            p.fill(colorsRef.current.background.canvas);
            p.ellipse(midX, midY, 20, 20);

            p.fill(colorsRef.current.warning);
            p.text(edge.weight, midX, midY);
          }
        }
      };

      const drawNodes = (p) => {
        p.textAlign(p.CENTER, p.CENTER);

        for (let node of nodes) {
          p.stroke(colorsRef.current.primary);
          p.strokeWeight(2.5);
          p.fill(node.color);
          p.ellipse(node.x, node.y, 60 * node.scale, 60 * node.scale);

          p.noStroke();
          p.fill(colorsRef.current.text.primary);

          p.textSize(16);
          p.text(node.value, node.x, node.y - 8);

          p.textSize(12);
          const distStr = node.distance === Infinity ? "∞" : node.distance;
          p.text(`d:${distStr}`, node.x, node.y + 12);
        }
      };

      const dijkstraStep = () => {
        if (queue.length === 0 && !searchComplete) {
          setStatusText(`Priority Queue empty. Target '${DEFAULT_TARGET}' not found.`);
          setStepList((prev) => [
            ...prev,
            `Step ${stepNumber++}: Queue empty. Target unreachable.`
          ]);
          playSound("fail");
          searchComplete = true;
          running = false;
          setIsPlaying(false);
          nodes.forEach((n) => (n.isCurrent = false));
          return;
        }

        if (searchComplete) return;

        // Save history state
        history.push({
          nodes: nodes.map((n) => ({
            ...n,
            color: { levels: n.color.levels },
            targetColor: { levels: n.targetColor.levels },
            previous: n.previous ? n.previous.value : null
          })),
          queue: queue.map((q) => q.value),
          current: current ? current.value : null,
          stepNumber,
          searchComplete
        });

        // Priority Queue extraction
        queue.sort((a, b) => a.distance - b.distance);
        current = queue.shift();
        current.inQueue = false;
        current.visited = true;

        nodes.forEach((n) => (n.isCurrent = n === current));

        if (current.value === DEFAULT_TARGET) {
          // Reconstruct Shortest Path
          let pathNode = current;
          while (pathNode) {
            pathNode.isPath = true;
            pathNode = pathNode.previous;
          }
          setStatusText(`✓ Shortest path found! Total Distance: ${current.distance}`);
          setStepList((prev) => [
            ...prev,
            `Step ${stepNumber++}: Target '${DEFAULT_TARGET}' reached. Distance = ${
              current.distance
            }.`
          ]);
          playSound("success");
          searchComplete = true;
          running = false;
          setIsPlaying(false);
          nodes.forEach((n) => (n.isCurrent = false));
          return;
        }

        setStatusText(`Extracting: ${current.value} (d:${current.distance})`);
        setStepList((prev) => [
          ...prev,
          `Step ${stepNumber++}: Extract Min -> '${current.value}' (dist = ${current.distance})`
        ]);
        playSound("step");

        // Edge Relaxation
        const neighbors = edges.filter((e) => e.from === current);
        let relaxedAny = false;

        for (let edge of neighbors) {
          let neighbor = edge.to;
          if (!neighbor.visited) {
            let newDist = current.distance + edge.weight;
            if (newDist < neighbor.distance) {
              neighbor.distance = newDist;
              neighbor.previous = current;
              setStepList((prev) => [
                ...prev,
                `  -> Relaxed edge to ${neighbor.value}, new dist = ${newDist}`
              ]);
              relaxedAny = true;
              if (!neighbor.inQueue) {
                neighbor.inQueue = true;
                queue.push(neighbor);
              }
            }
          }
        }
        if (!relaxedAny) {
          setStepList((prev) => [...prev, `  -> No neighbors relaxed.`]);
        }
      };

      p.reset = () => {
        createGraph(p);
        stepNumber = 1;
        history = [];
        setStepList([]);
        setStatusText("Status: Ready");

        nodes[0].distance = 0;
        nodes[0].inQueue = true;
        queue = [nodes[0]];

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
        dijkstraStep();
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
          node.previous = prev.nodes[i].previous
            ? nodes.find((n) => n.value === prev.nodes[i].previous)
            : null;
          node.color = p.color(prev.nodes[i].color.levels);
          node.targetColor = p.color(prev.nodes[i].targetColor.levels);
        });
        queue = prev.queue.map((val) => nodes.find((n) => n.value === val));
        current = prev.current ? nodes.find((n) => n.value === prev.current) : null;
        stepNumber = prev.stepNumber;
        searchComplete = prev.searchComplete;
        setStepList((prevList) => prevList.slice(0, -1)); // Might need multiple pops depending on step granularity
        setStatusText("Status: Reverted to previous step");
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
        <Typography variant="h5" gutterBottom sx={{ color: colors.text.primary, fontWeight: 700 }}>
          Dijkstra Shortest Path to "{DEFAULT_TARGET}"
        </Typography>
      </Box>

      {/* Control buttons omitted for brevity; same as original JSX */}
      <Box sx={{ p: 1, mb: 2, display: "flex", justifyContent: "center", gap: 1.5 }}>
        <Tooltip title="Reset">
          <IconButton
            onClick={() => sketchRef.current.reset()}
            sx={{
              color: colors.text.primary,
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
          <LegendItem color={colors.inQueue} text="In PQ" textColor={colors.text.primary} />
          <LegendItem
            color={colors.secondary}
            text="Visited/Relaxed"
            textColor={colors.text.primary}
          />
          <LegendItem color={colors.success} text="Shortest Path" textColor={colors.text.primary} />
          <LegendItem color={colors.info} text="Unvisited" textColor={colors.text.primary} />
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

export default Dijkstra_EX1;

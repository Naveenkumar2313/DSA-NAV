import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import p5 from "p5";
import { Box, Grid, Paper, Stack, Typography, Tooltip, IconButton, useTheme } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

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
    mst: isDark ? "#ec4899" : "#E91E63",
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
    background: isDark ? "#000000" : "linear-gradient(90deg, #e0e7ff 0%, #f0f2f5 100%)",
    border: `1.5px solid ${colors.border}`,
    maxHeight: { xs: 200, md: 420 }
  }
});

const Kruskal_EX1 = () => {
  const theme = useTheme();
  const colors = getExampleColors(theme);
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  const styles = getStyles(colors, isDark);
  const colorsRef = useRef(colors);

  const sketchRef = useRef();
  const [stepList, setStepList] = useState([]);
  const [statusText, setStatusText] = useState("Status: Ready");
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalMSTWeight, setTotalMSTWeight] = useState(0);

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
    let mstEdges = [];
    let processedEdges = [];
    let running = false,
      paused = true;
    let complete = false;
    let history = [];
    let pInstance = null;
    let sortedEdgeIndex = 0;

    class Node {
      constructor(value, x, y, p) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
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
        this.inMST = false;
        this.processed = false;
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
        audioRefs.current[soundType].play().catch((e) => console.error("Error:", e));
      }
    };

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

    const sketch = (p) => {
      pInstance = p;

      const createGraph = (p) => {
        const A = new Node("A", p.width * 0.2, p.height * 0.3, p);
        const B = new Node("B", p.width * 0.5, p.height * 0.15, p);
        const C = new Node("C", p.width * 0.8, p.height * 0.3, p);
        const D = new Node("D", p.width * 0.5, p.height * 0.7, p);

        nodes = [A, B, C, D];

        edges = [
          new Edge(nodes[0], nodes[1], 1),
          new Edge(nodes[0], nodes[2], 4),
          new Edge(nodes[1], nodes[2], 2),
          new Edge(nodes[1], nodes[3], 5),
          new Edge(nodes[2], nodes[3], 3)
        ];

        edges.sort((a, b) => a.weight - b.weight);
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
        drawEdges(p);
        updateNodeStates(p);
        drawNodes(p);

        if (running && !paused && !complete && p.frameCount % 60 === 0) {
          kruskalStep();
        }
      };

      const updateNodeStates = (p) => {
        for (let node of nodes) {
          node.targetColor = p.color(colorsRef.current.info);
          node.targetScale = 1;
          node.update(p);
        }
      };

      const drawEdges = (p) => {
        p.stroke(colorsRef.current.text.secondary);
        p.strokeWeight(2);

        for (let edge of edges) {
          const fromVec = p.createVector(edge.from.x, edge.from.y);
          const toVec = p.createVector(edge.to.x, edge.to.y);

          if (edge.inMST) {
            p.stroke(p.color(colorsRef.current.mst));
            p.strokeWeight(4);
            p.line(fromVec.x, fromVec.y, toVec.x, toVec.y);

            const midPoint = p5.Vector.lerp(fromVec, toVec, 0.5);
            p.fill(p.color(colorsRef.current.mst));
            p.noStroke();
            p.textSize(12);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(edge.weight, midPoint.x, midPoint.y - 10);
          } else if (edge.processed) {
            p.stroke(p.color(colorsRef.current.secondary));
            p.strokeWeight(1.5);
            p.line(fromVec.x, fromVec.y, toVec.x, toVec.y);

            const midPoint = p5.Vector.lerp(fromVec, toVec, 0.5);
            p.fill(p.color(colorsRef.current.text.secondary));
            p.noStroke();
            p.textSize(11);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(edge.weight, midPoint.x, midPoint.y - 8);
          } else {
            p.stroke(p.color(colorsRef.current.text.secondary));
            p.strokeWeight(2);
            p.line(fromVec.x, fromVec.y, toVec.x, toVec.y);

            const midPoint = p5.Vector.lerp(fromVec, toVec, 0.5);
            p.fill(p.color(colorsRef.current.text.secondary));
            p.noStroke();
            p.textSize(11);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(edge.weight, midPoint.x, midPoint.y - 8);
          }
        }
      };

      const drawNodes = (p) => {
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(16);

        for (let node of nodes) {
          p.stroke(colorsRef.current.primary);
          p.strokeWeight(2.5);
          p.fill(node.color);
          p.ellipse(node.x, node.y, 50 * node.scale, 50 * node.scale);

          p.noStroke();
          p.fill(colorsRef.current.text.primary);
          p.text(node.value, node.x, node.y);
        }
      };

      const kruskalStep = () => {
        if (sortedEdgeIndex >= edges.length) {
          if (!complete) {
            complete = true;
            running = false;
            setIsPlaying(false);
            const totalWeight = mstEdges.reduce((sum, e) => sum + e.weight, 0);
            setTotalMSTWeight(totalWeight);
            setStatusText(`✓ MST Complete! Total Weight: ${totalWeight}`);
            setStepList((prev) => [...prev, `MST Complete! Total Weight: ${totalWeight}`]);
            playSound("success");
          }
          return;
        }

        const dsu = new DSU(nodes.length);
        mstEdges.forEach((e) => {
          const fromIdx = nodes.indexOf(e.from);
          const toIdx = nodes.indexOf(e.to);
          dsu.union(fromIdx, toIdx);
        });

        const edge = edges[sortedEdgeIndex];
        const fromIdx = nodes.indexOf(edge.from);
        const toIdx = nodes.indexOf(edge.to);

        edge.processed = true;

        if (dsu.union(fromIdx, toIdx)) {
          edge.inMST = true;
          mstEdges.push(edge);
          setStepList((prev) => [
            ...prev,
            `Step ${stepNumber}: Edge (${edge.from.value}-${edge.to.value}) W:${edge.weight} ✓`
          ]);
          playSound("step");
        } else {
          setStepList((prev) => [
            ...prev,
            `Step ${stepNumber}: Edge (${edge.from.value}-${edge.to.value}) W:${edge.weight} ✗ (cycle)`
          ]);
        }

        sortedEdgeIndex++;
        stepNumber++;
      };

      p.reset = () => {
        createGraph(p);
        stepNumber = 1;
        mstEdges = [];
        processedEdges = [];
        running = false;
        paused = true;
        complete = false;
        sortedEdgeIndex = 0;
        history = [];
        setStepList([]);
        setStatusText("Status: Ready");
        setTotalMSTWeight(0);
        setIsPlaying(false);
        p.loop();
      };

      p.step = () => {
        if (complete) return;
        paused = true;
        setIsPlaying(false);
        kruskalStep();
      };

      p.run = () => {
        if (complete || (running && !paused)) return;
        running = true;
        paused = false;
        setIsPlaying(true);
      };

      p.pause = () => {
        paused = true;
        running = false;
        setIsPlaying(false);
      };
    };

    const p5Instance = new p5(sketch, sketchRef.current);
    if (sketchRef.current) {
      Object.assign(sketchRef.current, {
        reset: p5Instance.reset,
        step: p5Instance.step,
        run: p5Instance.run,
        pause: p5Instance.pause
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
          Kruskal's Algorithm - Minimum Spanning Tree
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
          <LegendItem color={colors.mst} text="MST Edge" textColor={colors.text.primary} />
          <LegendItem color={colors.secondary} text="Rejected" textColor={colors.text.primary} />
          <LegendItem color={colors.info} text="Unprocessed" textColor={colors.text.primary} />
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
              <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 1 }}>
                {statusText}
              </Typography>
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
        borderRadius: "2px",
        backgroundColor: color,
        border: "2px solid rgba(0,0,0,0.1)"
      }}
    />
    <Typography variant="body2" sx={{ fontWeight: 500, color: textColor }}>
      {text}
    </Typography>
  </Stack>
);

export default Kruskal_EX1;

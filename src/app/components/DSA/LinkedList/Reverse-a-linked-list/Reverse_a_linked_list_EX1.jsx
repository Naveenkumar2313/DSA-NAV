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
    },
    text: {
      primary: isDark ? "#ffffff" : "#2c3e50",
      secondary: isDark ? "#b0bec5" : "#7f8c8d",
    },
    border: isDark ? "#000000" : "#e0e0e0",
    buttons: {
      bg: isDark ? "#1a1a1a" : "#ffffff",
      hoverBg: isDark ? "#333333" : "#f0f2f5",
      playBg: isDark ? "#2e7d32" : "#b9fbc0",
      pauseBg: isDark ? "#ef6c00" : "#ffe0b2",
      resetBg: isDark ? "#c62828" : "#ffcdd2",
    },
  };
};

const getStyles = (colors, isDark) => ({
  container: {
    p: { xs: 2, sm: 4 },
    minHeight: "100vh",
    background: isDark ? "#000000" : "linear-gradient(135deg, #f0f2f5 0%, #e0e7ff 100%)",
  },
  canvasWrapper: {
    position: "relative",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: isDark ? "none" : "0 8px 32px 0 rgba(44, 62, 80, 0.12)",
    background: colors.background.paper,
    border: `1px solid ${colors.border}`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  canvasBox: {
    width: "100%",
    maxWidth: 800,
    aspectRatio: "16 / 9",
  },
  stepListBox: {
    overflowY: "auto",
    mt: 1,
    p: 1.5,
    borderRadius: 3,
    background: isDark ? "#000000" : "linear-gradient(90deg, #e0e7ff 0%, #f0f2f5 100%)",
    border: `1.5px solid ${colors.border}`,
    maxHeight: { xs: 200, md: 420 },
  },
});

const ReverseLinkedList_EX1 = () => {
  const theme = useTheme();
  const colors = getExampleColors(theme);
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  const styles = getStyles(colors, isDark);
  const colorsRef = useRef(colors);

  const sketchRef = useRef();
  const [stepList, setStepList] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

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
    let head;
    let prev = null,
      current = null,
      next = null;
    let running = false,
      paused = true;
    let complete = false;
    let history = [];
    let pInstance = null;

    class Node {
      constructor(value, p) {
        this.value = value;
        this.next = null;
        this.targetX = 0;
        this.targetY = 0;
        this.x = 0;
        this.y = 0;
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

      const createLinkedList = (p) => {
        nodes = [];
        const values = ["A", "B", "C", "D"];
        let tempNode = null;
        values.forEach((val, i) => {
          const newNode = new Node(val, p);
          if (i === 0) {
            head = newNode;
            tempNode = head;
          } else {
            tempNode.next = newNode;
            tempNode = newNode;
          }
          nodes.push(newNode);
        });
        layoutNodes(p);
      };

      const layoutNodes = (p) => {
        const w = p.width;
        const h = p.height;
        const spacing = w / (nodes.length + 1);
        nodes.forEach((node, i) => {
          node.targetX = (i + 1) * spacing;
          node.targetY = h / 2;
          if (!running) {
            node.x = node.targetX;
            node.y = node.targetY;
          }
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
        p.background(colorsRef.current.background.canvas);
        updateNodeStates(p);
        drawEdges(p);
        drawNodes(p);
        drawPointerLabels(p);

        if (running && !paused && !complete && p.frameCount % 60 === 0) {
          reverseStep();
        }
      };

      const updateNodeStates = (p) => {
        for (let node of nodes) {
          if (node === current) {
            node.targetColor = p.color(colorsRef.current.warning);
            node.targetScale = 1.2;
          } else if (node === prev) {
            node.targetColor = p.color(colorsRef.current.success);
            node.targetScale = 1;
          } else {
            node.targetColor = p.color(colorsRef.current.info);
            node.targetScale = 1;
          }
          node.update(p);
        }
      };
      
      const drawEdges = (p) => {
        p.strokeWeight(2);
        for (let node of nodes) {
            if (node.next) {
                p.stroke(colorsRef.current.text.secondary);
                drawArrow(p, node.x, node.y, node.next.x, node.next.y);
            }
        }
      };
      
      const drawArrow = (p, x1, y1, x2, y2) => {
        const angle = p.atan2(y2 - y1, x2 - x1);
        const headlen = 10;
        p.line(x1, y1, x2, y2);
        p.push();
        p.translate(x2, y2);
        p.rotate(angle);
        p.fill(colorsRef.current.text.secondary);
        p.triangle(0, 0, -headlen, -headlen / 2, -headlen, headlen / 2);
        p.pop();
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

      const drawPointerLabels = (p) => {
        p.fill(colorsRef.current.text.primary);
        p.textSize(16);
        p.noStroke();

        if (prev) p.text("prev", prev.x, prev.y + 40);
        if (current) p.text("current", current.x, current.y + 40);
        if (next) p.text("next", next.x, next.y - 40);
      };

      const reverseStep = () => {
        if (!current && !complete) {
            // First step
            current = head;
            setStepList((prev) => [...prev, `Step ${stepNumber++}: Start. current is head.`]);
            playSound("step");
            return;
        }

        if (current === null && !complete) {
          head = prev;
          setStepList((prev) => [...prev, `Step ${stepNumber++}: current is null. Reverse complete.`]);
          playSound("success");
          complete = true;
          running = false;
          setIsPlaying(false);
          return;
        }

        history.push({
            nodes: JSON.parse(JSON.stringify(nodes)),
            prev,
            current,
            next,
            head,
            stepNumber,
            complete
        });

        next = current.next;
        current.next = prev;
        prev = current;
        current = next;

        setStepList((prev) => [...prev, `Step ${stepNumber++}: Update pointers.`]);
        playSound("step");
      };

      p.reset = () => {
        createLinkedList(p);
        stepNumber = 1;
        history = [];
        setStepList([]);
        prev = null;
        current = null;
        next = null;
        running = false;
        paused = true;
        complete = false;
        setIsPlaying(false);
        p.loop();
      };

      p.step = () => {
        if (complete) return;
        paused = true;
        setIsPlaying(false);
        reverseStep();
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

      p.prevStep = () => {
        if (history.length === 0) return;
        paused = true;
        setIsPlaying(false);
        const prevState = history.pop();
        
        nodes.forEach((node, i) => {
            const prevNode = prevState.nodes[i];
            node.value = prevNode.value;
            node.next = prevNode.next ? nodes.find(n => n.value === prevNode.next.value) : null;
        });
        
        prev = prevState.prev ? nodes.find(n => n.value === prevState.prev.value) : null;
        current = prevState.current ? nodes.find(n => n.value === prevState.current.value) : null;
        next = prevState.next ? nodes.find(n => n.value === prevState.next.value) : null;
        head = prevState.head ? nodes.find(n => n.value === prevState.head.value) : null;
        
        stepNumber = prevState.stepNumber;
        complete = prevState.complete;

        setStepList((prevList) => prevList.slice(0, -1));
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
          Reverse a Linked List
        </Typography>
      </Box>

      <Box sx={{ p: 1, mb: 2, display: "flex", justifyContent: "center", gap: 1.5 }}>
        <Tooltip title="Reset">
          <IconButton
            onClick={() => sketchRef.current.reset()}
            sx={{
              color: isDark ? "#ffffff" : colors.text.primary,
              bgcolor: colors.buttons.resetBg,
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
          }}
        >
          <LegendItem color={colors.warning} text="Current" textColor={colors.text.primary} />
          <LegendItem color={colors.success} text="Prev" textColor={colors.text.primary} />
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

export default ReverseLinkedList_EX1;

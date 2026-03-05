import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import p5 from "p5";
import {
  Box,
  Grid,
  Paper,
  Stack,
  Typography,
  Tooltip,
  IconButton,
  useTheme,
  alpha
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

// Import sound files
const stepSoundFile = "/DSA/step.mp3";
const successSoundFile = "/DSA/success.mp3";

// --- THEME-AWARE COLOR FUNCTION ---
const getExampleColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";

  return {
    primary: {
      main: isDark ? "#60a5fa" : "#2c3e50"
    },
    info: {
      main: isDark ? "#1a1a1a" : "#e5e7e9"
    },
    success: {
      main: isDark ? "#34d399" : "#abebc6"
    },
    warning: {
      main: isDark ? "#fbbf24" : "#f9e79f"
    },
    error: {
      main: isDark ? "#f87171" : "#f5b7b1"
    },
    background: {
      default: isDark
        ? "linear-gradient(135deg, #000000 0%, #0a0a0a 100%)"
        : "linear-gradient(135deg, #f0f2f5 0%, #e0e7ff 100%)",
      paper: isDark ? "#000000" : "#ffffff",
      surface: isDark ? "rgba(0, 0, 0, 0.95)" : "rgba(255,255,255,0.95)"
    },
    text: {
      primary: isDark ? "#f1f5f9" : "#2c3e50",
      secondary: isDark ? "#94a3b8" : "#7f8c8d"
    },
    border: isDark ? "#333333" : "#e0e0e0",
    stepListBox: {
      background: isDark
        ? "linear-gradient(145deg, #000000, #0a0a0a)"
        : "linear-gradient(145deg, #e2e8f0, #f8fafc)",
      boxShadow: isDark
        ? "inset 4px 4px 8px #000000, inset -4px -4px 8px #1a1a1a"
        : "inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff",
      scrollbarThumb: isDark ? "#333333" : "#bdc3c7"
    },
    legendBackground: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(255,255,255,0.7)",
    iconButton: {
      background: isDark ? "#0a0a0a" : "#ffffff",
      border: isDark ? "#333333" : "#e0e0e0",
      hoverBackground: isDark ? "#1a1a1a" : "#f0f2f5"
    },
    paper: {
      boxShadow: isDark
        ? "0 8px 32px 0 rgba(0, 0, 0, 0.3)"
        : "0 8px 32px 0 rgba(44, 62, 80, 0.12), 0 1.5px 6px 0 rgba(160,196,255,0.08)"
    }
  };
};

const getStyles = (colors, isDark) => ({
  container: {
    p: { xs: 2, sm: 4 },
    background: colors.background.default,
    border: `1px solid #e0e0e0`
  },
  canvasWrapper: {
    position: "relative",
    borderRadius: "24px",
    border: `1px solid #e0e0e0`,
    overflow: "hidden",
    boxShadow: colors.paper.boxShadow,
    background: colors.background.surface,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  canvasBox: { width: "100%", maxWidth: 800, aspectRatio: "16 / 9" },
  stepListBox: {
    height: "250px",
    overflowY: "auto",
    mt: 1,
    p: 1.5,
    borderRadius: "12px",
    border: `1px solid #e0e0e0`,
    background: colors.stepListBox.background,
    boxShadow: colors.stepListBox.boxShadow,
    "&::-webkit-scrollbar": { width: "8px" },
    "&::-webkit-scrollbar-thumb": {
      background: colors.stepListBox.scrollbarThumb,
      borderRadius: "4px"
    }
  }
});

const RLL_EX2 = () => {
  const theme = useTheme();
  const colors = getExampleColors(theme);
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  const styles = getStyles(colors, isDark);
  const colorsRef = useRef(colors);

  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  const sketchRef = useRef();
  const toastRef = useRef();
  const stepListRef = useRef(null);
  const [status, setStatus] = useState("Ready to reverse");
  const [stepList, setStepList] = useState([]);
  const [isReversed, setIsReversed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const audioRefs = useRef({});

  const stateRef = useRef({
    nodes: [],
    originalValues: [5, 15, 25, 35, 45, 55, 65],
    prev: -1,
    curr: 0,
    nextNode: -1,
    stepCount: 0,
    reversing: false,
    paused: true,
    runMode: false,
    successPlayed: false,
    done: false,
    animation: { inProgress: false, nodeIndex: -1, progress: 0 }
  });

  useEffect(() => {
    if (stepListRef.current) {
      stepListRef.current.scrollTop = stepListRef.current.scrollHeight;
    }
  }, [stepList]);

  useLayoutEffect(() => {
    let pInstance = null;

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
      p.setup = () => {
        const container = sketchRef.current;
        const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
        canvas.parent(container);
        p.textAlign(p.CENTER, p.CENTER);
        preloadAudio();
        p.reset();
      };

      p.draw = () => {
        const currentColors = colorsRef.current;
        p.background(currentColors.background.paper);
        drawLinkedList(p);
        const s = stateRef.current;

        if (s.animation.inProgress) {
          s.animation.progress += 0.04;
          if (s.animation.progress >= 1) {
            endAnimation();
          }
        } else if (s.reversing && !s.paused && s.runMode && p.frameCount % 30 === 0) {
          performStep();
        }
      };

      const drawLinkedList = (p) => {
        const currentColors = colorsRef.current;
        const s = stateRef.current;
        const { nodes, prev, curr, animation } = s;
        if (nodes.length === 0) return;

        const n = nodes.length;
        const radius = Math.min(30, (p.width - 100) / (n * 3));
        const spacing = (p.width - 80) / n;
        const startX = 40 + spacing / 2;
        const yPos = p.height / 2;

        // Draw arrows
        for (let i = 0; i < n; i++) {
          const x1 = startX + i * spacing;
          const nextIdx = nodes[i].next;

          if (nextIdx !== -1) {
            const x2 = startX + nextIdx * spacing;
            const y1 = yPos;
            const y2 = yPos;

            const isAnimatingThis = animation.inProgress && animation.nodeIndex === i;

            if (isAnimatingThis) {
              const prog = animation.progress;
              p.push();
              p.stroke(p.color(currentColors.error.main));
              p.strokeWeight(2);
              p.noFill();

              const fromBx = x1 + radius;
              const toBx = startX + (i - 1 >= 0 ? i - 1 : 0) * spacing - radius;
              const endX = p.lerp(fromBx, toBx, prog);
              const cpY = yPos - 40 - prog * 30;

              p.bezier(
                x1 + radius, yPos,
                x1 + radius, cpY,
                endX, cpY,
                endX, yPos
              );
              p.pop();
            } else {
              const fromX = x1 + radius;
              const toX = x2 - radius;

              let arrowColor;
              if (nodes[i].reversed) {
                arrowColor = p.color(currentColors.success.main);
              } else {
                arrowColor = p.color(currentColors.text.secondary);
              }

              p.push();
              p.stroke(arrowColor);
              p.strokeWeight(2);
              p.line(fromX, y1, toX, y2);
              const angle = Math.atan2(y2 - y1, toX - fromX);
              const arrowSize = 8;
              p.fill(arrowColor);
              p.triangle(
                toX, y2,
                toX - arrowSize * Math.cos(angle - Math.PI / 6),
                y2 - arrowSize * Math.sin(angle - Math.PI / 6),
                toX - arrowSize * Math.cos(angle + Math.PI / 6),
                y2 - arrowSize * Math.sin(angle + Math.PI / 6)
              );
              p.pop();
            }
          }
        }

        // Draw NULL
        if (!s.done) {
          const lastOrigIdx = n - 1;
          const nullX = startX + lastOrigIdx * spacing + radius + 25;
          p.fill(currentColors.text.secondary);
          p.noStroke();
          p.textSize(12);
          p.text("NULL", nullX, yPos);
        } else {
          const nullX = startX + 0 * spacing + radius + 25;
          p.fill(currentColors.text.secondary);
          p.noStroke();
          p.textSize(12);
          p.text("NULL", nullX, yPos);
        }

        // Draw nodes
        for (let i = 0; i < n; i++) {
          const x = startX + i * spacing;
          const y = yPos;

          let nodeColor;
          if (s.done) {
            nodeColor = p.color(currentColors.success.main);
          } else if (i === curr && s.reversing) {
            nodeColor = p.color(currentColors.warning.main);
          } else if (i === prev) {
            nodeColor = p.color(currentColors.error.main);
          } else if (nodes[i].reversed) {
            nodeColor = p.color(currentColors.success.main);
          } else {
            nodeColor = p.color(currentColors.info.main);
          }

          p.fill(nodeColor);
          p.stroke(currentColors.primary.main);
          p.strokeWeight(2);
          p.ellipse(x, y, radius * 2, radius * 2);

          p.noStroke();
          p.fill(currentColors.text.primary);
          p.textSize(Math.max(11, radius * 0.55));
          p.text(nodes[i].value, x, y);
        }

        // Draw pointer labels
        if (s.reversing || s.done) {
          p.textSize(11);
          if (prev !== -1) {
            p.fill(currentColors.error.main);
            p.text("prev", startX + prev * spacing, yPos + radius + 18);
          }
          if (curr !== -1 && !s.done) {
            p.fill(currentColors.warning.main);
            p.text("curr", startX + curr * spacing, yPos + radius + 18);
          }
          if (s.nextNode !== -1 && !s.done) {
            p.fill(currentColors.primary.main);
            p.text("next", startX + s.nextNode * spacing, yPos + radius + 32);
          }
        }

        // Draw "head" label
        if (!s.done) {
          p.fill(currentColors.primary.main);
          p.textSize(11);
          p.text("head", startX, yPos - radius - 14);
        } else {
          p.fill(currentColors.primary.main);
          p.textSize(11);
          p.text("head", startX + (n - 1) * spacing, yPos - radius - 14);
        }
      };

      const performStep = () => {
        const s = stateRef.current;
        if (s.done || s.animation.inProgress) return;

        if (s.curr === -1) {
          finishReverse();
          return;
        }

        s.stepCount++;

        s.nextNode = s.nodes[s.curr].next !== -1 ? s.nodes[s.curr].next : -1;
        const currVal = s.nodes[s.curr].value;
        const prevVal = s.prev !== -1 ? s.nodes[s.prev].value : "NULL";
        const nextVal = s.nextNode !== -1 ? s.nodes[s.nextNode].value : "NULL";

        const stepMessage = `Step ${s.stepCount}: curr=${currVal}, prev=${prevVal}, next=${nextVal}. Reversing curr.next → prev.`;

        s.animation = { inProgress: true, nodeIndex: s.curr, progress: 0 };
        setIsAnimating(true);
        s.paused = true;

        setStatus(stepMessage);
        setStepList((prev) => [...prev, stepMessage]);
        playSound("step");
      };

      const endAnimation = () => {
        const s = stateRef.current;
        s.animation.inProgress = false;
        setIsAnimating(false);

        const currIdx = s.curr;
        const prevIdx = s.prev;
        const nextIdx = s.nextNode;

        s.nodes[currIdx].next = prevIdx;
        s.nodes[currIdx].reversed = true;

        s.prev = currIdx;
        s.curr = nextIdx;

        if (!s.runMode) {
          s.paused = true;
        } else {
          s.paused = false;
        }
      };

      const finishReverse = () => {
        const s = stateRef.current;
        const message = `Reversal Complete in ${s.stepCount} steps! New head is node ${s.nodes[s.prev].value}.`;
        setStatus(message);
        if (!isReversed) setStepList((prev) => [...prev, message]);
        if (!s.successPlayed) {
          playSound("success");
          s.successPlayed = true;
        }
        s.reversing = false;
        s.runMode = false;
        s.paused = true;
        s.done = true;
        setIsPlaying(false);
        setIsReversed(true);
      };

      p.reset = () => {
        const s = stateRef.current;
        const vals = s.originalValues;
        s.nodes = vals.map((v, i) => ({
          value: v,
          next: i < vals.length - 1 ? i + 1 : -1,
          reversed: false
        }));
        s.prev = -1;
        s.curr = 0;
        s.nextNode = -1;
        s.stepCount = 0;
        s.reversing = false;
        s.paused = true;
        s.runMode = false;
        s.successPlayed = false;
        s.done = false;
        s.animation = { inProgress: false, nodeIndex: -1, progress: 0 };
        setStatus("Ready to reverse");
        setStepList([]);
        setIsReversed(false);
        setIsPlaying(false);
        setIsAnimating(false);
      };

      p.step = () => {
        if (isReversed) return;
        if (!stateRef.current.reversing) stateRef.current.reversing = true;
        performStep();
      };

      p.run = () => {
        if (isReversed) return;
        const s = stateRef.current;
        if (!s.reversing) s.reversing = true;
        s.paused = false;
        s.runMode = true;
        setIsPlaying(true);
      };

      p.pause = () => {
        stateRef.current.paused = true;
        stateRef.current.runMode = false;
        setIsPlaying(false);
      };

      pInstance = p;
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

  const copySteps = async () => {
    try {
      await navigator.clipboard.writeText(stepList.join("\n"));
      const toast = toastRef.current;
      if (toast) {
        toast.innerText = "Steps copied to clipboard!";
        toast.style.visibility = "visible";
        toast.style.opacity = 1;
        setTimeout(() => {
          toast.style.opacity = 0;
          toast.style.visibility = "hidden";
        }, 2000);
      }
    } catch {
      alert("Failed to copy steps.");
    }
  };

  return (
    <Box sx={styles.container}>
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom sx={{ color: colors.text.primary }}>
          Example 2
        </Typography>
        <Typography variant="body2" sx={{ color: colors.text.secondary }}>
          Linked List: 5 → 15 → 25 → 35 → 45 → 55 → 65 → NULL
        </Typography>
      </Box>

      <Box sx={{ p: 1, mb: 2, display: "flex", justifyContent: "center", gap: 1.5 }}>
        <Tooltip title="Reset">
          <IconButton
            onClick={() => sketchRef.current.reset()}
            sx={{
              color: colors.text.primary,
              background: colors.iconButton.background,
              border: `1px solid ${colors.iconButton.border}`,
              "&:hover": { background: colors.iconButton.hoverBackground }
            }}
          >
            <RestartAltIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Next Step">
          <span>
            <IconButton
              onClick={() => sketchRef.current.step()}
              disabled={isReversed || isPlaying || isAnimating}
              sx={{
                color: colors.text.primary,
                background: colors.iconButton.background,
                border: `1px solid ${colors.iconButton.border}`,
                "&:hover": { background: colors.iconButton.hoverBackground }
              }}
            >
              <ArrowForwardIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={isPlaying ? "Playing" : "Run"}>
          <span>
            <IconButton
              onClick={() => sketchRef.current.run()}
              disabled={isReversed || isPlaying || isAnimating}
              sx={{
                background: isPlaying ? colors.success.main : colors.iconButton.background,
                color: colors.text.primary,
                border: `1px solid ${colors.iconButton.border}`
              }}
            >
              <PlayArrowIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Pause">
          <span>
            <IconButton
              onClick={() => sketchRef.current.pause()}
              disabled={isReversed || !isPlaying}
              sx={{
                color: colors.text.primary,
                background: colors.iconButton.background,
                border: `1px solid ${colors.iconButton.border}`,
                "&:hover": { background: colors.iconButton.hoverBackground }
              }}
            >
              <PauseIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box
        sx={{
          mb: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%"
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            p: 1.5,
            borderRadius: 2,
            background: colors.legendBackground,
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          <LegendItem
            color={colors.warning.main}
            text="Current (curr)"
            textColor={colors.text.primary}
          />
          <LegendItem color={colors.error.main} text="Previous (prev)" textColor={colors.text.primary} />
          <LegendItem color={colors.success.main} text="Reversed" textColor={colors.text.primary} />
          <LegendItem color={colors.info.main} text="Unprocessed" textColor={colors.text.primary} />
        </Stack>
        <Typography variant="body1" sx={{ mt: 2, color: colors.text.primary }}>
          Status: {status}
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, md: 4 }} justifyContent="center" alignItems="stretch">
        <Grid item xs={12} md={8}>
          <Box sx={styles.canvasWrapper}>
            <Box sx={styles.canvasBox}>
              <div ref={sketchRef} style={{ width: "100%", height: "100%" }} />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: { xs: 1.5, md: 2 },
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mx: "auto",
              bgcolor: colors.background.paper
            }}
          >
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ color: colors.text.primary }}>
                  Execution Steps
                </Typography>
                <Tooltip title="Copy Steps">
                  <IconButton
                    onClick={copySteps}
                    size="small"
                    sx={{
                      color: colors.text.primary,
                      background: colors.iconButton.background,
                      border: `1px solid ${colors.iconButton.border}`,
                      "&:hover": { background: colors.iconButton.hoverBackground }
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
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

export default RLL_EX2;

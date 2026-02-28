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

const BBS_EX1 = () => {
  const theme = useTheme();
  const colors = getExampleColors(theme);
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  const styles = getStyles(colors, isDark);
  const colorsRef = useRef(colors);

  // Keep colorsRef in sync with theme changes
  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  const sketchRef = useRef();
  const toastRef = useRef();
  const stepListRef = useRef(null);
  const [status, setStatus] = useState("Ready to sort");
  const [stepList, setStepList] = useState([]);
  const [isSorted, setIsSorted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const audioRefs = useRef({});

  const stateRef = useRef({
    arr: [],
    originalArr: [64, 34, 25, 12, 22, 11, 90, 1, 2, 105],
    i: 0,
    j: 0,
    stepCount: 0,
    sorting: false,
    paused: true,
    runMode: false,
    successPlayed: false,
    animation: { inProgress: false, fromIndex: -1, toIndex: -1, progress: 0 }
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
        drawArray(p);
        const s = stateRef.current;

        if (s.animation.inProgress) {
          s.animation.progress += 0.05;
          if (s.animation.progress >= 1) {
            endAnimation();
          }
        } else if (s.sorting && !s.paused && s.runMode && p.frameCount % 20 === 0) {
          performStep();
        }
      };

      const drawArray = (p) => {
        const currentColors = colorsRef.current;
        const { arr, i: outerI, j, animation } = stateRef.current;
        if (arr.length === 0) return;

        const barWidth = (p.width - 60) / arr.length;
        const startX = p.width / 2 - (arr.length * barWidth) / 2;
        const yPos = p.height - 40;

        for (let i = 0; i < arr.length; i++) {
          const h = p.map(arr[i], 0, Math.max(...stateRef.current.originalArr), 0, p.height - 100);
          let xPos = startX + i * barWidth;

          let barColor;
          if (isSorted) barColor = p.color(currentColors.success.main);
          else if (animation.inProgress && (i === animation.fromIndex || i === animation.toIndex))
            barColor = p.color(currentColors.error.main);
          else if ((i === j || i === j + 1) && stateRef.current.sorting)
            barColor = p.color(currentColors.warning.main);
          else if (i >= arr.length - outerI) barColor = p.color(currentColors.success.main);
          else barColor = p.color(currentColors.info.main);

          if (animation.inProgress) {
            if (i === animation.fromIndex) {
              xPos = p.lerp(
                startX + animation.fromIndex * barWidth,
                startX + animation.toIndex * barWidth,
                animation.progress
              );
            } else if (i === animation.toIndex) {
              xPos = p.lerp(
                startX + animation.toIndex * barWidth,
                startX + animation.fromIndex * barWidth,
                animation.progress
              );
            }
          }

          p.fill(barColor);
          p.stroke(currentColors.primary.main);
          p.strokeWeight(2);
          p.rect(xPos, yPos - h, barWidth, h);

          p.noStroke();
          p.fill(currentColors.text.primary);
          p.textSize(Math.max(12, barWidth * 0.2));
          p.text(arr[i], xPos + barWidth / 2, yPos - h - 20);
        }
      };

      const performStep = () => {
        const s = stateRef.current;
        const arr = s.arr;
        if (isSorted || s.animation.inProgress) return;

        if (s.i < arr.length - 1) {
          if (s.j < arr.length - s.i - 1) {
            const a = arr[s.j];
            const b = arr[s.j + 1];

            s.stepCount++;
            let stepMessage;

            if (a > b) {
              stepMessage = `Step ${s.stepCount}: Swapped ${b} and ${a}`;
              s.animation = { inProgress: true, fromIndex: s.j, toIndex: s.j + 1, progress: 0 };
              setIsAnimating(true);
              s.paused = true;
            } else {
              stepMessage = `Step ${s.stepCount}: Compared ${a} and ${b}, no swap`;
              s.j++;
            }

            setStatus(stepMessage);
            setStepList((prev) => [...prev, stepMessage]);
            playSound("step");
          } else {
            s.j = 0;
            s.i++;
          }
        } else {
          finishSort();
        }
      };

      const endAnimation = () => {
        const s = stateRef.current;
        const { fromIndex, toIndex } = s.animation;
        [s.arr[fromIndex], s.arr[toIndex]] = [s.arr[toIndex], s.arr[fromIndex]];
        s.animation.inProgress = false;
        s.j++;
        setIsAnimating(false);
        if (!s.runMode) {
          s.paused = true;
        } else {
          s.paused = false;
        }
      };

      const finishSort = () => {
        const s = stateRef.current;
        const message = `Sorting Complete in ${s.stepCount} steps!`;
        setStatus(message);
        if (!isSorted) setStepList((prev) => [...prev, message]);
        if (!s.successPlayed) {
          playSound("success");
          s.successPlayed = true;
        }
        s.sorting = false;
        s.runMode = false;
        s.paused = true;
        setIsPlaying(false);
        setIsSorted(true);
      };

      p.reset = () => {
        const s = stateRef.current;
        s.arr = [...s.originalArr];
        s.i = 0;
        s.j = 0;
        s.stepCount = 0;
        s.sorting = false;
        s.paused = true;
        s.runMode = false;
        s.successPlayed = false;
        s.animation = { inProgress: false, fromIndex: -1, toIndex: -1, progress: 0 };
        setStatus("Ready to sort");
        setStepList([]);
        setIsSorted(false);
        setIsPlaying(false);
        setIsAnimating(false);
      };

      p.step = () => {
        if (isSorted) return;
        if (!stateRef.current.sorting) stateRef.current.sorting = true;
        performStep();
      };

      p.run = () => {
        if (isSorted) return;
        const s = stateRef.current;
        if (!s.sorting) s.sorting = true;
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
          Example 1
        </Typography>
      </Box>

      {/* --- THIS IS THE CORRECTED PART --- */}
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
          <IconButton
            onClick={() => sketchRef.current.step()}
            disabled={isSorted || isPlaying || isAnimating}
            sx={{
              color: colors.text.primary,
              background: colors.iconButton.background,
              border: `1px solid ${colors.iconButton.border}`,
              "&:hover": { background: colors.iconButton.hoverBackground }
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={isPlaying ? "Playing" : "Run"}>
          <IconButton
            onClick={() => sketchRef.current.run()}
            disabled={isSorted || isPlaying || isAnimating}
            sx={{
              background: isPlaying ? colors.success.main : colors.iconButton.background,
              color: colors.text.primary,
              border: `1px solid ${colors.iconButton.border}`
            }}
          >
            <PlayArrowIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Pause">
          <IconButton
            onClick={() => sketchRef.current.pause()}
            disabled={isSorted || !isPlaying}
            sx={{
              color: colors.text.primary,
              background: colors.iconButton.background,
              border: `1px solid ${colors.iconButton.border}`,
              "&:hover": { background: colors.iconButton.hoverBackground }
            }}
          >
            <PauseIcon />
          </IconButton>
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
            text="Comparing"
            textColor={colors.text.primary}
          />
          <LegendItem color={colors.error.main} text="Swapping" textColor={colors.text.primary} />
          <LegendItem color={colors.success.main} text="Sorted" textColor={colors.text.primary} />
          <LegendItem color={colors.info.main} text="Unsorted" textColor={colors.text.primary} />
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

export default BBS_EX1;

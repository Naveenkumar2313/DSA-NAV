import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import p5 from "p5";
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Typography,
  Tooltip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme
} from "@mui/material";
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
const getSimulationColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";

  return {
    primary: isDark ? "#60a5fa" : "#2c3e50",
    background: {
      default: isDark
        ? "linear-gradient(135deg, #222A45 0%, #222A45 100%)"
        : "linear-gradient(135deg, #f0f2f5 0%, #e0e7ff 100%)",
      paper: isDark ? "#000000" : "#ffffff",
      paperRgba: isDark ? "rgba(0, 0, 0, 0.95)" : "rgba(255,255,255,0.95)"
    },
    text: {
      primary: isDark ? "#f1f5f9" : "#2c3e50",
      secondary: isDark ? "#94a3b8" : "#7f8c8d"
    },
    border: isDark ? "#333333" : "#e0e0e0",
    bars: {
      unsorted: isDark ? "#475569" : "#e5e7e9",
      sorted: isDark ? "#4ade80" : "#abebc6",
      comparing: isDark ? "#fbbf24" : "#f9e79f",
      swapping: isDark ? "#f87171" : "#f5b7b1",
      currentMin: isDark ? "#38bdf8" : "#5dade2"
    },
    controls: {
      buttonBg: isDark ? "#0a0a0a" : "#ffffff",
      buttonBorder: isDark ? "#333333" : "#e0e0e0",
      buttonHoverBg: isDark ? "#1a1a1a" : "#f0f2f5",
      playBg: isDark ? "#4ade80" : "#abebc6",
      pauseBg: isDark ? "#fbbf24" : "#f9e79f"
    },
    stepList: {
      bg: isDark
        ? "linear-gradient(145deg, #222A45, #2d3548)"
        : "linear-gradient(145deg, #e2e8f0, #f8fafc)",
      shadow: isDark
        ? "inset 4px 4px 8px #222A45, inset -4px -4px 8px #2d3548"
        : "inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff",
      scrollThumb: isDark ? "#333333" : "#bdc3c7"
    },
    legend: {
      bg: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(255,255,255,0.7)"
    },
    input: {
      background: isDark ? "#000000" : "#ffffff",
      border: isDark ? "#333333" : "#e0e0e0",
      hoverBorder: isDark ? "#2a2a2a" : "#bdbdbd",
      focusBorder: isDark ? "#60a5fa" : "#3b82f6",
      text: isDark ? "#f1f5f9" : "#2c3e50",
      label: isDark ? "#94a3b8" : "#64748b"
    }
  };
};

const getStyles = (colors, isDark) => ({
  container: {
    p: { xs: 2, sm: 3 },
    background: colors.background.default
  },
  canvasWrapper: {
    position: "relative",
    borderRadius: "24px",
    border: `1px solid #e0e0e0`,
    overflow: "hidden",
    boxShadow: isDark ? "0 8px 32px 0 rgba(0, 0, 0, 0.3)" : "0 8px 32px 0 rgba(44, 62, 80, 0.12)",
    background: colors.background.paper,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "450px",
    height: "100%"
  },
  stepListBox: {
    flexGrow: 1,
    overflowY: "auto",
    mt: 1,
    p: 1.5,
    borderRadius: "12px",
    border: `1px solid #e0e0e0`,
    background: colors.stepList.bg,
    boxShadow: colors.stepList.shadow,
    "&::-webkit-scrollbar": { width: "8px" },
    "&::-webkit-scrollbar-thumb": { background: colors.stepList.scrollThumb, borderRadius: "4px" }
  }
});

const SLSLab = ({ showSnackbar }) => {
  const theme = useTheme();
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  const colors = getSimulationColors(theme);
  const styles = getStyles(colors, isDark);
  const colorsRef = useRef(colors);

  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);
  const canvasRef = useRef(null);
  const stepListRef = useRef(null);
  const [arraySize, setArraySize] = useState(10);
  const [manualArrayInputs, setManualArrayInputs] = useState(Array(10).fill(""));
  const [status, setStatus] = useState("Ready to sort");
  const [stepList, setStepList] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mode, setMode] = useState("auto");
  const [history, setHistory] = useState([]);

  const stateRef = useRef({
    arr: [],
    i: 0,
    j: 1,
    minIndex: 0,
    sorting: false,
    successPlayed: false,
    animation: { inProgress: false, fromIndex: -1, toIndex: -1, progress: 0 }
  });

  const p5InstanceRef = useRef(null);
  const audioRefs = useRef({});
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (stepListRef.current) {
      stepListRef.current.scrollTop = stepListRef.current.scrollHeight;
    }
  }, [stepList]);

  const resetState = useCallback((newArr = null) => {
    clearTimeout(timeoutRef.current);
    const arrToUse = newArr || stateRef.current.arr;
    stateRef.current = {
      arr: [...arrToUse],
      i: 0,
      j: 1,
      minIndex: 0,
      sorting: false,
      successPlayed: false,
      animation: { inProgress: false, fromIndex: -1, toIndex: -1, progress: 0 }
    };
    setStatus("Ready to sort");
    setStepList([]);
    setIsPlaying(false);
    setIsAnimating(false);
    setHistory([]);
  }, []);

  const generateRandomArray = useCallback(
    (size) => {
      const newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);
      resetState(newArr);
    },
    [resetState]
  );

  useEffect(() => {
    if (mode === "auto") {
      generateRandomArray(arraySize);
    } else {
      const newEmptyArr = Array(arraySize).fill("");
      resetState(newEmptyArr);
      setManualArrayInputs(newEmptyArr);
    }
  }, [mode, arraySize, generateRandomArray, resetState]);

  useLayoutEffect(() => {
    const sketch = (p) => {
      p.setup = () => {
        const container = canvasRef.current;
        const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
        canvas.parent(container);
        p.textAlign(p.CENTER, p.CENTER);
      };

      p.draw = () => {
        const currentColors = colorsRef.current;
        p.background(currentColors.background.paper);
        drawArray(p, currentColors);

        const s = stateRef.current;
        if (s.animation.inProgress) {
          s.animation.progress += 0.05;
          if (s.animation.progress >= 1) {
            endAnimation();
          }
        }
      };

      p.windowResized = () => {
        const container = canvasRef.current;
        if (container) p.resizeCanvas(container.offsetWidth, container.offsetHeight);
      };

      const drawArray = (p, currentColors) => {
        const { arr, i: outerI, j, minIndex, animation } = stateRef.current;
        if (!arr || arr.length === 0) return;
        const n = arr.length;
        const barWidth = (p.width - 60) / n;
        const startX = p.width / 2 - (n * barWidth) / 2;
        const yPos = p.height - 40;

        for (let k = 0; k < n; k++) {
          const h = p.map(arr[k] || 0, 0, 100, 0, p.height - 100);
          let xPos = startX + k * barWidth;
          let barColor;

          const isSorted = !stateRef.current.sorting && outerI >= n - 1;
          if (isSorted) barColor = p.color(currentColors.bars.sorted);
          else if (animation.inProgress && (k === animation.fromIndex || k === animation.toIndex))
            barColor = p.color(currentColors.bars.swapping);
          else if (k === minIndex) barColor = p.color(currentColors.bars.currentMin);
          else if (k === j) barColor = p.color(currentColors.bars.comparing);
          else if (k < outerI) barColor = p.color(currentColors.bars.sorted);
          else barColor = p.color(currentColors.bars.unsorted);

          if (animation.inProgress) {
            if (k === animation.fromIndex)
              xPos = p.lerp(
                startX + animation.fromIndex * barWidth,
                startX + animation.toIndex * barWidth,
                animation.progress
              );
            else if (k === animation.toIndex)
              xPos = p.lerp(
                startX + animation.toIndex * barWidth,
                startX + animation.fromIndex * barWidth,
                animation.progress
              );
          }

          p.fill(barColor);
          p.stroke(currentColors.primary);
          p.strokeWeight(2);
          p.rect(xPos, yPos - h, barWidth, h);

          p.noStroke();
          p.fill(currentColors.text.primary);
          p.textSize(Math.max(12, barWidth * 0.3));
          p.text(arr[k], xPos + barWidth / 2, yPos - h - 20);
        }
      };
      p5InstanceRef.current = p;
    };

    let p5Instance = new p5(sketch, canvasRef.current);
    audioRefs.current.step = new Audio(stepSoundFile);
    audioRefs.current.success = new Audio(successSoundFile);
    audioRefs.current.fail = new Audio(failSoundFile);
    return () => {
      p5Instance.remove();
    };
  }, []);

  const playSound = (soundType) => {
    const audio = audioRefs.current[soundType];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((e) => console.error("Audio failed:", e));
    }
  };

  const performStep = useCallback(() => {
    const s = stateRef.current;

    if (s.i >= s.arr.length - 1) {
      if (!s.successPlayed) {
        const message = "Sorting Complete!";
        setStatus(message);
        setStepList((prev) => [...prev, message]);
        playSound("success");
        s.successPlayed = true;
        s.sorting = false;
      }
      setIsPlaying(false);
      return true; // Sorting is done
    }

    setHistory((prev) => [...prev, JSON.parse(JSON.stringify(s))]);

    let messageBody = "";

    if (s.j < s.arr.length) {
      messageBody = `Comparing ${s.arr[s.j]} with current minimum ${s.arr[s.minIndex]}.`;
      if (s.arr[s.j] < s.arr[s.minIndex]) {
        s.minIndex = s.j;
        messageBody += ` New minimum found: ${s.arr[s.minIndex]}.`;
      }
      s.j++;
    } else {
      if (s.minIndex !== s.i) {
        messageBody = `Pass ${s.i + 1} complete. Swapping minimum ${s.arr[s.minIndex]} with ${
          s.arr[s.i]
        }.`;
        s.animation = { inProgress: true, fromIndex: s.i, toIndex: s.minIndex, progress: 0 };
        setIsAnimating(true);
      } else {
        messageBody = `Pass ${s.i + 1} complete. ${s.arr[s.i]} is already in correct place.`;
        s.i++;
        s.j = s.i + 1;
        s.minIndex = s.i;
      }
    }

    setStepList((prev) => [...prev, `Step ${prev.length + 1}: ${messageBody}`]);
    setStatus(`Step ${stepList.length + 1}: ${messageBody}`);
    playSound("step");
    return false; // Sorting is not done
  }, [stepList.length]);

  const endAnimation = () => {
    const s = stateRef.current;
    const { fromIndex, toIndex } = s.animation;
    [s.arr[fromIndex], s.arr[toIndex]] = [s.arr[toIndex], s.arr[fromIndex]];
    s.animation.inProgress = false;

    s.i++;
    s.j = s.i + 1;
    s.minIndex = s.i;

    setIsAnimating(false);
  };

  const handleRun = () => {
    if (isPlaying) {
      setIsPlaying(false);
      clearTimeout(timeoutRef.current);
      return;
    }
    if (!stateRef.current.sorting) stateRef.current.sorting = true;
    setIsPlaying(true);

    const runStep = () => {
      if (stateRef.current.animation.inProgress) {
        timeoutRef.current = setTimeout(runStep, 100);
        return;
      }
      const isDone = performStep();
      if (!isDone) {
        timeoutRef.current = setTimeout(runStep, 800);
      } else {
        setIsPlaying(false);
      }
    };
    runStep();
  };

  const handleStep = () => {
    const s = stateRef.current;
    if (s.i >= s.arr.length - 1 && !s.animation.inProgress) {
      showSnackbar("Sorting complete. Please reset.", "warning");
      return;
    }
    if (!s.sorting) s.sorting = true;
    performStep();
  };

  const handlePrevStep = () => {
    clearTimeout(timeoutRef.current);
    setIsPlaying(false);
    setIsAnimating(false);

    if (history.length > 0) {
      const prevState = history.pop();
      setHistory([...history]);
      stateRef.current = prevState;
      setStepList((prev) => prev.slice(0, -1));
      setStatus("Reverted to previous step");
    }
  };

  const handleReset = useCallback(() => {
    if (mode === "auto") {
      generateRandomArray(arraySize);
    } else {
      resetState(Array(arraySize).fill(""));
    }
  }, [mode, arraySize, generateRandomArray, resetState]);

  const handleArraySizeChange = (e) => {
    let size = parseInt(e.target.value) || 0;
    size = Math.max(1, Math.min(20, size));
    setArraySize(size);
  };

  const applyManualArray = () => {
    const arr = manualArrayInputs
      .map(Number)
      .filter(
        (n) => !isNaN(n) && manualArrayInputs[manualArrayInputs.map(Number).indexOf(n)] !== ""
      );
    if (arr.length !== arraySize) {
      showSnackbar(`Please enter exactly ${arraySize} valid numbers.`, "error");
      return;
    }
    resetState(arr);
    showSnackbar("Manual array applied successfully!", "success");
  };

  return (
    <Paper sx={styles.container}>
      <Typography variant="h5" align="center" sx={{ mb: 2, color: colors.text.primary }}>
        Simulator
      </Typography>

      <Paper sx={{ p: 2, mb: 3, bgcolor: colors.background.paper }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel
                sx={{
                  color: colors.input.label,
                  "&.Mui-focused": { color: colors.input.focusBorder }
                }}
              >
                Mode
              </InputLabel>
              <Select
                value={mode}
                label="Mode"
                onChange={(e) => setMode(e.target.value)}
                sx={{
                  color: colors.input.text,
                  bgcolor: colors.input.background,
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.input.border },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.input.hoverBorder
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.input.focusBorder
                  },
                  "& .MuiSvgIcon-root": { color: colors.input.text }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: colors.background.paper,
                      "& .MuiMenuItem-root": { color: colors.text.primary }
                    }
                  }
                }}
              >
                <MenuItem value="auto">Auto Generate</MenuItem>
                <MenuItem value="manual">Manual Input</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Array Size"
              type="number"
              value={arraySize}
              onChange={handleArraySizeChange}
              inputProps={{ min: 1, max: 20 }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: colors.input.text,
                  bgcolor: colors.input.background,
                  "& fieldset": { borderColor: colors.input.border },
                  "&:hover fieldset": { borderColor: colors.input.hoverBorder },
                  "&.Mui-focused fieldset": { borderColor: colors.input.focusBorder }
                },
                "& .MuiInputLabel-root": { color: colors.input.label },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.input.focusBorder }
              }}
            />
          </Grid>
          {mode === "manual" && (
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1, color: colors.text.primary }}>
                Enter array values (1-100):
              </Typography>
              <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 1 }}>
                {manualArrayInputs.map((val, i) => (
                  <TextField
                    key={i}
                    size="small"
                    type="number"
                    value={val}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (
                        inputValue === "" ||
                        (Number(inputValue) >= 1 && Number(inputValue) <= 100)
                      ) {
                        const newInputs = [...manualArrayInputs];
                        newInputs[i] = inputValue;
                        setManualArrayInputs(newInputs);
                      }
                    }}
                    sx={{
                      minWidth: 60,
                      "& .MuiOutlinedInput-root": {
                        color: colors.input.text,
                        bgcolor: colors.input.background,
                        "& fieldset": { borderColor: colors.input.border },
                        "&:hover fieldset": { borderColor: colors.input.hoverBorder },
                        "&.Mui-focused fieldset": { borderColor: colors.input.focusBorder }
                      }
                    }}
                    inputProps={{ min: 1, max: 100 }}
                  />
                ))}
              </Stack>
              <Button
                variant="outlined"
                size="small"
                onClick={applyManualArray}
                sx={{
                  mt: 1,
                  color: colors.primary,
                  borderColor: colors.primary,
                  "&:hover": { borderColor: colors.primary, bgcolor: "rgba(96, 165, 250, 0.1)" }
                }}
              >
                Apply Manual Array & Reset
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>

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
            background: colors.legend.bg,
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          <LegendItem
            color={colors.bars.comparing}
            text="Comparing"
            textColor={colors.text.primary}
          />
          <LegendItem
            color={colors.bars.currentMin}
            text="Current Minimum"
            textColor={colors.text.primary}
          />
          <LegendItem
            color={colors.bars.swapping}
            text="Swapping"
            textColor={colors.text.primary}
          />
          <LegendItem color={colors.bars.sorted} text="Sorted" textColor={colors.text.primary} />
          <LegendItem
            color={colors.bars.unsorted}
            text="Unsorted"
            textColor={colors.text.primary}
          />
        </Stack>
        <Typography variant="body1" sx={{ mt: 2, color: colors.text.primary }}>
          Status: {status}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Box sx={styles.canvasWrapper} ref={canvasRef} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              p: 2,
              minHeight: "450px",
              maxHeight: "450px",
              display: "flex",
              flexDirection: "column",
              bgcolor: colors.background.paper
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ color: colors.text.primary }}>
                Execution Steps
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Reset">
                  <IconButton
                    size="small"
                    onClick={handleReset}
                    sx={{
                      color: colors.text.primary,
                      bgcolor: colors.controls.buttonBg,
                      border: `1px solid ${colors.controls.buttonBorder}`,
                      "&:hover": { bgcolor: colors.controls.buttonHoverBg }
                    }}
                  >
                    <RestartAltIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Previous Step">
                  <IconButton
                    size="small"
                    onClick={handlePrevStep}
                    disabled={isAnimating || isPlaying || history.length === 0}
                    sx={{
                      color: colors.text.primary,
                      bgcolor: colors.controls.buttonBg,
                      border: `1px solid ${colors.controls.buttonBorder}`,
                      "&:hover": { bgcolor: colors.controls.buttonHoverBg }
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Next Step">
                  <IconButton
                    size="small"
                    onClick={handleStep}
                    disabled={isPlaying || isAnimating}
                    sx={{
                      color: colors.text.primary,
                      bgcolor: colors.controls.buttonBg,
                      border: `1px solid ${colors.controls.buttonBorder}`,
                      "&:hover": { bgcolor: colors.controls.buttonHoverBg }
                    }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={isPlaying ? "Pause" : "Run"}>
                  <IconButton
                    size="small"
                    onClick={handleRun}
                    disabled={isAnimating}
                    sx={{
                      color: colors.text.primary,
                      background: isPlaying ? colors.controls.pauseBg : colors.controls.playBg
                    }}
                  >
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
            <Box sx={styles.stepListBox} ref={stepListRef}>
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
          </Paper>
        </Grid>
      </Grid>
    </Paper>
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

export default SLSLab;

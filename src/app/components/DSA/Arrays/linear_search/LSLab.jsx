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
  useTheme,
  alpha
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

// Theme-aware color definitions
const getSimulationColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";

  return {
    // Status colors for array visualization
    notVisited: isDark ? "#374151" : "#e5e7e9",
    visited: isDark ? "#60a5fa" : "#a9cce3",
    current: isDark ? "#fbbf24" : "#f9e79f",
    found: isDark ? "#4ade80" : "#abebc6",
    notFound: isDark ? "#f87171" : "#f5b7b1",

    // UI colors
    primary: isDark ? "#60a5fa" : "#2c3e50",
    secondary: isDark ? "#94a3b8" : "#7f8c8d",
    background: {
      default: isDark ? "#000000" : "#f0f2f5",
      paper: isDark ? "#000000" : "#ffffff",
      gradient: isDark
        ? "linear-gradient(135deg, #222A45 0%, #222A45 100%)"
        : "linear-gradient(135deg, #f0f2f5 0%, #e0e7ff 100%)"
    },
    text: {
      primary: isDark ? "#f1f5f9" : "#2c3e50",
      secondary: isDark ? "#94a3b8" : "#7f8c8d"
    },
    border: isDark ? "#333333" : "#e0e0e0",

    // Step list box
    stepListBox: {
      bg: isDark
        ? "linear-gradient(145deg, #222A45, #2d3548)"
        : "linear-gradient(145deg, #e2e8f0, #f8fafc)",
      shadow: isDark
        ? "inset 4px 4px 8px #222A45, inset -4px -4px 8px #2d3548"
        : "inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff",
      scrollThumb: isDark ? "#1a1a1a" : "#bdc3c7"
    },

    // Canvas
    canvas: {
      bg: isDark ? "#000000" : "#ffffff",
      stroke: isDark ? "#60a5fa" : "#2c3e50"
    },

    // Legend
    legend: {
      bg: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(255,255,255,0.7)"
    },

    // Buttons
    buttons: {
      playBg: isDark ? "#4ade80" : "#abebc6",
      pauseBg: isDark ? "#fbbf24" : "#f9e79f"
    }
  };
};

const getStyles = (colors) => ({
  container: {
    p: { xs: 2, sm: 3 },
    background: colors.background.gradient,
    borderRadius: "20px",
    border: `1px solid #e0e0e0`,
    boxShadow: "0 8px 32px 0 rgba(44, 62, 80, 0.12), 0 1.5px 6px 0 rgba(160,196,255,0.08)"
  },
  canvasWrapper: {
    position: "relative",
    borderRadius: "24px",
    border: `1px solid #e0e0e0`,
    overflow: "hidden",
    boxShadow: "0 8px 32px 0 rgba(44, 62, 80, 0.12)",
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
    background: colors.stepListBox.bg,
    boxShadow: colors.stepListBox.shadow,
    "&::-webkit-scrollbar": { width: "8px" },
    "&::-webkit-scrollbar-thumb": {
      background: colors.stepListBox.scrollThumb,
      borderRadius: "4px"
    }
  }
});

const LSLab = ({ showSnackbar }) => {
  const theme = useTheme();
  const colors = getSimulationColors(theme);
  const styles = getStyles(colors);

  const canvasRef = useRef();
  const colorsRef = useRef(colors);
  const [target, setTarget] = useState(25);
  const [inputValue, setInputValue] = useState(25);
  const [arraySize, setArraySize] = useState(10);
  const [manualArrayInputs, setManualArrayInputs] = useState(Array(10).fill(""));
  const [status, setStatus] = useState("Ready to search");
  const [stepList, setStepList] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState("auto");
  const [history, setHistory] = useState([]);

  // Keep colorsRef in sync with current theme colors
  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  const stateRef = useRef({
    arr: [],
    currentIndex: -1,
    foundIndex: -1,
    searchComplete: false
  });

  const p5InstanceRef = useRef(null);
  const audioRefs = useRef({});
  const timeoutRef = useRef();

  const resetState = useCallback((newArr = null) => {
    const arrToUse = newArr || stateRef.current.arr;
    stateRef.current = {
      arr: [...arrToUse],
      currentIndex: -1,
      foundIndex: -1,
      searchComplete: false
    };
    setStatus("Ready to search");
    setStepList([]);
    setIsPlaying(false);
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
      resetState(Array(arraySize).fill(""));
      setManualArrayInputs(Array(arraySize).fill(""));
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
        p.background(colors.canvas.bg);
        drawArray(p);
      };

      p.windowResized = () => {
        const container = canvasRef.current;
        if (container) p.resizeCanvas(container.offsetWidth, container.offsetHeight);
      };

      const drawArray = (p) => {
        const { arr, currentIndex, foundIndex } = stateRef.current;
        if (!arr || arr.length === 0) return;

        const diameter = Math.min(60, (p.width - 40) / arr.length);
        const radius = diameter / 2;
        const spacing = (p.width - 40) / arr.length;
        const startX = p.width / 2 - ((arr.length - 1) * spacing) / 2;
        const yPos = p.height / 2 + 30;

        for (let i = 0; i < arr.length; i++) {
          const xPos = startX + i * spacing;

          let circleColor = p.color(colors.notVisited);
          if (i < currentIndex) circleColor = p.color(colors.visited);
          if (i === currentIndex) circleColor = p.color(colors.current);
          if (i === foundIndex) circleColor = p.color(colors.found);

          p.stroke(colors.canvas.stroke);
          p.strokeWeight(2);
          p.fill(circleColor);
          p.ellipse(xPos, yPos, diameter, diameter);

          p.noStroke();
          p.fill(colors.text.primary);
          p.textSize(Math.max(12, diameter * 0.3));
          p.text(arr[i], xPos, yPos);

          p.fill(colors.text.secondary);
          p.textSize(12);
          p.text(`[${i}]`, xPos, yPos + radius + 15);

          if (i === currentIndex) {
            p.fill(p.lerpColor(p.color(colors.current), p.color("black"), 0.35));
            p.noStroke();
            p.textSize(14);
            p.text("Current", xPos, yPos - radius - 25);
          }
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
  }, [colors]);

  const playSound = (soundType) => {
    const audio = audioRefs.current[soundType];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((e) => console.error("Audio failed:", e));
    }
  };

  const performStep = useCallback(() => {
    setHistory((prev) => [...prev, JSON.parse(JSON.stringify(stateRef.current))]);

    const nextState = JSON.parse(JSON.stringify(stateRef.current));
    const { arr } = nextState;

    nextState.currentIndex++;

    if (nextState.currentIndex >= arr.length) {
      setStatus(`${target} not found in the array.`);
      setStepList((prev) => [...prev, `Step ${prev.length + 1}: Target not found`]);
      nextState.searchComplete = true;
      playSound("fail");
      setIsPlaying(false);
    } else {
      setStatus(`?? Checking index ${nextState.currentIndex}...`);
      setStepList((prev) => [
        ...prev,
        `Step ${prev.length + 1}: Checking index ${nextState.currentIndex} (value ${
          arr[nextState.currentIndex]
        })`
      ]);
      playSound("step");

      if (arr[nextState.currentIndex] === target) {
        setStatus(`? Found ${target} at index ${nextState.currentIndex}!`);
        setStepList((prev) => [
          ...prev,
          `Step ${prev.length + 1}: ? Found target at index ${nextState.currentIndex}`
        ]);
        nextState.foundIndex = nextState.currentIndex;
        nextState.searchComplete = true;
        playSound("success");
        setIsPlaying(false);
      }
    }

    stateRef.current = nextState;
    return nextState.searchComplete;
  }, [target]);

  const handleRun = () => {
    if (isPlaying) {
      setIsPlaying(false);
      clearTimeout(timeoutRef.current);
      return;
    }

    if (stateRef.current.searchComplete) {
      showSnackbar("Search complete. Please reset.", "warning");
      return;
    }

    setIsPlaying(true);
    const runStep = () => {
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
    if (stateRef.current.searchComplete) {
      showSnackbar("Search complete. Please reset.", "warning");
      return;
    }
    performStep();
  };

  const handlePrevStep = () => {
    clearTimeout(timeoutRef.current);
    setIsPlaying(false);

    if (history.length > 0) {
      const prevState = history[history.length - 1];
      stateRef.current = prevState;
      setHistory((prev) => prev.slice(0, -1));
      setStepList((prev) => prev.slice(0, -1));
      setStatus(
        prevState.foundIndex !== -1
          ? `? Found ${target} at index ${prevState.foundIndex}`
          : "Reverted to previous step"
      );
    }
  };

  const handleReset = useCallback(() => {
    clearTimeout(timeoutRef.current);
    resetState();
  }, [resetState]);

  const handleArraySizeChange = (e) => {
    let size = parseInt(e.target.value) || 0;
    size = Math.max(1, Math.min(20, size));
    setArraySize(size);
    if (mode === "manual") {
      setManualArrayInputs(Array(size).fill(""));
    }
  };

  const applyManualArray = () => {
    const arr = manualArrayInputs.map(Number).filter((n) => !isNaN(n));
    if (arr.length !== arraySize) {
      showSnackbar(`Please enter exactly ${arraySize} numbers.`, "error");
      return;
    }
    resetState(arr);
  };

  return (
    <Paper sx={styles.container}>
      <Typography
        variant="h5"
        align="center"
        sx={{ mb: 2, color: colors.text.primary, fontWeight: 700 }}
      >
        Simulator
      </Typography>

      <Paper sx={{ p: 2, mb: 3, bgcolor: colors.background.paper, borderRadius: "20px" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: colors.text.secondary }}>Mode</InputLabel>
              <Select
                value={mode}
                label="Mode"
                onChange={(e) => setMode(e.target.value)}
                sx={{
                  color: colors.text.primary,
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.border },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: colors.primary }
                }}
              >
                <MenuItem value="auto">Auto Generate</MenuItem>
                <MenuItem value="manual">Manual Input</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
                  color: colors.text.primary,
                  "& fieldset": { borderColor: colors.border },
                  "&:hover fieldset": { borderColor: colors.primary }
                },
                "& .MuiInputLabel-root": { color: colors.text.secondary }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search Target"
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(parseInt(e.target.value) || 0)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: colors.text.primary,
                  "& fieldset": { borderColor: colors.border },
                  "&:hover fieldset": { borderColor: colors.primary }
                },
                "& .MuiInputLabel-root": { color: colors.text.secondary }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                setTarget(inputValue);
                handleReset();
              }}
            >
              Set Target & Reset
            </Button>
          </Grid>
          {mode === "manual" && (
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1, color: colors.text.secondary }}>
                Enter array values (they do not need to be sorted):
              </Typography>
              <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 1 }}>
                {manualArrayInputs.map((val, i) => (
                  <TextField
                    key={i}
                    size="small"
                    type="number"
                    value={val}
                    onChange={(e) => {
                      const newInputs = [...manualArrayInputs];
                      newInputs[i] = e.target.value;
                      setManualArrayInputs(newInputs);
                    }}
                    sx={{
                      minWidth: 60,
                      "& .MuiOutlinedInput-root": {
                        color: colors.text.primary,
                        "& fieldset": { borderColor: colors.border }
                      }
                    }}
                  />
                ))}
              </Stack>
              <Button variant="outlined" size="small" onClick={applyManualArray} sx={{ mt: 1 }}>
                Apply Manual Array
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
          <LegendItem color={colors.current} text="Current" textColor={colors.text.primary} />
          <LegendItem color={colors.visited} text="Visited" textColor={colors.text.primary} />
          <LegendItem color={colors.found} text="Found" textColor={colors.text.primary} />
          <LegendItem
            color={colors.notVisited}
            text="Not Visited"
            textColor={colors.text.primary}
          />
        </Stack>
        <Typography variant="body1" sx={{ mt: 2, color: colors.text.primary, fontWeight: 600 }}>
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
              height: "100%",
              display: "flex",
              flexDirection: "column",
              bgcolor: colors.background.paper,
              borderRadius: "20px"
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ color: colors.text.primary, fontWeight: 700 }}>
                Execution Steps
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Reset">
                  <IconButton
                    size="small"
                    onClick={handleReset}
                    sx={{
                      color: colors.primary,
                      background: colors.background.paper,
                      border: `1px solid #e0e0e0`,
                      "&:hover": { background: alpha(colors.primary, 0.1) }
                    }}
                  >
                    <RestartAltIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Previous Step">
                  <IconButton
                    size="small"
                    onClick={handlePrevStep}
                    sx={{
                      color: colors.primary,
                      background: colors.background.paper,
                      border: `1px solid #e0e0e0`,
                      "&:hover": { background: alpha(colors.primary, 0.1) }
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Next Step">
                  <IconButton
                    size="small"
                    onClick={handleStep}
                    disabled={isPlaying}
                    sx={{
                      color: colors.primary,
                      background: colors.background.paper,
                      border: `1px solid #e0e0e0`,
                      "&:hover": { background: alpha(colors.primary, 0.1) }
                    }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={isPlaying ? "Pause" : "Run"}>
                  <IconButton
                    size="small"
                    onClick={handleRun}
                    sx={{
                      background: isPlaying ? colors.buttons.pauseBg : colors.buttons.playBg,
                      color: colors.text.primary,
                      "&:hover": { opacity: 0.8 }
                    }}
                  >
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
            <Box sx={styles.stepListBox}>
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

export default LSLab;

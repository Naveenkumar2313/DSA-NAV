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

// --- THEME-AWARE COLOR FUNCTION ---
const getSimulationColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  return {
    primary: isDark ? "#90caf9" : "#2c3e50",
    secondary: isDark ? "#64b5f6" : "#a9cce3",
    success: isDark ? "#81c784" : "#abebc6",
    warning: isDark ? "#ffb74d" : "#f9e79f",
    info: isDark ? "#4a5568" : "#e5e7e9",
    error: isDark ? "#e57373" : "#f5b7b1",
    left: isDark ? "#4db6ac" : "#73c6b6",
    right: isDark ? "#ff8a65" : "#e59866",
    matched: isDark ? "#7986cb" : "#b39ddb",
    background: {
      default: isDark ? "#000000" : "#f0f2f5",
      paper: isDark ? "#000000" : "#ffffff",
      canvas: isDark ? "#000000" : "#ffffff",
      container: isDark ? "#000000" : "#f8fafc"
    },
    text: {
      primary: isDark ? "#e2e8f0" : "#2c3e50",
      secondary: isDark ? "#94a3b8" : "#7f8c8d"
    },
    border: isDark ? "#333333" : "#e0e0e0",
    input: {
      background: isDark ? "#000000" : "#ffffff",
      text: isDark ? "#e2e8f0" : "#2c3e50",
      border: isDark ? "#333333" : "#e0e0e0",
      label: isDark ? "#94a3b8" : "#64748b"
    },
    stepListBox: {
      background: isDark ? "#000000" : "#f1f5f9",
      shadow: isDark
        ? "inset 2px 2px 4px #222A45, inset -2px -2px 4px #2d3548"
        : "inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #ffffff"
    }
  };
};

const TPLab = ({ showSnackbar }) => {
  const theme = useTheme();
  const themeMode = theme?.palette?.mode || "light";
  const colors = getSimulationColors(theme);
  const colorsRef = useRef(colors);

  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  const styles = {
    container: {
      p: { xs: 2, sm: 3 },
      bgcolor: colors.background.container,
      borderRadius: "20px",
      border: `1px solid #e0e0e0`,
      minHeight: "100%"
    },
    stepListBox: {
      flexGrow: 1,
      overflowY: "auto",
      mt: 1,
      p: 1.5,
      borderRadius: "12px",
      border: `1px solid #e0e0e0`,
      bgcolor: colors.stepListBox.background,
      boxShadow: colors.stepListBox.shadow,
      "&::-webkit-scrollbar": { width: "8px" },
      "&::-webkit-scrollbar-thumb": { background: colors.text.secondary, borderRadius: "4px" }
    }
  };

  const canvasRef = useRef();
  const [arraySize, setArraySize] = useState(7);
  const [manualArrayInputs, setManualArrayInputs] = useState(Array(7).fill(""));
  const [status, setStatus] = useState("Ready to check palindrome");
  const [stepList, setStepList] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState("auto");
  const [history, setHistory] = useState([]);

  const stateRef = useRef({
    arr: [],
    left: 0,
    right: 0,
    isPalindrome: null,
    checkComplete: false,
    matchedIndices: []
  });

  const p5InstanceRef = useRef(null);
  const audioRefs = useRef({});
  const timeoutRef = useRef();

  const resetState = useCallback(
    (newArr = null) => {
      const arrToUse = newArr || stateRef.current.arr;

      stateRef.current = {
        arr: arrToUse,
        left: 0,
        right: arrToUse.length - 1,
        isPalindrome: null,
        checkComplete: false,
        matchedIndices: []
      };

      setStatus("Ready to check palindrome");
      setStepList([]);
      setIsPlaying(false);
      setHistory([]);
    },
    []
  );

  const generateRandomPalindromeOrNot = useCallback(
    (size) => {
      // 50% chance palindrome, 50% chance random
      const makePalindrome = Math.random() > 0.5;
      let newArr;
      if (makePalindrome) {
        const half = Array.from({ length: Math.ceil(size / 2) }, () =>
          Math.floor(Math.random() * 9) + 1
        );
        newArr = [...half, ...half.slice(0, Math.floor(size / 2)).reverse()];
      } else {
        newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 9) + 1);
      }
      resetState(newArr);
    },
    [resetState]
  );

  useEffect(() => {
    if (mode === "auto") {
      generateRandomPalindromeOrNot(arraySize);
    } else {
      resetState(Array(arraySize).fill(0));
      setManualArrayInputs(Array(arraySize).fill(""));
    }
  }, [mode, arraySize, generateRandomPalindromeOrNot, resetState]);

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
        p.background(currentColors.background.canvas);
        drawArray(p, currentColors);
      };

      p.windowResized = () => {
        const container = canvasRef.current;
        if (container) p.resizeCanvas(container.offsetWidth, container.offsetHeight);
      };

      const drawArray = (p, currentColors) => {
        const { arr, left, right, isPalindrome, checkComplete, matchedIndices } = stateRef.current;
        if (!arr || arr.length === 0) return;

        const diameter = Math.min(70, (p.width - 40) / arr.length);
        const radius = diameter / 2;
        const spacing = (p.width - 40) / arr.length;
        const startX = p.width / 2 - ((arr.length - 1) * spacing) / 2;
        const yPos = p.height / 2 + 30;

        for (let i = 0; i < arr.length; i++) {
          const xPos = startX + i * spacing;

          let circleColor = p.color(currentColors.info);
          if (matchedIndices.includes(i)) circleColor = p.color(currentColors.matched);
          if (checkComplete && isPalindrome === true) circleColor = p.color(currentColors.success);
          if (checkComplete && isPalindrome === false) circleColor = p.color(currentColors.error);
          if (!checkComplete && i === right) circleColor = p.color(currentColors.right);
          if (!checkComplete && i === left) circleColor = p.color(currentColors.left);

          p.stroke(currentColors.primary);
          p.strokeWeight(2);
          p.fill(circleColor);
          p.ellipse(xPos, yPos, diameter, diameter);

          p.noStroke();
          p.fill(currentColors.primary);
          p.textSize(Math.max(12, diameter * 0.3));
          p.text(arr[i], xPos, yPos);

          p.fill(currentColors.text.secondary);
          p.textSize(12);
          p.text(`[${i}]`, xPos, yPos + radius + 15);

          // Draw Pointers
          let pointers = [];
          if (!checkComplete && i === left)
            pointers.push({
              label: "Left",
              color: p.lerpColor(p.color(currentColors.left), p.color("black"), 0.2)
            });
          if (!checkComplete && i === right)
            pointers.push({
              label: "Right",
              color: p.lerpColor(p.color(currentColors.right), p.color("black"), 0.2)
            });

          pointers.forEach((pointer, index) => {
            const yBase = yPos - radius - 25;
            const yOffset = index * 30;

            p.fill(pointer.color);
            p.noStroke();
            p.textSize(14);
            p.text(pointer.label, xPos, yBase - yOffset - 15);

            p.stroke(pointer.color);
            p.strokeWeight(2);
            p.line(xPos, yBase - yOffset - 5, xPos, yBase - yOffset);
            p.triangle(
              xPos - 5,
              yBase - yOffset - 5,
              xPos + 5,
              yBase - yOffset - 5,
              xPos,
              yBase - yOffset
            );
          });
        }

        // Draw connecting arc between left and right pointers
        if (!checkComplete && left < right) {
          const leftX = startX + left * spacing;
          const rightX = startX + right * spacing;
          const arcY = yPos + radius + 40;
          const arcHeight = 30;

          p.noFill();
          p.stroke(currentColors.warning);
          p.strokeWeight(2);
          p.bezier(
            leftX, arcY,
            leftX, arcY + arcHeight,
            rightX, arcY + arcHeight,
            rightX, arcY
          );

          p.noStroke();
          p.fill(currentColors.warning);
          p.textSize(12);
          p.text("Compare", (leftX + rightX) / 2, arcY + arcHeight + 5);
        }
      };
      p5InstanceRef.current = p;
    };

    let p5Instance = new p5(sketch, canvasRef.current);
    p5InstanceRef.current = p5Instance;

    audioRefs.current.step = new Audio(stepSoundFile);
    audioRefs.current.success = new Audio(successSoundFile);
    audioRefs.current.fail = new Audio(failSoundFile);

    return () => {
      p5Instance.remove();
    };
  }, [themeMode]);

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
    const { arr, left, right, matchedIndices } = nextState;

    if (left < right && !nextState.checkComplete) {
      if (arr[left] === arr[right]) {
        setStatus(`arr[${left}] (${arr[left]}) == arr[${right}] (${arr[right]}) ✓ Match!`);
        setStepList((prev) => [
          ...prev,
          `Step ${prev.length + 1}: arr[${left}]=${arr[left]} == arr[${right}]=${arr[right]} ✓`
        ]);
        nextState.matchedIndices = [...matchedIndices, left, right];
        nextState.left = left + 1;
        nextState.right = right - 1;
        playSound("step");

        // Check if pointers crossed after move
        if (nextState.left >= nextState.right) {
          if (nextState.left === nextState.right) {
            nextState.matchedIndices = [...nextState.matchedIndices, nextState.left];
          }
          setStatus("Array is a palindrome! ✓");
          setStepList((prev) => [
            ...prev,
            `Step ${prev.length + 1}: All elements matched — Palindrome ✓`
          ]);
          nextState.isPalindrome = true;
          nextState.checkComplete = true;
          setIsPlaying(false);
          playSound("success");
        }
      } else {
        setStatus(`arr[${left}] (${arr[left]}) != arr[${right}] (${arr[right]}) ✗ Not a palindrome!`);
        setStepList((prev) => [
          ...prev,
          `Step ${prev.length + 1}: arr[${left}]=${arr[left]} != arr[${right}]=${arr[right]} ✗`
        ]);
        nextState.isPalindrome = false;
        nextState.checkComplete = true;
        setIsPlaying(false);
        playSound("fail");
      }
    } else if (!nextState.checkComplete) {
      setStatus("Array is a palindrome! ✓");
      setStepList((prev) => [
        ...prev,
        `Step ${prev.length + 1}: All elements matched — Palindrome ✓`
      ]);
      nextState.isPalindrome = true;
      nextState.checkComplete = true;
      setIsPlaying(false);
      playSound("success");
    }

    stateRef.current = nextState;
    return nextState.checkComplete;
  }, []);

  const handleRun = () => {
    if (isPlaying) {
      setIsPlaying(false);
      clearTimeout(timeoutRef.current);
      return;
    }

    if (stateRef.current.checkComplete) {
      if (showSnackbar) showSnackbar("Check complete. Please reset.", "warning");
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
    if (stateRef.current.checkComplete) {
      if (showSnackbar) showSnackbar("Check complete. Please reset.", "warning");
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
      setStatus("Reverted to previous step");
    }
  };

  const handleReset = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (mode === "auto") {
      generateRandomPalindromeOrNot(arraySize);
    } else {
      resetState();
    }
  }, [mode, arraySize, generateRandomPalindromeOrNot, resetState]);

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
      if (showSnackbar) showSnackbar(`Please enter exactly ${arraySize} numbers.`, "error");
      return;
    }
    resetState(arr);
  };

  return (
    <Paper
      key={`tplab-${themeMode}`}
      elevation={0}
      sx={{
        ...styles.container,
        bgcolor: colors.background.container
      }}
    >
      <Typography variant="h5" align="center" sx={{ mb: 2, color: colors.text.primary }}>
        Simulator
      </Typography>

      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, bgcolor: colors.background.paper, border: `1px solid #e0e0e0` }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl
              fullWidth
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: colors.input.text,
                  bgcolor: colors.input.background,
                  "& fieldset": { borderColor: colors.input.border },
                  "&:hover fieldset": { borderColor: colors.primary }
                },
                "& .MuiInputLabel-root": { color: colors.input.label },
                "& .MuiSelect-icon": { color: colors.input.text }
              }}
            >
              <InputLabel>Mode</InputLabel>
              <Select
                value={mode}
                label="Mode"
                onChange={(e) => setMode(e.target.value)}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: colors.background.paper,
                      "& .MuiMenuItem-root": {
                        color: colors.text.primary,
                        "&:hover": { bgcolor: colors.input.background },
                        "&.Mui-selected": { bgcolor: colors.input.background }
                      }
                    }
                  }
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
                  color: colors.input.text,
                  bgcolor: colors.input.background,
                  "& fieldset": { borderColor: colors.input.border },
                  "&:hover fieldset": { borderColor: colors.primary }
                },
                "& .MuiInputLabel-root": { color: colors.input.label }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleReset}
            >
              Generate & Reset
            </Button>
          </Grid>
          {mode === "manual" && (
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1, color: colors.text.secondary }}>
                Enter array values:
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
                        color: colors.input.text,
                        bgcolor: colors.input.background,
                        "& fieldset": { borderColor: colors.input.border }
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
            bgcolor: colors.background.paper,
            border: `1px solid #e0e0e0`,
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          <LegendItem color={colors.left} text="Left" textColor={colors.text.primary} />
          <LegendItem color={colors.right} text="Right" textColor={colors.text.primary} />
          <LegendItem color={colors.matched} text="Matched" textColor={colors.text.primary} />
          <LegendItem color={colors.success} text="Palindrome" textColor={colors.text.primary} />
          <LegendItem color={colors.error} text="Not Palindrome" textColor={colors.text.primary} />
        </Stack>
        <Typography variant="body1" sx={{ mt: 2, color: colors.text.primary }}>
          Status: {status}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Box
            key={`canvas-${themeMode}`}
            sx={{
              position: "relative",
              borderRadius: "24px",
              border: `1px solid #e0e0e0`,
              overflow: "hidden",
              boxShadow:
                themeMode === "dark"
                  ? "0 8px 32px 0 rgba(0, 0, 0, 0.3)"
                  : "0 8px 32px 0 rgba(44, 62, 80, 0.12)",
              bgcolor: colors.background.paper,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "450px",
              height: "100%"
            }}
            ref={canvasRef}
          />
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              bgcolor: colors.background.paper,
              border: `1px solid #e0e0e0`
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
                      bgcolor: colors.background.paper,
                      border: `1px solid #e0e0e0`,
                      "&:hover": { bgcolor: colors.background.default }
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
                      color: colors.text.primary,
                      bgcolor: colors.background.paper,
                      border: `1px solid #e0e0e0`,
                      "&:hover": { bgcolor: colors.background.default }
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
                      color: colors.text.primary,
                      bgcolor: colors.background.paper,
                      border: `1px solid #e0e0e0`,
                      "&:hover": { bgcolor: colors.background.default }
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
                      bgcolor: isPlaying ? colors.warning : colors.success,
                      "&:hover": { bgcolor: isPlaying ? colors.warning : colors.success }
                    }}
                  >
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
            <Box
              sx={{
                ...styles.stepListBox,
                bgcolor: colors.stepListBox.background
              }}
            >
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

export default TPLab;

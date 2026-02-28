import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
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
const getExampleColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";

  return {
    notVisited: isDark ? "#1a1a1a" : "#e5e7e9",
    visited: isDark ? "#60a5fa" : "#a9cce3",
    current: isDark ? "#fbbf24" : "#f9e79f",
    found: isDark ? "#4ade80" : "#abebc6",
    notFound: isDark ? "#f87171" : "#f5b7b1",
    primary: isDark ? "#60a5fa" : "#2c3e50",
    secondary: isDark ? "#94a3b8" : "#7f8c8d",
    surface: isDark ? "#000000" : "#ffffff",
    background: {
      paper: isDark ? "#000000" : "#ffffff",
      gradient: isDark
        ? "linear-gradient(135deg, #000000 0%, #0a0a0a 100%)"
        : "linear-gradient(135deg, #f0f2f5 0%, #e0e7ff 100%)"
    },
    text: {
      primary: isDark ? "#f1f5f9" : "#2c3e50",
      secondary: isDark ? "#94a3b8" : "#7f8c8d"
    },
    border: isDark ? "#333333" : "#e0e0e0",
    stepListBox: {
      bg: isDark
        ? "linear-gradient(145deg, #000000, #0a0a0a)"
        : "linear-gradient(145deg, #e2e8f0, #f8fafc)",
      shadow: isDark
        ? "inset 4px 4px 8px #000000, inset -4px -4px 8px #1a1a1a"
        : "inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff",
      scrollThumb: isDark ? "#1a1a1a" : "#bdc3c7"
    },
    canvas: {
      bg: isDark ? "#000000" : "#ffffff",
      stroke: isDark ? "#60a5fa" : "#2c3e50"
    },
    legend: {
      bg: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(255,255,255,0.7)"
    },
    buttons: {
      playBg: isDark ? "#4ade80" : "#abebc6",
      bg: isDark ? "#000000" : "#ffffff",
      hoverBg: isDark ? "#0a0a0a" : "#f0f2f5"
    }
  };
};

const getStyles = (colors, isDark) => ({
  container: {
    p: { xs: 2, sm: 4 },
    background: colors.background.gradient,
    borderRadius: "20px",
    border: `1px solid #e0e0e0`
  },
  canvasWrapper: {
    position: "relative",
    borderRadius: "24px",
    border: `1px solid #e0e0e0`,
    overflow: "hidden",
    boxShadow: isDark ? "0 8px 32px 0 rgba(0, 0, 0, 0.4)" : "0 8px 32px 0 rgba(44, 62, 80, 0.12)",
    background: isDark ? "#000000" : "#ffffff",
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
    height: "250px",
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

const LS_EX1 = () => {
  const theme = useTheme();
  const colors = getExampleColors(theme);
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  const styles = getStyles(colors, isDark);

  const sketchRef = useRef();
  const colorsRef = useRef(colors);
  const [target, setTarget] = useState(25);
  const [inputValue, setInputValue] = useState(25);
  const [status, setStatus] = useState("Ready to search");
  const [stepList, setStepList] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRefs = useRef({});
  const stepListRef = useRef(null);

  // Keep colorsRef in sync with current theme colors
  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  const stateRef = useRef({
    arr: [1, 5, 8, 12, 15, 22, 25, 30, 35, 40],
    currentIndex: -1,
    foundIndex: -1,
    searchComplete: false,
    history: []
  });

  useEffect(() => {
    if (stepListRef.current) {
      stepListRef.current.scrollTop = stepListRef.current.scrollHeight;
    }
  }, [stepList]);

  useLayoutEffect(() => {
    let pInstance = null;
    let running = false;
    let paused = true;
    let stepNumber = 1;

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
      p.setup = () => {
        const container = sketchRef.current;
        const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
        canvas.parent(container);
        p.textAlign(p.CENTER, p.CENTER);
        preloadAudio();
        p.reset();
      };

      p.draw = () => {
        p.background(colorsRef.current.canvas.bg);
        drawArray(p);
        if (running && !paused && !stateRef.current.searchComplete && p.frameCount % 45 === 0) {
          performStep();
        }
      };

      const drawArray = (p) => {
        const { arr, currentIndex, foundIndex } = stateRef.current;
        const c = colorsRef.current;
        const diameter = Math.min(60, (p.width - 40) / arr.length);
        const radius = diameter / 2;
        const spacing = (p.width - 40) / arr.length;
        const startX = p.width / 2 - ((arr.length - 1) * spacing) / 2;
        const yPos = p.height / 2 + 30;

        for (let i = 0; i < arr.length; i++) {
          const xPos = startX + i * spacing;

          let circleColor = p.color(c.notVisited);
          if (i < currentIndex) circleColor = p.color(c.visited);
          if (i === currentIndex) circleColor = p.color(c.current);
          if (i === foundIndex) circleColor = p.color(c.found);

          p.stroke(c.canvas.stroke);
          p.strokeWeight(2);
          p.fill(circleColor);
          p.ellipse(xPos, yPos, diameter, diameter);

          p.noStroke();
          p.fill(c.text.primary);
          p.textSize(Math.max(12, diameter * 0.3));
          p.text(arr[i], xPos, yPos);

          p.fill(c.text.secondary);
          p.textSize(12);
          p.text(`[${i}]`, xPos, yPos + radius + 15);

          if (i === currentIndex) {
            p.fill(p.lerpColor(p.color(c.current), p.color("black"), 0.35));
            p.noStroke();
            p.textSize(14);
            p.text("Current", xPos, yPos - radius - 25);
          }
        }
      };

      const performStep = () => {
        stateRef.current.history.push(JSON.parse(JSON.stringify(stateRef.current)));
        let { arr, currentIndex } = stateRef.current;

        currentIndex++;
        stateRef.current.currentIndex = currentIndex;

        if (currentIndex >= arr.length) {
          setStatus(`${target} not found in the array.`);
          setStepList((prev) => [...prev, `Step ${stepNumber++}: Target not found`]);
          stateRef.current.searchComplete = true;
          running = false;
          paused = true;
          setIsPlaying(false);
          playSound("fail");
          return;
        }

        setStatus(`Checking index ${currentIndex}...`);
        setStepList((prev) => [
          ...prev,
          `Step ${stepNumber++}: Checking index ${currentIndex} (value ${arr[currentIndex]})`
        ]);
        playSound("step");

        if (arr[currentIndex] === target) {
          setStatus(`Found ${target} at index ${currentIndex}!`);
          setStepList((prev) => [
            ...prev,
            `Step ${stepNumber++}: Found target at index ${currentIndex}`
          ]);
          stateRef.current.foundIndex = currentIndex;
          stateRef.current.searchComplete = true;
          running = false;
          paused = true;
          setIsPlaying(false);
          playSound("success");
        }
      };

      p.reset = () => {
        stateRef.current = {
          arr: [1, 5, 8, 12, 15, 22, 25, 30, 35, 40],
          currentIndex: -1,
          foundIndex: -1,
          searchComplete: false,
          history: []
        };
        stepNumber = 1;
        setStatus("Ready to search");
        setStepList([]);
        setIsPlaying(false);
        running = false;
        paused = true;
      };

      p.step = () => {
        if (stateRef.current.searchComplete) return;
        paused = true;
        running = false;
        setIsPlaying(false);
        performStep();
      };

      p.run = () => {
        if (stateRef.current.searchComplete) return;
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
        if (stateRef.current.history.length > 0) {
          const prevState = stateRef.current.history.pop();
          stateRef.current = prevState;
          setStepList((prev) => prev.slice(0, -1));
          stepNumber--;
          setStatus(stepNumber > 1 ? `Reverted to Step ${stepNumber - 1}` : "Ready to search");
          setIsPlaying(false);
          paused = true;
          running = false;
        }
      };

      pInstance = p;
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
  }, [target]);

  const handleReset = () => {
    if (sketchRef.current.reset) {
      sketchRef.current.reset();
    }
  };

  const handleSetTarget = () => {
    const newTarget = parseInt(inputValue);
    if (!isNaN(newTarget)) {
      setTarget(newTarget);
      if (sketchRef.current.reset) {
        sketchRef.current.reset();
      }
    }
  };

  return (
    <Box sx={styles.container}>
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom sx={{ color: colors.text.primary }}>
          Find Target "{target}"
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        sx={{ mb: 2, alignItems: "center" }}
      >
        <TextField
          label="Target Value"
          type="number"
          variant="outlined"
          size="small"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSetTarget()}
          sx={{
            width: "140px",
            "& .MuiOutlinedInput-root": {
              color: colors.text.primary,
              "& fieldset": { borderColor: colors.canvas.stroke },
              "&:hover fieldset": { borderColor: colors.primary },
              "&.Mui-focused fieldset": { borderColor: colors.primary }
            },
            "& .MuiInputLabel-root": { color: colors.text.secondary }
          }}
        />
        <Button
          variant="contained"
          onClick={handleSetTarget}
          sx={{
            backgroundColor: colors.primary,
            "&:hover": { backgroundColor: alpha(colors.primary, 0.8) }
          }}
        >
          Set & Reset
        </Button>
      </Stack>

      <Box sx={{ p: 1, mb: 2, display: "flex", justifyContent: "center", gap: 1.5 }}>
        <Tooltip title="Reset">
          <IconButton onClick={handleReset} sx={{ color: colors.text.primary }}>
            <RestartAltIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Previous Step">
          <IconButton
            onClick={() => sketchRef.current.prevStep()}
            sx={{ color: colors.text.primary }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Next Step">
          <IconButton onClick={() => sketchRef.current.step()} sx={{ color: colors.text.primary }}>
            <ArrowForwardIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={isPlaying ? "Playing" : "Run"}>
          <IconButton
            onClick={() => sketchRef.current.run()}
            sx={{
              color: isPlaying ? "#fff" : colors.text.primary,
              background: isPlaying ? colors.found : alpha(colors.text.primary, 0.1),
              "&:hover": {
                background: isPlaying ? alpha(colors.found, 0.8) : alpha(colors.text.primary, 0.2)
              }
            }}
          >
            <PlayArrowIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Pause">
          <IconButton onClick={() => sketchRef.current.pause()} sx={{ color: colors.text.primary }}>
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
            background: alpha(colors.surface, 0.7),
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
              backgroundColor: colors.surface,
              color: colors.text.primary
            }}
          >
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
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
                      color: colors.text.secondary
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

export default LS_EX1;

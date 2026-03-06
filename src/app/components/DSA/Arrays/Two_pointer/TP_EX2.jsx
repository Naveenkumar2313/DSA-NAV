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
const getExampleColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  return {
    primary: isDark ? "#90caf9" : "#2c3e50",
    secondary: isDark ? "#64b5f6" : "#a9cce3",
    success: isDark ? "#81c784" : "#abebc6",
    warning: isDark ? "#ffb74d" : "#f9e79f",
    info: isDark ? "#1a1a1a" : "#e5e7e9",
    error: isDark ? "#e57373" : "#f5b7b1",
    left: isDark ? "#4db6ac" : "#73c6b6",
    right: isDark ? "#ff8a65" : "#e59866",
    matched: isDark ? "#7986cb" : "#b39ddb",
    background: {
      default: isDark ? "#121212" : "#f0f2f5",
      paper: isDark ? "#1e1e1e" : "#ffffff",
      canvas: isDark ? "#1e1e1e" : "#ffffff",
      container: isDark ? "#000000" : "#f8fafc"
    },
    text: {
      primary: isDark ? "#ffffff" : "#2c3e50",
      secondary: isDark ? "#b0bec5" : "#7f8c8d"
    },
    border: isDark ? "#333333" : "#e0e0e0",
    stepListBox: {
      background: isDark ? "#171717" : "#f1f5f9",
      shadow: isDark
        ? "inset 2px 2px 4px #000000, inset -2px -2px 4px #1a1a1a"
        : "inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #ffffff"
    }
  };
};

const TP_EX2 = () => {
  const theme = useTheme();
  const themeMode =
    theme?.palette?.mode === "dark" || theme?.palette?.type === "dark" ? "dark" : "light";
  const colors = getExampleColors(theme);
  const colorsRef = useRef(colors);

  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  const sketchRef = useRef();
  const [status, setStatus] = useState("Ready to check palindrome");
  const [stepList, setStepList] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRefs = useRef({});
  const stepListRef = useRef(null);

  const stateRef = useRef({
    arr: [1, 3, 5, 4, 7, 3, 1],
    left: 0,
    right: 6,
    isPalindrome: null,
    checkComplete: false,
    matchedIndices: [],
    history: []
  });

  useEffect(() => {
    if (stepListRef.current) {
      stepListRef.current.scrollTop = stepListRef.current.scrollHeight;
    }
  }, [stepList]);

  useLayoutEffect(() => {
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
        const currentColors = colorsRef.current;
        p.background(currentColors.background.canvas);
        drawArray(p, currentColors);
        if (running && !paused && !stateRef.current.checkComplete && p.frameCount % 45 === 0) {
          performStep();
        }
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
          p.textSize(Math.max(14, diameter * 0.35));
          p.text(arr[i], xPos, yPos);

          p.fill(currentColors.text.secondary);
          p.textSize(12);
          p.text(`[${i}]`, xPos, yPos + radius + 15);

          // Draw pointers
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

          // Compare label
          p.noStroke();
          p.fill(currentColors.warning);
          p.textSize(12);
          p.text("Compare", (leftX + rightX) / 2, arcY + arcHeight + 5);
        }
      };

      const performStep = () => {
        stateRef.current.history.push(JSON.parse(JSON.stringify(stateRef.current)));
        let { arr, left, right, matchedIndices } = stateRef.current;

        if (left < right) {
          if (arr[left] === arr[right]) {
            setStatus(`arr[${left}] (${arr[left]}) == arr[${right}] (${arr[right]}) ✓ Match!`);
            setStepList((prev) => [
              ...prev,
              `Step ${stepNumber++}: arr[${left}]=${arr[left]} == arr[${right}]=${arr[right]} ✓`
            ]);
            stateRef.current.matchedIndices = [...matchedIndices, left, right];
            stateRef.current.left = left + 1;
            stateRef.current.right = right - 1;
            playSound("step");
          } else {
            setStatus(`arr[${left}] (${arr[left]}) != arr[${right}] (${arr[right]}) ✗ Not a palindrome!`);
            setStepList((prev) => [
              ...prev,
              `Step ${stepNumber++}: arr[${left}]=${arr[left]} != arr[${right}]=${arr[right]} ✗`
            ]);
            stateRef.current.isPalindrome = false;
            stateRef.current.checkComplete = true;
            running = false;
            paused = true;
            setIsPlaying(false);
            playSound("fail");
          }

          // Check if pointers have crossed after move
          if (stateRef.current.left >= stateRef.current.right && !stateRef.current.checkComplete) {
            if (stateRef.current.left === stateRef.current.right) {
              stateRef.current.matchedIndices = [...stateRef.current.matchedIndices, stateRef.current.left];
            }
            setStatus("Array is a palindrome! ✓");
            setStepList((prev) => [
              ...prev,
              `Step ${stepNumber++}: All elements matched — Palindrome ✓`
            ]);
            stateRef.current.isPalindrome = true;
            stateRef.current.checkComplete = true;
            running = false;
            paused = true;
            setIsPlaying(false);
            playSound("success");
          }
        } else {
          setStatus("Array is a palindrome! ✓");
          setStepList((prev) => [
            ...prev,
            `Step ${stepNumber++}: All elements matched — Palindrome ✓`
          ]);
          stateRef.current.isPalindrome = true;
          stateRef.current.checkComplete = true;
          running = false;
          paused = true;
          setIsPlaying(false);
          playSound("success");
        }
      };

      p.reset = () => {
        stateRef.current = {
          arr: [1, 3, 5, 4, 7, 3, 1],
          left: 0,
          right: 6,
          isPalindrome: null,
          checkComplete: false,
          matchedIndices: [],
          history: []
        };
        stepNumber = 1;
        setStatus("Ready to check palindrome");
        setStepList([]);
        setIsPlaying(false);
        running = false;
        paused = true;
      };

      p.step = () => {
        if (stateRef.current.checkComplete) return;
        paused = true;
        running = false;
        setIsPlaying(false);
        performStep();
      };

      p.run = () => {
        if (stateRef.current.checkComplete) return;
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
          setStatus("Reverted to previous step");
          setIsPlaying(false);
          paused = true;
          running = false;
        }
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
  }, [themeMode]);

  const handleReset = () => {
    if (sketchRef.current.reset) {
      sketchRef.current.reset();
    }
  };

  return (
    <Box
      key={`tp-ex2-${themeMode}`}
      sx={{
        p: { xs: 2, sm: 4 },
        bgcolor: colors.background.container,
        borderRadius: "20px",
        border: `1px solid ${colors.border}`,
        minHeight: "100%"
      }}
    >
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom sx={{ color: colors.text.primary }}>
          Example 2: Non-Palindrome Array [1, 3, 5, 4, 7, 3, 1]
        </Typography>
      </Box>

      <Box sx={{ p: 1, mb: 2, display: "flex", justifyContent: "center", gap: 1.5 }}>
        <Tooltip title="Reset">
          <IconButton
            onClick={handleReset}
            sx={{
              color: colors.text.primary,
              bgcolor: colors.background.paper,
              border: `1px solid ${colors.border}`,
              "&:hover": { bgcolor: colors.background.default }
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
              bgcolor: colors.background.paper,
              border: `1px solid ${colors.border}`,
              "&:hover": { bgcolor: colors.background.default }
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
              bgcolor: colors.background.paper,
              border: `1px solid ${colors.border}`,
              "&:hover": { bgcolor: colors.background.default }
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={isPlaying ? "Playing" : "Run"}>
          <IconButton
            onClick={() => sketchRef.current.run()}
            sx={{
              bgcolor: isPlaying ? colors.success : colors.background.paper,
              border: `1px solid ${colors.border}`,
              "&:hover": { bgcolor: colors.success }
            }}
          >
            <PlayArrowIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Pause">
          <IconButton
            onClick={() => sketchRef.current.pause()}
            sx={{
              color: colors.text.primary,
              bgcolor: colors.background.paper,
              border: `1px solid ${colors.border}`,
              "&:hover": { bgcolor: colors.background.default }
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
            bgcolor: colors.background.paper,
            border: `1px solid ${colors.border}`,
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          <LegendItem color={colors.left} text="Left Pointer" textColor={colors.text.primary} />
          <LegendItem color={colors.right} text="Right Pointer" textColor={colors.text.primary} />
          <LegendItem color={colors.matched} text="Matched" textColor={colors.text.primary} />
          <LegendItem color={colors.success} text="Palindrome" textColor={colors.text.primary} />
          <LegendItem color={colors.error} text="Not Palindrome" textColor={colors.text.primary} />
        </Stack>
        <Typography variant="body1" sx={{ mt: 2, color: colors.text.primary }}>
          Status: {status}
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, md: 4 }} justifyContent="center" alignItems="stretch">
        <Grid item xs={12} md={8}>
          <Box
            key={`canvas-${themeMode}`}
            sx={{
              position: "relative",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow:
                themeMode === "dark"
                  ? "0 8px 32px 0 rgba(0, 0, 0, 0.3)"
                  : "0 8px 32px 0 rgba(44, 62, 80, 0.12)",
              bgcolor: colors.background.paper,
              border: `1px solid ${colors.border}`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Box sx={{ width: "100%", maxWidth: 800, aspectRatio: "16 / 9" }}>
              <div ref={sketchRef} style={{ width: "100%", height: "100%" }} />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, md: 2 },
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mx: "auto",
              bgcolor: colors.background.paper,
              border: `1px solid ${colors.border}`
            }}
          >
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ color: colors.text.primary }}>
                  Execution Steps
                </Typography>
              </Stack>
              <Box
                ref={stepListRef}
                sx={{
                  height: "250px",
                  overflowY: "auto",
                  mt: 1,
                  p: 1.5,
                  borderRadius: "12px",
                  border: `1px solid ${colors.border}`,
                  bgcolor: colors.stepListBox.background,
                  boxShadow: colors.stepListBox.shadow,
                  "&::-webkit-scrollbar": { width: "8px" },
                  "&::-webkit-scrollbar-thumb": {
                    background: colors.text.secondary,
                    borderRadius: "4px"
                  }
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

export default TP_EX2;

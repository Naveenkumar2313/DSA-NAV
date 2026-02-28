import React, { useState, useEffect, useRef } from "react";

// --- Material UI Imports ---
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  keyframes,
  useTheme
} from "@mui/material";

// --- Material UI Icons ---
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// --- Sound Imports ---
const enqueueSoundFile = "/DSA/step.mp3";
const dequeueSoundFile = "/DSA/success.mp3";
const failSoundFile = "/DSA/fail.mp3";

// --- THEME-AWARE COLOR FUNCTION (consistent with Bubble Sort) ---
const getSimulationColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";

  return {
    primary: {
      main: isDark ? "#60a5fa" : "#2c3e50",
      light: isDark ? "#93c5fd" : "#3b82f6",
      contrastText: isDark ? "#000000" : "#ffffff"
    },
    secondary: {
      main: isDark ? "#a78bfa" : "#673ab7",
      light: isDark ? "#c4b5fd" : "#9575cd"
    },
    info: {
      main: isDark ? "#4b5563" : "#e5e7e9"
    },
    success: {
      main: isDark ? "#34d399" : "#4CAF50"
    },
    warning: {
      main: isDark ? "#fbbf24" : "#FFC107"
    },
    error: {
      main: isDark ? "#f87171" : "#d32f2f"
    },
    background: {
      default: isDark ? "#222A45" : "#f8fafc",
      paper: isDark ? "#222A45" : "#ffffff",
      container: isDark ? "#1a1a1a33" : "#bdbdbd"
    },
    text: {
      primary: isDark ? "#f1f5f9" : "#2c3e50",
      secondary: isDark ? "#94a3b8" : "#546e7a"
    },
    stepListBox: {
      background: isDark ? "linear-gradient(145deg, #222A45, #2d3548)" : "#fafafa",
      border: isDark ? "#1a1a1a" : "#eee"
    },
    iconButton: {
      background: isDark ? "#0a0a0a" : "#ffffff",
      border: isDark ? "#1a1a1a" : "#e0e0e0",
      hoverBackground: isDark ? "#1a1a1a" : "#f0f2f5"
    },
    paper: {
      boxShadow: isDark ? "0px 5px 15px rgba(0, 0, 0, 0.3)" : "0px 5px 15px rgba(0, 0, 0, 0.08)"
    },
    element: {
      slot: isDark
        ? `radial-gradient(circle at 30% 30%, #2d3548, #2d3548)`
        : `radial-gradient(circle at 30% 30%, #ffffff, #e5e7eb)`,
      slotBorder: isDark ? "#2a2a2a" : "#9ca3af"
    }
  };
};

// --- Constants & Keyframes for Queue Visualization ---
const ELEMENT_WIDTH = 60;
const ELEMENT_MARGIN = 10;
const TOTAL_ELEMENT_SPACE = ELEMENT_WIDTH + ELEMENT_MARGIN;
const MAX_QUEUE_SIZE = 8;
const ELEMENT_HEIGHT = 60;
const CONTAINER_HEIGHT = 80;
const queueContainerWidth = MAX_QUEUE_SIZE * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN;

const enqueueAnimation = (queueSize) => keyframes`
  from { left: ${queueContainerWidth}px; opacity: 0; }
  to { left: ${queueSize * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN / 2}px; opacity: 1; }
`;

const dequeueAnimation = keyframes`
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(-80px); }
`;

const QOP = ({ showSnackbar }) => {
  const theme = useTheme();
  const colors = getSimulationColors(theme);
  const themeMode = theme?.palette?.mode || "light";

  const [queue, setQueue] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [stepList, setStepList] = useState([]);
  const [animatingElement, setAnimatingElement] = useState(null);
  const [isDequeuing, setIsDequeuing] = useState(false);
  const logInputRef = useRef(null);

  useEffect(() => {
    if (logInputRef.current) {
      logInputRef.current.scrollTop = logInputRef.current.scrollHeight;
    }
  }, [stepList]);

  const playSound = (type) => {
    const audio =
      type === "enqueue"
        ? new Audio(enqueueSoundFile)
        : type === "dequeue"
        ? new Audio(dequeueSoundFile)
        : new Audio(failSoundFile);
    audio.play().catch((e) => console.error("Audio play failed", e));
  };

  const handleAnimationEnd = () => {
    if (animatingElement?.type === "enqueue") {
      setQueue((prev) => [...prev, animatingElement.value]);
      setStepList((prev) => [...prev, `Enqueued "${animatingElement.value}"`]);
    }
    setAnimatingElement(null);
  };

  const handleEnqueue = () => {
    if (animatingElement || isDequeuing) return;
    if (inputValue.trim() === "") {
      showSnackbar("Please enter a value to enqueue.", "warning");
      return;
    }
    if (queue.length >= MAX_QUEUE_SIZE) {
      playSound("fail");
      showSnackbar("Queue Overflow: Maximum size reached!", "error");
      return;
    }
    const value = inputValue.trim();
    setInputValue("");
    playSound("enqueue");
    setAnimatingElement({ value, type: "enqueue" });
  };

  const handleDequeue = () => {
    if (animatingElement || isDequeuing) return;
    if (queue.length === 0) {
      playSound("fail");
      showSnackbar("Queue Underflow: Cannot dequeue from an empty queue.", "error");
      return;
    }

    const dequeuedValue = queue[0];
    playSound("dequeue");
    setStepList((prev) => [...prev, `Dequeued "${dequeuedValue}"`]);
    showSnackbar(`Dequeued "${dequeuedValue}" from the queue.`, "success");

    setIsDequeuing(true);
    setTimeout(() => {
      setQueue((prev) => prev.slice(1));
      setIsDequeuing(false);
    }, 500); // Animation duration
  };

  const handlePeek = () => {
    if (queue.length === 0) {
      showSnackbar("Queue is empty. Nothing to peek.", "warning");
      return;
    }
    const front = queue[0];
    setStepList((prev) => [...prev, `Peeked: "${front}"`]);
    showSnackbar(`Front element is: "${front}"`, "info");
  };

  const handleIsEmpty = () => {
    const empty = queue.length === 0;
    setStepList((prev) => [...prev, `Queue is ${empty ? "Empty" : "Not Empty"}`]);
    showSnackbar(empty ? "Queue is Empty" : "Queue is Not Empty", "info");
  };

  const handleSize = () => {
    const size = queue.length;
    setStepList((prev) => [...prev, `Size of Queue: ${size}`]);
    showSnackbar(`Current queue size is: ${size}`, "info");
  };

  const handleReset = () => {
    setQueue([]);
    setStepList([]);
    setInputValue("");
    setAnimatingElement(null);
    setIsDequeuing(false);
    showSnackbar("Queue has been reset.", "info");
  };

  const handleCopySteps = () => {
    if (stepList.length === 0) {
      showSnackbar("No steps to copy.", "warning");
      return;
    }
    navigator.clipboard
      .writeText(stepList.join("\n"))
      .then(() => showSnackbar("✅ Steps copied to clipboard!", "success"))
      .catch(() => showSnackbar("❌ Failed to copy steps.", "error"));
  };

  return (
    <Box
      key={`qop-${themeMode}`}
      sx={{
        bgcolor: colors.background.default,
        minHeight: "100vh",
        width: "100%",
        p: { xs: 2, md: 3 }
      }}
    >
      <Typography variant="h5" align="center" sx={{ mb: 3, color: colors.text.primary }}>
        Simulator
      </Typography>
      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              height: "100%",
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
              bgcolor: colors.background.paper,
              boxShadow: colors.paper.boxShadow,
              borderRadius: "16px"
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
            >
              {queue.length > 0 && (
                <Box
                  sx={{
                    width: `${queueContainerWidth}px`,
                    position: "relative",
                    height: "50px",
                    mb: 1
                  }}
                >
                  <Typography
                    sx={{
                      position: "absolute",
                      top: queue.length > 1 ? "0px" : "20px",
                      left: `${ELEMENT_WIDTH / 2 + ELEMENT_MARGIN / 2}px`,
                      transform: "translateX(-50%)",
                      fontWeight: "bold",
                      color: colors.error.main,
                      transition: "all 0.5s ease-in-out"
                    }}
                  >
                    ▼ Front
                  </Typography>
                  <Typography
                    sx={{
                      position: "absolute",
                      top: "0px",
                      left: `${
                        (queue.length - 1) * TOTAL_ELEMENT_SPACE +
                        ELEMENT_WIDTH / 2 +
                        ELEMENT_MARGIN / 2
                      }px`,
                      transform: "translateX(-50%)",
                      fontWeight: "bold",
                      color: colors.secondary.main,
                      transition: "all 0.5s ease-in-out"
                    }}
                  >
                    ▼ Rear
                  </Typography>
                </Box>
              )}
              <Box
                sx={{
                  width: `${queueContainerWidth}px`,
                  height: `${CONTAINER_HEIGHT}px`,
                  position: "relative",
                  bgcolor: colors.background.container,
                  borderRadius: "12px",
                  boxShadow:
                    themeMode === "dark"
                      ? "inset 5px 5px 10px #0f172a, inset -5px -5px 10px #334155"
                      : "inset 5px 5px 10px #9e9e9e, inset -5px -5px 10px #dcdcdc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    overflow: "hidden"
                  }}
                >
                  {queue.map((value, index) => (
                    <Box
                      key={value + index}
                      sx={{
                        position: "absolute",
                        top: `${(CONTAINER_HEIGHT - ELEMENT_HEIGHT) / 2}px`,
                        left: `${index * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN / 2}px`,
                        width: `${ELEMENT_WIDTH}px`,
                        height: `${ELEMENT_HEIGHT}px`,
                        bgcolor: colors.primary.main,
                        color: colors.primary.contrastText,
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
                        transition: "left 0.5s ease-in-out",
                        animation:
                          isDequeuing && index === 0
                            ? `${dequeueAnimation} 0.5s forwards ease-out`
                            : "none"
                      }}
                    >
                      {isDequeuing && index === 0 && (
                        <ArrowBackIcon sx={{ color: colors.primary.contrastText, mr: 0.5 }} />
                      )}
                      {value}
                    </Box>
                  ))}
                  {animatingElement?.type === "enqueue" && (
                    <Box
                      onAnimationEnd={handleAnimationEnd}
                      sx={{
                        position: "absolute",
                        top: `${(CONTAINER_HEIGHT - ELEMENT_HEIGHT) / 2}px`,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        animation: `${enqueueAnimation(queue.length)} 0.5s forwards ease-in-out`
                      }}
                    >
                      <Box
                        sx={{
                          width: `${ELEMENT_WIDTH}px`,
                          height: `${ELEMENT_HEIGHT}px`,
                          bgcolor: colors.secondary.light,
                          color: colors.primary.contrastText,
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
                        }}
                      >
                        {animatingElement.value}
                      </Box>
                      <ArrowBackIcon sx={{ color: colors.success.main }} />
                    </Box>
                  )}
                </Box>
                {queue.length === 0 && !animatingElement && (
                  <Typography
                    variant="subtitle1"
                    sx={{ color: colors.text.secondary, userSelect: "none" }}
                  >
                    Queue is Empty
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 2.5 },
              height: "100%",
              display: "flex",
              flexDirection: "column",
              bgcolor: colors.background.paper,
              boxShadow: colors.paper.boxShadow,
              borderRadius: "16px"
            }}
          >
            <Stack spacing={2.5} sx={{ flexGrow: 1 }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: colors.text.primary }}>
                  Controls
                </Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Value to Enqueue"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleEnqueue()}
                    disabled={animatingElement || isDequeuing}
                  />
                  <Button
                    variant="contained"
                    onClick={handleEnqueue}
                    startIcon={<AddCircleOutlineIcon />}
                    disabled={animatingElement || isDequeuing}
                  >
                    Enqueue
                  </Button>
                </Stack>
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<RemoveCircleOutlineIcon />}
                      onClick={handleDequeue}
                      disabled={animatingElement || isDequeuing}
                    >
                      Dequeue
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={handlePeek}
                      disabled={animatingElement || isDequeuing}
                    >
                      Front
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<HelpOutlineIcon />}
                      onClick={handleIsEmpty}
                      disabled={animatingElement || isDequeuing}
                    >
                      Is Empty?
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<FormatListNumberedIcon />}
                      onClick={handleSize}
                      disabled={animatingElement || isDequeuing}
                    >
                      Get Size
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              <Divider sx={{ borderColor: colors.stepListBox.border }} />
              <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <Box
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography variant="h6" sx={{ color: colors.text.primary }}>
                    Execution Log
                  </Typography>
                  <Tooltip title="Reset Queue & Log">
                    <IconButton
                      onClick={handleReset}
                      color="error"
                      disabled={animatingElement || isDequeuing}
                    >
                      <RestartAltIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box
                  sx={{
                    flexGrow: 1,
                    minHeight: 200,
                    background: colors.stepListBox.background,
                    borderRadius: 1,
                    p: 1.5,
                    border: `1px solid ${colors.stepListBox.border}`,
                    mt: 1
                  }}
                >
                  <TextField
                    value={stepList.length > 0 ? stepList.join("\n") : "Perform an operation..."}
                    multiline
                    fullWidth
                    readOnly
                    variant="standard"
                    inputRef={logInputRef}
                    sx={{
                      height: "100%",
                      "& .MuiInputBase-root": {
                        height: "100%",
                        alignItems: "flex-start",
                        color: colors.text.primary
                      },
                      "& .MuiInputBase-input": {
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                        overflowY: "auto !important",
                        height: "100% !important",
                        color: colors.text.primary
                      }
                    }}
                    InputProps={{ disableUnderline: true }}
                  />
                </Box>
              </Box>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopySteps}
              >
                Copy Log
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QOP;

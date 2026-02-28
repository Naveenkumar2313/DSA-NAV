import React, { useState, useEffect, useRef } from "react";
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
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

// Assuming sound files are in the public directory
const pushSoundFile = "/DSA/step.mp3";
const popSoundFile = "/DSA/success.mp3";
const failSoundFile = "/DSA/fail.mp3";

// --- Theme Colors Function ---
const getSimulationColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  return {
    primary: {
      main: isDark ? "#60a5fa" : "#3b82f6",
      light: isDark ? "#93c5fd" : "#60a5fa",
      dark: isDark ? "#2563eb" : "#1d4ed8",
      contrastText: isDark ? "#000000" : "#ffffff"
    },
    secondary: {
      main: isDark ? "#a78bfa" : "#8b5cf6",
      light: isDark ? "#c4b5fd" : "#a78bfa"
    },
    success: {
      main: isDark ? "#4ade80" : "#22c55e"
    },
    error: {
      main: isDark ? "#f87171" : "#ef4444"
    },
    background: {
      default: isDark ? "#222A45" : "#f8fafc",
      paper: isDark ? "#222A45" : "#ffffff",
      elevated: isDark ? "#2d3548" : "#f1f5f9",
      log: isDark ? "#1a2038" : "#fafafa",
      stack: isDark ? "#2d3548" : "#bdbdbd",
      stackInner: isDark
        ? "inset 5px 5px 10px #1a2038, inset -5px -5px 10px #3a4560"
        : "inset 5px 5px 10px #9e9e9e, inset -5px -5px 10px #dcdcdc"
    },
    text: {
      primary: isDark ? "#f1f5f9" : "#1e293b",
      secondary: isDark ? "#cbd5e1" : "#64748b",
      muted: isDark ? "#94a3b8" : "#616161"
    },
    border: {
      main: isDark ? "#2d3548" : "#e2e8f0",
      light: isDark ? "#3a4560" : "#eeeeee"
    },
    divider: isDark ? "#2d3548" : "#e2e8f0"
  };
};

const ELEMENT_HEIGHT = 40;
const ELEMENT_MARGIN = 8;
const TOTAL_ELEMENT_SPACE = ELEMENT_HEIGHT + ELEMENT_MARGIN;

const pushAnimation = (stackSize) => keyframes`
  from { bottom: 100%; opacity: 0.7; }
  to { bottom: ${stackSize * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN}px; opacity: 1; }
`;

const popAnimation = (stackSize) => keyframes`
  from { bottom: ${stackSize * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN}px; opacity: 1; }
  to { bottom: 100%; opacity: 0; }
`;

// --- MODIFICATION: Component now accepts 'showSnackbar' as a prop ---
const ST_OP = ({ showSnackbar }) => {
  const theme = useTheme();
  const colors = getSimulationColors(theme);
  const themeMode = theme?.palette?.mode || "light";

  const [stack, setStack] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const MAX_STACK_SIZE = 8;
  const [stepList, setStepList] = useState([]);
  const [animatingElement, setAnimatingElement] = useState(null);
  const logInputRef = useRef(null);

  // --- MODIFICATION: All local Snackbar state and handlers have been removed ---

  useEffect(() => {
    if (logInputRef.current) {
      logInputRef.current.scrollTop = logInputRef.current.scrollHeight;
    }
  }, [stepList]);

  const playSound = (type) => {
    const audio =
      type === "push"
        ? new Audio(pushSoundFile)
        : type === "pop"
        ? new Audio(popSoundFile)
        : new Audio(failSoundFile);
    audio.play().catch((e) => console.error("Audio play failed", e));
  };

  const handleAnimationEnd = () => {
    if (animatingElement?.type === "push") {
      setStack((prev) => [...prev, animatingElement.value]);
      setStepList((prev) => [...prev, `Pushed "${animatingElement.value}"`]);
    }
    setAnimatingElement(null);
  };

  const handlePush = () => {
    if (animatingElement) return;
    if (inputValue.trim() === "") {
      showSnackbar("Please enter a value to push.", "warning"); // Uses prop
      return;
    }
    if (stack.length >= MAX_STACK_SIZE) {
      playSound("fail");
      showSnackbar("Stack Overflow: Maximum size reached!", "error"); // Uses prop
      return;
    }
    const value = inputValue.trim();
    setInputValue("");
    playSound("push");
    setAnimatingElement({ value, type: "push" });
  };

  const handlePop = () => {
    if (animatingElement) return;
    if (stack.length === 0) {
      playSound("fail");
      showSnackbar("Stack Underflow: Cannot pop from an empty stack.", "error"); // Uses prop
      return;
    }
    const poppedValue = stack[stack.length - 1];
    setAnimatingElement({ value: poppedValue, type: "pop" });
    setStack(stack.slice(0, -1));
    playSound("pop");
    setStepList((prev) => [...prev, `Popped "${poppedValue}"`]);
    showSnackbar(`Popped "${poppedValue}" from the stack.`, "success"); // Uses prop
  };

  const handlePeek = () => {
    if (stack.length === 0) {
      showSnackbar("Stack is empty. Nothing to peek.", "warning"); // Uses prop
      return;
    }
    const top = stack[stack.length - 1];
    setStepList((prev) => [...prev, `Peeked: "${top}"`]);
    showSnackbar(`Top element is: "${top}"`, "info"); // Uses prop
  };

  const handleIsEmpty = () => {
    const empty = stack.length === 0;
    setStepList((prev) => [...prev, `Stack is ${empty ? "Empty" : "Not Empty"}`]);
    showSnackbar(empty ? "Stack is Empty" : "Stack is Not Empty", "info"); // Uses prop
  };

  const handleSize = () => {
    const size = stack.length;
    setStepList((prev) => [...prev, `Size of Stack: ${size}`]);
    showSnackbar(`Current stack size is: ${size}`, "info"); // Uses prop
  };

  const handleReset = () => {
    setStack([]);
    setStepList([]);
    setInputValue("");
    setAnimatingElement(null);
    showSnackbar("Stack has been reset.", "info"); // Uses prop
  };

  const handleCopySteps = () => {
    if (stepList.length === 0) {
      showSnackbar("No steps to copy.", "warning"); // Uses prop
      return;
    }
    navigator.clipboard
      .writeText(stepList.join("\n"))
      .then(() => showSnackbar("✅ Steps copied to clipboard!", "success")) // Uses prop
      .catch(() => showSnackbar("❌ Failed to copy steps.", "error")); // Uses prop
  };

  const currentAnimation =
    animatingElement?.type === "push" ? pushAnimation(stack.length) : popAnimation(stack.length);
  const stackContainerHeight = MAX_STACK_SIZE * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN;

  return (
    <Box
      key={`st-op-${themeMode}`}
      sx={{ p: { xs: 2, md: 3 }, bgcolor: colors.background.default }}
    >
      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              height: "100%",
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
              bgcolor: colors.background.paper,
              boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.08)",
              borderRadius: "16px"
            }}
          >
            <Box
              sx={{
                width: { xs: "60%", sm: "45%" },
                maxWidth: "220px",
                height: `${stackContainerHeight}px`,
                position: "relative",
                bgcolor: colors.background.stack,
                borderRadius: "12px",
                boxShadow: colors.background.stackInner,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: "8px",
                  right: "8px",
                  height: "100%",
                  overflow: "hidden"
                }}
              >
                {stack.map((value, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: "absolute",
                      bottom: `${index * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN}px`,
                      width: "100%",
                      bgcolor: colors.primary.main,
                      color: colors.primary.contrastText,
                      height: `${ELEMENT_HEIGHT}px`,
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.25)"
                    }}
                  >
                    {value}
                  </Box>
                ))}
                {animatingElement && (
                  <Box
                    onAnimationEnd={handleAnimationEnd}
                    sx={{
                      position: "absolute",
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      animation: `${currentAnimation} 0.8s forwards ease-in-out`
                    }}
                  >
                    {animatingElement.type === "pop" && (
                      <ArrowUpwardIcon sx={{ color: colors.error.main, mb: 0.5 }} />
                    )}
                    <Box
                      sx={{
                        bgcolor: colors.secondary.light,
                        color: colors.primary.contrastText,
                        width: "100%",
                        height: `${ELEMENT_HEIGHT}px`,
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
                    {animatingElement.type === "push" && (
                      <ArrowDownwardIcon sx={{ color: colors.success.main, mt: 0.5 }} />
                    )}
                  </Box>
                )}
              </Box>
              {stack.length === 0 && !animatingElement && (
                <Typography
                  variant="subtitle1"
                  sx={{ zIndex: 1, userSelect: "none", color: colors.text.muted, fontWeight: 500 }}
                >
                  Stack is Empty
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: { xs: 2, md: 2.5 },
              height: "100%",
              display: "flex",
              flexDirection: "column",
              bgcolor: colors.background.paper,
              boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.08)",
              borderRadius: "16px"
            }}
          >
            <Stack spacing={2.5} sx={{ flexGrow: 1 }}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: colors.text.primary, fontWeight: 600 }}
                >
                  Controls
                </Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Value to Push"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handlePush()}
                    disabled={!!animatingElement}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: colors.background.elevated,
                        "& fieldset": { borderColor: colors.border.main },
                        "&:hover fieldset": { borderColor: colors.primary.main }
                      },
                      "& .MuiInputLabel-root": { color: colors.text.secondary },
                      "& .MuiInputBase-input": { color: colors.text.primary }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handlePush}
                    startIcon={<AddCircleOutlineIcon />}
                    disabled={!!animatingElement}
                    sx={{
                      bgcolor: colors.primary.main,
                      color: colors.primary.contrastText,
                      "&:hover": { bgcolor: colors.primary.dark },
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: 600
                    }}
                  >
                    Push
                  </Button>
                </Stack>
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<RemoveCircleOutlineIcon />}
                      onClick={handlePop}
                      disabled={!!animatingElement}
                      sx={{
                        borderColor: colors.primary.main,
                        color: colors.primary.main,
                        "&:hover": {
                          borderColor: colors.primary.dark,
                          bgcolor: `${colors.primary.main}10`
                        },
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 600
                      }}
                    >
                      Pop
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={handlePeek}
                      disabled={!!animatingElement}
                      sx={{
                        borderColor: colors.primary.main,
                        color: colors.primary.main,
                        "&:hover": {
                          borderColor: colors.primary.dark,
                          bgcolor: `${colors.primary.main}10`
                        },
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 600
                      }}
                    >
                      Peek
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<HelpOutlineIcon />}
                      onClick={handleIsEmpty}
                      disabled={!!animatingElement}
                      sx={{
                        borderColor: colors.primary.main,
                        color: colors.primary.main,
                        "&:hover": {
                          borderColor: colors.primary.dark,
                          bgcolor: `${colors.primary.main}10`
                        },
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 600
                      }}
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
                      disabled={!!animatingElement}
                      sx={{
                        borderColor: colors.primary.main,
                        color: colors.primary.main,
                        "&:hover": {
                          borderColor: colors.primary.dark,
                          bgcolor: `${colors.primary.main}10`
                        },
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 600
                      }}
                    >
                      Get Size
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              <Divider sx={{ borderColor: colors.divider }} />
              <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <Box
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography variant="h6" sx={{ color: colors.text.primary, fontWeight: 600 }}>
                    Execution Log
                  </Typography>
                  <Tooltip title="Reset Stack & Log">
                    <IconButton
                      onClick={handleReset}
                      disabled={!!animatingElement}
                      sx={{ color: colors.error.main }}
                    >
                      <RestartAltIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box
                  sx={{
                    flexGrow: 1,
                    minHeight: 200,
                    bgcolor: colors.background.log,
                    borderRadius: 1,
                    p: 1.5,
                    border: `1px solid ${colors.border.light}`,
                    mt: 1
                  }}
                >
                  <TextField
                    value={
                      stepList.length > 0
                        ? stepList.join("\n")
                        : "Perform an operation to see the log..."
                    }
                    multiline
                    fullWidth
                    readOnly
                    variant="standard"
                    inputRef={logInputRef}
                    sx={{
                      height: "100%",
                      "& .MuiInputBase-root": { height: "100%", alignItems: "flex-start" },
                      "& .MuiInputBase-input": {
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                        overflowY: "auto !important",
                        height: "100% !important",
                        color: stepList.length === 0 ? colors.text.muted : colors.text.secondary
                      }
                    }}
                    InputProps={{ disableUnderline: true }}
                  />
                </Box>
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopySteps}
                sx={{
                  bgcolor: colors.secondary.main,
                  color: "#ffffff",
                  "&:hover": { bgcolor: colors.secondary.light },
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600
                }}
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

export default ST_OP;

import React, { useState, useRef, useEffect, useCallback } from "react";
import p5 from "p5";
import { useTheme } from "@mui/material/styles";

// --- Material UI Imports ---
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Snackbar,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  keyframes
} from "@mui/material";

// --- Material UI Icons ---
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DoneIcon from "@mui/icons-material/Done";

// --- Sound Imports ---
const stepSoundFile = "/DSA/step.mp3";
const successSoundFile = "/DSA/success.mp3";
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
      main: isDark ? "#4ade80" : "#22c55e",
      light: isDark ? "#86efac" : "#4ade80"
    },
    warning: {
      main: isDark ? "#fbbf24" : "#f59e0b",
      light: isDark ? "#fcd34d" : "#fbbf24"
    },
    error: {
      main: isDark ? "#f87171" : "#ef4444",
      light: isDark ? "#fca5a5" : "#f87171"
    },
    background: {
      default: isDark ? "#000000" : "#f8fafc",
      paper: isDark ? "#000000" : "#ffffff",
      card: isDark ? "#0a0a0a" : "#f1f5f9",
      input: isDark ? "#000000" : "#ffffff",
      stack: isDark ? "#1a1a1a" : "#bdbdbd",
      stackInner: isDark ? "#0a0a0a" : "#9e9e9e",
      stackOuter: isDark ? "#2a2a2a" : "#dcdcdc",
      log: isDark ? "#000000" : "#fafafa",
      logborder: isDark ? "#333333" : "#eeeeee"
    },
    text: {
      primary: isDark ? "#f1f5f9" : "#1e293b",
      secondary: isDark ? "#cbd5e1" : "#475569",
      muted: isDark ? "#94a3b8" : "#64748b"
    },
    divider: isDark ? "#1a1a1a" : "#e2e8f0",
    canvas: {
      background: isDark ? "#000000" : "#ffffff",
      text: isDark ? "#f1f5f9" : "#1e293b",
      textMuted: isDark ? "#94a3b8" : "#9e9e9e",
      highlight: isDark ? "#fbbf24" : "#ffc107"
    }
  };
};

// --- Constants & Keyframes for Stack Visualization ---
const ELEMENT_HEIGHT = 40;
const ELEMENT_MARGIN = 8;
const TOTAL_ELEMENT_SPACE = ELEMENT_HEIGHT + ELEMENT_MARGIN;
const MAX_STACK_SIZE = 8;

const pushAnimation = (stackSize) => keyframes`
  from { bottom: 100%; opacity: 0.7; }
  to { bottom: ${stackSize * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN}px; opacity: 1; }
`;

const popAnimation = (stackSize) => keyframes`
  from { bottom: ${stackSize * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN}px; opacity: 1; }
  to { bottom: 100%; opacity: 0; }
`;

// --- MODIFICATION: Component now accepts 'showSnackbar' as a prop ---
const VPLab = ({ showSnackbar }) => {
  const theme = useTheme();
  const colors = getSimulationColors(theme);
  const themeMode = theme?.palette?.mode || "light";

  const canvasRef = useRef();
  const [expression, setExpression] = useState("");
  const [manualExpressionInput, setManualExpressionInput] = useState("");
  const [tokens, setTokens] = useState([]);
  const [index, setIndex] = useState(0);
  const [stack, setStack] = useState([]);
  const [stepList, setStepList] = useState([]);
  const [history, setHistory] = useState([]);
  const [isValid, setIsValid] = useState(null);
  const [isExpressionSet, setIsExpressionSet] = useState(false);
  const logInputRef = useRef(null);

  // --- MODIFICATION: Removed snackbar state ---
  const [animatingElement, setAnimatingElement] = useState(null);
  const [nextState, setNextState] = useState(null);
  const audioRefs = useRef({});

  // --- Sound and General Hooks ---
  useEffect(() => {
    audioRefs.current.step = new Audio(stepSoundFile);
    audioRefs.current.success = new Audio(successSoundFile);
    audioRefs.current.fail = new Audio(failSoundFile);
  }, []);

  const playSound = (soundType) => {
    if (audioRefs.current[soundType]) {
      audioRefs.current[soundType].currentTime = 0;
      audioRefs.current[soundType].play().catch((e) => console.error("Audio error:", e));
    }
  };

  useEffect(() => {
    if (logInputRef.current) {
      logInputRef.current.scrollTop = logInputRef.current.scrollHeight;
    }
  }, [stepList]);

  // --- p5.js Canvas for Expression Visualization ---
  const drawExpression = useCallback(
    (p, currentIsValid, currentIndex, currentTokens) => {
      // Convert hex to RGB for p5
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16)
            }
          : { r: 255, g: 255, b: 255 };
      };

      const bgColor = hexToRgb(colors.canvas.background);
      const textColor = hexToRgb(colors.canvas.text);
      const mutedColor = hexToRgb(colors.canvas.textMuted);
      const highlightColor = hexToRgb(colors.canvas.highlight);

      p.background(bgColor.r, bgColor.g, bgColor.b);
      p.textFont("monospace", 24);
      p.textAlign(p.CENTER, p.CENTER);

      const charWidth = p.textWidth("W");
      const totalWidth = currentTokens.length * charWidth;
      let startX = p.width / 2 - totalWidth / 2;

      currentTokens.forEach((token, i) => {
        if (i === currentIndex) {
          p.fill(highlightColor.r, highlightColor.g, highlightColor.b);
          p.noStroke();
          p.rect(startX - charWidth / 2, p.height / 2 - 20, charWidth, 40, 5);
          p.fill(textColor.r, textColor.g, textColor.b);
        } else if (i < currentIndex) {
          p.fill(mutedColor.r, mutedColor.g, mutedColor.b);
        } else {
          p.fill(textColor.r, textColor.g, textColor.b);
        }
        p.text(token, startX, p.height / 2);
        startX += charWidth;
      });
    },
    [colors]
  );

  useEffect(() => {
    const sketch = new p5((p) => {
      p.setup = () => {
        const parentDiv = canvasRef.current;
        const canvas = p.createCanvas(parentDiv.offsetWidth, 80);
        canvas.parent(parentDiv);
      };
      p.windowResized = () => {
        const parentDiv = canvasRef.current;
        if (parentDiv) p.resizeCanvas(parentDiv.offsetWidth, 80);
      };
      p.draw = () => {
        drawExpression(p, isValid, index, tokens);
      };
    });
    return () => sketch.remove();
  }, [drawExpression, isValid, index, tokens]);

  // --- MODIFICATION: Removed local showSnackbar and handleCloseSnackbar functions ---

  // This new function checks if the process is complete and sets the final status
  const checkCompletion = (finalStack, finalIndex) => {
    if (finalIndex >= tokens.length) {
      const finalStackIsEmpty = finalStack.length === 0;
      setIsValid(finalStackIsEmpty);
      if (finalStackIsEmpty) {
        playSound("success");
        showSnackbar("Validation Complete: Parentheses are valid!", "success");
      } else {
        playSound("fail");
        showSnackbar("Validation Complete: Invalid - Unmatched opening brackets remain.", "error");
      }
    }
  };

  const handleAnimationEnd = () => {
    if (nextState) {
      if (nextState.stack !== undefined) setStack(nextState.stack);
      if (nextState.index !== undefined) setIndex(nextState.index);
      if (nextState.stepList !== undefined) setStepList(nextState.stepList);
      if (nextState.history !== undefined) setHistory(nextState.history);
      if (nextState.isValid !== undefined) setIsValid(nextState.isValid);

      checkCompletion(nextState.stack, nextState.index);

      setNextState(null);
    }
    setAnimatingElement(null);
  };

  const handleSetExpression = () => {
    if (manualExpressionInput.trim() === "") {
      showSnackbar("Please enter an expression.", "warning");
      return;
    }
    setExpression(manualExpressionInput);
    setTokens(manualExpressionInput.split(""));
    setStack([]);
    setStepList([]);
    setIndex(0);
    setIsValid(null);
    setHistory([]);
    setIsExpressionSet(true);
    showSnackbar('Expression set! Click "Next Step" to start.', "success");
  };

  const performStep = () => {
    if (!isExpressionSet || animatingElement || isValid !== null || index >= tokens.length) return;

    playSound("step");
    const token = tokens[index];
    const newStack = [...stack];
    let newStepList = [...stepList];
    const finalHistory = [...history, { stack, index, stepList, isValid }];

    if (["(", "{", "["].includes(token)) {
      if (newStack.length >= MAX_STACK_SIZE) {
        showSnackbar("Stack is full!", "error");
        return;
      }
      newStack.push(token);
      newStepList.push(`Pushed '${token}' to stack.`);
      setNextState({
        stack: newStack,
        index: index + 1,
        stepList: newStepList,
        history: finalHistory
      });
      setAnimatingElement({ value: token, type: "push" });
    } else if ([")", "}", "]"].includes(token)) {
      const lastOpen = newStack.length > 0 ? newStack[newStack.length - 1] : undefined;
      const isMatch =
        (lastOpen === "(" && token === ")") ||
        (lastOpen === "{" && token === "}") ||
        (lastOpen === "[" && token === "]");

      if (isMatch) {
        newStack.pop();
        newStepList.push(` Matched '${lastOpen}' with '${token}'. Popping.`);
        setNextState({
          stack: newStack,
          index: index + 1,
          stepList: newStepList,
          history: finalHistory
        });
        setAnimatingElement({ value: lastOpen, type: "pop" });
      } else {
        playSound("fail");
        newStepList.push(` Mismatch! Stack top: '${lastOpen}', current: '${token}'.`);
        setIsValid(false);
        setStepList(newStepList);
        setIndex(index + 1);
        setHistory(finalHistory);
        showSnackbar("Invalid: Mismatched brackets!", "error");
        return;
      }
    } else {
      const newIndex = index + 1;
      newStepList.push(`Skipping non-parenthesis character: '${token}'`);
      setIndex(newIndex);
      setStepList(newStepList);
      setHistory(finalHistory);
      checkCompletion(stack, newIndex);
    }
  };

  const undoStep = () => {
    if (animatingElement || history.length === 0) return;
    const last = history[history.length - 1];
    setStack(last.stack);
    setIndex(last.index);
    setStepList(last.stepList);
    setIsValid(last.isValid);
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    setStack([]);
    setStepList([]);
    setIndex(0);
    setIsValid(null);
    setHistory([]);
    setAnimatingElement(null);
    setNextState(null);
    setExpression("");
    setManualExpressionInput("");
    setTokens([]);
    setIsExpressionSet(false);
    showSnackbar("Simulator has been reset.", "info");
  };

  const stackContainerHeight = MAX_STACK_SIZE * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN;
  const currentAnimation =
    animatingElement?.type === "push" ? pushAnimation(stack.length) : popAnimation(stack.length);

  return (
    <Box
      key={`vp-lab-${themeMode}`}
      sx={{ bgcolor: colors.background.default, width: "100%", p: { xs: 2, md: 3 } }}
    >
      <Typography
        variant="h5"
        align="center"
        sx={{ mb: 3, color: colors.text.primary, fontWeight: 700 }}
      >
        Simulator
      </Typography>

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
              bgcolor: colors.background.paper,
              boxShadow: `0px 5px 15px ${
                colors.background.default === "#000000"
                  ? "rgba(0, 0, 0, 0.3)"
                  : "rgba(0, 0, 0, 0.08)"
              }`,
              borderRadius: "16px"
            }}
          >
            <Box ref={canvasRef} sx={{ width: "100%", height: "80px", mb: 3 }} />
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Typography
                variant="h6"
                sx={{ mb: 1, fontSize: "1.1rem", color: colors.text.primary, fontWeight: 600 }}
              >
                Stack
              </Typography>
              <Box
                sx={{
                  width: "120px",
                  height: `${stackContainerHeight}px`,
                  position: "relative",
                  bgcolor: colors.background.stack,
                  borderRadius: "12px",
                  border: `1px solid #e0e0e0`,
                  boxShadow: `inset 5px 5px 10px ${colors.background.stackInner}, inset -5px -5px 10px ${colors.background.stackOuter}`
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
                  {stack.map((value, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        position: "absolute",
                        bottom: `${idx * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN}px`,
                        width: "100%",
                        bgcolor: colors.primary.main,
                        color: colors.primary.contrastText,
                        height: `${ELEMENT_HEIGHT}px`,
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "1.2rem"
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
                          fontSize: "1.2rem"
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
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      color: colors.text.muted
                    }}
                  >
                    Empty
                  </Typography>
                )}
              </Box>
              {isValid !== null && (
                <Alert severity={isValid ? "success" : "error"} sx={{ mt: 2, fontWeight: "bold" }}>
                  {isValid ? "VALID" : "INVALID"}
                </Alert>
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
              boxShadow: `0px 5px 15px ${
                colors.background.default === "#000000"
                  ? "rgba(0, 0, 0, 0.3)"
                  : "rgba(0, 0, 0, 0.08)"
              }`,
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
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Enter Expression"
                    value={manualExpressionInput}
                    onChange={(e) => setManualExpressionInput(e.target.value)}
                    placeholder="e.g., ({[]})"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: colors.background.input,
                        color: colors.text.primary,
                        "& fieldset": { borderColor: colors.divider },
                        "&:hover fieldset": { borderColor: colors.primary.main },
                        "&.Mui-focused fieldset": { borderColor: colors.primary.main }
                      },
                      "& .MuiInputLabel-root": { color: colors.text.secondary },
                      "& .MuiInputLabel-root.Mui-focused": { color: colors.primary.main }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSetExpression}
                    startIcon={<DoneIcon />}
                    sx={{
                      bgcolor: colors.primary.main,
                      color: colors.primary.contrastText,
                      "&:hover": { bgcolor: colors.primary.dark }
                    }}
                  >
                    Set
                  </Button>
                </Stack>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ArrowForwardIcon />}
                      onClick={performStep}
                      disabled={!isExpressionSet || !!animatingElement || isValid !== null}
                      sx={{
                        bgcolor: colors.primary.main,
                        color: colors.primary.contrastText,
                        "&:hover": { bgcolor: colors.primary.dark },
                        "&.Mui-disabled": {
                          bgcolor: colors.background.card,
                          color: colors.text.muted
                        }
                      }}
                    >
                      Next Step
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      onClick={undoStep}
                      disabled={!isExpressionSet || !!animatingElement || history.length === 0}
                      sx={{
                        borderColor: colors.primary.main,
                        color: colors.primary.main,
                        "&:hover": { borderColor: colors.primary.dark, bgcolor: "transparent" },
                        "&.Mui-disabled": { borderColor: colors.divider, color: colors.text.muted }
                      }}
                    >
                      Prev Step
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
                  <Tooltip title="Reset">
                    <IconButton onClick={handleReset} sx={{ color: colors.error.main }}>
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
                    border: `1px solid ${colors.background.logBorder}`,
                    mt: 1
                  }}
                >
                  <TextField
                    value={
                      stepList.length > 0
                        ? stepList.join("\n")
                        : "Enter an expression and click 'Set'..."
                    }
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
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={() => navigator.clipboard.writeText(stepList.join("\n"))}
                sx={{
                  bgcolor: colors.secondary.main,
                  color: "#ffffff",
                  "&:hover": { bgcolor: colors.secondary.light }
                }}
              >
                Copy Log
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      {/* --- MODIFICATION: Removed the <Snackbar> component from here --- */}
    </Box>
  );
};

export default VPLab;

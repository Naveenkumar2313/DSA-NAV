import React, { useState, useRef, useEffect, useCallback } from "react";
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
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  keyframes
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

const stepSoundFile = "/DSA/step.mp3";
const successSoundFile = "/DSA/success.mp3";
const failSoundFile = "/DSA/fail.mp3";

const getSimulationColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  return {
    background: {
      default: isDark ? "#222A45" : "#eceff1",
      paper: isDark ? "#222A45" : "#ffffff",
      card: isDark ? "#2d3548" : "#fafafa"
    },
    text: {
      primary: isDark ? "#f1f5f9" : "#1e3a8a",
      secondary: isDark ? "#cbd5e1" : "#546e7a",
      muted: isDark ? "#94a3b8" : "#999"
    },
    primary: {
      main: isDark ? "#60a5fa" : "#2196f3",
      light: isDark ? "#93c5fd" : "#64b5f6",
      contrastText: "#fff"
    },
    secondary: { main: isDark ? "#a78bfa" : "#673ab7", light: isDark ? "#c4b5fd" : "#9575cd" },
    success: { main: isDark ? "#4ade80" : "#4CAF50" },
    warning: { main: isDark ? "#fbbf24" : "#FFC107" },
    error: { main: isDark ? "#f87171" : "#d32f2f" },
    stack: {
      bg: isDark ? "#1a1a1a" : "#bdbdbd",
      shadow: isDark
        ? "inset 5px 5px 10px #2d3548, inset -5px -5px 10px #3a4560"
        : "inset 5px 5px 10px #9e9e9e, inset -5px -5px 10px #dcdcdc",
      empty: isDark ? "#94a3b8" : "#616161"
    },
    element: {
      bg: isDark ? "#3b82f6" : "#2196f3",
      shadow: isDark ? "0 2px 4px rgba(0,0,0,0.4)" : "0 2px 4px rgba(0,0,0,0.25)"
    },
    log: { bg: isDark ? "#000000" : "#fafafa", border: isDark ? "#333333" : "#eee" },
    border: { main: isDark ? "#1a1a1a" : "#e2e8f0" }
  };
};

const ELEMENT_HEIGHT = 40;
const ELEMENT_MARGIN = 8;
const TOTAL_ELEMENT_SPACE = ELEMENT_HEIGHT + ELEMENT_MARGIN;
const MAX_STACK_SIZE = 6;

const pushAnimation = (stackSize) => keyframes`
  from { bottom: 100%; opacity: 0.7; }
  to { bottom: ${stackSize * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN}px; opacity: 1; }
`;

const popAnimation = (stackSize) => keyframes`
  from { bottom: ${stackSize * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN}px; opacity: 1; }
  to { bottom: 100%; opacity: 0; }
`;

const operatorPrecedence = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
const isOperator = (char) => ["+", "-", "*", "/", "^"].includes(char);
const isOperand = (char) => /^[a-zA-Z0-9]$/.test(char);

// --- MODIFICATION: Component now accepts 'showSnackbar' as a prop ---
const INPOLab = ({ showSnackbar }) => {
  const theme = useTheme();
  const colors = getSimulationColors(theme);
  const themeMode = theme?.palette?.mode || "light";
  const [expression, setExpression] = useState("");
  const [manualExpressionInput, setManualExpressionInput] = useState("A+B*(C-D)");
  const [tokens, setTokens] = useState([]);
  const [index, setIndex] = useState(0);
  const [stack, setStack] = useState([]);
  const [postfix, setPostfix] = useState("");
  const [stepList, setStepList] = useState([]);
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState("manual");
  const [conversionComplete, setConversionComplete] = useState(false);

  // --- MODIFICATION: Removed snackbar state ---
  // const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const [animatingElement, setAnimatingElement] = useState(null);
  const [nextState, setNextState] = useState(null);
  const [isFlushing, setIsFlushing] = useState(false);
  const logInputRef = useRef(null);
  const stepSound = useRef(new Audio(stepSoundFile));
  const successSound = useRef(new Audio(successSoundFile));

  useEffect(() => {
    if (logInputRef.current) {
      logInputRef.current.scrollTop = logInputRef.current.scrollHeight;
    }
  }, [stepList]);

  useEffect(() => {
    const filteredTokens = manualExpressionInput.split("").filter((char) => char.trim() !== "");
    setTokens(filteredTokens);
    setExpression(manualExpressionInput);
    // --- CHANGE: The last argument `false` prevents the snackbar from showing on input change. ---
    handleReset(false, false);
  }, [manualExpressionInput]);

  useEffect(() => {
    if (isFlushing && stack.length > 0 && !animatingElement) {
      const poppedValue = stack[stack.length - 1];
      setStepList((prev) => [...prev, `Popped '${poppedValue}' from stack (final flush).`]);
      setNextState({
        stack: stack.slice(0, -1),
        postfix: postfix + poppedValue
      });
      setAnimatingElement({ value: poppedValue, type: "pop" });
    } else if (isFlushing && stack.length === 0 && !animatingElement) {
      setIsFlushing(false);
      successSound.current.play();
      showSnackbar("Conversion Complete!", "success"); // Uses prop
      setConversionComplete(true);
    }
  }, [isFlushing, stack, animatingElement, postfix]);

  // --- MODIFICATION: Removed local showSnackbar and handleCloseSnackbar functions ---

  const handleAnimationEnd = () => {
    if (nextState) {
      if (nextState.stack !== undefined) setStack(nextState.stack);
      if (nextState.postfix !== undefined) setPostfix(nextState.postfix);
      if (nextState.stepList !== undefined) setStepList(nextState.stepList);
      if (nextState.index !== undefined) setIndex(nextState.index);
      if (nextState.history !== undefined) setHistory(nextState.history);
      setNextState(null);
    }
    setAnimatingElement(null);
  };

  const performStep = () => {
    if (animatingElement || isFlushing) return;

    if (index >= tokens.length) {
      if (stack.length > 0) setIsFlushing(true);
      else showSnackbar("Conversion is already complete!", "info"); // Uses prop
      return;
    }

    stepSound.current.currentTime = 0;
    stepSound.current.play();

    const token = tokens[index];
    let newStack = [...stack];
    let newPostfix = postfix;
    let newStepList = [...stepList];
    let poppedForPrecedence = false;
    let poppedValue = null;

    const finalHistory = [...history, { stack, postfix, index, stepList }];

    if (isOperand(token)) {
      newPostfix += token;
      newStepList.push(`Operand '${token}' added to output.`);
      setPostfix(newPostfix);
      setStepList(newStepList);
      setIndex(index + 1);
      setHistory(finalHistory);
    } else if (token === "(") {
      newStack.push(token);
      newStepList.push(`Pushed '${token}' to stack.`);
      setNextState({
        stack: newStack,
        index: index + 1,
        stepList: newStepList,
        history: finalHistory
      });
      setAnimatingElement({ value: token, type: "push" });
    } else if (token === ")") {
      while (newStack.length > 0 && newStack[newStack.length - 1] !== "(") {
        newPostfix += newStack.pop();
      }
      if (newStack.length > 0) newStack.pop(); // Discard the '('
      newStepList.push(`) Found: Popped until '('.`);
      setStack(newStack);
      setPostfix(newPostfix);
      setStepList(newStepList);
      setIndex(index + 1);
      setHistory(finalHistory);
    } else if (isOperator(token)) {
      while (
        newStack.length &&
        isOperator(newStack[newStack.length - 1]) &&
        operatorPrecedence[newStack[newStack.length - 1]] >= operatorPrecedence[token]
      ) {
        poppedValue = newStack.pop();
        newPostfix += poppedValue;
        newStepList.push(`Popped '${poppedValue}' (precedence).`);
        poppedForPrecedence = true;
      }
      newStack.push(token);
      newStepList.push(`Pushed operator '${token}' to stack.`);
      if (poppedForPrecedence) {
        const intermediateStack = stack.slice(0, -1);
        setNextState({
          stack: newStack,
          postfix: newPostfix,
          index: index + 1,
          stepList: newStepList,
          history: finalHistory
        });
        setStack(intermediateStack);
        setAnimatingElement({ value: poppedValue, type: "pop" });
      } else {
        setNextState({
          stack: newStack,
          index: index + 1,
          stepList: newStepList,
          history: finalHistory
        });
        setAnimatingElement({ value: token, type: "push" });
      }
    } else {
      setIndex(index + 1);
      setHistory(finalHistory);
    }
  };

  const undoStep = () => {
    if (animatingElement || history.length === 0) {
      if (!animatingElement) showSnackbar("No previous steps to undo", "warning"); // Uses prop
      return;
    }
    const last = history[history.length - 1];
    setStack(last.stack);
    setPostfix(last.postfix);
    setIndex(last.index);
    setStepList(last.stepList);
    setHistory((prev) => prev.slice(0, -1));
    setConversionComplete(false);
    setIsFlushing(false);
  };

  // --- CHANGE: Added `showNotification` parameter to conditionally show the snackbar. ---
  const handleReset = (playSoundEffect = true, showNotification = true) => {
    if (playSoundEffect) stepSound.current.play();
    setStack([]);
    setPostfix("");
    setStepList([]);
    setIndex(0);
    setHistory([]);
    setAnimatingElement(null);
    setNextState(null);
    setConversionComplete(false);
    setIsFlushing(false);
    if (showNotification) {
      showSnackbar("Simulator has been reset.", "info"); // Uses prop
    }
  };

  const generateRandomInfix = () => "A*(B+C)-D/E";

  const handleCopy = (text, type) => {
    if (!text) {
      showSnackbar(`No ${type} to copy.`, "warning");
      return;
    } // Uses prop
    navigator.clipboard
      .writeText(text)
      .then(() => showSnackbar(`✅ ${type} copied to clipboard!`, "success")) // Uses prop
      .catch(() => showSnackbar(`❌ Failed to copy ${type}.`, "error")); // Uses prop
  };

  const stackContainerHeight = MAX_STACK_SIZE * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN;
  const currentAnimation =
    animatingElement?.type === "push" ? pushAnimation(stack.length) : popAnimation(stack.length);

  return (
    <Box
      key={`inpo-lab-${themeMode}`}
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
            sx={{
              height: "100%",
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: colors.background.paper
            }}
          >
            <Box sx={{ width: "100%", textAlign: "left", mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 1, color: colors.text.primary }}>
                <b>Infix:</b>{" "}
                <code style={{ color: colors.text.secondary }}>{expression || "N/A"}</code>
              </Typography>
              <Typography variant="body1" sx={{ color: colors.text.primary }}>
                <b>Postfix:</b>{" "}
                <code style={{ color: colors.success.main, fontWeight: "bold" }}>
                  {postfix || "Empty"}
                </code>
              </Typography>
            </Box>
            <Box
              sx={{
                width: "120px",
                height: `${stackContainerHeight}px`,
                position: "relative",
                bgcolor: colors.stack.bg,
                borderRadius: "12px",
                border: `1px solid #e0e0e0`,
                boxShadow: colors.stack.shadow,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 2
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
                      bgcolor: colors.element.bg,
                      color: colors.primary.contrastText,
                      height: `${ELEMENT_HEIGHT}px`,
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      boxShadow: colors.element.shadow
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
                        fontSize: "1.2rem",
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
                  sx={{ zIndex: 1, userSelect: "none", color: colors.stack.empty, fontWeight: 500 }}
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
              bgcolor: colors.background.paper
            }}
          >
            <Stack spacing={2.5} sx={{ flexGrow: 1 }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: colors.text.primary }}>
                  Controls
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Mode</InputLabel>
                  <Select value={mode} label="Mode" onChange={(e) => setMode(e.target.value)}>
                    <MenuItem value="manual">Manual Input</MenuItem>
                    <MenuItem value="auto">Auto Generate</MenuItem>
                  </Select>
                </FormControl>
                {mode === "manual" ? (
                  <TextField
                    fullWidth
                    size="small"
                    label="Enter Infix Expression"
                    value={manualExpressionInput}
                    onChange={(e) => setManualExpressionInput(e.target.value)}
                    placeholder="e.g., A+B*(C-D)"
                  />
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      bgcolor: colors.secondary.main,
                      "&:hover": { bgcolor: colors.secondary.light }
                    }}
                    startIcon={<AutoFixHighIcon />}
                    onClick={() => setManualExpressionInput(generateRandomInfix())}
                  >
                    Generate Expression
                  </Button>
                )}
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        bgcolor: colors.primary.main,
                        "&:hover": { bgcolor: colors.primary.light }
                      }}
                      startIcon={<PlayArrowIcon />}
                      onClick={performStep}
                      disabled={!!animatingElement || conversionComplete}
                    >
                      Next Step
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ borderColor: colors.primary.main, color: colors.primary.main }}
                      startIcon={<SkipPreviousIcon />}
                      onClick={undoStep}
                      disabled={!!animatingElement || history.length === 0}
                    >
                      Prev Step
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              <Divider sx={{ borderColor: colors.border.main }} />
              <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <Box
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography variant="h6" sx={{ color: colors.text.primary }}>
                    Execution Log
                  </Typography>
                  <Tooltip title="Reset Simulator">
                    <IconButton onClick={() => handleReset(true)} sx={{ color: colors.error.main }}>
                      <RestartAltIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box
                  sx={{
                    flexGrow: 1,
                    minHeight: 200,
                    bgcolor: colors.log.bg,
                    borderRadius: 1,
                    p: 1.5,
                    border: `1px solid ${colors.log.border}`,
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
              <Stack direction="row" spacing={1}>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  sx={{
                    bgcolor: colors.secondary.main,
                    "&:hover": { bgcolor: colors.secondary.light }
                  }}
                  startIcon={<ContentCopyIcon />}
                  onClick={() => handleCopy(stepList.join("\n"), "Log")}
                >
                  Copy Log
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  sx={{
                    bgcolor: colors.secondary.main,
                    "&:hover": { bgcolor: colors.secondary.light }
                  }}
                  startIcon={<ContentCopyIcon />}
                  onClick={() => handleCopy(postfix, "Postfix")}
                >
                  Copy Postfix
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      {conversionComplete && (
        <Alert severity="success" sx={{ mt: 3 }} variant="filled">
          Conversion Complete! The final postfix expression is: <strong>{postfix}</strong>
        </Alert>
      )}
    </Box>
  );
};

export default INPOLab;

import React, { useState, useRef, useEffect, useCallback } from "react";
import p5 from "p5";

// --- Material UI Imports ---
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Snackbar,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  keyframes,
  TextField,
  useTheme
} from "@mui/material";

// --- Material UI Icons ---
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayForWorkIcon from "@mui/icons-material/PlayForWork";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

// --- Sound Imports ---
const stepSoundFile = "/DSA/step.mp3";
const successSoundFile = "/DSA/success.mp3";
const failSoundFile = "/DSA/fail.mp3";

// --- Theme Definition Removed (Using Global Theme) ---

// --- Constants & Keyframes for Stack Visualization ---
const ELEMENT_HEIGHT = 40;
const ELEMENT_MARGIN = 8;
const TOTAL_ELEMENT_SPACE = ELEMENT_HEIGHT + ELEMENT_MARGIN;
const MAX_STACK_SIZE = 6;

const getExampleColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  return {
    primary: isDark ? "#90caf9" : "#1976d2",
    background: {
      default: isDark ? "#000000" : "#ffffff",
      paper: isDark ? "#000000" : "#ffffff",
      canvas: isDark ? "#000000" : "#ffffff"
    },
    text: {
      primary: isDark ? "#ffffff" : "#000000",
      secondary: isDark ? "#b0bec5" : "#757575"
    },
    status: {
      valid: isDark ? "#81c784" : "#2e7d32",
      invalid: isDark ? "#f44336" : "#d32f2f",
      highlight: isDark ? "#ffb74d" : "#ed6c02"
    },
    stackContainer: {
      bg: isDark ? "#1e1e1e" : "#bdbdbd",
      border: isDark ? "#333333" : "#e0e0e0",
      shadowDark: isDark ? "#000000" : "#9e9e9e",
      shadowLight: isDark ? "#383838" : "#dcdcdc"
    }
  };
};

const pushAnimation = (stackSize) => keyframes`
  from { bottom: 100%; opacity: 0.7; }
  to { bottom: ${stackSize * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN}px; opacity: 1; }
`;

const popAnimation = (stackSize) => keyframes`
  from { bottom: ${stackSize * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN}px; opacity: 1; }
  to { bottom: 100%; opacity: 0; }
`;

// --- MODIFICATION: Component now accepts 'showSnackbar' as a prop ---
const VP_EX2 = ({ showSnackbar }) => {
  const theme = useTheme();
  const colors = getExampleColors(theme);
  const colorsRef = useRef(colors);
  const canvasRef = useRef();
  const [expression] = useState("({[}])");
  const [tokens, setTokens] = useState([]);
  const [index, setIndex] = useState(0);
  const [stack, setStack] = useState([]);
  const [stepList, setStepList] = useState([]);
  const [history, setHistory] = useState([]);
  const [isValid, setIsValid] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const logInputRef = useRef(null);

  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  // --- MODIFICATION: Removed snackbar state ---
  const [animatingElement, setAnimatingElement] = useState(null);
  const [nextState, setNextState] = useState(null);
  const audioRefs = useRef({});
  const intervalRef = useRef(null);

  // Sound Handling
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
    setTokens(expression.split(""));
  }, [expression]);

  useEffect(() => {
    if (logInputRef.current) {
      logInputRef.current.scrollTop = logInputRef.current.scrollHeight;
    }
  }, [stepList]);

  const drawStatusAndExpression = useCallback(
    (p, currentColors, currentIsValid, currentIndex, currentTokens) => {
      p.background(currentColors.background.canvas);
      p.textFont("monospace", 24);
      p.textAlign(p.CENTER, p.CENTER);

      const charWidth = p.textWidth("W");
      const totalWidth = currentTokens.length * charWidth;
      let startX = p.width / 2 - totalWidth / 2;

      currentTokens.forEach((token, i) => {
        if (i === currentIndex) {
          p.fill(currentColors.status.highlight);
          p.noStroke();
          p.rect(startX - charWidth / 2, p.height / 2 - 20 - 15, charWidth, 40, 5);
          p.fill(currentColors.text.primary);
        } else if (i < currentIndex) {
          p.fill(currentColors.text.secondary);
        } else {
          p.fill(currentColors.text.primary);
        }
        p.text(token, startX, p.height / 2 - 15);
        startX += charWidth;
      });

      if (currentIsValid !== null) {
        p.textSize(20);
        if (currentIsValid) {
          p.fill(currentColors.status.valid);
          p.text("✅ VALID", p.width / 2, p.height - 30);
        } else {
          p.fill(currentColors.status.invalid);
          p.text("❌ INVALID", p.width / 2, p.height - 30);
        }
      }
    },
    []
  );

  useEffect(() => {
    const sketch = new p5((p) => {
      p.setup = () => {
        const parentDiv = canvasRef.current;
        const canvas = p.createCanvas(parentDiv.offsetWidth, 120);
        canvas.parent(parentDiv);
      };
      p.windowResized = () => {
        const parentDiv = canvasRef.current;
        if (parentDiv) p.resizeCanvas(parentDiv.offsetWidth, 120);
      };
      p.draw = () => {
        drawStatusAndExpression(p, colorsRef.current, isValid, index, tokens);
      };
    });
    return () => sketch.remove();
  }, [drawStatusAndExpression, isValid, index, tokens]);

  // --- MODIFICATION: Removed local showSnackbar and handleCloseSnackbar functions ---

  const handleAnimationEnd = () => {
    if (nextState) {
      if (nextState.stack !== undefined) setStack(nextState.stack);
      if (nextState.index !== undefined) setIndex(nextState.index);
      if (nextState.stepList !== undefined) setStepList(nextState.stepList);
      if (nextState.history !== undefined) setHistory(nextState.history);
      if (nextState.isValid !== undefined) setIsValid(nextState.isValid);
      setNextState(null);
    }
    setAnimatingElement(null);
  };

  const performStep = () => {
    if (animatingElement || index >= tokens.length || isValid !== null) return;

    playSound("step");

    const token = tokens[index];
    const newStack = [...stack];
    let newStepList = [...stepList];
    const finalHistory = [...history, { stack, index, stepList, isValid }];

    if (["(", "{", "["].includes(token)) {
      newStack.push(token);
      newStepList.push(`Pushed '${token}' to stack.`);
      setNextState({
        stack: newStack,
        index: index + 1,
        stepList: newStepList,
        history: finalHistory
      });
      setAnimatingElement({ value: token, type: "push" });
    } else {
      const lastOpen = newStack.length > 0 ? newStack[newStack.length - 1] : undefined;
      const isMatch =
        (lastOpen === "(" && token === ")") ||
        (lastOpen === "{" && token === "}") ||
        (lastOpen === "[" && token === "]");

      if (isMatch) {
        newStack.pop();
        newStepList.push(`Matched '${lastOpen}' with '${token}'. Popping.`);
        setNextState({
          stack: newStack,
          index: index + 1,
          stepList: newStepList,
          history: finalHistory
        });
        setAnimatingElement({ value: lastOpen, type: "pop" });
      } else {
        playSound("fail");
        newStepList.push(`Mismatch! Stack top: '${lastOpen}', current: '${token}'.`);
        setIsValid(false);
        setStepList(newStepList);
        setIndex(index + 1);
        setHistory(finalHistory);
        showSnackbar("Invalid: Mismatched brackets!", "error");
        return;
      }
    }

    if (index + 1 >= tokens.length) {
      setTimeout(() => {
        const finalStackIsEmpty = newStack.length === 0;
        setIsValid(finalStackIsEmpty);
        if (finalStackIsEmpty) {
          playSound("success");
          showSnackbar("Parentheses are valid!", "success");
        } else {
          playSound("fail");
          showSnackbar("Invalid: Unmatched opening brackets remain.", "error");
        }
      }, 800);
    }
  };

  const undoStep = () => {
    if (animatingElement || history.length === 0) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
    const last = history[history.length - 1];
    setStack(last.stack);
    setIndex(last.index);
    setStepList(last.stepList);
    setIsValid(last.isValid);
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStack([]);
    setStepList([]);
    setIndex(0);
    setIsValid(null);
    setHistory([]);
    setAnimatingElement(null);
    setNextState(null);
    setIsPlaying(false);
    showSnackbar("Visualizer has been reset", "info");
  };

  const runAllSteps = () => {
    if (animatingElement || isValid !== null) return;
    setIsPlaying(true);

    intervalRef.current = setInterval(() => {
      setIndex((prevIndex) => {
        if (prevIndex >= tokens.length) {
          clearInterval(intervalRef.current);
          setIsPlaying(false);
          setStack((currentStack) => {
            if (currentStack.length === 0) {
              setIsValid(true);
              playSound("success");
              showSnackbar("Parentheses are valid!", "success");
            } else {
              setIsValid(false);
              playSound("fail");
              showSnackbar("Invalid: Unmatched opening brackets remain.", "error");
            }
            return currentStack;
          });
          return prevIndex;
        }

        playSound("step");

        const token = tokens[prevIndex];
        setStack((currentStack) => {
          const newStack = [...currentStack];
          const lastOpen = newStack.length > 0 ? newStack[newStack.length - 1] : undefined;
          const isMatch =
            (lastOpen === "(" && token === ")") ||
            (lastOpen === "{" && token === "}") ||
            (lastOpen === "[" && token === "]");

          if (["(", "{", "["].includes(token)) {
            newStack.push(token);
            setStepList((prev) => [...prev, `Pushed '${token}' to stack.`]);
          } else if (isMatch) {
            newStack.pop();
            setStepList((prev) => [...prev, `Matched '${lastOpen}' with '${token}'. Popping.`]);
          } else {
            setStepList((prev) => [
              ...prev,
              `Mismatch! Stack top: '${lastOpen}', current: '${token}'.`
            ]);
            setIsValid(false);
            playSound("fail");
            showSnackbar("Invalid: Mismatched brackets!", "error");
            clearInterval(intervalRef.current);
            setIsPlaying(false);
          }
          return newStack;
        });

        return prevIndex + 1;
      });
    }, 600);
  };

  const stackContainerHeight = MAX_STACK_SIZE * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN;
  const currentAnimation =
    animatingElement?.type === "push" ? pushAnimation(stack.length) : popAnimation(stack.length);

  return (
    <>
      <Box sx={{ bgcolor: "background.default", width: "100%", p: { xs: 2, md: 3 } }}>
        <Typography variant="h5" align="center" sx={{ mb: 3 }} color="text.primary">
          Valid Parentheses - Example 2
        </Typography>

        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                height: "100%",
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Box ref={canvasRef} sx={{ width: "100%", height: "120px", mb: 3 }} />
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography variant="h6" sx={{ mb: 1, fontSize: "1.1rem" }} color="text.primary">
                  Stack
                </Typography>
                <Box
                  sx={{
                    width: "120px",
                    height: `${stackContainerHeight}px`,
                    position: "relative",
                    bgcolor: colors.stackContainer.bg,
                    borderRadius: "12px",
                    border: `1px solid ${colors.stackContainer.border}`,
                    boxShadow: `inset 5px 5px 10px ${colors.stackContainer.shadowDark}, inset -5px -5px 10px ${colors.stackContainer.shadowLight}`
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
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
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
                          <ArrowUpwardIcon sx={{ color: "error.main", mb: 0.5 }} />
                        )}
                        <Box
                          sx={{
                            bgcolor: "secondary.light",
                            color: "primary.contrastText",
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
                          <ArrowDownwardIcon sx={{ color: "success.main", mt: 0.5 }} />
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
                        color: "#616161"
                      }}
                    >
                      Empty
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: { xs: 2, md: 2.5 },
                height: "100%",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <Stack spacing={2.5} sx={{ flexGrow: 1 }}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }} color="text.primary">
                    Controls
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        startIcon={<PlayForWorkIcon />}
                        onClick={runAllSteps}
                        disabled={!!animatingElement || isValid !== null}
                      >
                        Run All
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ArrowForwardIcon />}
                        onClick={performStep}
                        disabled={!!animatingElement || isValid !== null}
                      >
                        Next
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={undoStep}
                        disabled={!!animatingElement || history.length === 0}
                      >
                        Prev
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
                <Divider />
                <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Typography variant="h6" color="text.primary">
                      Execution Log
                    </Typography>
                    <Tooltip title="Reset">
                      <IconButton onClick={handleReset} color="error" disabled={!!animatingElement}>
                        <RestartAltIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box
                    sx={{
                      flexGrow: 1,
                      minHeight: 200,
                      bgcolor:
                        theme.palette.mode === "dark" || theme.palette.type === "dark"
                          ? "#171717"
                          : "grey.50",
                      borderRadius: 1,
                      p: 1.5,
                      border: "1px solid #eee",
                      mt: 1
                    }}
                  >
                    <TextField
                      value={
                        stepList.length > 0 ? stepList.join("\n") : "Click a control to start..."
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
                          height: "100% !important"
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
                  onClick={() => navigator.clipboard.writeText(stepList.join("\n"))}
                >
                  Copy Log
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
        {/* --- MODIFICATION: Removed the <Snackbar> component from here --- */}
      </Box>
    </>
  );
};

export default VP_EX2;

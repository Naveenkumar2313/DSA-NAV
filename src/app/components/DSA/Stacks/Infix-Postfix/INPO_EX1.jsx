import React, { useState, useRef, useEffect } from "react";
import p5 from "p5";

// --- Sound Imports ---
const stepSoundFile = "/DSA/step.mp3";
const successSoundFile = "/DSA/success.mp3";
const failSoundFile = "/DSA/fail.mp3";

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
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

// --- Constants & Keyframes from ST_OP for Stack Visualization ---
const ELEMENT_HEIGHT = 40; // px
const ELEMENT_MARGIN = 8; // px
const TOTAL_ELEMENT_SPACE = ELEMENT_HEIGHT + ELEMENT_MARGIN;
const MAX_STACK_SIZE = 6;

const pushAnimation = (stackSize) => keyframes`
  from {
    bottom: 100%;
    opacity: 0.7;
  }
  to {
    bottom: ${stackSize * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN}px;
    opacity: 1;
  }
`;

const popAnimation = (stackSize) => keyframes`
  from {
    bottom: ${stackSize * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN}px;
    opacity: 1;
  }
  to {
    bottom: 100%;
    opacity: 0;
  }
`;

// --- Core Infix to Postfix Logic ---
const precedence = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
  "^": 3
};

const isOperator = (char) => ["+", "-", "*", "/", "^"].includes(char);
const isOperand = (char) => /^[a-zA-Z0-9]$/.test(char);

// --- MODIFICATION: Component now accepts 'showSnackbar' as a prop ---
const INPO_EX1 = ({ showSnackbar }) => {
  const theme = useTheme();
  const canvasRef = useRef();
  const [expression] = useState("A+B*C/D");
  const [tokens, setTokens] = useState([]);
  const [index, setIndex] = useState(0);
  const [stack, setStack] = useState([]);
  const [output, setOutput] = useState([]);
  const [stepList, setStepList] = useState([]);
  const [history, setHistory] = useState([]);
  const logInputRef = useRef(null);

  // --- MODIFICATION: Removed snackbar state ---
  const [animatingElement, setAnimatingElement] = useState(null);
  const [nextState, setNextState] = useState(null);
  const [isFlushing, setIsFlushing] = useState(false);

  const stepSound = useRef(new Audio(stepSoundFile));
  const successSound = useRef(new Audio(successSoundFile));
  const failSound = useRef(new Audio(failSoundFile));

  useEffect(() => {
    if (logInputRef.current) {
      const logElement = logInputRef.current;
      logElement.scrollTop = logElement.scrollHeight;
    }
  }, [stepList]);

  useEffect(() => {
    setTokens(expression.split(""));
    const sketch = new p5((p) => {
      let parentDiv;
      p.setup = () => {
        parentDiv = canvasRef.current;
        const canvas = p.createCanvas(parentDiv.offsetWidth, parentDiv.offsetHeight);
        canvas.parent(parentDiv);
      };

      p.windowResized = () => {
        if (parentDiv) {
          p.resizeCanvas(parentDiv.offsetWidth, parentDiv.offsetHeight);
        }
      };

      p.draw = () => {
        p.background(theme.palette.background.paper);
        drawOutput(p);
      };
      const drawOutput = (p) => {
        p.fill(theme.palette.text.primary);
        p.textSize(18);
        p.textAlign(p.LEFT, p.CENTER);
        p.noStroke();
        p.text("Postfix Output:", 10, 20);

        const boxSize = 40;
        const spacing = 45;
        const startY = 80;
        const startX = 10;

        output.forEach((item, i) => {
          const xPos = startX + i * spacing;
          const yPos = startY;

          p.fill(theme.palette.success.light);
          p.stroke(theme.palette.text.primary);
          p.rect(xPos, yPos, boxSize, boxSize, 6);
          p.fill(theme.palette.getContrastText(theme.palette.success.light));
          p.noStroke();
          p.textAlign(p.CENTER, p.CENTER);
          p.text(item, xPos + boxSize / 2, yPos + boxSize / 2);
        });

        if (output.length === 0) {
          p.fill(theme.palette.text.disabled);
          p.textAlign(p.CENTER, p.CENTER);
          p.text("Empty", p.width / 2, startY + boxSize / 2);
        }
      };
    });
    return () => sketch.remove();
  }, [expression, output, theme]);

  useEffect(() => {
    if (isFlushing && stack.length > 0 && !animatingElement) {
      const poppedValue = stack[stack.length - 1];
      const newStack = stack.slice(0, -1);

      setStepList((prev) => [
        ...prev,
        `Popped '${poppedValue}' from stack to output (final flush).`
      ]);
      setOutput((prev) => [...prev, poppedValue]);
      setStack(newStack);
      setAnimatingElement({ value: poppedValue, type: "pop" });
    } else if (isFlushing && stack.length === 0 && !animatingElement) {
      setIsFlushing(false);
      successSound.current.play();
      showSnackbar("Conversion Complete!", "success");
    }
  }, [isFlushing, stack, animatingElement, showSnackbar]);

  // --- MODIFICATION: Removed local showSnackbar and handleCloseSnackbar functions ---

  const handleAnimationEnd = () => {
    if (nextState) {
      setStack(nextState.stack);
      setOutput(nextState.output);
      setStepList(nextState.stepList);
      setIndex(nextState.index);
      setHistory(nextState.history);
      setNextState(null);
    }
    setAnimatingElement(null);
  };

  const performStep = () => {
    if (animatingElement || isFlushing) return;

    if (index >= tokens.length) {
      if (stack.length > 0) {
        setIsFlushing(true);
      } else {
        showSnackbar("Conversion is already complete!", "info");
      }
      return;
    }

    const token = tokens[index];
    let newStack = [...stack];
    let newOutput = [...output];
    let newStepList = [...stepList];
    let poppedForPrecedence = false;
    let poppedValue = null;

    stepSound.current.currentTime = 0;
    stepSound.current.play();

    if (isOperand(token)) {
      newOutput.push(token);
      newStepList.push(`Added operand '${token}' to output`);
    } else if (isOperator(token)) {
      while (newStack.length && precedence[newStack[newStack.length - 1]] >= precedence[token]) {
        poppedValue = newStack.pop();
        newOutput.push(poppedValue);
        newStepList.push(`Popped '${poppedValue}' to output (precedence)`);
        poppedForPrecedence = true;
      }
      newStack.push(token);
      newStepList.push(`Pushed operator '${token}' to stack`);
    }

    const finalHistory = [...history, { stack, output, index }];

    const didPush = newStack.length > stack.length;

    if (poppedForPrecedence) {
      const intermediateStack = stack.slice(0, -1);
      setNextState({
        stack: newStack,
        output: newOutput,
        index: index + 1,
        stepList: newStepList,
        history: finalHistory
      });
      setStack(intermediateStack);
      setAnimatingElement({ value: poppedValue, type: "pop" });
    } else if (didPush) {
      setNextState({
        stack: newStack,
        output: newOutput,
        index: index + 1,
        stepList: newStepList,
        history: finalHistory
      });
      setAnimatingElement({ value: token, type: "push" });
    } else {
      setOutput(newOutput);
      setStepList(newStepList);
      setIndex(index + 1);
      setHistory(finalHistory);
    }
  };

  const undoStep = () => {
    if (animatingElement || history.length === 0) {
      if (!animatingElement) {
        failSound.current.play();
        showSnackbar("No previous steps to undo", "warning");
      }
      return;
    }
    const last = history[history.length - 1];
    setStack(last.stack);
    setOutput(last.output);
    setIndex(last.index);
    setStepList((prev) =>
      prev.slice(0, prev.lastIndexOf(`Pushed`) || prev.lastIndexOf(`Popped`) || prev.length)
    );
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    setStack([]);
    setOutput([]);
    setStepList([]);
    setIndex(0);
    setHistory([]);
    setAnimatingElement(null);
    setNextState(null);
    setIsFlushing(false);
    showSnackbar("Visualizer has been reset", "info");
  };

  const handleCopySteps = () => {
    if (stepList.length === 0) {
      showSnackbar("No steps to copy.", "warning");
      return;
    }
    navigator.clipboard
      .writeText(stepList.join("\n"))
      .then(() => showSnackbar("Steps copied to clipboard!", "success"))
      .catch(() => showSnackbar("Failed to copy steps.", "error"));
  };

  const stackContainerHeight = MAX_STACK_SIZE * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN;
  const currentAnimation =
    animatingElement?.type === "push" ? pushAnimation(stack.length) : popAnimation(stack.length);

  return (
    <Box
      sx={{ bgcolor: "background.default", minHeight: "100vh", width: "100%", p: { xs: 2, md: 3 } }}
    >
      <Typography variant="h5" align="center" sx={{ mb: 3 }} color="text.primary">
        Example 1
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
              justifyContent: "center",
              boxSizing: "border-box"
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, alignSelf: "center" }} color="text.primary">
              <b>Expression:</b> {expression}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                mt: 2,
                flexGrow: 1,
                gap: 4
              }}
            >
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography variant="h6" sx={{ mb: 1, fontSize: "1.1rem" }} color="text.primary">
                  Operator Stack
                </Typography>
                <Box
                  sx={{
                    width: "120px",
                    height: `${stackContainerHeight}px`,
                    position: "relative",
                    bgcolor: theme.palette.mode === "dark" ? "grey.800" : "grey.400",
                    borderRadius: "12px",
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? "inset 5px 5px 10px rgba(0,0,0,0.5), inset -5px -5px 10px rgba(255,255,255,0.05)"
                        : "inset 5px 5px 10px #9e9e9e, inset -5px -5px 10px #dcdcdc",
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
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          height: `${ELEMENT_HEIGHT}px`,
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: "1.2rem",
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
                            fontSize: "1.2rem",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
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
                        zIndex: 1,
                        userSelect: "none",
                        color: "text.secondary",
                        fontWeight: 500
                      }}
                    >
                      Stack is Empty
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box
                ref={canvasRef}
                sx={{
                  flex: 1,
                  height: "100%",
                  minHeight: "250px"
                }}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{ p: { xs: 2, md: 2.5 }, height: "100%", display: "flex", flexDirection: "column" }}
          >
            <Stack spacing={2.5} sx={{ flexGrow: 1 }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }} color="text.primary">
                  Controls
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ArrowForwardIcon />}
                      onClick={performStep}
                      disabled={!!animatingElement}
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
                      disabled={!!animatingElement}
                    >
                      Prev Step
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
                  <Tooltip title="Reset Visualizer & Log">
                    <IconButton
                      onClick={handleReset}
                      color="error"
                      disabled={!!animatingElement || isFlushing}
                    >
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
                    border: `1px solid ${theme.palette.divider}`,
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
                        color: stepList.length === 0 ? "text.disabled" : "text.primary"
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

      {/* --- MODIFICATION: Removed the <Snackbar> component from here --- */}
    </Box>
  );
};

export default INPO_EX1;

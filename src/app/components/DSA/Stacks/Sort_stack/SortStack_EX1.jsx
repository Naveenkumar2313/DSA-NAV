import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  keyframes,
  TextField,
  useTheme
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const stepSoundFile = "/DSA/step.mp3";
const successSoundFile = "/DSA/success.mp3";

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

// Pre-compute all steps for [5, 1, 4, 2]
function computeSortSteps(initial) {
  const steps = [];
  let main = [...initial];
  let tmp = [];

  steps.push({
    main: [...main],
    tmp: [...tmp],
    held: null,
    description: "Initial state. We'll sort the stack so the smallest is on top.",
    phase: "start"
  });

  while (main.length > 0) {
    const curr = main.pop();
    steps.push({
      main: [...main],
      tmp: [...tmp],
      held: curr,
      description: `Pop '${curr}' from main stack. Hold it.`,
      phase: "pop_main"
    });

    while (tmp.length > 0 && tmp[tmp.length - 1] > curr) {
      const moved = tmp.pop();
      steps.push({
        main: [...main],
        tmp: [...tmp],
        held: curr,
        movingFromTmp: moved,
        description: `Temp top '${moved}' > held '${curr}'. Move '${moved}' back to main.`,
        phase: "move_back"
      });
      main.push(moved);
      steps.push({
        main: [...main],
        tmp: [...tmp],
        held: curr,
        description: `Pushed '${moved}' back to main stack.`,
        phase: "pushed_back"
      });
    }

    tmp.push(curr);
    steps.push({
      main: [...main],
      tmp: [...tmp],
      held: null,
      description: `Push '${curr}' onto temp stack (correct position found).`,
      phase: "push_tmp"
    });
  }

  steps.push({
    main: [...main],
    tmp: [...tmp],
    held: null,
    description: "Main stack is empty. Now moving sorted elements back to main stack.",
    phase: "transfer_start"
  });

  while (tmp.length > 0) {
    const val = tmp.pop();
    steps.push({
      main: [...main],
      tmp: [...tmp],
      held: val,
      description: `Move '${val}' from temp back to main stack.`,
      phase: "transfer"
    });
    main.push(val);
    steps.push({
      main: [...main],
      tmp: [...tmp],
      held: null,
      description: `Pushed '${val}' onto main stack.`,
      phase: "transfer_push"
    });
  }

  steps.push({
    main: [...main],
    tmp: [...tmp],
    held: null,
    description: `✅ Done! Stack is sorted (smallest on top: ${[...main].reverse().join(", ")}).`,
    phase: "done"
  });

  return steps;
}

const INITIAL_STACK = [2, 4, 1, 5]; // bottom to top

const SortStack_EX1 = ({ showSnackbar }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const allSteps = useRef(computeSortSteps(INITIAL_STACK));
  const [stepIndex, setStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [stepList, setStepList] = useState([allSteps.current[0].description]);
  const logInputRef = useRef(null);
  const stepSound = useRef(new Audio(stepSoundFile));
  const successSound = useRef(new Audio(successSoundFile));
  const autoRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  const colors = {
    mainStack: isDark ? "#3b82f6" : "#2196f3",
    tmpStack: isDark ? "#a78bfa" : "#673ab7",
    held: isDark ? "#fbbf24" : "#f59e0b",
    stackBg: isDark ? "#1a1a1a" : "#bdbdbd",
    paper: isDark ? "#222A45" : "#ffffff",
    text: isDark ? "#f1f5f9" : "#1e3a8a",
    logBg: isDark ? "#000000" : "#fafafa"
  };

  useEffect(() => {
    if (logInputRef.current) {
      logInputRef.current.scrollTop = logInputRef.current.scrollHeight;
    }
  }, [stepList]);

  const currentStep = allSteps.current[stepIndex];
  const stackContainerHeight = MAX_STACK_SIZE * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN;

  const goNext = () => {
    if (stepIndex >= allSteps.current.length - 1) return;
    stepSound.current.currentTime = 0;
    stepSound.current.play().catch(() => {});
    const next = stepIndex + 1;
    const nextStep = allSteps.current[next];
    setStepIndex(next);
    setStepList((prev) => [...prev, nextStep.description]);
    if (nextStep.phase === "done") {
      successSound.current.play().catch(() => {});
      setIsComplete(true);
      showSnackbar("Stack sorted successfully!", "success");
    }
  };

  const goPrev = () => {
    if (stepIndex <= 0) {
      showSnackbar("No previous steps to undo.", "warning");
      return;
    }
    setStepIndex((prev) => prev - 1);
    setStepList((prev) => prev.slice(0, -1));
    setIsComplete(false);
  };

  const handleReset = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    setIsRunning(false);
    setStepIndex(0);
    setIsComplete(false);
    setStepList([allSteps.current[0].description]);
    showSnackbar("Visualizer has been reset.", "info");
  };

  const handleRunAll = () => {
    if (isRunning) {
      clearInterval(autoRef.current);
      setIsRunning(false);
      return;
    }
    setIsRunning(true);
    autoRef.current = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= allSteps.current.length - 1) {
          clearInterval(autoRef.current);
          setIsRunning(false);
          setIsComplete(true);
          successSound.current.play().catch(() => {});
          showSnackbar("Stack sorted successfully!", "success");
          return prev;
        }
        const next = prev + 1;
        stepSound.current.currentTime = 0;
        stepSound.current.play().catch(() => {});
        setStepList((logs) => [...logs, allSteps.current[next].description]);
        return next;
      });
    }, 700);
  };

  useEffect(() => () => clearInterval(autoRef.current), []);

  const renderStack = (items, color, label) => (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="subtitle2" sx={{ mb: 1, color: colors.text, fontWeight: 600 }}>
        {label}
      </Typography>
      <Box
        sx={{
          width: "100px",
          height: `${stackContainerHeight}px`,
          position: "relative",
          bgcolor: colors.stackBg,
          borderRadius: "12px",
          border: "1px solid #e0e0e0",
          boxShadow: isDark
            ? "inset 5px 5px 10px #0a0a0a, inset -5px -5px 10px #2a2a2a"
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
            left: "6px",
            right: "6px",
            height: "100%",
            overflow: "hidden"
          }}
        >
          {items.map((value, idx) => (
            <Box
              key={idx}
              sx={{
                position: "absolute",
                bottom: `${idx * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN}px`,
                width: "100%",
                bgcolor: color,
                color: "#fff",
                height: `${ELEMENT_HEIGHT}px`,
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "1rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}
            >
              {value}
            </Box>
          ))}
        </Box>
        {items.length === 0 && (
          <Typography variant="caption" sx={{ color: isDark ? "#666" : "#999", zIndex: 1 }}>
            Empty
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: "background.default", width: "100%", p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" align="center" sx={{ mb: 3 }} color="text.primary">
        Example 1 — Sort [5, 1, 4, 2]
      </Typography>

      <Grid container spacing={3} alignItems="stretch">
        {/* Visualization Panel */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              height: "100%",
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: colors.paper
            }}
          >
            {/* Held element */}
            <Box
              sx={{
                mb: 3,
                minHeight: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2
              }}
            >
              {currentStep.held !== null ? (
                <>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    Holding:
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: colors.held,
                      color: "#fff",
                      width: 56,
                      height: 40,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
                    }}
                  >
                    {currentStep.held}
                  </Box>
                </>
              ) : (
                <Typography variant="body2" sx={{ color: isDark ? "#666" : "#bbb" }}>
                  Nothing held
                </Typography>
              )}
            </Box>

            {/* Two stacks side by side */}
            <Box sx={{ display: "flex", gap: 6, justifyContent: "center", width: "100%" }}>
              {renderStack(currentStep.main, colors.mainStack, "Main Stack")}
              {renderStack(currentStep.tmp, colors.tmpStack, "Temp Stack")}
            </Box>

            {/* Step description */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: isDark ? "#1a1a1a" : "#f1f5f9",
                borderRadius: 2,
                width: "100%",
                textAlign: "center"
              }}
            >
              <Typography variant="body2" sx={{ color: colors.text, fontStyle: "italic" }}>
                {currentStep.description}
              </Typography>
            </Box>

            {isComplete && (
              <Alert severity="success" sx={{ mt: 2, width: "100%" }} variant="filled">
                Stack sorted! Smallest element is now on top.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Controls Panel */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: { xs: 2, md: 2.5 },
              height: "100%",
              display: "flex",
              flexDirection: "column",
              bgcolor: colors.paper
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
                      startIcon={<PlayArrowIcon />}
                      onClick={handleRunAll}
                    >
                      {isRunning ? "Pause" : "Run All"}
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ArrowForwardIcon />}
                      onClick={goNext}
                      disabled={isRunning || stepIndex >= allSteps.current.length - 1}
                    >
                      Next
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      onClick={goPrev}
                      disabled={isRunning || stepIndex <= 0}
                    >
                      Prev
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              <Divider />
              <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="h6" color="text.primary">
                    Execution Log
                  </Typography>
                  <Tooltip title="Reset Visualizer">
                    <IconButton onClick={handleReset} color="error" disabled={isRunning}>
                      <RestartAltIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box
                  sx={{
                    flexGrow: 1,
                    minHeight: 200,
                    bgcolor: colors.logBg,
                    borderRadius: 1,
                    p: 1.5,
                    border: `1px solid ${isDark ? "#333" : "#eee"}`,
                    mt: 1
                  }}
                >
                  <TextField
                    value={stepList.length > 0 ? stepList.join("\n") : "Click Next Step to begin..."}
                    multiline
                    fullWidth
                    variant="standard"
                    inputRef={logInputRef}
                    sx={{
                      height: "100%",
                      "& .MuiInputBase-root": { height: "100%", alignItems: "flex-start" },
                      "& .MuiInputBase-input": {
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                        overflowY: "auto !important",
                        height: "100% !important",
                        color: isDark ? "#cbd5e1" : "#475569"
                      }
                    }}
                    InputProps={{ disableUnderline: true, readOnly: true }}
                  />
                </Box>
              </Box>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={() => {
                  if (!stepList.length) { showSnackbar("No steps to copy.", "warning"); return; }
                  navigator.clipboard
                    .writeText(stepList.join("\n"))
                    .then(() => showSnackbar("Log copied!", "success"))
                    .catch(() => showSnackbar("Copy failed.", "error"));
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

export default SortStack_EX1;

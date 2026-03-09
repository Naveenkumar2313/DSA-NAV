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
  TextField,
  useTheme
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const stepSoundFile = "/DSA/step.mp3";
const successSoundFile = "/DSA/success.mp3";

const ELEMENT_HEIGHT = 38;
const ELEMENT_MARGIN = 6;
const TOTAL_ELEMENT_SPACE = ELEMENT_HEIGHT + ELEMENT_MARGIN;
const MAX_STACK_SIZE = 8;

function computeSortSteps(initial) {
  const steps = [];
  let main = [...initial];
  let tmp = [];

  steps.push({
    main: [...main],
    tmp: [...tmp],
    held: null,
    description: `Initial state. Main stack (top→bottom): ${[...main].reverse().join(", ")}. We will sort ascending (smallest on top).`,
    phase: "start"
  });

  while (main.length > 0) {
    const curr = main.pop();
    steps.push({
      main: [...main],
      tmp: [...tmp],
      held: curr,
      description: `Pop '${curr}' from main stack. Now holding it for correct placement.`,
      phase: "pop_main"
    });

    let moved = false;
    while (tmp.length > 0 && tmp[tmp.length - 1] > curr) {
      const top = tmp.pop();
      steps.push({
        main: [...main],
        tmp: [...tmp],
        held: curr,
        movingFromTmp: top,
        description: `Temp top '${top}' > held '${curr}' — move '${top}' back to main.`,
        phase: "move_back"
      });
      main.push(top);
      steps.push({
        main: [...main],
        tmp: [...tmp],
        held: curr,
        description: `'${top}' is now back on main stack.`,
        phase: "pushed_back"
      });
      moved = true;
    }

    if (!moved && tmp.length > 0) {
      steps.push({
        main: [...main],
        tmp: [...tmp],
        held: curr,
        description: `Temp top '${tmp[tmp.length - 1]}' ≤ '${curr}' — correct position found. Push '${curr}' to temp.`,
        phase: "position_found"
      });
    }

    tmp.push(curr);
    steps.push({
      main: [...main],
      tmp: [...tmp],
      held: null,
      description: `Pushed '${curr}' onto temp stack.`,
      phase: "push_tmp"
    });
  }

  steps.push({
    main: [...main],
    tmp: [...tmp],
    held: null,
    description: "Main stack exhausted. Temp stack is now sorted (largest on top). Transferring back.",
    phase: "transfer_start"
  });

  while (tmp.length > 0) {
    const val = tmp.pop();
    steps.push({
      main: [...main],
      tmp: [...tmp],
      held: val,
      description: `Transfer '${val}' from temp → main.`,
      phase: "transfer"
    });
    main.push(val);
    steps.push({
      main: [...main],
      tmp: [...tmp],
      held: null,
      description: `'${val}' pushed to main.`,
      phase: "transfer_push"
    });
  }

  steps.push({
    main: [...main],
    tmp: [...tmp],
    held: null,
    description: `✅ Sorting complete! Main stack sorted (top→bottom): ${[...main].reverse().join(", ")}.`,
    phase: "done"
  });

  return steps;
}

const INITIAL_STACK = [23, 92, 98, 31, 3, 34]; // bottom to top

const SortStack_EX2 = ({ showSnackbar }) => {
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
    mainStack: isDark ? "#3b82f6" : "#1976d2",
    tmpStack: isDark ? "#a78bfa" : "#673ab7",
    held: isDark ? "#fbbf24" : "#f59e0b",
    doneColor: isDark ? "#4ade80" : "#22c55e",
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
    setStepIndex(next);
    setStepList((prev) => [...prev, allSteps.current[next].description]);
    if (allSteps.current[next].phase === "done") {
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
    setStepIndex((p) => p - 1);
    setStepList((p) => p.slice(0, -1));
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
    }, 650);
  };

  useEffect(() => () => clearInterval(autoRef.current), []);

  const renderStack = (items, color, label) => (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="subtitle2" sx={{ mb: 1, color: colors.text, fontWeight: 600 }}>
        {label}
      </Typography>
      <Box
        sx={{
          width: "90px",
          height: `${stackContainerHeight}px`,
          position: "relative",
          bgcolor: colors.stackBg,
          borderRadius: "12px",
          border: "1px solid #e0e0e0",
          boxShadow: isDark
            ? "inset 5px 5px 10px #0a0a0a, inset -5px -5px 10px #2a2a2a"
            : "inset 5px 5px 10px #9e9e9e, inset -5px -5px 10px #dcdcdc"
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
                bgcolor: isComplete ? colors.doneColor : color,
                color: "#fff",
                height: `${ELEMENT_HEIGHT}px`,
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "0.95rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                transition: "background-color 0.4s"
              }}
            >
              {value}
            </Box>
          ))}
        </Box>
        {items.length === 0 && (
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              color: isDark ? "#666" : "#999"
            }}
          >
            Empty
          </Typography>
        )}
      </Box>
      <Typography variant="caption" sx={{ mt: 0.5, color: isDark ? "#94a3b8" : "#607d8b" }}>
        size: {items.length}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: "background.default", width: "100%", p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" align="center" sx={{ mb: 3 }} color="text.primary">
        Example 2 — Sort [34, 3, 31, 98, 92, 23]
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
              bgcolor: colors.paper
            }}
          >
            {/* Step counter */}
            <Typography variant="caption" sx={{ color: isDark ? "#94a3b8" : "#607d8b", mb: 2 }}>
              Step {stepIndex + 1} of {allSteps.current.length}
            </Typography>

            {/* Held element */}
            <Box
              sx={{
                mb: 3,
                minHeight: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                p: 1.5,
                borderRadius: 2,
                bgcolor: isDark ? "#1a1a1a" : "#f8fafc",
                width: "100%"
              }}
            >
              <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600, minWidth: 70 }}>
                Holding:
              </Typography>
              {currentStep.held !== null ? (
                <Box
                  sx={{
                    bgcolor: colors.held,
                    color: "#fff",
                    width: 60,
                    height: 42,
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
              ) : (
                <Typography variant="body2" sx={{ color: isDark ? "#555" : "#bbb" }}>
                  —
                </Typography>
              )}
            </Box>

            {/* Two stacks */}
            <Box sx={{ display: "flex", gap: 8, justifyContent: "center", width: "100%", flexWrap: "wrap" }}>
              {renderStack(currentStep.main, colors.mainStack, "Main Stack")}
              {renderStack(currentStep.tmp, colors.tmpStack, "Temp Stack")}
            </Box>

            {/* Description */}
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
                Stack sorted! Ascending order with smallest element on top.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Controls */}
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
                  <Tooltip title="Reset">
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
                    value={stepList.join("\n")}
                    multiline
                    fullWidth
                    variant="standard"
                    inputRef={logInputRef}
                    sx={{
                      height: "100%",
                      "& .MuiInputBase-root": { height: "100%", alignItems: "flex-start" },
                      "& .MuiInputBase-input": {
                        fontFamily: "monospace",
                        fontSize: "0.78rem",
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

export default SortStack_EX2;

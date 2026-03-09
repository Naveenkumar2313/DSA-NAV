import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  useTheme,
  keyframes,
  Chip
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const stepSoundFile = "/DSA/step.mp3";
const successSoundFile = "/DSA/success.mp3";

const ELEMENT_HEIGHT = 40;
const ELEMENT_MARGIN = 8;
const TOTAL_ELEMENT_SPACE = ELEMENT_HEIGHT + ELEMENT_MARGIN;
const MAX_STACK_SIZE = 8;

const getColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark";
  return {
    bg: isDark ? "#222A45" : "#eceff1",
    paper: isDark ? "#222A45" : "#ffffff",
    mainStack: isDark ? "#3b82f6" : "#2196f3",
    tmpStack: isDark ? "#a78bfa" : "#673ab7",
    held: isDark ? "#fbbf24" : "#f59e0b",
    doneStack: isDark ? "#4ade80" : "#22c55e",
    stackBg: isDark ? "#1a1a1a" : "#bdbdbd",
    stackShadow: isDark
      ? "inset 5px 5px 10px #0a0a0a, inset -5px -5px 10px #2a2a2a"
      : "inset 5px 5px 10px #9e9e9e, inset -5px -5px 10px #dcdcdc",
    text: isDark ? "#f1f5f9" : "#1e3a8a",
    textSecondary: isDark ? "#94a3b8" : "#546e7a",
    logBg: isDark ? "#000000" : "#fafafa",
    border: isDark ? "#333333" : "#eee",
    infoBg: isDark ? "#1a1a1a" : "#f1f5f9"
  };
};

function computeSortSteps(initial) {
  const steps = [];
  let main = [...initial];
  let tmp = [];

  steps.push({ main: [...main], tmp: [...tmp], held: null, description: `Initial state. Input (top→bottom): ${[...main].reverse().join(", ")}`, phase: "start" });

  while (main.length > 0) {
    const curr = main.pop();
    steps.push({ main: [...main], tmp: [...tmp], held: curr, description: `Pop '${curr}' from main stack.`, phase: "pop_main" });

    while (tmp.length > 0 && tmp[tmp.length - 1] > curr) {
      const top = tmp.pop();
      steps.push({ main: [...main], tmp: [...tmp], held: curr, description: `Temp top '${top}' > '${curr}' → move '${top}' back to main.`, phase: "move_back" });
      main.push(top);
      steps.push({ main: [...main], tmp: [...tmp], held: curr, description: `'${top}' pushed back to main.`, phase: "pushed_back" });
    }

    tmp.push(curr);
    steps.push({ main: [...main], tmp: [...tmp], held: null, description: `Pushed '${curr}' onto temp stack.`, phase: "push_tmp" });
  }

  steps.push({ main: [...main], tmp: [...tmp], held: null, description: "Main empty. Transferring sorted elements back to main.", phase: "transfer_start" });

  while (tmp.length > 0) {
    const val = tmp.pop();
    steps.push({ main: [...main], tmp: [...tmp], held: val, description: `Transfer '${val}' from temp → main.`, phase: "transfer" });
    main.push(val);
    steps.push({ main: [...main], tmp: [...tmp], held: null, description: `'${val}' on main stack.`, phase: "transfer_push" });
  }

  steps.push({ main: [...main], tmp: [...tmp], held: null, description: `✅ Sorted! (top→bottom): ${[...main].reverse().join(", ")}`, phase: "done" });
  return steps;
}

const DEFAULT_INPUT = "5 3 8 1 6";

const SortStackLab = ({ showSnackbar }) => {
  const theme = useTheme();
  const colors = getColors(theme);
  const isDark = theme.palette.mode === "dark";

  const [inputValue, setInputValue] = useState(DEFAULT_INPUT);
  const [allSteps, setAllSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isSimStarted, setIsSimStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [stepList, setStepList] = useState([]);
  const [history, setHistory] = useState([]);

  const logInputRef = useRef(null);
  const stepSound = useRef(new Audio(stepSoundFile));
  const successSound = useRef(new Audio(successSoundFile));
  const autoRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (logInputRef.current) logInputRef.current.scrollTop = logInputRef.current.scrollHeight;
  }, [stepList]);

  useEffect(() => () => clearInterval(autoRef.current), []);

  const parseInput = (val) => {
    return val
      .split(/[\s,]+/)
      .map((s) => parseInt(s, 10))
      .filter((n) => !isNaN(n));
  };

  const handleSetStack = () => {
    const nums = parseInput(inputValue);
    if (nums.length === 0) { showSnackbar("Enter valid numbers.", "warning"); return; }
    if (nums.length > MAX_STACK_SIZE) { showSnackbar(`Max ${MAX_STACK_SIZE} elements allowed.`, "error"); return; }
    const steps = computeSortSteps([...nums].reverse()); // reverse so first input = bottom
    setAllSteps(steps);
    setStepIndex(0);
    setIsSimStarted(true);
    setIsComplete(false);
    setStepList([steps[0].description]);
    setHistory([]);
    showSnackbar("Stack set! Click 'Next Step' to begin.", "success");
  };

  const handleGenerate = () => {
    const len = Math.floor(Math.random() * 4) + 4;
    const nums = Array.from({ length: len }, () => Math.floor(Math.random() * 90) + 10);
    setInputValue(nums.join(" "));
  };

  const currentStep = allSteps[stepIndex] || null;
  const stackContainerHeight = MAX_STACK_SIZE * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN;

  const goNext = () => {
    if (!isSimStarted || stepIndex >= allSteps.length - 1) return;
    stepSound.current.currentTime = 0;
    stepSound.current.play().catch(() => {});
    const next = stepIndex + 1;
    setHistory((h) => [...h, stepIndex]);
    setStepIndex(next);
    setStepList((l) => [...l, allSteps[next].description]);
    if (allSteps[next].phase === "done") {
      successSound.current.play().catch(() => {});
      setIsComplete(true);
      showSnackbar("Stack sorted successfully!", "success");
    }
  };

  const goPrev = () => {
    if (history.length === 0) { showSnackbar("No previous steps to undo.", "warning"); return; }
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setStepIndex(prev);
    setStepList((l) => l.slice(0, -1));
    setIsComplete(false);
  };

  const handleReset = (notify = true) => {
    if (autoRef.current) clearInterval(autoRef.current);
    setIsRunning(false);
    setAllSteps([]);
    setStepIndex(-1);
    setIsSimStarted(false);
    setIsComplete(false);
    setStepList([]);
    setHistory([]);
    if (notify) showSnackbar("Simulator reset.", "info");
  };

  const handleRunAll = () => {
    if (!isSimStarted) return;
    if (isRunning) { clearInterval(autoRef.current); setIsRunning(false); return; }
    setIsRunning(true);
    autoRef.current = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= allSteps.length - 1) {
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
        setStepList((logs) => [...logs, allSteps[next].description]);
        return next;
      });
    }, 650);
  };

  const renderStack = (items, color, label) => (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="subtitle2" sx={{ mb: 1, color: colors.text, fontWeight: 700, fontSize: "0.8rem" }}>
        {label}
      </Typography>
      <Box
        sx={{
          width: "96px",
          height: `${stackContainerHeight}px`,
          position: "relative",
          bgcolor: colors.stackBg,
          borderRadius: "12px",
          border: "1px solid #e0e0e0",
          boxShadow: colors.stackShadow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Box sx={{ position: "absolute", bottom: 0, left: "6px", right: "6px", height: "100%", overflow: "hidden" }}>
          {items.map((value, idx) => (
            <Box
              key={idx}
              sx={{
                position: "absolute",
                bottom: `${idx * TOTAL_ELEMENT_SPACE + ELEMENT_MARGIN}px`,
                width: "100%",
                bgcolor: isComplete && label === "Main Stack" ? colors.doneStack : color,
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
          <Typography variant="caption" sx={{ color: isDark ? "#555" : "#999", zIndex: 1, userSelect: "none" }}>
            Empty
          </Typography>
        )}
      </Box>
      <Typography variant="caption" sx={{ mt: 0.5, color: colors.textSecondary }}>
        {items.length} item{items.length !== 1 ? "s" : ""}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: colors.bg, minHeight: "100vh", width: "100%", p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" align="center" sx={{ mb: 3, color: colors.text }}>
        Simulator
      </Typography>

      <Grid container spacing={3} alignItems="stretch">
        {/* Visualization */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ height: "100%", p: 3, display: "flex", flexDirection: "column", alignItems: "center", bgcolor: colors.paper }}>

            {/* Input row */}
            <Box sx={{ width: "100%", mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, color: colors.text, fontWeight: 600 }}>
                Enter stack elements (space or comma separated, first = top):
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g. 5 3 8 1 6"
                  disabled={isSimStarted && !isComplete}
                  sx={{
                    "& .MuiOutlinedInput-root": { bgcolor: isDark ? "#1a1a1a" : "#f8fafc" },
                    "& .MuiInputBase-input": { color: colors.text }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleGenerate}
                  startIcon={<AutoFixHighIcon />}
                  sx={{ minWidth: 110, borderColor: colors.tmpStack, color: colors.tmpStack }}
                  disabled={isSimStarted && !isComplete}
                >
                  Random
                </Button>
                <Button
                  variant="contained"
                  onClick={isSimStarted ? handleReset : handleSetStack}
                  sx={{ minWidth: 80, bgcolor: isSimStarted ? "#ef4444" : colors.mainStack }}
                >
                  {isSimStarted ? "Reset" : "Set"}
                </Button>
              </Stack>
            </Box>

            {/* Held element indicator */}
            <Box
              sx={{
                mb: 3,
                minHeight: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                width: "100%",
                p: 1.5,
                borderRadius: 2,
                bgcolor: colors.infoBg
              }}
            >
              <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600, minWidth: 75 }}>
                Holding:
              </Typography>
              {currentStep?.held != null ? (
                <Box
                  sx={{
                    bgcolor: colors.held,
                    color: "#fff",
                    width: 58,
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
              ) : (
                <Typography variant="body2" sx={{ color: isDark ? "#555" : "#bbb" }}>
                  —
                </Typography>
              )}
              {isSimStarted && (
                <Typography variant="caption" sx={{ ml: "auto", color: colors.textSecondary }}>
                  Step {(stepIndex || 0) + 1}/{allSteps.length}
                </Typography>
              )}
            </Box>

            {/* Stacks */}
            {isSimStarted && currentStep ? (
              <Box sx={{ display: "flex", gap: { xs: 4, sm: 8 }, justifyContent: "center", width: "100%", flexWrap: "wrap" }}>
                {renderStack(currentStep.main, colors.mainStack, "Main Stack")}
                {renderStack(currentStep.tmp, colors.tmpStack, "Temp Stack")}
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexGrow: 1,
                  color: colors.textSecondary,
                  flexDirection: "column",
                  gap: 1
                }}
              >
                <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                  Enter elements and click <strong>Set</strong> to begin.
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  The algorithm uses a temp stack to sort in ascending order (smallest on top).
                </Typography>
              </Box>
            )}

            {/* Step description */}
            {currentStep && (
              <Box sx={{ mt: 3, p: 2, bgcolor: colors.infoBg, borderRadius: 2, width: "100%", textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: colors.text, fontStyle: "italic" }}>
                  {currentStep.description}
                </Typography>
              </Box>
            )}

            {isComplete && (
              <Alert
                severity="success"
                icon={<CheckCircleOutlineIcon />}
                sx={{ mt: 2, width: "100%" }}
                variant="filled"
              >
                Sorting complete! Main stack now has smallest element on top.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Controls */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: { xs: 2, md: 2.5 }, height: "100%", display: "flex", flexDirection: "column", bgcolor: colors.paper }}>
            <Stack spacing={2.5} sx={{ flexGrow: 1 }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: colors.text }}>
                  Controls
                </Typography>

                {/* Legend */}
                <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                  <Chip size="small" label="Main Stack" sx={{ bgcolor: colors.mainStack, color: "#fff" }} />
                  <Chip size="small" label="Temp Stack" sx={{ bgcolor: colors.tmpStack, color: "#fff" }} />
                  <Chip size="small" label="Held" sx={{ bgcolor: colors.held, color: "#fff" }} />
                </Box>

                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      startIcon={<PlayArrowIcon />}
                      onClick={handleRunAll}
                      disabled={!isSimStarted}
                    >
                      {isRunning ? "Pause" : "Run All Steps"}
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ bgcolor: colors.mainStack }}
                      onClick={goNext}
                      disabled={!isSimStarted || isRunning || isComplete || stepIndex >= allSteps.length - 1}
                    >
                      Next Step
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ borderColor: colors.mainStack, color: colors.mainStack }}
                      onClick={goPrev}
                      disabled={!isSimStarted || isRunning || history.length === 0}
                    >
                      Prev Step
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ borderColor: isDark ? "#333" : "#e2e8f0" }} />

              <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="h6" sx={{ color: colors.text }}>
                    Execution Log
                  </Typography>
                  <Tooltip title="Reset Simulator">
                    <IconButton onClick={() => handleReset(true)} sx={{ color: "#ef4444" }} disabled={isRunning}>
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
                    border: `1px solid ${colors.border}`,
                    mt: 1
                  }}
                >
                  <TextField
                    value={stepList.length > 0 ? stepList.join("\n") : "Set a stack and perform steps to see the log..."}
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
                        color: stepList.length === 0 ? colors.textSecondary : (isDark ? "#cbd5e1" : "#475569")
                      }
                    }}
                    InputProps={{ disableUnderline: true, readOnly: true }}
                  />
                </Box>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  sx={{ bgcolor: colors.tmpStack }}
                  startIcon={<ContentCopyIcon />}
                  onClick={() => {
                    if (!stepList.length) { showSnackbar("No steps to copy.", "warning"); return; }
                    navigator.clipboard.writeText(stepList.join("\n"))
                      .then(() => showSnackbar("Log copied!", "success"))
                      .catch(() => showSnackbar("Copy failed.", "error"));
                  }}
                >
                  Copy Log
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  sx={{ bgcolor: colors.tmpStack }}
                  startIcon={<ContentCopyIcon />}
                  onClick={() => {
                    const result = currentStep?.main ? [...currentStep.main].reverse().join(" ") : "";
                    if (!result) { showSnackbar("No result yet.", "warning"); return; }
                    navigator.clipboard.writeText(result)
                      .then(() => showSnackbar("Result copied!", "success"))
                      .catch(() => showSnackbar("Copy failed.", "error"));
                  }}
                >
                  Copy Result
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SortStackLab;

import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import p5 from "p5";
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Typography,
  Tooltip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha
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
const getSimulationColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";

  return {
    primary: {
      main: isDark ? "#60a5fa" : "#2c3e50"
    },
    info: {
      main: isDark ? "#4b5563" : "#e5e7e9"
    },
    success: {
      main: isDark ? "#34d399" : "#abebc6"
    },
    warning: {
      main: isDark ? "#fbbf24" : "#f9e79f"
    },
    error: {
      main: isDark ? "#f87171" : "#f5b7b1"
    },
    background: {
      default: isDark
        ? "linear-gradient(135deg, #222A45 0%, #222A45 100%)"
        : "linear-gradient(135deg, #f0f2f5 0%, #e0e7ff 100%)",
      paper: isDark ? "#000000" : "#ffffff"
    },
    text: {
      primary: isDark ? "#f1f5f9" : "#2c3e50",
      secondary: isDark ? "#94a3b8" : "#7f8c8d"
    },
    border: isDark ? "#333333" : "#e0e0e0",
    stepListBox: {
      background: isDark
        ? "linear-gradient(145deg, #222A45, #2d3548)"
        : "linear-gradient(145deg, #e2e8f0, #f8fafc)",
      boxShadow: isDark
        ? "inset 4px 4px 8px #222A45, inset -4px -4px 8px #2d3548"
        : "inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff",
      scrollbarThumb: isDark ? "#1a1a1a" : "#bdc3c7"
    },
    legendBackground: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(255,255,255,0.7)",
    iconButton: {
      background: isDark ? "#0a0a0a" : "#ffffff",
      border: isDark ? "#333333" : "#e0e0e0",
      hoverBackground: isDark ? "#1a1a1a" : "#f0f2f5",
      hoverBorder: isDark ? "#2a2a2a" : "#bdbdbd"
    },
    paper: {
      boxShadow: isDark
        ? "0 8px 32px 0 rgba(0, 0, 0, 0.3)"
        : "0 8px 32px 0 rgba(44, 62, 80, 0.12), 0 1.5px 6px 0 rgba(160,196,255,0.08)"
    },
    input: {
      background: isDark ? "#000000" : "#ffffff",
      border: isDark ? "#333333" : "#e0e0e0",
      hoverBorder: isDark ? "#2a2a2a" : "#bdbdbd",
      focusBorder: isDark ? "#60a5fa" : "#3b82f6",
      text: isDark ? "#f1f5f9" : "#2c3e50",
      label: isDark ? "#94a3b8" : "#64748b"
    }
  };
};

const getStyles = (colors, isDark) => ({
  container: {
    p: { xs: 2, sm: 3 },
    background: colors.background.default,
    borderRadius: "20px",
    border: `1px solid #e0e0e0`,
    boxShadow: colors.paper.boxShadow
  },
  canvasWrapper: {
    position: "relative",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 8px 32px 0 rgba(44, 62, 80, 0.12)",
    background: colors.background.paper,
    border: `1px solid #e0e0e0`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "450px",
    height: "100%"
  },
  stepListBox: {
    flexGrow: 1,
    overflowY: "auto",
    mt: 1,
    p: 1.5,
    borderRadius: "12px",
    border: `1px solid #e0e0e0`,
    background: colors.stepListBox.background,
    boxShadow: colors.stepListBox.boxShadow,
    "&::-webkit-scrollbar": { width: "8px" },
    "&::-webkit-scrollbar-thumb": {
      background: colors.stepListBox.scrollbarThumb,
      borderRadius: "4px"
    }
  }
});

const RLLLab = ({ showSnackbar }) => {
  const theme = useTheme();
  const colors = getSimulationColors(theme);
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  const styles = getStyles(colors, isDark);
  const colorsRef = useRef(colors);

  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  const canvasRef = useRef(null);
  const stepListRef = useRef(null);
  const [listSize, setListSize] = useState(5);
  const [manualInputs, setManualInputs] = useState(Array(5).fill(""));
  const [status, setStatus] = useState("Ready to reverse");
  const [stepList, setStepList] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mode, setMode] = useState("auto");
  const [history, setHistory] = useState([]);

  const stateRef = useRef({
    nodes: [],
    prev: -1,
    curr: 0,
    nextNode: -1,
    reversing: false,
    done: false,
    successPlayed: false,
    animation: { inProgress: false, nodeIndex: -1, progress: 0 }
  });

  const p5InstanceRef = useRef(null);
  const audioRefs = useRef({});
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (stepListRef.current) {
      stepListRef.current.scrollTop = stepListRef.current.scrollHeight;
    }
  }, [stepList]);

  const resetState = useCallback((newValues = null) => {
    clearTimeout(timeoutRef.current);
    const vals = newValues || stateRef.current.nodes.map((n) => n.value);
    stateRef.current = {
      nodes: vals.map((v, i) => ({
        value: v,
        next: i < vals.length - 1 ? i + 1 : -1,
        reversed: false
      })),
      prev: -1,
      curr: 0,
      nextNode: -1,
      reversing: false,
      done: false,
      successPlayed: false,
      animation: { inProgress: false, nodeIndex: -1, progress: 0 }
    };
    setStatus("Ready to reverse");
    setStepList([]);
    setIsPlaying(false);
    setIsAnimating(false);
    setHistory([]);
  }, []);

  const generateRandomList = useCallback(
    (size) => {
      const newValues = Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);
      resetState(newValues);
    },
    [resetState]
  );

  useEffect(() => {
    if (mode === "auto") {
      generateRandomList(listSize);
    } else {
      const newEmpty = Array(listSize).fill("");
      resetState(newEmpty.map(() => 0));
      setManualInputs(newEmpty);
    }
  }, [mode, listSize, generateRandomList, resetState]);

  useLayoutEffect(() => {
    const sketch = (p) => {
      p.setup = () => {
        const container = canvasRef.current;
        const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
        canvas.parent(container);
        p.textAlign(p.CENTER, p.CENTER);
      };

      p.draw = () => {
        const currentColors = colorsRef.current;
        p.background(currentColors.background.paper);
        drawLinkedList(p);

        const s = stateRef.current;
        if (s.animation.inProgress) {
          s.animation.progress += 0.04;
          if (s.animation.progress >= 1) {
            endAnimation();
          }
        }
      };

      p.windowResized = () => {
        const container = canvasRef.current;
        if (container) p.resizeCanvas(container.offsetWidth, container.offsetHeight);
      };

      const drawLinkedList = (p) => {
        const currentColors = colorsRef.current;
        const s = stateRef.current;
        const { nodes, prev, curr, animation } = s;
        if (!nodes || nodes.length === 0) return;

        const n = nodes.length;
        const radius = Math.min(35, (p.width - 100) / (n * 3));
        const spacing = (p.width - 80) / n;
        const startX = 40 + spacing / 2;
        const yPos = p.height / 2;

        // Draw arrows
        for (let i = 0; i < n; i++) {
          const x1 = startX + i * spacing;
          const nextIdx = nodes[i].next;

          if (nextIdx !== -1) {
            const x2 = startX + nextIdx * spacing;
            const y1 = yPos;
            const y2 = yPos;

            const isAnimatingThis = animation.inProgress && animation.nodeIndex === i;

            if (isAnimatingThis) {
              const prog = animation.progress;
              p.push();
              p.stroke(p.color(currentColors.error.main));
              p.strokeWeight(2);
              p.noFill();

              const fromBx = x1 + radius;
              const toBx = startX + (i - 1 >= 0 ? i - 1 : 0) * spacing - radius;
              const endX = p.lerp(fromBx, toBx, prog);
              const cpY = yPos - 40 - prog * 30;

              p.bezier(
                x1 + radius, yPos,
                x1 + radius, cpY,
                endX, cpY,
                endX, yPos
              );
              p.pop();
            } else {
              const fromX = x1 + radius;
              const toX = x2 - radius;

              let arrowColor;
              if (nodes[i].reversed) {
                arrowColor = p.color(currentColors.success.main);
              } else {
                arrowColor = p.color(currentColors.text.secondary);
              }

              p.push();
              p.stroke(arrowColor);
              p.strokeWeight(2);
              p.line(fromX, y1, toX, y2);
              const angle = Math.atan2(y2 - y1, toX - fromX);
              const arrowSize = 8;
              p.fill(arrowColor);
              p.triangle(
                toX, y2,
                toX - arrowSize * Math.cos(angle - Math.PI / 6),
                y2 - arrowSize * Math.sin(angle - Math.PI / 6),
                toX - arrowSize * Math.cos(angle + Math.PI / 6),
                y2 - arrowSize * Math.sin(angle + Math.PI / 6)
              );
              p.pop();
            }
          }
        }

        // Draw NULL
        if (!s.done) {
          const lastIdx = n - 1;
          const nullX = startX + lastIdx * spacing + radius + 25;
          p.fill(currentColors.text.secondary);
          p.noStroke();
          p.textSize(12);
          p.text("NULL", nullX, yPos);
        } else {
          const nullX = startX + 0 * spacing + radius + 25;
          p.fill(currentColors.text.secondary);
          p.noStroke();
          p.textSize(12);
          p.text("NULL", nullX, yPos);
        }

        // Draw nodes
        for (let i = 0; i < n; i++) {
          const x = startX + i * spacing;
          const y = yPos;

          let nodeColor;
          if (s.done) {
            nodeColor = p.color(currentColors.success.main);
          } else if (i === curr && s.reversing) {
            nodeColor = p.color(currentColors.warning.main);
          } else if (i === prev) {
            nodeColor = p.color(currentColors.error.main);
          } else if (nodes[i].reversed) {
            nodeColor = p.color(currentColors.success.main);
          } else {
            nodeColor = p.color(currentColors.info.main);
          }

          p.fill(nodeColor);
          p.stroke(currentColors.primary.main);
          p.strokeWeight(2);
          p.ellipse(x, y, radius * 2, radius * 2);

          p.noStroke();
          p.fill(currentColors.text.primary);
          p.textSize(Math.max(12, radius * 0.6));
          p.text(nodes[i].value, x, y);
        }

        // Draw pointer labels
        if (s.reversing || s.done) {
          p.textSize(11);
          if (prev !== -1) {
            p.fill(currentColors.error.main);
            p.text("prev", startX + prev * spacing, yPos + radius + 18);
          }
          if (curr !== -1 && !s.done) {
            p.fill(currentColors.warning.main);
            p.text("curr", startX + curr * spacing, yPos + radius + 18);
          }
          if (s.nextNode !== -1 && !s.done) {
            p.fill(currentColors.primary.main);
            p.text("next", startX + s.nextNode * spacing, yPos + radius + 32);
          }
        }

        // Draw "head" label
        if (!s.done) {
          p.fill(currentColors.primary.main);
          p.textSize(11);
          p.text("head", startX, yPos - radius - 14);
        } else {
          p.fill(currentColors.primary.main);
          p.textSize(11);
          p.text("head", startX + (n - 1) * spacing, yPos - radius - 14);
        }
      };

      p5InstanceRef.current = p;
    };

    let p5Instance = new p5(sketch, canvasRef.current);
    audioRefs.current.step = new Audio(stepSoundFile);
    audioRefs.current.success = new Audio(successSoundFile);
    audioRefs.current.fail = new Audio(failSoundFile);
    return () => {
      p5Instance.remove();
    };
  }, []);

  const playSound = (soundType) => {
    const audio = audioRefs.current[soundType];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((e) => console.error("Audio failed:", e));
    }
  };

  const endAnimation = () => {
    const s = stateRef.current;
    s.animation.inProgress = false;
    setIsAnimating(false);

    const currIdx = s.curr;
    const prevIdx = s.prev;
    const nextIdx = s.nextNode;

    s.nodes[currIdx].next = prevIdx;
    s.nodes[currIdx].reversed = true;

    s.prev = currIdx;
    s.curr = nextIdx;
  };

  const performStep = useCallback(() => {
    const s = stateRef.current;

    if (s.curr === -1 || s.done) {
      if (!s.successPlayed) {
        const message = `Reversal Complete! New head is node ${s.nodes[s.prev].value}.`;
        setStatus(message);
        setStepList((prev) => [...prev, message]);
        playSound("success");
        s.successPlayed = true;
        s.reversing = false;
        s.done = true;
      }
      setIsPlaying(false);
      return true;
    }

    setHistory((prev) => [...prev, JSON.parse(JSON.stringify(s))]);

    s.nextNode = s.nodes[s.curr].next !== -1 ? s.nodes[s.curr].next : -1;
    const currVal = s.nodes[s.curr].value;
    const prevVal = s.prev !== -1 ? s.nodes[s.prev].value : "NULL";
    const nextVal = s.nextNode !== -1 ? s.nodes[s.nextNode].value : "NULL";

    const messageBody = `curr=${currVal}, prev=${prevVal}, next=${nextVal}. Reversing curr.next → prev.`;

    s.animation = { inProgress: true, nodeIndex: s.curr, progress: 0 };
    setIsAnimating(true);

    setStepList((prevStepList) => {
      const fullMessage = `Step ${prevStepList.length + 1}: ${messageBody}`;
      setStatus(fullMessage);
      return [...prevStepList, fullMessage];
    });

    playSound("step");
    return false;
  }, []);

  const handleRun = () => {
    if (isPlaying) {
      setIsPlaying(false);
      clearTimeout(timeoutRef.current);
      return;
    }

    if (!stateRef.current.reversing) stateRef.current.reversing = true;
    setIsPlaying(true);

    const runStep = () => {
      if (stateRef.current.animation.inProgress) {
        timeoutRef.current = setTimeout(runStep, 100);
        return;
      }

      const isDone = performStep();
      if (!isDone) {
        timeoutRef.current = setTimeout(runStep, 1200);
      } else {
        setIsPlaying(false);
      }
    };
    runStep();
  };

  const handleStep = () => {
    const s = stateRef.current;
    if ((s.curr === -1 || s.done) && !s.animation.inProgress) {
      showSnackbar("Reversal complete. Please reset.", "warning");
      return;
    }
    if (!s.reversing) s.reversing = true;
    performStep();
  };

  const handlePrevStep = () => {
    clearTimeout(timeoutRef.current);
    setIsPlaying(false);
    setIsAnimating(false);

    if (history.length > 0) {
      const prevState = history.pop();
      setHistory([...history]);
      stateRef.current = prevState;
      setStepList((prev) => prev.slice(0, -1));
      setStatus("Reverted to previous step");
    }
  };

  const handleReset = useCallback(() => {
    if (mode === "auto") {
      generateRandomList(listSize);
    } else {
      resetState(Array(listSize).fill(0));
    }
  }, [mode, listSize, generateRandomList, resetState]);

  const handleListSizeChange = (e) => {
    let size = parseInt(e.target.value) || 0;
    size = Math.max(1, Math.min(15, size));
    setListSize(size);
  };

  const applyManualList = () => {
    const vals = manualInputs
      .map(Number)
      .filter(
        (n) => !isNaN(n) && manualInputs[manualInputs.map(Number).indexOf(n)] !== ""
      );
    if (vals.length !== listSize) {
      showSnackbar(`Please enter exactly ${listSize} valid numbers.`, "error");
      return;
    }
    resetState(vals);
    showSnackbar("Manual linked list applied successfully!", "success");
  };

  return (
    <Paper sx={styles.container}>
      <Typography variant="h5" align="center" sx={{ mb: 2, color: colors.text.primary }}>
        Simulator
      </Typography>

      <Paper sx={{ p: 2, mb: 3, bgcolor: colors.background.paper }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel
                sx={{
                  color: colors.input.label,
                  "&.Mui-focused": { color: colors.input.focusBorder }
                }}
              >
                Mode
              </InputLabel>
              <Select
                value={mode}
                label="Mode"
                onChange={(e) => setMode(e.target.value)}
                sx={{
                  color: colors.input.text,
                  bgcolor: colors.input.background,
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.input.border },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.input.hoverBorder
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.input.focusBorder
                  },
                  "& .MuiSvgIcon-root": { color: colors.input.text }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: colors.background.paper,
                      "& .MuiMenuItem-root": { color: colors.text.primary }
                    }
                  }
                }}
              >
                <MenuItem value="auto">Auto Generate</MenuItem>
                <MenuItem value="manual">Manual Input</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="List Size"
              type="number"
              value={listSize}
              onChange={handleListSizeChange}
              inputProps={{ min: 1, max: 15 }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: colors.input.text,
                  bgcolor: colors.input.background,
                  "& fieldset": { borderColor: colors.input.border },
                  "&:hover fieldset": { borderColor: colors.input.hoverBorder },
                  "&.Mui-focused fieldset": { borderColor: colors.input.focusBorder }
                },
                "& .MuiInputLabel-root": { color: colors.input.label },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.input.focusBorder }
              }}
            />
          </Grid>
          {mode === "manual" && (
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1, color: colors.text.primary }}>
                Enter node values (1-100):
              </Typography>
              <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 1 }}>
                {manualInputs.map((val, i) => (
                  <TextField
                    key={i}
                    size="small"
                    type="number"
                    value={val}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (
                        inputValue === "" ||
                        (Number(inputValue) >= 1 && Number(inputValue) <= 100)
                      ) {
                        const newInputs = [...manualInputs];
                        newInputs[i] = inputValue;
                        setManualInputs(newInputs);
                      }
                    }}
                    sx={{
                      minWidth: 60,
                      "& .MuiOutlinedInput-root": {
                        color: colors.input.text,
                        bgcolor: colors.input.background,
                        "& fieldset": { borderColor: colors.input.border },
                        "&:hover fieldset": { borderColor: colors.input.hoverBorder },
                        "&.Mui-focused fieldset": { borderColor: colors.input.focusBorder }
                      }
                    }}
                    inputProps={{ min: 1, max: 100 }}
                  />
                ))}
              </Stack>
              <Button
                variant="outlined"
                size="small"
                onClick={applyManualList}
                sx={{
                  mt: 1,
                  color: colors.primary.main,
                  borderColor: colors.primary.main,
                  "&:hover": {
                    borderColor: colors.primary.main,
                    bgcolor: alpha(colors.primary.main, 0.1)
                  }
                }}
              >
                Apply Manual List & Reset
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>

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
            background: colors.legendBackground,
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          <LegendItem
            color={colors.warning.main}
            text="Current (curr)"
            textColor={colors.text.primary}
          />
          <LegendItem color={colors.error.main} text="Previous (prev)" textColor={colors.text.primary} />
          <LegendItem color={colors.success.main} text="Reversed" textColor={colors.text.primary} />
          <LegendItem color={colors.info.main} text="Unprocessed" textColor={colors.text.primary} />
        </Stack>
        <Typography variant="body1" sx={{ mt: 2, color: colors.text.primary }}>
          Status: {status}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Box sx={styles.canvasWrapper} ref={canvasRef} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              p: 2,
              minHeight: "450px",
              maxHeight: "450px",
              display: "flex",
              flexDirection: "column",
              bgcolor: colors.background.paper
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ color: colors.text.primary }}>
                Execution Steps
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Reset">
                  <IconButton
                    size="small"
                    onClick={handleReset}
                    sx={{
                      color: colors.text.primary,
                      background: colors.iconButton.background,
                      border: `1px solid ${colors.iconButton.border}`,
                      "&:hover": { background: colors.iconButton.hoverBackground }
                    }}
                  >
                    <RestartAltIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Previous Step">
                  <span>
                    <IconButton
                      size="small"
                      onClick={handlePrevStep}
                      disabled={isAnimating || isPlaying || history.length === 0}
                      sx={{
                        color: colors.text.primary,
                        background: colors.iconButton.background,
                        border: `1px solid ${colors.iconButton.border}`,
                        "&:hover": { background: colors.iconButton.hoverBackground }
                      }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Next Step">
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleStep}
                      disabled={isPlaying || isAnimating}
                      sx={{
                        color: colors.text.primary,
                        background: colors.iconButton.background,
                        border: `1px solid ${colors.iconButton.border}`,
                        "&:hover": { background: colors.iconButton.hoverBackground }
                      }}
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={isPlaying ? "Pause" : "Run"}>
                  <IconButton
                    size="small"
                    onClick={handleRun}
                    sx={{ background: isPlaying ? colors.warning.main : colors.success.main }}
                  >
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
            <Box sx={styles.stepListBox} ref={stepListRef}>
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
          </Paper>
        </Grid>
      </Grid>
    </Paper>
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

export default RLLLab;

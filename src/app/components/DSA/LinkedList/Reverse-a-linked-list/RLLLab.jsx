import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import p5 from "p5";
import {
  Box, Button, Grid, Paper, Stack, Typography, Tooltip, IconButton,
  TextField, FormControl, InputLabel, Select, MenuItem, useTheme, alpha
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

const stepSoundFile = "/DSA/step.mp3";
const successSoundFile = "/DSA/success.mp3";
const failSoundFile = "/DSA/fail.mp3";

const getSimulationColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  return {
    primary: { main: isDark ? "#60a5fa" : "#2c3e50" },
    info: { main: isDark ? "#4b5563" : "#e5e7e9" },
    success: { main: isDark ? "#34d399" : "#27ae60" },
    warning: { main: isDark ? "#fbbf24" : "#f39c12" },
    error: { main: isDark ? "#f87171" : "#e74c3c" },
    background: {
      default: isDark ? "linear-gradient(135deg, #222A45 0%, #222A45 100%)" : "linear-gradient(135deg, #f0f2f5 0%, #e0e7ff 100%)",
      paper: isDark ? "#000000" : "#ffffff"
    },
    text: { primary: isDark ? "#f1f5f9" : "#2c3e50", secondary: isDark ? "#94a3b8" : "#7f8c8d" },
    border: isDark ? "#333333" : "#e0e0e0",
    node: {
      fill: isDark ? "#2d3748" : "#d5f5e3",
      stroke: isDark ? "#94a3b8" : "#2c3e50",
      divider: isDark ? "#555555" : "#999999",
      pointerBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"
    },
    stepListBox: {
      background: isDark ? "linear-gradient(145deg, #222A45, #2d3548)" : "linear-gradient(145deg, #e2e8f0, #f8fafc)",
      boxShadow: isDark ? "inset 4px 4px 8px #222A45, inset -4px -4px 8px #2d3548" : "inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff",
      scrollbarThumb: isDark ? "#1a1a1a" : "#bdc3c7"
    },
    legendBackground: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(255,255,255,0.7)",
    iconButton: {
      background: isDark ? "#0a0a0a" : "#ffffff",
      border: isDark ? "#333333" : "#e0e0e0",
      hoverBackground: isDark ? "#1a1a1a" : "#f0f2f5"
    },
    paper: {
      boxShadow: isDark ? "0 8px 32px 0 rgba(0, 0, 0, 0.3)" : "0 8px 32px 0 rgba(44, 62, 80, 0.12), 0 1.5px 6px 0 rgba(160,196,255,0.08)"
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

const getStyles = (colors) => ({
  container: { p: { xs: 2, sm: 3 }, background: colors.background.default, borderRadius: "20px", border: `1px solid #e0e0e0`, boxShadow: colors.paper.boxShadow },
  canvasWrapper: {
    position: "relative", borderRadius: "24px", overflow: "hidden",
    boxShadow: "0 8px 32px 0 rgba(44, 62, 80, 0.12)", background: colors.background.paper,
    border: `1px solid #e0e0e0`, display: "flex", justifyContent: "center", alignItems: "center",
    minHeight: "450px", height: "100%"
  },
  stepListBox: {
    flexGrow: 1, overflowY: "auto", mt: 1, p: 1.5, borderRadius: "12px",
    border: `1px solid #e0e0e0`, background: colors.stepListBox.background,
    boxShadow: colors.stepListBox.boxShadow,
    "&::-webkit-scrollbar": { width: "8px" },
    "&::-webkit-scrollbar-thumb": { background: colors.stepListBox.scrollbarThumb, borderRadius: "4px" }
  }
});

const RLLLab = ({ showSnackbar }) => {
  const theme = useTheme();
  const colors = getSimulationColors(theme);
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  const styles = getStyles(colors);
  const colorsRef = useRef(colors);

  useEffect(() => { colorsRef.current = colors; }, [colors]);

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
    nodes: [], prev: -1, curr: 0, nextNode: -1,
    reversing: false, done: false, successPlayed: false,
    animation: { inProgress: false, nodeIndex: -1, phase: 'none', progress: 0 }
  });

  const p5InstanceRef = useRef(null);
  const audioRefs = useRef({});
  const timeoutRef = useRef(null);

  useEffect(() => { if (stepListRef.current) stepListRef.current.scrollTop = stepListRef.current.scrollHeight; }, [stepList]);

  const resetState = useCallback((newValues = null) => {
    clearTimeout(timeoutRef.current);
    const vals = newValues || stateRef.current.nodes.map((n) => n.value);
    stateRef.current = {
      nodes: vals.map((v, i) => ({ value: v, next: i < vals.length - 1 ? i + 1 : -1, reversed: false })),
      prev: -1, curr: 0, nextNode: -1, reversing: false, done: false, successPlayed: false,
      animation: { inProgress: false, nodeIndex: -1, phase: 'none', progress: 0 }
    };
    setStatus("Ready to reverse"); setStepList([]); setIsPlaying(false); setIsAnimating(false); setHistory([]);
  }, []);

  const generateRandomList = useCallback((size) => {
    resetState(Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1));
  }, [resetState]);

  useEffect(() => {
    if (mode === "auto") generateRandomList(listSize);
    else { const e = Array(listSize).fill(""); resetState(e.map(() => 0)); setManualInputs(e); }
  }, [mode, listSize, generateRandomList, resetState]);

  useLayoutEffect(() => {
    const sketch = (p) => {
      p.setup = () => { const c = canvasRef.current; p.createCanvas(c.offsetWidth, c.offsetHeight).parent(c); p.textAlign(p.CENTER, p.CENTER); };

      p.draw = () => {
        p.background(colorsRef.current.background.paper);
        drawLinkedList(p);
        const s = stateRef.current;
        if (s.animation.inProgress) {
          s.animation.progress += 0.025;
          if (s.animation.progress >= 1) {
            if (s.animation.phase === 'fade-old') { s.animation.phase = 'draw-new'; s.animation.progress = 0; }
            else if (s.animation.phase === 'draw-new') { s.animation.phase = 'settle'; s.animation.progress = 0; }
            else endAnimation();
          }
        }
      };

      p.windowResized = () => { const c = canvasRef.current; if (c) p.resizeCanvas(c.offsetWidth, c.offsetHeight); };

      const drawArrowhead = (p, tx, ty, angle, size, col) => {
        p.push(); p.fill(col); p.noStroke();
        p.triangle(tx, ty, tx-size*Math.cos(angle-Math.PI/6), ty-size*Math.sin(angle-Math.PI/6), tx-size*Math.cos(angle+Math.PI/6), ty-size*Math.sin(angle+Math.PI/6));
        p.pop();
      };
      const easeInOutCubic = (t) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;

      const drawLinkedList = (p) => {
        const cc = colorsRef.current;
        const s = stateRef.current;
        const { nodes, prev, curr, animation } = s;
        if (!nodes || nodes.length === 0) return;

        const n = nodes.length;
        const nodeW = Math.min(55, (p.width - 140) / n);
        const nodeH = nodeW * 0.72;
        const dataW = nodeW * 0.6;
        const ptrW = nodeW * 0.4;
        const cornerR = 6;
        const spacing = (p.width - 120) / n;
        const startX = 60 + spacing / 2;
        const yPos = p.height / 2;
        const arrowSize = 8;

        // Arrows
        for (let i = 0; i < n; i++) {
          const x1 = startX + i * spacing;
          const nextIdx = nodes[i].next;
          const isAN = animation.inProgress && animation.nodeIndex === i;

          if (isAN) {
            const phase = animation.phase;
            const prog = easeInOutCubic(Math.min(animation.progress, 1));

            if (phase === 'fade-old') {
              const x2 = startX + (i+1) * spacing;
              const fromX = x1+nodeW/2+ptrW/2+2, toX = x2-nodeW/2;
              const a = Math.max(0, 255*(1-prog));
              const oc = p.color(cc.node.stroke); oc.setAlpha(a);
              p.push(); p.stroke(oc); p.strokeWeight(2); p.line(fromX, yPos, toX, yPos);
              drawArrowhead(p, toX, yPos, 0, arrowSize, oc); p.pop();
              if (prog > 0.3) {
                const cp = Math.min(1, (prog-0.3)/0.7), midX = (fromX+toX)/2, cs = 6*cp;
                const xc = p.color(cc.error.main); xc.setAlpha(255*cp);
                p.push(); p.stroke(xc); p.strokeWeight(2.5);
                p.line(midX-cs, yPos-cs, midX+cs, yPos+cs); p.line(midX-cs, yPos+cs, midX+cs, yPos-cs); p.pop();
              }
            } else if (phase === 'draw-new') {
              const pt = i-1 >= 0 ? i-1 : i;
              const fromX = x1, toX = startX+pt*spacing;
              const ch = nodeH*1.2+20, ceX = p.lerp(fromX, toX, prog);
              const cp1X = fromX, cp1Y = yPos-ch, cp2X = ceX, cp2Y = yPos-ch;
              const nc = p.color(cc.error.main);
              p.push(); p.stroke(nc); p.strokeWeight(2.5); p.noFill(); p.beginShape();
              const st = Math.floor(prog*30);
              for (let t=0; t<=st; t++) { const tt=t/30;
                p.vertex((1-tt)**3*fromX+3*(1-tt)**2*tt*cp1X+3*(1-tt)*tt**2*cp2X+tt**3*ceX,
                  (1-tt)**3*(yPos-nodeH/2)+3*(1-tt)**2*tt*cp1Y+3*(1-tt)*tt**2*cp2Y+tt**3*(yPos-nodeH/2));
              }
              p.endShape(); p.pop();
              if (prog > 0.15) {
                const tt=st/30, pt2=Math.max(0,(st-1)/30);
                const ex=(1-tt)**3*fromX+3*(1-tt)**2*tt*cp1X+3*(1-tt)*tt**2*cp2X+tt**3*ceX;
                const ey=(1-tt)**3*(yPos-nodeH/2)+3*(1-tt)**2*tt*cp1Y+3*(1-tt)*tt**2*cp2Y+tt**3*(yPos-nodeH/2);
                const px2=(1-pt2)**3*fromX+3*(1-pt2)**2*pt2*cp1X+3*(1-pt2)*pt2**2*cp2X+pt2**3*ceX;
                const py2=(1-pt2)**3*(yPos-nodeH/2)+3*(1-pt2)**2*pt2*cp1Y+3*(1-pt2)*pt2**2*cp2Y+pt2**3*(yPos-nodeH/2);
                drawArrowhead(p, ex, ey, Math.atan2(ey-py2, ex-px2), arrowSize+1, nc);
              }
              const gc = p.color(cc.error.main); gc.setAlpha(60);
              p.push(); p.stroke(gc); p.strokeWeight(6); p.noFill(); p.beginShape();
              for (let t=0; t<=st; t++) { const tt=t/30;
                p.vertex((1-tt)**3*fromX+3*(1-tt)**2*tt*cp1X+3*(1-tt)*tt**2*cp2X+tt**3*ceX,
                  (1-tt)**3*(yPos-nodeH/2)+3*(1-tt)**2*tt*cp1Y+3*(1-tt)*tt**2*cp2Y+tt**3*(yPos-nodeH/2));
              }
              p.endShape(); p.pop();
            } else if (phase === 'settle') {
              const pt = i-1 >= 0 ? i-1 : i;
              const fromX = x1, toX = startX+pt*spacing;
              const ch = nodeH*1.2+20, cp1Y = yPos-ch, cp2Y = yPos-ch;
              const r = p.lerp(p.red(p.color(cc.error.main)), p.red(p.color(cc.success.main)), prog);
              const g = p.lerp(p.green(p.color(cc.error.main)), p.green(p.color(cc.success.main)), prog);
              const b = p.lerp(p.blue(p.color(cc.error.main)), p.blue(p.color(cc.success.main)), prog);
              const sc = p.color(r, g, b);
              p.push(); p.stroke(sc); p.strokeWeight(2.5); p.noFill();
              p.bezier(fromX, yPos-nodeH/2, fromX, cp1Y, toX, cp2Y, toX, yPos-nodeH/2); p.pop();
              drawArrowhead(p, toX, yPos-nodeH/2, Math.PI/2, arrowSize+1, sc);
            }
          } else if (nextIdx !== -1) {
            const x2 = startX+nextIdx*spacing;
            if (nodes[i].reversed) {
              const fromX=x1, toX=x2, ch=nodeH*1.2+20, rc=p.color(cc.success.main);
              p.push(); p.stroke(rc); p.strokeWeight(2); p.noFill();
              p.bezier(fromX, yPos-nodeH/2, fromX, yPos-ch, toX, yPos-ch, toX, yPos-nodeH/2); p.pop();
              drawArrowhead(p, toX, yPos-nodeH/2, Math.PI/2, arrowSize, rc);
            } else {
              const fromX=x1+nodeW/2+ptrW/2+2, toX=x2-nodeW/2, ac=p.color(cc.node.stroke);
              p.push(); p.stroke(ac); p.strokeWeight(2); p.line(fromX, yPos, toX, yPos);
              drawArrowhead(p, toX, yPos, 0, arrowSize, ac); p.pop();
            }
          }
        }

        // Head
        { const hi=s.done?n-1:0, hx=startX+hi*spacing, lx=hx-nodeW/2-36;
          p.push(); p.noStroke(); p.fill(cc.text.primary); p.textSize(13); p.textStyle(p.BOLD);
          p.text("head", lx-4, yPos); p.stroke(cc.text.primary); p.strokeWeight(2);
          p.line(lx+16, yPos, hx-nodeW/2, yPos);
          drawArrowhead(p, hx-nodeW/2, yPos, 0, arrowSize, p.color(cc.text.primary)); p.pop(); }

        // NULL
        { const ni=s.done?0:n-1, nx=startX+ni*spacing, fx=nx+nodeW/2+2, nlx=fx+32;
          p.push(); p.stroke(cc.text.secondary); p.strokeWeight(2); p.line(fx, yPos, nlx-14, yPos);
          drawArrowhead(p, nlx-14, yPos, 0, arrowSize, p.color(cc.text.secondary));
          p.noStroke(); p.fill(cc.text.secondary); p.textSize(13); p.textStyle(p.BOLD);
          p.textAlign(p.LEFT, p.CENTER); p.text("NULL", nlx-8, yPos); p.pop(); }

        // Nodes
        for (let i=0; i<n; i++) {
          const x=startX+i*spacing, y=yPos;
          const isAN2=animation.inProgress&&animation.nodeIndex===i;
          let nc;
          if (s.done) nc=p.color(cc.success.main);
          else if (isAN2 && (animation.phase==='draw-new'||animation.phase==='fade-old')) nc=p.color(cc.warning.main);
          else if (i===curr && s.reversing && !animation.inProgress) nc=p.color(cc.warning.main);
          else if (i===prev) nc=p.color(cc.error.main);
          else if (nodes[i].reversed) nc=p.color(cc.success.main);
          else nc=p.color(cc.node.fill);

          const nX=x-nodeW/2, nY=y-nodeH/2;
          if (isAN2 && animation.phase==='draw-new') {
            const ga=80+40*Math.sin(p.frameCount*0.15); const gw=p.color(cc.warning.main); gw.setAlpha(ga);
            p.push(); p.noStroke(); p.fill(gw); p.rect(nX-4, nY-4, nodeW+8, nodeH+8, cornerR+4); p.pop();
          }
          p.push(); p.fill(nc); p.stroke(cc.node.stroke); p.strokeWeight(2); p.rect(nX, nY, nodeW, nodeH, cornerR); p.pop();
          p.push(); p.stroke(cc.node.divider); p.strokeWeight(1.5); p.line(nX+dataW, nY+2, nX+dataW, nY+nodeH-2); p.pop();
          p.push(); p.noStroke(); p.fill(cc.node.pointerBg); p.rect(nX+dataW+1, nY+2, ptrW-3, nodeH-4, 0, cornerR-2, cornerR-2, 0); p.pop();
          p.push(); p.noStroke(); p.fill(cc.text.primary); p.textSize(Math.max(12, nodeW*0.22)); p.textStyle(p.BOLD);
          p.textAlign(p.CENTER, p.CENTER); p.text(nodes[i].value, nX+dataW/2, y); p.pop();
          p.push(); p.fill(cc.node.stroke); p.noStroke(); p.ellipse(nX+dataW+ptrW/2, y, 5, 5); p.pop();
        }

        // Pointer labels
        if (s.reversing || s.done) {
          const drawPL = (l, idx, col, oY) => { if (idx===-1) return;
            const px=startX+idx*spacing, py=yPos+nodeH/2+oY;
            p.push(); p.fill(col); p.noStroke(); p.textAlign(p.CENTER, p.CENTER); p.textStyle(p.BOLD); p.textSize(11);
            p.text(l, px, py+12); p.stroke(col); p.strokeWeight(1.5); p.line(px, py+6, px, yPos+nodeH/2+2);
            drawArrowhead(p, px, yPos+nodeH/2+2, -Math.PI/2, 5, p.color(col)); p.pop();
          };
          drawPL("prev", prev, cc.error.main, 14);
          if (curr!==-1 && !s.done) drawPL("curr", curr, cc.warning.main, 14);
          if (s.nextNode!==-1 && !s.done) drawPL("next", s.nextNode, cc.primary.main, 30);
        }
      };

      p5InstanceRef.current = p;
    };

    let p5i = new p5(sketch, canvasRef.current);
    audioRefs.current.step = new Audio(stepSoundFile);
    audioRefs.current.success = new Audio(successSoundFile);
    audioRefs.current.fail = new Audio(failSoundFile);
    return () => { p5i.remove(); };
  }, []);

  const playSound = (t) => { const a=audioRefs.current[t]; if (a) { a.currentTime=0; a.play().catch(()=>{}); } };

  const endAnimation = () => {
    const s = stateRef.current;
    s.animation = { inProgress: false, nodeIndex: -1, phase: 'none', progress: 0 };
    setIsAnimating(false);
    s.nodes[s.curr].next = s.prev; s.nodes[s.curr].reversed = true;
    s.prev = s.curr; s.curr = s.nextNode;
  };

  const performStep = useCallback(() => {
    const s = stateRef.current;
    if (s.curr === -1 || s.done) {
      if (!s.successPlayed) {
        const msg = `Reversal Complete! New head is node ${s.nodes[s.prev].value}.`;
        setStatus(msg); setStepList((p) => [...p, msg]); playSound("success");
        s.successPlayed = true; s.reversing = false; s.done = true;
      }
      setIsPlaying(false); return true;
    }
    setHistory((p) => [...p, JSON.parse(JSON.stringify(s))]);
    s.nextNode = s.nodes[s.curr].next !== -1 ? s.nodes[s.curr].next : -1;
    const cv = s.nodes[s.curr].value, pv = s.prev !== -1 ? s.nodes[s.prev].value : "NULL", nv = s.nextNode !== -1 ? s.nodes[s.nextNode].value : "NULL";
    const body = `curr=${cv}, prev=${pv}, next=${nv}. Reversing curr.next → prev.`;
    s.animation = { inProgress: true, nodeIndex: s.curr, phase: 'fade-old', progress: 0 };
    setIsAnimating(true);
    setStepList((ps) => { const fm = `Step ${ps.length+1}: ${body}`; setStatus(fm); return [...ps, fm]; });
    playSound("step"); return false;
  }, []);

  const handleRun = () => {
    if (isPlaying) { setIsPlaying(false); clearTimeout(timeoutRef.current); return; }
    if (!stateRef.current.reversing) stateRef.current.reversing = true;
    setIsPlaying(true);
    const rs = () => {
      if (stateRef.current.animation.inProgress) { timeoutRef.current = setTimeout(rs, 100); return; }
      const done = performStep();
      if (!done) timeoutRef.current = setTimeout(rs, 1200); else setIsPlaying(false);
    };
    rs();
  };

  const handleStep = () => {
    const s = stateRef.current;
    if ((s.curr === -1 || s.done) && !s.animation.inProgress) { showSnackbar("Reversal complete. Please reset.", "warning"); return; }
    if (!s.reversing) s.reversing = true;
    performStep();
  };

  const handlePrevStep = () => {
    clearTimeout(timeoutRef.current); setIsPlaying(false); setIsAnimating(false);
    if (history.length > 0) {
      const ps = history.pop(); setHistory([...history]);
      stateRef.current = ps; setStepList((p) => p.slice(0, -1)); setStatus("Reverted to previous step");
    }
  };

  const handleReset = useCallback(() => {
    if (mode === "auto") generateRandomList(listSize); else resetState(Array(listSize).fill(0));
  }, [mode, listSize, generateRandomList, resetState]);

  const handleListSizeChange = (e) => { let s = parseInt(e.target.value) || 0; setListSize(Math.max(1, Math.min(15, s))); };

  const applyManualList = () => {
    const vals = manualInputs.map(Number).filter((n) => !isNaN(n) && manualInputs[manualInputs.map(Number).indexOf(n)] !== "");
    if (vals.length !== listSize) { showSnackbar(`Please enter exactly ${listSize} valid numbers.`, "error"); return; }
    resetState(vals); showSnackbar("Manual linked list applied successfully!", "success");
  };

  return (
    <Paper sx={styles.container}>
      <Typography variant="h5" align="center" sx={{ mb: 2, color: colors.text.primary }}>Simulator</Typography>
      <Paper sx={{ p: 2, mb: 3, bgcolor: colors.background.paper }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: colors.input.label, "&.Mui-focused": { color: colors.input.focusBorder } }}>Mode</InputLabel>
              <Select value={mode} label="Mode" onChange={(e) => setMode(e.target.value)}
                sx={{ color: colors.input.text, bgcolor: colors.input.background,
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.input.border },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: colors.input.hoverBorder },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: colors.input.focusBorder },
                  "& .MuiSvgIcon-root": { color: colors.input.text } }}
                MenuProps={{ PaperProps: { sx: { bgcolor: colors.background.paper, "& .MuiMenuItem-root": { color: colors.text.primary } } } }}>
                <MenuItem value="auto">Auto Generate</MenuItem>
                <MenuItem value="manual">Manual Input</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="List Size" type="number" value={listSize} onChange={handleListSizeChange}
              inputProps={{ min: 1, max: 15 }}
              sx={{ "& .MuiOutlinedInput-root": { color: colors.input.text, bgcolor: colors.input.background,
                "& fieldset": { borderColor: colors.input.border }, "&:hover fieldset": { borderColor: colors.input.hoverBorder },
                "&.Mui-focused fieldset": { borderColor: colors.input.focusBorder } },
                "& .MuiInputLabel-root": { color: colors.input.label }, "& .MuiInputLabel-root.Mui-focused": { color: colors.input.focusBorder } }} />
          </Grid>
          {mode === "manual" && (
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1, color: colors.text.primary }}>Enter node values (1-100):</Typography>
              <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 1 }}>
                {manualInputs.map((val, i) => (
                  <TextField key={i} size="small" type="number" value={val}
                    onChange={(e) => { const iv = e.target.value;
                      if (iv === "" || (Number(iv) >= 1 && Number(iv) <= 100)) { const ni = [...manualInputs]; ni[i] = iv; setManualInputs(ni); } }}
                    sx={{ minWidth: 60, "& .MuiOutlinedInput-root": { color: colors.input.text, bgcolor: colors.input.background,
                      "& fieldset": { borderColor: colors.input.border }, "&:hover fieldset": { borderColor: colors.input.hoverBorder },
                      "&.Mui-focused fieldset": { borderColor: colors.input.focusBorder } } }}
                    inputProps={{ min: 1, max: 100 }} />
                ))}
              </Stack>
              <Button variant="outlined" size="small" onClick={applyManualList}
                sx={{ mt: 1, color: colors.primary.main, borderColor: colors.primary.main,
                  "&:hover": { borderColor: colors.primary.main, bgcolor: alpha(colors.primary.main, 0.1) } }}>
                Apply Manual List & Reset
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Box sx={{ mb: 2, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <Stack direction="row" spacing={2} sx={{ p: 1.5, borderRadius: 2, background: colors.legendBackground, flexWrap: "wrap", justifyContent: "center" }}>
          <LegendItem color={colors.warning.main} text="Current (curr)" textColor={colors.text.primary} />
          <LegendItem color={colors.error.main} text="Previous (prev)" textColor={colors.text.primary} />
          <LegendItem color={colors.success.main} text="Reversed" textColor={colors.text.primary} />
          <LegendItem color={colors.node.fill} text="Unprocessed" textColor={colors.text.primary} />
        </Stack>
        <Typography variant="body1" sx={{ mt: 2, color: colors.text.primary }}>Status: {status}</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Box sx={styles.canvasWrapper} ref={canvasRef} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, minHeight: "450px", maxHeight: "450px", display: "flex", flexDirection: "column", bgcolor: colors.background.paper }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ color: colors.text.primary }}>Execution Steps</Typography>
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Reset"><IconButton size="small" onClick={handleReset} sx={{ color: colors.text.primary, background: colors.iconButton.background, border: `1px solid ${colors.iconButton.border}`, "&:hover": { background: colors.iconButton.hoverBackground } }}><RestartAltIcon /></IconButton></Tooltip>
                <Tooltip title="Previous Step"><span><IconButton size="small" onClick={handlePrevStep} disabled={isAnimating || isPlaying || history.length === 0} sx={{ color: colors.text.primary, background: colors.iconButton.background, border: `1px solid ${colors.iconButton.border}`, "&:hover": { background: colors.iconButton.hoverBackground } }}><ArrowBackIcon /></IconButton></span></Tooltip>
                <Tooltip title="Next Step"><span><IconButton size="small" onClick={handleStep} disabled={isPlaying || isAnimating} sx={{ color: colors.text.primary, background: colors.iconButton.background, border: `1px solid ${colors.iconButton.border}`, "&:hover": { background: colors.iconButton.hoverBackground } }}><ArrowForwardIcon /></IconButton></span></Tooltip>
                <Tooltip title={isPlaying ? "Pause" : "Run"}><IconButton size="small" onClick={handleRun} sx={{ background: isPlaying ? colors.warning.main : colors.success.main }}>{isPlaying ? <PauseIcon /> : <PlayArrowIcon />}</IconButton></Tooltip>
              </Stack>
            </Stack>
            <Box sx={styles.stepListBox} ref={stepListRef}>
              {stepList.map((step, index) => (<Typography key={index} variant="body2" sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap", mb: 0.5, color: colors.text.primary }}>{step}</Typography>))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

const LegendItem = ({ color, text, textColor }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Box sx={{ width: 18, height: 18, borderRadius: "4px", backgroundColor: color, border: "2px solid rgba(0,0,0,0.1)" }} />
    <Typography variant="body2" sx={{ fontWeight: 500, color: textColor }}>{text}</Typography>
  </Stack>
);

export default RLLLab;

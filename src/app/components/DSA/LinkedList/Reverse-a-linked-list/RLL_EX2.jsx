import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import p5 from "p5";
import {
  Box,
  Grid,
  Paper,
  Stack,
  Typography,
  Tooltip,
  IconButton,
  useTheme,
  alpha
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const stepSoundFile = "/DSA/step.mp3";
const successSoundFile = "/DSA/success.mp3";

const getExampleColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  return {
    primary: { main: isDark ? "#60a5fa" : "#2c3e50" },
    info: { main: isDark ? "#1a1a1a" : "#e5e7e9" },
    success: { main: isDark ? "#34d399" : "#27ae60" },
    warning: { main: isDark ? "#fbbf24" : "#f39c12" },
    error: { main: isDark ? "#f87171" : "#e74c3c" },
    background: {
      default: isDark
        ? "linear-gradient(135deg, #000000 0%, #0a0a0a 100%)"
        : "linear-gradient(135deg, #f0f2f5 0%, #e0e7ff 100%)",
      paper: isDark ? "#000000" : "#ffffff",
      surface: isDark ? "rgba(0, 0, 0, 0.95)" : "rgba(255,255,255,0.95)"
    },
    text: {
      primary: isDark ? "#f1f5f9" : "#2c3e50",
      secondary: isDark ? "#94a3b8" : "#7f8c8d"
    },
    border: isDark ? "#333333" : "#e0e0e0",
    node: {
      fill: isDark ? "#2d3748" : "#d5f5e3",
      stroke: isDark ? "#94a3b8" : "#2c3e50",
      divider: isDark ? "#555555" : "#999999",
      pointerBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"
    },
    stepListBox: {
      background: isDark
        ? "linear-gradient(145deg, #000000, #0a0a0a)"
        : "linear-gradient(145deg, #e2e8f0, #f8fafc)",
      boxShadow: isDark
        ? "inset 4px 4px 8px #000000, inset -4px -4px 8px #1a1a1a"
        : "inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff",
      scrollbarThumb: isDark ? "#333333" : "#bdc3c7"
    },
    legendBackground: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(255,255,255,0.7)",
    iconButton: {
      background: isDark ? "#0a0a0a" : "#ffffff",
      border: isDark ? "#333333" : "#e0e0e0",
      hoverBackground: isDark ? "#1a1a1a" : "#f0f2f5"
    },
    paper: {
      boxShadow: isDark
        ? "0 8px 32px 0 rgba(0, 0, 0, 0.3)"
        : "0 8px 32px 0 rgba(44, 62, 80, 0.12), 0 1.5px 6px 0 rgba(160,196,255,0.08)"
    }
  };
};

const getStyles = (colors) => ({
  container: { p: { xs: 2, sm: 4 }, background: colors.background.default, border: `1px solid #e0e0e0` },
  canvasWrapper: {
    position: "relative", borderRadius: "24px", border: `1px solid #e0e0e0`,
    overflow: "hidden", boxShadow: colors.paper.boxShadow, background: colors.background.surface,
    display: "flex", justifyContent: "center", alignItems: "center"
  },
  canvasBox: { width: "100%", maxWidth: 800, aspectRatio: "16 / 9" },
  stepListBox: {
    height: "250px", overflowY: "auto", mt: 1, p: 1.5, borderRadius: "12px",
    border: `1px solid #e0e0e0`, background: colors.stepListBox.background,
    boxShadow: colors.stepListBox.boxShadow,
    "&::-webkit-scrollbar": { width: "8px" },
    "&::-webkit-scrollbar-thumb": { background: colors.stepListBox.scrollbarThumb, borderRadius: "4px" }
  }
});

const RLL_EX2 = () => {
  const theme = useTheme();
  const colors = getExampleColors(theme);
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  const styles = getStyles(colors);
  const colorsRef = useRef(colors);

  useEffect(() => { colorsRef.current = colors; }, [colors]);

  const sketchRef = useRef();
  const toastRef = useRef();
  const stepListRef = useRef(null);
  const [status, setStatus] = useState("Ready to reverse");
  const [stepList, setStepList] = useState([]);
  const [isReversed, setIsReversed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const audioRefs = useRef({});

  const stateRef = useRef({
    nodes: [], originalValues: [5, 15, 25, 35, 45, 55, 65],
    prev: -1, curr: 0, nextNode: -1, stepCount: 0,
    reversing: false, paused: true, runMode: false, successPlayed: false, done: false,
    animation: { inProgress: false, nodeIndex: -1, phase: 'none', progress: 0 }
  });

  useEffect(() => { if (stepListRef.current) stepListRef.current.scrollTop = stepListRef.current.scrollHeight; }, [stepList]);

  useLayoutEffect(() => {
    const preloadAudio = () => { try { audioRefs.current.step = new Audio(stepSoundFile); audioRefs.current.success = new Audio(successSoundFile); } catch (e) {} };
    const playSound = (t) => { if (audioRefs.current[t]) { audioRefs.current[t].currentTime = 0; audioRefs.current[t].play().catch(() => {}); } };

    const sketch = (p) => {
      p.setup = () => { const c = sketchRef.current; p.createCanvas(c.offsetWidth, c.offsetHeight).parent(c); p.textAlign(p.CENTER, p.CENTER); preloadAudio(); p.reset(); };

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
        } else if (s.reversing && !s.paused && s.runMode && p.frameCount % 30 === 0) performStep();
      };

      const drawArrowhead = (p, tx, ty, angle, size, col) => {
        p.push(); p.fill(col); p.noStroke();
        p.triangle(tx, ty, tx - size * Math.cos(angle - Math.PI/6), ty - size * Math.sin(angle - Math.PI/6), tx - size * Math.cos(angle + Math.PI/6), ty - size * Math.sin(angle + Math.PI/6));
        p.pop();
      };

      const easeInOutCubic = (t) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;

      const drawLinkedList = (p) => {
        const cc = colorsRef.current;
        const s = stateRef.current;
        const { nodes, prev, curr, animation } = s;
        if (nodes.length === 0) return;

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
          const isAnimatingThis = animation.inProgress && animation.nodeIndex === i;

          if (isAnimatingThis) {
            const phase = animation.phase;
            const prog = easeInOutCubic(Math.min(animation.progress, 1));

            if (phase === 'fade-old') {
              const x2 = startX + (i + 1) * spacing;
              const fromX = x1 + nodeW/2 + ptrW/2 + 2;
              const toX = x2 - nodeW/2;
              const a = Math.max(0, 255 * (1 - prog));
              const oldC = p.color(cc.node.stroke); oldC.setAlpha(a);
              p.push(); p.stroke(oldC); p.strokeWeight(2); p.line(fromX, yPos, toX, yPos);
              drawArrowhead(p, toX, yPos, 0, arrowSize, oldC); p.pop();
              if (prog > 0.3) {
                const cp = Math.min(1, (prog - 0.3) / 0.7);
                const midX = (fromX + toX) / 2;
                const cs = 6 * cp;
                const crossC = p.color(cc.error.main); crossC.setAlpha(255 * cp);
                p.push(); p.stroke(crossC); p.strokeWeight(2.5);
                p.line(midX - cs, yPos - cs, midX + cs, yPos + cs);
                p.line(midX - cs, yPos + cs, midX + cs, yPos - cs); p.pop();
              }
            } else if (phase === 'draw-new') {
              const prevTarget = i - 1 >= 0 ? i - 1 : i;
              const fromX = x1;
              const toX = startX + prevTarget * spacing;
              const curveHeight = nodeH * 1.2 + 20;
              const currentEndX = p.lerp(fromX, toX, prog);
              const cp1X = fromX, cp1Y = yPos - curveHeight;
              const cp2X = currentEndX, cp2Y = yPos - curveHeight;
              const newC = p.color(cc.error.main);
              p.push(); p.stroke(newC); p.strokeWeight(2.5); p.noFill();
              p.beginShape();
              const steps = Math.floor(prog * 30);
              for (let t = 0; t <= steps; t++) {
                const tt = t / 30;
                const bx = (1-tt)**3*fromX + 3*(1-tt)**2*tt*cp1X + 3*(1-tt)*tt**2*cp2X + tt**3*currentEndX;
                const by = (1-tt)**3*(yPos - nodeH/2) + 3*(1-tt)**2*tt*cp1Y + 3*(1-tt)*tt**2*cp2Y + tt**3*(yPos - nodeH/2);
                p.vertex(bx, by);
              }
              p.endShape(); p.pop();
              if (prog > 0.15) {
                const tt = steps / 30;
                const prevTt = Math.max(0, (steps - 1) / 30);
                const ex = (1-tt)**3*fromX + 3*(1-tt)**2*tt*cp1X + 3*(1-tt)*tt**2*cp2X + tt**3*currentEndX;
                const ey = (1-tt)**3*(yPos - nodeH/2) + 3*(1-tt)**2*tt*cp1Y + 3*(1-tt)*tt**2*cp2Y + tt**3*(yPos - nodeH/2);
                const px2 = (1-prevTt)**3*fromX + 3*(1-prevTt)**2*prevTt*cp1X + 3*(1-prevTt)*prevTt**2*cp2X + prevTt**3*currentEndX;
                const py2 = (1-prevTt)**3*(yPos - nodeH/2) + 3*(1-prevTt)**2*prevTt*cp1Y + 3*(1-prevTt)*prevTt**2*cp2Y + prevTt**3*(yPos - nodeH/2);
                drawArrowhead(p, ex, ey, Math.atan2(ey - py2, ex - px2), arrowSize + 1, newC);
              }
              const gc = p.color(cc.error.main); gc.setAlpha(60);
              p.push(); p.stroke(gc); p.strokeWeight(6); p.noFill(); p.beginShape();
              for (let t = 0; t <= steps; t++) { const tt = t/30;
                p.vertex((1-tt)**3*fromX + 3*(1-tt)**2*tt*cp1X + 3*(1-tt)*tt**2*cp2X + tt**3*currentEndX,
                  (1-tt)**3*(yPos-nodeH/2) + 3*(1-tt)**2*tt*cp1Y + 3*(1-tt)*tt**2*cp2Y + tt**3*(yPos-nodeH/2));
              }
              p.endShape(); p.pop();
            } else if (phase === 'settle') {
              const prevTarget = i - 1 >= 0 ? i - 1 : i;
              const fromX = x1, toX = startX + prevTarget * spacing;
              const curveHeight = nodeH * 1.2 + 20;
              const cp1Y = yPos - curveHeight, cp2Y = yPos - curveHeight;
              const r = p.lerp(p.red(p.color(cc.error.main)), p.red(p.color(cc.success.main)), prog);
              const g = p.lerp(p.green(p.color(cc.error.main)), p.green(p.color(cc.success.main)), prog);
              const b = p.lerp(p.blue(p.color(cc.error.main)), p.blue(p.color(cc.success.main)), prog);
              const sc = p.color(r, g, b);
              p.push(); p.stroke(sc); p.strokeWeight(2.5); p.noFill();
              p.bezier(fromX, yPos - nodeH/2, fromX, cp1Y, toX, cp2Y, toX, yPos - nodeH/2); p.pop();
              drawArrowhead(p, toX, yPos - nodeH/2, Math.atan2((yPos-nodeH/2)-cp2Y, toX-toX), arrowSize + 1, sc);
            }
          } else if (nextIdx !== -1) {
            const x2 = startX + nextIdx * spacing;
            if (nodes[i].reversed) {
              const fromX = x1, toX = x2;
              const curveHeight = nodeH * 1.2 + 20;
              const revC = p.color(cc.success.main);
              p.push(); p.stroke(revC); p.strokeWeight(2); p.noFill();
              p.bezier(fromX, yPos - nodeH/2, fromX, yPos - curveHeight, toX, yPos - curveHeight, toX, yPos - nodeH/2); p.pop();
              drawArrowhead(p, toX, yPos - nodeH/2, Math.PI / 2, arrowSize, revC);
            } else {
              const fromX = x1 + nodeW/2 + ptrW/2 + 2;
              const toX = x2 - nodeW/2;
              const ac = p.color(cc.node.stroke);
              p.push(); p.stroke(ac); p.strokeWeight(2); p.line(fromX, yPos, toX, yPos);
              drawArrowhead(p, toX, yPos, 0, arrowSize, ac); p.pop();
            }
          }
        }

        // Head
        { const hi = s.done ? n-1 : 0; const hx = startX + hi * spacing; const lx = hx - nodeW/2 - 36;
          p.push(); p.noStroke(); p.fill(cc.text.primary); p.textSize(13); p.textStyle(p.BOLD);
          p.text("head", lx - 4, yPos); p.stroke(cc.text.primary); p.strokeWeight(2);
          p.line(lx + 16, yPos, hx - nodeW/2, yPos);
          drawArrowhead(p, hx - nodeW/2, yPos, 0, arrowSize, p.color(cc.text.primary)); p.pop(); }

        // NULL
        { const ni = s.done ? 0 : n-1; const nx = startX + ni * spacing; const fx = nx + nodeW/2 + 2; const nlx = fx + 32;
          p.push(); p.stroke(cc.text.secondary); p.strokeWeight(2); p.line(fx, yPos, nlx-14, yPos);
          drawArrowhead(p, nlx-14, yPos, 0, arrowSize, p.color(cc.text.secondary));
          p.noStroke(); p.fill(cc.text.secondary); p.textSize(13); p.textStyle(p.BOLD);
          p.textAlign(p.LEFT, p.CENTER); p.text("NULL", nlx-8, yPos); p.pop(); }

        // Nodes
        for (let i = 0; i < n; i++) {
          const x = startX + i * spacing, y = yPos;
          const isAN = animation.inProgress && animation.nodeIndex === i;
          let nc;
          if (s.done) nc = p.color(cc.success.main);
          else if (isAN && (animation.phase === 'draw-new' || animation.phase === 'fade-old')) nc = p.color(cc.warning.main);
          else if (i === curr && s.reversing && !animation.inProgress) nc = p.color(cc.warning.main);
          else if (i === prev) nc = p.color(cc.error.main);
          else if (nodes[i].reversed) nc = p.color(cc.success.main);
          else nc = p.color(cc.node.fill);

          const nX = x - nodeW/2, nY = y - nodeH/2;
          if (isAN && animation.phase === 'draw-new') {
            const ga = 80 + 40 * Math.sin(p.frameCount * 0.15);
            const gw = p.color(cc.warning.main); gw.setAlpha(ga);
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
          const drawPL = (l, idx, col, oY) => { if (idx === -1) return;
            const px = startX + idx * spacing, py = yPos + nodeH/2 + oY;
            p.push(); p.fill(col); p.noStroke(); p.textAlign(p.CENTER, p.CENTER); p.textStyle(p.BOLD); p.textSize(11);
            p.text(l, px, py+12); p.stroke(col); p.strokeWeight(1.5); p.line(px, py+6, px, yPos+nodeH/2+2);
            drawArrowhead(p, px, yPos+nodeH/2+2, -Math.PI/2, 5, p.color(col)); p.pop();
          };
          drawPL("prev", prev, cc.error.main, 14);
          if (curr !== -1 && !s.done) drawPL("curr", curr, cc.warning.main, 14);
          if (s.nextNode !== -1 && !s.done) drawPL("next", s.nextNode, cc.primary.main, 30);
        }
      };

      const performStep = () => {
        const s = stateRef.current;
        if (s.done || s.animation.inProgress) return;
        if (s.curr === -1) { finishReverse(); return; }
        s.stepCount++;
        s.nextNode = s.nodes[s.curr].next !== -1 ? s.nodes[s.curr].next : -1;
        const cv = s.nodes[s.curr].value, pv = s.prev !== -1 ? s.nodes[s.prev].value : "NULL", nv = s.nextNode !== -1 ? s.nodes[s.nextNode].value : "NULL";
        const msg = `Step ${s.stepCount}: curr=${cv}, prev=${pv}, next=${nv}. Reversing curr.next → prev.`;
        s.animation = { inProgress: true, nodeIndex: s.curr, phase: 'fade-old', progress: 0 };
        setIsAnimating(true); s.paused = true;
        setStatus(msg); setStepList((p) => [...p, msg]); playSound("step");
      };

      const endAnimation = () => {
        const s = stateRef.current;
        s.animation = { inProgress: false, nodeIndex: -1, phase: 'none', progress: 0 };
        setIsAnimating(false);
        s.nodes[s.curr].next = s.prev; s.nodes[s.curr].reversed = true;
        s.prev = s.curr; s.curr = s.nextNode;
        if (!s.runMode) s.paused = true; else s.paused = false;
      };

      const finishReverse = () => {
        const s = stateRef.current;
        const msg = `Reversal Complete in ${s.stepCount} steps! New head is node ${s.nodes[s.prev].value}.`;
        setStatus(msg); if (!isReversed) setStepList((p) => [...p, msg]);
        if (!s.successPlayed) { playSound("success"); s.successPlayed = true; }
        s.reversing = false; s.runMode = false; s.paused = true; s.done = true;
        setIsPlaying(false); setIsReversed(true);
      };

      p.reset = () => {
        const s = stateRef.current; const v = s.originalValues;
        s.nodes = v.map((val, i) => ({ value: val, next: i < v.length - 1 ? i + 1 : -1, reversed: false }));
        s.prev = -1; s.curr = 0; s.nextNode = -1; s.stepCount = 0;
        s.reversing = false; s.paused = true; s.runMode = false; s.successPlayed = false; s.done = false;
        s.animation = { inProgress: false, nodeIndex: -1, phase: 'none', progress: 0 };
        setStatus("Ready to reverse"); setStepList([]); setIsReversed(false); setIsPlaying(false); setIsAnimating(false);
      };

      p.step = () => { if (isReversed) return; if (!stateRef.current.reversing) stateRef.current.reversing = true; performStep(); };
      p.run = () => { if (isReversed) return; const s = stateRef.current; if (!s.reversing) s.reversing = true; s.paused = false; s.runMode = true; setIsPlaying(true); };
      p.pause = () => { stateRef.current.paused = true; stateRef.current.runMode = false; setIsPlaying(false); };
    };

    const p5i = new p5(sketch, sketchRef.current);
    if (sketchRef.current) Object.assign(sketchRef.current, { reset: p5i.reset, step: p5i.step, run: p5i.run, pause: p5i.pause });
    return () => { p5i.remove(); };
  }, []);

  const copySteps = async () => { try { await navigator.clipboard.writeText(stepList.join("\n")); } catch { alert("Failed to copy."); } };

  return (
    <Box sx={styles.container}>
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom sx={{ color: colors.text.primary }}>Example 2</Typography>
        <Typography variant="body2" sx={{ color: colors.text.secondary }}>Linked List: 5 → 15 → 25 → 35 → 45 → 55 → 65 → NULL</Typography>
      </Box>
      <Box sx={{ p: 1, mb: 2, display: "flex", justifyContent: "center", gap: 1.5 }}>
        <Tooltip title="Reset"><IconButton onClick={() => sketchRef.current.reset()} sx={{ color: colors.text.primary, background: colors.iconButton.background, border: `1px solid ${colors.iconButton.border}`, "&:hover": { background: colors.iconButton.hoverBackground } }}><RestartAltIcon /></IconButton></Tooltip>
        <Tooltip title="Next Step"><span><IconButton onClick={() => sketchRef.current.step()} disabled={isReversed || isPlaying || isAnimating} sx={{ color: colors.text.primary, background: colors.iconButton.background, border: `1px solid ${colors.iconButton.border}`, "&:hover": { background: colors.iconButton.hoverBackground } }}><ArrowForwardIcon /></IconButton></span></Tooltip>
        <Tooltip title={isPlaying ? "Playing" : "Run"}><span><IconButton onClick={() => sketchRef.current.run()} disabled={isReversed || isPlaying || isAnimating} sx={{ background: isPlaying ? colors.success.main : colors.iconButton.background, color: colors.text.primary, border: `1px solid ${colors.iconButton.border}` }}><PlayArrowIcon /></IconButton></span></Tooltip>
        <Tooltip title="Pause"><span><IconButton onClick={() => sketchRef.current.pause()} disabled={isReversed || !isPlaying} sx={{ color: colors.text.primary, background: colors.iconButton.background, border: `1px solid ${colors.iconButton.border}`, "&:hover": { background: colors.iconButton.hoverBackground } }}><PauseIcon /></IconButton></span></Tooltip>
      </Box>
      <Box sx={{ mb: 2, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <Stack direction="row" spacing={2} sx={{ p: 1.5, borderRadius: 2, background: colors.legendBackground, flexWrap: "wrap", justifyContent: "center" }}>
          <LegendItem color={colors.warning.main} text="Current (curr)" textColor={colors.text.primary} />
          <LegendItem color={colors.error.main} text="Previous (prev)" textColor={colors.text.primary} />
          <LegendItem color={colors.success.main} text="Reversed" textColor={colors.text.primary} />
          <LegendItem color={colors.node.fill} text="Unprocessed" textColor={colors.text.primary} />
        </Stack>
        <Typography variant="body1" sx={{ mt: 2, color: colors.text.primary }}>Status: {status}</Typography>
      </Box>
      <Grid container spacing={{ xs: 2, md: 4 }} justifyContent="center" alignItems="stretch">
        <Grid item xs={12} md={8}>
          <Box sx={styles.canvasWrapper}><Box sx={styles.canvasBox}><div ref={sketchRef} style={{ width: "100%", height: "100%" }} /></Box></Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: { xs: 1.5, md: 2 }, width: "100%", display: "flex", flexDirection: "column", gap: 2, mx: "auto", bgcolor: colors.background.paper }}>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ color: colors.text.primary }}>Execution Steps</Typography>
                <Tooltip title="Copy Steps"><IconButton onClick={copySteps} size="small" sx={{ color: colors.text.primary, background: colors.iconButton.background, border: `1px solid ${colors.iconButton.border}`, "&:hover": { background: colors.iconButton.hoverBackground } }}><ContentCopyIcon fontSize="small" /></IconButton></Tooltip>
              </Stack>
              <Box ref={stepListRef} sx={styles.stepListBox}>
                {stepList.map((step, index) => (<Typography key={index} variant="body2" sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap", mb: 0.5, color: colors.text.primary }}>{step}</Typography>))}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const LegendItem = ({ color, text, textColor }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Box sx={{ width: 18, height: 18, borderRadius: "4px", backgroundColor: color, border: "2px solid rgba(0,0,0,0.1)" }} />
    <Typography variant="body2" sx={{ fontWeight: 500, color: textColor }}>{text}</Typography>
  </Stack>
);

export default RLL_EX2;

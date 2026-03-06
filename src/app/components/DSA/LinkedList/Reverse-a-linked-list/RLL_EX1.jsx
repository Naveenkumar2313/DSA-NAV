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
  container: {
    p: { xs: 2, sm: 4 },
    background: colors.background.default,
    border: `1px solid #e0e0e0`
  },
  canvasWrapper: {
    position: "relative",
    borderRadius: "24px",
    border: `1px solid #e0e0e0`,
    overflow: "hidden",
    boxShadow: colors.paper.boxShadow,
    background: colors.background.surface,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  canvasBox: { width: "100%", maxWidth: 800, aspectRatio: "16 / 9" },
  stepListBox: {
    height: "250px",
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

const RLL_EX1 = () => {
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
    nodes: [],
    originalValues: [10, 20, 30, 40, 50],
    prev: -1,
    curr: 0,
    nextNode: -1,
    stepCount: 0,
    reversing: false,
    paused: true,
    runMode: false,
    successPlayed: false,
    done: false,
    // Animation phases: 'fade-old' → 'draw-new' → 'settle'
    animation: {
      inProgress: false,
      nodeIndex: -1,
      phase: 'none', // 'fade-old', 'draw-new', 'settle'
      progress: 0,
      totalPhases: 3
    }
  });

  useEffect(() => {
    if (stepListRef.current) {
      stepListRef.current.scrollTop = stepListRef.current.scrollHeight;
    }
  }, [stepList]);

  useLayoutEffect(() => {
    const preloadAudio = () => {
      try {
        audioRefs.current.step = new Audio(stepSoundFile);
        audioRefs.current.success = new Audio(successSoundFile);
      } catch (e) { console.error("Audio files not found.", e); }
    };

    const playSound = (soundType) => {
      if (audioRefs.current[soundType]) {
        audioRefs.current[soundType].currentTime = 0;
        audioRefs.current[soundType].play().catch(() => {});
      }
    };

    const sketch = (p) => {
      p.setup = () => {
        const container = sketchRef.current;
        const canvas = p.createCanvas(container.offsetWidth, container.offsetHeight);
        canvas.parent(container);
        p.textAlign(p.CENTER, p.CENTER);
        preloadAudio();
        p.reset();
      };

      p.draw = () => {
        const cc = colorsRef.current;
        p.background(cc.background.paper);
        drawLinkedList(p);
        const s = stateRef.current;

        if (s.animation.inProgress) {
          s.animation.progress += 0.025;
          if (s.animation.progress >= 1) {
            if (s.animation.phase === 'fade-old') {
              s.animation.phase = 'draw-new';
              s.animation.progress = 0;
            } else if (s.animation.phase === 'draw-new') {
              s.animation.phase = 'settle';
              s.animation.progress = 0;
            } else {
              endAnimation();
            }
          }
        } else if (s.reversing && !s.paused && s.runMode && p.frameCount % 30 === 0) {
          performStep();
        }
      };

      // --- Arrowhead helper ---
      const drawArrowhead = (p, tx, ty, angle, size, col) => {
        p.push();
        p.fill(col);
        p.noStroke();
        p.triangle(
          tx, ty,
          tx - size * Math.cos(angle - Math.PI / 6),
          ty - size * Math.sin(angle - Math.PI / 6),
          tx - size * Math.cos(angle + Math.PI / 6),
          ty - size * Math.sin(angle + Math.PI / 6)
        );
        p.pop();
      };

      // --- Easing functions ---
      const easeInOutCubic = (t) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
      const easeOutQuad = (t) => 1 - (1-t)*(1-t);

      const drawLinkedList = (p) => {
        const cc = colorsRef.current;
        const s = stateRef.current;
        const { nodes, prev, curr, animation } = s;
        if (nodes.length === 0) return;

        const n = nodes.length;
        const nodeW = Math.min(60, (p.width - 140) / n);
        const nodeH = nodeW * 0.72;
        const dataW = nodeW * 0.6;
        const ptrW = nodeW * 0.4;
        const cornerR = 6;
        const spacing = (p.width - 120) / n;
        const startX = 60 + spacing / 2;
        const yPos = p.height / 2;
        const arrowSize = 9;

        // ===== Draw arrows =====
        for (let i = 0; i < n; i++) {
          const x1 = startX + i * spacing;
          const nextIdx = nodes[i].next;
          const isAnimatingThis = animation.inProgress && animation.nodeIndex === i;

          if (isAnimatingThis) {
            // ---------- ANIMATED ARROW ----------
            const phase = animation.phase;
            const prog = easeInOutCubic(Math.min(animation.progress, 1));

            if (phase === 'fade-old') {
              // Phase 1: Fade out the old forward arrow
              const x2 = startX + (i + 1) * spacing;
              const fromX = x1 + nodeW / 2 + ptrW / 2 + 2;
              const toX = x2 - nodeW / 2;
              const alpha = Math.max(0, 255 * (1 - prog));
              const oldColor = p.color(cc.node.stroke);
              oldColor.setAlpha(alpha);

              p.push();
              p.stroke(oldColor);
              p.strokeWeight(2);
              p.line(fromX, yPos, toX, yPos);
              drawArrowhead(p, toX, yPos, 0, arrowSize, oldColor);
              p.pop();

              // Show an X mark growing at the midpoint
              if (prog > 0.3) {
                const crossProg = Math.min(1, (prog - 0.3) / 0.7);
                const midX = (fromX + toX) / 2;
                const crossSize = 6 * crossProg;
                const crossColor = p.color(cc.error.main);
                crossColor.setAlpha(255 * crossProg);
                p.push();
                p.stroke(crossColor);
                p.strokeWeight(2.5);
                p.line(midX - crossSize, yPos - crossSize, midX + crossSize, yPos + crossSize);
                p.line(midX - crossSize, yPos + crossSize, midX + crossSize, yPos - crossSize);
                p.pop();
              }
            } else if (phase === 'draw-new') {
              // Phase 2: Draw the new curved reverse arrow
              const prevTarget = i - 1 >= 0 ? i - 1 : i;
              const fromX = x1;
              const toX = startX + prevTarget * spacing;
              const curveHeight = nodeH * 1.2 + 20;

              // The arrow arcs above the nodes
              const currentEndX = p.lerp(fromX, toX, prog);
              const cp1X = fromX;
              const cp1Y = yPos - curveHeight;
              const cp2X = currentEndX;
              const cp2Y = yPos - curveHeight;

              const newColor = p.color(cc.error.main);

              p.push();
              p.stroke(newColor);
              p.strokeWeight(2.5);
              p.noFill();

              // Draw partial bezier curve
              p.beginShape();
              p.noFill();
              const steps = Math.floor(prog * 30);
              for (let t = 0; t <= steps; t++) {
                const tt = t / 30;
                const bx = (1-tt)*(1-tt)*(1-tt)*fromX + 3*(1-tt)*(1-tt)*tt*cp1X + 3*(1-tt)*tt*tt*cp2X + tt*tt*tt*currentEndX;
                const by = (1-tt)*(1-tt)*(1-tt)*(yPos - nodeH/2) + 3*(1-tt)*(1-tt)*tt*cp1Y + 3*(1-tt)*tt*tt*cp2Y + tt*tt*tt*(yPos - nodeH/2);
                p.vertex(bx, by);
              }
              p.endShape();
              p.pop();

              // Arrowhead at the current end of the growing curve
              if (prog > 0.15) {
                const tt = steps / 30;
                const prevTt = Math.max(0, (steps - 1) / 30);
                const endBx = (1-tt)*(1-tt)*(1-tt)*fromX + 3*(1-tt)*(1-tt)*tt*cp1X + 3*(1-tt)*tt*tt*cp2X + tt*tt*tt*currentEndX;
                const endBy = (1-tt)*(1-tt)*(1-tt)*(yPos - nodeH/2) + 3*(1-tt)*(1-tt)*tt*cp1Y + 3*(1-tt)*tt*tt*cp2Y + tt*tt*tt*(yPos - nodeH/2);
                const prevBx = (1-prevTt)*(1-prevTt)*(1-prevTt)*fromX + 3*(1-prevTt)*(1-prevTt)*prevTt*cp1X + 3*(1-prevTt)*prevTt*prevTt*cp2X + prevTt*prevTt*prevTt*currentEndX;
                const prevBy = (1-prevTt)*(1-prevTt)*(1-prevTt)*(yPos - nodeH/2) + 3*(1-prevTt)*(1-prevTt)*prevTt*cp1Y + 3*(1-prevTt)*prevTt*prevTt*cp2Y + prevTt*prevTt*prevTt*(yPos - nodeH/2);
                const angle = Math.atan2(endBy - prevBy, endBx - prevBx);
                drawArrowhead(p, endBx, endBy, angle, arrowSize + 1, newColor);
              }

              // Glow effect on curved line
              const glowColor = p.color(cc.error.main);
              glowColor.setAlpha(60);
              p.push();
              p.stroke(glowColor);
              p.strokeWeight(6);
              p.noFill();
              p.beginShape();
              for (let t = 0; t <= steps; t++) {
                const tt = t / 30;
                const bx = (1-tt)*(1-tt)*(1-tt)*fromX + 3*(1-tt)*(1-tt)*tt*cp1X + 3*(1-tt)*tt*tt*cp2X + tt*tt*tt*currentEndX;
                const by = (1-tt)*(1-tt)*(1-tt)*(yPos - nodeH/2) + 3*(1-tt)*(1-tt)*tt*cp1Y + 3*(1-tt)*tt*tt*cp2Y + tt*tt*tt*(yPos - nodeH/2);
                p.vertex(bx, by);
              }
              p.endShape();
              p.pop();
            } else if (phase === 'settle') {
              // Phase 3: Settled reversed arrow (flash green)
              const prevTarget = i - 1 >= 0 ? i - 1 : i;
              const fromX = x1;
              const toX = startX + prevTarget * spacing;
              const curveHeight = nodeH * 1.2 + 20;

              const cp1X = fromX;
              const cp1Y = yPos - curveHeight;
              const cp2X = toX;
              const cp2Y = yPos - curveHeight;

              // Interpolate color from red to green
              const r = p.lerp(p.red(p.color(cc.error.main)), p.red(p.color(cc.success.main)), prog);
              const g = p.lerp(p.green(p.color(cc.error.main)), p.green(p.color(cc.success.main)), prog);
              const b = p.lerp(p.blue(p.color(cc.error.main)), p.blue(p.color(cc.success.main)), prog);
              const settleColor = p.color(r, g, b);

              p.push();
              p.stroke(settleColor);
              p.strokeWeight(2.5);
              p.noFill();
              p.bezier(fromX, yPos - nodeH/2, cp1X, cp1Y, cp2X, cp2Y, toX, yPos - nodeH/2);
              p.pop();

              // Arrowhead
              const angle = Math.atan2((yPos - nodeH/2) - cp2Y, toX - cp2X);
              drawArrowhead(p, toX, yPos - nodeH/2, angle, arrowSize + 1, settleColor);
            }
          } else if (nextIdx !== -1) {
            // ---------- STATIC ARROWS (reversed or normal) ----------
            const x2 = startX + nextIdx * spacing;

            if (nodes[i].reversed) {
              // Reversed: draw curved arrow above
              const fromX = x1;
              const toX = x2;
              const curveHeight = nodeH * 1.2 + 20;
              const cp1Y = yPos - curveHeight;
              const cp2Y = yPos - curveHeight;

              const revColor = p.color(cc.success.main);
              p.push();
              p.stroke(revColor);
              p.strokeWeight(2);
              p.noFill();
              p.bezier(fromX, yPos - nodeH/2, fromX, cp1Y, toX, cp2Y, toX, yPos - nodeH/2);
              p.pop();

              // Arrowhead at the end
              const angle = Math.atan2((yPos - nodeH/2) - cp2Y, toX - toX);
              drawArrowhead(p, toX, yPos - nodeH/2, Math.PI / 2, arrowSize, revColor);
            } else {
              // Normal forward arrow
              const fromX = x1 + nodeW / 2 + ptrW / 2 + 2;
              const toX = x2 - nodeW / 2;
              const arrowColor = p.color(cc.node.stroke);

              p.push();
              p.stroke(arrowColor);
              p.strokeWeight(2);
              p.line(fromX, yPos, toX, yPos);
              drawArrowhead(p, toX, yPos, 0, arrowSize, arrowColor);
              p.pop();
            }
          }
        }

        // ===== Head label =====
        {
          const headIdx = s.done ? n - 1 : 0;
          const headX = startX + headIdx * spacing;
          const labelX = headX - nodeW / 2 - 36;

          p.push();
          p.noStroke();
          p.fill(cc.text.primary);
          p.textSize(13);
          p.textStyle(p.BOLD);
          p.text("head", labelX - 4, yPos);
          p.stroke(cc.text.primary);
          p.strokeWeight(2);
          const arrowFrom = labelX + 16;
          const arrowTo = headX - nodeW / 2;
          p.line(arrowFrom, yPos, arrowTo, yPos);
          drawArrowhead(p, arrowTo, yPos, 0, arrowSize, p.color(cc.text.primary));
          p.pop();
        }

        // ===== NULL label =====
        {
          const nullIdx = s.done ? 0 : n - 1;
          const nullX = startX + nullIdx * spacing;
          const fromX = nullX + nodeW / 2 + 2;
          const nullLabelX = fromX + 32;

          p.push();
          p.stroke(cc.text.secondary);
          p.strokeWeight(2);
          p.line(fromX, yPos, nullLabelX - 14, yPos);
          drawArrowhead(p, nullLabelX - 14, yPos, 0, arrowSize, p.color(cc.text.secondary));
          p.noStroke();
          p.fill(cc.text.secondary);
          p.textSize(13);
          p.textStyle(p.BOLD);
          p.textAlign(p.LEFT, p.CENTER);
          p.text("NULL", nullLabelX - 8, yPos);
          p.pop();
        }

        // ===== Draw Nodes =====
        for (let i = 0; i < n; i++) {
          const x = startX + i * spacing;
          const y = yPos;

          let nodeColor;
          const isAnimNode = animation.inProgress && animation.nodeIndex === i;
          if (s.done) {
            nodeColor = p.color(cc.success.main);
          } else if (isAnimNode && (animation.phase === 'draw-new' || animation.phase === 'fade-old')) {
            nodeColor = p.color(cc.warning.main);
          } else if (i === curr && s.reversing && !animation.inProgress) {
            nodeColor = p.color(cc.warning.main);
          } else if (i === prev) {
            nodeColor = p.color(cc.error.main);
          } else if (nodes[i].reversed) {
            nodeColor = p.color(cc.success.main);
          } else {
            nodeColor = p.color(cc.node.fill);
          }

          const nX = x - nodeW / 2;
          const nY = y - nodeH / 2;

          // Node glow for animated node
          if (isAnimNode && animation.phase === 'draw-new') {
            const glowAlpha = 80 + 40 * Math.sin(p.frameCount * 0.15);
            const glow = p.color(cc.warning.main);
            glow.setAlpha(glowAlpha);
            p.push();
            p.noStroke();
            p.fill(glow);
            p.rect(nX - 4, nY - 4, nodeW + 8, nodeH + 8, cornerR + 4);
            p.pop();
          }

          // Node rectangle
          p.push();
          p.fill(nodeColor);
          p.stroke(cc.node.stroke);
          p.strokeWeight(2);
          p.rect(nX, nY, nodeW, nodeH, cornerR);
          p.pop();

          // Divider
          p.push();
          p.stroke(cc.node.divider);
          p.strokeWeight(1.5);
          p.line(nX + dataW, nY + 2, nX + dataW, nY + nodeH - 2);
          p.pop();

          // Pointer bg
          p.push();
          p.noStroke();
          p.fill(cc.node.pointerBg);
          p.rect(nX + dataW + 1, nY + 2, ptrW - 3, nodeH - 4, 0, cornerR - 2, cornerR - 2, 0);
          p.pop();

          // Value text
          p.push();
          p.noStroke();
          p.fill(cc.text.primary);
          p.textSize(Math.max(13, nodeW * 0.24));
          p.textStyle(p.BOLD);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(nodes[i].value, nX + dataW / 2, y);
          p.pop();

          // Pointer dot
          p.push();
          p.fill(cc.node.stroke);
          p.noStroke();
          p.ellipse(nX + dataW + ptrW / 2, y, 6, 6);
          p.pop();
        }

        // ===== Pointer labels =====
        if (s.reversing || s.done) {
          const drawPointerLabel = (label, idx, color, offsetY) => {
            if (idx === -1) return;
            const px = startX + idx * spacing;
            const py = yPos + nodeH / 2 + offsetY;
            p.push();
            p.fill(color);
            p.noStroke();
            p.textAlign(p.CENTER, p.CENTER);
            p.textStyle(p.BOLD);
            p.textSize(11);
            p.text(label, px, py + 12);
            // Upward arrow
            p.stroke(color);
            p.strokeWeight(1.5);
            p.line(px, py + 6, px, yPos + nodeH / 2 + 2);
            drawArrowhead(p, px, yPos + nodeH / 2 + 2, -Math.PI / 2, 5, p.color(color));
            p.pop();
          };

          drawPointerLabel("prev", prev, cc.error.main, 14);
          if (curr !== -1 && !s.done) drawPointerLabel("curr", curr, cc.warning.main, 14);
          if (s.nextNode !== -1 && !s.done) drawPointerLabel("next", s.nextNode, cc.primary.main, 30);
        }
      };

      const performStep = () => {
        const s = stateRef.current;
        if (s.done || s.animation.inProgress) return;
        if (s.curr === -1) { finishReverse(); return; }

        s.stepCount++;
        s.nextNode = s.nodes[s.curr].next !== -1 ? s.nodes[s.curr].next : -1;
        const currVal = s.nodes[s.curr].value;
        const prevVal = s.prev !== -1 ? s.nodes[s.prev].value : "NULL";
        const nextVal = s.nextNode !== -1 ? s.nodes[s.nextNode].value : "NULL";
        const stepMessage = `Step ${s.stepCount}: curr=${currVal}, prev=${prevVal}, next=${nextVal}. Reversing curr.next → prev.`;

        s.animation = { inProgress: true, nodeIndex: s.curr, phase: 'fade-old', progress: 0 };
        setIsAnimating(true);
        s.paused = true;

        setStatus(stepMessage);
        setStepList((prev) => [...prev, stepMessage]);
        playSound("step");
      };

      const endAnimation = () => {
        const s = stateRef.current;
        s.animation = { inProgress: false, nodeIndex: -1, phase: 'none', progress: 0 };
        setIsAnimating(false);

        const currIdx = s.curr;
        s.nodes[currIdx].next = s.prev;
        s.nodes[currIdx].reversed = true;
        s.prev = currIdx;
        s.curr = s.nextNode;

        if (!s.runMode) { s.paused = true; } else { s.paused = false; }
      };

      const finishReverse = () => {
        const s = stateRef.current;
        const message = `Reversal Complete in ${s.stepCount} steps! New head is node ${s.nodes[s.prev].value}.`;
        setStatus(message);
        if (!isReversed) setStepList((prev) => [...prev, message]);
        if (!s.successPlayed) { playSound("success"); s.successPlayed = true; }
        s.reversing = false;
        s.runMode = false;
        s.paused = true;
        s.done = true;
        setIsPlaying(false);
        setIsReversed(true);
      };

      p.reset = () => {
        const s = stateRef.current;
        const vals = s.originalValues;
        s.nodes = vals.map((v, i) => ({ value: v, next: i < vals.length - 1 ? i + 1 : -1, reversed: false }));
        s.prev = -1; s.curr = 0; s.nextNode = -1; s.stepCount = 0;
        s.reversing = false; s.paused = true; s.runMode = false;
        s.successPlayed = false; s.done = false;
        s.animation = { inProgress: false, nodeIndex: -1, phase: 'none', progress: 0 };
        setStatus("Ready to reverse"); setStepList([]); setIsReversed(false);
        setIsPlaying(false); setIsAnimating(false);
      };

      p.step = () => {
        if (isReversed) return;
        if (!stateRef.current.reversing) stateRef.current.reversing = true;
        performStep();
      };

      p.run = () => {
        if (isReversed) return;
        const s = stateRef.current;
        if (!s.reversing) s.reversing = true;
        s.paused = false; s.runMode = true;
        setIsPlaying(true);
      };

      p.pause = () => {
        stateRef.current.paused = true;
        stateRef.current.runMode = false;
        setIsPlaying(false);
      };
    };

    const p5Instance = new p5(sketch, sketchRef.current);
    if (sketchRef.current) {
      Object.assign(sketchRef.current, {
        reset: p5Instance.reset, step: p5Instance.step,
        run: p5Instance.run, pause: p5Instance.pause
      });
    }
    return () => { p5Instance.remove(); };
  }, []);

  const copySteps = async () => {
    try {
      await navigator.clipboard.writeText(stepList.join("\n"));
      const toast = toastRef.current;
      if (toast) {
        toast.innerText = "Steps copied to clipboard!";
        toast.style.visibility = "visible"; toast.style.opacity = 1;
        setTimeout(() => { toast.style.opacity = 0; toast.style.visibility = "hidden"; }, 2000);
      }
    } catch { alert("Failed to copy steps."); }
  };

  return (
    <Box sx={styles.container}>
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom sx={{ color: colors.text.primary }}>Example 1</Typography>
        <Typography variant="body2" sx={{ color: colors.text.secondary }}>
          Linked List: 10 → 20 → 30 → 40 → 50 → NULL
        </Typography>
      </Box>

      <Box sx={{ p: 1, mb: 2, display: "flex", justifyContent: "center", gap: 1.5 }}>
        <Tooltip title="Reset">
          <IconButton onClick={() => sketchRef.current.reset()} sx={{ color: colors.text.primary, background: colors.iconButton.background, border: `1px solid ${colors.iconButton.border}`, "&:hover": { background: colors.iconButton.hoverBackground } }}>
            <RestartAltIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Next Step">
          <span><IconButton onClick={() => sketchRef.current.step()} disabled={isReversed || isPlaying || isAnimating}
            sx={{ color: colors.text.primary, background: colors.iconButton.background, border: `1px solid ${colors.iconButton.border}`, "&:hover": { background: colors.iconButton.hoverBackground } }}>
            <ArrowForwardIcon />
          </IconButton></span>
        </Tooltip>
        <Tooltip title={isPlaying ? "Playing" : "Run"}>
          <span><IconButton onClick={() => sketchRef.current.run()} disabled={isReversed || isPlaying || isAnimating}
            sx={{ background: isPlaying ? colors.success.main : colors.iconButton.background, color: colors.text.primary, border: `1px solid ${colors.iconButton.border}` }}>
            <PlayArrowIcon />
          </IconButton></span>
        </Tooltip>
        <Tooltip title="Pause">
          <span><IconButton onClick={() => sketchRef.current.pause()} disabled={isReversed || !isPlaying}
            sx={{ color: colors.text.primary, background: colors.iconButton.background, border: `1px solid ${colors.iconButton.border}`, "&:hover": { background: colors.iconButton.hoverBackground } }}>
            <PauseIcon />
          </IconButton></span>
        </Tooltip>
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
          <Box sx={styles.canvasWrapper}>
            <Box sx={styles.canvasBox}>
              <div ref={sketchRef} style={{ width: "100%", height: "100%" }} />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: { xs: 1.5, md: 2 }, width: "100%", display: "flex", flexDirection: "column", gap: 2, mx: "auto", bgcolor: colors.background.paper }}>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ color: colors.text.primary }}>Execution Steps</Typography>
                <Tooltip title="Copy Steps">
                  <IconButton onClick={copySteps} size="small" sx={{ color: colors.text.primary, background: colors.iconButton.background, border: `1px solid ${colors.iconButton.border}`, "&:hover": { background: colors.iconButton.hoverBackground } }}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Box ref={stepListRef} sx={styles.stepListBox}>
                {stepList.map((step, index) => (
                  <Typography key={index} variant="body2" sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap", mb: 0.5, color: colors.text.primary }}>{step}</Typography>
                ))}
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

export default RLL_EX1;

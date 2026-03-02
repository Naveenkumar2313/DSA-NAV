import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import p5 from "p5";
import { Box, Grid, Paper, Stack, Typography, Tooltip, IconButton, useTheme } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

import stepSoundFile from "/step.mp3";
import successSoundFile from "/success.mp3";
import failSoundFile from "/fail.mp3";

const getExampleColors = (theme) => {
  const isDark = theme?.palette?.mode === "dark" || theme?.palette?.type === "dark";
  return {
    primary: isDark ? "#90caf9" : "#2c3e50",
    secondary: isDark ? "#64b5f6" : "#89CFF0",
    success: isDark ? "#81c784" : "#b9fbc0",
    warning: isDark ? "#ffb74d" : "#FFD700",
    info: isDark ? "#4a5568" : "#E0E0E0",
    accent: isDark ? "#a78bfa" : "#ddd6fe",
    accentStroke: isDark ? "#a78bfa" : "#7c3aed",
    error: isDark ? "#e57373" : "#e57373",
    background: {
      paper: isDark ? "#000000" : "#ffffff",
      canvas: isDark ? "#000000" : "#ffffff"
    },
    text: {
      primary: isDark ? "#ffffff" : "#2c3e50",
      secondary: isDark ? "#b0bec5" : "#7f8c8d"
    },
    border: isDark ? "#1a1a1a" : "#e0e0e0",
    buttons: {
      bg: isDark ? "#1a1a1a" : "#ffffff",
      hoverBg: isDark ? "#333333" : "#f0f2f5",
      playBg: isDark ? "#2e7d32" : "#b9fbc0",
      pauseBg: isDark ? "#ef6c00" : "#ffe0b2",
      resetBg: isDark ? "#c62828" : "#ffcdd2"
    },
    stepListBox: {
      background: isDark ? "#0a0a0a" : "linear-gradient(90deg,#e0e7ff 0%,#f0f2f5 100%)",
      shadow: isDark ? "none" : "0 1px 4px 0 rgba(160,196,255,0.08)"
    },
    container: isDark ? "#000000" : "linear-gradient(135deg,#f0f2f5 0%,#e0e7ff 100%)"
  };
};

function buildTrieNodes(words, p, colors) {
  const root = makeNode("", p, colors);
  const allNodes = [root];
  for (const word of words) {
    let curr = root;
    for (const ch of word) {
      if (!curr.children[ch]) {
        const n = makeNode(ch, p, colors);
        curr.children[ch] = n;
        allNodes.push(n);
      }
      curr.children[ch].wordCount++;
      curr = curr.children[ch];
    }
    curr.isEnd = true;
  }
  return { root, allNodes };
}

function makeNode(char, p, colors) {
  return {
    char,
    children: {},
    isEnd: false,
    wordCount: 0,
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    scale: 1,
    targetScale: 1,
    color: p.color(colors.info),
    targetColor: p.color(colors.info),
    state: "default",
    visitOrder: null
  };
}

function layoutNodes(root, W, H) {
  const levels = [];
  const queue = [{ node: root, depth: 0 }];
  while (queue.length) {
    const { node, depth } = queue.shift();
    if (!levels[depth]) levels[depth] = [];
    levels[depth].push(node);
    for (const ch of Object.keys(node.children).sort())
      queue.push({ node: node.children[ch], depth: depth + 1 });
  }
  const LEVEL_H = H / (levels.length + 1);
  levels.forEach((nodesInLevel, d) => {
    const gap = W / (nodesInLevel.length + 1);
    nodesInLevel.forEach((node, i) => {
      node.targetX = gap * (i + 1);
      node.targetY = LEVEL_H * (d + 1);
      node.x = node.targetX;
      node.y = node.targetY;
    });
  });
}

const NWP_EX2 = () => {
  const theme = useTheme();
  const colors = getExampleColors(theme);
  const isDark = theme?.palette?.mode === "dark";
  const colorsRef = useRef(colors);
  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  const sketchRef = useRef();
  const stepListRef = useRef(null);
  const audioRefs = useRef({});

  const [stepList, setStepList] = useState([]);
  const [statusText, setStatusText] = useState("Status: Ready");
  const [isPlaying, setIsPlaying] = useState(false);

  // Scenario A: bat, ball, banana, band  → prefix "ba" → 4
  // Scenario B: dog, deer, door          → prefix "do" → 3, then prefix "dee" → 1
  const WORDS_A = ["bat", "ball", "banana", "band"];
  const PREFIX_A = "ba";
  const WORDS_B = ["dog", "deer", "door"];
  const PREFIX_B1 = "do";
  const PREFIX_B2 = "dee";

  useEffect(() => {
    if (stepListRef.current) stepListRef.current.scrollTop = stepListRef.current.scrollHeight;
  }, [stepList]);

  useLayoutEffect(() => {
    let root = null,
      allNodes = [];
    let steps = [],
      stepIdx = 0;
    let running = false,
      paused = true,
      done = false;
    let stepNumber = 1;
    let activeScenario = "A"; // track which trie is displayed

    const playSound = (t) => {
      if (!audioRefs.current[t]) return;
      audioRefs.current[t].currentTime = 0;
      audioRefs.current[t].play().catch(() => {});
    };

    function buildSteps(p, colors) {
      const seq = [];

      // ── Scenario A ─────────────────────────────────────────────────────────
      const { root: rA, allNodes: anA } = buildTrieNodes(WORDS_A, p, colors);
      function snapA(msg, sound) {
        seq.push({
          trieRoot: rA,
          trieAllNodes: anA,
          states: anA.map((n) => ({ node: n, state: n.state, visitOrder: n.visitOrder })),
          msg: `[A] ${msg}`,
          sound,
          scenario: "A"
        });
      }

      snapA(`Scenario A: words = ${WORDS_A.map((w) => `"${w}"`).join(", ")}`, "step");

      // Insert phase A
      for (const word of WORDS_A) {
        let curr = rA;
        for (const ch of word) {
          curr.children[ch].state = "current";
          snapA(
            `Inserting "${word}" — node '${ch}' (wordCount=${curr.children[ch].wordCount})`,
            "step"
          );
          curr.children[ch].state = "visited";
          curr = curr.children[ch];
        }
        curr.state = "visited";
        snapA(`"${word}" inserted ★`, "step");
        anA.forEach((n) => {
          if (n.state === "current") n.state = "visited";
        });
      }

      anA.forEach((n) => {
        n.state = "default";
        n.visitOrder = null;
      });
      snapA(`Searching prefix "${PREFIX_A}"...`, "step");

      let nodeA = rA,
        okA = true,
        cntA = 1;
      for (const ch of PREFIX_A) {
        nodeA.state = "current";
        snapA(`At root → looking for '${ch}'`, "step");
        if (!nodeA.children[ch]) {
          nodeA.state = "default";
          snapA(`'${ch}' missing — count=0`, "fail");
          okA = false;
          break;
        }
        nodeA.state = "prefix";
        nodeA = nodeA.children[ch];
        nodeA.state = "current";
        snapA(`Found '${ch}' — wordCount=${nodeA.wordCount}`, "step");
        nodeA.state = "prefix";
        nodeA.visitOrder = cntA++;
      }
      if (okA) {
        nodeA.state = "result";
        snapA(`Prefix "${PREFIX_A}" ends here — wordCount = ${nodeA.wordCount}`, "success");
        snapA(`✅ Count of words with prefix "${PREFIX_A}" = ${nodeA.wordCount}`, "success");
      }

      // ── Scenario B ─────────────────────────────────────────────────────────
      const { root: rB, allNodes: anB } = buildTrieNodes(WORDS_B, p, colors);
      function snapB(msg, sound) {
        seq.push({
          trieRoot: rB,
          trieAllNodes: anB,
          states: anB.map((n) => ({ node: n, state: n.state, visitOrder: n.visitOrder })),
          msg: `[B] ${msg}`,
          sound,
          scenario: "B"
        });
      }

      snapB(`Scenario B: words = ${WORDS_B.map((w) => `"${w}"`).join(", ")}`, "step");
      for (const word of WORDS_B) {
        let curr = rB;
        for (const ch of word) {
          curr.children[ch].state = "current";
          snapB(
            `Inserting "${word}" — node '${ch}' (wordCount=${curr.children[ch].wordCount})`,
            "step"
          );
          curr.children[ch].state = "visited";
          curr = curr.children[ch];
        }
        curr.state = "visited";
        snapB(`"${word}" inserted ★`, "step");
        anB.forEach((n) => {
          if (n.state === "current") n.state = "visited";
        });
      }

      // Prefix "do"
      anB.forEach((n) => {
        n.state = "default";
        n.visitOrder = null;
      });
      snapB(`Searching prefix "${PREFIX_B1}"...`, "step");
      let nodeB = rB,
        okB = true,
        cntB = 1;
      for (const ch of PREFIX_B1) {
        nodeB.state = "current";
        snapB(`At node "${nodeB.char || "root"}" → '${ch}'`, "step");
        if (!nodeB.children[ch]) {
          nodeB.state = "default";
          snapB(`'${ch}' missing — count=0`, "fail");
          okB = false;
          break;
        }
        nodeB.state = "prefix";
        nodeB = nodeB.children[ch];
        nodeB.state = "current";
        snapB(`Found '${ch}' — wordCount=${nodeB.wordCount}`, "step");
        nodeB.state = "prefix";
        nodeB.visitOrder = cntB++;
      }
      if (okB) {
        nodeB.state = "result";
        snapB(`Prefix "${PREFIX_B1}" — wordCount = ${nodeB.wordCount}`, "success");
        snapB(`✅ Count "${PREFIX_B1}" = ${nodeB.wordCount}`, "success");
      }

      // Prefix "dee"
      anB.forEach((n) => {
        n.state = "default";
        n.visitOrder = null;
      });
      snapB(`Now searching prefix "${PREFIX_B2}"...`, "step");
      let nodeB2 = rB,
        okB2 = true,
        cntB2 = 1;
      for (const ch of PREFIX_B2) {
        nodeB2.state = "current";
        snapB(`At node "${nodeB2.char || "root"}" → '${ch}'`, "step");
        if (!nodeB2.children[ch]) {
          nodeB2.state = "default";
          snapB(`'${ch}' missing — count=0`, "fail");
          okB2 = false;
          break;
        }
        nodeB2.state = "prefix";
        nodeB2 = nodeB2.children[ch];
        nodeB2.state = "current";
        snapB(`Found '${ch}' — wordCount=${nodeB2.wordCount}`, "step");
        nodeB2.state = "prefix";
        nodeB2.visitOrder = cntB2++;
      }
      if (okB2) {
        nodeB2.state = "result";
        snapB(`Prefix "${PREFIX_B2}" — wordCount = ${nodeB2.wordCount}`, "success");
        snapB(`✅ Count "${PREFIX_B2}" = ${nodeB2.wordCount}`, "success");
      }

      return seq;
    }

    const sketch = (p) => {
      p.setup = () => {
        audioRefs.current.step = new Audio(stepSoundFile);
        audioRefs.current.success = new Audio(successSoundFile);
        audioRefs.current.fail = new Audio(failSoundFile);
        const cont = sketchRef.current;
        p.createCanvas(cont.offsetWidth, cont.offsetHeight).parent(cont);
        p.textAlign(p.CENTER, p.CENTER);
        p.reset();
      };

      p.draw = () => {
        const c = colorsRef.current;
        p.background(c.background.canvas);
        allNodes.forEach((n) => {
          n.x = p.lerp(n.x, n.targetX, 0.08);
          n.y = p.lerp(n.y, n.targetY, 0.08);
          n.scale = p.lerp(n.scale, n.targetScale, 0.1);
          n.color = p.lerpColor(n.color, n.targetColor, 0.12);
          switch (n.state) {
            case "current":
              n.targetColor = p.color(c.warning);
              n.targetScale = 1.25 + p.sin(p.frameCount * 0.12) * 0.08;
              break;
            case "visited":
              n.targetColor = p.color(c.secondary);
              n.targetScale = 1.0;
              break;
            case "prefix":
              n.targetColor = p.color(c.accent);
              n.targetScale = 1.1;
              break;
            case "result":
              n.targetColor = p.color(c.success);
              n.targetScale = 1.2;
              break;
            default:
              n.targetColor = p.color(c.info);
              n.targetScale = 1.0;
              break;
          }
        });
        drawEdges(p);
        drawNodes(p);
        if (running && !paused && !done && p.frameCount % 60 === 0) performStep(p);
      };

      function drawEdges(p) {
        const c = colorsRef.current;
        function recurse(node) {
          for (const ch of Object.keys(node.children).sort()) {
            const child = node.children[ch];
            const isPfx =
              (child.state === "prefix" || child.state === "result" || child.state === "current") &&
              node.state !== "default";
            if (isPfx) {
              p.push();
              p.stroke(c.warning);
              p.strokeWeight(3);
              p.drawingContext.setLineDash([8, 5]);
              p.line(node.x, node.y, child.x, child.y);
              p.drawingContext.setLineDash([]);
              const mid = p5.Vector.lerp(
                p.createVector(node.x, node.y),
                p.createVector(child.x, child.y),
                0.55
              );
              const ang = p.atan2(child.y - node.y, child.x - node.x);
              p.translate(mid.x, mid.y);
              p.rotate(ang);
              p.fill(c.warning);
              p.noStroke();
              p.triangle(0, 0, -14, -6, -14, 6);
              p.pop();
            } else {
              p.stroke(c.text.secondary);
              p.strokeWeight(2);
              p.line(node.x, node.y, child.x, child.y);
            }
            recurse(child);
          }
        }
        recurse(root);
      }

      function drawNodes(p) {
        const c = colorsRef.current;
        const R = 26;
        function recurse(node) {
          if (node.char !== "") {
            if (node.state === "result") {
              p.noStroke();
              p.fill(p.red(node.color), p.green(node.color), p.blue(node.color), 60);
              p.ellipse(node.x, node.y, (R + 10) * 2 * node.scale, (R + 10) * 2 * node.scale);
            }
            p.stroke(c.primary);
            p.strokeWeight(2.5);
            p.fill(node.color);
            p.ellipse(node.x, node.y, R * 2 * node.scale, R * 2 * node.scale);
            p.noStroke();
            p.fill(c.text.primary);
            p.textSize(14);
            p.textStyle(p.BOLD);
            p.text(node.char, node.x, node.y - 4);
            p.textStyle(p.NORMAL);
            p.textSize(10);
            p.fill(c.accentStroke);
            p.text(`#${node.wordCount}`, node.x, node.y + 8);
            p.textSize(14);
            if (node.isEnd) {
              p.fill(node.state === "result" ? c.success : c.accentStroke);
              p.textSize(11);
              p.text("★", node.x, node.y + R + 10);
              p.textSize(14);
            }
          }
          for (const ch of Object.keys(node.children).sort()) recurse(node.children[ch]);
        }
        recurse(root);
      }

      function performStep(p) {
        if (stepIdx >= steps.length) {
          done = true;
          running = false;
          paused = true;
          setIsPlaying(false);
          return;
        }
        const s = steps[stepIdx];
        // Switch trie if scenario changed
        if (s.scenario !== activeScenario) {
          activeScenario = s.scenario;
          root = s.trieRoot;
          allNodes = s.trieAllNodes;
          layoutNodes(root, p.width, p.height);
        }
        s.states.forEach(({ node, state, visitOrder }) => {
          node.state = state;
          node.visitOrder = visitOrder;
        });
        const msg = `Step ${stepNumber++}: ${s.msg}`;
        setStatusText(msg);
        setStepList((prev) => [...prev, msg]);
        if (s.sound) playSound(s.sound);
        stepIdx++;
        if (stepIdx >= steps.length) {
          done = true;
          running = false;
          paused = true;
          setIsPlaying(false);
        }
      }

      p.reset = () => {
        steps = buildSteps(p, colorsRef.current);
        // Start with scenario A
        root = steps[0].trieRoot;
        allNodes = steps[0].trieAllNodes;
        activeScenario = "A";
        layoutNodes(root, p.width, p.height);
        stepIdx = 0;
        stepNumber = 1;
        running = false;
        paused = true;
        done = false;
        setStepList([]);
        setStatusText("Status: Ready — Scenario A + B");
        setIsPlaying(false);
      };

      p.step = () => {
        if (done) return;
        paused = true;
        running = false;
        setIsPlaying(false);
        performStep(p);
      };
      p.run = () => {
        if (done) return;
        running = true;
        paused = false;
        setIsPlaying(true);
      };
      p.pause = () => {
        paused = true;
        running = false;
        setIsPlaying(false);
      };
      p.prev = () => {
        if (stepIdx <= 1) return;
        paused = true;
        running = false;
        setIsPlaying(false);
        stepIdx = Math.max(0, stepIdx - 2);
        const s = steps[stepIdx];
        if (s.scenario !== activeScenario) {
          activeScenario = s.scenario;
          root = s.trieRoot;
          allNodes = s.trieAllNodes;
          layoutNodes(root, p.width, p.height);
        }
        s.states.forEach(({ node, state, visitOrder }) => {
          node.state = state;
          node.visitOrder = visitOrder;
        });
        setStepList((prev) => prev.slice(0, -1));
        if (stepNumber > 1) stepNumber--;
        setStatusText(`Step ${stepNumber}: ${s.msg}`);
        stepIdx++;
      };

      p.windowResized = () => {
        const cont = sketchRef.current;
        if (cont) {
          p.resizeCanvas(cont.offsetWidth, cont.offsetHeight);
          layoutNodes(root, p.width, p.height);
        }
      };
    };

    const p5Inst = new p5(sketch, sketchRef.current);
    if (sketchRef.current)
      Object.assign(sketchRef.current, {
        reset: p5Inst.reset,
        step: p5Inst.step,
        run: p5Inst.run,
        pause: p5Inst.pause,
        prev: p5Inst.prev
      });
    return () => p5Inst.remove();
  }, []);

  const c = colors;
  const btn = (title, icon, onClick, bg) => (
    <Tooltip title={title} key={title}>
      <IconButton
        onClick={onClick}
        sx={{
          color: c.text.primary,
          bgcolor: bg || c.buttons.bg,
          border: `1px solid ${c.border}`,
          "&:hover": { bgcolor: c.buttons.hoverBg }
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, background: c.container, minHeight: "100vh" }}>
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom sx={{ color: c.text.primary, fontWeight: 700 }}>
          Example 2
        </Typography>
        <Typography variant="body2" sx={{ color: c.text.secondary }}>
          <strong>[A]</strong> "bat","ball","banana","band" → prefix <strong>"ba"</strong> →{" "}
          <strong>4</strong>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <strong>[B]</strong> "dog","deer","door" → prefix <strong>"do"</strong> →{" "}
          <strong>3</strong>, prefix <strong>"dee"</strong> → <strong>1</strong>
        </Typography>
      </Box>

      <Box sx={{ p: 1, mb: 2, display: "flex", justifyContent: "center", gap: 1.5 }}>
        {btn("Reset", <RestartAltIcon />, () => sketchRef.current.reset(), c.buttons.resetBg)}
        {btn("Prev Step", <ArrowBackIcon />, () => sketchRef.current.prev())}
        {btn("Next Step", <ArrowForwardIcon />, () => sketchRef.current.step())}
        {btn(
          isPlaying ? "Playing" : "Run",
          <PlayArrowIcon />,
          () => sketchRef.current.run(),
          isPlaying ? c.buttons.pauseBg : c.buttons.playBg
        )}
        {btn("Pause", <PauseIcon />, () => sketchRef.current.pause(), c.buttons.pauseBg)}
      </Box>

      <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
        <Stack
          direction="row"
          spacing={2}
          flexWrap="wrap"
          justifyContent="center"
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)",
            border: `1px solid ${c.border}`
          }}
        >
          <LegendItem color={c.warning} text="Current" textColor={c.text.primary} />
          <LegendItem color={c.secondary} text="Inserted" textColor={c.text.primary} />
          <LegendItem color={c.accent} text="Prefix Path" textColor={c.text.primary} />
          <LegendItem color={c.success} text="Result Node" textColor={c.text.primary} />
          <LegendItem color={c.info} text="Unvisited" textColor={c.text.primary} />
        </Stack>
      </Box>

      <Typography
        variant="body1"
        align="center"
        sx={{ mb: 2, color: c.text.primary, fontStyle: "italic" }}
      >
        {statusText}
      </Typography>

      <Grid container spacing={{ xs: 2, md: 4 }} justifyContent="center" alignItems="flex-start">
        <Grid item xs={12} md={7} lg={8}>
          <Box
            sx={{
              position: "relative",
              borderRadius: "20px",
              overflow: "hidden",
              background: c.background.paper,
              border: `1px solid ${c.border}`,
              boxShadow: isDark ? "none" : "0 8px 32px rgba(44,62,80,0.12)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Box sx={{ width: "100%", maxWidth: 800, aspectRatio: "16/9" }}>
              <div ref={sketchRef} style={{ width: "100%", height: "100%" }} />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={5} lg={4}>
          <Paper
            elevation={isDark ? 0 : 3}
            sx={{
              p: { xs: 1.5, md: 2 },
              display: "flex",
              flexDirection: "column",
              gap: 2,
              bgcolor: c.background.paper,
              border: `1px solid ${c.border}`
            }}
          >
            <Typography variant="h6" sx={{ color: c.text.primary }}>
              Execution Steps
            </Typography>
            <Box
              ref={stepListRef}
              sx={{
                overflowY: "auto",
                p: 1.5,
                borderRadius: 3,
                maxHeight: { xs: 200, md: 400 },
                background: c.stepListBox.background,
                border: `1.5px solid ${c.border}`,
                boxShadow: c.stepListBox.shadow
              }}
            >
              {stepList.map((s, i) => (
                <Typography
                  key={i}
                  variant="body2"
                  sx={{
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    mb: 0.5,
                    color: c.text.primary
                  }}
                >
                  {s}
                </Typography>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
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

export default NWP_EX2;

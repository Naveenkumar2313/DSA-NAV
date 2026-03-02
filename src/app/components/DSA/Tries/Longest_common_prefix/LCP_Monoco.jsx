import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import {
  Box, Button, Stack, Typography, Tooltip, IconButton, MenuItem,
  Select, FormControl, InputLabel, useTheme,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { LCPcodeSnippets } from "./LCPcodeSnippets";

const LANGUAGES = [
  { label: "C",      value: "c"      },
  { label: "C++",    value: "cpp"    },
  { label: "Python", value: "python" },
  { label: "Java",   value: "java"   },
];

const LCP_Monoco = () => {
  const theme  = useTheme();
  const isDark = theme?.palette?.mode === "dark";
  const [lang,   setLang]   = useState("cpp");
  const [copied, setCopied] = useState(false);

  const code = LCPcodeSnippets[lang] || "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Copy failed.");
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      <Typography variant="h5" align="center" gutterBottom
        sx={{ color: isDark ? "#f1f5f9" : "#2c3e50" }}>
        Code — Longest Common Prefix (Trie)
      </Typography>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel sx={{ color: isDark ? "#94a3b8" : "#64748b" }}>Language</InputLabel>
          <Select
            value={lang} label="Language"
            onChange={e => setLang(e.target.value)}
            sx={{
              color: isDark ? "#f1f5f9" : "#2c3e50",
              bgcolor: isDark ? "#000" : "#fff",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "#333" : "#e0e0e0" },
              "& .MuiSvgIcon-root": { color: isDark ? "#f1f5f9" : "#2c3e50" },
            }}
            MenuProps={{ PaperProps: { sx: { bgcolor: isDark ? "#0a0a0a" : "#fff",
              "& .MuiMenuItem-root": { color: isDark ? "#f1f5f9" : "#2c3e50" } } } }}
          >
            {LANGUAGES.map(l => <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>)}
          </Select>
        </FormControl>

        <Tooltip title={copied ? "Copied!" : "Copy Code"}>
          <IconButton onClick={handleCopy} size="small"
            sx={{ color: isDark ? "#f1f5f9" : "#2c3e50",
                  background: isDark ? "#0a0a0a" : "#fff",
                  border: `1px solid ${isDark ? "#333" : "#e0e0e0"}`,
                  "&:hover": { background: isDark ? "#1a1a1a" : "#f0f2f5" } }}>
            {copied ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Stack>

      <Box sx={{ borderRadius: "12px", overflow: "hidden",
                 border: `1px solid ${isDark ? "#333" : "#e0e0e0"}`,
                 boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(44,62,80,0.12)" }}>
        <Editor
          height="520px"
          language={lang === "cpp" ? "cpp" : lang}
          value={code}
          theme={isDark ? "vs-dark" : "light"}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
          }}
        />
      </Box>
    </Box>
  );
};

export default LCP_Monoco;

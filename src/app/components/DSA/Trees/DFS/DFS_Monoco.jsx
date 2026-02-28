import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { DFScodeSnippets } from './DFScodeSnippets';

const DFS_Monoco = () => {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(DFScodeSnippets['python']);
  const toastRef = useRef();

  useEffect(() => {
    setCode(DFScodeSnippets[language]);
  }, [language]);

  const showToast = (msg) => {
    const toast = toastRef.current;
    if (!toast) return;
    toast.innerText = msg;
    toast.style.visibility = 'visible';
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.visibility = 'hidden';
    }, 2000);
  };

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <div>
        <div style={{ marginBottom: 10 }}>
          <label>Language: </label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>

        <Editor
          height="400px"
          language={language}
          value={code}
          onChange={(value) => setCode(value ?? '')}
          theme="vs-dark"
          options={{ fontSize: 14 }}
        />

<div ref={toastRef} style={{ visibility: 'hidden', opacity: 0, position: 'fixed', bottom: 30, right: 30, backgroundColor: '#333', color: '#fff', padding: '10px 16px', borderRadius: 8 }}>
        ✅ Steps copied to clipboard!
      </div>

<div style={{ marginTop: '10px' }}>
<button onClick={() => {
  if (!code) return;
  navigator.clipboard.writeText(code).then(() => {
    showToast("✅ Code copied to clipboard!");
  }).catch(() => {
    showToast("❌ Copy failed.");
  });
}}>
  📋 Copy Code
</button>

</div>
      </div>
    </div>
  );
};

export default DFS_Monoco;

import React, { useState } from 'react';
import TP_EX1 from './TP_EX1';
import TP_EX2 from './TP_EX2';
import TPLab from './TPLab';
import TP_Monoco from './TP_Monoco';

const TP_template = () => {
    const [activePage, setActivePage] = useState('aim');
    const [showExamples, setShowExamples] = useState(false);
  
    const renderContent = () => {
      switch (activePage) {
        case 'aim':
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
      <h2>Aim</h2>
      <p>
        The aim of this visualization is to help learners understand how the <strong>Two Pointer Technique</strong> can be used to check whether an array is a <strong>palindrome</strong> or not using intuitive step-by-step animations.
      </p>

      <p>
        This simulator enables users to:
      </p>
      <ul>
        <li>Visualize how two pointers (Left and Right) move inward from both ends of the array.</li>
        <li>Observe element-by-element comparison between the left and right pointers.</li>
        <li>Understand how the algorithm concludes whether the array is a palindrome.</li>
        <li>Interactively control steps, go back, play/pause, and trace the execution history.</li>
        <li>Receive audio feedback and real-time status updates.</li>
        <li>Learn that this technique runs in O(n) time and O(1) space.</li>
      </ul>

      <p>
        This is ideal for learners exploring array-based problems and the two-pointer approach.
      </p>
    </div>
  );
        case 'theory':
          return (<div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <p><b>Definition:</b> A palindrome array reads the same forwards and backwards. The Two Pointer technique uses two indices — one starting from the beginning (left) and one from the end (right) — moving toward each other.</p>
          
            <p><b>Working Principle:</b> At each step, the elements at the left and right pointers are compared. If they match, both pointers move inward. If they don't match, the array is not a palindrome.</p>
          
            <p><b>Algorithm Steps:</b></p>
            <ol>
              <li>Initialize <code>left = 0</code> and <code>right = n - 1</code>.</li>
              <li>While <code>left &lt; right</code>:
                <ul>
                  <li>If <code>arr[left] == arr[right]</code>, increment left, decrement right.</li>
                  <li>Else, return "Not a Palindrome".</li>
                </ul>
              </li>
              <li>If all comparisons pass, return "Is a Palindrome".</li>
            </ol>

            <p><b>Advantages:</b></p>
            <ul>
              <li>Very efficient — only requires a single pass through half the array.</li>
              <li>No extra space needed beyond two pointer variables.</li>
            </ul>
          
            <p><b>Disadvantages:</b></p>
            <ul>
              <li>Only works for checking palindromes in linear structures (arrays, strings).</li>
            </ul>
          
            <p><b>Time Complexity:</b> <code>O(n)</code></p>
            <p><b>Space Complexity:</b> <code>O(1)</code></p>
          </div>
          );
        case 'procedure':
          return (<div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <b>How to Use the Two Pointer Palindrome Visualizer:</b>
            <ol>
              <li>Choose between <b>Auto Generate</b> mode (random array) or <b>Manual Input</b> mode.</li>
              <li>Set the desired <b>Array Size</b> (1 to 20 elements).</li>
              <li>In manual mode, enter array values and click <b>Apply Manual Array</b>.</li>
              <li>Click <b>Generate & Reset</b> to create a new array or reset the current one.</li>
              <li>Click <b>Next Step</b> to perform one comparison between left and right pointers.</li>
              <li>Click <b>Run</b> to automatically step through the entire palindrome check.</li>
              <li>Use <b>Pause</b> to halt the animation at any time.</li>
              <li>Use <b>Previous Step</b> to undo and go back.</li>
              <li>The <b>Left</b> and <b>Right</b> pointer positions are highlighted on the array.</li>
              <li>Matched pairs are shown in a distinct color, and a curved arc connects the compared elements.</li>
              <li>The final result (Palindrome / Not Palindrome) is displayed with color coding.</li>
            </ol>
          </div>
          );
        case 'example1':
          return <TP_EX1 />;
        case 'example2':
          return <TP_EX2 />;
        case 'simulation':
          return <TPLab  />;
        case 'Code':
          return <TP_Monoco />;
        case 'feedback':
          return <Section title="Feedback" text="Please submit your feedback about this simulation." />;
        default:
          return null;
      }
    };
  
    return (
      <div>
        <Navbar setActivePage={setActivePage} showExamples={showExamples} setShowExamples={setShowExamples} />
        <div style={{textAlign:"center", fontSize:"20px", marginTop:"10px"}}><b>TWO POINTER — PALINDROME CHECK</b></div>
        <div style={{ paddingBottom: '20px', marginTop:'0px'}}>{renderContent()}</div>
      </div>
    );
  };
  
  const Navbar = ({ setActivePage, showExamples, setShowExamples }) => (
    <nav style={styles.navbar}>
      <button onClick={() => setActivePage('aim')}>Aim</button>
      <button onClick={() => setActivePage('theory')}>Theory</button>
      <button onClick={() => setActivePage('procedure')}>Procedure</button>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button onClick={() => setShowExamples(prev => !prev)}>Examples ▾</button>
        {showExamples && (
          <div style={styles.dropdown}>
            <button onClick={() => { setActivePage('example1'); setShowExamples(false); }}>Example 1</button>
            <button onClick={() => { setActivePage('example2'); setShowExamples(false); }}>Example 2</button>
          </div>
        )}
      </div>
      <button onClick={() => setActivePage('simulation')}>Simulation</button>
      <button onClick={() => setActivePage('Code')}>Code</button>
      <button onClick={() => setActivePage('feedback')}>Feedback</button>
    </nav>
  );
  
  const Section = ({ title, text }) => (
    <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
      <h2>{title}</h2>
      <p style={{ whiteSpace: 'pre-line' }}>{text}</p>
    </div>
  );
  
  const styles = {
    navbar: {
      display: 'flex',
      gap: '10px',
      backgroundColor: '#333',
      padding: '10px',
      color: '#fff',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      backgroundColor: '#444',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10,
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    },
  };

export default TP_template;

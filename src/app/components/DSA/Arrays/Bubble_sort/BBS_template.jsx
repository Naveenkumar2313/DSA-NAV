import React, { useState } from 'react';
import BBS_EX1 from './BBS_EX1';
import BBS_EX2 from './BBS_EX2';
import BBSLab from './BBSLab';
import BBS_Monoco from './BBS_Monoco';

const BBS_template = () => {
    const [activePage, setActivePage] = useState('aim');
    const [showExamples, setShowExamples] = useState(false);
  
    const renderContent = () => {
      switch (activePage) {
        case 'aim':
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
      <h2>Aim</h2>
      <p>
        The aim of this visual tool is to demonstrate how the <strong>Bubble Sort</strong> algorithm sorts an array by repeatedly comparing and swapping adjacent elements.
      </p>

      <p>
        Through this visualization, learners can:
      </p>
      <ul>
        <li>See comparisons and swaps between elements in real-time.</li>
        <li>Understand pass-by-pass progress of bubble sort.</li>
        <li>Track how larger elements "bubble up" to the end of the array.</li>
        <li>View step-by-step history and total steps involved.</li>
        <li>Experience audio cues for swaps and completion.</li>
      </ul>

      <p>
        This simulator is great for beginners starting out with sorting algorithms and learning about time complexity O(n²).
      </p>
    </div>
  );
        case 'theory':
          return (<div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <p><b>Definition:</b> Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.</p>
          
            <p><b>Working Principle:</b> On each pass, the largest unsorted element "bubbles up" to its correct position. This process continues until no more swaps are needed.</p>
          
            <p><b>Advantages:</b></p>
            <ul>
              <li>Simple to understand and implement.</li>
              <li>Does not require additional space — in-place sorting.</li>
            </ul>
          
            <p><b>Disadvantages:</b></p>
            <ul>
              <li>Highly inefficient for large datasets.</li>
              <li>Requires many passes even for nearly sorted arrays.</li>
            </ul>
          
            <p><b>Time Complexity:</b> <code>O(n^2)</code> in worst and average cases, <code>O(n)</code> if already sorted.</p>
            <p><b>Space Complexity:</b> <code>O(1)</code> (in-place algorithm).</p>
          </div>
          );
          case 'procedure':
            return (
              <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
  <b>How to Use the Bubble Sort Visualizer:</b>
  <ol>
    <li>Click <b>Reset</b> to initialize the unsorted array.</li>
    <li>Click <b>Next Step</b> to manually trigger one comparison/swap between adjacent elements.</li>
    <li>Click <b>Run</b> to allow the algorithm to run automatically.</li>
    <li>Click <b>Pause</b> to stop the animation at any time.</li>
    <li>Red bars represent the currently compared elements.</li>
    <li>Observe how the largest elements "bubble up" to the end of the array after each pass.</li>
    <li>Once sorting is complete, a confirmation message will be shown in the status bar.</li>
    <li>Sort steps are recorded in the text area to the right — use the <b>📋 Copy Steps</b> button to export them.</li>
  </ol>
</div>

            );
        case 'example1':
          return <BBS_EX1 />;
        case 'example2':
          return <BBS_EX2 />;
        case 'simulation':
          return <BBSLab  />;
        case 'Code':
          return <BBS_Monoco />;
        case 'feedback':
          return <Section title="Feedback" text="Please submit your feedback about this simulation." />;
        default:
          return null;
      }
    };
  
    return (
      <div>
        <Navbar setActivePage={setActivePage} showExamples={showExamples} setShowExamples={setShowExamples} />
        <div style={{textAlign:"center", fontSize:"20px", marginTop:"10px"}}><b>BUBBLE SORT</b></div>
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

export default BBS_template;

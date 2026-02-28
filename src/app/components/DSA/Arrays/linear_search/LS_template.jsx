import React, { useState } from 'react';
import LS_EX1 from './LS_EX1';
import LS_EX2 from './LS_EX2';
import LSLab from './LSLab';
import LS_Monoco from './LS_Monoco';

const LS_template = () => {
    const [activePage, setActivePage] = useState('aim');
    const [showExamples, setShowExamples] = useState(false);
  
    const renderContent = () => {
      switch (activePage) {
        case 'aim':
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
      <h2>Aim</h2>
      <p>
        The aim of this simulation is to showcase the working of the <strong>Linear Search</strong> algorithm to find a target value in an unsorted array.
      </p>

      <p>
        This tool allows users to:
      </p>
      <ul>
        <li>Understand how each element is checked from left to right.</li>
        <li>Visualize visited elements and the current index pointer.</li>
        <li>Receive feedback upon success or failure of search.</li>
        <li>Track the number of steps taken to reach the result.</li>
        <li>Use step and run modes to control the visualization speed.</li>
      </ul>

      <p>
        Ideal for beginners, this helps reinforce the concept of brute-force searching and highlights the O(n) time complexity.
      </p>
    </div>
  );
        case 'theory':
          return (<div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <p><b>Definition:</b> Linear Search is a simple searching algorithm that checks each element in the array sequentially until the target value is found or the list ends.</p>
          
            <p><b>Working Principle:</b> It starts from the first element and compares the target value with each element one by one.</p>
          
            <p><b>Advantages:</b></p>
            <ul>
              <li>Works on both sorted and unsorted arrays.</li>
              <li>Simple and intuitive to implement.</li>
            </ul>
          
            <p><b>Disadvantages:</b></p>
            <ul>
              <li>Inefficient for large datasets.</li>
              <li>Time-consuming if the element is near the end or not present.</li>
            </ul>
          
            <p><b>Time Complexity:</b> <code>O(n)</code></p>
            <p><b>Space Complexity:</b> <code>O(1)</code></p>
          </div>
          );
        case 'procedure':
          return (<div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <b>How to Use the Linear Search Visualizer:</b>
            <ol>
              <li>Set the target value using the input field.</li>
              <li>Click <b>Set Target</b> to apply the value.</li>
              <li>Click <b>Reset</b> to reload the array and reset all states.</li>
              <li>Click <b>Next Step</b> to check one element at a time from left to right.</li>
              <li>Click <b>Run</b> to perform the full search automatically.</li>
              <li>Click <b>Pause</b> to stop the animation at any time.</li>
              <li>Visited elements will be highlighted and skipped on future steps.</li>
              <li>Once the element is found or not found, you will see the result and can review the search steps.</li>
              <li>Copy all step logs using the <b>📋 Copy Steps</b> button.</li>
            </ol>
          </div>
          );
        case 'example1':
          return <LS_EX1 />;
        case 'example2':
          return <LS_EX2 />;
        case 'simulation':
          return <LSLab  />;
        case 'Code':
          return <LS_Monoco />;
        case 'feedback':
          return <Section title="Feedback" text="Please submit your feedback about this simulation." />;
        default:
          return null;
      }
    };
  
    return (
      <div>
        <Navbar setActivePage={setActivePage} showExamples={showExamples} setShowExamples={setShowExamples} />
        <div style={{textAlign:"center", fontSize:"20px", marginTop:"10px"}}><b>LINEAR SEARCH</b></div>
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

export default LS_template;

import React, { useState } from 'react';
import QOP from './QOP';
import QOP_Monoco from './QOP_Monoco';

const QOP_template = () => {
    const [activePage, setActivePage] = useState('aim');
    const [showExamples, setShowExamples] = useState(false);
  
    const renderContent = () => {
      switch (activePage) {
        case 'aim':
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
      <h2>Aim</h2>
      <p>
        The aim of this visualization is to help learners understand the working of the <strong>Binary Search algorithm</strong> on a sorted array using intuitive animations and interactive control.
      </p>

      <p>
        This simulator enables users to:
      </p>
      <ul>
        <li>Visualize how the search range narrows using low, mid, and high pointers.</li>
        <li>Identify how decisions are made to go left or right in the array.</li>
        <li>Interactively control steps and trace the search history.</li>
        <li>Receive audio feedback and real-time updates on search status.</li>
        <li>Learn how binary search achieves O(log n) efficiency.</li>
      </ul>

      <p>
        This is ideal for learners exploring search techniques and optimizing solutions involving sorted data.
      </p>
    </div>
  );
        case 'theory':
          return (<div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <p><b>Definition:</b> Binary Search is an efficient searching algorithm used to find a target value in a sorted array by repeatedly dividing the search interval in half.</p>
          
            <p><b>Working Principle:</b> It compares the target value with the middle element. If it matches, search ends. If the target is smaller, the search continues in the left half; if larger, in the right half.</p>
          
            <p><b>Precondition:</b> The array must be sorted in ascending or descending order.</p>
          
            <p><b>Advantages:</b></p>
            <ul>
              <li>Much faster than linear search for large datasets.</li>
              <li>Time complexity is logarithmic, making it highly efficient.</li>
            </ul>
          
            <p><b>Disadvantages:</b></p>
            <ul>
              <li>Cannot be applied to unsorted data.</li>
              <li>Requires random access — not suitable for linked lists.</li>
            </ul>
          
            <p><b>Time Complexity:</b> <code>O(log n)</code></p>
            <p><b>Space Complexity:</b> <code>O(1)</code> for iterative, <code>O(log n)</code> for recursive implementation.</p>
          </div>
          );
        case 'procedure':
          return (<div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <b>How to Use the Binary Search Visualizer:</b>
            <ol>
              <li>Set the target value using the input field.</li>
              <li>Click <b>Set Target</b> to apply the value.</li>
              <li>Click <b>Reset</b> to reload the array.</li>
              <li>Click <b>Next Step</b> to perform one iteration of binary search (compare mid element).</li>
              <li>Click <b>Run</b> to automatically search through the array step-by-step.</li>
              <li>Use <b>Pause</b> to halt the animation at any time.</li>
              <li>The positions of <b>Low</b>, <b>Mid</b>, and <b>High</b> pointers will be shown for each step.</li>
              <li>Once the element is found or not found, the steps will be shown on the right panel.</li>
              <li>You can copy the search steps to clipboard using the <b>📋 Copy Steps</b> button.</li>
            </ol>
          </div>
          );
        case 'simulation':
          return <QOP />;
        case 'Code':
          return <QOP_Monoco />;
        case 'feedback':
          return <Section title="Feedback" text="Please submit your feedback about this simulation." />;
        default:
          return null;
      }
    };
  
    return (
      <div>
        <Navbar setActivePage={setActivePage} showExamples={showExamples} setShowExamples={setShowExamples} />
        <div style={{textAlign:"center", fontSize:"20px", marginTop:"10px"}}><b>QUEUE OPERATIONS</b></div>
        <div style={{ paddingBottom: '20px', marginTop:'0px'}}>{renderContent()}</div>
      </div>
    );
  };
  
  const Navbar = ({ setActivePage, showExamples, setShowExamples }) => (
    <nav style={styles.navbar}>
      <button onClick={() => setActivePage('aim')}>Aim</button>
      <button onClick={() => setActivePage('theory')}>Theory</button>
      <button onClick={() => setActivePage('procedure')}>Procedure</button>
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

export default QOP_template;

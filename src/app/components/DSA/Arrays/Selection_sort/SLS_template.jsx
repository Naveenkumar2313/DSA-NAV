import React, { useState } from 'react';
import SLS_EX1 from './SLS_EX1';
import SLS_EX2 from './SLS_EX2';
import SLSLab from './SLSLab';
import SLS_Monoco from './SLS_Monoco';

const SLS_template = () => {
    const [activePage, setActivePage] = useState('aim');
    const [showExamples, setShowExamples] = useState(false);
  
    const renderContent = () => {
      switch (activePage) {
        case 'aim':
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
      <h2>Aim</h2>
      <p>
        The objective of this simulation is to help users learn and visualize the <strong>Selection Sort</strong> algorithm, where the smallest element is repeatedly selected and moved to its correct position.
      </p>

      <p>
        Using this simulator, users can:
      </p>
      <ul>
        <li>Track comparisons to identify the minimum element in each pass.</li>
        <li>View swaps as elements are placed at their correct sorted position.</li>
        <li>Understand how selection sort maintains two subarrays: sorted and unsorted.</li>
        <li>Control progression through Next Step, Run, and Pause features.</li>
        <li>View sort history, step count, and result summary.</li>
      </ul>

      <p>
        This helps build foundational understanding of sorting logic and time complexity O(n²), useful for learning algorithm design basics.
      </p>
    </div>
  );
        case 'theory':
          return (<div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <p><b>Definition:</b> Selection Sort is a simple sorting algorithm that divides the array into a sorted and unsorted part, and repeatedly selects the smallest (or largest) element from the unsorted part and moves it to the sorted part.</p>
          
            <p><b>Working Principle:</b> It scans the entire unsorted part to find the minimum and swaps it with the first unsorted element. This process is repeated for the remaining unsorted part.</p>
          
            <p><b>Advantages:</b></p>
            <ul>
              <li>Performs well on small arrays.</li>
              <li>In-place sorting with minimal memory usage.</li>
            </ul>
          
            <p><b>Disadvantages:</b></p>
            <ul>
              <li>Does not adapt to already sorted input.</li>
              <li>Generally slower than other O(n²) algorithms like insertion sort.</li>
            </ul>
          
            <p><b>Time Complexity:</b> <code>O(n²)</code></p>
            <p><b>Space Complexity:</b> <code>O(1)</code></p>
          </div>
          );
        case 'procedure':
          return (<div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <b>How to Use the Selection Sort Visualizer:</b>
            <ol>
              <li>Click <b>Reset</b> to initialize the unsorted array.</li>
              <li>Click <b>Next Step</b> to compare and place one smallest element at a time.</li>
              <li>Click <b>Run</b> to start automatic sorting of the array.</li>
              <li>Click <b>Pause</b> to stop the animation at any time.</li>
              <li>During each pass, the currently selected minimum and current index will be highlighted.</li>
              <li>Once sorting is complete, a confirmation message is displayed and steps will be locked.</li>
              <li>Use the step viewer to review how selections and swaps were made.</li>
              <li>Copy steps using the <b>📋 Copy Steps</b> button for reporting or export.</li>
            </ol>
          </div>
          );
        case 'example1':
          return <SLS_EX1 />;
        case 'example2':
          return <SLS_EX2 />;
        case 'simulation':
          return <SLSLab/>;
        case 'Code':
          return <SLS_Monoco />;
        case 'feedback':
          return <Section title="Feedback" text="Please submit your feedback about this simulation." />;
        default:
          return null;
      }
    };
  
    return (
      <div>
        <Navbar setActivePage={setActivePage} showExamples={showExamples} setShowExamples={setShowExamples} />
        <div style={{textAlign:"center", fontSize:"20px", marginTop:"10px"}}><b>SELECTION SORT</b></div>
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

export default SLS_template;

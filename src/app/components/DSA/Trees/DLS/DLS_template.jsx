import React, { useState } from 'react';
import DLS_EX1 from './DLS_EX1';
import DLS_EX2 from './DLS_EX2';
import DLSLab from './DLSLab';
import DLS_Monoco from './DLS_Monoco';

const DLS_template = () => {
    const [activePage, setActivePage] = useState('aim');
    const [showExamples, setShowExamples] = useState(false);
  
    const renderContent = () => {
      switch (activePage) {
        case 'aim':
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
      <h2>Aim</h2>
      <p>
        The aim of this simulation is to demonstrate<strong> Depth-First Search (DFS)</strong> traversal on tree data structures using an interactive visual interface.
      </p>

      <p>
        Through this simulation, users can:
      </p>
      <ul>
        <li>Understand the recursive or stack-based behavior of DFS.</li>
        <li>Visualize traversal from root to deep leaves before backtracking.</li>
        <li>Observe the visiting order and how nodes are pushed and popped.</li>
        <li>Track current node and previously visited nodes with color highlights and sound cues.</li>
        <li>Control the traversal using step, run, pause, and reset options.</li>
      </ul>

      <p>
        This helps learners grasp DFS intuitively and prepares them for complex traversal problems and interview scenarios.
      </p>
    </div>
  );
        case 'theory':
          return (<div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <p><b>Definition:</b> Depth-First Search (DFS) is a tree traversal algorithm that explores as far as possible along each branch before backtracking. It starts from the root node and dives deep into the tree along a single branch before visiting sibling nodes.</p>
          
            <p><b>Working Principle:</b> DFS uses a <b>stack</b> data structure (either explicitly or via recursion). It follows the path from the root to the deepest node before backtracking and continuing with other unexplored paths.</p>
          
            <p><b>Traversal Order:</b> In a binary tree, DFS generally follows the <b>Preorder → Inorder → Postorder</b> traversal rules.</p>
          
            <p><b>Advantages:</b></p>
            <ul>
              <li>Requires less memory compared to BFS since it stores only a single path from root to leaf.</li>
              <li>Can be more efficient in deeper trees where the goal is far from the root.</li>
            </ul>
          
            <p><b>Disadvantages:</b></p>
            <ul>
              <li>May get stuck in infinite loops if the tree has cycles or no end condition.</li>
              <li>Not guaranteed to find the shortest path in weighted or unbalanced trees.</li>
            </ul>
          
            <p><b>Time Complexity:</b> <code>O(n^m)</code> where <code>m</code> is the maximum depth and <code>n</code> is the branching factor.</p>
            <p><b>Space Complexity:</b> <code>O(b × m)</code>, where <code>b</code> is the branching factor and <code>m</code> is the maximum depth.</p>
          </div>
          );
        case 'procedure':
          return (<div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <b>Step-by-Step Usage of DFS Visualizer:</b>
            <ol>
              <li>Click on <b>Reset</b> to initialize the tree structure.</li>
              <li>The search target will be highlighted in the heading.</li>
              <li>Click <b>Next Step</b> to explore one node at a time in DFS order (deepest child first).</li>
              <li>Click <b>Run</b> to auto-animate the entire traversal without manual steps.</li>
              <li>Click <b>Pause</b> at any time to stop the animation.</li>
              <li>Click <b>Prev Step</b> to backtrack to the previous state.</li>
              <li>Observe how the nodes are visited and how the algorithm uses the stack-like approach.</li>
              <li>Traversal stops once the target is found or all nodes are visited.</li>
            </ol>
          </div>
          );
        case 'example1':
          return <DLS_EX1 />;
        case 'example2':
          return <DLS_EX2 />;
        case 'simulation':
          return <DLSLab />;
        case 'Code':
          return <DLS_Monoco />;
        case 'feedback':
          return <Section title="Feedback" text="Please submit your feedback about this simulation." />;
        default:
          return null;
      }
    };
  
    return (
      <div>
        <Navbar setActivePage={setActivePage} showExamples={showExamples} setShowExamples={setShowExamples} />
        <div style={{textAlign:"center", fontSize:"20px", marginTop:"10px"}}><b>DEPTH LIMITED SEARCH</b></div>
        <div>{renderContent()}</div>
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

export default DLS_template;

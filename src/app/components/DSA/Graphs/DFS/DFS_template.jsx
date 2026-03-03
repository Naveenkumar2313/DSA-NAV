import React, { useState } from 'react';
import DFS_EX1 from './DFS_EX1';
import DFS_EX2 from './DFS_EX2';
import DFSLab from './DFSLab';
import DFS_Monoco from './DFS_Monoco';

const DFS_template = () => {
    const [activePage, setActivePage] = useState('aim');
    const [showExamples, setShowExamples] = useState(false);
  
    const renderContent = () => {
      switch (activePage) {
        case 'aim':
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
      <h2>Aim</h2>
      <p>
        The primary aim of this simulation is to <strong>visualize the Depth-First Search (DFS)</strong> traversal on a graph data structure in a clear and intuitive manner.
      </p>

      <p>
        This tool helps users understand how DFS works by:
      </p>
      <ul>
        <li>Highlighting nodes as they are visited in the correct DFS traversal order.</li>
        <li>Providing step-by-step traversal with visual feedback.</li>
        <li>Allowing pause, resume, and backward movement across traversal states.</li>
        <li>Displaying traversal history and actions in textual form alongside the canvas.</li>
        <li>Supporting sound feedback and visual cues to reinforce learning.</li>
      </ul>

      <p>
        This simulation is especially useful for:
      </p>
      <ul>
        <li><strong>Students</strong> who are learning graph traversals for the first time.</li>
        <li><strong>Educators</strong> looking to demonstrate DFS concepts interactively.</li>
        <li><strong>Interview preparation</strong> to solidify conceptual understanding.</li>
      </ul>
    </div>
  );
          case 'theory':
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
      <h2>Theory</h2>

      <p>
        <strong>Depth-First Search (DFS)</strong> is a graph traversal algorithm that explores as far as possible along each branch before backtracking.
      </p>

      <h3>Working Mechanism</h3>
      <ol>
        <li>Start at the <strong>root node</strong>. Mark it as visited and push it to a stack.</li>
        <li>While the stack is not empty:</li>
        <ul>
          <li>Pop a node from the stack.</li>
          <li>If the node has not been visited:</li>
          <ul>
            <li>Mark it as visited.</li>
            <li>Push all its unvisited neighbors onto the stack.</li>
          </ul>
        </ul>
        <li>Repeat the process until all nodes are visited.</li>
      </ol>

      <h3>Time & Space Complexity</h3>
      <ul>
        <li><strong>Time Complexity:</strong> O(V + E), where V is the number of vertices and E is the number of edges.</li>
        <li><strong>Space Complexity:</strong> O(V) in the worst case (for a graph that is a single path).</li>
      </ul>

      <h3>Advantages</h3>
      <ul>
        <li>Requires less memory than BFS.</li>
        <li>Can be easily implemented with recursion.</li>
      </ul>

      <h3>Disadvantages</h3>
      <ul>
        <li>Does not guarantee the shortest path.</li>
      </ul>
    </div>
  );
          
  case 'procedure':
    return (
      <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
        <h2>Procedure</h2>
  
        <p>
          This simulation module allows users to understand the step-by-step working of the <strong>Depth-First Search (DFS)</strong> traversal on a graph through interactive visual examples.
        </p>
  
        <h3>Procedure for Using Examples</h3>
        <ol>
          <li>Click on <strong>"Examples → Example 1"</strong> from the navigation bar.</li>
          <li>The graph will be displayed on the canvas area.</li>
          <li>The target node is predefined for the example.</li>
          <li>Use the following control buttons:
            <ul>
              <li><strong>Reset:</strong> Resets the graph and clears traversal history.</li>
              <li><strong>Next Step:</strong> Perform a single step in DFS traversal.</li>
              <li><strong>Prev Step:</strong> Go back to the previous traversal state.</li>
              <li><strong>Run:</strong> Automatically start DFS traversal until the node is found or all nodes are visited.</li>
              <li><strong>Pause:</strong> Temporarily stop automatic traversal.</li>
            </ul>
          </li>
          <li>The right panel shows the <strong>step-by-step traversal history</strong>.</li>
          <li>Color legend is shown to indicate node states:
            <ul>
              <li>🟡 Current node</li>
              <li>🔵 Visited nodes</li>
              <li>🟢 Found node</li>
              <li>⚪ Not visited</li>
            </ul>
          </li>
        </ol>
      </div>
    );  
        case 'example1':
          return <DFS_EX1 />;
        case 'example2':
          return <DFS_EX2 />;
        case 'simulation':
          return <DFSLab />;
        case 'Code':
          return <DFS_Monoco />;
        case 'feedback':
          return <Section title="Feedback" text="Please submit your feedback about this simulation." />;
        default:
          return null;
      }
    };
  
    return (
      <div>
        <Navbar setActivePage={setActivePage} showExamples={showExamples} setShowExamples={setShowExamples} />
        <div style={{textAlign:"center", fontSize:"20px", marginTop:"10px"}}><b>DEPTH FIRST SEARCH</b></div>
        <div >{renderContent()}</div>
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

export default DFS_template;

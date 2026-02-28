import React, { useState } from 'react';
import BFS_EX1 from './BFS_EX1';
import BFS_EX2 from './BFS_EX2';
import BFSLab from './BFSLab';
import BFS_Monoco from './BFS_Monoco';

const BFS_template = () => {
    const [activePage, setActivePage] = useState('aim');
    const [showExamples, setShowExamples] = useState(false);
  
    const renderContent = () => {
      switch (activePage) {
        case 'aim':
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
      <h2>Aim</h2>
      <p>
        The primary aim of this simulation is to <strong>visualize the Breadth-First Search (BFS)</strong> traversal on a binary or general tree data structure in a clear and intuitive manner.
      </p>

      <p>
        This tool helps users understand how BFS works by:
      </p>
      <ul>
        <li>Highlighting nodes level by level in the correct BFS traversal order.</li>
        <li>Providing step-by-step traversal with visual feedback.</li>
        <li>Allowing pause, resume, and backward movement across traversal states.</li>
        <li>Displaying traversal history and actions in textual form alongside the canvas.</li>
        <li>Supporting sound feedback and visual cues to reinforce learning.</li>
      </ul>

      <p>
        This simulation is especially useful for:
      </p>
      <ul>
        <li><strong>Students</strong> who are learning tree traversals for the first time.</li>
        <li><strong>Educators</strong> looking to demonstrate BFS concepts interactively.</li>
        <li><strong>Interview preparation</strong> to solidify conceptual understanding.</li>
      </ul>

      <p>
        Users can interactively:
      </p>
      <ul>
        <li>Run examples on prebuilt trees.</li>
        <li>Design custom trees using the simulator and test BFS traversal.</li>
        <li>Track visited nodes and queue behavior in real-time.</li>
        <li>Export traversal code in various languages for deeper understanding.</li>
      </ul>

      <p>
        Ultimately, the aim is to bridge the gap between theoretical BFS concepts and their real-time execution by providing a visual and interactive learning experience.
      </p>
    </div>
  );
          case 'theory':
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
      <h2>Theory</h2>

      <p>
        <strong>Breadth-First Search (BFS)</strong> is a fundamental tree traversal technique that explores nodes level by level starting from the root. Unlike Depth-First Search (DFS), BFS visits all the children of a node before moving to the next level.
      </p>

      <h3>Working Mechanism</h3>
      <ol>
        <li>Start at the <strong>root node</strong>. Mark it as visited and add it to a queue.</li>
        <li>While the queue is not empty:</li>
        <ul>
          <li>Dequeue the front node.</li>
          <li>Visit all of its children (left to right), mark them as visited, and enqueue them.</li>
        </ul>
        <li>Repeat the process until all nodes are visited.</li>
      </ol>

      <h3>Time & Space Complexity</h3>
      <ul>
        <li><strong>Time Complexity:</strong> O(n), where n = number of nodes</li>
        <li><strong>Space Complexity:</strong> O(w), where w = maximum number of nodes at any level (tree width)</li>
      </ul>

      <h3>Advantages</h3>
      <ul>
        <li>Guarantees finding the shortest path (in terms of edge count) from root to any node.</li>
        <li>Useful for <strong>level-order traversal</strong>.</li>
        <li>Simple and intuitive to implement.</li>
      </ul>

      <h3>Disadvantages</h3>
      <ul>
        <li>Requires more memory than DFS (stores all children at current level).</li>
        <li>Less efficient for deep trees or large branching factors.</li>
      </ul>

      <h3>Example</h3>
      <p>Consider this binary tree:</p>

      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '6px' }}>
{`        A
       / \\
      B   C
     / \\   \\
    D   E   F`}
      </pre>

      <p><strong>BFS Traversal:</strong> A → B → C → D → E → F</p>
    </div>
  );
          
  case 'procedure':
    return (
      <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
        <h2>Procedure</h2>
  
        <p>
          This simulation module allows users to understand the step-by-step working of the <strong>Breadth-First Search (BFS)</strong> traversal on a tree through interactive visual examples and lab environments.
        </p>
  
        <h3>Procedure for Using Examples</h3>
        <ol>
          <li>Click on <strong>"Examples → Example 1"</strong> or <strong>"Example 2"</strong> from the navigation bar.</li>
          <li>The tree will be displayed on the canvas area.</li>
          <li>The target node (e.g., <strong>F</strong>) is predefined for each example.</li>
          <li>Use the following control buttons:
            <ul>
              <li><strong>Reset:</strong> Resets the tree and clears traversal history.</li>
              <li><strong>Next Step:</strong> Perform a single step in BFS traversal.</li>
              <li><strong>Prev Step:</strong> Go back to the previous traversal state.</li>
              <li><strong>Run:</strong> Automatically start BFS traversal until the node is found or all nodes are visited.</li>
              <li><strong>Pause:</strong> Temporarily stop automatic traversal.</li>
            </ul>
          </li>
          <li>The right panel shows the <strong>step-by-step traversal history</strong> and allows copying to clipboard.</li>
          <li>Color legend is shown to indicate node states:
            <ul>
              <li>🟡 Current node</li>
              <li>🔵 Visited nodes</li>
              <li>🟢 Found node</li>
              <li>⚪ Not visited</li>
            </ul>
          </li>
        </ol>
  
        <h3>Procedure for Using Simulation</h3>
        <ol>
          <li>Click on <strong>"Simulation"</strong> from the navigation bar.</li>
          <li>You will see an interactive canvas with input fields for:
            <ul>
              <li>Number of nodes</li>
              <li>Node values</li>
              <li>Edge connections (manual or auto layout)</li>
            </ul>
          </li>
          <li>After configuring your tree, click <strong>"Build Tree"</strong>.</li>
          <li>The canvas will render your custom tree structure.</li>
          <li>Enter the <strong>target node value</strong> you want to search.</li>
          <li>Use the same BFS control buttons:
            <ul>
              <li><strong>Run</strong> — start full traversal</li>
              <li><strong>Next/Prev Step</strong> — move step-by-step</li>
              <li><strong>Pause</strong> — stop traversal</li>
              <li><strong>Reset</strong> — clear and start over</li>
            </ul>
          </li>
          <li>You can also:
            <ul>
              <li>View and copy step list</li>
              <li>Download the traversal code in C, C++, Python, or Java</li>
              <li>Use the Monaco editor at the bottom to explore syntax in different languages</li>
            </ul>
          </li>
        </ol>
  
        <p>
          Make sure your input is valid. Invalid node values or disconnected graphs may result in incorrect simulations.
        </p>
      </div>
    );  
        case 'example1':
          return <BFS_EX1 />;
        case 'example2':
          return <BFS_EX2 />;
        case 'simulation':
          return <BFSLab />;
        case 'Code':
          return <BFS_Monoco />;
        case 'feedback':
          return <Section title="Feedback" text="Please submit your feedback about this simulation." />;
        default:
          return null;
      }
    };
  
    return (
      <div>
        <Navbar setActivePage={setActivePage} showExamples={showExamples} setShowExamples={setShowExamples} />
        <div style={{textAlign:"center", fontSize:"20px", marginTop:"10px"}}><b>BREADTH FIRST SEARCH</b></div>
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

export default BFS_template;

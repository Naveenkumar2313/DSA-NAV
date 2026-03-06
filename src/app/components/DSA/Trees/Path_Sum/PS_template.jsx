import React, { useState } from 'react';
import PS_EX1 from './PS_EX1';
import PS_EX2 from './PS_EX2';
import PSLab from './PSLab';
import PS_Monoco from './PS_Monoco';

const PS_template = () => {
    const [activePage, setActivePage] = useState('aim');
    const [showExamples, setShowExamples] = useState(false);
  
    const renderContent = () => {
      switch (activePage) {
        case 'aim':
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
      <h2>Aim</h2>
      <p>
        The primary aim of this simulation is to <strong>visualize the Path Sum</strong> algorithm in a clear and interactive manner.
      </p>

      <p>
        Given a binary tree and a target sum, the <strong>Path Sum</strong> problem asks whether there exists a <strong>root-to-leaf path</strong> such that the sum of all node values along the path equals the target sum.
      </p>

      <p>
        This tool helps users understand how the algorithm works by:
      </p>
      <ul>
        <li>Performing a recursive DFS traversal from the root to each leaf node.</li>
        <li>At each node, subtracting the node's value from the remaining target sum.</li>
        <li>At each leaf, checking if the remaining sum equals the leaf's value.</li>
        <li>Providing step-by-step traversal with visual feedback showing visited, processed, and path nodes.</li>
        <li>Allowing pause, resume, and backward movement across algorithm states.</li>
        <li>Highlighting the successful root-to-leaf path when found, or indicating no valid path exists.</li>
      </ul>

      <p>
        This simulation is especially useful for:
      </p>
      <ul>
        <li><strong>Students</strong> who are learning tree algorithms and recursion.</li>
        <li><strong>Educators</strong> looking to demonstrate how Path Sum is solved via DFS.</li>
        <li><strong>Interview preparation</strong> — understanding the backtracking approach for tree path problems.</li>
      </ul>

      <p>
        Users can interactively:
      </p>
      <ul>
        <li>Run examples on prebuilt trees (including cases where no path exists).</li>
        <li>Design custom trees using the simulator and check for path sums.</li>
        <li>Track running sums at each node in real-time.</li>
        <li>Export the algorithm code in various languages for deeper understanding.</li>
      </ul>

      <p>
        Ultimately, the aim is to bridge the gap between the recursive DFS approach and its visual execution by providing an interactive learning experience for the Path Sum problem.
      </p>
    </div>
  );
          case 'theory':
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
      <h2>Theory</h2>

      <p>
        The <strong>Path Sum</strong> problem is a classic binary tree problem frequently asked in coding interviews (LeetCode #112).
      </p>

      <h3>Problem Statement</h3>
      <p>
        Given the root of a binary tree and an integer <strong>targetSum</strong>, return <code>true</code> if there exists a <strong>root-to-leaf path</strong> where the sum of all node values equals <code>targetSum</code>.
      </p>

      <h3>Key Insight</h3>
      <p>
        At each node, we subtract the node's value from the target sum and recursively check its children. At a leaf node, we check if the remaining target sum equals the leaf's value.
      </p>

      <h3>Algorithm (DFS Recursive)</h3>
      <ol>
        <li>If the current node is <code>null</code>, return <code>false</code>.</li>
        <li>If the current node is a <strong>leaf</strong> (no children), check if <code>targetSum === node.val</code>.</li>
        <li>Recursively check the <strong>left subtree</strong> with <code>targetSum - node.val</code>.</li>
        <li>Recursively check the <strong>right subtree</strong> with <code>targetSum - node.val</code>.</li>
        <li>Return <code>true</code> if either subtree returns <code>true</code>.</li>
      </ol>

      <h3>Time & Space Complexity</h3>
      <ul>
        <li><strong>Time Complexity:</strong> O(n), where n = number of nodes (visit each node once)</li>
        <li><strong>Space Complexity:</strong> O(h), where h = height of the tree (recursion stack)</li>
      </ul>

      <h3>Example 1 — Path Exists</h3>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '6px' }}>
{`        5
       / \\
      4   8
     /   / \\
    11  13  4
   / \\       \\
  7   2       1

Target Sum = 22
Path: 5 → 4 → 11 → 2 = 22 ✅`}
      </pre>

      <h3>Example 2 — No Valid Path</h3>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '6px' }}>
{`        1
       / \\
      2   3
     / \\   \\
    4   5   6
   /
  7

Target Sum = 15
Paths: 1→2→4→7=14, 1→2→5=8, 1→3→6=10
No path sums to 15 ❌`}
      </pre>

      <h3>Important Notes</h3>
      <ul>
        <li>The path must go from <strong>root to a leaf</strong>. A leaf is a node with no children.</li>
        <li>Intermediate paths that sum to the target do <strong>not</strong> count unless they end at a leaf.</li>
        <li>Node values can be <strong>negative</strong>, making the problem more interesting.</li>
      </ul>
    </div>
  );
          
  case 'procedure':
    return (
      <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
        <h2>Procedure</h2>
  
        <p>
          This simulation module allows users to understand the step-by-step working of the <strong>Path Sum</strong> algorithm through interactive visual examples and lab environments.
        </p>
  
        <h3>Procedure for Using Examples</h3>
        <ol>
          <li>Click on <strong>"Examples → Example 1"</strong> or <strong>"Example 2"</strong> from the navigation bar.</li>
          <li>The binary tree will be displayed on the canvas area with the target sum shown.</li>
          <li>Use the following control buttons:
            <ul>
              <li><strong>Reset:</strong> Resets the tree and clears computation history.</li>
              <li><strong>Next Step:</strong> Perform a single step in the DFS traversal.</li>
              <li><strong>Prev Step:</strong> Go back to the previous computation state.</li>
              <li><strong>Run:</strong> Automatically run the algorithm until completion.</li>
              <li><strong>Pause:</strong> Temporarily stop the automatic computation.</li>
            </ul>
          </li>
          <li>The right panel shows the <strong>step-by-step execution log</strong>.</li>
          <li>Watch as the algorithm traverses nodes and tracks the running sum.</li>
          <li>When complete:
            <ul>
              <li>If a valid path exists, the <strong>path is highlighted in green</strong>.</li>
              <li>If no valid path exists, the result is shown as <strong>not found</strong>.</li>
            </ul>
          </li>
          <li>Color legend is shown to indicate node states:
            <ul>
              <li>🟡 Current node being processed</li>
              <li>🔵 Visited (in DFS stack)</li>
              <li>🟢 Fully processed (leaf checked)</li>
              <li>💚 On the successful path</li>
              <li>⚪ Not visited</li>
            </ul>
          </li>
        </ol>
  
        <h3>Procedure for Using Simulation</h3>
        <ol>
          <li>Click on <strong>"Simulation"</strong> from the navigation bar.</li>
          <li>Configure your tree with:
            <ul>
              <li>Number of nodes</li>
              <li>Node values (numeric)</li>
              <li>Target sum</li>
              <li>Edge connections (manual or auto binary tree layout)</li>
            </ul>
          </li>
          <li>Click <strong>"Build Tree"</strong> to construct the tree.</li>
          <li>Use the same control buttons (Run, Step, Prev Step, Pause, Reset).</li>
          <li>The algorithm will check for a root-to-leaf path with the given target sum.</li>
          <li>You can also:
            <ul>
              <li>View and copy the step log</li>
              <li>View the algorithm code in C, C++, Python, or Java</li>
              <li>Use the Monaco editor to explore syntax in different languages</li>
            </ul>
          </li>
        </ol>
  
        <p>
          Make sure your input forms a valid binary tree. Each node should have at most two children. Node values should be integers.
        </p>
      </div>
    );  
        case 'example1':
          return <PS_EX1 />;
        case 'example2':
          return <PS_EX2 />;
        case 'simulation':
          return <PSLab />;
        case 'Code':
          return <PS_Monoco />;
        case 'feedback':
          return <Section title="Feedback" text="Please submit your feedback about this simulation." />;
        default:
          return null;
      }
    };
  
    return (
      <div>
        <Navbar setActivePage={setActivePage} showExamples={showExamples} setShowExamples={setShowExamples} />
        <div style={{textAlign:"center", fontSize:"20px", marginTop:"10px"}}><b>PATH SUM</b></div>
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

export default PS_template;

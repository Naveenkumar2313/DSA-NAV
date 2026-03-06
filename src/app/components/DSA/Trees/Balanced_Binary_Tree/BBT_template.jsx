import React, { useState } from 'react';
import BBT_EX1 from './BBT_EX1';
import BBT_EX2 from './BBT_EX2';
import BBTLab from './BBTLab';
import BBT_Monoco from './BBT_Monoco';

const BBT_template = () => {
    const [activePage, setActivePage] = useState('aim');
    const [showExamples, setShowExamples] = useState(false);
  
    const renderContent = () => {
      switch (activePage) {
        case 'aim':
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
      <h2>Aim</h2>
      <p>
        The primary aim of this simulation is to <strong>visualize the "Check if Binary Tree is Balanced" algorithm</strong> in a clear and interactive manner.
      </p>

      <p>
        A <strong>balanced binary tree</strong> is one where the <strong>height difference between the left and right subtrees of every node is at most 1</strong>. This property ensures the tree remains efficient for operations like search, insert, and delete.
      </p>

      <p>
        This tool helps users understand how the algorithm works by:
      </p>
      <ul>
        <li>Performing a recursive DFS (post-order traversal) to calculate the height of each subtree.</li>
        <li>At each node, computing the absolute difference between left and right subtree heights.</li>
        <li>If the difference exceeds 1 at any node, immediately marking the tree as unbalanced and returning -1.</li>
        <li>Providing step-by-step traversal with visual feedback showing visited, processed, balanced, and unbalanced nodes.</li>
        <li>Allowing pause, resume, and backward movement across algorithm states.</li>
        <li>Highlighting each node as balanced (green) or unbalanced (red) when computation completes.</li>
      </ul>

      <p>
        This simulation is especially useful for:
      </p>
      <ul>
        <li><strong>Students</strong> who are learning tree algorithms and recursion.</li>
        <li><strong>Educators</strong> looking to demonstrate how balance is checked via DFS.</li>
        <li><strong>Interview preparation</strong> — understanding the efficient O(n) approach to checking balance.</li>
      </ul>

      <p>
        Users can interactively:
      </p>
      <ul>
        <li>Run examples on prebuilt trees (one balanced, one unbalanced).</li>
        <li>Design custom trees using the simulator and check if they are balanced.</li>
        <li>Track node heights and balance status in real-time.</li>
        <li>Export the algorithm code in various languages for deeper understanding.</li>
      </ul>

      <p>
        Ultimately, the aim is to bridge the gap between the recursive height-based approach and its visual execution by providing an interactive learning experience.
      </p>
    </div>
  );
          case 'theory':
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
      <h2>Theory</h2>

      <p>
        A <strong>Balanced Binary Tree</strong> (also called a <strong>Height-Balanced Binary Tree</strong>) is a binary tree where for every node, the <strong>absolute difference between the heights of the left and right subtrees is at most 1</strong>.
      </p>

      <h3>Key Insight</h3>
      <p>
        Instead of computing the height of every subtree separately (which would be O(n²)), we can do it in a single DFS pass by returning -1 as soon as any subtree is found to be unbalanced, effectively short-circuiting the computation.
      </p>

      <h3>Algorithm (DFS Post-Order)</h3>
      <ol>
        <li>Start at the <strong>root node</strong>.</li>
        <li>Recursively compute the height of the <strong>left subtree</strong>. If it returns -1, propagate -1 upward.</li>
        <li>Recursively compute the height of the <strong>right subtree</strong>. If it returns -1, propagate -1 upward.</li>
        <li>Compute the absolute difference: |leftHeight - rightHeight|.</li>
        <li>If the difference is greater than 1, return -1 (unbalanced).</li>
        <li>Otherwise, return the height of this node = 1 + max(leftHeight, rightHeight).</li>
      </ol>

      <h3>Time & Space Complexity</h3>
      <ul>
        <li><strong>Time Complexity:</strong> O(n), where n = number of nodes (single DFS traversal)</li>
        <li><strong>Space Complexity:</strong> O(h), where h = height of the tree (recursion stack)</li>
      </ul>

      <h3>Balanced Example</h3>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '6px' }}>
{`        A
       / \\
      B   C
     / \\   \\
    D   E   F`}
      </pre>

      <p><strong>Heights:</strong> D=1, E=1, B=2, F=1, C=2, A=3</p>
      <p>At every node: |leftH - rightH| ≤ 1</p>
      <p><strong>Answer: Tree is Balanced ✓</strong></p>

      <h3>Unbalanced Example</h3>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '6px' }}>
{`        A
       / \\
      B   C
     /
    D
   /
  E`}
      </pre>

      <p><strong>Heights:</strong> E=1, D=2, B=3, C=1, A=?</p>
      <p>At node A: leftH=3, rightH=1, |diff|=2 &gt; 1</p>
      <p><strong>Answer: Tree is Unbalanced ✗</strong></p>
    </div>
  );
          
  case 'procedure':
    return (
      <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
        <h2>Procedure</h2>
  
        <p>
          This simulation module allows users to understand the step-by-step working of the <strong>Balanced Binary Tree Check</strong> algorithm through interactive visual examples and lab environments.
        </p>
  
        <h3>Procedure for Using Examples</h3>
        <ol>
          <li>Click on <strong>"Examples → Example 1"</strong> or <strong>"Example 2"</strong> from the navigation bar.</li>
          <li>The binary tree will be displayed on the canvas area.</li>
          <li>Use the following control buttons:
            <ul>
              <li><strong>Reset:</strong> Resets the tree and clears computation history.</li>
              <li><strong>Next Step:</strong> Perform a single step in the DFS post-order computation.</li>
              <li><strong>Prev Step:</strong> Go back to the previous computation state.</li>
              <li><strong>Run:</strong> Automatically run the algorithm until completion.</li>
              <li><strong>Pause:</strong> Temporarily stop the automatic computation.</li>
            </ul>
          </li>
          <li>The right panel shows the <strong>step-by-step execution log</strong>.</li>
          <li>Watch as the algorithm computes heights at each node and checks balance.</li>
          <li>When complete, each node is highlighted based on its balance status.</li>
          <li>Color legend is shown to indicate node states:
            <ul>
              <li>🟡 Current node being processed</li>
              <li>🔵 Visited (in DFS stack)</li>
              <li>🟢 Balanced — |leftH - rightH| ≤ 1</li>
              <li>🔴 Unbalanced — |leftH - rightH| &gt; 1</li>
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
              <li>Node values</li>
              <li>Edge connections (manual or auto binary tree layout)</li>
            </ul>
          </li>
          <li>Click <strong>"Build Tree"</strong> to construct the tree.</li>
          <li>Use the same control buttons (Run, Step, Prev Step, Pause, Reset).</li>
          <li>The algorithm will check balance step by step.</li>
          <li>You can also:
            <ul>
              <li>View and copy the step log</li>
              <li>Download the algorithm code in C, C++, Python, or Java</li>
              <li>Use the Monaco editor to explore syntax in different languages</li>
            </ul>
          </li>
        </ol>
  
        <p>
          Make sure your input forms a valid binary tree. Each node should have at most two children.
        </p>
      </div>
    );  
        case 'example1':
          return <BBT_EX1 />;
        case 'example2':
          return <BBT_EX2 />;
        case 'simulation':
          return <BBTLab />;
        case 'Code':
          return <BBT_Monoco />;
        case 'feedback':
          return <Section title="Feedback" text="Please submit your feedback about this simulation." />;
        default:
          return null;
      }
    };
  
    return (
      <div>
        <Navbar setActivePage={setActivePage} showExamples={showExamples} setShowExamples={setShowExamples} />
        <div style={{textAlign:"center", fontSize:"20px", marginTop:"10px"}}><b>CHECK IF BINARY TREE IS BALANCED</b></div>
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

export default BBT_template;

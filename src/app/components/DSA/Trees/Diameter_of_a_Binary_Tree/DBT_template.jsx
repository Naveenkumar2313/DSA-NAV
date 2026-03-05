import React, { useState } from 'react';
import DBT_EX1 from './DBT_EX1';
import DBT_EX2 from './DBT_EX2';
import DBTLab from './DBTLab';
import DBT_Monoco from './DBT_Monoco';

const DBT_template = () => {
    const [activePage, setActivePage] = useState('aim');
    const [showExamples, setShowExamples] = useState(false);
  
    const renderContent = () => {
      switch (activePage) {
        case 'aim':
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
      <h2>Aim</h2>
      <p>
        The primary aim of this simulation is to <strong>visualize the Diameter of a Binary Tree</strong> algorithm in a clear and interactive manner.
      </p>

      <p>
        The <strong>diameter</strong> (also called the <strong>width</strong>) of a binary tree is the <strong>length of the longest path between any two nodes</strong> in the tree. This path may or may not pass through the root.
      </p>

      <p>
        This tool helps users understand how the algorithm works by:
      </p>
      <ul>
        <li>Performing a recursive DFS (post-order traversal) to calculate the height of each subtree.</li>
        <li>At each node, computing the diameter as the sum of left and right subtree heights.</li>
        <li>Tracking the maximum diameter found so far across all nodes.</li>
        <li>Providing step-by-step traversal with visual feedback showing visited, processed, and diameter-path nodes.</li>
        <li>Allowing pause, resume, and backward movement across algorithm states.</li>
        <li>Highlighting the final diameter path on the tree when computation completes.</li>
      </ul>

      <p>
        This simulation is especially useful for:
      </p>
      <ul>
        <li><strong>Students</strong> who are learning tree algorithms and recursion.</li>
        <li><strong>Educators</strong> looking to demonstrate how diameter is computed via DFS.</li>
        <li><strong>Interview preparation</strong> — understanding why diameter might not pass through the root.</li>
      </ul>

      <p>
        Users can interactively:
      </p>
      <ul>
        <li>Run examples on prebuilt trees (including cases where diameter doesn't pass through root).</li>
        <li>Design custom trees using the simulator and compute the diameter.</li>
        <li>Track node heights and diameter values in real-time.</li>
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
        The <strong>Diameter of a Binary Tree</strong> is the number of edges on the <strong>longest path between any two nodes</strong> in the tree. This is a classic problem frequently asked in coding interviews.
      </p>

      <h3>Key Insight</h3>
      <p>
        The diameter at any node is the sum of the heights of its left and right subtrees. The overall diameter is the maximum of this value across all nodes.
      </p>

      <h3>Algorithm (DFS Post-Order)</h3>
      <ol>
        <li>Start at the <strong>root node</strong>.</li>
        <li>Recursively compute the height of the <strong>left subtree</strong>.</li>
        <li>Recursively compute the height of the <strong>right subtree</strong>.</li>
        <li>The diameter through this node = leftHeight + rightHeight.</li>
        <li>Update the global maximum diameter if this value is larger.</li>
        <li>Return the height of this node = 1 + max(leftHeight, rightHeight).</li>
      </ol>

      <h3>Time & Space Complexity</h3>
      <ul>
        <li><strong>Time Complexity:</strong> O(n), where n = number of nodes (single DFS traversal)</li>
        <li><strong>Space Complexity:</strong> O(h), where h = height of the tree (recursion stack)</li>
      </ul>

      <h3>Important Note</h3>
      <p>
        The diameter <strong>does not necessarily pass through the root</strong>. Consider:
      </p>

      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '6px' }}>
{`        A
       / \\
      B   C
     / \\
    D   E
   /   / \\
  H   F   G
 /         \\
I           J`}
      </pre>

      <p>
        Here, the longest path is I → H → D → B → E → G → J (length = 6), which passes through node B, <strong>not the root A</strong>.
      </p>

      <h3>Example (Simple Case)</h3>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '6px' }}>
{`        A
       / \\
      B   C
     / \\   \\
    D   E   F
   /
  G`}
      </pre>

      <p><strong>Heights:</strong> G=1, D=2, E=1, B=3, F=1, C=2, A=4</p>
      <p><strong>Diameter through B:</strong> 2 + 1 = 3</p>
      <p><strong>Diameter through A:</strong> 3 + 2 = 5</p>
      <p><strong>Answer: Diameter = 5</strong></p>
    </div>
  );
          
  case 'procedure':
    return (
      <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
        <h2>Procedure</h2>
  
        <p>
          This simulation module allows users to understand the step-by-step working of the <strong>Diameter of a Binary Tree</strong> algorithm through interactive visual examples and lab environments.
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
          <li>Watch as the algorithm computes heights at each node and tracks the diameter.</li>
          <li>When complete, the <strong>diameter path is highlighted in red</strong>.</li>
          <li>Color legend is shown to indicate node states:
            <ul>
              <li>🟡 Current node being processed</li>
              <li>🔵 Visited (in DFS stack)</li>
              <li>🟢 Fully processed (height computed)</li>
              <li>🔴 On the diameter path</li>
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
          <li>The algorithm will compute the diameter step by step.</li>
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
          return <DBT_EX1 />;
        case 'example2':
          return <DBT_EX2 />;
        case 'simulation':
          return <DBTLab />;
        case 'Code':
          return <DBT_Monoco />;
        case 'feedback':
          return <Section title="Feedback" text="Please submit your feedback about this simulation." />;
        default:
          return null;
      }
    };
  
    return (
      <div>
        <Navbar setActivePage={setActivePage} showExamples={showExamples} setShowExamples={setShowExamples} />
        <div style={{textAlign:"center", fontSize:"20px", marginTop:"10px"}}><b>DIAMETER OF A BINARY TREE</b></div>
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

export default DBT_template;

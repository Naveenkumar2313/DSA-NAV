import React, { useState } from 'react';
import GraphBFS_EX1 from './GraphBFS_EX1';
import GraphBFS_EX2 from './GraphBFS_EX2';
import GraphBFSLab from './GraphBFSLab';
import GraphBFS_Monaco from './GraphBFS_Monaco';

const GraphBFS_template = () => {
  const [activePage, setActivePage] = useState('aim');
  const [showExamples, setShowExamples] = useState(false);

  const renderContent = () => {
    switch (activePage) {
      case 'aim':
        return (
          <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <h2>Aim</h2>
            <p>
              The primary aim of this simulation is to <strong>visualize Breadth-First Search (BFS)</strong> traversal on graph data structures in a clear and intuitive manner.
            </p>

            <p>
              This tool helps users understand how BFS works in graphs by:
            </p>
            <ul>
              <li>Showing step-by-step traversal across graph vertices and edges</li>
              <li>Highlighting the queue behavior and level-by-level exploration</li>
              <li>Demonstrating how BFS explores all neighbors before moving deeper</li>
              <li>Providing visual feedback with animated edges and color-coded nodes</li>
              <li>Supporting both directed and undirected graphs</li>
              <li>Allowing pause, resume, and backward movement through traversal history</li>
            </ul>

            <p>
              This simulation is especially useful for:
            </p>
            <ul>
              <li><strong>Students</strong> learning graph algorithms and traversal techniques</li>
              <li><strong>Educators</strong> demonstrating BFS concepts in classroom settings</li>
              <li><strong>Interview preparation</strong> for technical coding challenges</li>
              <li><strong>Algorithm visualization</strong> for better conceptual understanding</li>
            </ul>

            <p>
              Users can interactively:
            </p>
            <ul>
              <li>Run BFS on pre-built example graphs with different structures</li>
              <li>Build custom graphs with configurable nodes and edges</li>
              <li>Choose between circular, grid, or manual layouts</li>
              <li>Track visited nodes, queue state, and traversal order in real-time</li>
              <li>Search for specific target nodes and visualize the search path</li>
              <li>Export BFS code in C, C++, Python, or Java</li>
            </ul>

            <p>
              The goal is to bridge the gap between theoretical BFS concepts and their practical implementation by providing an engaging visual and interactive learning experience.
            </p>
          </div>
        );

      case 'theory':
        return (
          <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <h2>Theory</h2>

            <p>
              <strong>Breadth-First Search (BFS)</strong> is a fundamental graph traversal algorithm that explores vertices level by level, starting from a source vertex. It uses a queue data structure to keep track of vertices to visit next.
            </p>

            <h3>Working Mechanism</h3>
            <ol>
              <li>Start at a <strong>source vertex</strong>. Mark it as visited and enqueue it.</li>
              <li>While the queue is not empty:</li>
              <ul>
                <li>Dequeue a vertex from the front of the queue</li>
                <li>Visit all unvisited neighbors of this vertex</li>
                <li>Mark each neighbor as visited and enqueue them</li>
              </ul>
              <li>Repeat until the queue is empty or the target is found</li>
            </ol>

            <h3>Key Characteristics</h3>
            <ul>
              <li><strong>Level-by-level exploration:</strong> All vertices at distance k from the source are visited before vertices at distance k+1</li>
              <li><strong>Shortest path:</strong> In unweighted graphs, BFS finds the shortest path (minimum number of edges)</li>
              <li><strong>Complete:</strong> BFS will find a solution if one exists</li>
              <li><strong>Queue-based:</strong> Uses FIFO (First In First Out) data structure</li>
            </ul>

            <h3>Time & Space Complexity</h3>
            <ul>
              <li><strong>Time Complexity:</strong> O(V + E), where V = vertices and E = edges</li>
              <li><strong>Space Complexity:</strong> O(V) for the queue and visited set</li>
            </ul>

            <h3>Applications</h3>
            <ul>
              <li>Finding shortest path in unweighted graphs</li>
              <li>Web crawlers for indexing web pages</li>
              <li>Social networking (friend suggestions, degrees of separation)</li>
              <li>GPS navigation systems for finding nearby locations</li>
              <li>Broadcasting in networks</li>
              <li>Testing bipartiteness of a graph</li>
              <li>Finding connected components</li>
            </ul>

            <h3>Advantages</h3>
            <ul>
              <li>Guarantees finding the shortest path in unweighted graphs</li>
              <li>Simple and easy to implement</li>
              <li>Complete - will find a solution if one exists</li>
              <li>Useful for level-order exploration</li>
            </ul>

            <h3>Disadvantages</h3>
            <ul>
              <li>Requires more memory than DFS (stores all nodes at current level)</li>
              <li>Not suitable for graphs with infinite or very large breadth</li>
              <li>Can be slower than DFS for finding paths in deep graphs</li>
            </ul>

            <h3>Example</h3>
            <p>Consider this graph:</p>

            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '6px' }}>
{`    A --- B --- D
    |     |
    C --- E --- F

Edges: A-B, A-C, B-D, B-E, C-E, E-F`}
            </pre>

            <p><strong>BFS Traversal from A:</strong> A → B → C → D → E → F</p>
            <p>
              At each level:
              <ul>
                <li>Level 0: A</li>
                <li>Level 1: B, C (neighbors of A)</li>
                <li>Level 2: D, E (neighbors of B and C, not yet visited)</li>
                <li>Level 3: F (neighbor of E)</li>
              </ul>
            </p>
          </div>
        );

      case 'procedure':
        return (
          <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <h2>Procedure</h2>

            <p>
              This module provides interactive visualization of <strong>Breadth-First Search (BFS)</strong> on graphs through examples and a customizable simulator.
            </p>

            <h3>Using the Examples</h3>
            <ol>
              <li>Navigate to <strong>Examples → Example 1</strong> or <strong>Example 2</strong></li>
              <li>The graph will be displayed on the canvas with nodes and edges</li>
              <li>A predefined target node is set (e.g., F or H)</li>
              <li>Control buttons available:
                <ul>
                  <li><strong>Reset:</strong> Clear all progress and start fresh</li>
                  <li><strong>Previous Step:</strong> Go back one step in the traversal</li>
                  <li><strong>Next Step:</strong> Execute one BFS step manually</li>
                  <li><strong>Run:</strong> Automatically run BFS until completion</li>
                  <li><strong>Pause:</strong> Pause automatic traversal</li>
                </ul>
              </li>
              <li>Watch the visualization:
                <ul>
                  <li>🟡 Yellow: Current node being processed</li>
                  <li>🔵 Blue: Visited nodes</li>
                  <li>🟢 Green: Target node when found</li>
                  <li>⚪ Gray: Unvisited nodes</li>
                  <li>Dotted lines with arrows show traversal path</li>
                </ul>
              </li>
              <li>View step-by-step execution log on the right panel</li>
            </ol>

            <h3>Using the Simulator</h3>
            <ol>
              <li>Click <strong>Simulation</strong> from the navigation menu</li>
              <li>Configure your graph:
                <ul>
                  <li><strong>Layout:</strong> Choose Circular, Grid, or Manual</li>
                  <li><strong>Number of Nodes:</strong> Set how many vertices (1-15)</li>
                  <li><strong>Start Node:</strong> Choose which node to begin BFS from</li>
                  <li><strong>Directed/Undirected:</strong> Toggle the graph type</li>
                  <li><strong>Manual Edges:</strong> If using manual layout, define custom edges</li>
                </ul>
              </li>
              <li>Click <strong>Build Graph</strong> to generate the visualization</li>
              <li>Enter a <strong>Search Target</strong> value (node label to find)</li>
              <li>Use the same control buttons to run BFS:
                <ul>
                  <li>Step through manually or run automatically</li>
                  <li>Watch the queue behavior in real-time</li>
                  <li>Track visited nodes and traversal order</li>
                </ul>
              </li>
              <li>Additional features:
                <ul>
                  <li>View complete traversal log</li>
                  <li>Copy log to clipboard</li>
                  <li>Reset and try different configurations</li>
                </ul>
              </li>
            </ol>

            <h3>Using the Code Section</h3>
            <ol>
              <li>Navigate to the <strong>Code</strong> section</li>
              <li>Select your preferred programming language (C, C++, Python, Java)</li>
              <li>View BFS implementation in that language</li>
              <li>Click <strong>Copy Code</strong> to copy the snippet</li>
              <li>Use the code as reference for your own implementations</li>
            </ol>

            <h3>Tips for Best Learning Experience</h3>
            <ul>
              <li>Start with Example 1 to understand basic BFS on a simple graph</li>
              <li>Move to Example 2 to see BFS on a more complex grid structure</li>
              <li>Use the simulator to experiment with different graph configurations</li>
              <li>Try both directed and undirected graphs to see the differences</li>
              <li>Pay attention to the queue state - this is key to understanding BFS</li>
              <li>Compare the visit order numbers to understand level-by-level traversal</li>
            </ul>
          </div>
        );

      case 'example1':
        return <GraphBFS_EX1 />;
      case 'example2':
        return <GraphBFS_EX2 />;
      case 'simulation':
        return <GraphBFSLab />;
      case 'Code':
        return <GraphBFS_Monaco />;
      case 'feedback':
        return <Section title="Feedback" text="Please submit your feedback about this simulation." />;
      default:
        return null;
    }
  };

  return (
    <div>
      <Navbar setActivePage={setActivePage} showExamples={showExamples} setShowExamples={setShowExamples} />
      <div style={{ textAlign: "center", fontSize: "20px", marginTop: "10px" }}>
        <b>BREADTH FIRST SEARCH (GRAPHS)</b>
      </div>
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

export default GraphBFS_template;

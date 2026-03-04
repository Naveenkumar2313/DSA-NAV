import React, { useState } from "react";
import Kruskal_EX1 from "./Kruskal_EX1";
import Kruskal_EX2 from "./Kruskal_EX2";
import KruskalLab from "./KruskalLab";
import Kruskal_Monaco from "./Kruskal_Monaco";

const Kruskal_template = () => {
  const [activePage, setActivePage] = useState("aim");
  const [showExamples, setShowExamples] = useState(false);

  const renderContent = () => {
    switch (activePage) {
      case "aim":
        return (
          <div style={{ maxWidth: "900px", margin: "auto", textAlign: "left" }}>
            <h2>Aim</h2>
            <p>
              The primary aim of this simulation is to{" "}
              <strong>visualize Kruskal's Algorithm</strong> for finding the Minimum Spanning Tree
              (MST) of a weighted undirected graph in a clear, interactive manner.
            </p>

            <p>This tool helps users understand how Kruskal's Algorithm works by:</p>
            <ul>
              <li>Showing the greedy edge selection process sorted by weight</li>
              <li>Visualizing the Disjoint Set Union (DSU) for cycle detection</li>
              <li>Highlighting edges that are accepted (form MST) vs rejected (create cycles)</li>
              <li>Demonstrating how the MST grows incrementally</li>
              <li>Tracking the total weight of the resulting MST</li>
              <li>Allowing pause, resume, and step-by-step traversal</li>
            </ul>

            <p>This simulation is especially useful for:</p>
            <ul>
              <li>
                <strong>Students</strong> learning graph algorithms and minimum spanning trees
              </li>
              <li>
                <strong>Educators</strong> demonstrating MST concepts in classroom settings
              </li>
              <li>
                <strong>Interview preparation</strong> for technical coding challenges
              </li>
              <li>
                <strong>Algorithm visualization</strong> for understanding greedy algorithms
              </li>
            </ul>

            <p>Users can interactively:</p>
            <ul>
              <li>Run Kruskal's Algorithm on pre-built example graphs with different structures</li>
              <li>Build custom weighted graphs with configurable nodes and edges</li>
              <li>Choose between circular and grid layouts</li>
              <li>Track edge processing order and MST construction in real-time</li>
              <li>Understand cycle detection using Disjoint Set Union</li>
              <li>Export algorithm implementations in C, C++, Python, or Java</li>
            </ul>

            <p>
              The goal is to bridge the gap between theoretical MST concepts and their practical
              implementation by providing an engaging visual and interactive learning experience.
            </p>
          </div>
        );

      case "theory":
        return (
          <div style={{ maxWidth: "900px", margin: "auto", textAlign: "left" }}>
            <h2>Theory</h2>

            <p>
              <strong>Kruskal's Algorithm</strong> is a greedy algorithm that finds the Minimum
              Spanning Tree (MST) of a weighted undirected graph. It works by selecting edges in
              ascending order of weight and adding them to the MST if they don't form a cycle.
            </p>

            <h3>Working Mechanism</h3>
            <ol>
              <li>Sort all edges in the graph by weight in ascending order.</li>
              <li>Initialize a Disjoint Set Union (DSU) to track connected components.</li>
              <li>For each edge (in sorted order):</li>
              <ul>
                <li>
                  Check if the two vertices are in different components using DSU's find operation
                </li>
                <li>
                  If they are in different components, add the edge to MST and union the components
                </li>
                <li>If they are in the same component, skip (adding would create a cycle)</li>
              </ul>
              <li>Continue until all vertices are connected (or no more edges)</li>
            </ol>

            <h3>Key Characteristics</h3>
            <ul>
              <li>
                <strong>Greedy Algorithm:</strong> Always selects the smallest edge that doesn't
                create a cycle
              </li>
              <li>
                <strong>Optimal:</strong> Guarantees finding the minimum weight spanning tree
              </li>
              <li>
                <strong>Graph-agnostic:</strong> Works on any connected undirected graph
              </li>
              <li>
                <strong>Uses DSU:</strong> Efficient cycle detection via Disjoint Set Union
              </li>
            </ul>

            <h3>Time & Space Complexity</h3>
            <ul>
              <li>
                <strong>Time Complexity:</strong> O(E log E) where E = number of edges (sorting
                dominates)
              </li>
              <li>
                <strong>Space Complexity:</strong> O(V + E) for DSU and edge list
              </li>
            </ul>

            <h3>Disjoint Set Union (DSU)</h3>
            <ul>
              <li>
                <strong>Find:</strong> Returns the representative (root) of the set containing an
                element
              </li>
              <li>
                <strong>Union:</strong> Merges two sets that contain given elements
              </li>
              <li>
                <strong>Path Compression:</strong> Optimization for find operation (O(α(n))
                amortized)
              </li>
              <li>
                <strong>Union by Rank:</strong> Optimization for union operation to keep tree
                shallow
              </li>
            </ul>

            <h3>Applications</h3>
            <ul>
              <li>Network design with minimum cable length</li>
              <li>Traveling Salesman Problem (approximate solution)</li>
              <li>Clustering algorithms</li>
              <li>Maze generation</li>
              <li>Image segmentation in computer vision</li>
              <li>Social network analysis (finding connected components)</li>
            </ul>

            <h3>Advantages</h3>
            <ul>
              <li>Simple and easy to implement</li>
              <li>Optimal for all inputs</li>
              <li>Good for dense graphs</li>
              <li>Can work with disconnected graphs (finds MST for each component)</li>
            </ul>

            <h3>Disadvantages</h3>
            <ul>
              <li>Requires sorting (O(E log E))</li>
              <li>Less efficient for very sparse graphs compared to Prim's algorithm</li>
              <li>Not suitable for dynamic graph updates</li>
            </ul>

            <h3>Example</h3>
            <p>Consider this weighted graph:</p>

            <pre style={{ background: "#f5f5f5", padding: "10px", borderRadius: "6px" }}>
              {`    A ----2---- B
    |           |
    7           3
    |           |
    D ----1---- C
    |           |
    6           4
    |           |
    E ----5---- F

Edges sorted by weight:
1. (B,C) = 1
2. (A,B) = 2
3. (B,D) = 3  
4. (C,F) = 4
5. (D,E) = 6
6. (A,D) = 7
7. (B,E) = 8
...`}
            </pre>

            <p>
              <strong>Kruskal's MST Selection:</strong>
            </p>
            <ul>
              <li>
                Step 1: Add (B,C)=1 → Weight: 1, Components: {"{"}A{"}"} {"{"}B,C{"}"} {"{"}D{"}"}{" "}
                {"{"}E{"}"} {"{"}F{"}"}
              </li>
              <li>
                Step 2: Add (A,B)=2 → Weight: 3, Components: {"{"}A,B,C{"}"} {"{"}D{"}"} {"{"}E{"}"}{" "}
                {"{"}F{"}"}
              </li>
              <li>
                Step 3: Add (B,D)=3 → Weight: 6, Components: {"{"}A,B,C,D{"}"} {"{"}E{"}"} {"{"}F
                {"}"}
              </li>
              <li>Step 4: Skip (C,F)... until all vertices are connected</li>
            </ul>
            <p>
              <strong>Final MST Weight:</strong> 1 + 2 + 3 + 4 + 5 = 15 (with 5 vertices, need 4
              edges)
            </p>
          </div>
        );

      case "procedure":
        return (
          <div style={{ maxWidth: "900px", margin: "auto", textAlign: "left" }}>
            <h2>Procedure</h2>

            <p>
              This module provides interactive visualization of <strong>Kruskal's Algorithm</strong>{" "}
              for finding Minimum Spanning Trees through examples and a customizable simulator.
            </p>

            <h3>Using the Examples</h3>
            <ol>
              <li>
                Navigate to <strong>Examples → Example 1</strong> or <strong>Example 2</strong>
              </li>
              <li>The weighted graph will be displayed on the canvas with nodes and edges</li>
              <li>Edge weights are shown on the connections</li>
              <li>
                Control buttons available:
                <ul>
                  <li>
                    <strong>Reset:</strong> Clear all progress and start fresh
                  </li>
                  <li>
                    <strong>Next Step:</strong> Execute one algorithm step
                  </li>
                  <li>
                    <strong>Run:</strong> Automatically run algorithm until completion
                  </li>
                  <li>
                    <strong>Pause:</strong> Pause automatic execution
                  </li>
                </ul>
              </li>
              <li>
                Watch the visualization:
                <ul>
                  <li>🔴 Pink/Magenta: Edges in the Minimum Spanning Tree (MST)</li>
                  <li>🔵 Blue: Edges rejected due to cycle formation</li>
                  <li>⚪ Gray: Unprocessed edges</li>
                  <li>Edge weights are displayed on each edge</li>
                </ul>
              </li>
              <li>
                View step-by-step execution log on the right panel showing:
                <ul>
                  <li>Each edge evaluated</li>
                  <li>Whether it was accepted (✓) or rejected (✗)</li>
                  <li>Reason for rejection (cycle detection)</li>
                </ul>
              </li>
            </ol>

            <h3>Using the Simulator</h3>
            <ol>
              <li>
                Click <strong>Simulation</strong> from the navigation menu
              </li>
              <li>
                Configure your graph:
                <ul>
                  <li>
                    <strong>Layout:</strong> Choose Circular or Grid positioning
                  </li>
                  <li>
                    <strong>Number of Nodes:</strong> Set vertex count (2-12)
                  </li>
                  <li>
                    <strong>Add Edges:</strong> Define connections with weights
                  </li>
                </ul>
              </li>
              <li>
                Click <strong>Build Graph</strong> to generate the visualization
              </li>
              <li>The simulator will automatically sort edges by weight</li>
              <li>
                Use control buttons:
                <ul>
                  <li>Step through manually or run automatically</li>
                  <li>Watch the MST grow incrementally</li>
                  <li>Track total MST weight in real-time</li>
                </ul>
              </li>
              <li>
                Additional features:
                <ul>
                  <li>View complete algorithm log</li>
                  <li>Copy log to clipboard</li>
                  <li>Reset and try different graph configurations</li>
                </ul>
              </li>
            </ol>

            <h3>Using the Code Section</h3>
            <ol>
              <li>
                Navigate to the <strong>Code</strong> section
              </li>
              <li>Select your preferred programming language (C, C++, Python, Java)</li>
              <li>View Kruskal's Algorithm implementation in that language</li>
              <li>
                Note the key components:
                <ul>
                  <li>
                    <strong>Edge sorting:</strong> By weight in ascending order
                  </li>
                  <li>
                    <strong>DSU implementation:</strong> Find and union operations
                  </li>
                  <li>
                    <strong>Cycle detection:</strong> Using DSU
                  </li>
                  <li>
                    <strong>MST construction:</strong> Building the result
                  </li>
                </ul>
              </li>
              <li>
                Click <strong>Copy Code</strong> to copy the implementation
              </li>
              <li>Use the code as reference for your own implementations</li>
            </ol>

            <h3>Tips for Best Learning Experience</h3>
            <ul>
              <li>Start with Example 1 to understand basic Kruskal's on a simple graph</li>
              <li>Move to Example 2 to see the algorithm on a more complex structure</li>
              <li>Use the simulator to experiment with different graph configurations</li>
              <li>Pay attention to edge weights - they determine selection order</li>
              <li>Understand DSU - it's key to efficient cycle detection</li>
              <li>Try manually calculating MST weight before running simulation</li>
              <li>Compare results with Prim's Algorithm (finds same MST, different order)</li>
            </ul>
          </div>
        );

      case "example1":
        return <Kruskal_EX1 />;
      case "example2":
        return <Kruskal_EX2 />;
      case "simulation":
        return <KruskalLab />;
      case "Code":
        return <Kruskal_Monaco />;
      case "feedback":
        return (
          <Section title="Feedback" text="Please submit your feedback about this simulation." />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Navbar
        setActivePage={setActivePage}
        showExamples={showExamples}
        setShowExamples={setShowExamples}
      />
      <div style={{ textAlign: "center", fontSize: "20px", marginTop: "10px" }}>
        <b>KRUSKAL'S ALGORITHM (GRAPHS - MINIMUM SPANNING TREE)</b>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
};

const Navbar = ({ setActivePage, showExamples, setShowExamples }) => (
  <nav style={styles.navbar}>
    <button onClick={() => setActivePage("aim")}>Aim</button>
    <button onClick={() => setActivePage("theory")}>Theory</button>
    <button onClick={() => setActivePage("procedure")}>Procedure</button>
    <div style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setShowExamples((prev) => !prev)}>Examples ▾</button>
      {showExamples && (
        <div style={styles.dropdown}>
          <button
            onClick={() => {
              setActivePage("example1");
              setShowExamples(false);
            }}
          >
            Example 1
          </button>
          <button
            onClick={() => {
              setActivePage("example2");
              setShowExamples(false);
            }}
          >
            Example 2
          </button>
        </div>
      )}
    </div>
    <button onClick={() => setActivePage("simulation")}>Simulation</button>
    <button onClick={() => setActivePage("Code")}>Code</button>
    <button onClick={() => setActivePage("feedback")}>Feedback</button>
  </nav>
);

const Section = ({ title, text }) => (
  <div style={{ maxWidth: "800px", margin: "auto", textAlign: "left" }}>
    <h2>{title}</h2>
    <p style={{ whiteSpace: "pre-line" }}>{text}</p>
  </div>
);

const styles = {
  navbar: {
    display: "flex",
    gap: "10px",
    backgroundColor: "#333",
    padding: "10px",
    color: "#fff",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    backgroundColor: "#444",
    display: "flex",
    flexDirection: "column",
    zIndex: 10,
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
  }
};

export default Kruskal_template;

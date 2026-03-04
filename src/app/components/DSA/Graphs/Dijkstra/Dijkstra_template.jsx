import React, { useState } from 'react';
import Dijkstra_EX1 from './Dijkstra_EX1';
import Dijkstra_EX2 from './Dijkstra_EX2';
import DijkstraLab from './DijkstraLab';
import Dijkstra_Monaco from './Dijkstra_Monaco';

const Dijkstra_template = () => {
  const [activePage, setActivePage] = useState('aim');
  const [showExamples, setShowExamples] = useState(false);

  const renderContent = () => {
    switch (activePage) {
      case 'aim':
        return (
          <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <h2>Aim</h2>
            <p>Visualize Dijkstra's Algorithm for finding shortest paths in weighted graphs.</p>
            <ul>
              <li>Step-by-step node exploration</li>
              <li>Priority queue visualization</li>
              <li>Edge relaxation demonstration</li>
              <li>Shortest path highlighting</li>
            </ul>
          </div>
        );
      case 'theory':
        return (
          <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <h2>Theory</h2>
            <p>Dijkstra's Algorithm finds shortest paths from source to all vertices in weighted graphs.</p>
            <h3>Time Complexity: O((V + E) log V)</h3>
            <h3>Space Complexity: O(V)</h3>
          </div>
        );
      case 'procedure':
        return (
          <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <h2>Procedure</h2>
            <ol>
              <li>Select example or use simulator</li>
              <li>Build weighted graph</li>
              <li>Choose start and target nodes</li>
              <li>Run algorithm step-by-step</li>
              <li>View shortest path</li>
            </ol>
          </div>
        );
      case 'example1':
        return <Dijkstra_EX1 />;
      case 'example2':
        return <Dijkstra_EX2 />;
      case 'simulation':
        return <DijkstraLab showSnackbar={(msg) => console.log(msg)} />;
      case 'Code':
        return <Dijkstra_Monaco />;
      default:
        return null;
    }
  };

  return (
    <div>
      <nav style={{display:'flex',gap:'10px',backgroundColor:'#333',padding:'10px',justifyContent:'center',flexWrap:'wrap'}}>
        <button onClick={() => setActivePage('aim')}>Aim</button>
        <button onClick={() => setActivePage('theory')}>Theory</button>
        <button onClick={() => setActivePage('procedure')}>Procedure</button>
        <div style={{position:'relative',display:'inline-block'}}>
          <button onClick={() => setShowExamples(p => !p)}>Examples ▾</button>
          {showExamples && (
            <div style={{position:'absolute',top:'100%',left:0,backgroundColor:'#444',display:'flex',flexDirection:'column',zIndex:10}}>
              <button onClick={() => {setActivePage('example1');setShowExamples(false);}}>Example 1</button>
              <button onClick={() => {setActivePage('example2');setShowExamples(false);}}>Example 2</button>
            </div>
          )}
        </div>
        <button onClick={() => setActivePage('simulation')}>Simulation</button>
        <button onClick={() => setActivePage('Code')}>Code</button>
      </nav>
      <div style={{textAlign:"center",fontSize:"20px",marginTop:"10px"}}><b>DIJKSTRA'S SHORTEST PATH</b></div>
      <div>{renderContent()}</div>
    </div>
  );
};

export default Dijkstra_template;

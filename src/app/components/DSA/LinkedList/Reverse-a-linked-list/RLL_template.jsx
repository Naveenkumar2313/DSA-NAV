import React, { useState } from 'react';
import RLL_EX1 from './RLL_EX1';
import RLL_EX2 from './RLL_EX2';
import RLLLab from './RLLLab';
import RLL_Monoco from './RLL_Monoco';

const RLL_template = () => {
    const [activePage, setActivePage] = useState('aim');
    const [showExamples, setShowExamples] = useState(false);
  
    const renderContent = () => {
      switch (activePage) {
        case 'aim':
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
      <h2>Aim</h2>
      <p>
        The aim of this visual tool is to demonstrate how the <strong>Reverse a Linked List</strong> algorithm works by iteratively reversing the direction of pointers in a singly linked list.
      </p>

      <p>
        Through this visualization, learners can:
      </p>
      <ul>
        <li>Understand the three-pointer technique (prev, curr, next) used in iterative reversal.</li>
        <li>Observe how each node's pointer is redirected step-by-step.</li>
        <li>Track the movement of prev, curr, and next pointers across the list.</li>
        <li>View step-by-step history and total steps involved.</li>
        <li>Experience audio cues for each pointer reversal and completion.</li>
      </ul>

      <p>
        This simulator is ideal for beginners learning about linked list operations and pointer manipulation with O(n) time complexity.
      </p>
    </div>
  );
        case 'theory':
          return (<div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <p><b>Definition:</b> Reversing a linked list means changing the direction of all pointers so that the last node becomes the head and the first node becomes the tail (pointing to NULL).</p>
          
            <p><b>Working Principle:</b> The iterative approach uses three pointers — <code>prev</code>, <code>curr</code>, and <code>next</code>. At each step, <code>curr.next</code> is redirected to point to <code>prev</code>, and then all three pointers advance one step forward.</p>
          
            <p><b>Algorithm Steps:</b></p>
            <ol>
              <li>Initialize <code>prev = NULL</code>, <code>curr = head</code>.</li>
              <li>While <code>curr</code> is not NULL:
                <ul>
                  <li>Store <code>next = curr.next</code></li>
                  <li>Reverse the link: <code>curr.next = prev</code></li>
                  <li>Move <code>prev = curr</code></li>
                  <li>Move <code>curr = next</code></li>
                </ul>
              </li>
              <li>Return <code>prev</code> as the new head.</li>
            </ol>

            <p><b>Advantages:</b></p>
            <ul>
              <li>Simple and efficient — only requires a single pass through the list.</li>
              <li>In-place reversal — no extra data structures needed.</li>
            </ul>
          
            <p><b>Disadvantages:</b></p>
            <ul>
              <li>Modifies the original list structure.</li>
              <li>Requires careful pointer management to avoid losing references.</li>
            </ul>
          
            <p><b>Time Complexity:</b> <code>O(n)</code> where n is the number of nodes.</p>
            <p><b>Space Complexity:</b> <code>O(1)</code> (in-place algorithm, only uses 3 extra pointers).</p>
          </div>
          );
          case 'procedure':
            return (
              <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
  <b>How to Use the Reverse Linked List Visualizer:</b>
  <ol>
    <li>Click <b>Reset</b> to initialize the linked list.</li>
    <li>Click <b>Next Step</b> to manually trigger one pointer reversal step.</li>
    <li>Click <b>Run</b> to allow the algorithm to run automatically.</li>
    <li>Click <b>Pause</b> to stop the animation at any time.</li>
    <li>Yellow node represents the <b>current (curr)</b> node being processed.</li>
    <li>Red node represents the <b>previous (prev)</b> node.</li>
    <li>Green nodes represent already <b>reversed</b> nodes.</li>
    <li>Observe how the arrows (pointers) change direction as the algorithm progresses.</li>
    <li>Once reversal is complete, a confirmation message will be shown in the status bar.</li>
    <li>Steps are recorded in the panel to the right — use the copy button to export them.</li>
  </ol>
</div>

            );
        case 'example1':
          return <RLL_EX1 />;
        case 'example2':
          return <RLL_EX2 />;
        case 'simulation':
          return <RLLLab  />;
        case 'Code':
          return <RLL_Monoco />;
        case 'feedback':
          return <Section title="Feedback" text="Please submit your feedback about this simulation." />;
        default:
          return null;
      }
    };
  
    return (
      <div>
        <Navbar setActivePage={setActivePage} showExamples={showExamples} setShowExamples={setShowExamples} />
        <div style={{textAlign:"center", fontSize:"20px", marginTop:"10px"}}><b>REVERSE A LINKED LIST</b></div>
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

export default RLL_template;

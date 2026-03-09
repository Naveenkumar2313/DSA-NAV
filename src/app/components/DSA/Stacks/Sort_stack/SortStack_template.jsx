import React, { useState } from 'react';
import SortStack_EX1 from './SortStack_EX1';
import SortStack_EX2 from './SortStack_EX2';
import SortStackLab from './SortStackLab';
import SortStack_Monaco from './SortStack_Monaco';
import { Snackbar, Alert } from '@mui/material';

const SortStack_template = () => {
  const [activePage, setActivePage] = useState('aim');
  const [showExamples, setShowExamples] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const renderContent = () => {
    switch (activePage) {
      case 'aim':
        return (
          <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <h2>Aim</h2>
            <p>
              The aim of this visualization is to help learners understand how to{' '}
              <strong>sort a stack using a temporary (auxiliary) stack</strong> — a classic
              application of the Stack data structure.
            </p>
            <p>This simulator enables users to:</p>
            <ul>
              <li>Visualize the step-by-step movement of elements between the main stack and a temporary stack.</li>
              <li>Understand how comparison and insertion logic maintains sorted order in the temp stack.</li>
              <li>Observe how elements are transferred back to the original stack after sorting.</li>
              <li>Interactively control the pace of the algorithm using Next/Prev step buttons.</li>
              <li>Enter custom stacks and see the algorithm adapt in real time.</li>
            </ul>
            <p>
              This is ideal for learners studying stack-based algorithms and understanding in-place
              versus auxiliary-space sorting strategies.
            </p>
          </div>
        );

      case 'theory':
        return (
          <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <h2>Theory</h2>
            <p>
              <b>Problem:</b> Given a stack of integers (unsorted), sort it so the smallest element
              is on top and the largest is at the bottom — using only one additional (temporary) stack.
              No array or other data structure is allowed.
            </p>

            <p>
              <b>Algorithm:</b>
            </p>
            <ol>
              <li>Pop an element <code>curr</code> from the main stack.</li>
              <li>
                While the temp stack is not empty <em>and</em> the top of the temp stack is greater
                than <code>curr</code>, pop from temp and push it back to main.
              </li>
              <li>Push <code>curr</code> onto the temp stack.</li>
              <li>Repeat until the main stack is empty.</li>
              <li>
                Transfer all elements from the temp stack back to the main stack (this reverses the
                order so the smallest is on top of main).
              </li>
            </ol>

            <p>
              <b>Why it works:</b> The temp stack is always maintained in sorted order (largest on
              top). Every time we insert a new element into temp, we make room for it by temporarily
              moving larger elements back to main. This guarantees the sorted invariant.
            </p>

            <p><b>Complexity:</b></p>
            <ul>
              <li>
                <b>Time:</b> <code>O(n²)</code> — in the worst case (reverse-sorted input), each
                element may trigger up to <em>n</em> moves back and forth.
              </li>
              <li>
                <b>Space:</b> <code>O(n)</code> — for the temporary stack.
              </li>
            </ul>

            <p><b>Comparison with other approaches:</b></p>
            <ul>
              <li>This is analogous to <strong>Insertion Sort</strong> but applied to a stack.</li>
              <li>It sorts <em>in-place</em> with respect to the stack abstraction (no array indexing).</li>
              <li>It is stable — equal elements retain their relative order.</li>
            </ul>
          </div>
        );

      case 'procedure':
        return (
          <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <h2>How to Use the Simulator</h2>
            <ol>
              <li>
                Go to the <b>Simulation</b> tab.
              </li>
              <li>
                Enter a list of integers separated by spaces or commas in the input field (e.g.,{' '}
                <code>5 3 8 1 6</code>). The <em>first</em> number will be the top of the stack.
              </li>
              <li>
                Click <b>Random</b> to auto-generate a random stack, or type your own values.
              </li>
              <li>
                Click <b>Set</b> to initialise the simulation.
              </li>
              <li>
                Click <b>Next Step</b> to advance one step at a time and observe element movements.
              </li>
              <li>
                Click <b>Prev Step</b> to go back and review a previous state.
              </li>
              <li>
                Click <b>Run All Steps</b> to animate the entire sorting process automatically.
              </li>
              <li>
                Click <b>Reset</b> (or the reset icon) to start over with a new input.
              </li>
              <li>
                Use the <b>Execution Log</b> panel on the right to review every action taken.
                Copy the log using the <b>Copy Log</b> button.
              </li>
            </ol>
            <p>
              <b>Tip:</b> Watch the <em>Holding</em> box — it shows the element currently being
              placed into the correct position in the temp stack.
            </p>
          </div>
        );

      case 'example1':
        return <SortStack_EX1 showSnackbar={showSnackbar} />;

      case 'example2':
        return <SortStack_EX2 showSnackbar={showSnackbar} />;

      case 'simulation':
        return <SortStackLab showSnackbar={showSnackbar} />;

      case 'Code':
        return <SortStack_Monaco />;

      case 'feedback':
        return (
          <Section
            title="Feedback"
            text="Please submit your feedback about this simulation to help us improve."
          />
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
      <div style={{ textAlign: 'center', fontSize: '20px', marginTop: '10px' }}>
        <b>SORT A STACK USING A TEMPORARY STACK</b>
      </div>
      <div style={{ paddingBottom: '20px', marginTop: '0px' }}>{renderContent()}</div>

      {/* Global Snackbar — single instance for all child components */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

const Navbar = ({ setActivePage, showExamples, setShowExamples }) => (
  <nav style={styles.navbar}>
    <button onClick={() => setActivePage('aim')}>Aim</button>
    <button onClick={() => setActivePage('theory')}>Theory</button>
    <button onClick={() => setActivePage('procedure')}>Procedure</button>
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setShowExamples((prev) => !prev)}>Examples ▾</button>
      {showExamples && (
        <div style={styles.dropdown}>
          <button
            onClick={() => {
              setActivePage('example1');
              setShowExamples(false);
            }}
          >
            Example 1
          </button>
          <button
            onClick={() => {
              setActivePage('example2');
              setShowExamples(false);
            }}
          >
            Example 2
          </button>
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
    flexWrap: 'wrap'
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: '#444',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 10,
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
  }
};

export default SortStack_template;

import React, { useState } from 'react';
import Trie_EX1 from './Trie_EX1';
import Trie_EX2 from './Trie_EX2';
import TrieLab from './TrieLab';
import Trie_Monoco from './Trie_Monoco';

const Trie_template = () => {
  const [activePage, setActivePage] = useState('aim');
  const [showExamples, setShowExamples] = useState(false);

  // A simple snackbar shim so TrieLab has the prop it expects
  const [snackbar, setSnackbar] = useState({ open: false, msg: "", sev: "info" });
  const showSnackbar = (msg, sev = "info") => setSnackbar({ open: true, msg, sev });

  const renderContent = () => {
    switch (activePage) {
      case 'aim':
        return (
          <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <h2>Aim</h2>
            <p>
              The aim of this visualization is to help learners intuitively understand the{' '}
              <strong>Trie (Prefix Tree)</strong> data structure through animated, step-by-step
              demonstrations of its core operations: <em>Insert</em>, <em>Search</em>, and{' '}
              <em>Delete</em>.
            </p>
            <p>Through this simulator, learners can:</p>
            <ul>
              <li>Watch nodes being created character-by-character during insertion.</li>
              <li>Trace the traversal path while searching for a word.</li>
              <li>Observe how nodes are removed (or preserved) during deletion when prefixes are shared.</li>
              <li>Understand the significance of the <strong>end-of-word (★)</strong> marker.</li>
              <li>Appreciate how Tries achieve O(L) time complexity for all three operations, where L is the word length.</li>
            </ul>
            <p>
              This tool is ideal for learners studying data structures, autocomplete systems,
              dictionary implementations, or IP routing tables.
            </p>
          </div>
        );

      case 'theory':
        return (
          <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <p>
              <b>Definition:</b> A Trie (also called a Prefix Tree or Digital Tree) is a tree-based
              data structure used to store strings where each node represents a single character.
              The root represents an empty string, and each path from the root to a marked node
              spells out a stored word.
            </p>

            <p>
              <b>Working Principle:</b> Every node has up to 26 children (for lowercase English
              letters). Shared prefixes are stored only once, making the Trie highly space-efficient
              for large vocabularies with common prefixes.
            </p>

            <p>
              <b>End-of-Word Marker (★):</b> A boolean flag on each node that indicates whether a
              complete word ends at that node. This distinguishes, for example, "app" from "apple"
              when both are stored.
            </p>

            <p><b>Operations:</b></p>
            <ul>
              <li>
                <b>Insert(word):</b> Traverse from the root, creating new child nodes for characters
                that don't exist. Mark the final node as end-of-word.
              </li>
              <li>
                <b>Search(word):</b> Traverse from the root following each character. Return true
                only if all characters are found AND the last node is marked as end-of-word.
              </li>
              <li>
                <b>Delete(word):</b> Locate the word; if found, remove the end-of-word marker.
                Prune dangling nodes bottom-up — only remove a node if it has no children and is not
                an end-of-word for another word.
              </li>
            </ul>

            <p><b>Advantages:</b></p>
            <ul>
              <li>O(L) time for insert, search, and delete (L = word length) — faster than hash maps for prefix queries.</li>
              <li>Supports prefix-based operations (autocomplete, spell-check) natively.</li>
              <li>Shared prefixes save space for large corpora.</li>
            </ul>

            <p><b>Disadvantages:</b></p>
            <ul>
              <li>Memory usage can be high if keys have few shared prefixes.</li>
              <li>Implementation is more complex than arrays or hash maps.</li>
            </ul>

            <p><b>Time Complexity:</b> <code>O(L)</code> per operation, where L is the length of the word.</p>
            <p><b>Space Complexity:</b> <code>O(N × A)</code>, where N is the number of nodes and A is the alphabet size.</p>

            <p>
              <b>Real-world uses:</b> Search engine autocomplete, spell checkers, IP routing (CIDR),
              DNA sequence matching, word games (Boggle, Scrabble solvers).
            </p>
          </div>
        );

      case 'procedure':
        return (
          <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <b>How to Use the Trie Visualizer:</b>
            <ol>
              <li>
                Type a <b>word</b> (lowercase letters only) in the input field in the Simulation tab.
              </li>
              <li>
                Select an <b>operation</b> — <em>Insert</em>, <em>Search</em>, or <em>Delete</em> —
                using the toggle buttons.
              </li>
              <li>
                Click the coloured action button (or press <b>Enter</b>) to begin the animated
                traversal.
              </li>
              <li>
                Watch the <b>highlighted path</b> animate character by character from the root to the
                target node.
              </li>
              <li>
                After traversal, node colours indicate the outcome:
                <ul>
                  <li><span style={{ color: '#818cf8' }}>■</span> <b>Purple</b> — newly inserted node.</li>
                  <li><span style={{ color: '#34d399' }}>■</span> <b>Green</b> — word found / already existed.</li>
                  <li><span style={{ color: '#f87171' }}>■</span> <b>Red</b> — word not found or node deleted.</li>
                  <li>
                    <span style={{ color: '#10b981' }}>★</span> <b>Star badge</b> — marks the end of a
                    complete stored word.
                  </li>
                </ul>
              </li>
              <li>
                The <b>Execution Steps</b> panel on the right records every decision made during the
                operation.
              </li>
              <li>
                Click <b>Reset (↺)</b> to clear the entire Trie and start fresh.
              </li>
              <li>
                Use the <b>Examples</b> tab to watch pre-built scenarios that demonstrate inserting,
                searching, and deleting a set of related words.
              </li>
            </ol>
          </div>
        );

      case 'example1':
        return <Trie_EX1 />;

      case 'example2':
        return <Trie_EX2 />;

      case 'simulation':
        return <TrieLab showSnackbar={showSnackbar} />;

      case 'Code':
        return <Trie_Monoco />;

      case 'feedback':
        return (
          <Section
            title="Feedback"
            text="Please submit your feedback about this Trie simulation."
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
        <b>TRIE (PREFIX TREE)</b>
      </div>
      <div style={{ paddingBottom: '20px', marginTop: '0px' }}>{renderContent()}</div>

      {/* Inline snackbar (simple) */}
      {snackbar.open && (
        <div
          style={{
            position: 'fixed',
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor:
              snackbar.sev === 'error' ? '#ef4444'
              : snackbar.sev === 'success' ? '#22c55e'
              : snackbar.sev === 'warning' ? '#f59e0b'
              : '#3b82f6',
            color: '#fff',
            padding: '10px 24px',
            borderRadius: 8,
            fontWeight: 600,
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
          onClick={() => setSnackbar({ open: false })}
        >
          {snackbar.msg}
        </div>
      )}
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
          <button onClick={() => { setActivePage('example1'); setShowExamples(false); }}>
            Example 1 — Insert &amp; Search
          </button>
          <button onClick={() => { setActivePage('example2'); setShowExamples(false); }}>
            Example 2 — Insert, Delete &amp; Verify
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
    minWidth: '220px',
  },
};

export default Trie_template;

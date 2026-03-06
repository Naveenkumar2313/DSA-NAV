import React, { useState } from 'react';
import CUS_EX1    from './CUS_EX1';
import CUS_EX2    from './CUS_EX2';
import CUSLab     from './CUSLab';
import CUS_Monoco from './CUS_Monoco';

const CUS_template = ({ showSnackbar = () => {} }) => {
  const [activePage,   setActivePage]   = useState('aim');
  const [showExamples, setShowExamples] = useState(false);

  const renderContent = () => {
    switch (activePage) {

      case 'aim':
        return (
          <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <h2>Aim</h2>
            <p>
              The aim of this visualization is to help learners understand the{' '}
              <strong>Count Unique Substrings</strong> algorithm using a{' '}
              <strong>Trie (Prefix Tree)</strong> data structure, through animated,
              step-by-step demonstrations of how all unique substrings of a given string
              are identified and counted.
            </p>
            <p>Using this simulator, learners can:</p>
            <ul>
              <li>Understand how inserting all <strong>suffixes</strong> of a string into a Trie naturally enumerates every unique substring.</li>
              <li>
                Observe that each <strong>node</strong> in the suffix Trie corresponds to
                exactly <em>one unique substring</em> of the original string.
              </li>
              <li>See how <strong>shared prefixes</strong> between suffixes are merged, avoiding duplicate counting.</li>
              <li>Recognise the relationship: <em>Total Trie nodes = number of unique non-empty substrings</em>.</li>
              <li>Experiment freely using the interactive Simulator with any custom string.</li>
            </ul>
            <p>
              This tool is ideal for learners exploring string processing, competitive programming,
              bioinformatics (DNA motif discovery), and text search / indexing systems.
            </p>
          </div>
        );

      case 'theory':
        return (
          <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <h2>Theory</h2>

            <p>
              <b>Problem:</b> Given a string <code>s</code> of length <code>n</code>,
              count the number of distinct (unique) substrings, including the empty
              substring.
            </p>

            <p>
              For example, for <code>"abc"</code> the unique substrings are:{' '}
              <code>"", "a", "b", "c", "ab", "bc", "abc"</code> → <b>7</b>.
            </p>

            <p><b>Trie-Based Approach:</b></p>
            <ol>
              <li>
                <b>Generate all suffixes</b> of the string <code>s</code>:
                <br />
                For <code>"abc"</code>: suffixes are <code>"abc"</code>, <code>"bc"</code>, <code>"c"</code>.
              </li>
              <li>
                <b>Insert each suffix</b> into a Trie character by character.
                Shared prefixes between different suffixes naturally share the same
                Trie path — no duplicate nodes are created.
              </li>
              <li>
                <b>Count Trie nodes</b>: Every node in the Trie (excluding the root)
                represents a unique non-empty substring. This is because every path
                from the root to any node spells out a substring that appears in
                <code>s</code>, and no two different substrings share the same node.
              </li>
              <li>
                <b>Add 1</b> for the empty substring if required.
              </li>
            </ol>

            <p><b>Why it works:</b></p>
            <p>
              Every substring of <code>s</code> is a prefix of some suffix of <code>s</code>.
              When we insert all suffixes into a Trie, every prefix of every suffix gets
              a corresponding path from the root. Since a Trie merges common prefixes,
              each unique substring maps to exactly one node.
            </p>

            <p><b>Complexity:</b></p>
            <ul>
              <li><b>Time:</b> O(n²) — we insert n suffixes, each up to length n.</li>
              <li><b>Space:</b> O(n²) — at most n(n+1)/2 Trie nodes in the worst case (all characters distinct).</li>
            </ul>

            <p><b>Interesting Cases:</b></p>
            <ul>
              <li><b>All distinct characters</b> (e.g., "abc"): Maximum nodes = n(n+1)/2. Every substring is unique.</li>
              <li><b>All same characters</b> (e.g., "aaa"): Minimum nodes = n. The Trie is a single chain.</li>
              <li><b>Repeated patterns</b> (e.g., "abab"): Shared suffixes reduce the node count below the maximum.</li>
            </ul>

            <p><b>Real-world Applications:</b></p>
            <ul>
              <li>Text indexing and full-text search engines</li>
              <li>DNA sequence motif discovery</li>
              <li>Data compression (Lempel-Ziv family)</li>
              <li>Plagiarism detection</li>
              <li>Competitive programming string problems</li>
            </ul>
          </div>
        );

      case 'procedure':
        return (
          <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <h2>Procedure</h2>
            <b>How to Use the Count Unique Substrings Visualizer:</b>
            <ol>
              <li>
                Navigate to the <b>Examples</b> tab to watch pre-built demonstrations, or jump
                directly to <b>Simulation</b> for a free-form interactive session.
              </li>
              <li>
                In the <b>Simulator</b>:
                <ul>
                  <li>Type a lowercase string (a–z only, max 10 characters) in the input field.</li>
                  <li>Click <b>Count Substrings</b> to build the suffix Trie and prepare the animation.</li>
                </ul>
              </li>
              <li>Use <b>Next Step (→)</b> to advance one animation frame at a time.</li>
              <li>Click <b>Run (▶)</b> to auto-play the full animation.</li>
              <li>Click <b>Pause (⏸)</b> to halt auto-play at any point.</li>
              <li>Click <b>Reset</b> to clear the Trie and start over.</li>
            </ol>

            <b>What to observe:</b>
            <ul>
              <li>Suffixes are inserted one by one — the Trie grows as new nodes are created.</li>
              <li>When a suffix shares a prefix with an already-inserted suffix, no new node is created for the shared part.</li>
              <li>
                Each <strong>new node</strong> (shown in purple) represents a <em>new unique substring</em>
                discovered for the first time.
              </li>
              <li>
                The final <strong>total node count</strong> equals the number of unique non-empty substrings.
              </li>
            </ul>

            <b>Color Legend:</b>
            <ul>
              <li>🟡 <b>Yellow (Traversing):</b> Node currently being examined.</li>
              <li>🟣 <b>Purple (New Node):</b> Newly created node — a new unique substring.</li>
              <li>🟢 <b>Teal / Green (Counted):</b> All nodes highlighted at the end — each is a unique substring.</li>
              <li>🔵 <b>Blue (Default):</b> Existing, previously created nodes.</li>
              <li>★ <b>Star below node:</b> End-of-suffix — a complete suffix terminates at this node.</li>
            </ul>
          </div>
        );

      case 'example1':
        return <CUS_EX1 />;

      case 'example2':
        return <CUS_EX2 />;

      case 'simulation':
        return <CUSLab showSnackbar={showSnackbar} />;

      case 'Code':
        return <CUS_Monoco />;

      case 'feedback':
        return (
          <Section
            title="Feedback"
            text="Please submit your feedback about this Count Unique Substrings visualization."
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
        <b>COUNT UNIQUE SUBSTRINGS — TRIE</b>
      </div>
      <div style={{ paddingBottom: '20px', marginTop: '0px' }}>{renderContent()}</div>
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

export default CUS_template;

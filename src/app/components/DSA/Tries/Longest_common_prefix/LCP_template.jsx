import React, { useState } from 'react';
import LCP_EX1    from './LCP_EX1';
import LCP_EX2    from './LCP_EX2';
import LCPLab     from './LCPLab';
import LCP_Monoco from './LCP_Monoco';

const LCP_template = ({ showSnackbar = () => {} }) => {
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
              <strong>Longest Common Prefix (LCP)</strong> algorithm using a{' '}
              <strong>Trie (Prefix Tree)</strong> data structure, through animated,
              step-by-step demonstrations of how the LCP is identified.
            </p>
            <p>Using this simulator, learners can:</p>
            <ul>
              <li>Understand how a Trie naturally encodes shared prefixes among a set of words.</li>
              <li>
                Observe how the LCP is found by walking down from the root as long as each node
                has <em>exactly one child</em> and is <em>not an end-of-word</em> marker.
              </li>
              <li>Visually identify the <strong>branch point</strong> — the node where words diverge — as the LCP boundary.</li>
              <li>Recognise edge cases: when the LCP is empty (no shared prefix) or when a shorter word is itself the LCP.</li>
              <li>Experiment freely using the interactive Simulator with any custom word set.</li>
            </ul>
            <p>
              This tool is ideal for learners exploring autocomplete systems, search engines,
              DNA sequence analysis, and competitive programming problems involving string prefixes.
            </p>
          </div>
        );

      case 'theory':
        return (
          <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <h2>Theory</h2>

            <p>
              <b>Problem:</b> Given an array of strings, find the longest string that is a prefix
              of <em>all</em> the strings. For example, for{' '}
              <code>["flower", "flow", "flight"]</code> the answer is <code>"fl"</code>.
            </p>

            <p><b>Trie-Based Approach:</b></p>
            <ol>
              <li>
                <b>Insert all words</b> into a Trie. Shared prefixes are automatically
                merged into shared paths from the root.
              </li>
              <li>
                <b>Walk from the root</b> downward, following the single path as long as:
                <ul>
                  <li>The current node has <strong>exactly one child</strong> (no branching — no divergence yet).</li>
                  <li>The current node is <strong>NOT an end-of-word</strong> (no word terminates here, meaning a shorter word would limit the prefix).</li>
                </ul>
              </li>
              <li>
                <b>Stop and record the LCP</b> when either condition above is violated. Every
                character traversed before stopping forms the Longest Common Prefix.
              </li>
            </ol>

            <p><b>Why it works:</b> The Trie merges identical leading characters into shared nodes.
              Any node on the single-child, non-terminal chain is reachable by ALL inserted words.
              The first branch or end-of-word marks where the words diverge.</p>

            <p><b>Complexity:</b></p>
            <ul>
              <li><b>Time:</b> O(N × L) to insert all N words of average length L, then O(L*) to traverse the LCP path.</li>
              <li><b>Space:</b> O(ALPHABET_SIZE × N × L) for the Trie nodes.</li>
            </ul>

            <p><b>Edge Cases:</b></p>
            <ul>
              <li><b>Empty LCP:</b> The root immediately branches (words start with different characters) → return <code>""</code>.</li>
              <li><b>Prefix is a word:</b> e.g., <code>["app", "apple"]</code> — the node for "app" is end-of-word, so traversal stops there → LCP = <code>"app"</code>.</li>
              <li><b>Single word:</b> The entire word is the LCP.</li>
              <li><b>All identical:</b> The full word is the LCP.</li>
            </ul>

            <p><b>Real-world Applications:</b></p>
            <ul>
              <li>Autocomplete and search-as-you-type interfaces</li>
              <li>URL routing and longest-prefix-match in networks</li>
              <li>Genome / DNA sequence alignment</li>
              <li>File path compression and diff tools</li>
              <li>Compiler symbol table lookups</li>
            </ul>
          </div>
        );

      case 'procedure':
        return (
          <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <h2>Procedure</h2>
            <b>How to Use the LCP Visualizer:</b>
            <ol>
              <li>
                Navigate to the <b>Examples</b> tab to watch pre-built demonstrations, or jump
                directly to <b>Simulation</b> for a free-form interactive session.
              </li>
              <li>
                In the <b>Simulator</b>:
                <ul>
                  <li>Type a lowercase word (a–z only) in the <em>Add word</em> field and press <b>Add</b> or Enter.</li>
                  <li>Add at least <strong>2 words</strong> to compare. Up to 8 words are supported.</li>
                  <li>Remove a word by clicking the ✕ on its chip.</li>
                  <li>Click <b>Find LCP</b> to build the Trie and prepare the animation.</li>
                </ul>
              </li>
              <li>Use <b>Next Step (→)</b> to advance one animation frame at a time.</li>
              <li>Click <b>Run (▶)</b> to auto-play the full animation.</li>
              <li>Click <b>Pause (⏸)</b> to halt auto-play at any point.</li>
              <li>Click <b>Reset</b> to clear the Trie and word list and start over.</li>
            </ol>

            <b>What to observe:</b>
            <ul>
              <li>The Trie is built word by word — shared prefixes merge into the same path.</li>
              <li>After all insertions, the LCP traversal starts at the root and walks the single-child chain.</li>
              <li>
                The traversal <strong>stops</strong> at either a <em>branch point</em> (multiple children)
                or an <em>end-of-word</em> node — both are shown in orange.
              </li>
              <li>
                The highlighted <em>teal / green path</em> from root to the stop point is the
                Longest Common Prefix.
              </li>
            </ul>

            <b>Color Legend:</b>
            <ul>
              <li>🟡 <b>Yellow (Traversing):</b> Node currently being examined.</li>
              <li>🟣 <b>Purple (Inserted):</b> Newly created node or end-of-word mark.</li>
              <li>🟢 <b>Teal / Green (LCP Path):</b> Nodes and edges forming the Longest Common Prefix.</li>
              <li>🟠 <b>Orange (Branch / Stop):</b> Branch point or end-of-word — LCP terminates here.</li>
              <li>🔵 <b>Blue (Default):</b> Existing, unvisited nodes.</li>
              <li>★ <b>Star below node:</b> End-of-word — a complete word terminates at this node.</li>
            </ul>
          </div>
        );

      case 'example1':
        return <LCP_EX1 />;

      case 'example2':
        return <LCP_EX2 />;

      case 'simulation':
        return <LCPLab showSnackbar={showSnackbar} />;

      case 'Code':
        return <LCP_Monoco />;

      case 'feedback':
        return (
          <Section
            title="Feedback"
            text="Please submit your feedback about this Longest Common Prefix visualization."
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
        <b>LONGEST COMMON PREFIX — TRIE</b>
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

export default LCP_template;

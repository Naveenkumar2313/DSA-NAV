import React, { useState } from 'react';
import NWP_EX1    from './NWP_EX1';
import NWP_EX2    from './NWP_EX2';
import NWPLab     from './NWPLab';
import NWP_Monoco from './NWP_Monoco';

const NWP_template = ({ showSnackbar = () => {} }) => {
  const [activePage,   setActivePage]   = useState('aim');
  const [showExamples, setShowExamples] = useState(false);

  const renderContent = () => {
    switch (activePage) {

      case 'aim':
        return (
          <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <h2>Aim</h2>
            <p>
              The primary aim of this simulation is to <strong>visualize the "Number of Words
              with a Given Prefix" algorithm</strong> using a Trie (Prefix Tree) data structure
              in a clear, animated, and interactive manner.
            </p>
            <p>This tool helps users understand how the algorithm works by:</p>
            <ul>
              <li>
                Animating the insertion of each word character-by-character into the Trie,
                showing how <code>wordCount</code> accumulates at every node on the path.
              </li>
              <li>
                Highlighting the prefix traversal step-by-step — tracing the exact path from
                root to the terminal prefix node using smooth color transitions and dashed arrows.
              </li>
              <li>
                Displaying the <code>#wordCount</code> badge on every node so learners can see
                at a glance how many words pass through any given node.
              </li>
              <li>Providing step-by-step control with Play, Pause, Next, and Previous buttons.</li>
              <li>Logging every decision in the Execution Steps panel for review and copying.</li>
              <li>Supporting both pre-built examples and a fully interactive simulator.</li>
            </ul>
            <p>This simulation is especially useful for:</p>
            <ul>
              <li><strong>Students</strong> learning Tries and prefix-based queries for the first time.</li>
              <li><strong>Educators</strong> demonstrating how wordCount tracking eliminates the need for subtree DFS.</li>
              <li><strong>Interview preparation</strong> — "prefix count" problems appear frequently in coding rounds.</li>
            </ul>
            <p>
              Ultimately, the aim is to bridge the gap between the theoretical concept and its
              real-time execution through a visual, sound-enhanced, and interactive experience.
            </p>
          </div>
        );

      case 'theory':
        return (
          <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <h2>Theory</h2>

            <p>
              <strong>Problem:</strong> Given a dictionary of words and a query prefix,
              count how many words in the dictionary start with that prefix.
            </p>
            <p>
              For example, given <code>["apple", "app", "application", "apply", "apt"]</code> and
              prefix <code>"app"</code>, the answer is <strong>4</strong> (apple, app, application, apply).
            </p>

            <h3>Trie-Based Approach</h3>
            <p>
              A <strong>Trie (Prefix Tree)</strong> stores each character of a word in a node.
              To count words with a given prefix efficiently, we augment each node with a
              <code> wordCount</code> field that is incremented for every word insertion that
              passes through that node.
            </p>

            <ol>
              <li>
                <strong>Insert with wordCount tracking:</strong> When inserting a word, for
                every character node visited (including intermediate ones), increment its
                <code> wordCount</code>. After the final character, mark <code>isEndOfWord = true</code>.
              </li>
              <li>
                <strong>Query:</strong> Follow the prefix path in the Trie. If any character in
                the prefix is missing, return <strong>0</strong>. Otherwise, return the
                <code> wordCount</code> of the last prefix node — this directly equals the number
                of inserted words that share this prefix.
              </li>
            </ol>

            <h3>Why wordCount works</h3>
            <p>
              Every word that starts with a prefix <em>P</em> must pass through the terminal
              node of <em>P</em> during insertion. Since we increment <code>wordCount</code>
              at every node on the insertion path, the terminal prefix node accumulates exactly
              one count per matching word — with no subtree traversal required at query time.
            </p>

            <h3>Complexity</h3>
            <ul>
              <li><strong>Insert:</strong> O(L) per word, where L = word length.</li>
              <li><strong>Query:</strong> O(P) per query, where P = prefix length. No subtree scan needed.</li>
              <li><strong>Space:</strong> O(ALPHABET_SIZE × N × L) for the Trie.</li>
            </ul>

            <h3>Comparison with naive approach</h3>
            <ul>
              <li>
                <strong>Naive (scan all words):</strong> O(N × L) per query — check every word for the prefix.
              </li>
              <li>
                <strong>Trie with wordCount:</strong> O(P) per query — no scanning, no subtree DFS.
              </li>
            </ul>

            <h3>Edge Cases</h3>
            <ul>
              <li><strong>Prefix not in Trie:</strong> Path breaks before completion → return 0.</li>
              <li><strong>Empty prefix:</strong> Returns total word count (root's child sum).</li>
              <li><strong>Exact match:</strong> If prefix is itself an inserted word, it is still counted.</li>
            </ul>

            <h3>Real-world Applications</h3>
            <ul>
              <li>Autocomplete engines (how many suggestions start with what you've typed?)</li>
              <li>Search-as-you-type result count indicators</li>
              <li>Contact / dictionary prefix lookups</li>
              <li>Competitive programming problems (LeetCode 208, 1804, 14, etc.)</li>
            </ul>
          </div>
        );

      case 'procedure':
        return (
          <div style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
            <h2>Procedure</h2>
            <p>
              This module lets you understand the step-by-step working of the
              <strong> Number of Words with Given Prefix</strong> algorithm through animated
              examples and an interactive simulator.
            </p>

            <h3>Using the Examples</h3>
            <ol>
              <li>Click <strong>Examples → Example 1</strong> or <strong>Example 2</strong>.</li>
              <li>The pre-built Trie will be displayed on the canvas.</li>
              <li>Use the control buttons:
                <ul>
                  <li><strong>Reset:</strong> Restart the animation from scratch.</li>
                  <li><strong>Prev Step:</strong> Go back one step.</li>
                  <li><strong>Next Step:</strong> Advance one step at a time.</li>
                  <li><strong>Run (▶):</strong> Auto-play the animation.</li>
                  <li><strong>Pause (⏸):</strong> Pause auto-play.</li>
                </ul>
              </li>
              <li>Watch Phase 1 — word insertion — where nodes light up as <code>wordCount</code> accumulates.</li>
              <li>Watch Phase 2 — prefix traversal — where the path lights up in purple/teal and ends with a green result node.</li>
              <li>Read the Execution Steps panel on the right for a step-by-step log.</li>
            </ol>

            <h3>Using the Simulator</h3>
            <ol>
              <li>Click <strong>Simulation</strong> from the navigation bar.</li>
              <li>Type a word (lowercase a–z) in the <em>Add word</em> field and press <strong>Add</strong> or Enter.</li>
              <li>Add 2–10 words to build your dictionary.</li>
              <li>Type a prefix in the <em>Search prefix</em> field and press <strong>Search</strong>.</li>
              <li>The result count appears immediately, and the animation steps are loaded.</li>
              <li>Use <strong>Next Step / Run / Pause</strong> to walk through the prefix traversal.</li>
              <li>Remove words from the dictionary using the ✕ on each chip.</li>
              <li>Use <strong>Full Reset</strong> to clear everything and start over.</li>
            </ol>

            <h3>Color Legend</h3>
            <ul>
              <li>🟡 <strong>Yellow (Current):</strong> The node being examined at this step.</li>
              <li>🔵 <strong>Blue (Inserted):</strong> A node that has been inserted into the Trie.</li>
              <li>🟣 <strong>Purple (Prefix Path):</strong> Nodes on the confirmed prefix path.</li>
              <li>🟢 <strong>Green (Result Node):</strong> The terminal prefix node — its wordCount is the answer.</li>
              <li>⚪ <strong>Grey (Unvisited):</strong> Nodes not yet reached by the current operation.</li>
              <li><strong>#N:</strong> The wordCount badge shown inside each node.</li>
              <li>★ End-of-word marker below a node.</li>
            </ul>
          </div>
        );

      case 'example1':
        return <NWP_EX1 />;

      case 'example2':
        return <NWP_EX2 />;

      case 'simulation':
        return <NWPLab showSnackbar={showSnackbar} />;

      case 'Code':
        return <NWP_Monoco />;

      case 'feedback':
        return (
          <Section
            title="Feedback"
            text="Please submit your feedback about this Number of Words with Given Prefix visualization."
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
        <b>NUMBER OF WORDS WITH GIVEN PREFIX — TRIE</b>
      </div>
      <div style={{ paddingBottom: '20px' }}>{renderContent()}</div>
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

export default NWP_template;

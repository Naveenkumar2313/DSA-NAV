import React from 'react';

const Home = () => {
  return (
    <div style={styles.container}>
      <header style={styles.hero}>
        <h1 style={styles.title}>DSA Visualizer Portal</h1>
        <p style={styles.tagline}>
          A modern interactive platform to visualize and understand core data structures and algorithms with precision and clarity.
        </p>
      </header>

      <section style={styles.section}>
        <div style={styles.textBlock}>
          <h2>Welcome</h2>
          <p>
            The DSA Visualizer is a web-based educational tool designed to help students and learners develop a strong conceptual understanding of fundamental algorithms and data structures. Rather than just reading code or theory, users experience algorithms dynamically — observing how each step transforms data in real time.
          </p>
          <p>
            Whether it's tree traversal, array sorting, or list manipulation, this portal brings logic to life. Each simulation is supported by a clean interface, structured code examples in multiple languages, and well-paced animations paired with auditory feedback.
          </p>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.textBlock}>
          <h2>Why This Portal?</h2>
          <p>
            Visual learning enhances algorithmic thinking. This tool bridges the gap between abstract logic and intuitive understanding. With simulations that reveal what textbooks can't show, the DSA Visualizer empowers learners to grasp not just the “what” but the “how” and “why” of algorithms.
          </p>
          <p>
            It’s an ideal companion for self-study, classroom teaching, lab demonstrations, and interviews — built with performance, clarity, and pedagogy in mind.
          </p>
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'times-new-roman',
    backgroundColor: '#f4f7fb',
    color: '#2c3e50',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  hero: {
    background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
    color: '#fff',
    textAlign: 'center',
  },
  title: {
    fontSize: '3rem',
    marginBottom: '10px',
  },
  tagline: {
    fontSize: '1.2rem',
    maxWidth: '700px',
    margin: '0 auto 30px',
    lineHeight: 1.6,
  },
  startButton: {
    backgroundColor: '#ff9800',
    padding: '12px 28px',
    color: '#fff',
    fontSize: '1rem',
    borderRadius: '6px',
    textDecoration: 'none',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease-in-out',
  },
  section: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  textBlock: {
    fontSize: '1.05rem',
    lineHeight: 1.8,
  }
};

export default Home;

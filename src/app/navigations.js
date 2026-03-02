const navigations = [
  { label: "DSA Algorithms", type: "label" },
  {
    name: "Arrays",
    badge: { color: "secondary" },
    children: [
      { name: "Binary Search", path: "/components/arrays/Bsearch" },
      { name: "Linear Search", path: "/components/arrays/Lsearch" },
      { name: "Bubble Sort", path: "/components/arrays/BBS" },
      { name: "Selection Sort", path: "/components/arrays/SLS" }
    ]
  },
  {
    name: "Trees",
    badge: { color: "secondary" },
    children: [
      { name: "BFS", path: "/components/trees/BFS" },
      { name: "DFS", path: "/components/trees/DFS" },
      { name: "DLS", path: "/components/trees/DLS" }
    ]
  },
  {
    name: "Stacks",
    badge: { color: "secondary" },
    children: [
      { name: "Stack Operations", path: "/components/Stacks/Operations" },
      { name: "Infix to Postfix", path: "/components/Stacks/INPO" },
      { name: "Valid Parenthesis", path: "/components/Stacks/VP" }
    ]
  },
  {
    name: "Queue",
    badge: { color: "secondary" },
    children: [
      { name: "Queue Operations", path: "/components/Queue/Operations" },
      { name: "Circular Queue Operations", path: "/components/Queue/Circular-Queue-Operations" }
    ]
  },
  {
    name: "Tries",
    badge: { color: "secondary" },
    children: [
      { name: "Trie Operations", path: "/components/Tries/Operations" },
      { name: "Longest Common Prefix", path: "/components/Tries/Longest_common_prefix" },
      { name: "Words with given prefix", path: "/components/Tries/Words_with_given_prefix" }
    ]
  }
];

export default navigations;

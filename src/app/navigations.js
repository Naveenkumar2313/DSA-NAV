const navigations = [
  { label: "DSA Algorithms", type: "label" },
  {
    name: "Arrays",
    badge: { color: "secondary" },
    children: [
      { name: "Binary Search", path: "/components/arrays/Bsearch" },
      { name: "Linear Search", path: "/components/arrays/Lsearch" },
      { name: "Bubble Sort", path: "/components/arrays/BBS" },
      { name: "Selection Sort", path: "/components/arrays/SLS" },
      { name: "Two Pointer (Palindrome)", path: "/components/arrays/TwoPointer" }
    ]
  },
  {
    name: "Trees",
    badge: { color: "secondary" },
    children: [
      { name: "BFS", path: "/components/trees/BFS" },
      { name: "DFS", path: "/components/trees/DFS" },
      { name: "DLS", path: "/components/trees/DLS" },
      { name: "Diameter of Binary Tree", path: "/components/trees/Diameter" },
      { name: "Path Sum", path: "/components/trees/PathSum" },
      { name: "Balanced Binary Tree", path: "/components/trees/BalancedBinaryTree" }
    ]
  },
  {
    name: "Stacks",
    badge: { color: "secondary" },
    children: [
      { name: "Stack Operations", path: "/components/Stacks/Operations" },
      { name: "Infix to Postfix", path: "/components/Stacks/INPO" },
      { name: "Valid Parenthesis", path: "/components/Stacks/VP" },
      { name: "Sort a stack", path: "/components/Stacks/sort_stack" }
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
      { name: "Words with given prefix", path: "/components/Tries/Words_with_given_prefix" },
      { name: "Count Unique Substrings", path: "/components/Tries/Count_unique_substrings" }
    ]
  },
  {
    name: "Graphs",
    badge: { color: "secondary" },
    children: [
      { name: "DFS", path: "/components/graphs/DFS" },
      { name: "BFS", path: "/components/graphs/BFS" },
      { name: "Dijkstra", path: "/components/graphs/Dijkstra" },
      { name: "Kruskal", path: "/components/graphs/Kruskal" }
    ]
  },
  {
    name: "Linked List",
    badge: { color: "secondary" },
    children: [{ name: "Reverse a linked list", path: "/components/linked-list/reverse" }]
  }
];

export default navigations;

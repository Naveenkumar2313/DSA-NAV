import { lazy } from "react";
import { Navigate } from "react-router-dom";

import AuthGuard from "./auth/AuthGuard";
import { authRoles } from "./auth/authRoles";

import Loadable from "./components/Loadable";
import MatxLayout from "./components/MatxLayout/MatxLayout";
import Demo from "./components/Demo";
import Home from "./components/DSA/dash_default";
import BFS_template from "./components/DSA/Trees/BFS/BFS_template";
import DFS_template from "./components/DSA/Trees/DFS/DFS_template";
import DLS_template from "./components/DSA/Trees/DLS/DLS_template";
import BNS_template from "./components/DSA/Arrays/binary_search/BNS_template";
import LS_template from "./components/DSA/Arrays/linear_search/LS_template";
import BBS_template from "./components/DSA/Arrays/Bubble_sort/BBS_template";
import SLS_template from "./components/DSA/Arrays/Selection_sort/SLS_template";
import ST_template from "./components/DSA/Stacks/Stack_operation/ST_template";
import INPO_template from "./components/DSA/Stacks/Infix-Postfix/INPO_template";
import VP_template from "./components/DSA/Stacks/Valid-Parenthesis/VP_template";
import QOP_template from "./components/DSA/Queues/Queue-operations/QOP_template";
import CQOP_template from "./components/DSA/Queues/Circular-Queue-Operations/CQOP_template";
import Tries_template from "./components/DSA/Tries/Trie-operations/Trie_template";
import sessionRoutes from "./views/sessions/session-routes";
import LCP_template from "./components/DSA/Tries/Longest_common_prefix/LCP_template";
import NWP_template from "./components/DSA/Tries/Words_with_given_prefix/NWP_template";
import CUS_template from "./components/DSA/Tries/Count_unique_substrings/CUS_template";
import Graph_DFS_template from "./components/DSA/Graphs/DFS/DFS_template";
import GraphBFS_template from "./components/DSA/Graphs/BFS/GraphBFS_template";
import Dijkstra_template from "./components/DSA/Graphs/Dijkstra/Dijkstra_template";
import Kruskal_template from "./components/DSA/Graphs/Kruskal/Kruskal_template";
import RLL_template from "./components/DSA/LinkedList/Reverse-a-linked-list/RLL_template";
import DBT_template from "./components/DSA/Trees/Diameter_of_a_Binary_Tree/DBT_template";
import PS_template from "./components/DSA/Trees/Path_Sum/PS_template";
import BBT_template from "./components/DSA/Trees/Balanced_Binary_Tree/BBT_template";
import TP_template from "./components/DSA/Arrays/Two_pointer/TP_template";
import SortStack_template from "./components/DSA/Stacks/Sort_stack/SortStack_template";

const routes = [
  { path: "/", element: <Navigate to="dashboard/default" /> },
  {
    element: (
      <AuthGuard>
        <MatxLayout />
      </AuthGuard>
    ),
    children: [
      // dashboard route
      { path: "/dashboard/default", element: <Home />, auth: authRoles.admin },
      // e-chart route
      { path: "/charts/echarts", element: <Demo />, auth: authRoles.editor },
      // material routes
      { path: "/components/arrays/Bsearch", element: <BNS_template /> },
      { path: "/components/arrays/Lsearch", element: <LS_template /> },
      { path: "/components/arrays/BBS", element: <BBS_template /> },
      { path: "/components/arrays/SLS", element: <SLS_template /> },
      { path: "/components/arrays/TwoPointer", element: <TP_template /> },
      { path: "/components/trees/BFS", element: <BFS_template /> },
      { path: "/components/trees/DFS", element: <DFS_template /> },
      { path: "/components/trees/DLS", element: <DLS_template /> },
      { path: "components/Stacks/Operations", element: <ST_template /> },
      { path: "/components/Stacks/INPO", element: <INPO_template /> },
      { path: "/components/Stacks/VP", element: <VP_template /> },
      { path: "/components/Queue/Operations", element: <QOP_template /> },
      { path: "/components/Queue/Circular-Queue-Operations", element: <CQOP_template /> },
      { path: "/components/Tries/Operations", element: <Tries_template /> },
      { path: "/components/Tries/Longest_common_prefix", element: <LCP_template /> },
      { path: "/components/Tries/Words_with_given_prefix", element: <NWP_template /> },
      { path: "/components/Tries/Count_unique_substrings", element: <CUS_template /> },
      { path: "/components/graphs/DFS", element: <Graph_DFS_template /> },
      { path: "/components/graphs/BFS", element: <GraphBFS_template /> },
      { path: "/components/graphs/Dijkstra", element: <Dijkstra_template /> },
      { path: "/components/graphs/Kruskal", element: <Kruskal_template /> },
      { path: "/components/linked-list/reverse", element: <RLL_template /> },
      { path: "/components/trees/Diameter", element: <DBT_template /> },
      { path: "/components/trees/PathSum", element: <PS_template /> },
      { path: "/components/trees/BalancedBinaryTree", element: <BBT_template /> },
      { path: "/components/Stacks/sort_stack", element: <SortStack_template /> },
    ]
  },

  // session pages route
  ...sessionRoutes
];

export default routes;

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
      // material routes (reduced to 5 pages)
      { path: "/components/arrays/Bsearch", element: <BNS_template /> },
      { path: "/components/arrays/Lsearch", element: <LS_template /> },
      { path: "/components/arrays/BBS", element: <BBS_template /> },
      { path: "/components/arrays/SLS", element: <SLS_template /> },
      { path: "/components/trees/BFS", element: <BFS_template /> },
      { path: "/components/trees/DFS", element: <DFS_template /> },
      { path: "/components/trees/DLS", element: <DLS_template /> },
      { path: "/components/Stacks/Operations", element: <ST_template /> },
      { path: "/components/Stacks/INPO", element: <INPO_template /> },
      { path: "/components/Stacks/VP", element: <VP_template /> },
      { path: "/components/Linked-List/Merge", element: <Demo /> },
      { path: "/components/Queue/Operations", element: <QOP_template /> },
      { path: "/components/Queue/Circular-Queue-Operations", element: <CQOP_template /> },
      { path: "/components/Tries/Operations", element: <Tries_template /> }
    ]
  },

  // session pages route
  ...sessionRoutes
];

export default routes;

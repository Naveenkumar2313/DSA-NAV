export const DFScodeSnippets = {
    c: `#include <stdio.h>
  #include <stdlib.h>
  
  #define MAX 100
  
  void dfs(int graph[][MAX], int visited[], int node, int n) {
      visited[node] = 1;
      printf("%d ", node);
  
      for (int i = 0; i < n; i++) {
          if (graph[node][i] && !visited[i]) {
              dfs(graph, visited, i, n);
          }
      }
  }
  `,
  
    cpp: `#include <iostream>
  #include <vector>
  
  void dfsUtil(std::vector<std::vector<int>>& graph, std::vector<bool>& visited, int node) {
      visited[node] = true;
      std::cout << node << " ";
  
      for (int neighbor : graph[node]) {
          if (!visited[neighbor]) {
              dfsUtil(graph, visited, neighbor);
          }
      }
  }
  
  void dfs(std::vector<std::vector<int>>& graph, int start) {
      std::vector<bool> visited(graph.size(), false);
      dfsUtil(graph, visited, start);
  }
  `,
  
    python: `def dfs(graph, node, visited=None):
      if visited is None:
          visited = set()
  
      if node not in visited:
          print(node, end=' ')
          visited.add(node)
          for neighbor in graph[node]:
              if neighbor not in visited:
                  dfs(graph, neighbor, visited)
  `,
  
    java: `import java.util.*;
  
  public class DFS {
      public static void dfs(List<List<Integer>> graph, int node, boolean[] visited) {
          visited[node] = true;
          System.out.print(node + " ");
  
          for (int neighbor : graph.get(node)) {
              if (!visited[neighbor]) {
                  dfs(graph, neighbor, visited);
              }
          }
      }
  
      public static void startDFS(List<List<Integer>> graph, int start) {
          boolean[] visited = new boolean[graph.size()];
          dfs(graph, start, visited);
      }
  }
  `
  };
  
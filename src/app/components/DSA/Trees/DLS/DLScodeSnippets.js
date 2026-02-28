export const DLScodeSnippets = {
    c: `#include <stdio.h>
  #include <stdlib.h>
  
  #define MAX 100
  
  void dls(int graph[][MAX], int visited[], int node, int depth, int limit, int n) {
      if (depth > limit) return;
  
      visited[node] = 1;
      printf("%d ", node);
  
      for (int i = 0; i < n; i++) {
          if (graph[node][i] && !visited[i]) {
              dls(graph, visited, i, depth + 1, limit, n);
          }
      }
  }
  `,
  
    cpp: `#include <iostream>
  #include <vector>
  
  void dlsUtil(const std::vector<std::vector<int>>& graph, std::vector<bool>& visited, int node, int depth, int limit) {
      if (depth > limit) return;
  
      visited[node] = true;
      std::cout << node << " ";
  
      for (int neighbor : graph[node]) {
          if (!visited[neighbor]) {
              dlsUtil(graph, visited, neighbor, depth + 1, limit);
          }
      }
  }
  
  void dls(const std::vector<std::vector<int>>& graph, int start, int limit) {
      std::vector<bool> visited(graph.size(), false);
      dlsUtil(graph, visited, start, 0, limit);
  }
  `,
  
    python: `def dls(graph, node, limit, depth=0, visited=None):
      if visited is None:
          visited = set()
  
      if depth > limit:
          return
  
      if node not in visited:
          print(node, end=' ')
          visited.add(node)
          for neighbor in graph[node]:
              if neighbor not in visited:
                  dls(graph, neighbor, limit, depth + 1, visited)
  `,
  
    java: `import java.util.*;
  
  public class DLS {
      public static void dls(List<List<Integer>> graph, int node, boolean[] visited, int depth, int limit) {
          if (depth > limit) return;
  
          visited[node] = true;
          System.out.print(node + " ");
  
          for (int neighbor : graph.get(node)) {
              if (!visited[neighbor]) {
                  dls(graph, neighbor, visited, depth + 1, limit);
              }
          }
      }
  
      public static void startDLS(List<List<Integer>> graph, int start, int limit) {
          boolean[] visited = new boolean[graph.size()];
          dls(graph, start, visited, 0, limit);
      }
  }
  `
  };
  
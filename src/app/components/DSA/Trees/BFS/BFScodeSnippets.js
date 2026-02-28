// src/data/codeSnippets.js
export const BFScodeSnippets = {
    c: `#include <stdio.h>
  #include <stdlib.h>
  
  #define MAX 100
  
  void bfs(int graph[][MAX], int visited[], int start, int n) {
      int queue[MAX], front = 0, rear = 0;
      queue[rear++] = start;
      visited[start] = 1;
  
      while (front < rear) {
          int node = queue[front++];
          printf("%d ", node);
          for (int i = 0; i < n; i++) {
              if (graph[node][i] && !visited[i]) {
                  queue[rear++] = i;
                  visited[i] = 1;
              }
          }
      }
  }
  `,
    cpp: `#include <iostream>
  #include <queue>
  #include <vector>
  
  void bfs(std::vector<std::vector<int>>& graph, int start) {
      std::vector<bool> visited(graph.size(), false);
      std::queue<int> q;
      q.push(start);
      visited[start] = true;
  
      while (!q.empty()) {
          int node = q.front(); q.pop();
          std::cout << node << " ";
  
          for (int neighbor : graph[node]) {
              if (!visited[neighbor]) {
                  q.push(neighbor);
                  visited[neighbor] = true;
              }
          }
      }
  }
  `,
    python: `from collections import deque
  
  def bfs(graph, start):
      visited = set()
      queue = deque([start])
  
      while queue:
          node = queue.popleft()
          if node not in visited:
              print(node, end=' ')
              visited.add(node)
              queue.extend(neighbor for neighbor in graph[node] if neighbor not in visited)
  `,
    java: `import java.util.*;
  
  public class BFS {
      public static void bfs(List<List<Integer>> graph, int start) {
          boolean[] visited = new boolean[graph.size()];
          Queue<Integer> queue = new LinkedList<>();
          queue.add(start);
          visited[start] = true;
  
          while (!queue.isEmpty()) {
              int node = queue.poll();
              System.out.print(node + " ");
              for (int neighbor : graph.get(node)) {
                  if (!visited[neighbor]) {
                      queue.add(neighbor);
                      visited[neighbor] = true;
                  }
              }
          }
      }
  }
  `
  };
  
export const DijkstraCodeSnippets = {
  python: `import heapq
  
  def dijkstra(graph, start):
      distances = {node: float('inf') for node in graph}
      distances[start] = 0
      previous = {node: None for node in graph}
      pq = [(0, start)]
      visited = set()
      
      while pq:
          current_dist, current = heapq.heappop(pq)
          
          if current in visited:
              continue
          visited.add(current)
          
          for neighbor, weight in graph[current].items():
              distance = current_dist + weight
              
              if distance < distances[neighbor]:
                  distances[neighbor] = distance
                  previous[neighbor] = current
                  heapq.heappush(pq, (distance, neighbor))
      
      return distances, previous
  
  # Example usage
  graph = {
      'A': {'B': 4, 'C': 2},
      'B': {'A': 4, 'C': 1, 'D': 5},
      'C': {'A': 2, 'B': 1, 'E': 10},
      'D': {'B': 5, 'E': 2, 'F': 6},
      'E': {'C': 10, 'D': 2, 'F': 3},
      'F': {'D': 6, 'E': 3}
  }
  
  distances, prev = dijkstra(graph, 'A')`,

  java: `import java.util.*;
  
  class Dijkstra {
      static class Node implements Comparable<Node> {
          int vertex, distance;
          
          Node(int vertex, int distance) {
              this.vertex = vertex;
              this.distance = distance;
          }
          
          public int compareTo(Node other) {
              return Integer.compare(this.distance, other.distance);
          }
      }
      
      public static int[] dijkstra(
          Map<Integer, Map<Integer, Integer>> graph, 
          int start, 
          int n
      ) {
          int[] distances = new int[n];
          Arrays.fill(distances, Integer.MAX_VALUE);
          distances[start] = 0;
          
          PriorityQueue<Node> pq = new PriorityQueue<>();
          pq.offer(new Node(start, 0));
          boolean[] visited = new boolean[n];
          
          while (!pq.isEmpty()) {
              Node current = pq.poll();
              int u = current.vertex;
              
              if (visited[u]) continue;
              visited[u] = true;
              
              if (graph.containsKey(u)) {
                  for (Map.Entry<Integer, Integer> neighbor : 
                       graph.get(u).entrySet()) {
                      int v = neighbor.getKey();
                      int weight = neighbor.getValue();
                      
                      if (distances[u] + weight < distances[v]) {
                          distances[v] = distances[u] + weight;
                          pq.offer(new Node(v, distances[v]));
                      }
                  }
              }
          }
          
          return distances;
      }
  }`,

  cpp: `#include <vector>
  #include <queue>
  #include <climits>
  using namespace std;
  
  typedef pair<int, int> pii;
  
  vector<int> dijkstra(vector<vector<pii>>& graph, int start) {
      int n = graph.size();
      vector<int> distances(n, INT_MAX);
      distances[start] = 0;
      
      priority_queue<pii, vector<pii>, greater<pii>> pq;
      pq.push({0, start});
      
      while (!pq.empty()) {
          int dist = pq.top().first;
          int u = pq.top().second;
          pq.pop();
          
          if (dist > distances[u]) continue;
          
          for (auto& edge : graph[u]) {
              int v = edge.first;
              int weight = edge.second;
              
              if (distances[u] + weight < distances[v]) {
                  distances[v] = distances[u] + weight;
                  pq.push({distances[v], v});
              }
          }
      }
      
      return distances;
  }`,

  c: `#include <stdio.h>
  #include <limits.h>
  
  #define V 6
  #define INF INT_MAX
  
  int minDistance(int dist[], int visited[]) {
      int min = INF, min_index;
      
      for (int v = 0; v < V; v++)
          if (!visited[v] && dist[v] <= min)
              min = dist[v], min_index = v;
      
      return min_index;
  }
  
  void dijkstra(int graph[V][V], int src) {
      int dist[V];
      int visited[V] = {0};
      
      for (int i = 0; i < V; i++)
          dist[i] = INF;
      
      dist[src] = 0;
      
      for (int count = 0; count < V - 1; count++) {
          int u = minDistance(dist, visited);
          visited[u] = 1;
          
          for (int v = 0; v < V; v++) {
              if (!visited[v] && graph[u][v] && 
                  dist[u] != INF && 
                  dist[u] + graph[u][v] < dist[v]) {
                  dist[v] = dist[u] + graph[u][v];
              }
          }
      }
      
      printf("Shortest distances from source:\\n");
      for (int i = 0; i < V; i++)
          printf("Node %d: %d\\n", i, dist[i]);
  }`
};

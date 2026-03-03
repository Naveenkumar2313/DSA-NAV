// Graph BFS code snippets in multiple languages
export const GraphBFScodeSnippets = {
  c: `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

#define MAX 100

typedef struct {
    int items[MAX];
    int front, rear;
} Queue;

void initQueue(Queue* q) {
    q->front = -1;
    q->rear = -1;
}

bool isEmpty(Queue* q) {
    return q->front == -1;
}

void enqueue(Queue* q, int value) {
    if (q->front == -1) q->front = 0;
    q->items[++(q->rear)] = value;
}

int dequeue(Queue* q) {
    int item = q->items[q->front];
    if (q->front >= q->rear) {
        q->front = q->rear = -1;
    } else {
        q->front++;
    }
    return item;
}

void bfs(int graph[][MAX], int n, int start) {
    bool visited[MAX] = {false};
    Queue q;
    initQueue(&q);
    
    visited[start] = true;
    enqueue(&q, start);
    
    printf("BFS Traversal: ");
    
    while (!isEmpty(&q)) {
        int current = dequeue(&q);
        printf("%d ", current);
        
        // Visit all adjacent vertices
        for (int i = 0; i < n; i++) {
            if (graph[current][i] == 1 && !visited[i]) {
                visited[i] = true;
                enqueue(&q, i);
            }
        }
    }
    printf("\\n");
}

int main() {
    int n = 6;
    int graph[MAX][MAX] = {
        {0, 1, 1, 0, 0, 0},
        {1, 0, 0, 1, 1, 0},
        {1, 0, 0, 0, 0, 1},
        {0, 1, 0, 0, 0, 0},
        {0, 1, 0, 0, 0, 1},
        {0, 0, 1, 0, 1, 0}
    };
    
    bfs(graph, n, 0);
    return 0;
}`,

  cpp: `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

class Graph {
    int V; // Number of vertices
    vector<vector<int>> adj; // Adjacency list

public:
    Graph(int V) {
        this->V = V;
        adj.resize(V);
    }

    void addEdge(int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u); // For undirected graph
    }

    void BFS(int start) {
        vector<bool> visited(V, false);
        queue<int> q;

        visited[start] = true;
        q.push(start);

        cout << "BFS Traversal: ";

        while (!q.empty()) {
            int current = q.front();
            q.pop();
            cout << current << " ";

            // Visit all adjacent vertices
            for (int neighbor : adj[current]) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    q.push(neighbor);
                }
            }
        }
        cout << endl;
    }

    bool search(int start, int target) {
        vector<bool> visited(V, false);
        queue<int> q;

        visited[start] = true;
        q.push(start);

        while (!q.empty()) {
            int current = q.front();
            q.pop();

            if (current == target) {
                cout << "Found " << target << "!" << endl;
                return true;
            }

            for (int neighbor : adj[current]) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    q.push(neighbor);
                }
            }
        }
        
        cout << "Target " << target << " not found." << endl;
        return false;
    }
};

int main() {
    Graph g(6);
    
    // Add edges
    g.addEdge(0, 1);
    g.addEdge(0, 2);
    g.addEdge(1, 3);
    g.addEdge(1, 4);
    g.addEdge(2, 5);
    g.addEdge(4, 5);

    g.BFS(0);
    g.search(0, 5);

    return 0;
}`,

  python: `from collections import deque

class Graph:
    def __init__(self):
        self.graph = {}
    
    def add_edge(self, u, v):
        if u not in self.graph:
            self.graph[u] = []
        if v not in self.graph:
            self.graph[v] = []
        self.graph[u].append(v)
        self.graph[v].append(u)  # For undirected graph
    
    def bfs(self, start):
        visited = set()
        queue = deque([start])
        visited.add(start)
        
        print("BFS Traversal:", end=" ")
        
        while queue:
            current = queue.popleft()
            print(current, end=" ")
            
            # Visit all neighbors
            for neighbor in self.graph.get(current, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        
        print()
    
    def search(self, start, target):
        visited = set()
        queue = deque([start])
        visited.add(start)
        
        while queue:
            current = queue.popleft()
            
            if current == target:
                print(f"Found {target}!")
                return True
            
            for neighbor in self.graph.get(current, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        
        print(f"Target {target} not found.")
        return False

# Example usage
g = Graph()
g.add_edge('A', 'B')
g.add_edge('A', 'C')
g.add_edge('B', 'D')
g.add_edge('B', 'E')
g.add_edge('C', 'F')
g.add_edge('E', 'F')

g.bfs('A')
g.search('A', 'F')`,

  java: `import java.util.*;

class Graph {
    private int V; // Number of vertices
    private LinkedList<Integer>[] adj; // Adjacency list

    @SuppressWarnings("unchecked")
    Graph(int v) {
        V = v;
        adj = new LinkedList[v];
        for (int i = 0; i < v; i++) {
            adj[i] = new LinkedList<>();
        }
    }

    void addEdge(int u, int v) {
        adj[u].add(v);
        adj[v].add(u); // For undirected graph
    }

    void BFS(int start) {
        boolean[] visited = new boolean[V];
        Queue<Integer> queue = new LinkedList<>();

        visited[start] = true;
        queue.add(start);

        System.out.print("BFS Traversal: ");

        while (!queue.isEmpty()) {
            int current = queue.poll();
            System.out.print(current + " ");

            // Visit all adjacent vertices
            for (int neighbor : adj[current]) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    queue.add(neighbor);
                }
            }
        }
        System.out.println();
    }

    boolean search(int start, int target) {
        boolean[] visited = new boolean[V];
        Queue<Integer> queue = new LinkedList<>();

        visited[start] = true;
        queue.add(start);

        while (!queue.isEmpty()) {
            int current = queue.poll();

            if (current == target) {
                System.out.println("Found " + target + "!");
                return true;
            }

            for (int neighbor : adj[current]) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    queue.add(neighbor);
                }
            }
        }

        System.out.println("Target " + target + " not found.");
        return false;
    }

    public static void main(String[] args) {
        Graph g = new Graph(6);

        g.addEdge(0, 1);
        g.addEdge(0, 2);
        g.addEdge(1, 3);
        g.addEdge(1, 4);
        g.addEdge(2, 5);
        g.addEdge(4, 5);

        g.BFS(0);
        g.search(0, 5);
    }
}`
};

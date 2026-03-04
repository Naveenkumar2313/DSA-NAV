// Kruskal's Algorithm code snippets in multiple languages
export const KruskalscodeSnippets = {
  c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_EDGES 100
#define MAX_VERTICES 100

typedef struct {
    int u, v, weight;
} Edge;

typedef struct {
    int parent;
    int rank;
} DSU;

int find(DSU dsu[], int x) {
    if (dsu[x].parent != x) {
        dsu[x].parent = find(dsu, dsu[x].parent);
    }
    return dsu[x].parent;
}

void unionSets(DSU dsu[], int x, int y) {
    int px = find(dsu, x);
    int py = find(dsu, y);
    
    if (dsu[px].rank < dsu[py].rank) {
        dsu[px].parent = py;
    } else if (dsu[px].rank > dsu[py].rank) {
        dsu[py].parent = px;
    } else {
        dsu[py].parent = px;
        dsu[px].rank++;
    }
}

int compareEdges(const void *a, const void *b) {
    return ((Edge *)a)->weight - ((Edge *)b)->weight;
}

void kruskal(Edge edges[], int n_vertices, int n_edges) {
    qsort(edges, n_edges, sizeof(Edge), compareEdges);
    
    DSU dsu[MAX_VERTICES];
    for (int i = 0; i < n_vertices; i++) {
        dsu[i].parent = i;
        dsu[i].rank = 0;
    }
    
    int mst_weight = 0;
    int mst_edges = 0;
    
    printf("Kruskal's Algorithm MST:\\n");
    for (int i = 0; i < n_edges && mst_edges < n_vertices - 1; i++) {
        int u = edges[i].u;
        int v = edges[i].v;
        int w = edges[i].weight;
        
        if (find(dsu, u) != find(dsu, v)) {
            printf("Edge (%d, %d) weight: %d\\n", u, v, w);
            unionSets(dsu, u, v);
            mst_weight += w;
            mst_edges++;
        }
    }
    
    printf("Total MST Weight: %d\\n", mst_weight);
}

int main() {
    Edge edges[] = {
        {0, 1, 10}, {0, 2, 6}, {0, 3, 5},
        {1, 3, 15}, {2, 3, 4}
    };
    
    kruskal(edges, 4, 5);
    return 0;
}`,

  cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class DSU {
public:
    vector<int> parent, rank;
    
    DSU(int n) {
        parent.resize(n);
        rank.resize(n, 0);
        for (int i = 0; i < n; i++) {
            parent[i] = i;
        }
    }
    
    int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]);
        }
        return parent[x];
    }
    
    bool unionSets(int x, int y) {
        int px = find(x);
        int py = find(y);
        
        if (px == py) return false;
        
        if (rank[px] < rank[py]) {
            parent[px] = py;
        } else if (rank[px] > rank[py]) {
            parent[py] = px;
        } else {
            parent[py] = px;
            rank[px]++;
        }
        return true;
    }
};

struct Edge {
    int u, v, weight;
    bool operator<(const Edge& other) const {
        return weight < other.weight;
    }
};

void kruskal(vector<Edge>& edges, int n_vertices) {
    sort(edges.begin(), edges.end());
    DSU dsu(n_vertices);
    
    int mst_weight = 0;
    cout << "Kruskal's Algorithm MST:\\n";
    
    for (const auto& edge : edges) {
        if (dsu.unionSets(edge.u, edge.v)) {
            cout << "Edge (" << edge.u << ", " << edge.v 
                 << ") weight: " << edge.weight << "\\n";
            mst_weight += edge.weight;
        }
    }
    
    cout << "Total MST Weight: " << mst_weight << "\\n";
}

int main() {
    vector<Edge> edges = {
        {0, 1, 10}, {0, 2, 6}, {0, 3, 5},
        {1, 3, 15}, {2, 3, 4}
    };
    
    kruskal(edges, 4);
    return 0;
}`,

  python: `from typing import List, Tuple

class DSU:
    def __init__(self, n: int):
        self.parent = list(range(n))
        self.rank = [0] * n
    
    def find(self, x: int) -> int:
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
    
    def union(self, x: int, y: int) -> bool:
        px, py = self.find(x), self.find(y)
        if px == py:
            return False
        
        if self.rank[px] < self.rank[py]:
            self.parent[px] = py
        elif self.rank[px] > self.rank[py]:
            self.parent[py] = px
        else:
            self.parent[py] = px
            self.rank[px] += 1
        return True

def kruskal(edges: List[Tuple[int, int, int]], n_vertices: int):
    """
    Kruskal's Algorithm for Minimum Spanning Tree
    edges: List of (u, v, weight) tuples
    n_vertices: Number of vertices in the graph
    """
    edges.sort(key=lambda x: x[2])
    dsu = DSU(n_vertices)
    
    mst_weight = 0
    mst_edges = []
    
    print("Kruskal's Algorithm MST:")
    for u, v, w in edges:
        if dsu.union(u, v):
            print(f"Edge ({u}, {v}) weight: {w}")
            mst_edges.append((u, v, w))
            mst_weight += w
    
    print(f"Total MST Weight: {mst_weight}")
    return mst_edges, mst_weight

# Example usage
edges = [(0, 1, 10), (0, 2, 6), (0, 3, 5), (1, 3, 15), (2, 3, 4)]
mst, total_weight = kruskal(edges, 4)`,

  java: `import java.util.*;

class DSU {
    int[] parent, rank;
    
    DSU(int n) {
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) {
            parent[i] = i;
        }
    }
    
    int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]);
        }
        return parent[x];
    }
    
    boolean union(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return false;
        
        if (rank[px] < rank[py]) {
            parent[px] = py;
        } else if (rank[px] > rank[py]) {
            parent[py] = px;
        } else {
            parent[py] = px;
            rank[px]++;
        }
        return true;
    }
}

class Edge implements Comparable<Edge> {
    int u, v, weight;
    
    Edge(int u, int v, int weight) {
        this.u = u;
        this.v = v;
        this.weight = weight;
    }
    
    public int compareTo(Edge other) {
        return this.weight - other.weight;
    }
}

public class Kruskal {
    static void kruskal(List<Edge> edges, int n_vertices) {
        Collections.sort(edges);
        DSU dsu = new DSU(n_vertices);
        
        int mst_weight = 0;
        System.out.println("Kruskal's Algorithm MST:");
        
        for (Edge edge : edges) {
            if (dsu.union(edge.u, edge.v)) {
                System.out.println("Edge (" + edge.u + ", " + edge.v + 
                                 ") weight: " + edge.weight);
                mst_weight += edge.weight;
            }
        }
        
        System.out.println("Total MST Weight: " + mst_weight);
    }
    
    public static void main(String[] args) {
        List<Edge> edges = new ArrayList<>();
        edges.add(new Edge(0, 1, 10));
        edges.add(new Edge(0, 2, 6));
        edges.add(new Edge(0, 3, 5));
        edges.add(new Edge(1, 3, 15));
        edges.add(new Edge(2, 3, 4));
        
        kruskal(edges, 4);
    }
}
`
};

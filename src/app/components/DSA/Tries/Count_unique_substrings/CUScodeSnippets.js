export const CUScodeSnippets = {
  c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define ALPHABET_SIZE 26

typedef struct TrieNode {
    struct TrieNode *children[ALPHABET_SIZE];
} TrieNode;

TrieNode* createNode() {
    TrieNode *node = (TrieNode *)calloc(1, sizeof(TrieNode));
    return node;
}

/*
 * Insert a string into the Trie.
 * Returns the number of NEW nodes created during insertion.
 */
int insert(TrieNode *root, const char *word) {
    TrieNode *curr = root;
    int newNodes = 0;
    for (int i = 0; word[i] != '\\0'; i++) {
        int idx = word[i] - 'a';
        if (!curr->children[idx]) {
            curr->children[idx] = createNode();
            newNodes++;
        }
        curr = curr->children[idx];
    }
    return newNodes;
}

/*
 * Count unique substrings of a string using a Trie.
 *
 * Approach:
 *   1. For each index i (0 to n-1), insert the suffix s[i..n-1] into the Trie.
 *   2. Every NEW node created during any insertion represents a unique substring.
 *   3. The total number of nodes = number of unique non-empty substrings.
 *   4. Add 1 for the empty substring if required by the problem.
 *
 * Time:  O(n^2) — we insert n suffixes of average length n/2.
 * Space: O(n^2) — at most O(n^2) Trie nodes.
 */
int countUniqueSubstrings(const char *s) {
    int n = strlen(s);
    TrieNode *root = createNode();
    int count = 0;      // total unique non-empty substrings

    for (int i = 0; i < n; i++) {
        count += insert(root, s + i);   // insert suffix s[i..n-1]
    }
    return count + 1;   // +1 for the empty substring
}

int main() {
    const char *s1 = "abc";
    printf("String: \\"%s\\"\\n", s1);
    printf("Unique substrings (including empty): %d\\n\\n", countUniqueSubstrings(s1));

    const char *s2 = "abab";
    printf("String: \\"%s\\"\\n", s2);
    printf("Unique substrings (including empty): %d\\n\\n", countUniqueSubstrings(s2));

    const char *s3 = "aaa";
    printf("String: \\"%s\\"\\n", s3);
    printf("Unique substrings (including empty): %d\\n", countUniqueSubstrings(s3));

    return 0;
}
`,

  cpp: `#include <iostream>
#include <string>
using namespace std;

const int ALPHABET_SIZE = 26;

struct TrieNode {
    TrieNode *children[ALPHABET_SIZE];

    TrieNode() {
        fill(begin(children), end(children), nullptr);
    }
};

class SubstringTrie {
    TrieNode *root;
    int nodeCount;   // total Trie nodes (excluding root)

public:
    SubstringTrie() : root(new TrieNode()), nodeCount(0) {}

    /*
     * Insert a suffix into the Trie.
     * Each new node represents a brand-new unique substring.
     */
    void insertSuffix(const string &s, int start) {
        TrieNode *curr = root;
        for (int i = start; i < (int)s.size(); i++) {
            int idx = s[i] - 'a';
            if (!curr->children[idx]) {
                curr->children[idx] = new TrieNode();
                nodeCount++;
            }
            curr = curr->children[idx];
        }
    }

    /*
     * Count unique substrings:
     *   Insert every suffix s[0..], s[1..], ..., s[n-1..] into the Trie.
     *   The total node count = number of unique non-empty substrings.
     *   Add 1 for the empty substring.
     */
    int countUniqueSubstrings(const string &s) {
        for (int i = 0; i < (int)s.size(); i++)
            insertSuffix(s, i);
        return nodeCount + 1;  // +1 for empty substring
    }
};

int main() {
    string tests[] = { "abc", "abab", "aaa" };

    for (const auto &s : tests) {
        SubstringTrie trie;
        int count = trie.countUniqueSubstrings(s);
        cout << "String: \\"" << s << "\\"\\n";
        cout << "Unique substrings (including empty): " << count << "\\n\\n";
    }
    return 0;
}
`,

  python: `class TrieNode:
    def __init__(self):
        self.children = {}


class SubstringTrie:
    def __init__(self):
        self.root = TrieNode()
        self.node_count = 0   # total nodes (excluding root)

    def insert_suffix(self, s: str, start: int) -> None:
        """
        Insert the suffix s[start:] into the Trie.
        Every new node created represents a unique substring.
        """
        curr = self.root
        for ch in s[start:]:
            if ch not in curr.children:
                curr.children[ch] = TrieNode()
                self.node_count += 1
            curr = curr.children[ch]

    def count_unique_substrings(self, s: str) -> int:
        """
        Insert all suffixes of s into the Trie.
        The number of Trie nodes = unique non-empty substrings.
        Add 1 for the empty substring.
        """
        for i in range(len(s)):
            self.insert_suffix(s, i)
        return self.node_count + 1   # +1 for empty substring


# Test cases
test_cases = ["abc", "abab", "aaa"]

for s in test_cases:
    trie = SubstringTrie()
    count = trie.count_unique_substrings(s)
    print(f"String  : \\"{s}\\"")
    print(f"Unique substrings (including empty): {count}")
    print()
`,

  java: `import java.util.*;

class TrieNode {
    Map<Character, TrieNode> children = new HashMap<>();
}

public class CountUniqueSubstrings {
    private TrieNode root = new TrieNode();
    private int nodeCount = 0;

    /**
     * Insert suffix s[start..] into the Trie.
     * Each new node = a unique substring discovered.
     */
    public void insertSuffix(String s, int start) {
        TrieNode curr = root;
        for (int i = start; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (!curr.children.containsKey(ch)) {
                curr.children.put(ch, new TrieNode());
                nodeCount++;
            }
            curr = curr.children.get(ch);
        }
    }

    /**
     * Count unique substrings:
     *   Insert every suffix into the Trie.
     *   Total nodes = unique non-empty substrings.
     *   +1 for the empty substring.
     */
    public int countUniqueSubstrings(String s) {
        for (int i = 0; i < s.length(); i++)
            insertSuffix(s, i);
        return nodeCount + 1; // +1 for empty substring
    }

    public static void main(String[] args) {
        String[] tests = { "abc", "abab", "aaa" };

        for (String s : tests) {
            CountUniqueSubstrings trie = new CountUniqueSubstrings();
            int count = trie.countUniqueSubstrings(s);
            System.out.println("String: \\"" + s + "\\"");
            System.out.println("Unique substrings (including empty): " + count);
            System.out.println();
        }
    }
}
`
};

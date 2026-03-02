export const LCPcodeSnippets = {
  c: `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

#define ALPHABET_SIZE 26
#define MAX_LEN 200

typedef struct TrieNode {
    struct TrieNode *children[ALPHABET_SIZE];
    bool isEndOfWord;
    int wordCount; // number of words passing through this node
} TrieNode;

TrieNode* createNode() {
    TrieNode *node = (TrieNode *)calloc(1, sizeof(TrieNode));
    return node;
}

void insert(TrieNode *root, const char *word) {
    TrieNode *curr = root;
    for (int i = 0; word[i] != '\\0'; i++) {
        int idx = word[i] - 'a';
        if (!curr->children[idx])
            curr->children[idx] = createNode();
        curr = curr->children[idx];
        curr->wordCount++;
    }
    curr->isEndOfWord = true;
}

// Count non-null children of a node
int childCount(TrieNode *node) {
    int count = 0;
    for (int i = 0; i < ALPHABET_SIZE; i++)
        if (node->children[i]) count++;
    return count;
}

/*
 * LCP via Trie traversal:
 * Walk down from root as long as:
 *   1. Current node has exactly ONE child (no branching)
 *   2. Current node is NOT end-of-word (no shorter word ends here)
 * Every character on this single-child path is part of the LCP.
 */
void longestCommonPrefix(TrieNode *root, int totalWords, char *result) {
    int len = 0;
    TrieNode *curr = root;

    while (curr) {
        // Stop if current node marks end of a word
        if (curr->isEndOfWord) break;

        // Stop if there's branching (more than one child)
        int cc = childCount(curr);
        if (cc != 1) break;

        // Find the single child
        for (int i = 0; i < ALPHABET_SIZE; i++) {
            if (curr->children[i]) {
                result[len++] = 'a' + i;
                curr = curr->children[i];
                break;
            }
        }
    }
    result[len] = '\\0';
}

int main() {
    const char *words[] = { "flower", "flow", "flight" };
    int n = 3;

    TrieNode *root = createNode();
    for (int i = 0; i < n; i++) insert(root, words[i]);

    char lcp[MAX_LEN];
    longestCommonPrefix(root, n, lcp);

    printf("Words: ");
    for (int i = 0; i < n; i++) printf("%s%s", words[i], i < n-1 ? ", " : "\\n");
    printf("Longest Common Prefix: \\"%s\\"\\n", strlen(lcp) ? lcp : "(empty)");

    // Second example
    const char *words2[] = { "dog", "racecar", "car" };
    int n2 = 3;
    TrieNode *root2 = createNode();
    for (int i = 0; i < n2; i++) insert(root2, words2[i]);

    char lcp2[MAX_LEN];
    longestCommonPrefix(root2, n2, lcp2);
    printf("\\nWords: ");
    for (int i = 0; i < n2; i++) printf("%s%s", words2[i], i < n2-1 ? ", " : "\\n");
    printf("Longest Common Prefix: \\"%s\\"\\n", strlen(lcp2) ? lcp2 : "(empty)");

    return 0;
}
`,

  cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

const int ALPHABET_SIZE = 26;

struct TrieNode {
    TrieNode *children[ALPHABET_SIZE];
    bool isEndOfWord;

    TrieNode() {
        fill(begin(children), end(children), nullptr);
        isEndOfWord = false;
    }
};

class LCPTrie {
    TrieNode *root;

    int childCount(TrieNode *node) {
        int cnt = 0;
        for (int i = 0; i < ALPHABET_SIZE; i++)
            if (node->children[i]) cnt++;
        return cnt;
    }

public:
    LCPTrie() { root = new TrieNode(); }

    void insert(const string &word) {
        TrieNode *curr = root;
        for (char c : word) {
            int idx = c - 'a';
            if (!curr->children[idx])
                curr->children[idx] = new TrieNode();
            curr = curr->children[idx];
        }
        curr->isEndOfWord = true;
    }

    /*
     * Walk from root while:
     *   - Exactly one child (no branching)
     *   - Not an end-of-word node (no prefix is a complete word)
     * Each character visited on this chain belongs to the LCP.
     */
    string longestCommonPrefix() {
        string lcp;
        TrieNode *curr = root;

        while (curr) {
            if (curr->isEndOfWord) break;
            int cc = childCount(curr);
            if (cc != 1) break;

            for (int i = 0; i < ALPHABET_SIZE; i++) {
                if (curr->children[i]) {
                    lcp += (char)('a' + i);
                    curr = curr->children[i];
                    break;
                }
            }
        }
        return lcp;
    }
};

void solve(const vector<string> &words) {
    LCPTrie trie;
    cout << "Words: ";
    for (int i = 0; i < (int)words.size(); i++)
        cout << words[i] << (i + 1 < (int)words.size() ? ", " : "\\n");

    for (const auto &w : words) trie.insert(w);
    string lcp = trie.longestCommonPrefix();
    cout << "Longest Common Prefix: \\"" << (lcp.empty() ? "(empty)" : lcp) << "\\"\\n\\n";
}

int main() {
    solve({ "flower", "flow", "flight" });
    solve({ "dog", "racecar", "car" });
    solve({ "interview", "interact", "interface" });
    return 0;
}
`,

  python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False


class LCPTrie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        curr = self.root
        for char in word:
            if char not in curr.children:
                curr.children[char] = TrieNode()
            curr = curr.children[char]
        curr.is_end = True

    def longest_common_prefix(self) -> str:
        """
        Walk from root while:
          - Current node has exactly 1 child (no branching)
          - Current node is NOT an end-of-word (no word ends here)
        Each character on this single-child chain is part of the LCP.
        """
        lcp = []
        curr = self.root

        while curr:
            # Stop if this node marks the end of a word
            if curr.is_end:
                break
            # Stop if there are 0 or 2+ children (branching or empty)
            if len(curr.children) != 1:
                break
            # Follow the single child
            char, next_node = next(iter(curr.children.items()))
            lcp.append(char)
            curr = next_node

        return "".join(lcp)


def find_lcp(words: list) -> str:
    if not words:
        return ""
    trie = LCPTrie()
    for word in words:
        trie.insert(word)
    return trie.longest_common_prefix()


# Test cases
test_cases = [
    ["flower", "flow", "flight"],
    ["dog", "racecar", "car"],
    ["interview", "interact", "interface"],
    ["apple"],
    ["prefix", "prefix"],
]

for words in test_cases:
    result = find_lcp(words)
    print(f"Words   : {words}")
    print(f"LCP     : '{result}' {'(empty)' if not result else ''}")
    print()
`,

  java: `import java.util.*;

class TrieNode {
    Map<Character, TrieNode> children = new HashMap<>();
    boolean isEndOfWord = false;
}

public class LCPTrie {
    private TrieNode root = new TrieNode();

    public void insert(String word) {
        TrieNode curr = root;
        for (char c : word.toCharArray()) {
            curr.children.putIfAbsent(c, new TrieNode());
            curr = curr.children.get(c);
        }
        curr.isEndOfWord = true;
    }

    /**
     * Walk from root while:
     *   1. Exactly ONE child exists (no prefix branching)
     *   2. Current node is NOT end-of-word (no word terminates here)
     * Every character along this single-child chain is part of the LCP.
     */
    public String longestCommonPrefix() {
        StringBuilder lcp = new StringBuilder();
        TrieNode curr = root;

        while (curr != null) {
            if (curr.isEndOfWord) break;
            if (curr.children.size() != 1) break;

            Map.Entry<Character, TrieNode> entry =
                curr.children.entrySet().iterator().next();
            lcp.append(entry.getKey());
            curr = entry.getValue();
        }
        return lcp.toString();
    }

    static void solve(String[] words) {
        LCPTrie trie = new LCPTrie();
        System.out.println("Words: " + Arrays.toString(words));
        for (String w : words) trie.insert(w);
        String lcp = trie.longestCommonPrefix();
        System.out.println("Longest Common Prefix: \\"" +
            (lcp.isEmpty() ? "(empty)" : lcp) + "\\"\\n");
    }

    public static void main(String[] args) {
        solve(new String[]{"flower", "flow", "flight"});
        solve(new String[]{"dog", "racecar", "car"});
        solve(new String[]{"interview", "interact", "interface"});
    }
}
`
};

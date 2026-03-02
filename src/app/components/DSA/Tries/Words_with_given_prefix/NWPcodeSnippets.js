export const NWPcodeSnippets = {
  c: `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

#define ALPHABET_SIZE 26

typedef struct TrieNode {
    struct TrieNode *children[ALPHABET_SIZE];
    bool isEndOfWord;
    int wordCount; /* words passing through this node */
} TrieNode;

TrieNode* createNode() {
    TrieNode *node = (TrieNode *)calloc(1, sizeof(TrieNode));
    return node;
}

/* Insert a word and increment wordCount along every node on the path */
void insert(TrieNode *root, const char *word) {
    TrieNode *curr = root;
    for (int i = 0; word[i] != '\\0'; i++) {
        int idx = word[i] - 'a';
        if (!curr->children[idx])
            curr->children[idx] = createNode();
        curr = curr->children[idx];
        curr->wordCount++;   /* every node on path gets +1 */
    }
    curr->isEndOfWord = true;
}

/*
 * countWordsWithPrefix:
 * Traverse the trie following the prefix characters.
 * If the prefix path exists, return wordCount of the last node
 * (which equals the number of words that passed through it).
 */
int countWordsWithPrefix(TrieNode *root, const char *prefix) {
    TrieNode *curr = root;
    for (int i = 0; prefix[i] != '\\0'; i++) {
        int idx = prefix[i] - 'a';
        if (!curr->children[idx])
            return 0; /* prefix not found */
        curr = curr->children[idx];
    }
    return curr->wordCount;
}

int main() {
    TrieNode *root = createNode();

    const char *words[] = { "apple", "app", "application", "apply", "apt", "bat", "ball" };
    int n = 7;

    for (int i = 0; i < n; i++) insert(root, words[i]);

    printf("Dictionary: apple, app, application, apply, apt, bat, ball\\n\\n");

    const char *prefixes[] = { "app", "ap", "ba", "z" };
    int m = 4;
    for (int i = 0; i < m; i++) {
        printf("Words with prefix \\"%s\\": %d\\n",
               prefixes[i],
               countWordsWithPrefix(root, prefixes[i]));
    }

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
    int wordCount; // words passing through this node

    TrieNode() {
        fill(begin(children), end(children), nullptr);
        isEndOfWord = false;
        wordCount   = 0;
    }
};

class PrefixCountTrie {
    TrieNode *root;
public:
    PrefixCountTrie() { root = new TrieNode(); }

    // Insert word — increment wordCount at every node along the path
    void insert(const string &word) {
        TrieNode *curr = root;
        for (char c : word) {
            int idx = c - 'a';
            if (!curr->children[idx])
                curr->children[idx] = new TrieNode();
            curr = curr->children[idx];
            curr->wordCount++;   // track how many words pass here
        }
        curr->isEndOfWord = true;
    }

    /*
     * countWordsWithPrefix:
     * Walk the prefix path. Return wordCount of the terminal prefix node,
     * which equals the number of inserted words that start with this prefix.
     * Returns 0 if the prefix is not present at all.
     */
    int countWordsWithPrefix(const string &prefix) {
        TrieNode *curr = root;
        for (char c : prefix) {
            int idx = c - 'a';
            if (!curr->children[idx]) return 0;
            curr = curr->children[idx];
        }
        return curr->wordCount;
    }
};

int main() {
    PrefixCountTrie trie;
    vector<string> words = { "apple", "app", "application", "apply", "apt", "bat", "ball" };

    cout << "Dictionary: ";
    for (int i = 0; i < (int)words.size(); i++)
        cout << words[i] << (i + 1 < (int)words.size() ? ", " : "\\n\\n");

    for (const auto &w : words) trie.insert(w);

    vector<string> prefixes = { "app", "ap", "ba", "z" };
    for (const auto &p : prefixes)
        cout << "Words with prefix \\"" << p << "\\": "
             << trie.countWordsWithPrefix(p) << "\\n";

    return 0;
}
`,

  python: `class TrieNode:
    def __init__(self):
        self.children  = {}
        self.is_end    = False
        self.word_count = 0  # words passing through this node


class PrefixCountTrie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        """Insert word and increment word_count at every node on the path."""
        curr = self.root
        for char in word:
            if char not in curr.children:
                curr.children[char] = TrieNode()
            curr = curr.children[char]
            curr.word_count += 1   # every node on path gets +1
        curr.is_end = True

    def count_words_with_prefix(self, prefix: str) -> int:
        """
        Walk the prefix path in the trie.
        Return word_count of the terminal node, which equals the number
        of inserted words that share this prefix.
        Returns 0 if the prefix path does not exist.
        """
        curr = self.root
        for char in prefix:
            if char not in curr.children:
                return 0
            curr = curr.children[char]
        return curr.word_count


# ── Demo ────────────────────────────────────────────────────────────────────────
words = ["apple", "app", "application", "apply", "apt", "bat", "ball"]
trie  = PrefixCountTrie()

print(f"Dictionary: {', '.join(words)}\\n")
for word in words:
    trie.insert(word)

test_prefixes = ["app", "ap", "ba", "z", "apple"]
for prefix in test_prefixes:
    count = trie.count_words_with_prefix(prefix)
    print(f'Words with prefix "{prefix}": {count}')
`,

  java: `import java.util.*;

class TrieNode {
    Map<Character, TrieNode> children = new HashMap<>();
    boolean isEndOfWord = false;
    int wordCount = 0; // words passing through this node
}

public class PrefixCountTrie {
    private final TrieNode root = new TrieNode();

    /** Insert word and increment wordCount at every node along the path. */
    public void insert(String word) {
        TrieNode curr = root;
        for (char c : word.toCharArray()) {
            curr.children.putIfAbsent(c, new TrieNode());
            curr = curr.children.get(c);
            curr.wordCount++;   // track words passing through
        }
        curr.isEndOfWord = true;
    }

    /**
     * countWordsWithPrefix:
     * Follow the prefix path. Return wordCount of the last prefix node,
     * which equals the number of words sharing this prefix.
     * Returns 0 if prefix is absent.
     */
    public int countWordsWithPrefix(String prefix) {
        TrieNode curr = root;
        for (char c : prefix.toCharArray()) {
            if (!curr.children.containsKey(c)) return 0;
            curr = curr.children.get(c);
        }
        return curr.wordCount;
    }

    public static void main(String[] args) {
        PrefixCountTrie trie = new PrefixCountTrie();
        String[] words = { "apple", "app", "application", "apply", "apt", "bat", "ball" };

        System.out.println("Dictionary: " + Arrays.toString(words) + "\\n");
        for (String w : words) trie.insert(w);

        String[] prefixes = { "app", "ap", "ba", "z", "apple" };
        for (String p : prefixes)
            System.out.printf("Words with prefix \\"%s\\": %d%n",
                              p, trie.countWordsWithPrefix(p));
    }
}
`
};

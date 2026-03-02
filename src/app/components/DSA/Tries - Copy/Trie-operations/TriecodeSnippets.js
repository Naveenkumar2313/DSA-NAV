export const TriecodeSnippets = {
  c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#define ALPHABET_SIZE 26

typedef struct TrieNode {
    struct TrieNode *children[ALPHABET_SIZE];
    bool isEndOfWord;
} TrieNode;

TrieNode* createNode() {
    TrieNode *node = (TrieNode*)malloc(sizeof(TrieNode));
    node->isEndOfWord = false;
    for (int i = 0; i < ALPHABET_SIZE; i++)
        node->children[i] = NULL;
    return node;
}

void insert(TrieNode *root, const char *word) {
    TrieNode *curr = root;
    while (*word) {
        int idx = *word - 'a';
        if (!curr->children[idx])
            curr->children[idx] = createNode();
        curr = curr->children[idx];
        word++;
    }
    curr->isEndOfWord = true;
}

bool search(TrieNode *root, const char *word) {
    TrieNode *curr = root;
    while (*word) {
        int idx = *word - 'a';
        if (!curr->children[idx]) return false;
        curr = curr->children[idx];
        word++;
    }
    return curr->isEndOfWord;
}

bool hasChildren(TrieNode *node) {
    for (int i = 0; i < ALPHABET_SIZE; i++)
        if (node->children[i]) return true;
    return false;
}

TrieNode* deleteWord(TrieNode *root, const char *word, int depth) {
    if (!root) return NULL;
    if (depth == (int)strlen(word)) {
        root->isEndOfWord = false;
        if (!hasChildren(root)) { free(root); return NULL; }
        return root;
    }
    int idx = word[depth] - 'a';
    root->children[idx] = deleteWord(root->children[idx], word, depth + 1);
    if (!hasChildren(root) && !root->isEndOfWord) { free(root); return NULL; }
    return root;
}

int main() {
    TrieNode *root = createNode();
    insert(root, "apple");
    insert(root, "app");
    insert(root, "apply");

    printf("Search 'apple': %s\\n", search(root, "apple") ? "Found" : "Not Found");
    printf("Search 'app'  : %s\\n", search(root, "app")   ? "Found" : "Not Found");
    printf("Search 'apt'  : %s\\n", search(root, "apt")   ? "Found" : "Not Found");

    deleteWord(root, "apple", 0);
    printf("After deleting 'apple':\\n");
    printf("Search 'apple': %s\\n", search(root, "apple") ? "Found" : "Not Found");
    printf("Search 'app'  : %s\\n", search(root, "app")   ? "Found" : "Not Found");

    return 0;
}
`,

  cpp: `#include <iostream>
#include <unordered_map>
#include <string>
using namespace std;

struct TrieNode {
    unordered_map<char, TrieNode*> children;
    bool isEndOfWord = false;
};

class Trie {
    TrieNode *root;
public:
    Trie() { root = new TrieNode(); }

    void insert(const string &word) {
        TrieNode *curr = root;
        for (char c : word) {
            if (!curr->children.count(c))
                curr->children[c] = new TrieNode();
            curr = curr->children[c];
        }
        curr->isEndOfWord = true;
    }

    bool search(const string &word) {
        TrieNode *curr = root;
        for (char c : word) {
            if (!curr->children.count(c)) return false;
            curr = curr->children[c];
        }
        return curr->isEndOfWord;
    }

    bool deleteHelper(TrieNode *node, const string &word, int depth) {
        if (!node) return false;
        if (depth == (int)word.size()) {
            if (!node->isEndOfWord) return false;
            node->isEndOfWord = false;
            return node->children.empty();
        }
        char c = word[depth];
        if (!node->children.count(c)) return false;
        bool shouldDelete = deleteHelper(node->children[c], word, depth + 1);
        if (shouldDelete) {
            delete node->children[c];
            node->children.erase(c);
            return node->children.empty() && !node->isEndOfWord;
        }
        return false;
    }

    void deleteWord(const string &word) {
        deleteHelper(root, word, 0);
    }
};

int main() {
    Trie trie;
    trie.insert("apple");
    trie.insert("app");
    trie.insert("apply");

    cout << "Search 'apple': " << (trie.search("apple") ? "Found" : "Not Found") << endl;
    cout << "Search 'app'  : " << (trie.search("app")   ? "Found" : "Not Found") << endl;
    cout << "Search 'apt'  : " << (trie.search("apt")   ? "Found" : "Not Found") << endl;

    trie.deleteWord("apple");
    cout << "After deleting 'apple':" << endl;
    cout << "Search 'apple': " << (trie.search("apple") ? "Found" : "Not Found") << endl;
    cout << "Search 'app'  : " << (trie.search("app")   ? "Found" : "Not Found") << endl;

    return 0;
}
`,

  python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def search(self, word: str) -> bool:
        node = self.root
        for ch in word:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return node.is_end

    def starts_with(self, prefix: str) -> bool:
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return True

    def delete(self, word: str) -> bool:
        def _delete(node, word, depth):
            if depth == len(word):
                if not node.is_end:
                    return False
                node.is_end = False
                return len(node.children) == 0
            ch = word[depth]
            if ch not in node.children:
                return False
            should_delete = _delete(node.children[ch], word, depth + 1)
            if should_delete:
                del node.children[ch]
                return len(node.children) == 0 and not node.is_end
            return False

        return _delete(self.root, word, 0)


# Example usage
trie = Trie()
trie.insert("apple")
trie.insert("app")
trie.insert("apply")

print("Search 'apple':", trie.search("apple"))   # True
print("Search 'app'  :", trie.search("app"))     # True
print("Search 'apt'  :", trie.search("apt"))     # False
print("Prefix 'app'  :", trie.starts_with("app"))# True

trie.delete("apple")
print("After deleting 'apple':")
print("Search 'apple':", trie.search("apple"))   # False
print("Search 'app'  :", trie.search("app"))     # True
`,

  java: `import java.util.HashMap;
import java.util.Map;

class TrieNode {
    Map<Character, TrieNode> children = new HashMap<>();
    boolean isEndOfWord = false;
}

public class Trie {
    private TrieNode root = new TrieNode();

    public void insert(String word) {
        TrieNode curr = root;
        for (char c : word.toCharArray()) {
            curr.children.putIfAbsent(c, new TrieNode());
            curr = curr.children.get(c);
        }
        curr.isEndOfWord = true;
    }

    public boolean search(String word) {
        TrieNode curr = root;
        for (char c : word.toCharArray()) {
            if (!curr.children.containsKey(c)) return false;
            curr = curr.children.get(c);
        }
        return curr.isEndOfWord;
    }

    public boolean startsWith(String prefix) {
        TrieNode curr = root;
        for (char c : prefix.toCharArray()) {
            if (!curr.children.containsKey(c)) return false;
            curr = curr.children.get(c);
        }
        return true;
    }

    private boolean deleteHelper(TrieNode node, String word, int depth) {
        if (node == null) return false;
        if (depth == word.length()) {
            if (!node.isEndOfWord) return false;
            node.isEndOfWord = false;
            return node.children.isEmpty();
        }
        char c = word.charAt(depth);
        if (!node.children.containsKey(c)) return false;
        boolean shouldDelete = deleteHelper(node.children.get(c), word, depth + 1);
        if (shouldDelete) {
            node.children.remove(c);
            return node.children.isEmpty() && !node.isEndOfWord;
        }
        return false;
    }

    public void delete(String word) {
        deleteHelper(root, word, 0);
    }

    public static void main(String[] args) {
        Trie trie = new Trie();
        trie.insert("apple");
        trie.insert("app");
        trie.insert("apply");

        System.out.println("Search 'apple': " + trie.search("apple"));
        System.out.println("Search 'app'  : " + trie.search("app"));
        System.out.println("Search 'apt'  : " + trie.search("apt"));

        trie.delete("apple");
        System.out.println("After deleting 'apple':");
        System.out.println("Search 'apple': " + trie.search("apple"));
        System.out.println("Search 'app'  : " + trie.search("app"));
    }
}
`
};

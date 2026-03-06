// src/data/codeSnippets.js
export const PScodeSnippets = {
    c: `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

struct Node {
    int data;
    struct Node* left;
    struct Node* right;
};

struct Node* newNode(int data) {
    struct Node* node = (struct Node*)malloc(sizeof(struct Node));
    node->data = data;
    node->left = node->right = NULL;
    return node;
}

bool hasPathSum(struct Node* root, int targetSum) {
    if (root == NULL) return false;

    // If it's a leaf node, check if remaining sum equals node value
    if (root->left == NULL && root->right == NULL) {
        return targetSum == root->data;
    }

    // Recurse on left and right subtrees with reduced sum
    return hasPathSum(root->left, targetSum - root->data) ||
           hasPathSum(root->right, targetSum - root->data);
}
`,
    cpp: `#include <iostream>
using namespace std;

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

class Solution {
public:
    bool hasPathSum(TreeNode* root, int targetSum) {
        if (!root) return false;

        // If it's a leaf node, check if remaining sum equals node value
        if (!root->left && !root->right) {
            return targetSum == root->val;
        }

        // Recurse on left and right subtrees with reduced sum
        return hasPathSum(root->left, targetSum - root->val) ||
               hasPathSum(root->right, targetSum - root->val);
    }
};
`,
    python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def hasPathSum(self, root: TreeNode, targetSum: int) -> bool:
        if not root:
            return False

        # If it's a leaf node, check if remaining sum equals node value
        if not root.left and not root.right:
            return targetSum == root.val

        # Recurse on left and right subtrees with reduced sum
        return (self.hasPathSum(root.left, targetSum - root.val) or
                self.hasPathSum(root.right, targetSum - root.val))
`,
    java: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}

class Solution {
    public boolean hasPathSum(TreeNode root, int targetSum) {
        if (root == null) return false;

        // If it's a leaf node, check if remaining sum equals node value
        if (root.left == null && root.right == null) {
            return targetSum == root.val;
        }

        // Recurse on left and right subtrees with reduced sum
        return hasPathSum(root.left, targetSum - root.val) ||
               hasPathSum(root.right, targetSum - root.val);
    }
}
`
};

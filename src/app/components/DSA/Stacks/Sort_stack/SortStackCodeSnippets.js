export const SortStackCodeSnippets = {
  c: `#include <stdio.h>
#include <stdlib.h>

#define MAX 100

int stack[MAX];
int top = -1;

void push(int val) { stack[++top] = val; }
int pop() { return stack[top--]; }
int peek() { return stack[top]; }
int isEmpty() { return top == -1; }

int tmpStack[MAX];
int tmpTop = -1;

void tmpPush(int val) { tmpStack[++tmpTop] = val; }
int tmpPop() { return tmpStack[tmpTop--]; }
int tmpIsEmpty() { return tmpTop == -1; }

void sortStack() {
    while (!isEmpty()) {
        int tmp = pop();

        while (!tmpIsEmpty() && tmpStack[tmpTop] > tmp) {
            push(tmpPop());
        }
        tmpPush(tmp);
    }

    while (!tmpIsEmpty()) {
        push(tmpPop());
    }
}

int main() {
    push(34);
    push(3);
    push(31);
    push(98);
    push(92);
    push(23);

    sortStack();

    printf("Sorted stack (top to bottom): ");
    while (!isEmpty()) {
        printf("%d ", pop());
    }
    printf("\\n");
    return 0;
}
`,

  cpp: `#include <iostream>
#include <stack>
using namespace std;

void sortStack(stack<int>& s) {
    stack<int> tmp;

    while (!s.empty()) {
        int curr = s.top();
        s.pop();

        while (!tmp.empty() && tmp.top() > curr) {
            s.push(tmp.top());
            tmp.pop();
        }
        tmp.push(curr);
    }

    // Move sorted elements back to original stack
    while (!tmp.empty()) {
        s.push(tmp.top());
        tmp.pop();
    }
}

int main() {
    stack<int> s;
    s.push(34);
    s.push(3);
    s.push(31);
    s.push(98);
    s.push(92);
    s.push(23);

    sortStack(s);

    cout << "Sorted stack (top to bottom): ";
    while (!s.empty()) {
        cout << s.top() << " ";
        s.pop();
    }
    cout << endl;
    return 0;
}
`,

  python: `def sort_stack(stack):
    tmp = []

    while stack:
        curr = stack.pop()

        while tmp and tmp[-1] > curr:
            stack.append(tmp.pop())

        tmp.append(curr)

    # Move sorted elements back to original stack
    while tmp:
        stack.append(tmp.pop())

    return stack

# Example usage
stack = [34, 3, 31, 98, 92, 23]
print("Original stack (top to bottom):", stack[::-1])

sort_stack(stack)
print("Sorted stack (top to bottom):", stack[::-1])
`,

  java: `import java.util.Stack;

public class SortStack {
    public static void sortStack(Stack<Integer> stack) {
        Stack<Integer> tmp = new Stack<>();

        while (!stack.isEmpty()) {
            int curr = stack.pop();

            while (!tmp.isEmpty() && tmp.peek() > curr) {
                stack.push(tmp.pop());
            }
            tmp.push(curr);
        }

        // Move sorted elements back to original stack
        while (!tmp.isEmpty()) {
            stack.push(tmp.pop());
        }
    }

    public static void main(String[] args) {
        Stack<Integer> stack = new Stack<>();
        stack.push(34);
        stack.push(3);
        stack.push(31);
        stack.push(98);
        stack.push(92);
        stack.push(23);

        sortStack(stack);

        System.out.print("Sorted stack (top to bottom): ");
        while (!stack.isEmpty()) {
            System.out.print(stack.pop() + " ");
        }
        System.out.println();
    }
}
`
};

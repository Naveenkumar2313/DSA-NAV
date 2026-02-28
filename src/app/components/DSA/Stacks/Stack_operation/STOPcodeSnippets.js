export const STOPcodeSnippets = {
    c: `#include <stdio.h>
  #define MAX 100
  
  int stack[MAX];
  int top = -1;
  
  void push(int value) {
      if (top >= MAX - 1) {
          printf("Stack Overflow\\n");
          return;
      }
      stack[++top] = value;
  }
  
  void pop() {
      if (top == -1) {
          printf("Stack Underflow\\n");
          return;
      }
      printf("Popped: %d\\n", stack[top--]);
  }
  
  int isEmpty() {
      return top == -1;
  }
  
  int size() {
      return top + 1;
  }
  
  int main() {
      push(10);
      push(20);
      printf("Size: %d\\n", size());
      pop();
      printf("Is Empty: %d\\n", isEmpty());
      return 0;
  }
  `,
  
    cpp: `#include <iostream>
  #include <vector>
  using namespace std;
  
  class Stack {
      vector<int> stack;
  
  public:
      void push(int value) {
          stack.push_back(value);
      }
  
      void pop() {
          if (stack.empty()) {
              cout << "Stack Underflow\\n";
          } else {
              cout << "Popped: " << stack.back() << endl;
              stack.pop_back();
          }
      }
  
      bool isEmpty() {
          return stack.empty();
      }
  
      int size() {
          return stack.size();
      }
  };
  
  int main() {
      Stack s;
      s.push(10);
      s.push(20);
      cout << "Size: " << s.size() << endl;
      s.pop();
      cout << "Is Empty: " << s.isEmpty() << endl;
      return 0;
  }
  `,
  
    python: `class Stack:
      def __init__(self):
          self.stack = []
  
      def push(self, value):
          self.stack.append(value)
  
      def pop(self):
          if not self.stack:
              print("Stack Underflow")
          else:
              print("Popped:", self.stack.pop())
  
      def is_empty(self):
          return len(self.stack) == 0
  
      def size(self):
          return len(self.stack)
  
  # Example usage
  s = Stack()
  s.push(10)
  s.push(20)
  print("Size:", s.size())
  s.pop()
  print("Is Empty:", s.is_empty())
  `,
  
    java: `import java.util.*;
  
  public class StackExample {
      public static void main(String[] args) {
          Stack<Integer> stack = new Stack<>();
  
          stack.push(10);
          stack.push(20);
          System.out.println("Size: " + stack.size());
  
          if (!stack.isEmpty()) {
              System.out.println("Popped: " + stack.pop());
          }
  
          System.out.println("Is Empty: " + stack.isEmpty());
      }
  }
  `
  };
  
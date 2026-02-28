export const VPcodeSnippets = {
    c: `#include <stdio.h>
  #include <string.h>
  
  #define MAX 100
  
  char stack[MAX];
  int top = -1;
  
  void push(char c) {
      stack[++top] = c;
  }
  
  char pop() {
      if (top == -1) return -1;
      return stack[top--];
  }
  
  int isMatchingPair(char open, char close) {
      return (open == '(' && close == ')') ||
             (open == '{' && close == '}') ||
             (open == '[' && close == ']');
  }
  
  int isValidParenthesis(const char *expr) {
      for (int i = 0; i < strlen(expr); i++) {
          char c = expr[i];
          if (c == '(' || c == '{' || c == '[') {
              push(c);
          } else if (c == ')' || c == '}' || c == ']') {
              if (top == -1 || !isMatchingPair(pop(), c))
                  return 0;
          }
      }
      return top == -1;
  }
  
  int main() {
      char expr[MAX] = "{[()]}";
      if (isValidParenthesis(expr))
          printf("Valid\\n");
      else
          printf("Invalid\\n");
      return 0;
  }
  `,
  
    cpp: `#include <iostream>
  #include <stack>
  using namespace std;
  
  bool isMatchingPair(char open, char close) {
      return (open == '(' && close == ')') ||
             (open == '{' && close == '}') ||
             (open == '[' && close == ']');
  }
  
  bool isValidParenthesis(const string &expr) {
      stack<char> s;
      for (char c : expr) {
          if (c == '(' || c == '{' || c == '[') {
              s.push(c);
          } else if (c == ')' || c == '}' || c == ']') {
              if (s.empty() || !isMatchingPair(s.top(), c))
                  return false;
              s.pop();
          }
      }
      return s.empty();
  }
  
  int main() {
      string expr = "{[()]}";
      cout << (isValidParenthesis(expr) ? "Valid" : "Invalid") << endl;
      return 0;
  }
  `,
  
    python: `def is_matching_pair(opening, closing):
      return (opening == '(' and closing == ')') or \
             (opening == '{' and closing == '}') or \
             (opening == '[' and closing == ']')
  
  def is_valid_parenthesis(expr):
      stack = []
      for char in expr:
          if char in "({[":
              stack.append(char)
          elif char in ")}]":
              if not stack or not is_matching_pair(stack.pop(), char):
                  return False
      return not stack
  
  # Example usage
  expr = "{[()]}"
  print("Valid" if is_valid_parenthesis(expr) else "Invalid")
  `,
  
    java: `import java.util.*;
  
  public class ValidParenthesis {
      public static boolean isMatchingPair(char open, char close) {
          return (open == '(' && close == ')') ||
                 (open == '{' && close == '}') ||
                 (open == '[' && close == ']');
      }
  
      public static boolean isValidParenthesis(String expr) {
          Stack<Character> stack = new Stack<>();
          for (char c : expr.toCharArray()) {
              if (c == '(' || c == '{' || c == '[') {
                  stack.push(c);
              } else if (c == ')' || c == '}' || c == ']') {
                  if (stack.isEmpty() || !isMatchingPair(stack.pop(), c))
                      return false;
              }
          }
          return stack.isEmpty();
      }
  
      public static void main(String[] args) {
          String expr = "{[()]}";
          System.out.println(isValidParenthesis(expr) ? "Valid" : "Invalid");
      }
  }
  `
  };
  
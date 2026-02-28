export const INPOcodeSnippets = {
    c: `#include <stdio.h>
  #include <ctype.h>
  #include <string.h>
  
  #define MAX 100
  
  char stack[MAX];
  int top = -1;
  
  void push(char c) {
      stack[++top] = c;
  }
  
  char pop() {
      return stack[top--];
  }
  
  char peek() {
      return stack[top];
  }
  
  int precedence(char op) {
      if (op == '^') return 3;
      if (op == '*' || op == '/') return 2;
      if (op == '+' || op == '-') return 1;
      return 0;
  }
  
  int isOperator(char c) {
      return c == '+' || c == '-' || c == '*' || c == '/' || c == '^';
  }
  
  void infixToPostfix(char* exp) {
      char result[MAX];
      int k = 0;
  
      for (int i = 0; exp[i]; i++) {
          char c = exp[i];
  
          if (isalnum(c)) {
              result[k++] = c;
          } else if (c == '(') {
              push(c);
          } else if (c == ')') {
              while (top != -1 && peek() != '(')
                  result[k++] = pop();
              pop(); // remove '('
          } else if (isOperator(c)) {
              while (top != -1 && precedence(peek()) >= precedence(c))
                  result[k++] = pop();
              push(c);
          }
      }
  
      while (top != -1)
          result[k++] = pop();
  
      result[k] = '\\0';
      printf("Postfix: %s\\n", result);
  }
  
  int main() {
      char exp[] = "A+(B*C)-D";
      infixToPostfix(exp);
      return 0;
  }
  `,
  
    cpp: `#include <iostream>
  #include <stack>
  #include <string>
  using namespace std;
  
  int precedence(char op) {
      if (op == '^') return 3;
      if (op == '*' || op == '/') return 2;
      if (op == '+' || op == '-') return 1;
      return 0;
  }
  
  bool isOperator(char c) {
      return c == '+' || c == '-' || c == '*' || c == '/' || c == '^';
  }
  
  string infixToPostfix(const string& exp) {
      string result;
      stack<char> s;
  
      for (char c : exp) {
          if (isalnum(c)) {
              result += c;
          } else if (c == '(') {
              s.push(c);
          } else if (c == ')') {
              while (!s.empty() && s.top() != '(') {
                  result += s.top(); s.pop();
              }
              s.pop(); // pop '('
          } else if (isOperator(c)) {
              while (!s.empty() && precedence(s.top()) >= precedence(c)) {
                  result += s.top(); s.pop();
              }
              s.push(c);
          }
      }
  
      while (!s.empty()) {
          result += s.top(); s.pop();
      }
  
      return result;
  }
  
  int main() {
      string exp = "A+(B*C)-D";
      cout << "Postfix: " << infixToPostfix(exp) << endl;
      return 0;
  }
  `,
  
    python: `def precedence(op):
      if op == '^':
          return 3
      if op in ('*', '/'):
          return 2
      if op in ('+', '-'):
          return 1
      return 0
  
  def is_operator(c):
      return c in '+-*/^'
  
  def infix_to_postfix(expression):
      stack = []
      result = []
  
      for token in expression:
          if token.isalnum():
              result.append(token)
          elif token == '(':
              stack.append(token)
          elif token == ')':
              while stack and stack[-1] != '(':
                  result.append(stack.pop())
              stack.pop()  # remove '('
          elif is_operator(token):
              while stack and precedence(stack[-1]) >= precedence(token):
                  result.append(stack.pop())
              stack.append(token)
  
      while stack:
          result.append(stack.pop())
  
      return ''.join(result)
  
  expr = "A+(B*C)-D"
  print("Postfix:", infix_to_postfix(expr))
  `,
  
    java: `import java.util.*;
  
  public class InfixToPostfix {
      static int precedence(char op) {
          switch (op) {
              case '^': return 3;
              case '*':
              case '/': return 2;
              case '+':
              case '-': return 1;
          }
          return 0;
      }
  
      static boolean isOperator(char c) {
          return "+-*/^".indexOf(c) != -1;
      }
  
      static String infixToPostfix(String expr) {
          StringBuilder result = new StringBuilder();
          Stack<Character> stack = new Stack<>();
  
          for (char c : expr.toCharArray()) {
              if (Character.isLetterOrDigit(c)) {
                  result.append(c);
              } else if (c == '(') {
                  stack.push(c);
              } else if (c == ')') {
                  while (!stack.isEmpty() && stack.peek() != '(')
                      result.append(stack.pop());
                  stack.pop(); // remove '('
              } else if (isOperator(c)) {
                  while (!stack.isEmpty() && precedence(stack.peek()) >= precedence(c))
                      result.append(stack.pop());
                  stack.push(c);
              }
          }
  
          while (!stack.isEmpty())
              result.append(stack.pop());
  
          return result.toString();
      }
  
      public static void main(String[] args) {
          String expr = "A+(B*C)-D";
          System.out.println("Postfix: " + infixToPostfix(expr));
      }
  }
  `
  };
  
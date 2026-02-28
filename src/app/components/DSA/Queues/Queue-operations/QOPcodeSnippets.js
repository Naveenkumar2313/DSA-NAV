export const QOPcodeSnippets = {
    c: `#include <stdio.h>
  #define MAX 100
  
  int queue[MAX];
  int front = 0, rear = -1;
  
  void enqueue(int value) {
      if (rear >= MAX - 1) {
          printf("Queue Overflow\\n");
          return;
      }
      queue[++rear] = value;
  }
  
  void dequeue() {
      if (front > rear) {
          printf("Queue Underflow\\n");
          return;
      }
      printf("Dequeued: %d\\n", queue[front++]);
  }
  
  int isEmpty() {
      return front > rear;
  }
  
  int size() {
      return rear - front + 1;
  }
  
  int main() {
      enqueue(10);
      enqueue(20);
      printf("Size: %d\\n", size());
      dequeue();
      printf("Is Empty: %d\\n", isEmpty());
      return 0;
  }
  `,
  
    cpp: `#include <iostream>
  #include <queue>
  using namespace std;
  
  int main() {
      queue<int> q;
  
      q.push(10);
      q.push(20);
      cout << "Size: " << q.size() << endl;
  
      if (!q.empty()) {
          cout << "Dequeued: " << q.front() << endl;
          q.pop();
      }
  
      cout << "Is Empty: " << q.empty() << endl;
      return 0;
  }
  `,
  
    python: `from collections import deque
  
  class Queue:
      def __init__(self):
          self.queue = deque()
  
      def enqueue(self, value):
          self.queue.append(value)
  
      def dequeue(self):
          if not self.queue:
              print("Queue Underflow")
          else:
              print("Dequeued:", self.queue.popleft())
  
      def is_empty(self):
          return len(self.queue) == 0
  
      def size(self):
          return len(self.queue)
  
  # Example usage
  q = Queue()
  q.enqueue(10)
  q.enqueue(20)
  print("Size:", q.size())
  q.dequeue()
  print("Is Empty:", q.is_empty())
  `,
  
    java: `import java.util.*;
  
  public class QueueExample {
      public static void main(String[] args) {
          Queue<Integer> queue = new LinkedList<>();
  
          queue.offer(10);
          queue.offer(20);
          System.out.println("Size: " + queue.size());
  
          if (!queue.isEmpty()) {
              System.out.println("Dequeued: " + queue.poll());
          }
  
          System.out.println("Is Empty: " + queue.isEmpty());
      }
  }
  `
  };
  
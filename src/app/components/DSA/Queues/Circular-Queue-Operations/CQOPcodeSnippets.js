export const CQOPcodeSnippets = {
    c: `#include <stdio.h>
  #define MAX 5
  
  int queue[MAX];
  int front = -1, rear = -1;
  
  void enqueue(int value) {
      if ((rear + 1) % MAX == front) {
          printf("Queue Overflow\\n");
          return;
      }
      if (front == -1)
          front = rear = 0;
      else
          rear = (rear + 1) % MAX;
      queue[rear] = value;
  }
  
  void dequeue() {
      if (front == -1) {
          printf("Queue Underflow\\n");
          return;
      }
      printf("Dequeued: %d\\n", queue[front]);
      if (front == rear)
          front = rear = -1;
      else
          front = (front + 1) % MAX;
  }
  
  int isEmpty() {
      return front == -1;
  }
  
  int size() {
      if (front == -1) return 0;
      if (rear >= front)
          return rear - front + 1;
      else
          return MAX - (front - rear - 1);
  }
  
  int main() {
      enqueue(10);
      enqueue(20);
      enqueue(30);
      printf("Size: %d\\n", size());
      dequeue();
      enqueue(40);
      enqueue(50);
      enqueue(60); // should show overflow
      printf("Is Empty: %d\\n", isEmpty());
      return 0;
  }
  `,
  
    cpp: `#include <iostream>
  using namespace std;
  
  class CircularQueue {
      int *arr, front, rear, capacity;
  public:
      CircularQueue(int size) {
          capacity = size;
          arr = new int[size];
          front = rear = -1;
      }
  
      void enqueue(int value) {
          if ((rear + 1) % capacity == front) {
              cout << "Queue Overflow\\n";
              return;
          }
          if (front == -1)
              front = rear = 0;
          else
              rear = (rear + 1) % capacity;
          arr[rear] = value;
      }
  
      void dequeue() {
          if (front == -1) {
              cout << "Queue Underflow\\n";
              return;
          }
          cout << "Dequeued: " << arr[front] << endl;
          if (front == rear)
              front = rear = -1;
          else
              front = (front + 1) % capacity;
      }
  
      bool isEmpty() {
          return front == -1;
      }
  
      int size() {
          if (front == -1) return 0;
          if (rear >= front)
              return rear - front + 1;
          return capacity - (front - rear - 1);
      }
  };
  
  int main() {
      CircularQueue q(5);
      q.enqueue(10);
      q.enqueue(20);
      q.enqueue(30);
      cout << "Size: " << q.size() << endl;
      q.dequeue();
      q.enqueue(40);
      q.enqueue(50);
      q.enqueue(60); // overflow
      cout << "Is Empty: " << q.isEmpty() << endl;
      return 0;
  }
  `,
  
    python: `class CircularQueue:
      def __init__(self, size):
          self.size = size
          self.queue = [None] * size
          self.front = self.rear = -1
  
      def enqueue(self, value):
          if (self.rear + 1) % self.size == self.front:
              print("Queue Overflow")
              return
          if self.front == -1:
              self.front = self.rear = 0
          else:
              self.rear = (self.rear + 1) % self.size
          self.queue[self.rear] = value
  
      def dequeue(self):
          if self.front == -1:
              print("Queue Underflow")
              return
          print("Dequeued:", self.queue[self.front])
          if self.front == self.rear:
              self.front = self.rear = -1
          else:
              self.front = (self.front + 1) % self.size
  
      def is_empty(self):
          return self.front == -1
  
      def size_of_queue(self):
          if self.front == -1:
              return 0
          if self.rear >= self.front:
              return self.rear - self.front + 1
          return self.size - (self.front - self.rear - 1)
  
  # Example usage
  cq = CircularQueue(5)
  cq.enqueue(10)
  cq.enqueue(20)
  cq.enqueue(30)
  print("Size:", cq.size_of_queue())
  cq.dequeue()
  cq.enqueue(40)
  cq.enqueue(50)
  cq.enqueue(60)  # overflow
  print("Is Empty:", cq.is_empty())
  `,
  
    java: `import java.util.*;
  
  class CircularQueue {
      private int[] queue;
      private int front, rear, capacity;
  
      public CircularQueue(int size) {
          capacity = size;
          queue = new int[size];
          front = rear = -1;
      }
  
      public void enqueue(int value) {
          if ((rear + 1) % capacity == front) {
              System.out.println("Queue Overflow");
              return;
          }
          if (front == -1)
              front = rear = 0;
          else
              rear = (rear + 1) % capacity;
          queue[rear] = value;
      }
  
      public void dequeue() {
          if (front == -1) {
              System.out.println("Queue Underflow");
              return;
          }
          System.out.println("Dequeued: " + queue[front]);
          if (front == rear)
              front = rear = -1;
          else
              front = (front + 1) % capacity;
      }
  
      public boolean isEmpty() {
          return front == -1;
      }
  
      public int size() {
          if (front == -1) return 0;
          if (rear >= front)
              return rear - front + 1;
          return capacity - (front - rear - 1);
      }
  }
  
  public class CircularQueueExample {
      public static void main(String[] args) {
          CircularQueue q = new CircularQueue(5);
          q.enqueue(10);
          q.enqueue(20);
          q.enqueue(30);
          System.out.println("Size: " + q.size());
          q.dequeue();
          q.enqueue(40);
          q.enqueue(50);
          q.enqueue(60); // overflow
          System.out.println("Is Empty: " + q.isEmpty());
      }
  }
  `
  };
  
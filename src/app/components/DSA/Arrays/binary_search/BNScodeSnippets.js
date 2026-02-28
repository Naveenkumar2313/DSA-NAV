// src/data/codeSnippets.js
export const BNScodeSnippets = {
    c: `#include <stdio.h>
  
  int binarySearch(int arr[], int size, int target) {
      int low = 0, high = size - 1;
      while (low <= high) {
          int mid = (low + high) / 2;
  
          if (arr[mid] == target)
              return mid;
          else if (arr[mid] < target)
              low = mid + 1;
          else
              high = mid - 1;
      }
      return -1;
  }
  
  int main() {
      int arr[] = {2, 5, 8, 12, 16, 23, 38, 56};
      int size = sizeof(arr) / sizeof(arr[0]);
      int target = 23;
      int result = binarySearch(arr, size, target);
  
      if (result != -1)
          printf("Element found at index %d\\n", result);
      else
          printf("Element not found\\n");
  
      return 0;
  }
  `,
  
    cpp: `#include <iostream>
  using namespace std;
  
  int binarySearch(int arr[], int size, int target) {
      int low = 0, high = size - 1;
  
      while (low <= high) {
          int mid = (low + high) / 2;
  
          if (arr[mid] == target)
              return mid;
          else if (arr[mid] < target)
              low = mid + 1;
          else
              high = mid - 1;
      }
  
      return -1;
  }
  
  int main() {
      int arr[] = {2, 5, 8, 12, 16, 23, 38, 56};
      int size = sizeof(arr) / sizeof(arr[0]);
      int target = 23;
  
      int result = binarySearch(arr, size, target);
  
      if (result != -1)
          cout << "Element found at index " << result << endl;
      else
          cout << "Element not found" << endl;
  
      return 0;
  }
  `,
  
    python: `def binary_search(arr, target):
      low, high = 0, len(arr) - 1
  
      while low <= high:
          mid = (low + high) // 2
          if arr[mid] == target:
              return mid
          elif arr[mid] < target:
              low = mid + 1
          else:
              high = mid - 1
  
      return -1
  
  arr = [2, 5, 8, 12, 16, 23, 38, 56]
  target = 23
  result = binary_search(arr, target)
  
  if result != -1:
      print(f"Element found at index {result}")
  else:
      print("Element not found")
  `,
  
    java: `import java.util.*;
  
  public class BinarySearchExample {
      public static int binarySearch(int[] arr, int target) {
          int low = 0, high = arr.length - 1;
  
          while (low <= high) {
              int mid = (low + high) / 2;
  
              if (arr[mid] == target)
                  return mid;
              else if (arr[mid] < target)
                  low = mid + 1;
              else
                  high = mid - 1;
          }
  
          return -1;
      }
  
      public static void main(String[] args) {
          int[] arr = {2, 5, 8, 12, 16, 23, 38, 56};
          int target = 23;
  
          int result = binarySearch(arr, target);
  
          if (result != -1)
              System.out.println("Element found at index " + result);
          else
              System.out.println("Element not found");
      }
  }
  `
  };
  
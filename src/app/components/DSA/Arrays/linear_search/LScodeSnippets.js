export const LScodeSnippets = {
    c: `#include <stdio.h>
  
  int linearSearch(int arr[], int size, int target) {
      for (int i = 0; i < size; i++) {
          if (arr[i] == target)
              return i;
      }
      return -1;
  }
  
  int main() {
      int arr[] = {2, 5, 8, 12, 16, 23, 38, 56};
      int size = sizeof(arr) / sizeof(arr[0]);
      int target = 23;
      int result = linearSearch(arr, size, target);
  
      if (result != -1)
          printf("Element found at index %d\\n", result);
      else
          printf("Element not found\\n");
  
      return 0;
  }
  `,
  
    cpp: `#include <iostream>
  using namespace std;
  
  int linearSearch(int arr[], int size, int target) {
      for (int i = 0; i < size; i++) {
          if (arr[i] == target)
              return i;
      }
      return -1;
  }
  
  int main() {
      int arr[] = {2, 5, 8, 12, 16, 23, 38, 56};
      int size = sizeof(arr) / sizeof(arr[0]);
      int target = 23;
  
      int result = linearSearch(arr, size, target);
  
      if (result != -1)
          cout << "Element found at index " << result << endl;
      else
          cout << "Element not found" << endl;
  
      return 0;
  }
  `,
  
    python: `def linear_search(arr, target):
      for i in range(len(arr)):
          if arr[i] == target:
              return i
      return -1
  
  arr = [2, 5, 8, 12, 16, 23, 38, 56]
  target = 23
  result = linear_search(arr, target)
  
  if result != -1:
      print(f"Element found at index {result}")
  else:
      print("Element not found")
  `,
  
    java: `import java.util.*;
  
  public class LinearSearchExample {
      public static int linearSearch(int[] arr, int target) {
          for (int i = 0; i < arr.length; i++) {
              if (arr[i] == target)
                  return i;
          }
          return -1;
      }
  
      public static void main(String[] args) {
          int[] arr = {2, 5, 8, 12, 16, 23, 38, 56};
          int target = 23;
  
          int result = linearSearch(arr, target);
  
          if (result != -1)
              System.out.println("Element found at index " + result);
          else
              System.out.println("Element not found");
      }
  }
  `
  };
  
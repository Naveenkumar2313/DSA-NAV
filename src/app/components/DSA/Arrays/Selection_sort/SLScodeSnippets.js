// src/data/codeSnippets.js
export const SLScodeSnippets = {
    c: `#include <stdio.h>
  
  void selectionSort(int arr[], int n) {
      for (int i = 0; i < n - 1; i++) {
          int minIdx = i;
          for (int j = i + 1; j < n; j++) {
              if (arr[j] < arr[minIdx])
                  minIdx = j;
          }
          // Swap
          int temp = arr[minIdx];
          arr[minIdx] = arr[i];
          arr[i] = temp;
      }
  }
  
  int main() {
      int arr[] = {64, 34, 25, 12, 22, 11, 90};
      int n = sizeof(arr)/sizeof(arr[0]);
  
      selectionSort(arr, n);
  
      printf("Sorted array: ");
      for (int i = 0; i < n; i++)
          printf("%d ", arr[i]);
      return 0;
  }
  `,
  
    cpp: `#include <iostream>
  using namespace std;
  
  void selectionSort(int arr[], int n) {
      for (int i = 0; i < n - 1; i++) {
          int minIdx = i;
          for (int j = i + 1; j < n; j++) {
              if (arr[j] < arr[minIdx])
                  minIdx = j;
          }
          // Swap
          int temp = arr[minIdx];
          arr[minIdx] = arr[i];
          arr[i] = temp;
      }
  }
  
  int main() {
      int arr[] = {64, 34, 25, 12, 22, 11, 90};
      int n = sizeof(arr)/sizeof(arr[0]);
  
      selectionSort(arr, n);
  
      cout << "Sorted array: ";
      for (int i = 0; i < n; i++)
          cout << arr[i] << " ";
      return 0;
  }
  `,
  
    python: `def selection_sort(arr):
      n = len(arr)
      for i in range(n):
          min_idx = i
          for j in range(i + 1, n):
              if arr[j] < arr[min_idx]:
                  min_idx = j
          # Swap
          arr[i], arr[min_idx] = arr[min_idx], arr[i]
  
  arr = [64, 34, 25, 12, 22, 11, 90]
  selection_sort(arr)
  print("Sorted array:", arr)
  `,
  
    java: `public class SelectionSortExample {
      public static void selectionSort(int[] arr) {
          int n = arr.length;
          for (int i = 0; i < n - 1; i++) {
              int minIdx = i;
              for (int j = i + 1; j < n; j++) {
                  if (arr[j] < arr[minIdx]) {
                      minIdx = j;
                  }
              }
              // Swap
              int temp = arr[minIdx];
              arr[minIdx] = arr[i];
              arr[i] = temp;
          }
      }
  
      public static void main(String[] args) {
          int[] arr = {64, 34, 25, 12, 22, 11, 90};
  
          selectionSort(arr);
  
          System.out.print("Sorted array: ");
          for (int value : arr) {
              System.out.print(value + " ");
          }
      }
  }
  `
  };
  
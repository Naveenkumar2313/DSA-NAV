// src/data/codeSnippets.js
export const BBScodeSnippets = {
    c: `#include <stdio.h>
  
  void bubbleSort(int arr[], int n) {
      for (int i = 0; i < n - 1; i++) {
          for (int j = 0; j < n - i - 1; j++) {
              if (arr[j] > arr[j + 1]) {
                  // Swap
                  int temp = arr[j];
                  arr[j] = arr[j + 1];
                  arr[j + 1] = temp;
              }
          }
      }
  }
  
  int main() {
      int arr[] = {64, 34, 25, 12, 22, 11, 90};
      int n = sizeof(arr)/sizeof(arr[0]);
  
      bubbleSort(arr, n);
  
      printf("Sorted array: ");
      for (int i = 0; i < n; i++)
          printf("%d ", arr[i]);
      return 0;
  }
  `,
  
    cpp: `#include <iostream>
  using namespace std;
  
  void bubbleSort(int arr[], int n) {
      for (int i = 0; i < n - 1; i++) {
          for (int j = 0; j < n - i - 1; j++) {
              if (arr[j] > arr[j + 1]) {
                  // Swap
                  int temp = arr[j];
                  arr[j] = arr[j + 1];
                  arr[j + 1] = temp;
              }
          }
      }
  }
  
  int main() {
      int arr[] = {64, 34, 25, 12, 22, 11, 90};
      int n = sizeof(arr)/sizeof(arr[0]);
  
      bubbleSort(arr, n);
  
      cout << "Sorted array: ";
      for (int i = 0; i < n; i++)
          cout << arr[i] << " ";
      return 0;
  }
  `,
  
    python: `def bubble_sort(arr):
      n = len(arr)
      for i in range(n):
          for j in range(0, n - i - 1):
              if arr[j] > arr[j + 1]:
                  arr[j], arr[j + 1] = arr[j + 1], arr[j]
  
  arr = [64, 34, 25, 12, 22, 11, 90]
  bubble_sort(arr)
  
  print("Sorted array:", arr)
  `,
  
    java: `public class BubbleSortExample {
      public static void bubbleSort(int[] arr) {
          int n = arr.length;
          for (int i = 0; i < n - 1; i++) {
              for (int j = 0; j < n - i - 1; j++) {
                  if (arr[j] > arr[j + 1]) {
                      // Swap
                      int temp = arr[j];
                      arr[j] = arr[j + 1];
                      arr[j + 1] = temp;
                  }
              }
          }
      }
  
      public static void main(String[] args) {
          int[] arr = {64, 34, 25, 12, 22, 11, 90};
  
          bubbleSort(arr);
  
          System.out.print("Sorted array: ");
          for (int value : arr) {
              System.out.print(value + " ");
          }
      }
  }
  `
  };
  
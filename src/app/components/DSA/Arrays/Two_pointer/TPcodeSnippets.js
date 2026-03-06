// src/data/codeSnippets.js
export const TPcodeSnippets = {
    c: `#include <stdio.h>
  
  int isPalindrome(int arr[], int size) {
      int left = 0, right = size - 1;
  
      while (left < right) {
          if (arr[left] != arr[right])
              return 0; // Not a palindrome
          left++;
          right--;
      }
      return 1; // Palindrome
  }
  
  int main() {
      int arr[] = {1, 2, 3, 2, 1};
      int size = sizeof(arr) / sizeof(arr[0]);
  
      if (isPalindrome(arr, size))
          printf("The array is a palindrome\\n");
      else
          printf("The array is not a palindrome\\n");
  
      return 0;
  }
  `,
  
    cpp: `#include <iostream>
  using namespace std;
  
  bool isPalindrome(int arr[], int size) {
      int left = 0, right = size - 1;
  
      while (left < right) {
          if (arr[left] != arr[right])
              return false;
          left++;
          right--;
      }
      return true;
  }
  
  int main() {
      int arr[] = {1, 2, 3, 2, 1};
      int size = sizeof(arr) / sizeof(arr[0]);
  
      if (isPalindrome(arr, size))
          cout << "The array is a palindrome" << endl;
      else
          cout << "The array is not a palindrome" << endl;
  
      return 0;
  }
  `,
  
    python: `def is_palindrome(arr):
      left, right = 0, len(arr) - 1
  
      while left < right:
          if arr[left] != arr[right]:
              return False
          left += 1
          right -= 1
  
      return True
  
  arr = [1, 2, 3, 2, 1]
  
  if is_palindrome(arr):
      print("The array is a palindrome")
  else:
      print("The array is not a palindrome")
  `,
  
    java: `public class PalindromeCheck {
      public static boolean isPalindrome(int[] arr) {
          int left = 0, right = arr.length - 1;
  
          while (left < right) {
              if (arr[left] != arr[right])
                  return false;
              left++;
              right--;
          }
          return true;
      }
  
      public static void main(String[] args) {
          int[] arr = {1, 2, 3, 2, 1};
  
          if (isPalindrome(arr))
              System.out.println("The array is a palindrome");
          else
              System.out.println("The array is not a palindrome");
      }
  }
  `
  };

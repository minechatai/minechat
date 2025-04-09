/*
Contains the utility functions for the app.
*/

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createPromise() {
  return new Promise<void>(resolve => resolve());
}

export function waitUntil(pCondition: any, pInterval = 100) {
  return new Promise((resolve: any) => {
      const checkCondition = setInterval(() => {
          if (pCondition()) {
              clearInterval(checkCondition);
              resolve();
          }
      }, pInterval);
  });
}
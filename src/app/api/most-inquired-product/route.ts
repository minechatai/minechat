/**
 * JSON Signature:
 * {
 *   "mostInquiredProduct": string  // Either the product name that was most mentioned, or "None"
 * }
 */

import { NextResponse } from 'next/server';

interface Message {
  role: string;
  content: string;
}

/**
 * Helper function that counts how many times each product appears in the messages.
 * It uses a word-boundary match to avoid false positives.
 */
function findMostInquiredProduct(messages: Message[], products: string[]): string {
  const productCounts: { [product: string]: number } = {};
  products.forEach(product => {
    productCounts[product] = 0;
  });

  // Loop over all messages and count occurrences
  messages.forEach(msg => {
    const contentLower = msg.content.toLowerCase();
    products.forEach(product => {
      const productLower = product.toLowerCase();
      // Use regex with word boundaries so "Pro" doesn't match in "MacBook Pro" by accident.
      const regex = new RegExp(`\\b${escapeRegExp(productLower)}\\b`, 'g');
      const matches = contentLower.match(regex);
      if (matches) {
        productCounts[product] += matches.length;
      }
    });
  });

  // Find the product with the highest count
  let mostInquiredProduct = "None";
  let maxCount = 0;
  for (const product in productCounts) {
    if (productCounts[product] > maxCount) {
      maxCount = productCounts[product];
      mostInquiredProduct = product;
    }
  }
  return maxCount > 0 ? mostInquiredProduct : "None";
}

/**
 * Escape special characters in a string for use in a regular expression.
 */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * POST route handler.
 */
export async function POST(request: Request) {
  try {
    const { messages, products } = await request.json();

    // Basic input validation
    if (!Array.isArray(messages) || !Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Invalid request: "messages" and "products" must be arrays.' },
        { status: 400 }
      );
    }

    const mostInquiredProduct = findMostInquiredProduct(messages, products);

    // Always return a consistent JSON structure
    return NextResponse.json({ mostInquiredProduct });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

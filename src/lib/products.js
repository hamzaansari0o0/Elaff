// Data Fetching Helpers (Database Query Layer)

// src/lib/products.js
import { PRODUCTS, COLLECTIONS } from '@/data/mockData';

// --- PRODUCT HELPERS ---
export function getAllProducts() {
  return PRODUCTS;
}

export function getProductBySlug(slug) {
  return PRODUCTS.find((p) => p.slug === slug) || null;
}

export function getFeaturedProducts() {
  return PRODUCTS.filter((p) => p.featured);
}

// --- COLLECTION HELPERS ---
export function getAllCollections() {
  return COLLECTIONS;
}

export function getCollectionBySlug(slug) {
  return COLLECTIONS.find((c) => c.slug === slug) || null;
}

export function getProductsByCollection(collectionSlug) {
  return PRODUCTS.filter((p) => p.collectionSlug === collectionSlug);
}
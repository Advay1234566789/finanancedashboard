// src/config.js
// Reads the backend base URL from VITE_API_URL; defaults to '' (so `/api/...` is relative)
export const API_BASE = import.meta.env.VITE_API_URL || '';

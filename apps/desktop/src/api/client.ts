import { mockApi } from "../mock/inProcessApi";

/**
 * Desktop talks to Spring Boot only. Until that API exists, this module
 * is the in-process mock that implements the same routes and WS events.
 * Swap `api` for a fetch/WebSocket client when VITE_API_BASE is set.
 */
export const USE_MOCK = !import.meta.env.VITE_API_BASE;

export const api = mockApi;

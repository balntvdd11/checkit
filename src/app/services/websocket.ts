/**
 * WebSocket service — singleton connection to the Django Channels backend.
 *
 * Provides auto-reconnect with exponential back-off and a subscribe/unsubscribe
 * API so any React component (or hook) can react to server-pushed messages.
 */

type MessageHandler = (payload: any) => void;

const WS_BASE = import.meta.env.VITE_WS_BASE
  || (window.location.protocol === 'https:' ? 'wss://' : 'ws://')
    + (import.meta.env.VITE_API_BASE
      ? new URL(import.meta.env.VITE_API_BASE).host
      : window.location.host);

const WS_URL = `${WS_BASE}/ws/attendance/`;

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectDelay = 1000; // ms — doubles on each failure, caps at 30 s
const MAX_RECONNECT_DELAY = 30_000;

const listeners = new Map<string, Set<MessageHandler>>();

function notifyListeners(type: string, payload: any) {
  const handlers = listeners.get(type);
  if (handlers) {
    handlers.forEach((fn) => fn(payload));
  }
}

function handleMessage(event: MessageEvent) {
  try {
    const data = JSON.parse(event.data);
    if (data.type && data.payload) {
      notifyListeners(data.type, data.payload);
    }
  } catch {
    // Ignore malformed messages
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, reconnectDelay);
  reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
}

export function connect() {
  // Don't open a second connection
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  try {
    socket = new WebSocket(WS_URL);
  } catch {
    scheduleReconnect();
    return;
  }

  socket.onopen = () => {
    reconnectDelay = 1000; // reset back-off on success
  };

  socket.onmessage = handleMessage;

  socket.onclose = () => {
    socket = null;
    scheduleReconnect();
  };

  socket.onerror = () => {
    // onclose fires right after onerror — reconnect is handled there
  };
}

export function disconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (socket) {
    socket.onclose = null; // prevent auto-reconnect
    socket.close();
    socket = null;
  }
}

export function subscribe(type: string, handler: MessageHandler) {
  if (!listeners.has(type)) {
    listeners.set(type, new Set());
  }
  listeners.get(type)!.add(handler);
}

export function unsubscribe(type: string, handler: MessageHandler) {
  listeners.get(type)?.delete(handler);
}

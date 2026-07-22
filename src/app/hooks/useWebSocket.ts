import { useEffect } from 'react';
import { connect, disconnect, subscribe, unsubscribe } from '../services/websocket';
import { useStore } from '../state/store';
import type { AttendanceRecord, EventConfig } from '../types';

/**
 * Opens the WebSocket connection on mount, subscribes to server-pushed
 * messages, dispatches the appropriate store actions, and tears down
 * cleanly on unmount.
 *
 * Mount this hook once at the top level (e.g. inside App / AppInner).
 */
export function useWebSocket() {
  const { dispatch } = useStore();

  useEffect(() => {
    connect();

    const onCreated = (payload: AttendanceRecord) => {
      dispatch({ type: 'WS_ATTENDANCE_CREATED', payload });
    };

    const onUpdated = (payload: AttendanceRecord) => {
      dispatch({ type: 'WS_ATTENDANCE_UPDATED', payload });
    };

    const onEventUpdated = (payload: EventConfig) => {
      dispatch({ type: 'WS_EVENT_UPDATED', payload });
    };

    subscribe('attendance_created', onCreated);
    subscribe('attendance_updated', onUpdated);
    subscribe('event_updated', onEventUpdated);

    return () => {
      unsubscribe('attendance_created', onCreated);
      unsubscribe('attendance_updated', onUpdated);
      unsubscribe('event_updated', onEventUpdated);
      disconnect();
    };
  }, [dispatch]);
}

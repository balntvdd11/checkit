import { useEffect } from 'react';
import { connect, disconnect, subscribe, unsubscribe } from '../services/websocket';
import { useStore } from '../state/store';
import type { AttendanceRecord, EventConfig, StudentRecord } from '../types';

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

    // ── Attendance ─────────────────────────────────────────────────
    const onAttendanceCreated = (payload: AttendanceRecord) => {
      dispatch({ type: 'WS_ATTENDANCE_CREATED', payload });
    };
    const onAttendanceUpdated = (payload: AttendanceRecord) => {
      dispatch({ type: 'WS_ATTENDANCE_UPDATED', payload });
    };

    // ── Events ────────────────────────────────────────────────────
    const onEventUpdated = (payload: EventConfig) => {
      dispatch({ type: 'WS_EVENT_UPDATED', payload });
    };

    // ── Students ──────────────────────────────────────────────────
    const onStudentCreated = (payload: StudentRecord) => {
      dispatch({ type: 'WS_STUDENT_CREATED', payload });
    };
    const onStudentUpdated = (payload: StudentRecord) => {
      dispatch({ type: 'WS_STUDENT_UPDATED', payload });
    };
    const onStudentDeleted = (payload: { id: string }) => {
      dispatch({ type: 'WS_STUDENT_DELETED', payload });
    };

    subscribe('attendance_created', onAttendanceCreated);
    subscribe('attendance_updated', onAttendanceUpdated);
    subscribe('event_updated', onEventUpdated);
    subscribe('student_created', onStudentCreated);
    subscribe('student_updated', onStudentUpdated);
    subscribe('student_deleted', onStudentDeleted);

    return () => {
      unsubscribe('attendance_created', onAttendanceCreated);
      unsubscribe('attendance_updated', onAttendanceUpdated);
      unsubscribe('event_updated', onEventUpdated);
      unsubscribe('student_created', onStudentCreated);
      unsubscribe('student_updated', onStudentUpdated);
      unsubscribe('student_deleted', onStudentDeleted);
      disconnect();
    };
  }, [dispatch]);
}

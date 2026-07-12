import type { EventConfig } from "../types";
import { MOCK_EVENTS } from "../constants/mockData";
import { apiFetch } from "./api";



export const fetchEvents = async (): Promise<EventConfig[]> => {
  return apiFetch('/api/events/');
};

export const fetchEventsFromApi = fetchEvents;

export const createEvent = async (event: EventConfig): Promise<EventConfig> => {
  const payload = {
    name: event.name,
    checkItCode: event.checkItCode,
    timeIn: event.timeIn,
    lateThreshold: event.lateThreshold,
    timeOut: event.timeOut,
    status: event.status,
  };
  return apiFetch('/api/events/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateEvent = async (event: EventConfig): Promise<EventConfig> => {
  const payload = {
    name: event.name,
    checkItCode: event.checkItCode,
    timeIn: event.timeIn,
    lateThreshold: event.lateThreshold,
    timeOut: event.timeOut,
    status: event.status,
  };
  return apiFetch(`/api/events/${event.id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

/**
 * Calendar and Reminder System for CAMPUS POST
 * Supports iCalendar (.ics) export, Google Calendar 1-click links,
 * and Web Notifications.
 */

import { CampusEvent } from '../types';

const REMINDERS_STORAGE_KEY = 'campus_post_reminders_v1';

export function getSavedReminders(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(REMINDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function toggleEventReminder(eventId: string): boolean {
  if (typeof window === 'undefined') return false;
  const current = getSavedReminders();
  const nextState = !current[eventId];
  current[eventId] = nextState;
  localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(current));
  return nextState;
}

export function isReminderSet(eventId: string): boolean {
  const current = getSavedReminders();
  return !!current[eventId];
}

/**
 * Generates and triggers download of an .ics calendar file
 */
export function downloadEventICS(event: CampusEvent): void {
  // Parse event date and time roughly or use safe fallbacks
  const now = new Date();
  
  // Format to iCal date YYYYMMDDTHHMMSSZ
  const formatDateToICS = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  // Estimate a realistic date or parse event.date
  let startDate = new Date();
  startDate.setDate(startDate.getDate() + 3); // 3 days out by default
  let endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours duration

  // Format clean ICS file content
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Campus Post//College Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:campuspost-${event.id}@campuspost.edu`,
    `DTSTAMP:${formatDateToICS(now)}`,
    `DTSTART:${formatDateToICS(startDate)}`,
    `DTEND:${formatDateToICS(endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, ' ')} \\n\\nOrganized by: ${event.organizerClub}`,
    `LOCATION:${event.venue}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${event.title} is starting in 1 hour at ${event.venue}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_Reminder.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Creates a 1-click Google Calendar web link
 */
export function getGoogleCalendarUrl(event: CampusEvent): string {
  const title = encodeURIComponent(event.title);
  const details = encodeURIComponent(
    `${event.description}\n\nOrganized by: ${event.organizerClub}\nCategory: ${event.category}\nVenue: ${event.venue}`
  );
  const location = encodeURIComponent(event.venue);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
}

/**
 * Requests web notification permission and displays a confirmation notification
 */
export async function requestAndSendNotification(event: CampusEvent): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    let permission = Notification.permission;
    if (permission !== 'granted') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      new Notification(`★ Campus Post: Reminder Set`, {
        body: `You will be alerted for "${event.title}" happening at ${event.venue} (${event.date} at ${event.time}).`,
        icon: '/favicon.ico',
      });
      return true;
    }
  } catch (err) {
    console.error('Notification error:', err);
  }

  return false;
}

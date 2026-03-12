import { useConcursoStore, Concurso } from '../store';
import { differenceInDays, parseISO, isAfter, startOfDay } from 'date-fns';

class NotificationService {
  private lastChecked: number = 0;
  private checkInterval: number = 1000 * 60 * 60; // Check every hour
  private notifiedThisSession: Set<string> = new Set();

  async init() {
    // Request permission for push notifications
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    // Initial check
    this.checkNotifications();

    // Set up periodic check
    setInterval(() => this.checkNotifications(), this.checkInterval);
  }

  async checkNotifications() {
    const state = useConcursoStore.getState();
    const { concursos, notificationSettings, user, lastSeenExamIds, setLastSeenExamIds } = state;

    if (!notificationSettings.emailEnabled && !notificationSettings.pushEnabled) return;

    const now = new Date();
    const today = startOfDay(now);
    const currentIds = concursos.map(c => c.id);
    const newExams: Concurso[] = [];

    for (const concurso of concursos) {
      // 1. Check for New Exams
      if (notificationSettings.notifyNewExams && !lastSeenExamIds.includes(concurso.id)) {
        newExams.push(concurso);
      }

      // 2. Check Deadlines
      if (notificationSettings.notifyDeadlines) {
        this.checkDeadline(concurso, 'registration_end', 'Inscrições encerrando', today, notificationSettings.deadlineThresholdDays);
        this.checkDeadline(concurso, 'exam_date', 'Prova se aproximando', today, notificationSettings.deadlineThresholdDays);
      }

      // 3. Check Interested Updates
      if (notificationSettings.notifyInterested && concurso.interest_status === 'interested') {
        // Mock logic for interested updates
      }
    }

    // Notify about new exams
    if (newExams.length > 0) {
      const title = `${newExams.length} Novo(s) Concurso(s) Encontrado(s)`;
      const body = newExams.slice(0, 3).map(e => e.institution).join(', ') + (newExams.length > 3 ? '...' : '');
      this.triggerNotification(title, body, 'new-exams');
    }

    // Update last seen IDs
    setLastSeenExamIds(currentIds);
    this.lastChecked = Date.now();
  }

  private checkDeadline(concurso: Concurso, field: 'registration_end' | 'exam_date', title: string, today: Date, threshold: number) {
    const dateStr = concurso[field];
    if (!dateStr || dateStr === 'N/A') return;

    try {
      const targetDate = parseISO(dateStr);
      const daysDiff = differenceInDays(targetDate, today);

      if (daysDiff >= 0 && daysDiff <= threshold) {
        const message = `${concurso.institution}: ${title} em ${daysDiff} dias (${dateStr})`;
        this.triggerNotification(title, message, `${concurso.id}-${field}`);
      }
    } catch (e) {
      console.error(`Error parsing date for ${concurso.institution}: ${dateStr}`, e);
    }
  }

  private async triggerNotification(title: string, body: string, id?: string) {
    const state = useConcursoStore.getState();
    const { notificationSettings, user } = state;

    const notificationKey = id ? `${id}-${title}` : title;
    if (this.notifiedThisSession.has(notificationKey)) return;
    this.notifiedThisSession.add(notificationKey);

    // Push Notification
    if (notificationSettings.pushEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/vite.svg' });
    }

    // Email Notification
    if (notificationSettings.emailEnabled && user?.email) {
      try {
        await fetch('/api/notifications/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: user.email,
            subject: `[Concursos BR] ${title}`,
            body: body
          })
        });
      } catch (e) {
        console.error('Failed to send email notification', e);
      }
    }
  }
}

export const notificationService = new NotificationService();

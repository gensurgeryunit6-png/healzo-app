import type { ActivityLog, Child, Redemption, Session } from './family';
import { activityById } from './content';

export function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function sessionMinutes(s: Session, now = Date.now()) {
  if (s.minutes != null && s.ended_at) return s.minutes;
  if (!s.ended_at) return Math.max(0, Math.round((now - new Date(s.started_at).getTime()) / 60000));
  return s.minutes ?? 0;
}

/** Minutes of screen time for a child on the given local day (running timer included). */
export function minutesOn(sessions: Session[], childId: string, day: Date, now = Date.now()) {
  const k = dayKey(day);
  let total = 0;
  for (const s of sessions) {
    if (s.child_id !== childId) continue;
    if (dayKey(new Date(s.started_at)) !== k) continue;
    total += sessionMinutes(s, now);
  }
  return total;
}

export function todayMinutes(sessions: Session[], childId: string, now = Date.now()) {
  return minutesOn(sessions, childId, new Date(now), now);
}

export function lastNDays(n: number) {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    out.push(x);
  }
  return out;
}

export function weekly(sessions: Session[], childId: string) {
  return lastNDays(7).map(d => ({ day: d, minutes: minutesOn(sessions, childId, d) }));
}

/** Consecutive days within the limit, counting today if it's within the limit so far. */
export function streak(child: Child, sessions: Session[]) {
  const created = new Date(child.created_at);
  created.setHours(0, 0, 0, 0);
  let count = 0;
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  for (let i = 0; i < 60; i++) {
    if (d < created) break;
    const m = minutesOn(sessions, child.id, d);
    if (m > child.daily_limit_min) {
      if (i === 0) {
        // today already over: streak is broken
        return 0;
      }
      break;
    }
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

export function points(childId: string, logs: ActivityLog[], redemptions: Redemption[]) {
  const earned = logs.filter(l => l.child_id === childId && l.status === 'approved').reduce((s, l) => s + l.points, 0);
  const spent = redemptions.filter(r => r.child_id === childId && r.status !== 'rejected').reduce((s, r) => s + r.cost, 0);
  return Math.max(0, earned - spent);
}

export function earnedBadges(child: Child, logs: ActivityLog[], sessions: Session[]) {
  const done = logs.filter(l => l.child_id === child.id && l.status === 'approved');
  const cat = (c: string) => done.filter(l => activityById(l.activity_id)?.category === c).length;
  const st = streak(child, sessions);
  const ids = new Set<string>();
  if (done.length >= 1) ids.add('first');
  if (st >= 3) ids.add('streak3');
  if (st >= 7) ids.add('streak7');
  if (cat('Gardening') >= 3) ids.add('green');
  if (done.length >= 10) ids.add('ten');
  if (cat('Reading') >= 3) ids.add('reader');
  return ids;
}

export function fmtMin(m: number) {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

export function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  } catch {
    return iso;
  }
}

export function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  } catch {
    return iso;
  }
}

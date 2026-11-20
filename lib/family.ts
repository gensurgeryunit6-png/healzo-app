import { useEffect, useState } from 'react';
import * as Crypto from 'expo-crypto';
import { supabase } from './supabase';

// ───────── types ─────────
export type Family = { id: string; name: string; parent_code: string };
export type Member = { user_id: string; family_id: string; role: 'parent' | 'child'; child_id: string | null; name: string | null };
export type Child = { id: string; family_id: string; name: string; birth_year: number; avatar: string; daily_limit_min: number; join_code: string; created_at: string };
export type Session = { id: string; child_id: string; started_at: string; ended_at: string | null; minutes: number | null; source: 'timer' | 'manual' };
export type ActivityLog = { id: string; child_id: string; activity_id: string; title: string; minutes: number; points: number; status: 'pending' | 'approved' | 'rejected'; created_at: string };
export type Reward = { id: string; title: string; emoji: string; cost: number };
export type Redemption = { id: string; child_id: string; reward_id: string | null; title: string; cost: number; status: 'pending' | 'approved' | 'rejected'; created_at: string };
export type Product = { id: string; name: string; description: string; category: string; emoji: string; image_url: string | null; price_inr: number; mrp_inr: number | null; age_label: string | null };

export type State = {
  ready: boolean;
  userId: string | null;
  member: Member | null;
  family: Family | null;
  children: Child[];
  sessions: Session[];
  logs: ActivityLog[];
  rewards: Reward[];
  redemptions: Redemption[];
  error: string | null;
};

let state: State = {
  ready: false, userId: null, member: null, family: null, children: [], sessions: [], logs: [], rewards: [], redemptions: [], error: null,
};
const listeners = new Set<() => void>();
function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach(l => l());
}
export function getState() {
  return state;
}
export function useFamily() {
  const [s, setS] = useState(state);
  useEffect(() => {
    const l = () => setS(state);
    listeners.add(l);
    l();
    return () => {
      listeners.delete(l);
    };
  }, []);
  return s;
}

// ───────── errors ─────────
export function friendlyError(e: any): string {
  const m = String(e?.message ?? e ?? '');
  if (/anonymous sign-ins are disabled/i.test(m)) return 'Sign-in is not enabled on the server yet. Ask the Healzo admin to enable anonymous sign-ins in Supabase.';
  if (/invalid code/i.test(m)) return 'That code didn’t work. Check the letters and try again.';
  if (/already in a family/i.test(m)) return 'This phone is already linked to a family.';
  if (/Failed to fetch|Network|network request failed|fetch/i.test(m)) return 'No internet connection. Please check and try again.';
  if (/relation .* does not exist|function .* does not exist|Could not find/i.test(m)) return 'The Healzo server isn’t set up yet. Ask the admin to run the database setup.';
  return m || 'Something went wrong. Please try again.';
}

async function q<T>(p: PromiseLike<{ data: T; error: any }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw error;
  return data;
}

// ───────── auth + loading ─────────
export async function ensureAuth(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (data.session?.user) return data.session.user.id;
  const { data: d2, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return d2.user!.id;
}

function daysAgoISO(n: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export async function load(): Promise<void> {
  try {
    const userId = await ensureAuth();
    const member = await q<Member | null>(supabase.from('hz_members').select('*').eq('user_id', userId).maybeSingle() as any);
    if (!member) {
      set({ ready: true, userId, member: null, family: null, children: [], sessions: [], logs: [], rewards: [], redemptions: [], error: null });
      return;
    }
    const since = daysAgoISO(40);
    const [family, children, sessions, logs, rewards, redemptions] = await Promise.all([
      q<Family>(supabase.from('hz_families').select('id,name,parent_code').eq('id', member.family_id).single() as any),
      q<Child[]>(supabase.from('hz_children').select('*').order('created_at') as any),
      q<Session[]>(supabase.from('hz_sessions').select('id,child_id,started_at,ended_at,minutes,source').gte('started_at', since).order('started_at', { ascending: false }) as any),
      q<ActivityLog[]>(supabase.from('hz_activity_logs').select('id,child_id,activity_id,title,minutes,points,status,created_at').order('created_at', { ascending: false }).limit(500) as any),
      q<Reward[]>(supabase.from('hz_rewards').select('id,title,emoji,cost').order('cost') as any),
      q<Redemption[]>(supabase.from('hz_redemptions').select('*').order('created_at', { ascending: false }).limit(300) as any),
    ]);
    set({ ready: true, userId, member, family, children, sessions, logs, rewards, redemptions, error: null });
  } catch (e) {
    set({ ready: true, error: friendlyError(e) });
  }
}

export async function refresh() {
  await load();
}

// ───────── linking ─────────
export async function createFamily(familyName: string, parentName: string) {
  await ensureAuth();
  await q(supabase.rpc('hz_create_family', { p_family_name: familyName, p_parent_name: parentName }));
  await load();
}
export async function joinAsParent(code: string, name: string) {
  await ensureAuth();
  await q(supabase.rpc('hz_join_as_parent', { p_code: code.trim().toUpperCase(), p_name: name }));
  await load();
}
export async function joinAsChild(code: string) {
  await ensureAuth();
  await q(supabase.rpc('hz_join_as_child', { p_code: code.trim().toUpperCase() }));
  await load();
}
export async function leaveFamily() {
  try {
    await supabase.rpc('hz_leave_family');
  } catch {}
  await supabase.auth.signOut().catch(() => {});
  set({ member: null, family: null, children: [], sessions: [], logs: [], rewards: [], redemptions: [], userId: null });
  await load();
}

// ───────── children ─────────
export async function addChild(c: { name: string; birth_year: number; avatar: string; daily_limit_min: number }) {
  const fid = state.member!.family_id;
  const row = await q<Child>(supabase.from('hz_children').insert({ ...c, family_id: fid }).select('*').single() as any);
  set({ children: [...state.children, row] });
  return row;
}
export async function updateChild(id: string, patch: Partial<Pick<Child, 'name' | 'birth_year' | 'avatar' | 'daily_limit_min'>>) {
  await q(supabase.from('hz_children').update(patch).eq('id', id) as any);
  set({ children: state.children.map(c => (c.id === id ? { ...c, ...patch } : c)) });
}
export async function deleteChild(id: string) {
  await q(supabase.from('hz_children').delete().eq('id', id) as any);
  set({ children: state.children.filter(c => c.id !== id) });
}
export async function newChildCode(id: string) {
  const code = await q<string>(supabase.rpc('hz_new_child_code', { p_child: id }) as any);
  set({ children: state.children.map(c => (c.id === id ? { ...c, join_code: code } : c)) });
  return code;
}

// ───────── screen time ─────────
export function openSession(childId: string) {
  return state.sessions.find(s => s.child_id === childId && !s.ended_at && s.source === 'timer');
}
export async function startSession(childId: string) {
  const existing = openSession(childId);
  if (existing) return existing;
  const row = await q<Session>(
    supabase.from('hz_sessions').insert({ family_id: state.member!.family_id, child_id: childId, source: 'timer' }).select('id,child_id,started_at,ended_at,minutes,source').single() as any,
  );
  set({ sessions: [row, ...state.sessions] });
  return row;
}
export async function stopSession(id: string) {
  const s = state.sessions.find(x => x.id === id);
  if (!s) return;
  const ended = new Date();
  const minutes = Math.max(1, Math.min(1440, Math.round((ended.getTime() - new Date(s.started_at).getTime()) / 60000)));
  await q(supabase.from('hz_sessions').update({ ended_at: ended.toISOString(), minutes }).eq('id', id) as any);
  set({ sessions: state.sessions.map(x => (x.id === id ? { ...x, ended_at: ended.toISOString(), minutes } : x)) });
}
export async function addManualMinutes(childId: string, minutes: number) {
  const row = await q<Session>(
    supabase
      .from('hz_sessions')
      .insert({ family_id: state.member!.family_id, child_id: childId, source: 'manual', minutes, ended_at: new Date().toISOString() })
      .select('id,child_id,started_at,ended_at,minutes,source')
      .single() as any,
  );
  set({ sessions: [row, ...state.sessions] });
}
export async function deleteSession(id: string) {
  await q(supabase.from('hz_sessions').delete().eq('id', id) as any);
  set({ sessions: state.sessions.filter(s => s.id !== id) });
}

// ───────── activities ─────────
export async function logActivity(childId: string, a: { id: string; title: string; minutes: number; points: number }) {
  const isParent = state.member?.role === 'parent';
  const row = await q<ActivityLog>(
    supabase
      .from('hz_activity_logs')
      .insert({
        family_id: state.member!.family_id,
        child_id: childId,
        activity_id: a.id,
        title: a.title,
        minutes: a.minutes,
        points: a.points,
        status: isParent ? 'approved' : 'pending',
      })
      .select('id,child_id,activity_id,title,minutes,points,status,created_at')
      .single() as any,
  );
  set({ logs: [row, ...state.logs] });
  return row;
}
export async function setLogStatus(id: string, status: 'approved' | 'rejected') {
  await q(supabase.from('hz_activity_logs').update({ status }).eq('id', id) as any);
  set({ logs: state.logs.map(l => (l.id === id ? { ...l, status } : l)) });
}

// ───────── rewards ─────────
export async function addReward(r: { title: string; emoji: string; cost: number }) {
  const row = await q<Reward>(supabase.from('hz_rewards').insert({ ...r, family_id: state.member!.family_id }).select('id,title,emoji,cost').single() as any);
  set({ rewards: [...state.rewards, row].sort((a, b) => a.cost - b.cost) });
}
export async function deleteReward(id: string) {
  await q(supabase.from('hz_rewards').delete().eq('id', id) as any);
  set({ rewards: state.rewards.filter(r => r.id !== id) });
}
export async function redeem(childId: string, r: Reward) {
  const row = await q<Redemption>(
    supabase
      .from('hz_redemptions')
      .insert({ family_id: state.member!.family_id, child_id: childId, reward_id: r.id, title: `${r.emoji} ${r.title}`, cost: r.cost, status: 'pending' })
      .select('*')
      .single() as any,
  );
  set({ redemptions: [row, ...state.redemptions] });
}
export async function setRedemptionStatus(id: string, status: 'approved' | 'rejected') {
  await q(supabase.from('hz_redemptions').update({ status }).eq('id', id) as any);
  set({ redemptions: state.redemptions.map(r => (r.id === id ? { ...r, status } : r)) });
}

// ───────── shop ─────────
const FALLBACK_PRODUCTS: Product[] = [
  { id: 'local-veg', name: 'Grow-Your-Own Veggie Kit', description: 'Coco-peat discs, 4 seed packets (tomato, chilli, spinach, coriander), biodegradable pots and a picture guide.', category: 'Gardening', emoji: '🍅', image_url: null, price_inr: 499, mrp_inr: 649, age_label: '5+ yrs' },
  { id: 'local-tools', name: 'Kids Garden Tool Set', description: 'Child-sized trowel, rake, watering can and gloves.', category: 'Gardening', emoji: '🪴', image_url: null, price_inr: 699, mrp_inr: 899, age_label: '4+ yrs' },
  { id: 'local-micro', name: 'Microgreens Starter Kit', description: 'Grow mustard, methi and radish microgreens on a windowsill in 7 days.', category: 'Gardening', emoji: '🌱', image_url: null, price_inr: 349, mrp_inr: 449, age_label: '4+ yrs' },
  { id: 'local-butterfly', name: 'Butterfly Garden Seed Mix', description: 'Marigold, zinnia and cosmos seeds that attract butterflies and bees.', category: 'Gardening', emoji: '🌼', image_url: null, price_inr: 199, mrp_inr: 249, age_label: '3+ yrs' },
  { id: 'local-clay', name: 'Clay Modelling Kit', description: 'Air-dry clay in 8 colours with shaping tools.', category: 'Craft', emoji: '🎨', image_url: null, price_inr: 399, mrp_inr: 499, age_label: '4+ yrs' },
  { id: 'local-sci', name: 'Junior Science Lab', description: '20 safe experiments: volcano, crystals, magnets and more.', category: 'Science', emoji: '🔬', image_url: null, price_inr: 899, mrp_inr: 1199, age_label: '7+ yrs' },
  { id: 'local-games', name: 'Family Board Game Pack', description: 'Three classic board games for screen-free family evenings.', category: 'Family', emoji: '🎲', image_url: null, price_inr: 799, mrp_inr: 999, age_label: '5+ yrs' },
  { id: 'local-journal', name: 'Story & Drawing Journal', description: 'Prompts to write stories and draw — one page a day.', category: 'Reading', emoji: '📓', image_url: null, price_inr: 249, mrp_inr: 299, age_label: '6+ yrs' },
];

/** Shop catalogue from the database; falls back to the built-in list if offline or not set up. */
export async function fetchProducts(): Promise<Product[]> {
  try {
    const timeout = new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000));
    const rows = await Promise.race([
      q<Product[]>(
        supabase.from('hz_products').select('id,name,description,category,emoji,image_url,price_inr,mrp_inr,age_label').eq('active', true).order('sort') as any,
      ),
      timeout,
    ]);
    return rows.length ? rows : FALLBACK_PRODUCTS;
  } catch {
    return FALLBACK_PRODUCTS;
  }
}
export type CartLine = { id: string; name: string; emoji: string; price_inr: number; qty: number };
export async function placeOrder(o: { items: CartLine[]; name: string; phone: string; address: string; pincode: string; note: string }) {
  await ensureAuth();
  const bytes = Crypto.getRandomBytes(6);
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'HZO-';
  for (let i = 0; i < 6; i++) code += A[bytes[i] % A.length];
  const total = o.items.reduce((s, l) => s + l.price_inr * l.qty, 0);
  await q(
    supabase.from('hz_orders').insert({
      order_code: code,
      items: o.items,
      total_inr: total,
      name: o.name.trim(),
      phone: o.phone.trim(),
      address: o.address.trim(),
      pincode: o.pincode.trim(),
      note: o.note.trim() || null,
    }) as any,
  );
  return { code, total };
}

// ───────── demo data (web preview only: add ?demo=parent or ?demo=kid to the URL) ─────────
export function loadDemo(role: 'parent' | 'kid') {
  const now = Date.now();
  const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
  const D = 86400000;
  const children: Child[] = [
    { id: 'c1', family_id: 'f', name: 'Aarav', birth_year: new Date().getFullYear() - 8, avatar: '🦊', daily_limit_min: 90, join_code: 'K7M2QX', created_at: iso(20 * D) },
    { id: 'c2', family_id: 'f', name: 'Meera', birth_year: new Date().getFullYear() - 4, avatar: '🦋', daily_limit_min: 60, join_code: 'P3RT8B', created_at: iso(20 * D) },
  ];
  const sessions: Session[] = [];
  const mins = [70, 85, 60, 95, 40, 75];
  mins.forEach((m, i) => sessions.push({ id: 's' + i, child_id: 'c1', started_at: iso((i + 1) * D), ended_at: iso((i + 1) * D - m * 60000), minutes: m, source: 'timer' }));
  [45, 50, 30, 55, 65, 20].forEach((m, i) => sessions.push({ id: 't' + i, child_id: 'c2', started_at: iso((i + 1) * D), ended_at: iso((i + 1) * D), minutes: m, source: 'manual' }));
  sessions.unshift({ id: 'r1', child_id: 'c1', started_at: iso(35 * 60000), ended_at: null, minutes: null, source: 'timer' });
  sessions.unshift({ id: 'r0', child_id: 'c1', started_at: iso(3 * 3600000), ended_at: iso(3 * 3600000 - 20 * 60000), minutes: 20, source: 'timer' });
  sessions.unshift({ id: 'm0', child_id: 'c2', started_at: iso(2 * 3600000), ended_at: iso(2 * 3600000), minutes: 25, source: 'manual' });
  const logs: ActivityLog[] = [
    { id: 'l1', child_id: 'c1', activity_id: 'g-seeds', title: 'Plant seeds in a cup', minutes: 20, points: 20, status: 'pending', created_at: iso(3600000) },
    { id: 'l2', child_id: 'c1', activity_id: 'g-water', title: 'Water the plants', minutes: 10, points: 10, status: 'approved', created_at: iso(D) },
    { id: 'l3', child_id: 'c1', activity_id: 'r-read', title: 'Read for 20 minutes', minutes: 20, points: 20, status: 'approved', created_at: iso(2 * D) },
    { id: 'l4', child_id: 'c1', activity_id: 'o-walk', title: 'Nature walk & spot 10 things', minutes: 30, points: 25, status: 'approved', created_at: iso(3 * D) },
    { id: 'l5', child_id: 'c1', activity_id: 'g-microgreens', title: 'Grow microgreens', minutes: 25, points: 25, status: 'approved', created_at: iso(4 * D) },
    { id: 'l6', child_id: 'c2', activity_id: 'r-story', title: 'Story time with family', minutes: 15, points: 15, status: 'approved', created_at: iso(D) },
  ];
  const rewards: Reward[] = [
    { id: 'w1', title: 'Extra bedtime story', emoji: '📚', cost: 20 },
    { id: 'w2', title: 'Park trip', emoji: '🏞️', cost: 50 },
    { id: 'w3', title: 'Pick a new plant', emoji: '🌳', cost: 80 },
  ];
  const redemptions: Redemption[] = [{ id: 'd1', child_id: 'c1', reward_id: 'w1', title: '📚 Extra bedtime story', cost: 20, status: 'pending', created_at: iso(1800000) }];
  set({
    ready: true,
    userId: 'demo',
    member: role === 'parent' ? { user_id: 'demo', family_id: 'f', role: 'parent', child_id: null, name: 'Priya Kumar' } : { user_id: 'demo', family_id: 'f', role: 'child', child_id: 'c1', name: 'Aarav' },
    family: { id: 'f', name: 'The Kumars', parent_code: 'FAM4KZ' },
    children,
    sessions,
    logs,
    rewards,
    redemptions,
    error: null,
  });
}

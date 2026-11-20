import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ring, WeekBars } from '../../components/charts';
import { Button, Card, Notice, Section, Stepper, success, tap } from '../../components/ui';
import { useTick } from '../../components/useTick';
import { ageFromBirthYear, bandFor, BADGES } from '../../lib/content';
import {
  addManualMinutes,
  deleteChild,
  deleteSession,
  friendlyError,
  newChildCode,
  openSession,
  startSession,
  stopSession,
  updateChild,
  useFamily,
} from '../../lib/family';
import { earnedBadges, fmtDate, fmtMin, fmtTime, points, sessionMinutes, streak, todayMinutes, weekly } from '../../lib/stats';
import { C, R } from '../../lib/theme';

export default function ChildDetail() {
  const { id, fresh } = useLocalSearchParams<{ id: string; fresh?: string }>();
  const insets = useSafeAreaInsets();
  const st = useFamily();
  const now = useTick(10000);
  const child = st.children.find(c => c.id === id);
  const [limit, setLimit] = useState(child?.daily_limit_min ?? 60);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (child) setLimit(child.daily_limit_min);
  }, [child?.daily_limit_min]);

  if (!child) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Child not found.</Text>
        <Button title="Back" onPress={() => router.back()} style={{ marginTop: 12 }} />
      </View>
    );
  }

  const age = ageFromBirthYear(child.birth_year);
  const used = todayMinutes(st.sessions, child.id, now);
  const running = openSession(child.id);
  const sk = streak(child, st.sessions);
  const pts = points(child.id, st.logs, st.redemptions);
  const badges = earnedBadges(child, st.logs, st.sessions);
  const week = weekly(st.sessions, child.id);
  const weekTotal = week.reduce((a, d) => a + d.minutes, 0);
  const recent = st.sessions.filter(x => x.child_id === child.id).slice(0, 8);
  const acts = st.logs.filter(l => l.child_id === child.id).slice(0, 8);

  const run = async (fn: () => Promise<any>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      Alert.alert('Sorry', friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const shareCode = () =>
    Share.share({
      message: `Hi ${child.name}! Open the Healzo app, tap “I’m a child” and enter this code: ${child.join_code}`,
    }).catch(() => {});

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.paper }} contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
      <View style={[s.head, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={s.back} hitSlop={10} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={22} color={C.ink} />
        </Pressable>
        <View style={{ alignItems: 'center', marginTop: 4 }}>
          <Ring used={used} limit={child.daily_limit_min} size={170} stroke={14}>
            <Text style={{ fontSize: 44 }}>{child.avatar}</Text>
            <Text style={s.ringBig}>{fmtMin(used)}</Text>
            <Text style={s.ringSmall}>of {fmtMin(child.daily_limit_min)} today</Text>
          </Ring>
          <Text style={s.name}>{child.name}</Text>
          <Text style={s.meta}>
            {age} yrs · 🔥 {sk}-day streak · ⭐ {pts} points
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          {running ? (
            <Button title={`Stop timer (${fmtMin(sessionMinutes(running, now))})`} variant="danger" icon="stop-circle" loading={busy} onPress={() => run(() => stopSession(running.id))} style={{ flex: 1 }} />
          ) : (
            <Button title="Start screen timer" icon="play" loading={busy} onPress={() => run(() => startSession(child.id))} style={{ flex: 1 }} />
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' }}>
          <Text style={s.quickLabel}>Add time used:</Text>
          {[15, 30, 60].map(m => (
            <Button key={m} small variant="secondary" title={`+${m}m`} onPress={() => run(async () => { await addManualMinutes(child.id, m); success(); })} />
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        {fresh ? <Notice tone="sun" icon="phone-portrait-outline" text={`${child.name} has been added! Now link their phone or tablet using the code below.`} /> : null}

        <Section title="Link their device" />
        <Card>
          <Text style={s.cardText}>On {child.name}’s phone or tablet, install Healzo, tap “I’m a child” and enter:</Text>
          <Pressable
            onPress={async () => {
              await Clipboard.setStringAsync(child.join_code);
              tap();
              setCopied(true);
            }}
            style={s.codeBox}
          >
            <Text style={s.code}>{child.join_code}</Text>
            <Text style={s.copy}>{copied ? 'Copied ✓' : 'Tap to copy'}</Text>
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title="Share code" variant="secondary" icon="share-social-outline" onPress={shareCode} style={{ flex: 1 }} small />
            <Button
              title="New code"
              variant="ghost"
              icon="refresh"
              small
              onPress={() =>
                Alert.alert('Make a new code?', 'The old code will stop working. Devices already linked stay linked.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'New code', onPress: () => run(() => newChildCode(child.id)) },
                ])
              }
            />
          </View>
        </Card>

        <Section title="This week" />
        <Card>
          <WeekBars data={week} limit={child.daily_limit_min} />
          <Text style={s.weekSum}>
            Total {fmtMin(weekTotal)} · average {fmtMin(Math.round(weekTotal / 7))} a day
          </Text>
        </Card>

        <Section title="Daily limit" />
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{limit === 0 ? 'No screen time' : fmtMin(limit)}</Text>
              <Text style={s.cardText}>Recreational screen time per day</Text>
            </View>
            <Stepper value={limit} onChange={setLimit} step={15} min={0} max={300} format={v => (v === 0 ? '0' : fmtMin(v))} />
          </View>
          {limit !== child.daily_limit_min ? (
            <Button title="Save limit" icon="checkmark" loading={busy} onPress={() => run(async () => { await updateChild(child.id, { daily_limit_min: limit }); success(); })} style={{ marginTop: 14 }} />
          ) : null}
          <Notice tone="sun" icon="medkit-outline" text={`IAP guidance for ${bandFor(age).label}: ${bandFor(age).limit}.`} />
        </Card>

        <Section title="Badges" />
        <View style={s.badges}>
          {BADGES.map(b => {
            const got = badges.has(b.id);
            return (
              <View key={b.id} style={[s.badge, !got && { opacity: 0.35 }]}>
                <Text style={{ fontSize: 28 }}>{b.emoji}</Text>
                <Text style={s.badgeTitle}>{b.title}</Text>
              </View>
            );
          })}
        </View>

        <Section title="Recent activities" />
        {acts.length ? (
          acts.map(l => (
            <View key={l.id} style={s.listRow}>
              <Text style={{ fontSize: 18 }}>{l.status === 'approved' ? '✅' : l.status === 'pending' ? '⏳' : '✖️'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.listTitle}>{l.title}</Text>
                <Text style={s.listMeta}>
                  {fmtDate(l.created_at)} · +{l.points} pts · {l.status}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={s.none}>No activities yet. Suggest one from the Activities tab!</Text>
        )}

        <Section title="Screen-time log" />
        {recent.length ? (
          recent.map(x => (
            <Pressable
              key={x.id}
              onLongPress={() =>
                Alert.alert('Delete this entry?', '', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => run(() => deleteSession(x.id)) },
                ])
              }
              style={s.listRow}
            >
              <Text style={{ fontSize: 18 }}>{x.ended_at ? '📱' : '🔴'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.listTitle}>
                  {fmtMin(sessionMinutes(x, now))} {x.source === 'manual' ? '(added)' : x.ended_at ? '' : '— running'}
                </Text>
                <Text style={s.listMeta}>
                  {fmtDate(x.started_at)} · {fmtTime(x.started_at)}
                </Text>
              </View>
            </Pressable>
          ))
        ) : (
          <Text style={s.none}>Nothing logged yet.</Text>
        )}
        {recent.length ? <Text style={s.none}>Long-press an entry to delete it.</Text> : null}

        <Button
          title={`Remove ${child.name}`}
          variant="danger"
          icon="trash-outline"
          style={{ marginTop: 24 }}
          onPress={() =>
            Alert.alert(`Remove ${child.name}?`, 'All their screen time, activities and rewards will be deleted. This cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Remove',
                style: 'destructive',
                onPress: () =>
                  run(async () => {
                    await deleteChild(child.id);
                    router.back();
                  }),
              },
            ])
          }
        />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  head: { backgroundColor: C.white, paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, borderBottomWidth: 1, borderColor: C.line },
  back: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center' },
  ringBig: { fontSize: 22, fontWeight: '900', color: C.ink, marginTop: 2 },
  ringSmall: { fontSize: 11.5, color: C.muted },
  name: { fontSize: 26, fontWeight: '900', color: C.ink, marginTop: 12, letterSpacing: -0.6 },
  meta: { color: C.muted, fontSize: 13.5, marginTop: 4 },
  quickLabel: { color: C.muted, fontSize: 12.5, flex: 1 },
  cardText: { color: C.muted, fontSize: 13, lineHeight: 19 },
  cardTitle: { fontSize: 20, fontWeight: '900', color: C.ink },
  codeBox: { alignItems: 'center', paddingVertical: 16, marginVertical: 14, borderRadius: R.lg, borderWidth: 2, borderStyle: 'dashed', borderColor: '#9ED8CF', backgroundColor: C.mintSoft },
  code: { fontSize: 34, fontWeight: '900', letterSpacing: 6, color: C.navy },
  copy: { color: C.teal, fontWeight: '700', fontSize: 12, marginTop: 4 },
  weekSum: { color: C.muted, fontSize: 12.5, marginTop: 10 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: { width: '31%', alignItems: 'center', backgroundColor: C.white, borderRadius: R.md, paddingVertical: 12, borderWidth: 1, borderColor: C.line },
  badgeTitle: { fontSize: 11.5, fontWeight: '700', color: C.ink, marginTop: 4, textAlign: 'center' },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.white, borderRadius: R.md, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: C.line },
  listTitle: { fontWeight: '700', color: C.ink, fontSize: 14 },
  listMeta: { color: C.muted, fontSize: 12, marginTop: 2 },
  none: { color: C.muted, fontSize: 12.5, textAlign: 'center', marginTop: 4 },
});

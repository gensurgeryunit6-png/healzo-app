import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ring } from '../../components/charts';
import { Button, success, tap } from '../../components/ui';
import { useTick } from '../../components/useTick';
import { activitiesForAge, ageFromBirthYear, catInfo, gardenStage } from '../../lib/content';
import { friendlyError, openSession, refresh, startSession, stopSession, useFamily } from '../../lib/family';
import { cancelTimerAlerts, scheduleTimerAlerts } from '../../lib/notify';
import { fmtMin, points, sessionMinutes, streak, todayMinutes } from '../../lib/stats';
import { C, R, shadow } from '../../lib/theme';

export default function ChildToday() {
  const insets = useSafeAreaInsets();
  const st = useFamily();
  const now = useTick(5000);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const child = st.children.find(c => c.id === st.member?.child_id);
  const age = child ? ageFromBirthYear(child.birth_year) : null;
  const ideas = useMemo(() => activitiesForAge(age), [age]);
  const idea = ideas.length ? ideas[(new Date().getDate() + new Date().getHours()) % ideas.length] : null;

  if (!child) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 40 }}>🤔</Text>
        <Text style={{ color: C.muted, textAlign: 'center', marginTop: 10 }}>We couldn’t find your profile. Ask your parent to check the code.</Text>
        <Button title="Try again" onPress={() => refresh()} style={{ marginTop: 14 }} />
      </View>
    );
  }

  const used = todayMinutes(st.sessions, child.id, now);
  const left = child.daily_limit_min - used;
  const running = openSession(child.id);
  const sk = streak(child, st.sessions);
  const pts = points(child.id, st.logs, st.redemptions);
  const stage = gardenStage(sk);
  const pending = st.logs.filter(l => l.child_id === child.id && l.status === 'pending').length;

  const start = async () => {
    if (left <= 0) {
      Alert.alert('No screen time left today', 'You’ve used today’s screen time. How about an activity instead? 🌱', [
        { text: 'Show ideas', onPress: () => router.push('/kid/activities') },
        { text: 'OK' },
      ]);
      return;
    }
    setBusy(true);
    try {
      await startSession(child.id);
      scheduleTimerAlerts(left, child.name);
      tap();
    } catch (e) {
      Alert.alert('Sorry', friendlyError(e));
    } finally {
      setBusy(false);
    }
  };
  const stop = async () => {
    if (!running) return;
    setBusy(true);
    try {
      await stopSession(running.id);
      cancelTimerAlerts();
      success();
    } catch (e) {
      Alert.alert('Sorry', friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const ringColorBg = left < 0 ? C.coralSoft : running ? C.skySoft : C.leafSoft;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.paper }}
      contentContainerStyle={{ paddingBottom: 30 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await refresh();
            setRefreshing(false);
          }}
        />
      }
    >
      <View style={[s.hero, { paddingTop: insets.top + 16, backgroundColor: ringColorBg }]}>
        <Text style={s.hi}>
          Hi {child.name}! {child.avatar}
        </Text>
        <View style={{ alignItems: 'center', marginTop: 14 }}>
          <Ring used={used} limit={child.daily_limit_min} size={220} stroke={18}>
            {left >= 0 ? (
              <>
                <Text style={s.big}>{fmtMin(left)}</Text>
                <Text style={s.bigSub}>screen time left</Text>
              </>
            ) : (
              <>
                <Text style={[s.big, { color: C.coral }]}>{fmtMin(-left)}</Text>
                <Text style={s.bigSub}>over today’s limit</Text>
              </>
            )}
            {running ? <Text style={s.live}>● on screen {fmtMin(sessionMinutes(running, now))}</Text> : null}
          </Ring>
        </View>
        {running ? (
          <Button title="I’m done with screens" variant="leaf" icon="checkmark-circle" loading={busy} onPress={stop} style={{ marginTop: 18 }} />
        ) : (
          <Button title="Start screen time" icon="play" loading={busy} onPress={start} style={{ marginTop: 18 }} />
        )}
        <Text style={s.helper}>{running ? 'We’ll remind you 5 minutes before time’s up.' : 'Press start when you use a phone, tablet or TV for fun.'}</Text>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: -22 }}>
          <Stat emoji="🔥" value={`${sk}`} label={`day streak`} bg={C.sunSoft} />
          <Stat emoji="⭐" value={`${pts}`} label="points" bg={C.grapeSoft} />
          <Pressable style={{ flex: 1 }} onPress={() => router.push('/kid/garden')}>
            <Stat emoji={stage.emoji} value={stage.label} label="my garden" bg={C.leafSoft} small />
          </Pressable>
        </View>

        {pending ? (
          <View style={s.pending}>
            <Text style={s.pendingText}>
              ⏳ {pending} activit{pending > 1 ? 'ies' : 'y'} waiting for your parent to approve
            </Text>
          </View>
        ) : null}

        {idea ? (
          <>
            <Text style={s.h2}>Try this instead 💡</Text>
            <Pressable
              onPress={() => {
                tap();
                router.push({ pathname: '/activity/[id]', params: { id: idea.id } });
              }}
              style={[s.idea, { backgroundColor: catInfo(idea.category).bg }]}
            >
              <Text style={{ fontSize: 44 }}>{idea.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.ideaTitle}>{idea.title}</Text>
                <Text style={s.ideaText}>{idea.summary}</Text>
                <Text style={[s.ideaPts, { color: catInfo(idea.category).color }]}>
                  +{idea.points} points · {idea.minutes} min
                </Text>
              </View>
            </Pressable>
          </>
        ) : null}

        <Button title="More fun ideas" variant="secondary" icon="rocket-outline" onPress={() => router.push('/kid/activities')} style={{ marginTop: 12 }} />
      </View>
    </ScrollView>
  );
}

function Stat({ emoji, value, label, bg, small }: { emoji: string; value: string; label: string; bg: string; small?: boolean }) {
  return (
    <View style={[s.stat, { backgroundColor: C.white }]}>
      <View style={[s.statIcon, { backgroundColor: bg }]}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
      <Text style={[s.statVal, small && { fontSize: 13, textAlign: 'center' }]} numberOfLines={small ? 2 : 1}>
        {value}
      </Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 40, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  hi: { fontSize: 24, fontWeight: '900', color: C.ink, letterSpacing: -0.5 },
  big: { fontSize: 38, fontWeight: '900', color: C.ink, letterSpacing: -1 },
  bigSub: { fontSize: 13, color: C.muted, fontWeight: '600' },
  live: { marginTop: 6, color: C.coral, fontWeight: '800', fontSize: 12 },
  helper: { textAlign: 'center', color: C.muted, fontSize: 12.5, marginTop: 10 },
  stat: { flex: 1, borderRadius: R.lg, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: C.line, ...shadow },
  statIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 20, fontWeight: '900', color: C.ink, marginTop: 6 },
  statLabel: { fontSize: 11, color: C.muted, fontWeight: '600' },
  pending: { backgroundColor: C.sunSoft, borderRadius: R.md, padding: 12, marginTop: 14 },
  pendingText: { color: '#7A5B00', fontWeight: '700', fontSize: 13 },
  h2: { fontSize: 19, fontWeight: '900', color: C.ink, marginTop: 24, marginBottom: 10 },
  idea: { flexDirection: 'row', gap: 14, alignItems: 'center', borderRadius: R.xl, padding: 16 },
  ideaTitle: { fontSize: 17, fontWeight: '900', color: C.ink },
  ideaText: { fontSize: 13, color: '#3E5464', marginTop: 3, lineHeight: 18 },
  ideaPts: { fontSize: 12.5, fontWeight: '800', marginTop: 6 },
});

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ring } from '../../components/charts';
import { Button, Card, Empty, Section, tap } from '../../components/ui';
import { useTick } from '../../components/useTick';
import { ageFromBirthYear, TIPS } from '../../lib/content';
import { openSession, refresh, useFamily } from '../../lib/family';
import { fmtMin, points, streak, todayMinutes } from '../../lib/stats';
import { C, R, shadow } from '../../lib/theme';

export default function ParentHome() {
  const insets = useSafeAreaInsets();
  const st = useFamily();
  const now = useTick();
  const [refreshing, setRefreshing] = useState(false);
  const pendingLogs = st.logs.filter(l => l.status === 'pending').length;
  const pendingRed = st.redemptions.filter(r => r.status === 'pending').length;
  const tip = TIPS[new Date().getDate() % TIPS.length];
  const first = (st.member?.name ?? '').trim().split(/\s+/)[0];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.paper }}
      contentContainerStyle={{ paddingBottom: 30 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          tintColor={C.white}
          onRefresh={async () => {
            setRefreshing(true);
            await refresh();
            setRefreshing(false);
          }}
        />
      }
    >
      <View style={[s.hero, { paddingTop: insets.top + 16 }]}>
        <Text style={s.hello}>Hello{first ? `, ${first}` : ''} 👋</Text>
        <Text style={s.family}>{st.family?.name ?? 'Your family'}</Text>
        <Text style={s.heroSub}>Today’s screen time at a glance</Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: -26 }}>
        {pendingLogs + pendingRed > 0 ? (
          <Pressable onPress={() => router.push('/parent/rewards')}>
            <View style={s.pending}>
              <Text style={{ fontSize: 22 }}>🔔</Text>
              <Text style={s.pendingText}>
                {pendingLogs ? `${pendingLogs} activit${pendingLogs > 1 ? 'ies' : 'y'} to approve` : ''}
                {pendingLogs && pendingRed ? ' · ' : ''}
                {pendingRed ? `${pendingRed} reward request${pendingRed > 1 ? 's' : ''}` : ''}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={C.navy} />
            </View>
          </Pressable>
        ) : null}

        {st.children.length === 0 ? (
          <View style={{ marginTop: 14 }}>
            <Empty emoji="🧒" title="Add your first child" text="Set a kind daily limit based on their age. Then link their phone or tablet with a simple code.">
              <Button title="Add a child" icon="add" onPress={() => router.push('/add-child')} style={{ marginTop: 12, alignSelf: 'stretch' }} />
            </Empty>
          </View>
        ) : (
          st.children.map(c => {
            const used = todayMinutes(st.sessions, c.id, now);
            const running = !!openSession(c.id);
            const left = c.daily_limit_min - used;
            const sk = streak(c, st.sessions);
            const pts = points(c.id, st.logs, st.redemptions);
            return (
              <Pressable
                key={c.id}
                onPress={() => {
                  tap();
                  router.push({ pathname: '/child/[id]', params: { id: c.id } });
                }}
                style={({ pressed }) => [s.childCard, pressed && { opacity: 0.92 }]}
              >
                <Ring used={used} limit={c.daily_limit_min} size={92} stroke={9}>
                  <Text style={{ fontSize: 34 }}>{c.avatar}</Text>
                </Ring>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={s.childName}>{c.name}</Text>
                    <Text style={s.age}>{ageFromBirthYear(c.birth_year)} yrs</Text>
                  </View>
                  <Text style={[s.usage, left < 0 && { color: C.coral }]}>
                    {fmtMin(used)} of {fmtMin(c.daily_limit_min)}
                    {left < 0 ? ` · ${fmtMin(-left)} over` : ` · ${fmtMin(left)} left`}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {running ? <Tag text="● On screen now" color={C.coral} bg={C.coralSoft} /> : null}
                    <Tag text={`🔥 ${sk} day${sk === 1 ? '' : 's'}`} color="#9A5B00" bg={C.sunSoft} />
                    <Tag text={`⭐ ${pts} pts`} color={C.grape} bg={C.grapeSoft} />
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={C.muted} />
              </Pressable>
            );
          })
        )}

        {st.children.length > 0 ? (
          <Button title="Add another child" variant="secondary" icon="add" onPress={() => router.push('/add-child')} style={{ marginTop: 12 }} />
        ) : null}

        <Section title="Tip of the day" action="All tips" onAction={() => router.push('/tips')} />
        <Card style={{ flexDirection: 'row', gap: 12 }}>
          <Text style={{ fontSize: 30 }}>{tip.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.tipTitle}>{tip.title}</Text>
            <Text style={s.tipBody}>{tip.body}</Text>
          </View>
        </Card>

        <Section title="Try something new" action="See all" onAction={() => router.push('/parent/activities')} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Quick emoji="🌱" title="Gardening guides" onPress={() => router.push('/guides')} bg={C.leafSoft} />
          <Quick emoji="🛍️" title="Activity kits" onPress={() => router.push('/parent/shop')} bg={C.sunSoft} />
        </View>
      </View>
    </ScrollView>
  );
}

function Tag({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>
      <Text style={{ color, fontSize: 11.5, fontWeight: '700' }}>{text}</Text>
    </View>
  );
}

function Quick({ emoji, title, onPress, bg }: { emoji: string; title: string; onPress: () => void; bg: string }) {
  return (
    <Pressable onPress={() => { tap(); onPress(); }} style={[s.quick, { backgroundColor: bg }]}>
      <Text style={{ fontSize: 30 }}>{emoji}</Text>
      <Text style={s.quickTitle}>{title}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  hero: { backgroundColor: C.navy, paddingHorizontal: 20, paddingBottom: 46, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  hello: { color: '#B9D3DC', fontSize: 14 },
  family: { color: C.white, fontSize: 28, fontWeight: '900', letterSpacing: -0.8, marginTop: 4 },
  heroSub: { color: '#9FC0CC', fontSize: 13, marginTop: 4 },
  pending: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.sun, borderRadius: R.lg, padding: 14, marginBottom: 12, ...shadow },
  pendingText: { flex: 1, fontWeight: '800', color: C.navy, fontSize: 14 },
  childCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.white, borderRadius: R.xl, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: C.line, ...shadow },
  childName: { fontSize: 19, fontWeight: '900', color: C.ink },
  age: { fontSize: 12, color: C.muted, fontWeight: '600' },
  usage: { fontSize: 13.5, color: C.ink, marginTop: 4, fontWeight: '600' },
  tipTitle: { fontWeight: '800', color: C.ink, fontSize: 15 },
  tipBody: { color: C.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  quick: { flex: 1, borderRadius: R.lg, padding: 16, gap: 10 },
  quickTitle: { fontWeight: '800', color: C.ink, fontSize: 14.5 },
});

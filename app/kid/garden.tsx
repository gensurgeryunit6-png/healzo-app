import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, H1, tap } from '../../components/ui';
import { ACTIVITIES, GARDEN_STAGES, gardenStage } from '../../lib/content';
import { useFamily } from '../../lib/family';
import { streak } from '../../lib/stats';
import { C, R } from '../../lib/theme';

export default function Garden() {
  const insets = useSafeAreaInsets();
  const st = useFamily();
  const child = st.children.find(c => c.id === st.member?.child_id);
  if (!child) return null;
  const sk = streak(child, st.sessions);
  const stage = gardenStage(sk);
  const doneIds = new Set(st.logs.filter(l => l.child_id === child.id && l.status === 'approved').map(l => l.activity_id));
  const gardenActs = ACTIVITIES.filter(a => a.category === 'Gardening');
  // flowers: one per approved gardening activity (max 12)
  const flowers = Math.min(12, st.logs.filter(l => l.child_id === child.id && l.status === 'approved' && l.activity_id.startsWith('g-')).length);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.paper }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: 30 }}>
      <H1 eyebrow="GROWS WITH YOUR STREAK" title="My garden" sub="Stay within your screen time each day and watch your plant grow. Real gardening jobs add flowers!" />

      <View style={s.plot}>
        <Text style={s.sun}>☀️</Text>
        <Text style={{ fontSize: 110, textAlign: 'center' }}>{stage.emoji}</Text>
        <View style={s.soil}>
          <Text style={{ fontSize: 22, letterSpacing: 2, textAlign: 'center' }}>{flowers ? '🌷'.repeat(flowers) : ' '}</Text>
        </View>
      </View>
      <Text style={s.stage}>
        {stage.label} · 🔥 {sk}-day streak
      </Text>
      <Text style={s.next}>{stage.next}</Text>

      <View style={s.stages}>
        {GARDEN_STAGES.map(g => (
          <View key={g.min} style={[s.stageDot, sk >= g.min && { backgroundColor: C.leafSoft, borderColor: C.leaf }]}>
            <Text style={{ fontSize: 22, opacity: sk >= g.min ? 1 : 0.35 }}>{g.emoji}</Text>
            <Text style={s.stageDay}>{g.min}d</Text>
          </View>
        ))}
      </View>

      <Text style={s.h2}>Real gardening jobs 🌱</Text>
      {gardenActs.map(a => (
        <Pressable
          key={a.id}
          onPress={() => {
            tap();
            router.push({ pathname: '/activity/[id]', params: { id: a.id } });
          }}
          style={s.job}
        >
          <Text style={{ fontSize: 26 }}>{a.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.jobTitle}>{a.title}</Text>
            <Text style={s.jobMeta}>+{a.points} points</Text>
          </View>
          {doneIds.has(a.id) ? <Text style={{ fontSize: 18 }}>✅</Text> : null}
        </Pressable>
      ))}
      <Button title="Gardening guides" variant="leaf" icon="book-outline" onPress={() => router.push('/guides')} style={{ marginTop: 10 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  plot: { marginTop: 16, borderRadius: R.xl, backgroundColor: '#DDF3FF', paddingTop: 30, overflow: 'hidden' },
  sun: { position: 'absolute', top: 12, right: 16, fontSize: 34 },
  soil: { backgroundColor: '#8B5E3C', paddingVertical: 14, marginTop: -6 },
  stage: { textAlign: 'center', fontSize: 20, fontWeight: '900', color: C.ink, marginTop: 14 },
  next: { textAlign: 'center', color: C.muted, marginTop: 4 },
  stages: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  stageDot: { width: 50, alignItems: 'center', paddingVertical: 6, borderRadius: 14, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.white },
  stageDay: { fontSize: 10.5, color: C.muted, fontWeight: '700' },
  h2: { fontSize: 19, fontWeight: '900', color: C.ink, marginTop: 26, marginBottom: 10 },
  job: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.white, borderRadius: R.lg, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.line },
  jobTitle: { fontWeight: '800', color: C.ink },
  jobMeta: { color: C.leaf, fontWeight: '700', fontSize: 12.5, marginTop: 2 },
});

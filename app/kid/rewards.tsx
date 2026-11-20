import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Empty, H1, Section, success } from '../../components/ui';
import { BADGES } from '../../lib/content';
import { friendlyError, redeem, useFamily } from '../../lib/family';
import { earnedBadges, fmtDate, points } from '../../lib/stats';
import { C, R } from '../../lib/theme';

export default function ChildRewards() {
  const insets = useSafeAreaInsets();
  const st = useFamily();
  const [busy, setBusy] = useState<string | null>(null);
  const child = st.children.find(c => c.id === st.member?.child_id);
  if (!child) return null;
  const pts = points(child.id, st.logs, st.redemptions);
  const badges = earnedBadges(child, st.logs, st.sessions);
  const mine = st.redemptions.filter(r => r.child_id === child.id).slice(0, 10);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.paper }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: 30 }}>
      <H1 eyebrow="YOUR TREASURE" title="Rewards" />
      <View style={s.points}>
        <Text style={{ fontSize: 40 }}>⭐</Text>
        <View>
          <Text style={s.pointsVal}>{pts}</Text>
          <Text style={s.pointsLabel}>points to spend</Text>
        </View>
      </View>

      <Section title="Choose a reward" />
      {st.rewards.length === 0 ? (
        <Empty emoji="🎁" title="No rewards yet" text="Ask your parent to add some rewards in their Healzo app!" />
      ) : (
        st.rewards.map(r => {
          const can = pts >= r.cost;
          return (
            <View key={r.id} style={s.reward}>
              <Text style={{ fontSize: 30 }}>{r.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.rTitle}>{r.title}</Text>
                <Text style={s.rCost}>{r.cost} points</Text>
                {!can ? (
                  <View style={s.bar}>
                    <View style={[s.fill, { width: `${Math.min(100, (pts / r.cost) * 100)}%` }]} />
                  </View>
                ) : null}
              </View>
              <Button
                small
                variant={can ? 'sun' : 'secondary'}
                title={can ? 'Get it!' : `${r.cost - pts} to go`}
                disabled={!can}
                loading={busy === r.id}
                onPress={() =>
                  Alert.alert(`Spend ${r.cost} points?`, `${r.emoji} ${r.title} — your parent will say yes or no.`, [
                    { text: 'Not now', style: 'cancel' },
                    {
                      text: 'Yes!',
                      onPress: async () => {
                        setBusy(r.id);
                        try {
                          await redeem(child.id, r);
                          success();
                        } catch (e) {
                          Alert.alert('Sorry', friendlyError(e));
                        } finally {
                          setBusy(null);
                        }
                      },
                    },
                  ])
                }
              />
            </View>
          );
        })
      )}

      {mine.length ? (
        <>
          <Section title="My requests" />
          {mine.map(r => (
            <View key={r.id} style={s.req}>
              <Text style={{ flex: 1, fontWeight: '700', color: C.ink }}>{r.title}</Text>
              <Text style={{ color: r.status === 'approved' ? C.leaf : r.status === 'rejected' ? C.danger : C.muted, fontWeight: '800', fontSize: 12.5 }}>
                {r.status === 'approved' ? 'Yes! 🎉' : r.status === 'rejected' ? 'Not this time' : 'Waiting…'} · {fmtDate(r.created_at)}
              </Text>
            </View>
          ))}
        </>
      ) : null}

      <Section title="My badges" />
      <View style={s.badges}>
        {BADGES.map(b => {
          const got = badges.has(b.id);
          return (
            <View key={b.id} style={[s.badge, !got && { opacity: 0.35 }]}>
              <Text style={{ fontSize: 32 }}>{b.emoji}</Text>
              <Text style={s.bTitle}>{b.title}</Text>
              <Text style={s.bDesc}>{b.desc}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  points: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.grape, borderRadius: R.xl, padding: 18, marginTop: 12 },
  pointsVal: { fontSize: 34, fontWeight: '900', color: C.white },
  pointsLabel: { color: '#E3DAFB', fontWeight: '600' },
  reward: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.white, borderRadius: R.lg, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.line },
  rTitle: { fontWeight: '800', color: C.ink, fontSize: 15 },
  rCost: { color: C.grape, fontWeight: '700', fontSize: 12.5, marginTop: 2 },
  bar: { height: 6, backgroundColor: C.grapeSoft, borderRadius: 3, marginTop: 6, overflow: 'hidden' },
  fill: { height: 6, backgroundColor: C.grape },
  req: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.white, borderRadius: R.md, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: C.line },
  badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  badge: { width: '48.5%', backgroundColor: C.white, borderRadius: R.lg, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.line },
  bTitle: { fontWeight: '800', color: C.ink, marginTop: 6 },
  bDesc: { color: C.muted, fontSize: 11.5, textAlign: 'center', marginTop: 2 },
});

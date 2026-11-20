import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Field, H1, Section, Stepper, success, tap } from '../../components/ui';
import { addReward, deleteReward, friendlyError, setLogStatus, setRedemptionStatus, useFamily } from '../../lib/family';
import { fmtDate, points } from '../../lib/stats';
import { C, R } from '../../lib/theme';

const EMOJIS = ['🎁', '🍦', '🏞️', '🎬', '📚', '🍕', '🎨', '⚽', '🧸', '🌳', '🛝', '⭐'];
const SUGGESTIONS = [
  { title: 'Extra bedtime story', emoji: '📚', cost: 20 },
  { title: 'Choose dinner', emoji: '🍕', cost: 40 },
  { title: 'Park trip', emoji: '🏞️', cost: 50 },
  { title: 'Ice cream treat', emoji: '🍦', cost: 60 },
  { title: 'Pick a new plant', emoji: '🌳', cost: 80 },
];

export default function ParentRewards() {
  const insets = useSafeAreaInsets();
  const st = useFamily();
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('🎁');
  const [cost, setCost] = useState(50);
  const [busy, setBusy] = useState(false);
  const childName = (id: string) => {
    const c = st.children.find(x => x.id === id);
    return c ? `${c.avatar} ${c.name}` : 'Child';
  };
  const pendingLogs = st.logs.filter(l => l.status === 'pending');
  const pendingRed = st.redemptions.filter(r => r.status === 'pending');

  const run = async (fn: () => Promise<any>) => {
    setBusy(true);
    try {
      await fn();
      success();
    } catch (e) {
      Alert.alert('Sorry', friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.paper }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
      <H1 eyebrow="CELEBRATE WINS" title="Rewards" sub="Approve screen-free activities and reward requests. Points add up as children swap screens for real-world fun." />

      <Section title={`To approve${pendingLogs.length + pendingRed.length ? ` (${pendingLogs.length + pendingRed.length})` : ''}`} />
      {pendingLogs.length + pendingRed.length === 0 ? (
        <Text style={s.none}>All caught up! 🎉</Text>
      ) : null}
      {pendingLogs.map(l => (
        <View key={l.id} style={s.item}>
          <Text style={{ fontSize: 22 }}>✅</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.itemTitle}>{l.title}</Text>
            <Text style={s.itemMeta}>
              {childName(l.child_id)} · {fmtDate(l.created_at)} · +{l.points} pts
            </Text>
          </View>
          <Pressable onPress={() => run(() => setLogStatus(l.id, 'rejected'))} style={[s.round, { backgroundColor: C.dangerSoft }]} accessibilityLabel="Reject">
            <Ionicons name="close" size={20} color={C.danger} />
          </Pressable>
          <Pressable onPress={() => run(() => setLogStatus(l.id, 'approved'))} style={[s.round, { backgroundColor: C.leaf }]} accessibilityLabel="Approve">
            <Ionicons name="checkmark" size={20} color={C.white} />
          </Pressable>
        </View>
      ))}
      {pendingRed.map(r => (
        <View key={r.id} style={[s.item, { borderColor: '#F3DEA0' }]}>
          <Text style={{ fontSize: 22 }}>🎁</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.itemTitle}>{r.title}</Text>
            <Text style={s.itemMeta}>
              {childName(r.child_id)} wants this · {r.cost} pts
            </Text>
          </View>
          <Pressable onPress={() => run(() => setRedemptionStatus(r.id, 'rejected'))} style={[s.round, { backgroundColor: C.dangerSoft }]} accessibilityLabel="Decline">
            <Ionicons name="close" size={20} color={C.danger} />
          </Pressable>
          <Pressable onPress={() => run(() => setRedemptionStatus(r.id, 'approved'))} style={[s.round, { backgroundColor: C.leaf }]} accessibilityLabel="Give reward">
            <Ionicons name="checkmark" size={20} color={C.white} />
          </Pressable>
        </View>
      ))}

      {st.children.length ? (
        <>
          <Section title="Points" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {st.children.map(c => (
              <View key={c.id} style={s.pointCard}>
                <Text style={{ fontSize: 26 }}>{c.avatar}</Text>
                <Text style={s.pointName}>{c.name}</Text>
                <Text style={s.pointVal}>⭐ {points(c.id, st.logs, st.redemptions)}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      <Section title="Family rewards" />
      {st.rewards.length === 0 ? <Text style={s.none}>No rewards yet — add one or tap a suggestion.</Text> : null}
      {st.rewards.map(r => (
        <View key={r.id} style={s.item}>
          <Text style={{ fontSize: 24 }}>{r.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.itemTitle}>{r.title}</Text>
            <Text style={s.itemMeta}>{r.cost} points</Text>
          </View>
          <Pressable
            onPress={() =>
              Alert.alert('Delete reward?', r.title, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => run(() => deleteReward(r.id)) },
              ])
            }
            hitSlop={10}
          >
            <Ionicons name="trash-outline" size={20} color={C.muted} />
          </Pressable>
        </View>
      ))}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ marginVertical: 6 }}>
        {SUGGESTIONS.filter(x => !st.rewards.some(r => r.title === x.title)).map(x => (
          <Pressable key={x.title} onPress={() => { tap(); run(() => addReward(x)); }} style={s.suggest}>
            <Text style={s.suggestText}>
              + {x.emoji} {x.title} · {x.cost}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Card style={{ marginTop: 10 }}>
        <Text style={s.cardTitle}>Create your own</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }} style={{ marginVertical: 10 }}>
          {EMOJIS.map(e => (
            <Pressable key={e} onPress={() => { tap(); setEmoji(e); }} style={[s.emoji, emoji === e && { borderColor: C.teal, backgroundColor: C.mintSoft }]}>
              <Text style={{ fontSize: 22 }}>{e}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Field label="Reward" value={title} onChangeText={setTitle} placeholder="e.g. Movie night with popcorn" maxLength={80} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Text style={s.cardTitle}>Cost</Text>
          <Stepper value={cost} onChange={setCost} step={10} min={10} max={1000} format={v => `${v} pts`} />
        </View>
        <Button
          title="Add reward"
          icon="add"
          loading={busy}
          disabled={!title.trim()}
          onPress={() =>
            run(async () => {
              await addReward({ title: title.trim(), emoji, cost });
              setTitle('');
            })
          }
        />
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  none: { color: C.muted, fontSize: 13 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.white, borderRadius: R.md, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: C.line },
  itemTitle: { fontWeight: '800', color: C.ink, fontSize: 14.5 },
  itemMeta: { color: C.muted, fontSize: 12, marginTop: 2 },
  round: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  pointCard: { width: '31%', backgroundColor: C.white, borderRadius: R.md, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: C.line },
  pointName: { fontWeight: '700', color: C.ink, marginTop: 4 },
  pointVal: { color: C.grape, fontWeight: '900', marginTop: 2 },
  suggest: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 99, backgroundColor: C.sunSoft, borderWidth: 1, borderColor: '#F3DEA0' },
  suggestText: { color: '#7A5B00', fontWeight: '700', fontSize: 13 },
  cardTitle: { fontWeight: '800', color: C.ink, fontSize: 15 },
  emoji: { width: 44, height: 44, borderRadius: 12, borderWidth: 2, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
});

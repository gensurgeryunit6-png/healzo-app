import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Notice, success } from '../../components/ui';
import { activityById, catInfo } from '../../lib/content';
import { friendlyError, logActivity, useFamily } from '../../lib/family';
import { C, R } from '../../lib/theme';

export default function ActivityDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const a = activityById(String(id));
  const insets = useSafeAreaInsets();
  const st = useFamily();
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);

  if (!a) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Activity not found.</Text>
        <Button title="Back" onPress={() => router.back()} style={{ marginTop: 12 }} />
      </View>
    );
  }
  const ci = catInfo(a.category);
  const isChild = st.member?.role === 'child';
  const targets = isChild ? st.children.filter(c => c.id === st.member?.child_id) : st.children;

  const mark = async (childId: string) => {
    setBusy(childId);
    try {
      await logActivity(childId, a);
      success();
      setDone(d => [...d, childId]);
    } catch (e) {
      Alert.alert('Sorry', friendlyError(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <View style={[s.head, { backgroundColor: ci.bg, paddingTop: insets.top + 10 }]}>
          <Pressable onPress={() => router.back()} style={s.back} hitSlop={10} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={22} color={C.ink} />
          </Pressable>
          <Text style={{ fontSize: 64, marginTop: 10 }}>{a.emoji}</Text>
          <Text style={s.title}>{a.title}</Text>
          <Text style={s.summary}>{a.summary}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <Meta text={a.category} color={ci.color} />
            <Meta text={`⏱ ${a.minutes} min`} />
            <Meta text={`⭐ ${a.points} points`} />
            <Meta text={`Ages ${a.minAge}–${a.maxAge}`} />
          </View>
        </View>

        <View style={{ padding: 20 }}>
          <Text style={s.h2}>How to do it</Text>
          {a.steps.map((stp, i) => (
            <View key={i} style={s.step}>
              <View style={[s.num, { backgroundColor: ci.bg }]}>
                <Text style={[s.numText, { color: ci.color }]}>{i + 1}</Text>
              </View>
              <Text style={s.stepText}>{stp}</Text>
            </View>
          ))}

          <Text style={[s.h2, { marginTop: 20 }]}>{isChild ? 'Finished?' : 'Mark as done'}</Text>
          {targets.length === 0 ? (
            <Text style={{ color: C.muted }}>Add a child first to track activities.</Text>
          ) : (
            targets.map(c =>
              done.includes(c.id) ? (
                <Notice
                  key={c.id}
                  tone="mint"
                  icon="checkmark-circle"
                  text={isChild ? `Awesome, ${c.name}! Your parent will approve it and you’ll get ${a.points} points. 🎉` : `Added for ${c.name} — +${a.points} points!`}
                />
              ) : (
                <Button
                  key={c.id}
                  title={isChild ? `I did it! (+${a.points} pts)` : `Done by ${c.avatar} ${c.name}`}
                  variant={isChild ? 'leaf' : 'secondary'}
                  icon="checkmark-done"
                  loading={busy === c.id}
                  onPress={() => mark(c.id)}
                  style={{ marginBottom: 10 }}
                />
              ),
            )
          )}
          <Notice text="Safety first: younger children should do activities with an adult nearby, especially with water, tools or the kitchen." />
        </View>
      </ScrollView>
    </View>
  );
}

function Meta({ text, color }: { text: string; color?: string }) {
  return (
    <View style={{ backgroundColor: C.white, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: color ?? C.ink }}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  head: { paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  back: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 27, fontWeight: '900', color: C.ink, marginTop: 8, letterSpacing: -0.6 },
  summary: { fontSize: 15, color: '#3E5464', marginTop: 6, lineHeight: 21 },
  h2: { fontSize: 18, fontWeight: '800', color: C.ink, marginBottom: 12 },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: C.white, borderRadius: R.md, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: C.line },
  num: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  numText: { fontWeight: '900' },
  stepText: { flex: 1, fontSize: 14.5, color: C.ink, lineHeight: 21, marginTop: 3 },
});

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ACTIVITIES, CATEGORIES, catInfo, Category } from '../lib/content';
import { C, R } from '../lib/theme';
import { Chip, tap } from './ui';

export function ActivityLibrary({ age, header }: { age: number | null; header?: React.ReactNode }) {
  const [cat, setCat] = useState<Category | 'All'>('All');
  const list = useMemo(
    () => ACTIVITIES.filter(a => (cat === 'All' || a.category === cat) && (age == null || (age >= a.minAge && age <= a.maxAge))),
    [cat, age],
  );
  return (
    <View>
      {header}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }} style={{ marginVertical: 12 }}>
        <Chip label="All" active={cat === 'All'} onPress={() => setCat('All')} />
        {CATEGORIES.map(c => (
          <Chip key={c.key} label={c.key} emoji={c.emoji} active={cat === c.key} onPress={() => setCat(c.key)} />
        ))}
      </ScrollView>

      {cat === 'Gardening' || cat === 'All' ? (
        <Pressable onPress={() => { tap(); router.push('/guides'); }} style={s.guides}>
          <Text style={{ fontSize: 30 }}>🪴</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.guidesTitle}>Gardening guides</Text>
            <Text style={s.guidesText}>Step-by-step: microgreens, tomatoes, coriander, compost & more</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={C.leaf} />
        </Pressable>
      ) : null}

      {list.map(a => {
        const ci = catInfo(a.category);
        return (
          <Pressable
            key={a.id}
            onPress={() => {
              tap();
              router.push({ pathname: '/activity/[id]', params: { id: a.id } });
            }}
            style={({ pressed }) => [s.card, pressed && { opacity: 0.9 }]}
          >
            <View style={[s.icon, { backgroundColor: ci.bg }]}>
              <Text style={{ fontSize: 26 }}>{a.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{a.title}</Text>
              <Text style={s.summary} numberOfLines={2}>
                {a.summary}
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                <Text style={[s.meta, { color: ci.color }]}>{a.category}</Text>
                <Text style={s.meta}>⏱ {a.minutes} min</Text>
                <Text style={s.meta}>⭐ {a.points}</Text>
              </View>
            </View>
          </Pressable>
        );
      })}
      {!list.length ? <Text style={{ color: C.muted, textAlign: 'center', marginTop: 20 }}>No activities in this group for this age.</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  guides: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.leafSoft, borderRadius: R.lg, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#CBEBD3' },
  guidesTitle: { fontWeight: '900', color: '#235E35', fontSize: 15 },
  guidesText: { color: '#3D7A50', fontSize: 12.5, marginTop: 2 },
  card: { flexDirection: 'row', gap: 12, backgroundColor: C.white, borderRadius: R.lg, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: C.line },
  icon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '800', fontSize: 15, color: C.ink },
  summary: { color: C.muted, fontSize: 12.5, marginTop: 2, lineHeight: 17 },
  meta: { fontSize: 11.5, color: C.muted, fontWeight: '700' },
});

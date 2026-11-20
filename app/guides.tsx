import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tap } from '../components/ui';
import { GARDEN_GUIDES } from '../lib/content';
import { useFamily } from '../lib/family';
import { C, R } from '../lib/theme';

export default function Guides() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<string | null>(null);
  const isParent = useFamily().member?.role === 'parent';
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={s.back} hitSlop={10} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={22} color={C.ink} />
        </Pressable>
        <View>
          <Text style={s.title}>Gardening guides 🪴</Text>
          <Text style={s.sub}>Easy projects to grow with your child</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30 }}>
        {GARDEN_GUIDES.map(g => {
          const isOpen = open === g.id;
          return (
            <View key={g.id} style={s.card}>
              <Pressable
                onPress={() => {
                  tap();
                  setOpen(isOpen ? null : g.id);
                }}
                style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}
              >
                <View style={s.icon}>
                  <Text style={{ fontSize: 28 }}>{g.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.gTitle}>{g.title}</Text>
                  <Text style={s.gMeta}>
                    {g.level} · {g.time}
                  </Text>
                </View>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={C.muted} />
              </Pressable>
              {isOpen ? (
                <View style={{ marginTop: 14 }}>
                  <Text style={s.intro}>{g.intro}</Text>
                  <Text style={s.h3}>You need</Text>
                  {g.youNeed.map(n => (
                    <Text key={n} style={s.li}>
                      • {n}
                    </Text>
                  ))}
                  <Text style={s.h3}>Steps</Text>
                  {g.steps.map((stp, i) => (
                    <Text key={i} style={s.li}>
                      {i + 1}. {stp}
                    </Text>
                  ))}
                  <View style={s.tip}>
                    <Text style={s.tipText}>💡 {g.tip}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          );
        })}
        {isParent ? (
        <Pressable onPress={() => router.push('/parent/shop')} style={s.shop}>
          <Text style={{ fontSize: 24 }}>🛍️</Text>
          <Text style={s.shopText}>Need seeds or tools? See gardening kits in the Shop</Text>
        </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 14, backgroundColor: C.leafSoft },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '900', color: '#235E35' },
  sub: { fontSize: 12.5, color: '#3D7A50', marginTop: 2 },
  card: { backgroundColor: C.white, borderRadius: R.lg, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.line },
  icon: { width: 52, height: 52, borderRadius: 16, backgroundColor: C.leafSoft, alignItems: 'center', justifyContent: 'center' },
  gTitle: { fontWeight: '800', fontSize: 15, color: C.ink },
  gMeta: { color: C.muted, fontSize: 12.5, marginTop: 2 },
  intro: { color: C.ink, fontSize: 14, lineHeight: 20 },
  h3: { fontWeight: '800', color: C.ink, marginTop: 12, marginBottom: 4 },
  li: { color: '#3E5464', fontSize: 14, lineHeight: 22 },
  tip: { backgroundColor: C.sunSoft, borderRadius: R.md, padding: 12, marginTop: 12 },
  tipText: { color: '#7A5B00', fontSize: 13, lineHeight: 19 },
  shop: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 14, borderRadius: R.lg, backgroundColor: C.sunSoft, marginTop: 8 },
  shopText: { flex: 1, color: '#7A5B00', fontWeight: '700' },
});

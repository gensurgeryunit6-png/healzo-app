import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IAP_BANDS, TIPS } from '../lib/content';
import { C, R } from '../lib/theme';

export default function Tips() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={s.back} hitSlop={10} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={22} color={C.ink} />
        </Pressable>
        <Text style={s.title}>Expert tips</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30 }}>
        <Text style={s.h2}>How much screen time?</Text>
        <Text style={s.src}>Indian Academy of Pediatrics guidelines (2022)</Text>
        {IAP_BANDS.map(b => (
          <View key={b.label} style={s.band}>
            <View style={{ flex: 1 }}>
              <Text style={s.bandLabel}>{b.label}</Text>
              <Text style={s.bandDetail}>{b.detail}</Text>
            </View>
            <Text style={s.bandLimit}>{b.limit}</Text>
          </View>
        ))}

        <Text style={[s.h2, { marginTop: 24 }]}>Everyday tips</Text>
        {TIPS.map(t => (
          <View key={t.id} style={s.tip}>
            <Text style={{ fontSize: 28 }}>{t.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.tipTitle}>{t.title}</Text>
              <Text style={s.tipBody}>{t.body}</Text>
            </View>
          </View>
        ))}
        <Text style={s.disclaimer}>
          General guidance for families, not medical advice. If you are worried about your child’s sleep, behaviour, eyesight or development, please speak to your paediatrician.
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.line },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 19, fontWeight: '900', color: C.ink },
  h2: { fontSize: 19, fontWeight: '900', color: C.ink },
  src: { fontSize: 12, color: C.muted, marginTop: 2, marginBottom: 12 },
  band: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.white, borderRadius: R.md, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.line },
  bandLabel: { fontWeight: '800', color: C.ink, fontSize: 14.5 },
  bandDetail: { color: C.muted, fontSize: 12.5, marginTop: 3, lineHeight: 17 },
  bandLimit: { fontWeight: '900', color: C.teal, fontSize: 13, maxWidth: 110, textAlign: 'right' },
  tip: { flexDirection: 'row', gap: 12, backgroundColor: C.white, borderRadius: R.lg, padding: 14, marginTop: 10, borderWidth: 1, borderColor: C.line },
  tipTitle: { fontWeight: '800', color: C.ink, fontSize: 15 },
  tipBody: { color: C.muted, fontSize: 13.5, lineHeight: 20, marginTop: 3 },
  disclaimer: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 20, textAlign: 'center' },
});

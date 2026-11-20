import { StyleSheet, Text, View } from 'react-native';
import { C } from '../lib/theme';

export function Logo({ dark }: { dark?: boolean }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={[s.mark, dark && { backgroundColor: C.navy }]}>
        <Text style={[s.markText, dark && { color: C.mint }]}>h</Text>
        <View style={s.dot} />
      </View>
      <Text style={[s.name, dark && { color: C.navy }]}>healzo</Text>
      <Text style={[s.tag, dark && { color: C.muted }]}>LESS SCREEN · MORE LIFE</Text>
    </View>
  );
}

const s = StyleSheet.create({
  mark: { width: 76, height: 76, borderRadius: 24, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' },
  markText: { fontSize: 50, fontWeight: '900', color: C.navy, marginTop: -8 },
  dot: { position: 'absolute', top: 14, right: 12, width: 12, height: 12, borderRadius: 6, backgroundColor: C.teal },
  name: { color: C.white, fontSize: 34, fontWeight: '900', letterSpacing: -1, marginTop: 14 },
  tag: { color: '#A9C6D2', fontSize: 10, letterSpacing: 2, fontWeight: '700', marginTop: 4 },
});

import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui';
import { load, useFamily } from '../lib/family';
import { C } from '../lib/theme';

export default function Gate() {
  const st = useFamily();

  if (!st.ready) {
    return (
      <View style={s.wrap}>
        <Logo />
        <ActivityIndicator color={C.mint} style={{ marginTop: 28 }} />
      </View>
    );
  }

  if (st.error && !st.member) {
    return (
      <View style={s.wrap}>
        <Logo />
        <Text style={s.err}>{st.error}</Text>
        <Button title="Try again" variant="sun" icon="refresh" onPress={() => load()} style={{ marginTop: 18, alignSelf: 'center' }} />
      </View>
    );
  }

  if (!st.member) return <Redirect href="/welcome" />;
  return <Redirect href={st.member.role === 'parent' ? '/parent' : '/kid'} />;
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center', padding: 28 },
  mark: { width: 76, height: 76, borderRadius: 24, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' },
  markText: { fontSize: 50, fontWeight: '900', color: C.navy, marginTop: -8 },
  dot: { position: 'absolute', top: 14, right: 12, width: 12, height: 12, borderRadius: 6, backgroundColor: C.teal },
  name: { color: C.white, fontSize: 34, fontWeight: '900', letterSpacing: -1, marginTop: 14 },
  tag: { color: '#A9C6D2', fontSize: 10, letterSpacing: 2, fontWeight: '700', marginTop: 4 },
  err: { color: '#FFD9CF', textAlign: 'center', marginTop: 26, fontSize: 14.5, lineHeight: 21 },
});

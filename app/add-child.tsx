import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Field, Notice, Stepper, tap } from '../components/ui';
import { bandFor, suggestedLimit } from '../lib/content';
import { addChild, friendlyError } from '../lib/family';
import { fmtMin } from '../lib/stats';
import { AVATARS, C, R } from '../lib/theme';

export default function AddChild() {
  const insets = useSafeAreaInsets();
  const thisYear = new Date().getFullYear();
  const [name, setName] = useState('');
  const [age, setAge] = useState(6);
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [limit, setLimit] = useState(suggestedLimit(6));
  const [touchedLimit, setTouchedLimit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!touchedLimit) setLimit(suggestedLimit(age));
  }, [age, touchedLimit]);

  const band = bandFor(age);
  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      const c = await addChild({ name: name.trim(), birth_year: thisYear - age, avatar, daily_limit_min: limit });
      router.replace({ pathname: '/child/[id]', params: { id: c.id, fresh: '1' } });
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.white }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[s.header, { paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 10 }]}>
        <Text style={s.headerTitle}>Add a child</Text>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.close} accessibilityLabel="Close">
          <Ionicons name="close" size={22} color={C.ink} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30 }} keyboardShouldPersistTaps="handled">
        <Field label="Child’s name" icon="person-outline" value={name} onChangeText={setName} placeholder="e.g. Aarav" maxLength={40} />

        <Text style={s.label}>Pick an avatar</Text>
        <View style={s.avatars}>
          {AVATARS.map(a => (
            <Pressable key={a} onPress={() => { tap(); setAvatar(a); }} style={[s.avatar, avatar === a && { borderColor: C.teal, backgroundColor: C.mintSoft }]}>
              <Text style={{ fontSize: 28 }}>{a}</Text>
            </Pressable>
          ))}
        </View>

        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Age</Text>
            <Text style={s.hint}>Born around {thisYear - age}</Text>
          </View>
          <Stepper value={age} onChange={setAge} step={1} min={1} max={17} format={v => `${v} yrs`} />
        </View>

        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Daily screen limit</Text>
            <Text style={s.hint}>Recreational screen time</Text>
          </View>
          <Stepper value={limit} onChange={v => { setTouchedLimit(true); setLimit(v); }} step={15} min={0} max={300} format={v => (v === 0 ? 'None' : fmtMin(v))} />
        </View>

        <Notice
          tone="sun"
          icon="medkit-outline"
          text={`Indian Academy of Pediatrics, ${band.label}: ${band.limit}. ${band.detail}`}
        />

        <Button title="Add child" icon="checkmark" loading={busy} disabled={!name.trim()} onPress={save} style={{ marginTop: 20 }} />
        {err ? <Notice tone="coral" icon="alert-circle-outline" text={err} /> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.line },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.ink },
  close: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '700', color: C.ink, marginBottom: 4 },
  hint: { fontSize: 12, color: C.muted },
  avatars: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6, marginBottom: 18 },
  avatar: { width: 52, height: 52, borderRadius: 16, borderWidth: 2, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderTopWidth: 1, borderTopColor: C.line },
});

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '../components/Logo';
import { Button, Field, Notice, tap } from '../components/ui';
import { createFamily, friendlyError, joinAsChild, joinAsParent } from '../lib/family';
import { C, R } from '../lib/theme';

type Step = 'choose' | 'parent-new' | 'parent-join' | 'child';

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('choose');
  const [familyName, setFamilyName] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const go = async (fn: () => Promise<void>) => {
    setErr(null);
    setBusy(true);
    try {
      await fn();
      router.replace('/');
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const back = () => {
    tap();
    setErr(null);
    setStep('choose');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.navy }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 22, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 30 }} keyboardShouldPersistTaps="handled">
        <Logo />
        {step === 'choose' ? (
          <>
            <Text style={s.title}>Grow healthy screen habits — together.</Text>
            <Text style={s.lead}>Set kind limits, swap screens for play and gardening, and celebrate every screen-free win.</Text>

            <Choice
              emoji="👩‍👧"
              title="I’m a parent"
              text="Create your family and add your children"
              onPress={() => setStep('parent-new')}
            />
            <Choice emoji="🧒" title="I’m a child" text="Join with the code your parent gives you" onPress={() => setStep('child')} />
            <Pressable onPress={() => setStep('parent-join')} style={{ alignSelf: 'center', padding: 14 }}>
              <Text style={s.linkLight}>Joining as a second parent? Use a family code</Text>
            </Pressable>
          </>
        ) : (
          <View style={s.sheet}>
            <Pressable onPress={back} style={s.back} hitSlop={10} accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={20} color={C.ink} />
            </Pressable>

            {step === 'parent-new' ? (
              <>
                <Text style={s.sheetTitle}>Create your family</Text>
                <Text style={s.sheetText}>No email or password needed. You’ll add children next.</Text>
                <Field label="Your name" icon="person-outline" value={name} onChangeText={setName} placeholder="e.g. Priya" maxLength={60} autoComplete="name" />
                <Field label="Family name" icon="home-outline" value={familyName} onChangeText={setFamilyName} placeholder="e.g. The Kumars" maxLength={80} />
                <Button title="Create family" icon="arrow-forward" loading={busy} disabled={name.trim().length < 1} onPress={() => go(() => createFamily(familyName || `${name.trim()}'s family`, name))} />
              </>
            ) : step === 'parent-join' ? (
              <>
                <Text style={s.sheetTitle}>Join as a parent</Text>
                <Text style={s.sheetText}>Ask the other parent for the family code in Healzo → More.</Text>
                <Field label="Your name" icon="person-outline" value={name} onChangeText={setName} placeholder="e.g. Ravi" maxLength={60} />
                <Field label="Family code" icon="key-outline" value={code} onChangeText={t => setCode(t.toUpperCase())} placeholder="6 letters" autoCapitalize="characters" autoCorrect={false} maxLength={6} />
                <Button title="Join family" icon="arrow-forward" loading={busy} disabled={code.trim().length !== 6 || !name.trim()} onPress={() => go(() => joinAsParent(code, name))} />
              </>
            ) : (
              <>
                <Text style={s.sheetTitle}>Hi there! 👋</Text>
                <Text style={s.sheetText}>Type the 6-letter code from your parent’s Healzo app.</Text>
                <Field label="Your code" icon="key-outline" value={code} onChangeText={t => setCode(t.toUpperCase())} placeholder="ABC123" autoCapitalize="characters" autoCorrect={false} maxLength={6} />
                <Button title="Let’s go!" variant="leaf" icon="rocket-outline" loading={busy} disabled={code.trim().length !== 6} onPress={() => go(() => joinAsChild(code))} />
              </>
            )}
            {err ? <Notice tone="coral" icon="alert-circle-outline" text={err} /> : null}
          </View>
        )}
        <Text style={s.foot}>Healzo helps families build habits. It is not medical advice.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Choice({ emoji, title, text, onPress }: { emoji: string; title: string; text: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [s.choice, pressed && { transform: [{ scale: 0.98 }] }]}
    >
      <Text style={{ fontSize: 34 }}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.choiceTitle}>{title}</Text>
        <Text style={s.choiceText}>{text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={C.navy} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  title: { color: C.white, fontSize: 26, fontWeight: '900', textAlign: 'center', marginTop: 34, letterSpacing: -0.6, lineHeight: 31 },
  lead: { color: '#B9D3DC', fontSize: 15, textAlign: 'center', marginTop: 10, lineHeight: 22, marginBottom: 26 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.white, borderRadius: R.xl, padding: 18, marginTop: 12 },
  choiceTitle: { fontSize: 18, fontWeight: '900', color: C.ink },
  choiceText: { fontSize: 13, color: C.muted, marginTop: 3 },
  linkLight: { color: C.mint, fontWeight: '700', fontSize: 13.5, textAlign: 'center' },
  sheet: { backgroundColor: C.white, borderRadius: R.xl, padding: 20, marginTop: 30 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 23, fontWeight: '900', color: C.ink, letterSpacing: -0.5 },
  sheetText: { fontSize: 14, color: C.muted, marginTop: 6, marginBottom: 18, lineHeight: 20 },
  foot: { color: '#86A6B4', fontSize: 11.5, textAlign: 'center', marginTop: 'auto', paddingTop: 30 },
});

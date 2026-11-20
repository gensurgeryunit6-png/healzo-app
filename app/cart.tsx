import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Field, Notice, success, tap } from '../components/ui';
import { cartTotal, clearCart, inr, setQty, useCart } from '../lib/cart';
import { friendlyError, placeOrder, useFamily } from '../lib/family';
import { C, R } from '../lib/theme';

export default function Cart() {
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const st = useFamily();
  const [name, setName] = useState(st.member?.name ?? '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ code: string; total: number } | null>(null);

  const digits = phone.replace(/\D/g, '');
  const errors = {
    name: name.trim().length < 2 ? 'Enter your name' : undefined,
    phone: /^(91|0)?[6-9]\d{9}$/.test(digits) ? undefined : 'Enter a valid 10-digit mobile number',
    address: address.trim().length < 10 ? 'Enter your full address' : undefined,
    pincode: /^\d{6}$/.test(pincode) ? undefined : 'Enter a 6-digit PIN code',
  };
  const valid = !errors.name && !errors.phone && !errors.address && !errors.pincode && cart.length > 0;

  const submit = async () => {
    setTouched(true);
    if (!valid) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await placeOrder({ items: cart, name, phone: digits.slice(-10), address, pincode, note });
      success();
      clearCart();
      setDone(r);
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <View style={[s.wrap, { paddingTop: insets.top + 40, padding: 24, alignItems: 'center' }]}>
        <Text style={{ fontSize: 64 }}>🎉</Text>
        <Text style={s.doneTitle}>Order placed!</Text>
        <Text style={s.doneText}>Our team will call you to confirm delivery. Pay {inr(done.total)} on delivery.</Text>
        <View style={s.codeBox}>
          <Text style={s.codeLabel}>ORDER NUMBER</Text>
          <Text style={s.code}>{done.code}</Text>
        </View>
        <Button title="Share order number" variant="secondary" icon="share-social-outline" onPress={() => Share.share({ message: `My Healzo order: ${done.code}` }).catch(() => {})} style={{ alignSelf: 'stretch', marginTop: 20 }} />
        <Button title="Done" onPress={() => router.back()} style={{ alignSelf: 'stretch', marginTop: 10 }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={s.wrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[s.header, { paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 10 }]}>
        <Text style={s.headerTitle}>Your bag</Text>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.close} accessibilityLabel="Close">
          <Ionicons name="close" size={22} color={C.ink} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30 }} keyboardShouldPersistTaps="handled">
        {cart.length === 0 ? <Text style={{ color: C.muted, textAlign: 'center', marginTop: 20 }}>Your bag is empty.</Text> : null}
        {cart.map(l => (
          <View key={l.id} style={s.line}>
            <Text style={{ fontSize: 28 }}>{l.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.lineName}>{l.name}</Text>
              <Text style={s.linePrice}>
                {inr(l.price_inr)} × {l.qty} = {inr(l.price_inr * l.qty)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pressable onPress={() => { tap(); setQty(l.id, l.qty - 1); }} style={s.q} accessibilityLabel="Remove one">
                <Ionicons name={l.qty === 1 ? 'trash-outline' : 'remove'} size={16} color={C.navy} />
              </Pressable>
              <Text style={{ fontWeight: '800', minWidth: 16, textAlign: 'center' }}>{l.qty}</Text>
              <Pressable onPress={() => { tap(); setQty(l.id, l.qty + 1); }} style={s.q} accessibilityLabel="Add one">
                <Ionicons name="add" size={16} color={C.navy} />
              </Pressable>
            </View>
          </View>
        ))}
        {cart.length ? (
          <View style={s.total}>
            <Text style={s.totalLabel}>Total (pay on delivery)</Text>
            <Text style={s.totalVal}>{inr(cartTotal(cart))}</Text>
          </View>
        ) : null}

        <Text style={s.h2}>Delivery details</Text>
        <Field label="Name" icon="person-outline" value={name} onChangeText={setName} placeholder="Full name" maxLength={120} error={touched ? errors.name : undefined} />
        <Field label="Mobile number" icon="call-outline" value={phone} onChangeText={setPhone} placeholder="98765 43210" keyboardType="phone-pad" maxLength={14} error={touched ? errors.phone : undefined} />
        <Field label="Address" icon="home-outline" value={address} onChangeText={setAddress} placeholder="House no., street, area, city" multiline maxLength={500} error={touched ? errors.address : undefined} />
        <Field label="PIN code" icon="location-outline" value={pincode} onChangeText={t => setPincode(t.replace(/\D/g, '').slice(0, 6))} placeholder="605001" keyboardType="number-pad" maxLength={6} error={touched ? errors.pincode : undefined} />
        <Field label="Note (optional)" value={note} onChangeText={setNote} placeholder="Landmark or best time to deliver" maxLength={300} />
        <Button title={`Place order · ${inr(cartTotal(cart))}`} icon="checkmark" loading={busy} disabled={!cart.length} onPress={submit} />
        {err ? <Notice tone="coral" icon="alert-circle-outline" text={err} /> : null}
        <Notice text="Cash on delivery. Our team will call to confirm your order before dispatch." />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.line },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.ink },
  close: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center' },
  line: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line },
  lineName: { fontWeight: '800', color: C.ink },
  linePrice: { color: C.muted, fontSize: 12.5, marginTop: 2 },
  q: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  total: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  totalLabel: { color: C.muted, fontWeight: '700' },
  totalVal: { fontSize: 22, fontWeight: '900', color: C.ink },
  h2: { fontSize: 18, fontWeight: '800', color: C.ink, marginTop: 10, marginBottom: 12 },
  doneTitle: { fontSize: 28, fontWeight: '900', color: C.ink, marginTop: 10 },
  doneText: { color: C.muted, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  codeBox: { marginTop: 22, alignSelf: 'stretch', alignItems: 'center', padding: 18, borderRadius: R.lg, borderWidth: 2, borderStyle: 'dashed', borderColor: '#9ED8CF', backgroundColor: C.mintSoft },
  codeLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4, color: C.muted },
  code: { fontSize: 26, fontWeight: '900', color: C.navy, letterSpacing: 2, marginTop: 6 },
});

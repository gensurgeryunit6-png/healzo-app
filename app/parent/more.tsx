import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, H1, Section, tap } from '../../components/ui';
import { leaveFamily, useFamily } from '../../lib/family';
import { C, R } from '../../lib/theme';

export default function More() {
  const insets = useSafeAreaInsets();
  const st = useFamily();

  const Item = ({ icon, label, onPress, danger }: { icon: any; label: string; onPress: () => void; danger?: boolean }) => (
    <Pressable onPress={() => { tap(); onPress(); }} style={({ pressed }) => [s.item, pressed && { backgroundColor: C.paper }]}>
      <Ionicons name={icon} size={20} color={danger ? C.danger : C.teal} />
      <Text style={[s.itemText, danger && { color: C.danger }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={C.muted} />
    </Pressable>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.paper }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: 30 }}>
      <H1 eyebrow="SETTINGS" title="More" />

      <Section title="Invite another parent" />
      <Card>
        <Text style={s.text}>Share this family code with your partner or a grandparent. They choose “Joining as a second parent?” when opening Healzo.</Text>
        <View style={s.codeRow}>
          <Text style={s.code}>{st.family?.parent_code ?? '······'}</Text>
          <Pressable
            onPress={() => Share.share({ message: `Join our family on Healzo! Open the app, tap “Joining as a second parent?” and enter: ${st.family?.parent_code}` }).catch(() => {})}
            style={s.share}
          >
            <Ionicons name="share-social-outline" size={18} color={C.navy} />
            <Text style={s.shareText}>Share</Text>
          </Pressable>
        </View>
        <Text style={s.small}>Keep this code private — anyone with it can manage your family.</Text>
      </Card>

      <Section title="Learn" />
      <View style={s.list}>
        <Item icon="bulb-outline" label="Expert tips & screen-time guidelines" onPress={() => router.push('/tips')} />
        <Item icon="leaf-outline" label="Gardening guides" onPress={() => router.push('/guides')} />
      </View>

      <Section title="About" />
      <View style={s.list}>
        <Item icon="shield-checkmark-outline" label="Privacy" onPress={() => router.push('/privacy')} />
        <Item
          icon="log-out-outline"
          label="Leave family on this phone"
          danger
          onPress={() =>
            Alert.alert(
              'Leave this family?',
              'This phone will be unlinked. Your family’s data stays for other members. To come back, use the family code.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Leave', style: 'destructive', onPress: async () => { await leaveFamily(); router.replace('/'); } },
              ],
            )
          }
        />
      </View>
      <Text style={s.version}>Healzo v{Constants.expoConfig?.version ?? '1.0.0'} · Less screen. More life.</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  text: { color: C.muted, fontSize: 13.5, lineHeight: 20 },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 14, padding: 14, borderRadius: R.md, backgroundColor: C.mintSoft },
  code: { fontSize: 28, fontWeight: '900', letterSpacing: 5, color: C.navy },
  share: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.white, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  shareText: { fontWeight: '800', color: C.navy },
  small: { color: C.muted, fontSize: 11.5 },
  list: { backgroundColor: C.white, borderRadius: R.lg, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: C.line },
  itemText: { flex: 1, fontSize: 15, color: C.ink, fontWeight: '600' },
  version: { textAlign: 'center', color: C.muted, fontSize: 12, marginTop: 22 },
});

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../lib/theme';

export default function Privacy() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={s.back} hitSlop={10} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={22} color={C.ink} />
        </Pressable>
        <Text style={s.title}>Privacy</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30 }}>
        <H>No accounts, no ads</H>
        <P>Healzo works without email or passwords. Each phone gets a private, anonymous sign-in. We never show ads and never sell data.</P>
        <H>What we store</H>
        <P>Family name, parent first names, each child’s first name, birth year, avatar and daily limit; screen time you log with the timer; activities completed; rewards. Children see only their own progress.</P>
        <H>We don’t track devices</H>
        <P>Healzo does not read other apps, location, contacts, camera or microphone. Screen time is only what you or your child record in the app.</P>
        <H>Shop orders</H>
        <P>When you order a kit we store your name, phone number and delivery address to deliver it and call you to confirm.</P>
        <H>Your control</H>
        <P>Parents can remove a child (deleting their records) at any time. To delete your whole family’s data, contact the Healzo team with your family code.</P>
      </ScrollView>
    </View>
  );
}

const H = ({ children }: { children: React.ReactNode }) => <Text style={s.h}>{children}</Text>;
const P = ({ children }: { children: React.ReactNode }) => <Text style={s.p}>{children}</Text>;

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.line },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.paper, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 19, fontWeight: '900', color: C.ink },
  h: { fontSize: 16, fontWeight: '800', color: C.ink, marginTop: 18, marginBottom: 4 },
  p: { fontSize: 14.5, color: '#3E5464', lineHeight: 22 },
});

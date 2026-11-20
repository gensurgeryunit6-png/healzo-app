import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityLibrary } from '../../components/ActivityLibrary';
import { H1 } from '../../components/ui';
import { ageFromBirthYear } from '../../lib/content';
import { useFamily } from '../../lib/family';
import { C } from '../../lib/theme';

export default function ChildActivities() {
  const insets = useSafeAreaInsets();
  const st = useFamily();
  const child = st.children.find(c => c.id === st.member?.child_id);
  const age = child ? ageFromBirthYear(child.birth_year) : null;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.paper }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: 30 }}>
      <H1 eyebrow="EARN POINTS" title="Fun without screens" sub="Pick an activity, do it, then tap “I did it!” to earn points." />
      <ActivityLibrary age={age} />
    </ScrollView>
  );
}

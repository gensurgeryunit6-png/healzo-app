import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityLibrary } from '../../components/ActivityLibrary';
import { Chip, H1 } from '../../components/ui';
import { ageFromBirthYear } from '../../lib/content';
import { useFamily } from '../../lib/family';
import { C } from '../../lib/theme';

export default function ParentActivities() {
  const insets = useSafeAreaInsets();
  const st = useFamily();
  const [childId, setChildId] = useState<string | null>(null);
  const child = st.children.find(c => c.id === childId) ?? null;
  const age = child ? ageFromBirthYear(child.birth_year) : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.paper }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: 30 }}>
      <H1 eyebrow="SCREEN-FREE IDEAS" title="Activities" sub="Swap screen time for play, gardening, reading and family fun. Children earn points when you approve." />
      <ActivityLibrary
        age={age}
        header={
          st.children.length > 1 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, alignItems: 'center' }}>
              <Text style={{ color: C.muted, fontSize: 12.5, marginRight: 4 }}>Show for:</Text>
              <Chip label="Everyone" active={!childId} onPress={() => setChildId(null)} />
              {st.children.map(c => (
                <Chip key={c.id} label={c.name} emoji={c.avatar} active={childId === c.id} onPress={() => setChildId(c.id)} />
              ))}
            </View>
          ) : null
        }
      />
    </ScrollView>
  );
}

import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useTabOptions } from '../../components/tabs';
import { useFamily } from '../../lib/family';
import { C } from '../../lib/theme';

export default function ChildTabs() {
  const st = useFamily();
  const opts = useTabOptions(
    {
      index: ['sunny', 'sunny-outline'],
      activities: ['rocket', 'rocket-outline'],
      rewards: ['gift', 'gift-outline'],
      garden: ['flower', 'flower-outline'],
    },
    C.leaf,
  );
  if (st.ready && (!st.member || st.member.role !== 'child')) return <Redirect href="/" />;
  return (
    <Tabs {...(opts as any)}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="activities" options={{ title: 'Activities' }} />
      <Tabs.Screen name="rewards" options={{ title: 'Rewards' }} />
      <Tabs.Screen name="garden" options={{ title: 'My garden' }} />
    </Tabs>
  );
}

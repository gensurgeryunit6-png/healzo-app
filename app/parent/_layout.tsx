import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useTabOptions } from '../../components/tabs';
import { useFamily } from '../../lib/family';

export default function ParentTabs() {
  const st = useFamily();
  const opts = useTabOptions({
    index: ['people', 'people-outline'],
    activities: ['leaf', 'leaf-outline'],
    rewards: ['gift', 'gift-outline'],
    shop: ['bag-handle', 'bag-handle-outline'],
    more: ['menu', 'menu-outline'],
  });
  if (st.ready && (!st.member || st.member.role !== 'parent')) return <Redirect href="/" />;
  const pending =
    st.logs.filter(l => l.status === 'pending').length + st.redemptions.filter(r => r.status === 'pending').length;
  return (
    <Tabs {...(opts as any)}>
      <Tabs.Screen name="index" options={{ title: 'Family' }} />
      <Tabs.Screen name="activities" options={{ title: 'Activities' }} />
      <Tabs.Screen name="rewards" options={{ title: 'Rewards', tabBarBadge: pending || undefined }} />
      <Tabs.Screen name="shop" options={{ title: 'Shop' }} />
      <Tabs.Screen name="more" options={{ title: 'More' }} />
    </Tabs>
  );
}

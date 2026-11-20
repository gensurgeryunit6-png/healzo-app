import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../lib/theme';
import { tap } from './ui';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function useTabOptions(icons: Record<string, [IconName, IconName]>, active = C.teal) {
  const insets = useSafeAreaInsets();
  return {
    screenListeners: { tabPress: () => tap() },
    screenOptions: ({ route }: { route: { name: string } }) => ({
      headerShown: false,
      tabBarActiveTintColor: active,
      tabBarInactiveTintColor: '#8396A3',
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
      tabBarStyle: { backgroundColor: C.white, borderTopColor: C.line, height: 70 + insets.bottom, paddingTop: 6, paddingBottom: Math.max(insets.bottom, 10) },
      tabBarIcon: ({ focused, color }: { focused: boolean; color: unknown }) => {
        const pair = icons[route.name] ?? (['ellipse', 'ellipse-outline'] as [IconName, IconName]);
        return <Ionicons name={focused ? pair[0] : pair[1]} size={23} color={color as string} />;
      },
    }),
  };
}

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { load, loadDemo } from '../lib/family';
import { C } from '../lib/theme';

export default function RootLayout() {
  useEffect(() => {
    const demo = Platform.OS === 'web' && typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('demo') : null;
    if (demo === 'parent' || demo === 'kid') {
      loadDemo(demo);
      return;
    }
    load();
    const sub = AppState.addEventListener('change', st => {
      if (st === 'active') load();
    });
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.paper } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="parent" />
        <Stack.Screen name="kid" />
        <Stack.Screen name="add-child" options={{ presentation: 'modal' }} />
        <Stack.Screen name="cart" options={{ presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}

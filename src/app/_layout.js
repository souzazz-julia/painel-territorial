import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PainelProvider } from '../context/PainelContext';
import { cores } from '../theme';

export default function LayoutRaiz() {
  return (
    <PainelProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: cores.primaria },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: cores.fundo },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="alerta/[id]" options={{ title: 'Avaliar alerta', headerBackTitle: 'Voltar' }} />
      </Stack>
    </PainelProvider>
  );
}

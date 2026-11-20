import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { usePainel } from '../../context/PainelContext';
import { cores } from '../../theme';

export default function LayoutAbas() {
  const { alertas } = usePainel();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: cores.primaria },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSuave,
        sceneStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Painel',
          headerTitle: 'Mirante · Painel',
          tabBarIcon: ({ color, size }) => <Ionicons name="speedometer" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alertas"
        options={{
          title: 'Alertas',
          tabBarBadge: alertas.length > 0 ? alertas.length : undefined,
          tabBarAccessibilityLabel: `Alertas, ${alertas.length} ativos`,
          tabBarIcon: ({ color, size }) => <Ionicons name="alert-circle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="decisoes"
        options={{
          title: 'Decisões',
          tabBarIcon: ({ color, size }) => <Ionicons name="clipboard" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sobre"
        options={{
          title: 'Sobre',
          tabBarIcon: ({ color, size }) => <Ionicons name="information-circle" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

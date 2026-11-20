import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { cores, espaco, fonte, raio } from '../theme';

export default function Card({ titulo, icone, children, style }) {
  return (
    <View style={[estilos.card, style]}>
      {titulo ? (
        <View style={estilos.cabecalho}>
          {icone ? <Ionicons name={icone} size={20} color={cores.primaria} importantForAccessibility="no" /> : null}
          <Text style={estilos.titulo} accessibilityRole="header">
            {titulo}
          </Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  card: {
    backgroundColor: cores.superficie,
    borderRadius: raio,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.m,
    marginBottom: espaco.m,
  },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: espaco.p, marginBottom: espaco.p },
  titulo: { fontSize: fonte.subtitulo, fontWeight: '700', color: cores.texto, flexShrink: 1 },
});

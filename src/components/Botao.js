import { Pressable, StyleSheet, Text } from 'react-native';
import { cores, fonte, raio } from '../theme';

const VARIANTES = {
  primaria: { fundo: cores.primaria, texto: '#FFFFFF', borda: cores.primaria },
  secundaria: { fundo: cores.superficie, texto: cores.primaria, borda: cores.primaria },
  perigo: { fundo: cores.superficie, texto: cores.critico, borda: cores.critico },
};

export default function Botao({ titulo, onPress, variante = 'primaria', desabilitado = false, dica }) {
  const v = VARIANTES[variante];
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityHint={dica}
      accessibilityState={{ disabled: desabilitado }}
      style={({ pressed }) => [
        estilos.botao,
        { backgroundColor: v.fundo, borderColor: v.borda },
        (pressed || desabilitado) && { opacity: 0.6 },
      ]}
    >
      <Text style={[estilos.texto, { color: v.texto }]}>{titulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    minHeight: 48, // área de toque mínima recomendada
    borderRadius: raio,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: { fontSize: fonte.corpo, fontWeight: '700' },
});

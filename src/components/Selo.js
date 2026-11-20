import { StyleSheet, Text, View } from 'react-native';
import { cores, fonte } from '../theme';

// Selo de status. Usa texto + cor, para não depender só da cor (acessibilidade).
const TONS = {
  critico: { fundo: cores.criticoFundo, texto: cores.critico },
  atencao: { fundo: cores.atencaoFundo, texto: cores.atencao },
  ok: { fundo: cores.okFundo, texto: cores.ok },
  neutro: { fundo: cores.primariaClara, texto: cores.primaria },
};

export default function Selo({ texto, tom = 'neutro' }) {
  const t = TONS[tom] ?? TONS.neutro;
  return (
    <View style={[estilos.selo, { backgroundColor: t.fundo }]}>
      <Text style={[estilos.texto, { color: t.texto }]}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  selo: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  texto: { fontSize: fonte.pequeno, fontWeight: '700' },
});

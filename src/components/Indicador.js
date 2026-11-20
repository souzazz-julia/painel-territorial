import { StyleSheet, Text, View } from 'react-native';
import { cores, fonte } from '../theme';

// Bloco de número em destaque (KPI)
export default function Indicador({ rotulo, valor, unidade, detalhe }) {
  return (
    <View
      style={estilos.caixa}
      accessible
      accessibilityLabel={`${rotulo}: ${valor} ${unidade ?? ''}. ${detalhe ?? ''}`}
    >
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <Text style={estilos.valor}>
        {valor}
        {unidade ? <Text style={estilos.unidade}> {unidade}</Text> : null}
      </Text>
      {detalhe ? <Text style={estilos.detalhe}>{detalhe}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { flex: 1, minWidth: 120 },
  rotulo: { fontSize: fonte.pequeno, color: cores.textoSuave },
  valor: { fontSize: fonte.titulo, fontWeight: '700', color: cores.texto },
  unidade: { fontSize: fonte.pequeno, fontWeight: '400', color: cores.textoSuave },
  detalhe: { fontSize: fonte.pequeno, color: cores.textoSuave, marginTop: 2 },
});

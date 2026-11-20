import { StyleSheet, Text, View } from 'react-native';
import { cores, fonte } from '../theme';

// Gráfico de barras simples feito só com View (sem biblioteca externa).
// dados: [{ rotulo: '19/11', valor: 123, destaque: false }]
// limite (opcional): desenha uma linha tracejada, ex.: a capacidade da região.
export default function GraficoBarras({ dados = [], altura = 120, limite, descricao, mostrarValores = false }) {
  if (dados.length === 0) {
    return <Text style={estilos.vazio}>Sem dados para exibir no gráfico.</Text>;
  }
  const maximo = Math.max(...dados.map((d) => d.valor), limite ?? 0) || 1;
  const intervaloRotulo = dados.length > 7 ? Math.ceil(dados.length / 7) : 1;
  // Reserva espaço no topo para o número em cima da barra mais alta
  const alturaBarras = mostrarValores ? altura - 16 : altura;

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={descricao}>
      <View style={[estilos.area, { height: altura }]}>
        {limite ? (
          <View style={[estilos.linhaLimite, { bottom: (limite / maximo) * alturaBarras }]} />
        ) : null}
        {dados.map((d, i) => (
          <View key={`${d.rotulo}-${i}`} style={estilos.coluna}>
            {mostrarValores ? <Text style={estilos.valor}>{d.valor}</Text> : null}
            <View
              style={[
                estilos.barra,
                {
                  height: Math.max((d.valor / maximo) * alturaBarras, 2),
                  backgroundColor: d.destaque ? cores.critico : cores.barra,
                },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={estilos.eixo}>
        {dados.map((d, i) => (
          <Text key={`r-${i}`} style={estilos.rotulo} numberOfLines={1}>
            {i % intervaloRotulo === 0 ? d.rotulo : ''}
          </Text>
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  area: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  vazio: { fontSize: fonte.pequeno, color: cores.textoSuave, paddingVertical: 8 },
  coluna: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barra: { width: '100%', borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  valor: { fontSize: 11, color: cores.textoSuave, marginBottom: 2 },
  linhaLimite: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: cores.critico,
  },
  eixo: { flexDirection: 'row', gap: 3, marginTop: 4 },
  rotulo: { flex: 1, fontSize: 10, color: cores.textoSuave, textAlign: 'center', overflow: 'visible' },
});

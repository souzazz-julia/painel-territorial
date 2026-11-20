import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Selo from './Selo';
import { cores, espaco, fonte, raio } from '../theme';

export const NOME_NIVEL = { critico: 'CRÍTICO', atencao: 'ATENÇÃO' };

export default function AlertaCard({ alerta, decidido, onPress }) {
  const corNivel = alerta.nivel === 'critico' ? cores.critico : cores.atencao;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Alerta ${NOME_NIVEL[alerta.nivel]}: ${alerta.titulo}. Confiança ${alerta.confianca.nivel}.${decidido ? ' Decisão já registrada.' : ''}`}
      accessibilityHint="Abre os detalhes e o formulário de decisão"
      style={({ pressed }) => [estilos.card, { borderLeftColor: corNivel }, pressed && { opacity: 0.7 }]}
    >
      <Ionicons name={alerta.icone} size={26} color={corNivel} importantForAccessibility="no" />
      <View style={estilos.conteudo}>
        <View style={estilos.selos}>
          <Selo texto={NOME_NIVEL[alerta.nivel]} tom={alerta.nivel} />
          <Selo texto={`Confiança ${alerta.confianca.nivel}`} />
          {decidido ? <Selo texto="Decisão registrada" tom="ok" /> : null}
        </View>
        <Text style={estilos.titulo}>{alerta.titulo}</Text>
        <Text style={estilos.acao}>Toque para avaliar ›</Text>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: espaco.m,
    backgroundColor: cores.superficie,
    borderRadius: raio,
    borderWidth: 1,
    borderColor: cores.borda,
    borderLeftWidth: 6,
    padding: espaco.m,
    marginBottom: espaco.m,
  },
  conteudo: { flex: 1 },
  selos: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  titulo: { fontSize: fonte.subtitulo, fontWeight: '700', color: cores.texto },
  acao: { fontSize: fonte.pequeno, color: cores.primaria, marginTop: 6, fontWeight: '600' },
});

import { Alert, FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import Card from '../../components/Card';
import Selo from '../../components/Selo';
import Botao from '../../components/Botao';
import { usePainel } from '../../context/PainelContext';
import { NOME_NIVEL } from '../../components/AlertaCard';
import { OPCOES_DECISAO } from '../../services/validacao';
import { formatarDataHora } from '../../utils/formato';
import { cores, espaco, fonte } from '../../theme';

const ROTULO_DECISAO = Object.fromEntries(OPCOES_DECISAO.map((o) => [o.valor, o.rotulo]));

export default function TelaDecisoes() {
  const { decisoes, removerDecisao } = usePainel();

  function confirmarRemocao(item) {
    // Alert.alert não aparece no navegador; na web usa o confirm do próprio navegador
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.('Remover este registro do histórico?')) removerDecisao(item.id);
      return;
    }
    Alert.alert('Remover registro?', 'Essa decisão será apagada do histórico.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => removerDecisao(item.id) },
    ]);
  }

  return (
    <FlatList
      data={decisoes}
      keyExtractor={(item) => item.id}
      contentContainerStyle={estilos.lista}
      ListHeaderComponent={
        <Text style={estilos.intro}>
          Histórico das decisões tomadas pelos gestores a partir dos alertas. Fica salvo no aparelho e mostra o
          alerta como ele estava no momento da decisão.
        </Text>
      }
      ListEmptyComponent={
        <Text style={estilos.vazio}>Nenhuma decisão registrada ainda. Avalie um alerta para começar.</Text>
      }
      renderItem={({ item }) => (
        <Card titulo={item.alertaTitulo || 'Alerta'}>
          <View style={estilos.selos}>
            <Selo
              texto={ROTULO_DECISAO[item.decisao] ?? 'Decisão'}
              tom={item.decisao === 'descartar' ? 'neutro' : 'ok'}
            />
            {NOME_NIVEL[item.alertaNivel] ? (
              <Selo texto={NOME_NIVEL[item.alertaNivel]} tom={item.alertaNivel} />
            ) : null}
            {item.alertaConfianca ? <Selo texto={`Confiança ${item.alertaConfianca}`} /> : null}
            {item.regiaoNome ? <Selo texto={item.regiaoNome} /> : null}
          </View>
          <Text style={estilos.texto}>“{item.justificativa}”</Text>
          <Text style={estilos.meta}>
            {item.responsavel || 'Responsável não informado'} · {formatarDataHora(item.registradaEm)}
          </Text>
          <View style={{ marginTop: espaco.m }}>
            <Botao titulo="Remover registro" variante="perigo" onPress={() => confirmarRemocao(item)} />
          </View>
        </Card>
      )}
    />
  );
}

const estilos = StyleSheet.create({
  lista: { padding: espaco.m },
  intro: { color: cores.textoSuave, fontSize: fonte.pequeno, marginBottom: espaco.m },
  vazio: { textAlign: 'center', color: cores.textoSuave, fontSize: fonte.corpo, marginTop: espaco.g },
  selos: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: espaco.p },
  texto: { fontSize: fonte.corpo, color: cores.texto, fontStyle: 'italic' },
  meta: { fontSize: fonte.pequeno, color: cores.textoSuave, marginTop: 6 },
});

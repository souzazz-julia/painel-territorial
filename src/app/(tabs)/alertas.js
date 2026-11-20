import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import AlertaCard from '../../components/AlertaCard';
import { usePainel } from '../../context/PainelContext';
import { cores, espaco, fonte } from '../../theme';

export default function TelaAlertas() {
  const router = useRouter();
  const { alertas, decisoes, regiao, clima, carregado } = usePainel();
  const idsDecididos = new Set(decisoes.map((d) => d.alertaId));
  const carregandoClima = !carregado || (clima.status === 'carregando' && !clima.dados);

  return (
    <FlatList
      data={alertas}
      keyExtractor={(item) => item.id}
      contentContainerStyle={estilos.lista}
      ListHeaderComponent={
        <View>
          <View style={estilos.aviso}>
            <Text style={estilos.avisoTexto}>
              Alertas preditivos para {regiao.nome}. O app apenas sugere: toda ação depende da decisão de um gestor.
            </Text>
          </View>
          {clima.status === 'erro' ? (
            <View style={[estilos.aviso, estilos.avisoErro]} accessibilityRole="alert">
              <Text style={[estilos.avisoTexto, { color: cores.atencao }]}>
                Sem conexão: os alertas de chuva e calor não puderam ser calculados.
              </Text>
            </View>
          ) : null}
          {carregandoClima && alertas.length > 0 ? (
            <Text style={estilos.carregando}>Atualizando alertas de clima…</Text>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        carregandoClima ? (
          <ActivityIndicator style={{ marginTop: espaco.g }} color={cores.primaria} accessibilityLabel="Carregando alertas" />
        ) : (
          <Text style={estilos.vazio}>Nenhum alerta para {regiao.nome} no momento.</Text>
        )
      }
      renderItem={({ item }) => (
        <AlertaCard
          alerta={item}
          decidido={idsDecididos.has(item.id)}
          onPress={() => router.push({ pathname: '/alerta/[id]', params: { id: item.id } })}
        />
      )}
    />
  );
}

const estilos = StyleSheet.create({
  lista: { padding: espaco.m, flexGrow: 1 },
  aviso: { backgroundColor: cores.primariaClara, borderRadius: 10, padding: 12, marginBottom: espaco.m },
  avisoErro: { backgroundColor: cores.atencaoFundo },
  avisoTexto: { color: cores.primaria, fontSize: fonte.pequeno, fontWeight: '600' },
  carregando: { color: cores.textoSuave, fontSize: fonte.pequeno, marginBottom: espaco.p },
  vazio: { textAlign: 'center', color: cores.textoSuave, fontSize: fonte.corpo, marginTop: espaco.g },
});

import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Card from '../../components/Card';
import Indicador from '../../components/Indicador';
import GraficoBarras from '../../components/GraficoBarras';
import SeletorOpcoes from '../../components/SeletorOpcoes';
import Botao from '../../components/Botao';
import Selo from '../../components/Selo';
import { usePainel } from '../../context/PainelContext';
import { formatarDataHora, formatarDiaMes, formatarNumero, formatarPercentual } from '../../utils/formato';
import { cores, espaco, fonte } from '../../theme';

export default function TelaPainel() {
  const router = useRouter();
  const { regiao, regioes, escolherRegiao, indicadores, clima, carregarClima, alertas } = usePainel();
  const criticos = alertas.filter((a) => a.nivel === 'critico').length;

  return (
    <ScrollView
      contentContainerStyle={estilos.tela}
      refreshControl={
        <RefreshControl refreshing={clima.status === 'carregando'} onRefresh={carregarClima} />
      }
    >
      <Text style={estilos.secao} accessibilityRole="header">
        Região monitorada
      </Text>
      <SeletorOpcoes
        rotuloGrupo="Escolha a região"
        opcoes={regioes.map((r) => ({ valor: r.id, rotulo: r.nome }))}
        selecionado={regiao.id}
        aoSelecionar={escolherRegiao}
      />
      <Text style={estilos.cidade}>{regiao.cidade}</Text>

      {/* Resumo de alertas */}
      <Pressable
        onPress={() => router.push('/alertas')}
        accessibilityRole="button"
        accessibilityLabel={`${alertas.length} alertas ativos, ${criticos} críticos. Ver alertas.`}
      >
        <Card style={estilos.resumo}>
          <Text style={estilos.resumoNumero}>{alertas.length}</Text>
          <View style={{ flex: 1 }}>
            <Text style={estilos.resumoTitulo}>
              {alertas.length === 1 ? 'alerta ativo' : 'alertas ativos'}
            </Text>
            <Text style={estilos.resumoTexto}>
              {criticos > 0 ? `${criticos} crítico(s) — ` : ''}toque para avaliar
            </Text>
          </View>
        </Card>
      </Pressable>

      <CardClima clima={clima} onTentarNovamente={carregarClima} />

      <Text style={estilos.secao} accessibilityRole="header">
        Indicadores dos últimos 14 dias
      </Text>
      {Object.values(indicadores).map((ind) => (
        <CardIndicador key={ind.chave} indicador={ind} />
      ))}
      <Text style={estilos.nota}>
        Dados de consumo sintéticos (simulados) para fins acadêmicos. A linha tracejada é a capacidade da região.
      </Text>
    </ScrollView>
  );
}

function CardClima({ clima, onTentarNovamente }) {
  if (clima.status === 'carregando' && !clima.dados) {
    return (
      <Card titulo="Clima" icone="partly-sunny">
        <ActivityIndicator color={cores.primaria} accessibilityLabel="Carregando previsão do tempo" />
      </Card>
    );
  }

  if (!clima.dados) {
    return (
      <Card titulo="Clima" icone="partly-sunny">
        <Text style={estilos.erro}>{clima.erro}</Text>
        <Botao titulo="Tentar novamente" variante="secundaria" onPress={onTentarNovamente} />
      </Card>
    );
  }

  const { atual, dias = [], atualizadoEm } = clima.dados;
  const maiorValor = (lista) => {
    const validos = lista.filter(Number.isFinite);
    return validos.length ? Math.max(...validos) : null;
  };
  const chuvaMaxima = maiorValor(dias.map((d) => d.chuva));
  const tempMaxima = maiorValor(dias.map((d) => d.tempMax));

  return (
    <Card titulo="Clima (Open-Meteo)" icone="partly-sunny">
      {clima.erro ? (
        <View style={{ marginBottom: espaco.p }}>
          <Selo texto={clima.erro} tom="atencao" />
        </View>
      ) : null}
      <View style={estilos.linha}>
        <Indicador rotulo="Agora" valor={formatarNumero(atual?.temperatura, 1)} unidade="°C" />
        <Indicador rotulo="Umidade" valor={formatarNumero(atual?.umidade)} unidade="%" />
        <Indicador rotulo="Máx. em 7 dias" valor={formatarNumero(tempMaxima, 1)} unidade="°C" />
      </View>
      <Text style={estilos.subtitulo}>Chuva prevista (mm)</Text>
      <GraficoBarras
        altura={90}
        mostrarValores
        dados={dias.map((d) => ({
          rotulo: formatarDiaMes(d.data),
          valor: Number.isFinite(d.chuva) ? Math.round(d.chuva) : 0,
          destaque: d.chuva >= 30,
        }))}
        descricao={`Gráfico de chuva prevista para 7 dias. Máximo de ${formatarNumero(chuvaMaxima, 1)} milímetros.`}
      />
      {clima.status === 'cache' ? (
        <View style={{ marginTop: espaco.p }}>
          <Botao titulo="Tentar atualizar" variante="secundaria" onPress={onTentarNovamente} />
        </View>
      ) : null}
      <Text style={estilos.nota}>Atualizado em {formatarDataHora(atualizadoEm)}</Text>
    </Card>
  );
}

function CardIndicador({ indicador }) {
  const { serie = [], capacidade, unidade, nome, icone } = indicador;

  if (serie.length === 0) {
    return (
      <Card titulo={nome} icone={icone}>
        <Text style={estilos.nota}>Sem dados para este indicador no momento.</Text>
      </Card>
    );
  }

  const atual = serie[serie.length - 1].valor;
  // Compara com 7 dias atrás (ou com o primeiro dia, se a série for mais curta)
  const semanaPassada = serie[Math.max(0, serie.length - 8)].valor;
  const variacao = semanaPassada > 0 ? (atual - semanaPassada) / semanaPassada : null;
  const uso = capacidade > 0 ? atual / capacidade : null;

  return (
    <Card titulo={nome} icone={icone}>
      <View style={estilos.linha}>
        <Indicador rotulo="Hoje" valor={formatarNumero(atual)} unidade={unidade} />
        <Indicador
          rotulo="Uso da capacidade"
          valor={formatarPercentual(uso)}
          detalhe={
            variacao === null ? undefined : `${variacao >= 0 ? '+' : ''}${formatarPercentual(variacao)} em 7 dias`
          }
        />
      </View>
      <GraficoBarras
        limite={capacidade}
        dados={serie.map((p) => ({
          rotulo: formatarDiaMes(p.data),
          valor: p.valor,
          destaque: capacidade > 0 && p.valor >= capacidade * 0.9,
        }))}
        descricao={`Gráfico de ${nome} nos últimos ${serie.length} dias. Hoje: ${formatarNumero(atual)} ${unidade}, ${formatarPercentual(uso)} da capacidade.`}
      />
    </Card>
  );
}

const estilos = StyleSheet.create({
  tela: { padding: espaco.m, paddingBottom: espaco.g * 2 },
  secao: { fontSize: fonte.subtitulo, fontWeight: '700', color: cores.texto, marginBottom: espaco.p, marginTop: espaco.p },
  cidade: { color: cores.textoSuave, fontSize: fonte.pequeno, marginTop: 6, marginBottom: espaco.m },
  resumo: { flexDirection: 'row', alignItems: 'center', gap: espaco.m, backgroundColor: cores.primariaClara },
  resumoNumero: { fontSize: 40, fontWeight: '800', color: cores.primaria },
  resumoTitulo: { fontSize: fonte.subtitulo, fontWeight: '700', color: cores.texto },
  resumoTexto: { fontSize: fonte.pequeno, color: cores.textoSuave },
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.m, marginBottom: espaco.m },
  subtitulo: { fontSize: fonte.pequeno, fontWeight: '700', color: cores.textoSuave, marginBottom: 6 },
  nota: { fontSize: fonte.pequeno, color: cores.textoSuave, marginTop: espaco.p },
  erro: { color: cores.critico, fontSize: fonte.corpo, marginBottom: espaco.m },
});

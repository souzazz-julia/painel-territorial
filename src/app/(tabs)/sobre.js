import { ScrollView, StyleSheet, Text } from 'react-native';
import Card from '../../components/Card';
import { HORIZONTE_DIAS } from '../../services/previsao';
import { cores, espaco, fonte } from '../../theme';

export default function TelaSobre() {
  return (
    <ScrollView contentContainerStyle={estilos.tela}>
      <Card titulo="O que é o Mirante" icone="eye">
        <Text style={estilos.texto}>
          Um painel de inteligência territorial para gestores públicos. Ele reúne indicadores de água, energia,
          resíduos, demanda por serviços e clima de uma região e antecipa problemas com alertas preditivos.
        </Text>
      </Card>

      <Card titulo="Decisão humana" icone="people">
        <Text style={estilos.texto}>
          O app não toma decisões sozinho. Cada alerta traz justificativa, nível de confiança e limitações, e só
          vira ação depois que um gestor registra a decisão e o motivo.
        </Text>
      </Card>

      <Card titulo="Fontes de dados" icone="server">
        <Text style={estilos.item}>• Clima: API pública Open-Meteo (open-meteo.com), sem chave e sem dados pessoais.</Text>
        <Text style={estilos.item}>
          • Água, energia, resíduos e chamados: dados sintéticos (simulados), gerados no app para fins acadêmicos.
        </Text>
      </Card>

      <Card titulo="Como os alertas são calculados" icone="analytics">
        <Text style={estilos.item}>
          • Indicadores: reta de tendência (regressão linear) dos últimos 14 dias, projetada {HORIZONTE_DIAS} dias à
          frente. Alerta se passar de 90% da capacidade da região.
        </Text>
        <Text style={estilos.item}>• Chuva: 30 mm ou mais em um dia, ou 50 mm em 3 dias.</Text>
        <Text style={estilos.item}>• Calor: máxima de 32 °C ou mais nos próximos 3 dias.</Text>
      </Card>

      <Card titulo="Limitações" icone="warning">
        <Text style={estilos.item}>• Os dados de consumo não são reais.</Text>
        <Text style={estilos.item}>• O modelo linear não prevê eventos atípicos.</Text>
        <Text style={estilos.item}>• A previsão do tempo pode mudar a cada atualização.</Text>
      </Card>

      <Card titulo="Privacidade" icone="lock-closed">
        <Text style={estilos.item}>• Todos os dados são agregados por região: nenhum cidadão é identificado.</Text>
        <Text style={estilos.item}>• O app não pede localização nem login.</Text>
        <Text style={estilos.item}>
          • O formulário de decisão bloqueia CPF, e-mail e telefone na justificativa.
        </Text>
        <Text style={estilos.item}>• As decisões ficam salvas só neste aparelho.</Text>
      </Card>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { padding: espaco.m, paddingBottom: espaco.g * 2 },
  texto: { fontSize: fonte.corpo, color: cores.texto, lineHeight: 22 },
  item: { fontSize: fonte.corpo, color: cores.texto, lineHeight: 22, marginBottom: 4 },
});

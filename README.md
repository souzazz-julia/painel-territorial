# Mirante — Painel de Inteligência Territorial

App mobile em **React Native (Expo)** que funciona como um painel de inteligência territorial para um gestor público. Ele mostra indicadores de uma região (água, energia, resíduos, demanda por serviços e clima), gera **alertas preditivos** com justificativa, nível de confiança e limitações, e apoia a decisão do gestor **sem automatizar decisões**: toda ação precisa ser registrada por uma pessoa.

Disciplina: Cross-Platform Application Development — FIAP, Ciência da Computação (2º ano)

## Integrantes

| Nome completo | RM |
|---|---|
| Julia Lopes | 566557 |
| Claus Moreira | 565503 |

## Funcionalidades

1. **Dashboard com gráficos e indicadores** — escolha da região, resumo de alertas, clima atual e chuva prevista para 7 dias, e gráfico dos últimos 14 dias de cada indicador com a linha de capacidade da região.
2. **Alertas preditivos** — cada alerta mostra por que foi gerado (justificativa), o nível de confiança (Alta, Média ou Baixa) e suas limitações.
3. **Apoio à decisão** — o gestor avalia o alerta e registra a decisão (aprovar, adaptar, só monitorar ou descartar), com responsável e justificativa. O app só sugere; nada é executado automaticamente.

## Como os alertas são calculados

| Alerta | Regra | Confiança |
|---|---|---|
| Água, energia, resíduos, serviços | Regressão linear dos últimos 14 dias projetada 7 dias à frente. Alerta se chegar a 90% da capacidade (crítico se passar de 100%). | R² do ajuste: ≥ 0,7 Alta, ≥ 0,4 Média, abaixo disso Baixa |
| Chuva / alagamento | 30 mm ou mais em um dia, ou 50 mm acumulados em 3 dias | Probabilidade de chuva informada pela API |
| Calor intenso | Máxima de 32 °C ou mais nos próximos 3 dias | Média (previsão de temperatura de curto prazo) |

## Requisitos técnicos atendidos

| Requisito | Onde está |
|---|---|
| React Native | Projeto Expo (SDK 58) |
| Navegação entre telas | Expo Router: abas (Painel, Alertas, Decisões, Sobre) + tela de detalhe do alerta (`src/app`) |
| Gerenciamento de estado | Context API (`src/context/PainelContext.js`) |
| Consumo de APIs | Open-Meteo (`src/services/clima.js`) |
| Persistência de dados | AsyncStorage: região escolhida, histórico de decisões e cache do clima para uso offline |
| Formulários com validação | Formulário de decisão do gestor (`src/app/alerta/[id].js` + `src/services/validacao.js`) |
| Componentes reutilizáveis com identidade visual própria | `src/components` + paleta e tipografia em `src/theme.js` |
| Acessibilidade e privacidade | Ver seções abaixo |

## Fontes de dados

- **Clima:** [Open-Meteo](https://open-meteo.com/) — API pública e gratuita, sem chave. Temperatura, umidade, chuva prevista e probabilidade de chuva.
- **Água, energia, resíduos e demanda por serviços:** dados **sintéticos** (simulados), gerados no próprio app em `src/data/regioes.js` a partir de um valor base, uma tendência diária, um ciclo semanal e um ruído com semente fixa (os números são sempre os mesmos). Cada região tem uma capacidade fictícia para cada indicador.
- **Regiões:** Centro, Itaquera, Capão Redondo e Santana (São Paulo - SP), com coordenadas reais usadas na consulta do clima.

## Limitações

- Os dados de consumo não são reais; servem apenas para demonstrar o funcionamento.
- O modelo de tendência é linear e usa só 14 dias: não prevê eventos atípicos (feriados, falhas, obras).
- A previsão do tempo é para um ponto da região e pode mudar a cada atualização.
- O app não conhece a drenagem nem as áreas de risco reais de cada bairro.
- As decisões ficam salvas apenas no aparelho (não há servidor nem sincronização entre gestores).

## Acessibilidade

- Rótulos e papéis de acessibilidade (`accessibilityLabel`, `accessibilityRole`, `accessibilityState`) em botões, seletores, checkbox, campos e gráficos.
- Gráficos têm uma descrição em texto para leitores de tela.
- Nível dos alertas indicado por texto (CRÍTICO / ATENÇÃO), não só por cor.
- Cores com contraste adequado e áreas de toque de no mínimo 44–48 px.
- Mensagens de erro do formulário anunciadas para leitores de tela.

## Privacidade

- Todos os dados são agregados por região: nenhum cidadão é identificado.
- O app não pede login nem localização do usuário.
- A justificativa do formulário bloqueia CPF, e-mail e telefone.
- Nada é enviado para servidores; a única chamada externa é a consulta do clima.

## Como rodar

Pré-requisitos: Node.js 20+ e o app **Expo Go** no celular (Android ou iOS).

```bash
npm install
npx expo start
```

Escaneie o QR Code com o Expo Go. Para abrir no navegador: `npx expo start --web`.

## Estrutura

```
src/
  app/                 # telas (Expo Router)
    _layout.js         # pilha de navegação + provider de estado
    (tabs)/            # abas: index (Painel), alertas, decisoes, sobre
    alerta/[id].js     # detalhe do alerta + formulário de decisão
  components/          # Card, Selo, Indicador, GraficoBarras, Botao, CampoTexto, SeletorOpcoes, AlertaCard
  context/             # estado global (Context API + AsyncStorage)
  data/                # regiões e dados sintéticos
  services/            # API de clima, cálculo dos alertas, validação do formulário
  utils/               # formatação de números e datas
  theme.js             # identidade visual
```

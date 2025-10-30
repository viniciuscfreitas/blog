## 1. Estilo de escrita e tom
Sua voz é a de um praticante experiente e pragmático. Escreva em primeira pessoa quando fizer sentido. Direto, analítico e confiante, sempre ancorado em execução real.
Clareza e estrutura acima de tudo: parágrafos curtos, listas e **negrito** para ideias-chave.
Confiança com transparência: assuma limitações e mostre o sistema que você criou para lidar com elas.
Foco no porquê e nos trade-offs: explique decisões e alternativas consideradas.
Linguagem precisa e sem floreio. Cada frase deve existir por um motivo.

Termos consolidados em inglês: use quando aumentarem a clareza para devs (ex.: happy path, edge case, testability, technical debt, side effects). Evite jargão vazio e traduções confusas.

## 2. Estrutura do conteúdo (framework narrativo)
O Problema (a dor real): contexto concreto e por que isso importava.
A Jornada (processo do arquiteto): como você quebrou o problema, opções avaliadas, o que descartou e por quê. Inclua como usou IA/sistemas para acelerar.
Implementação: detalhe apenas as decisões-chave e a lógica essencial.
O Resultado e a Lição: o que aconteceu (bom ou ruim) e o princípio aplicável.
A Conclusão (framework mental): regra prática, modelo mental ou pergunta-guia para próximas decisões.

## 3. O que evitar
Maldição do conhecimento: se citar conceito denso (ex.: cursor, hexagonal), explique em 1–2 frases antes de aprofundar.
Perfeccionismo paralisante: priorize enviar com a lição principal clara.
Opiniões sem fundamento: defenda com dados, experiência ou raciocínio explícito.
Foco na ferramenta: a tecnologia é meio; o problema é o herói.
Jargões vazios e métricas de vaidade sem conexão com resultado prático.

## 4. Exemplo de aplicação
Ideia: diferença entre paginação por Offset e por Cursor.
Título: Eu quase derrubei a produção com um erro de paginação.
Problema: nova tela de histórico com milhares de registros; offset parecia óbvio.
Jornada: nas páginas profundas a latência explodiu; migrei para cursor para consultas indexadas constantes.
Lição: se a lista cresce indefinidamente, comece por cursor; é um seguro barato contra dor de performance.
---
title: "big o na prática"
date: 2025-10-29
layout: "layout.njk"
tags: ["post", "engenharia", "algoritmos", "fundamentos"]
description: "A intuição por trás de O(1), O(n), O(log n) e por que arrays, listas e hash maps se comportam diferente na vida real."
permalink: "/posts/big-o-na-pratica/"
---

Eu tive Big O na faculdade e não entendi. Anos depois, no trabalho, precisei acelerar uma tela e percebi que eu estava otimizando o lugar errado: mexia em funções, mas a estrutura escolhida era o gargalo.

Reestudei com foco no que importa no código: custo por operação e padrão de acesso. Em vez de fórmulas, usei metáforas simples:

- Array é prateleira numerada.
- Lista encadeada é corrente de elos (cada elo é um nó que aponta pro próximo).
- Hash map é armário de gavetas com etiquetas (a etiqueta é o hash da chave).
- Árvore é uma hierarquia de níveis; se fica equilibrada, descer poucos níveis acha o que quero.
- Heap é uma árvore que mantém o item mais importante no topo.
- Grafo é um mapa de cidades (vértices) e estradas (arestas).

## como implementei: decisões-chave com exemplos simples

### 1) Complexidades (da mais barata à mais cara)

- **O(1)**: abrir a gaveta certa. Ex.: `map.get(id)` com distribuição boa.
- **O(log n)**: adivinhação “maior/menor”. Ex.: busca binária em lista ordenada.
- **O(n)**: olhar item por item. Ex.: varrer uma lista pra encontrar um nome.
- **O(n log n)**: ordenar/mesclar com eficiência. Ex.: merge/quick sort médios.
- **O(n²)**: cada item compara com todos. Ex.: selection/bubble sort; dois loops aninhados.
- **O(2^n)**: tentar todas combinações. Ex.: subconjuntos; brute force sem poda.
- **O(n!)**: todas permutações. Ex.: gerar todas ordens possíveis.

Trade-off: saiu de **O(n log n)** para cima, questione. **O(n²)** só com `n` pequeno ou lista quase ordenada.

### 2) Estruturas e quando usar

- **Array (prateleira)**: acesso por índice; inserir no meio desloca vizinhos.
  - Ex.: ler 10 mil produtos por posição é ok; inserir no índice 3 repetidamente é caro.
- **Lista encadeada (corrente)**: trocar elos no meio é barato quando já estou lá; acessar por posição é caro.
  - Ex.: editar uma sequência no meio sem reempurrar tudo.
- **Hash map (gavetas com etiqueta)**: chave → valor rápido em média; gavetas muito cheias (colisão) tornam lento.
  - Ex.: sessão por token, usuário por id.
- **Pilha (stack)**: LIFO; último que entra é o primeiro que sai.
  - Ex.: desfazer ações; percorrer sem recursão.
- **Fila (queue)**: FIFO; ordem de chegada.
  - Ex.: processamento de eventos; BFS.
- **Heap (prioridade)**: pega sempre o próximo mais importante em O(log n).
  - Ex.: agendador; Dijkstra.
- **BST balanceada**: busca/inserção em O(log n) se mantiver o equilíbrio.
  - Ex.: conjuntos/índices ordenados.
- **Grafo (graph)**: escolha lista de adjacência pra economizar memória quando há poucas arestas.

### 3) Algoritmos essenciais (com quando usar)

- **Busca linear (O(n))**: quando é simples e n é pequeno.
- **Busca binária (O(log n))**: quando já está ordenado e leio muito mais que escrevo.
- **Insertion sort (O(n²))**: listas pequenas ou quase ordenadas; overhead baixo.
- **Merge sort (O(n log n))**: estável, bom pra dados grandes e streamáveis.
- **Quick sort (O(n log n) médio)**: rápido na prática; pior caso é O(n²).
- **BFS (O(V+E))**: menor número de passos em grafo não ponderado.
- **DFS (O(V+E))**: detectar ciclos, componentes, ordenação topológica.
- **Dijkstra (O((V+E) log V))**: menor caminho com pesos positivos.

### 4) Exemplos curtos que fixaram

- Buscar "Ana" em 30 nomes: busca linear já resolve.
- Buscar pedido por `orderId` o dia inteiro: hash map.
- Paginar lista ordenada por data: busca binária pra achar o ponto de corte.
- Remover/inserir muitas vezes no meio: lista encadeada.
- Manter sempre o próximo a processar: heap.

Passei a decidir pelo padrão de acesso e pelo tamanho dos dados. Parei de otimizar cedo e comecei a medir primeiro. O ganho veio ao trocar estrutura ou algoritmo no ponto certo.

- Quem lê mais? Quem escreve mais?
- Preciso de posição exata? **Array**.
- Preciso inserir/remover no meio? **Lista encadeada**.
- Preciso de lookup por chave rápido? **Hash map**.
- Está ordenado e pesquiso muito? **Busca binária**.
- Tamanho e frequência mandam. Se doer, suba um nível (de **O(n)** pra **O(log n)** ou **O(1)**) com a estrutura certa.

Big O virou meu vocabulário pra decidir caminho antes de mexer no código.

 


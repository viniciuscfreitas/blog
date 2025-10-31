---
title: "overengineering na vida real (parte 2): onde traçar a linha?"
date: 2025-10-30
layout: "layout.njk"
tags: ["post", "engenharia", "filosofia", "pragmatismo"]
description: "Depois de simplificar, percebi que a resposta não é simples: onde traçar a linha entre simplificar e quebrar correção básica?"
permalink: "/posts/worse-is-better-o-debate-que-mudou-como-penso-simplicidade/"
---

[Na parte 1](posts/overengineering-na-vida-real), escrevi sobre como parei de complicar: happy path primeiro, DRY com regra de 3, medir antes de otimizar. Funcionava bem e eu entregava mais rápido.

Mas depois de um tempo, algo incomodava.

Quando simplificava demais, às vezes entregava algo que quebrava rápido. Quando complicava pouco demais, criava dívida técnica cara. **Onde traçar a linha?**

Descobri que a resposta não é simples. Não é "simples sempre vence" ou "correto sempre importa mais". A resposta depende de contexto e **precisa de critérios claros**.

## o problema

Existem duas abordagens opostas:

**A coisa certa:** prioriza igualmente simplicidade, correção, consistência e completude. Tudo perfeito.

**Mais simples = melhor:** prioriza quase exclusivamente simplicidade de implementação e performance. Correção, consistência e completude só o suficiente pra funcionar.

**A resposta:** nenhuma delas sozinha. Preciso de **simplicidade pragmática com critérios claros**.

## por que nenhuma funciona sozinha?

### a coisa certa tem problemas

Buscar perfeição em tudo:
- Demora muito pra entregar
- Fica tão complexo que cria mais bugs
- Resolve problemas que não existem ainda

Exemplo: criar um sistema completo de validação de formulário antes de saber quais campos realmente precisam. Você valida tudo: email com regex complexo, telefone com máscara de 10 países, CPF com validação de dígito. No fim, atrasa a entrega e cria bugs que você não conseguiria prever.

### simples demais também tem problemas

Simplificar sem critérios:
- Quebra correção básica
- Joga responsabilidade pro usuário sem necessidade
- Normaliza mediocridade ("vamos corrigir depois")

Exemplo: uma função que busca usuário por email. Você faz simples: `users.find(u => u.email === email)`. Mas não valida se o array existe, se o email é string. Se vier null do banco, quebra.

## minha regra atual

**Simplificar COM padrões claros, não simplificar pra aceitar "pior".**

Critérios:

1. **Simplicidade na implementação e interface**
   - Happy path primeiro, mas validar na borda
   - Entrada inválida retorna padrão seguro (0, '', [], null, conforme o contexto)
   - Interface clara e previsível

2. **Rapidez no desenvolvimento, não na entrega quebrada**
   - DRY com regra de 3, não abstração prematura
   - Entrego **80% que resolve o problema** (Pareto), não "metade da coisa certa"

3. **Adaptação e crescimento**
   - Conheço o modelo de performance (hash map é O(1), array.find() é O(n))
   - Evoluo quando vejo uso real, não antes

4. **Robustez mínima obrigatória**
   - Trato entrada inválida (null, undefined, tipo errado)
   - Trato caso vazio (array vazio, string vazia)
   - Tratamento de erro básico, não completo

5. **Manutenibilidade**
   - Código que outro dev entende rápido
   - Estrutura que permite evoluir sem reescrever

## exemplos práticos

### validação de email

Abordagem "coisa certa" (ruim):

```js
function validateEmail(email) {
  if (!email) return { valid: false, error: 'Email é obrigatório' };
  if (typeof email !== 'string') return { valid: false, error: 'Email deve ser string' };
  if (email.length < 5) return { valid: false, error: 'Email muito curto' };
  if (email.length > 254) return { valid: false, error: 'Email muito longo' };
  if (!email.includes('@')) return { valid: false, error: 'Email deve conter @' };
  const [local, domain] = email.split('@');
  if (!local || local.length > 64) return { valid: false, error: 'Parte local inválida' };
  if (!domain || !domain.includes('.')) return { valid: false, error: 'Domínio inválido' };
  // ... mais 20 linhas de validação
  return { valid: true };
}
```

Muito complexo, valida coisas que o usuário nunca vai quebrar.

Abordagem "simples demais" (ruim):

```js
function validateEmail(email) {
  return email.includes('@');
}
```

Quebra se email for null, undefined, não for string.

Abordagem pragmática (boa):

```js
function validateEmail(email) {
  if (!email || typeof email !== 'string') return { valid: false, error: 'Email inválido' };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return { valid: false, error: 'Email inválido' };
  return { valid: true };
}
```

Simplificado, mas: valida entrada na borda, valida o essencial, happy path claro.

### buscar usuário

Antes (ruim):

```js
function findUserByEmail(email, users) {
  return users.find(u => u.email === email);
}
// Quebra se users for null, undefined, não for array
// Quebra se email for null, undefined
// Retorna undefined se não encontrar (sem aviso)
```

Depois (melhor):

```js
function findUserByEmail(email, users) {
  if (!email || !Array.isArray(users)) return null;
  return users.find(u => u?.email === email) || null;
}
```

Simplificado, mas com validação na borda e retorno explícito.

## modelo mental

**Simplificar é necessário, mas não suficiente. Precisa equilibrar simplicidade, rapidez, adaptação e robustez.**

Checklist antes de considerar algo "pronto":

1. Implementação simples? Outro dev entende rápido?
2. Interface clara e previsível?
3. Valido na borda? Entrada inválida retorna padrão seguro?
4. Happy path claro? Edge case principal tratado?
5. Conheço o modelo de performance? Sei o custo das operações?
6. Facilita mudanças futuras? Ou tranca tudo?
7. Se eu sumir por 6 meses, outro dev consegue manter?

Se todas são "sim", estou fazendo **simplicidade pragmática**, não simplificação sem critério.

**O que funciona:**
- Simplicidade acelera entrega, mas precisa validação na borda
- Rapidez ajuda, mas não pode entregar quebrado
- Adaptação facilita evolução, mas precisa evoluir baseado em uso real
- Robustez mínima é obrigatória: tratamento de erro básico
- Manutenibilidade importa: código simples que outro dev entende rápido

**O que não funciona:**
- Aceitar simplificação sem critérios (gera bugs evitáveis)
- Negligenciar tratamento de erros básico (quebra em produção)
- Projetar pra casos hipotéticos (torna difícil adaptar depois)

A resposta depende de contexto:
- Sistema crítico (saúde, financeiro): correção importa mais que simplicidade
- Produto web MVP: simplicidade pode importar mais que perfeição
- Código legado: habitabilidade pode importar mais que correção teórica

Complexity very very bad. Mas pior ainda é **complexity bad AND wrong**—código simples que quebra por falta de critérios.

[← Voltar para a parte 1](posts/overengineering-na-vida-real)

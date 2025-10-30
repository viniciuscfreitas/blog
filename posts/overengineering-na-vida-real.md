---
title: "overengineering na vida real"
date: 2025-10-22
layout: "layout.njk"
tags: ["post", "engenharia", "pragmatismo", "frontend"]
description: "Como parei de complicar, entreguei mais rápido e quebrei menos coisas."
permalink: "/posts/overengineering-na-vida-real/"
---

Eu queria escrever o código perfeito. Eu criava funções com vários fallbacks, tratava 10.000% dos edge cases que nunca iam acontecer e adicionava features que ninguém pediu. No fim, atrasava tudo, criava mais bugs e deixava o código confuso.

Doeu mais no frontend, mas existe no backend.

## a virada

Mais código = mais bug. Passei a resolver o problema real pelo caminho curto e claro.

## como simplifiquei

### 1) muitos fallbacks vs decisão direta

Antes (JavaScript):

```js
function formatPrice(v, currency, locale, fallback) {
  let value = v;
  if (value === null || value === undefined) {
    if (fallback !== undefined && fallback !== null) {
      value = fallback;
    } else if (currency === 'USD') {
      value = 0;
    } else if (currency === 'BRL') {
      value = 0;
    } else {
      value = 0;
    }
  }
  const c = currency || 'BRL';
  const l = locale || 'pt-BR';
  try {
    return new Intl.NumberFormat(l, { style: 'currency', currency: c }).format(value);
  } catch (e) {
    return `${c} ${Number(value).toFixed(2)}`;
  }
}
```

Depois (decisão explícita e entrada validada):

```js
function formatPrice(value, { currency = 'BRL', locale = 'pt-BR' } = {}) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}
```

Por quê: happy path claro e uma saída para entrada inválida. Menos branches, menos bug.

### 2) abstração prematura vs função simples

Antes:

```js
class NotificationStrategy {
  send(message) {}
}

class EmailNotification extends NotificationStrategy {
  constructor(client) { super(); this.client = client; }
  send(message) { return this.client.send(message); }
}

class SmsNotification extends NotificationStrategy {
  constructor(client) { super(); this.client = client; }
  send(message) { return this.client.send(message); }
}

function notify(kind, client, message) {
  let strategy;
  if (kind === 'email') strategy = new EmailNotification(client);
  else if (kind === 'sms') strategy = new SmsNotification(client);
  else throw new Error('unsupported');
  return strategy.send(message);
}
```

Depois:

```js
function notifyEmail(client, message) {
  return client.send(message);
}
```

Por quê: só havia um caso. Quando existir o segundo, eu extraio. Antes disso, duplico sem culpa.

### 3) otimização precoce vs medir

Antes:

```js
function filterActive(users) {
  const result = [];
  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    if (u && u.active === true) {
      result.push({ id: u.id, name: u.name });
    }
  }
  return result;
}
```

Depois:

```js
function filterActive(users) {
  return users.filter(u => u?.active === true).map(u => ({ id: u.id, name: u.name }));
}
```

Por quê: escrevo claro primeiro. Se doer na métrica, troco.

### 4) DRY com regra de 3

Antes de extrair uma abstração, eu sigo a regra de 3:

- 1º uso: resolvo direto e claro, no mesmo lugar.
- 2º uso: duplico conscientemente; ainda observo variações.
- 3º uso: extraio a função/módulo, agora com forma real, não hipotética.

Evita “interfaces perfeitas” que nunca se pagam.

### 5) pareto nas features: 80/20

Para cada feature, busco o 20% que entrega 80% do valor:

- Happy path primeiro; edge cases só os prováveis.
- Métrica mínima para validar se já resolveu o problema.
- Só então cubro casos raros se o uso justificar.

### 6) simplicidade e testability

Funções pequenas, puras e sem side effects são fáceis de testar. Não preciso mockar o mundo.

- Antes: muitos if/else e dependência de estado externo → você precisa escrever muitos testes para cobrir todos os caminhos.
- Depois: input validation e um único happy path → você testa só a I/O normal e um edge case principal.

### 7) dados simples > abstrações

Antes:

```js
class UserBase {
  constructor(props) { this.props = props; }
  getName() { return this.props.name }
}
class AdminUser extends UserBase {
  isAdmin() { return true }
}
```

Depois:

```js
function isAdmin(user) { return user.role === 'admin' }
```

Por quê: dados simples + funções pequenas são mais fáceis de ler, testar e mudar.

### 8) delete sem dó

Eu removi uma “service layer” que só repassava chamadas. O código ficou menor e os testes ficaram mais diretos. Deletar foi a melhor refatoração.

### 9) notas rápidas

- Monólito modular antes de microservices. Só divida quando a dor for real (equipes/processo/escala).
- Prefira tecnologia estável e comprovada. Menos surpresa = menos bug.
- Concorrência: executar tarefas ao mesmo tempo. Útil, mas traz race conditions e deadlocks. Use quando medir ganho real; prefira filas/assíncrono simples.

Entregas mais rápidas. Menos bugs. Código menor e legível. Quando preciso crescer, refatoro em cima de algo simples, não de um castelo de abstrações. O débito técnico fica menor e mais barato de pagar.

- Resolva o caminho feliz primeiro.
- Valide entradas na borda e padronize saídas.
- Meça antes de otimizar.
- Duplique antes de abstrair; extraia só após ver uso real mais de uma vez.
- DRY com regra de 3.
- Pareto: entregue o 80% que resolve o problema.
- Nome claro, função pequena, efeito colateral zero.



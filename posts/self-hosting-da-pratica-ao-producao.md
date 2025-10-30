---
title: "self‑hosting: do zero ao deploy com pragmatismo"
date: 2025-10-30
layout: "layout.njk"
tags: ["post", "infra", "devops", "self-hosting"]
description: "Como montei um ambiente de self‑hosting simples, automatizado e confiável o suficiente para produção usando Docker Compose, proxy reverso e CI/CD."
permalink: "/posts/self-hosting-da-pratica-ao-producao/"
---

Eu gosto de aprender construindo. Self‑hosting foi meu laboratório: uma maneira de colocar projetos no ar, testar ideias rápido e ainda aplicar fundamentos (automação, isolamento, idempotência) sem transformar tudo em tese.

Comecei com a tentação do Kubernetes e da Arquitetura Perfeita. O que funcionou foi o oposto: **compose + proxy reverso + CI/CD via SSH**. Simples, previsível, barato de operar. Quando doeu, eu melhorei um componente por vez.

## o problema (a dor real)

Eu queria hospedar projetos pessoais e pequenos produtos (blog, portal do cliente) sem depender de SaaS caro, e com controle total. Restrições: tempo, custo, pouca mão e necessidade de aprender na prática sem derrubar nada.

## a jornada (o processo do arquiteto)

Eu quebrei o problema em pedaços menores e mensuráveis:

1. Colocar um serviço HTTP no ar com TLS de graça.
2. Automatizar o deploy para evitar “funcionou na minha máquina”. 
3. Padronizar rede e nomes para escalar serviços sem caos.
4. Endurecer o básico de segurança e preparar backup.

A tecnologia é meio. O objetivo era entregar valor rápido e repetir com confiança.

## implementação (decisões‑chave)

### 1) orquestração mínima: Docker Compose

Escolha óbvia para 1 a N serviços simples. Um `docker-compose.yml` por app, volumes nomeados para estado e upgrades previsíveis. K8s ficou fora do MVP por complexidade operacional desnecessária.

### 2) entrada única: proxy reverso com TLS

Usei um proxy reverso com emissão automática de certificados (Let's Encrypt). Cada serviço roda em rede bridge e é exposto por hostname. Ganho: TLS, roteamento por domínio, headers de segurança e logs agrupados.

### 3) automação: CI/CD via GitHub Actions + SSH

Idempotência simples: o servidor é um espelho da `main`.

```yaml
# .github/workflows/deploy.yml (trecho)
on:
  push:
    branches: ["main"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy over SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            set -euo pipefail
            mkdir -p ~/www/blog
            cd ~/www/blog
            if [ ! -d .git ]; then
              git clone https://github.com/<usuario>/blog.git .
            else
              git fetch --all --prune
              git reset --hard origin/main
            fi
            docker compose up -d --build
            docker image prune -f || true
```

Detalhes que fizeram diferença:

- `git reset --hard origin/main` evita drift. 
- `set -euo pipefail` mata o deploy na primeira falha. 
- Chave SSH dedicada de CI com escopo mínimo.

### 4) rede e nomes previsíveis

Cada app tem sua rede default do Compose. O proxy reverso é conectado a essas redes para resolver os containers por nome do serviço. Evita IPs fixos e configuração manual frágil.

### 5) segurança básica primeiro

SSH apenas com chave, atualização automática de certificados, forçar HTTPS, e acesso administrativo do proxy restrito (firewall/VPN). Fail2ban no host para conter brute force.

## o resultado (e a lição)

Eu tenho um ambiente que publica novos serviços em minutos:

1. Clono o repositório em `~/www/<app>`.
2. `docker compose up -d --build`.
3. Conecto a rede do app ao proxy reverso e crio o host com o domínio.
4. Ativo o workflow de deploy e nunca mais faço `ssh` manual para atualizar.

Lição: **parei de tentar pilotar um avião de caça para atravessar a rua**. Compose entrega 80% do valor com 20% do custo cognitivo. O resto eu coloco quando doer.

## runbooks que eu realmente uso

### publicar um novo app

```bash
git clone https://github.com/<usuario>/<app>.git ~/www/<app>
cd ~/www/<app>
docker compose up -d --build
# conectar o proxy reverso à rede do app, se necessário
docker network connect <app>_default <container-do-proxy> || true
```

Criar host no proxy: apontar `app.<meu-dominio>` → `http://<nome-do-servico>:<porta>`, solicitar certificado e forçar HTTPS.

### atualizar um app (CI/CD)

```bash
git push origin main
# pipeline executa: fetch, reset hard, compose up --build
```

### diagnosticar rápido

```bash
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'
docker logs -n 200 <servico>
docker network ls
docker inspect <app>_default | jq '.[0].Containers | keys'
```

## o que deu errado (e como corrigi)

- Chave SSH no Secret sem os headers `BEGIN/END` → handshake falhou. Corrigi colando a chave completa.
- `docker image prune -a` removeu imagens úteis. Mantive apenas `-f` para dangling.
- Expor o painel do proxy publicamente é pedir problema. Restrição por firewall/VPN resolveu no MVP.

## checklist de self‑hosting mínimo viável

- Domínio e DNS controlados.
- VM atualizada e SSH por chave.
- Proxy reverso com TLS automático.
- Compose por serviço, volumes nomeados, nomes de serviço claros.
- CI/CD idempotente via SSH.
- Backup diário de volumes críticos e teste de restore mensal.
- Monitoramento de uptime básico.

## próximos passos (quando doer)

- Backup/DR mais sólido: snapshots versionados em storage externo e restore automatizado.
- Observabilidade: métricas e alertas mínimos (uptime, certificado, espaço em disco).
- Acesso administrativo via VPN/Bastion.
- Padronizar labels e redes para auto‑descoberta no proxy.
- Se a orquestração ficar complexa: K3s/Kubernetes, mas só com justificativa real.

## conclusão (framework mental)

Self‑hosting não é sobre a ferramenta, é sobre reduzir atrito entre ideia e produção. Meu modelo mental hoje:

1. Entregue o caminho feliz com Compose.
2. Automação antes de otimização.
3. Segurança básica sempre on.
4. Meça a dor antes de adicionar complexidade.
5. Evolua por fatias: um componente por vez.

Eu não desliguei o interesse por arquiteturas mais complexas. Eu só coloquei uma regra à frente: **simplicidade que entrega**. Quando a realidade pedir mais, eu vou saber exatamente onde apertar.



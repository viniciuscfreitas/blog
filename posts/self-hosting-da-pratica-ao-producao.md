---
title: "self‑hosting: do zero ao deploy com pragmatismo"
date: 2025-10-30
layout: "layout.njk"
tags: ["post", "infra", "devops", "self-hosting"]
description: "Como montei um ambiente de self‑hosting simples, automatizado e confiável o suficiente para produção usando Docker Compose, proxy reverso e CI/CD."
permalink: "/posts/self-hosting-da-pratica-ao-producao/"
---

Eu gosto de aprender construindo. Self‑hosting foi meu laboratório: uma forma de colocar projetos no ar, testar ideias rápido e ainda aplicar fundamentos (automação, isolamento, idempotência) sem transformar tudo em tese.

Meu primeiro projeto real foi o **vetqueue**: um portal web para o pet shop da minha família. Precisava de controle total, custo baixo e liberdade pra iterar sem pedir permissão. Vercel e Heroku eram simples, mas eu queria entender a infraestrutura. Comecei lendo sobre Kubernetes, Terraform e as Arquiteturas Perfeitas. O que funcionou foi o oposto: **compose + proxy reverso + CI/CD via SSH**. Simples, previsível, quase de graça.

## primeiros passos (a infra básica)

Provisionei uma Droplet na DigitalOcean usando o free trial: 1GB RAM, 1 vCPU. Registrei o domínio `vinicius.xyz` na GoDaddy. Atualizei o servidor, desativei autenticação por senha no SSH e deixei só chaves.

A escolha do proxy foi pragmática. Eu queria TLS automático sem editá arquivos de configuração do Nginx manualmente. **Nginx Proxy Manager** oferece interface web e integração com Let's Encrypt. Deslize o formulário, clique em solicitar certificado e está no ar. Perfeito pra MVP.

Deployi o NPM via Docker Compose numa rede isolada. Pedi o primeiro certificado SSL para o domínio. Funcionou na primeira tentativa.

## o primeiro app (manual e doloroso)

Clonei o repositório do vetqueue em `~/www/vetqueue`, rodei `docker compose up -d --build`. Conectei a rede do Compose ao container do NPM com `docker network connect`. Criei host no NPM apontando para o serviço na porta interna. 30 minutos depois o portal estava no ar com HTTPS.

Deixei rodando manual por 10 dias. Cada mudança era SSH + pull + rebuild. Funcionava, mas cansativo.

## o catalisador (automatizar depois de sentir a dor)

O blog foi o segundo projeto e acionou a automação. Se não houvesse automação, seria manual de novo.

Criei um workflow no GitHub Actions que roda em push para `main`:

{% raw %}
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
{% endraw %}

O workflow clona/atualiza o repositório, faz reset hard para evitar drift e faz rebuild das imagens. `set -euo pipefail` interrompe na primeira falha. Idempotente.

## o que quebrou (e como corrigi)

Primeira execução: `ssh: handshake failed`. A chave pública estava no servidor e os secrets corretos no GitHub. Estava certo.

O problema: ao copiar a privada para os secrets, faltaram os headers `-----BEGIN OPENSSH PRIVATE KEY-----` e `-----END OPENSSH PRIVATE KEY-----`. Sem eles, nada funciona. Colei a chave completa e funcionou.

Segundo erro: `docker image prune -a` removeu imagens úteis. A flag `-a` apaga imagens não usadas, inclusive básicas. Troquei para `-f`, que remove apenas “dangling”.

Terceiro: percebi o painel do NPM exposto publicamente. Não vi acesso, mas bastava DNS + brute force para a senha padrão. Restringi por firewall/VPN.

Quarto: `ssh-keygen` no Windows falhou com `No such file or directory`. Não existia `~/.ssh`. Criei com `mkdir` e seguiu.

## o estado atual (pragmático e limitado)

2 apps rodando: vetqueue e blog. Vetqueue manual; blog automatizado.

Para adicionar um novo app:
1. Clone em `~/www/<app>`.
2. `docker compose up -d`.
3. Conecte a rede ao NPM e configure o host.
4. Se precisar de CI/CD, crie o workflow.

Com o NPM configurado, leva 20–30 minutos.

O vetqueue segue manual; o blog disparou a automação. Evolução incremental e funcional.

## lições aplicáveis

Evite complexidade prematura. Compose cobre 80% com baixo custo cognitivo. K8s chega quando o problema real justificar.

Automatize após sentir a dor; automatizar cedo cria abstrações sem necessidade.

Segurança mínima: chaves SSH, HTTPS, certificados automáticos e acesso administrativo restrito. O resto quando precisar.

Transparência: free trial, 2 apps, um manual. Não vire “perfeito” se não for.

## conclusão

Self‑hosting não é sobre a ferramenta, é sobre reduzir atrito entre ideia e produção. Entregue o simples primeiro; complexidade quando for inevitável.

Ainda penso em K8s. Por ora, o que entrega é suficiente.

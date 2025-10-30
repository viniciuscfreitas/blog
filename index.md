---
title: "Vinicius Freitas"
layout: "layout.njk"
---

<div class="blog-header">
    <div class="header-content">
        <img src="img/foto.png" alt="Vinicius Freitas" class="profile-photo" loading="lazy">
        <div class="header-text">
            <h1>Vinicius Freitas</h1>
            <p class="blog-subtitle">Dev fullstack. Construo sistemas simples que funcionam.</p>
            <p class="blog-subtitle">Escrevo sobre engenharia pragmática, cases de carreira e finanças.</p>
        </div>
    </div>
</div>

<ul class="archive-list">
{%- for post in collections.post | reverse -%}
  <li>
    <time class="archive-date" datetime="{{ post.date.toISOString() }}">{{ post.date.toLocaleDateString('pt-BR') }}</time>
    <a class="archive-title" href="{{ post.url }}">{{ post.data.title }}</a>
  </li>
{%- endfor -%}
</ul>
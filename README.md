<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/1ec41975-8af2-424f-83f0-a0613c459395

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

# Duolingo Journey Dashboard

Dashboard analítico e visual sobre a minha trajetória de aprendizado de inglês no Duolingo, transformando dados exportados da plataforma e evidências visuais em um projeto de portfólio com foco em performance, consistência, gamificação, evolução pessoal e storytelling de dados.

---

## Sobre o projeto

Este projeto foi criado para apresentar minha jornada no Duolingo de forma mais estratégica, visual e profissional, indo além de prints soltos e convertendo a experiência em um dashboard com análise de dados, design e narrativa visual.
A proposta é mostrar disciplina, progressão e resultados concretos no estudo de inglês com base em dados exportados da plataforma, tratamento analítico das informações e imagens selecionadas como evidência dos principais marcos da jornada.

---

## Como o projeto foi construído

Para desenvolver este projeto, primeiro foi solicitado o download dos dados pessoais diretamente no portal de dados do Duolingo, indicado pelo Help Center como **Duolingo Data Vault**, que permite requisitar uma cópia dos dados armazenados pela plataforma.[web:64]  
Depois disso, os arquivos exportados foram organizados e tratados em um processo de **ETL (Extract, Transform, Load)**, com limpeza, padronização, interpretação e estruturação das tabelas relevantes para análise.  
Na sequência, foram selecionadas e baixadas imagens pertinentes aos insights e marcos da trajetória, que também passaram a compor o dashboard como camada visual de evidência. 
Toda a construção visual e lógica do dashboard foi feita com apoio do **Google AI Studio**, utilizado para estruturar a experiência, refinar o storytelling, organizar seções analíticas e orientar a geração da interface do projeto.

---

## Fonte dos dados

Os dados usados neste projeto foram obtidos a partir da exportação da conta pessoal no Duolingo por meio do portal de acesso a dados da plataforma, citado pelo próprio suporte oficial como **Duolingo Data Vault**.[web:64]  
A política de privacidade do Duolingo também informa como a empresa trata informações pessoais e disponibiliza documentação relacionada à gestão desses dados.

### Fluxo resumido

- Solicitação da cópia dos dados pessoais no portal do Duolingo.
- Download dos arquivos exportados da conta.
- ETL dos dados para análise e visualização.
- Curadoria das imagens mais relevantes para comprovação dos resultados.
- Construção do dashboard com apoio do Google AI Studio.

---

## Objetivos

- Transformar dados brutos do Duolingo em um dashboard moderno, responsivo e orientado a storytelling.
- Demonstrar evolução real no aprendizado de inglês com indicadores mensuráveis.
- Organizar recordes, medalhas, conquistas e marcos em um projeto de portfólio.
- Criar uma apresentação visual com valor para GitHub, LinkedIn e portfólio profissional.

---

## Principais resultados da trajetória

Com base nos dados exportados e nas evidências visuais reunidas, a jornada inclui marcos fortes de consistência, performance e progressão no inglês.

- Curso estudado: inglês a partir do português (`learninglanguage = en`, `fromlanguage = pt`).
- Total de pontos acumulados no arquivo principal: **343.368 XP**.
- Total de skills aprendidas: **35**.
- Total de lições concluídas: **257**.
- Total de dias ativos registrados no arquivo principal: **242**.
- Última atividade registrada no export: **2026-05-07**.
- Proficiência prévia registrada: **1**.
- Evidência visual do perfil com **357.922 XP**, **125 dias**, **19 cursos**, **58 seguidores** e permanência na liga **Diamante**.
- Evidência visual de conclusão do curso de inglês no Duolingo.
- Evidência visual de meta atingida com **score de inglês 130**.
- Evidência visual de recorde pessoal com **maior ofensiva de 375 dias**.
- Evidência visual de recorde pessoal com **Top XP do Dia: 2.374 XP** em **23/01/2025**.
- Evidência visual de conquistas como **Clube dos Campeões** em **12/10/2025** e **Pura Perfeição** em **19/05/2025**.
- Evidência visual de várias trilhas de medalhas em **2023**, **2024** e **2025**.

---

## Dados utilizados

O projeto usa arquivos exportados do Duolingo para construir a camada analítica do dashboard.

### Arquivos principais

- `languages.csv` — reúne idioma estudado, idioma base, pontos, skills, lições, dias ativos, última atividade e proficiência prévia.
- `leaderboards.csv` — registra histórico competitivo em ligas e torneios, incluindo participações em **Diamond Tournament** entre 2025 e 2026.

### Evidências visuais

As imagens servem como prova complementar dos marcos da jornada e ajudam a validar os dados exibidos no dashboard.

- Perfil geral no aplicativo.
- Medalhas de 2023.
- Medalhas de 2024.
- Medalhas de 2025.
- Score de inglês 130.
- Recordes pessoais e conquistas.
- Tela de triunfos e badges.
- Comprovante visual de conclusão do curso de inglês.

---

## ETL e preparação dos dados

Antes de criar o dashboard, os arquivos passaram por um processo de ETL para tornar a análise mais consistente e legível.

### Etapas do ETL

- **Extract:** obtenção dos arquivos exportados da conta Duolingo.
- **Transform:** leitura dos CSVs, validação das colunas, padronização de campos, interpretação de datas e separação das métricas mais relevantes.
- **Load:** organização final dos dados para alimentar o dashboard e as narrativas visuais.

### Resultado do tratamento

Esse processo permitiu transformar tabelas brutas em indicadores úteis para visualização, comparação temporal, leitura de consistência, análise competitiva e reforço do storytelling do projeto.

---

## O que o dashboard mostra

O dashboard foi pensado para funcionar como um case visual e analítico da minha trajetória no Duolingo.

### Seções previstas

- **Visão geral da jornada** com resumo executivo da trajetória.
- **KPIs principais** com XP, lições, skills, dias ativos, ofensiva e score.
- **Linha do tempo de evolução** com marcos anuais e competitivos.
- **Gamificação e ligas** com análise de permanência em Diamante e torneios.
- **Conquistas e recordes** com cards de medalhas, streak e prêmios pessoais.
- **Evidências visuais** com screenshots que reforçam os principais resultados.

---

## Ferramenta utilizada

A idealização e a construção do dashboard foram feitas com apoio do **Google AI Studio**, utilizado como ambiente de estruturação criativa e técnica para organizar a narrativa do projeto, definir a composição visual, orientar a leitura dos dados e acelerar a produção do dashboard final.

---

## Tecnologias do projeto

Este projeto pode ser desenvolvido com uma stack simples e moderna para front-end e visualização de dados.

- HTML5
- CSS3
- JavaScript
- Chart.js ou Recharts
- Papaparse para leitura dos CSVs
- Layout responsivo com abordagem mobile-first
- Google AI Studio como suporte de criação e estruturação do dashboard.

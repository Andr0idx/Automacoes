# Automação WhatsApp e Extrator ARCO - Loggi

Este repositório contém um conjunto de automações desenvolvidas para otimizar a comunicação e extração de dados da equipe da Loggi, utilizando Google Sheets, Google Apps Script, UserScripts para Tampermonkey e uma interface web intuitiva.

---

## 📋 Sumário

- [Descrição](#descrição)  
- [Funcionalidades](#funcionalidades)  
- [Componentes do Projeto](#componentes-do-projeto)  
- [Como Usar](#como-usar)  
- [Instalação dos Userscripts](#instalação-dos-userscripts)  
- [Configuração de Chave de Acesso (KEY)](#configuração-de-chave-de-acesso-key)  
- [Página Web ONEPAGE](#página-web-onepage)  
- [Autor](#autor)  

---

## 📖 Descrição

Este projeto reúne diversas automações para facilitar o trabalho da equipe de leves da Loggi (GDL), incluindo o envio automatizado de mensagens via WhatsApp Web com base em dados atualizados em planilhas públicas do Google Sheets, além de um extrator automático de dados do sistema ARCO para acompanhamento operacional e atualização dos leves.

---

## ⚙️ Funcionalidades

### Robo de Automação WhatsApp

- Envia mensagens pré-definidas para grupos do WhatsApp, localizando-os pela barra de pesquisa do WhatsApp Web.  
- Integração com planilha pública para leitura de mensagens e autorização via chave única (KEY).  
- Visual feedback via popups animados para status de envios e validação.  
- Monitoramento em tempo real da planilha para disparos automáticos.

### Extrator ARCO Loggi

- Extrai dados da plataforma ARCO nas páginas "Na Base" e "Na Rua".  
- Abre abas sequencialmente para coleta através de `postMessage`.  
- Consolida informações e gera relatório em CSV para download.  
- Interface visual e controle via ícone animado.

### Google Apps Script - Funções de Envio

- Funções que manipulam dados em planilhas do Google Sheets para preparar filas de mensagens a serem enviadas.  
- Funções disponíveis:  
  - `escoamentoInicial` - Primeiro escoamento do dia  
  - `atualizacaoEscoamento` - Atualização do escoamento das bases durante o dia
  - `d1` - Cobrança dos resultados dos leves ofensores do dia anterior
  - `atualizacaoArco` - Atualiza os leves sobre os pacotes "Em base" e "Em rota", dados do ARCO (Comunica com o Extrator)
  - `delayed` - Cobra os leves com detalhamento de pacotes em atraso na base (Delayed)
  - `mensagensRapidas` - Mensagens rápidas aos leves

### ONEPAGE - Interface Web

- Página HTML organizada com botões para disparar as funções Apps Script e abrir links úteis.  
- Versão desktop e mobile.
- Controle de estados dos botões e feedback visual para o usuário.

---

## 🧩 Componentes do Projeto

1. **UserScript Automação WhatsApp**  
   [automacao-whatsapp.user.js](https://github.com/Andr0idx/Automacoes/blob/main/automacao-whatsapp.user.js)  
   Roda no Tampermonkey e automatiza envios no WhatsApp Web.

2. **UserScript Extrator ARCO**  
   [extrator-arco.user.js](https://github.com/Andr0idx/Automacoes/blob/main/extrator-arco.user.js)  
   Extrai automaticamente dados do sistema ARCO para acompanhamento.

3. **Google Apps Script**  
   - Funções executadas em Google Sheets para preparar e enviar dados para o robo.  
   - Atualizam a aba "Fila" em planilha pública que o robo lê.

4. **ONEPAGE HTML**  
   - Interface centralizada com botões para controle das automações.  
   - Versão desktop e mobile disponíveis.

---

## 🚀 Como Usar

### 1. Instale o Tampermonkey no seu navegador

- [Tampermonkey para Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)  
- Ou para outro navegador de sua preferência.

### 2. Instale os UserScripts

- Para o WhatsApp:  
  Instale o script `automacao-whatsapp.user.js` diretamente pelo [link raw do GitHub](https://raw.githubusercontent.com/Andr0idx/Automacoes/main/automacao-whatsapp.user.js).
- Para o ARCO:  
  Instale o script `extrator-arco.user.js` via [link raw do GitHub](https://raw.githubusercontent.com/Andr0idx/Automacoes/main/extrator-arco.user.js).

### 3. Autorize sua KEY

- Ao iniciar o UserScript do WhatsApp, será solicitado que informe sua chave única (`MINHA_KEY`). Essa chave deve constar na planilha autorizada para liberar o envio.

### 4. Utilize a ONEPAGE para disparos e acessos rápidos

- Abra o arquivo HTML da ONEPAGE no seu navegador.  
- Use os botões para executar as funções do Google Apps Script, abrir dashboards, planilhas ou iniciar a extração ARCO.

### 5. Google Apps Script

- As funções são disparadas pelos botões na ONEPAGE.  
- Elas processam os dados da aba 'Automação (WPP)' na planilha principal e atualizam a aba 'Fila' na planilha pública, que o robo WhatsApp monitora para enviar.

---

## 🔧 Instalação dos Userscripts

- No Tampermonkey, clique em "Adicionar novo script" e cole o conteúdo do respectivo arquivo `*.user.js`, ou clique diretamente no link raw para instalar.

---

## 🔐 Configuração de Chave de Acesso (KEY)

- A chave única (`MINHA_KEY`) é solicitada no primeiro uso do script WhatsApp.  
- Essa chave deve estar cadastrada na planilha pública na coluna correspondente para que o robo permita envios.  
- Mantida no `localStorage` para reutilização.

---

## 🌐 Página Web ONEPAGE

- Contém botões para disparar funções Apps Script e abrir links úteis.  
- Responsiva, inclui versões desktop e mobile para melhor experiência de uso.

---

## 👨‍💻 Autor

**Gabriel Guedes Araujo da Silva (Biel)**  
[GitHub: Andr0idx](https://github.com/Andr0idx)

---


### Contato e dúvidas

Para dúvidas, sugestões ou contribuições, entrar em contato com Gabriel Guedes.
gabriel.guedes@loggi.com

---

**Obrigado por utilizar essas automações para facilitar sua rotina Loggi!**

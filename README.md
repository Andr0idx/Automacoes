# Scripts de Automação - Time Biel

Bem-vindo ao repositório oficial dos scripts de automação usados pelo time Biel! Aqui estão dois robôs que facilitam trabalhos diários importantes:

- **Automação WhatsApp Biel**: Envia mensagens para grupos do WhatsApp automaticamente, buscando grupos pela barra de pesquisa, validando chave de autorização via Google Sheets.
- **Extrator Arco Loggi**: Extrai dados da plataforma Arco Loggi, coletando informações "Na Base" e "Na Rua" com interface e botões para coleta fácil.

---

## Como usar estes scripts com Tampermonkey

### 1. Instalar Tampermonkey (se ainda não tiver)

Tampermonkey é uma extensão para navegadores que permite usar scripts automáticos (UserScripts).  
- Chrome: [https://tampermonkey.net/?ext=dhdg&browser=chrome](https://tampermonkey.net/?ext=dhdg&browser=chrome)  
- Firefox: [https://tampermonkey.net/?ext=dhdg&browser=firefox](https://tampermonkey.net/?ext=dhdg&browser=firefox)  

---

### 2. Baixar os scripts do GitHub

1. Clique no arquivo do script desejado (por exemplo, `AutomacaoWhatsAppBiel.user.js` ou `ExtratorArcoLoggi.user.js`).
2. Clique no botão **Raw** para abrir o código puro do script numa nova aba.
3. Copie todo o conteúdo (Ctrl+A e Ctrl+C / Cmd+A e Cmd+C).

---

### 3. Adicionar/atualizar script no Tampermonkey

1. Abra o painel do Tampermonkey no navegador (clicando no ícone da extensão).
2. Clique em **Adicionar novo script** (ícone de “+”).
3. Apague tudo que estiver na janela de edição.
4. Cole (Ctrl+V / Cmd+V) o código copiado do GitHub.
5. Salve (ícone de disquete ou Ctrl+S / Cmd+S).
6. O script estará ativo conforme o endereço configurado no `@match` (WhatsApp Web ou Arco Loggi).

---

### 4. Usando os scripts

- **Automação WhatsApp Biel**  
  - O script fica monitorando mudanças no Google Sheets configurado para acionar o envio das mensagens.  
  - Certifique-se de estar logado(a) no WhatsApp Web.  
  - A execução e disparo de mensagens iniciam via alteração marcada na planilha do Google.  

- **Extrator Arco Loggi**  
  - Acesse o Arco Loggi nas páginas com as URLs correspondentes (na base ou na rua).  
  - No canto inferior direito aparecerá um botão verde para iniciar a extração.  
  - Clique e aguarde o processo extrair e baixar os dados em CSV.

---

## Importante para o time

- **Conta GitHub**  
  - Você precisa ter uma conta no GitHub para acessar este repositório privado.  
  - Caso não tenha, crie gratuitamente em: https://github.com/join  
  - Aguarde o convite para acessar o repositório e aceite-o para ter permissão.

- **Atualizações dos scripts**  
  - Assim que o Biel atualizar o(s) script(s) no GitHub, faça o download da nova versão (passo 2) e substitua no seu Tampermonkey conforme passo 3.  
  - Sempre use a última versão para evitar erros ou falta de funcionalidades.

- **Permissões**  
  - Os scripts operam via navegador e Tampermonkey, não precisam de instalações adicionais.  
  - Caso tenha dificuldades, procure o Biel para suporte.

---

## Estrutura dos arquivos no repositório

- `AutomacaoWhatsAppBiel.user.js` — Script para automação do WhatsApp  
- `ExtratorArcoLoggi.user.js` — Script para extração no Arco Loggi  

---

## Contato e Suporte

Para dúvidas, sugestões ou ajuda na atualização, fale com:

**Gabriel Guedes Araujo da Silva (Biel)**  
Email: [seu-email-aqui]  
Telegram/WhatsApp: [seu-contato-aqui]

---

Obrigado por contribuir e usar as automações!  

_Team Biel Automation_

---

*(Este README pode ser atualizado conforme o fluxo evolui)*

// ==UserScript==
// @name         Automação WhatsApp Biel
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Script para automatizar Whatsapp
// @author       Gabriel Guedes A
// @match        https://web.whatsapp.com/*
// @updateURL    https://raw.githubusercontent.com/Andr0idx/Automacoes/main/Automacao-WhatsApp-Biel.user.js
// @downloadURL  https://raw.githubusercontent.com/Andr0idx/Automacoes/main/Automacao-WhatsApp-Biel.user.js
// @grant        none
// ==/UserScript==

const planilhaURL = 'https://docs.google.com/spreadsheets/d/1ST5rfClXrd8lEwQqjsRaFMeIwJ4M_yH7pWsVIlbqIMk/gviz/tq?tqx=out:json&sheet=Fila';

function getMinhaKey() {
    let key = localStorage.getItem('MINHA_KEY');
    if (!key) {
        key = prompt('Digite sua chave única (MINHA_KEY):');
        if (key) {
            localStorage.setItem('MINHA_KEY', key);
            console.log('MINHA_KEY salva no localStorage.');
        } else {
            alert('Chave única é obrigatória para continuar.');
            throw new Error('MINHA_KEY não fornecida. Script parado.');
        }
    }
    return key;
}

const MINHA_KEY = getMinhaKey();

(function () {
    'use strict';

    // --- Adiciona fonte Roboto para o popup ---
    const styleFonte = document.createElement('style');
    styleFonte.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
    `;
    document.head.appendChild(styleFonte);

    console.log('Robo de Biel rodando!');

    let iconeMarcaDagua = null;

    let popupPrioritarioAtivo = false;
    let fecharComCliqueHandler = null;
    let automacaoRodando = false; // controle se a automação está em execução

    // --- Marca d'água com SOMENTE emoji e pointer-events none para não bloquear cliques ---
    function adicionarIconeMarcaDagua() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.bottom = '10px';
        container.style.right = '25px';
        container.style.width = '40px'; // reduzido para só emoji
        container.style.height = '40px';
        container.style.zIndex = '9999';
        container.style.userSelect = 'none';
        container.style.pointerEvents = 'none'; // deixa clicar nos elementos abaixo
        container.style.lineHeight = '40px'; // para alinhamento vertical do emoji

        iconeMarcaDagua = document.createElement('div');
        iconeMarcaDagua.textContent = '🤖';
        iconeMarcaDagua.style.fontSize = '32px';
        iconeMarcaDagua.style.opacity = '0.12';
        iconeMarcaDagua.style.pointerEvents = 'none';
        iconeMarcaDagua.style.userSelect = 'none';
        iconeMarcaDagua.style.lineHeight = '40px';
        iconeMarcaDagua.style.textAlign = 'center';

        container.appendChild(iconeMarcaDagua);
        document.body.appendChild(container);
    }
    adicionarIconeMarcaDagua();

    function esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function esperarElemento(selector, timeout = 15000) {
        const inicio = Date.now();
        while (Date.now() - inicio < timeout) {
            const el = document.querySelector(selector);
            if (el && el.offsetParent !== null) return el;
            await esperar(200);
        }
        throw new Error(`Elemento ${selector} não encontrado após ${timeout}ms`);
    }

    function cliqueReal(elemento) {
        ['mouseover', 'mousedown', 'mouseup', 'click'].forEach(tipo => {
            elemento.dispatchEvent(new MouseEvent(tipo, { bubbles: true, cancelable: true, view: window }));
        });
    }

    function normalizarTexto(texto) {
        return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '').trim();
    }

    function setInputValueReactCompatible(input, value) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    async function clicarEFocarCampoPesquisa(inputEl) {
        ['mouseover', 'mousedown', 'mouseup', 'click'].forEach(tipo =>
            inputEl.dispatchEvent(new MouseEvent(tipo, { bubbles: true, cancelable: true, view: window }))
        );
        inputEl.focus();
        await esperar(100);
    }

    async function limparAntesDeDigitar(inputPesquisa) {
        inputPesquisa.focus();
        await esperar(50);
        const keydownCtrlA = new KeyboardEvent('keydown', {
            key: 'a',
            code: 'KeyA',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
        });
        inputPesquisa.dispatchEvent(keydownCtrlA);
        await esperar(50);
        const keydownDelete = new KeyboardEvent('keydown', {
            key: 'Delete',
            code: 'Delete',
            bubbles: true,
            cancelable: true,
        });
        inputPesquisa.dispatchEvent(keydownDelete);
        setInputValueReactCompatible(inputPesquisa, '');
        await esperar(400);
    }

    // Função buscar grupo agora aguarda lista atualizar COMPLETA antes de clicar
    async function buscarGrupoPorPesquisa(nomeGrupo) {
        try {
            const inputPesquisa = document.querySelector('input[aria-label="Pesquisar ou começar uma nova conversa"]');
            if (!inputPesquisa) throw new Error('Campo de pesquisa não encontrado');

            await limparAntesDeDigitar(inputPesquisa);
            await clicarEFocarCampoPesquisa(inputPesquisa);

            inputPesquisa.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
            setInputValueReactCompatible(inputPesquisa, nomeGrupo);
            inputPesquisa.dispatchEvent(new CompositionEvent('compositionupdate', { data: nomeGrupo, bubbles: true }));
            inputPesquisa.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
            inputPesquisa.dispatchEvent(new Event('input', { bubbles: true }));

            // Aguardar atualização da lista COMPLETA:
            const nomeNorm = normalizarTexto(nomeGrupo);
            const maxTempo = 6000;
            const inicio = Date.now();
            let ultimaQtdResultados = -1;
            let contadorSemMudanca = 0;
            let resultadosAnteriores = [];

            while ((Date.now() - inicio) < maxTempo) {
                const resultados = Array.from(document.querySelectorAll('div[role="row"] span[title]'))
                    .filter(el => el.title && normalizarTexto(el.title).includes(nomeNorm));

                // Se a lista estiver estável (mesmo array ou mesmo comprimento) por algumas interações, assume completa
                if (resultados.length === ultimaQtdResultados &&
                    resultados.every((el, idx) => el === resultadosAnteriores[idx])) {
                    contadorSemMudanca++;
                    if (contadorSemMudanca >= 5) {
                        // estabilidade detectada
                        if (resultados.length > 0) {
                            cliqueReal(resultados[0]);
                            await esperar(150);
                            return resultados[0];
                        } else {
                            break;
                        }
                    }
                } else {
                    // Resetar contador se mudou
                    contadorSemMudanca = 0;
                }

                ultimaQtdResultados = resultados.length;
                resultadosAnteriores = resultados;

                await esperar(150);
            }

            // Caso não tenha encontrado o grupo na lista estável, tenta encontrar qualquer resultado e clicar
            const ultimaLista = Array.from(document.querySelectorAll('div[role="row"] span[title]'))
                .filter(el => el.title && normalizarTexto(el.title).includes(nomeNorm));
            if (ultimaLista.length > 0) {
                cliqueReal(ultimaLista[0]);
                await esperar(150);
                return ultimaLista[0];
            }

            // Falha
            console.warn(`Grupo "${nomeGrupo}" não encontrado após espera.`);
            await limparAntesDeDigitar(inputPesquisa);
            return null;

        } catch (e) {
            console.error('Erro buscarGrupoPorPesquisa:', e);
            const inputPesquisa = document.querySelector('input[aria-label="Pesquisar ou começar uma nova conversa"]');
            if (inputPesquisa) await limparAntesDeDigitar(inputPesquisa);
            return null;
        }
    }

    function inserirTextoNaCaixa(caixa, texto) {
        caixa.focus();
        caixa.innerText = texto;
        const event = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            data: texto,
            inputType: 'insertText',
        });
        caixa.dispatchEvent(event);
    }

    async function esperarEnvioCompleto(caixa, timeoutMs = 8000) {
        const inicio = Date.now();
        while ((Date.now() - inicio) < timeoutMs) {
            if (!caixa.innerText || caixa.innerText.trim() === '') {
                return true;
            }
            await esperar(150);
        }
        console.warn('Timeout aguardando campo de mensagem vazio (envio completo).');
        return false;
    }

    async function enviarMensagem(nomeGrupo, mensagem) {
        try {
            const grupoElemento = await buscarGrupoPorPesquisa(nomeGrupo);
            if (!grupoElemento) {
                console.warn(`Grupo "${nomeGrupo}" não encontrado na pesquisa`);
                return false;
            }
            const caixa = await esperarElemento('div[contenteditable="true"][data-tab="10"]');
            if (!caixa) {
                console.error('Caixa de mensagem não encontrada!');
                return false;
            }
            inserirTextoNaCaixa(caixa, mensagem);
            await esperar(10);

            const tecladoEnviar = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true
            });
            caixa.dispatchEvent(tecladoEnviar);

            const enviado = await esperarEnvioCompleto(caixa, 8000);
            if (!enviado) {
                console.warn('Falha ou timeout no envio da mensagem no grupo:', nomeGrupo);
            } else {
                console.log(`Mensagem enviada para: ${nomeGrupo}`);
            }

            const inputPesquisa = document.querySelector('input[aria-label="Pesquisar ou começar uma nova conversa"]');
            if (inputPesquisa) await limparAntesDeDigitar(inputPesquisa);

            return enviado;
        } catch (e) {
            console.error('Erro em enviarMensagem:', e);
            const inputPesquisa = document.querySelector('input[aria-label="Pesquisar ou começar uma nova conversa"]');
            if (inputPesquisa) await limparAntesDeDigitar(inputPesquisa);
            return false;
        }
    }

    // === Popup animado moderno limpo e mais fino ===

    let loadingContainerAnim = null;
    let loadingTexto = null;

    function criarPopupAnimadoAnim(textoInicial, corTexto = '#333333', corFundo = '#e3e6e8') {
        if (loadingContainerAnim) return;

        loadingContainerAnim = document.createElement('div');
        loadingContainerAnim.style.position = 'fixed';
        loadingContainerAnim.style.bottom = '10px';
        loadingContainerAnim.style.right = '70px';
        loadingContainerAnim.style.minWidth = '220px';
        loadingContainerAnim.style.maxWidth = '260px';
        loadingContainerAnim.style.padding = '6px 12px';
        loadingContainerAnim.style.backgroundColor = corFundo;
        loadingContainerAnim.style.color = corTexto;
        loadingContainerAnim.style.borderRadius = '10px';
        loadingContainerAnim.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
        loadingContainerAnim.style.fontFamily = "'Roboto', sans-serif";
        loadingContainerAnim.style.fontWeight = '300';
        loadingContainerAnim.style.fontSize = '13px';
        loadingContainerAnim.style.lineHeight = '1.3';
        loadingContainerAnim.style.userSelect = 'none';
        loadingContainerAnim.style.cursor = 'default';
        loadingContainerAnim.style.zIndex = '999999';
        loadingContainerAnim.style.display = 'flex';
        loadingContainerAnim.style.alignItems = 'center';
        loadingContainerAnim.style.justifyContent = 'center';
        loadingContainerAnim.style.whiteSpace = 'nowrap';
        loadingContainerAnim.style.pointerEvents = 'auto';

        loadingTexto = document.createElement('div');
        loadingTexto.textContent = textoInicial;
        loadingTexto.style.flex = '1';
        loadingTexto.style.overflow = 'hidden';
        loadingTexto.style.textOverflow = 'ellipsis';
        loadingTexto.style.paddingBottom = '1px';
        loadingContainerAnim.appendChild(loadingTexto);

        if (fecharComCliqueHandler) {
            document.removeEventListener('click', fecharComCliqueHandler);
            fecharComCliqueHandler = null;
        }

        fecharComCliqueHandler = (event) => {
            if (!automacaoRodando && loadingContainerAnim) {
                fecharPopupAnimado();
            }
        };
        document.addEventListener('click', fecharComCliqueHandler);

        document.body.appendChild(loadingContainerAnim);

        loadingContainerAnim.style.opacity = '0';
        loadingContainerAnim.style.transform = 'translateY(12px)';
        setTimeout(() => {
            loadingContainerAnim.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            loadingContainerAnim.style.opacity = '1';
            loadingContainerAnim.style.transform = 'translateY(0)';
        }, 10);
    }

    async function atualizarTextoPopup(textoNovo, fecharDepois = false, delayAntesEntrada = 0, fecharDepoisClicar = false) {
        if (!loadingTexto || !loadingContainerAnim) return;
        loadingTexto.style.opacity = '0';
        loadingTexto.style.transform = 'translateY(-6px)';
        await esperar(250);

        const textoLower = textoNovo.toLowerCase();
        if (textoLower.includes('envios finalizados') || textoLower.includes('envios finalizado')) {
            loadingContainerAnim.style.backgroundColor = '#d0f0d9';
            loadingTexto.style.color = '#2c5d2d';
        } else if (textoLower.includes('key valida')) {
            loadingContainerAnim.style.backgroundColor = '#d0f0e1';
            loadingTexto.style.color = '#333333';
        } else if (textoLower.includes('key invalida')) {
            loadingContainerAnim.style.backgroundColor = '#d9534f';
            loadingTexto.style.color = '#ffffff';
        } else {
            loadingContainerAnim.style.backgroundColor = '#e3e6e8';
            loadingTexto.style.color = '#333333';
        }

        loadingTexto.textContent = textoNovo;
        loadingTexto.style.opacity = '1';
        loadingTexto.style.transform = 'translateY(0)';
        if (fecharDepois) {
            setTimeout(() => {
                if (!automacaoRodando) {
                    fecharPopupAnimado();
                }
            }, 3500);
        }
        popupPrioritarioAtivo = false;
    }

    function fecharPopupAnimado() {
        if (!loadingContainerAnim) return;
        loadingContainerAnim.style.opacity = '0';
        loadingContainerAnim.style.transform = 'translateY(12px)';
        setTimeout(() => {
            if (loadingContainerAnim) {
                loadingContainerAnim.remove();
                loadingContainerAnim = null;
                loadingTexto = null;
            }
            popupPrioritarioAtivo = false;
        }, 350);
        if (fecharComCliqueHandler) {
            document.removeEventListener('click', fecharComCliqueHandler);
            fecharComCliqueHandler = null;
        }
    }

    async function verificarKeyAutorizadaComPopup() {
        if (!loadingContainerAnim) {
            criarPopupAnimadoAnim('VALIDANDO KEY...', '#333333', '#e3e6e8');
        }
        const keyOK = await verificarKeyAutorizada();
        if (keyOK) {
            await atualizarTextoPopup('KEY VALIDA', false, 1000, false);
            await esperar(1500);
            await atualizarTextoPopup('Enviando mensagens', false, 100, false);
            await esperar(1200);
            return true;
        } else {
            await atualizarTextoPopup('KEY INVALIDA', false, 0, true);
            return false;
        }
    }

    let popupRelatorioFinalEl = null;
    function criarPopupRelatorioFinal(texto, nomeEnvio = null) {
        if (popupRelatorioFinalEl) {
            popupRelatorioFinalEl.remove();
            popupRelatorioFinalEl = null;
        }
        popupRelatorioFinalEl = document.createElement('div');
        popupRelatorioFinalEl.style.position = 'fixed';
        popupRelatorioFinalEl.style.top = '50%';
        popupRelatorioFinalEl.style.left = '50%';
        popupRelatorioFinalEl.style.transform = 'translate(-50%, -50%)';
        popupRelatorioFinalEl.style.backgroundColor = '#f9f9f9';
        popupRelatorioFinalEl.style.color = '#333333';
        popupRelatorioFinalEl.style.padding = '25px 30px';
        popupRelatorioFinalEl.style.borderRadius = '16px';
        popupRelatorioFinalEl.style.boxShadow = '0 5px 15px rgba(0,0,0,0.15)';
        popupRelatorioFinalEl.style.zIndex = '1000000';
        popupRelatorioFinalEl.style.width = 'calc(100vw - 60px)';
        popupRelatorioFinalEl.style.maxWidth = '600px';
        popupRelatorioFinalEl.style.maxHeight = '85vh';
        popupRelatorioFinalEl.style.overflowY = 'auto';
        popupRelatorioFinalEl.style.fontFamily = "'Roboto', sans-serif";
        popupRelatorioFinalEl.style.display = 'flex';
        popupRelatorioFinalEl.style.flexDirection = 'column';
        popupRelatorioFinalEl.style.userSelect = 'text';

        const title = document.createElement('h2');
        if (nomeEnvio) {
            title.textContent = `Envios de ${nomeEnvio} Finalizados`;
        } else {
            title.textContent = 'Relatório Final de Envios';
        }
        title.style.fontWeight = '600';
        title.style.margin = '0 0 20px 0';
        title.style.fontSize = '20px';
        title.style.color = '#4a90e2';
        popupRelatorioFinalEl.appendChild(title);

        const textarea = document.createElement('textarea');
        textarea.style.flex = '1';
        textarea.style.width = '100%';
        textarea.style.minHeight = '400px';
        textarea.style.resize = 'vertical';
        textarea.style.backgroundColor = '#fff';
        textarea.style.color = '#222';
        textarea.style.border = '1px solid #ddd';
        textarea.style.borderRadius = '10px';
        textarea.style.padding = '15px';
        textarea.style.fontSize = '14px';
        textarea.style.lineHeight = '1.4';
        textarea.style.fontFamily = "'Roboto', monospace";
        textarea.style.boxSizing = 'border-box';
        textarea.readOnly = true;
        textarea.value = texto;
        popupRelatorioFinalEl.appendChild(textarea);

        const btnFechar = document.createElement('button');
        btnFechar.textContent = 'Fechar';
        btnFechar.style.marginTop = '20px';
        btnFechar.style.alignSelf = 'flex-end';
        btnFechar.style.padding = '10px 18px';
        btnFechar.style.backgroundColor = '#4a90e2';
        btnFechar.style.color = '#fff';
        btnFechar.style.border = 'none';
        btnFechar.style.borderRadius = '12px';
        btnFechar.style.fontSize = '15px';
        btnFechar.style.fontWeight = '600';
        btnFechar.style.cursor = 'pointer';
        btnFechar.style.transition = 'background-color 0.3s ease';
        btnFechar.addEventListener('mouseenter', () => {
            btnFechar.style.backgroundColor = '#3a78c2';
        });
        btnFechar.addEventListener('mouseleave', () => {
            btnFechar.style.backgroundColor = '#4a90e2';
        });
        btnFechar.addEventListener('click', () => {
            popupRelatorioFinalEl.remove();
            popupRelatorioFinalEl = null;
        });
        popupRelatorioFinalEl.appendChild(btnFechar);

        document.body.appendChild(popupRelatorioFinalEl);
    }

    async function dispararMensagens() {
        automacaoRodando = true;
        const keyOK = await verificarKeyAutorizadaComPopup();
        if (!keyOK) {
            console.warn('Mensagens nao serao enviadas.');
            automacaoRodando = false;
            return;
        }

        const erros = [];
        let totalEnviados = 0;
        let totalFalhas = 0;

        try {
            console.log('Buscando dados...');
            const res = await fetch(planilhaURL);
            const texto = await res.text();
            const json = JSON.parse(texto.substring(47).slice(0, -2));
            const rows = json.table.rows;
            if (!rows || rows.length === 0) {
                console.warn('Planilha vazia');
                if (loadingContainerAnim) {
                    loadingContainerAnim.remove();
                    loadingContainerAnim = null;
                }
                criarPopupRelatorioFinal('Planilha está vazia, nada para enviar.');
                automacaoRodando = false;
                return;
            }
            console.log(`Total de linhas: ${rows.length}`);

            for (let i = 1; i < rows.length; i++) {
                const grupo = rows[i].c[1]?.v || '';
                const mensagem = rows[i].c[3]?.v || '';
                if (grupo && mensagem) {
                    console.log(`Enviando para "${grupo}": ${mensagem}`);
                    try {
                        const sucesso = await enviarMensagem(grupo, mensagem);
                        if (sucesso) {
                            totalEnviados++;
                        } else {
                            totalFalhas++;
                            erros.push(`Falha ao enviar mensagem para o grupo: "${grupo}"`);
                        }
                    } catch (e) {
                        totalFalhas++;
                        erros.push(`Erro ao enviar para o grupo "${grupo}": ${e.message || e}`);
                    }
                    await esperar(500);
                }
            }

            if (loadingTexto && loadingContainerAnim) {
                await atualizarTextoPopup('Envios Finalizados', false, 0, false);
            }

            const celulaB1 = rows[0]?.c[1]?.v || null;
            function extrairNomeEnvio(nomeCompleto) {
                if (!nomeCompleto) return null;
                const match = nomeCompleto.match(/\(([^)]+)\)/);
                return match ? match[1] : null;
            }
            const nomeEnvio = extrairNomeEnvio(celulaB1);

            let relatorio = '';
            relatorio += (nomeEnvio ? nomeEnvio + '\n\n' : '');
            relatorio += `${totalEnviados} listas e mensagens enviadas\n`;
            relatorio += `${totalFalhas} erros encontrados\n\n`;
            if (erros.length > 0) {
                relatorio += 'Detalhamento dos erros:\n';
                relatorio += erros.join('\n');
            }

            criarPopupRelatorioFinal(relatorio, nomeEnvio);

            console.log('Relatório final:\n' + relatorio);

        } catch (e) {
            console.error('Erro ao buscar planilha:', e);
            if (loadingContainerAnim) {
                loadingContainerAnim.remove();
                loadingContainerAnim = null;
            }
            criarPopupRelatorioFinal(`Erro inesperado ao processar a planilha: ${e.message || e}`);
        }
        automacaoRodando = false;
    }

    async function verificarKeyAutorizada() {
        try {
            const res = await fetch(planilhaURL);
            const texto = await res.text();
            const json = JSON.parse(texto.substring(47).slice(0, -2));
            const rows = json.table.rows;
            for (let i = 0; i < rows.length; i++) {
                const key = rows[i].c[4]?.v || '';
                if (key === MINHA_KEY) {
                    console.log('KEY autorizada');
                    return true;
                }
            }
            console.warn('KEY nao autorizada');
            return false;
        } catch (e) {
            console.error('Erro ao verificar a KEY:', e);
            return false;
        }
    }

    let ultimoValorA1 = null;

    async function carregarValorInicialA1() {
        try {
            const res = await fetch(planilhaURL);
            const texto = await res.text();
            const json = JSON.parse(texto.substring(47).slice(0, -2));
            ultimoValorA1 = json.table.rows[0]?.c[0]?.v || '';
            console.log(`Valor inicial da célula A1: "${ultimoValorA1}"`);
        } catch (e) {
            console.error('Erro ao carregar valor inicial da celula A1:', e);
        }
    }

    async function verificarMudanca() {
        try {
            const res = await fetch(planilhaURL);
            const texto = await res.text();
            const json = JSON.parse(texto.substring(47).slice(0, -2));
            const novoValor = json.table.rows[0]?.c[0]?.v || '';
            console.log(`Monitorando célula A1 - Último: "${ultimoValorA1}", Atual: "${novoValor}"`);
            if (novoValor !== ultimoValorA1) {
                console.log('Ação detectada! Disparo iniciado.');
                ultimoValorA1 = novoValor;
                await dispararMensagens();
            }
        } catch (e) {
            console.error('Erro ao verificar atualização:', e);
        }
    }

    (async () => {
        await carregarValorInicialA1();
        setInterval(verificarMudanca, 5000);
    })();

    window.dispararMensagens = dispararMensagens;
    window.enviarMensagem = enviarMensagem;
    window.buscarGrupoPorPesquisa = buscarGrupoPorPesquisa;

    console.log('Monitoramento iniciado aguardando ação.');

})();

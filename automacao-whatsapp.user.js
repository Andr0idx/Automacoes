// ==UserScript==
// @name         Automação WhatsApp Biel
// @namespace    http://github.com
// @version      1.1
// @description  Envia mensagem no WhatsApp buscando grupo pela barra de pesquisa, com clique após a busca e verificação de chave (KEY) na planilha, operação iniciada por botão no sheets
// @author       Gabriel Guedes Araujo da Silva
// @match        https://web.whatsapp.com/*
// @grant        none
// ==/UserScript==

const planilhaURL = 'https://docs.google.com/spreadsheets/d/1ST5rfClXrd8lEwQqjsRaFMeIwJ4M_yH7pWsVIlbqIMk/gviz/tq?tqx=out:json&sheet=Fila';

// Função para obter a chave única do localStorage ou pedir para o usuário na primeira vez
function getMinhaKey() {
    let key = localStorage.getItem('MINHA_KEY');
    if (!key) {
        key = prompt('Digite sua chave única (MINHA_KEY):');
        if (key) {
            localStorage.setItem('MINHA_KEY', key);
            console.log('🗝️ MINHA_KEY salva no localStorage.');
        } else {
            alert('Chave única é obrigatória para continuar.');
            throw new Error('MINHA_KEY não fornecida. Script parado.');
        }
    }
    return key;
}

const MINHA_KEY = getMinhaKey();

(function () {
    console.log('🚀 Robo de Biel rodando!');

    let iconeMarcaDagua = null;
    let textoMarcaDagua = null;

    function adicionarIconeMarcaDagua() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.bottom = '10px';
        container.style.right = '25px';
        container.style.width = '280px';
        container.style.height = '40px';
        container.style.overflow = 'hidden';
        container.style.zIndex = '9999';
        container.style.userSelect = 'none';
        container.style.pointerEvents = 'none';

        const textoContainer = document.createElement('div');

        textoContainer.style.position = 'absolute';
        textoContainer.style.top = '55%';
        textoContainer.style.right = '30px';
        textoContainer.style.transform = 'translateY(-50%)';
        textoContainer.style.overflow = 'hidden';
        textoContainer.style.zIndex = '1';

        textoMarcaDagua = document.createElement('div');
        textoMarcaDagua.style.whiteSpace = 'nowrap';
        textoMarcaDagua.innerHTML = 'ESTÁGISCRAVO DE BIEL ATIVO!<span style="display:inline-block; width:5px;"></span>'; // mensagem única em cada pc
        textoMarcaDagua.style.color = '#FFFFFF';
        textoMarcaDagua.style.backgroundColor = '#25D366';
        textoMarcaDagua.style.padding = '4px 10px';
        textoMarcaDagua.style.borderRadius = '20px';
        textoMarcaDagua.style.fontWeight = 'bold';
        textoMarcaDagua.style.fontSize = '16px';
        textoMarcaDagua.style.whiteSpace = 'nowrap';
        textoMarcaDagua.style.opacity = '1';
        textoMarcaDagua.style.transform = 'translateX(100%) scale(0.8)';
        textoMarcaDagua.style.transition = 'transform 1s ease-in-out, opacity 1s ease';
        textoContainer.appendChild(textoMarcaDagua);

        const iconeContainer = document.createElement('div');
        iconeContainer.style.position = 'absolute';
        iconeContainer.style.top = '50%';
        iconeContainer.style.right = '0';
        iconeContainer.style.transform = 'translateY(-50%)';
        iconeContainer.style.zIndex = '2';

        iconeMarcaDagua = document.createElement('div');
        iconeMarcaDagua.textContent = '🤖';
        iconeMarcaDagua.style.fontSize = '30px';
        iconeMarcaDagua.style.opacity = '1';
        iconeMarcaDagua.style.transition = 'opacity 1s ease';
        iconeContainer.appendChild(iconeMarcaDagua);

        container.appendChild(textoContainer);
        container.appendChild(iconeContainer);
        document.body.appendChild(container);

        setTimeout(() => {
            textoMarcaDagua.style.transform = 'translateX(calc(12% - 2px)) scale(0.8)';
        }, 100);

        setTimeout(() => {
            textoMarcaDagua.style.transform = 'translateX(100%) scale(0.8)';
        }, 4000);

        setTimeout(() => {
            iconeMarcaDagua.style.opacity = '0.15';
        }, 5200);

        setTimeout(() => {
            textoMarcaDagua.style.opacity = '0';
        }, 5600);
    }
    adicionarIconeMarcaDagua();

    function esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function cliqueReal(elemento) {
        ['mouseover', 'mousedown', 'mouseup', 'click'].forEach(eventoTipo => {
            const evento = new MouseEvent(eventoTipo, {
                view: window,
                bubbles: true,
                cancelable: true
            });
            elemento.dispatchEvent(evento);
        });
    }

    async function buscarGrupoPorPesquisa(nomeGrupo) {
        const barraPesquisa = document.querySelector('div[contenteditable="true"][data-tab="3"]');
        if (!barraPesquisa) {
            console.error('❌ Barra de pesquisa não encontrada!');
            return null;
        }

        barraPesquisa.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
        await esperar(500);

        document.execCommand('insertText', false, nomeGrupo);
        await esperar(1500);

        document.execCommand('delete', false, null);
        await esperar(800);

        document.execCommand('insertText', false, nomeGrupo.slice(-1));
        await esperar(2000);

        const resultados = Array.from(document.querySelectorAll('span[title]'));
        const grupoElemento = resultados.find(el => el.title.toLowerCase() === nomeGrupo.toLowerCase()) || null;

        if (grupoElemento) {
            console.log(`👆 Encontrado grupo "${nomeGrupo}". Abrindo...`);
            cliqueReal(grupoElemento);
            await esperar(3000);
            return grupoElemento;
        } else {
            console.warn(`⚠️ Grupo "${nomeGrupo}" não encontrado.`);
            return null;
        }
    }

    function inserirQuebraDeLinha() {
        const keyboardEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            shiftKey: true,
            bubbles: true,
            cancelable: true
        });
        const input = document.querySelector('[contenteditable="true"][data-tab="10"]');
        input.dispatchEvent(keyboardEvent);
    }

    async function enviarMensagem(nomeGrupo, mensagem) {
        const grupoElemento = await buscarGrupoPorPesquisa(nomeGrupo);
        if (!grupoElemento) {
            console.warn(`❌ Grupo "${nomeGrupo}" não encontrado na pesquisa`);
            return;
        }

        const caixa = document.querySelector('[contenteditable="true"][data-tab="10"]');
        if (!caixa) {
            console.error('❌ Caixa de mensagem não encontrada!');
            return;
        }

        caixa.focus();

        for (const linha of mensagem.split('\n')) {
            document.execCommand('insertText', false, linha);
            inserirQuebraDeLinha();
            await esperar(100);
        }

        await esperar(500);

        const botao = document.querySelector('span[data-icon="send"]');
        if (botao) {
            botao.click();
            console.log(`Mensagem enviada para: ${nomeGrupo}`);
        } else {
            console.warn('⚠️ Botão de enviar não encontrado!');
        }

        const barraPesquisa = document.querySelector('div[contenteditable="true"][data-tab="3"]');
        if (barraPesquisa) {
            barraPesquisa.focus();
            document.execCommand('selectAll', false, null);
            document.execCommand('delete', false, null);
        }
    }

    let loadingContainerAnim = null;
    let loadingTexto = null;
    let fecharComCliqueHandler = null;

    function criarPopupAnimadoAnim(textoInicial, corTexto = '#FFFFFF', corFundo = '#25D366') {
        if (loadingContainerAnim) return;

        loadingContainerAnim = document.createElement('div');
        loadingContainerAnim.style.position = 'fixed';
        loadingContainerAnim.style.bottom = '8px';
        loadingContainerAnim.style.right = '20px';
        loadingContainerAnim.style.width = '500px';
        loadingContainerAnim.style.height = '40px';
        loadingContainerAnim.style.overflow = 'hidden';
        loadingContainerAnim.style.zIndex = '9998';
        loadingContainerAnim.style.userSelect = 'none';
        loadingContainerAnim.style.pointerEvents = 'none';

        const textoContainer = document.createElement('div');
        textoContainer.style.position = 'absolute';
        textoContainer.style.top = '50%';
        textoContainer.style.right = '30px';
        textoContainer.style.transform = 'translateY(-50%)';
        textoContainer.style.overflow = 'hidden';
        textoContainer.style.zIndex = '1';

        loadingTexto = document.createElement('div');
        loadingTexto.innerHTML = textoInicial + '<span style="display:inline-block; width:10px;"></span>';
        loadingTexto.style.color = corTexto;
        loadingTexto.style.backgroundColor = corFundo;
        loadingTexto.style.padding = '6px 12px';
        loadingTexto.style.borderRadius = '20px';
        loadingTexto.style.fontWeight = 'bold';
        loadingTexto.style.fontSize = '14px';
        loadingTexto.style.whiteSpace = 'nowrap';
        loadingTexto.style.opacity = '1';
        loadingTexto.style.transform = 'translateX(100%) scale(0.8)';
        loadingTexto.style.transition = 'transform 1.0s ease-in-out, opacity 1.0s ease';

        textoContainer.appendChild(loadingTexto);
        loadingContainerAnim.appendChild(textoContainer);
        document.body.appendChild(loadingContainerAnim);

        setTimeout(() => {
            loadingTexto.style.transform = 'translateX(calc(12% - 2px)) scale(0.8)';
            loadingTexto.style.opacity = '1';
            if (iconeMarcaDagua) iconeMarcaDagua.style.opacity = '1';
        }, 100);
    }

    async function atualizarTextoPopup(textoNovo, fecharDepois = false, delayAntesEntrada = 0, fecharDepoisClicar = false, corTexto = '#FFFFFF', corFundo = '#25D366') {
        if (!loadingTexto) return;

        loadingTexto.style.transform = 'translateX(100%) scale(0.8)';
        loadingTexto.style.opacity = '0';

        if (iconeMarcaDagua) {
            iconeMarcaDagua.style.transition = 'opacity 1s ease';
            iconeMarcaDagua.style.opacity = '0.15';
        }

        await esperar(290);

        if (loadingContainerAnim) {
            loadingContainerAnim.remove();
            loadingContainerAnim = null;
            loadingTexto = null;
        }

        if (delayAntesEntrada > 0) {
            await esperar(delayAntesEntrada);
        }

        if (!fecharDepois && !fecharDepoisClicar) {
            criarPopupAnimadoAnim(textoNovo, corTexto, corFundo);
        }

        if (fecharDepois) {
            criarPopupAnimadoAnim(textoNovo, corTexto, corFundo);
            setTimeout(() => {
                fecharPopupAnimado();
            }, 4000);
        }

        if (fecharDepoisClicar) {
            criarPopupAnimadoAnim(textoNovo, corTexto, corFundo);

            fecharComCliqueHandler = () => {
                fecharPopupAnimado();
                document.removeEventListener('click', fecharComCliqueHandler);
                fecharComCliqueHandler = null;
            };
            document.addEventListener('click', fecharComCliqueHandler);
        }
    }

    function fecharPopupAnimado() {
        if (!loadingTexto || !loadingContainerAnim) return;

        loadingTexto.style.transform = 'translateX(100%) scale(0.8)';
        loadingTexto.style.opacity = '0';

        if (iconeMarcaDagua) {
            iconeMarcaDagua.style.transition = 'opacity 1s ease';
            iconeMarcaDagua.style.opacity = '0.15';
        }

        setTimeout(() => {
            if (loadingContainerAnim) {
                loadingContainerAnim.remove();
                loadingContainerAnim = null;
                loadingTexto = null;
            }

            if (fecharComCliqueHandler) {
                document.removeEventListener('click', fecharComCliqueHandler);
                fecharComCliqueHandler = null;
            }
        }, 600);
    }

    async function verificarKeyAutorizadaComPopup() {
        criarPopupAnimadoAnim('VALIDANDO KEY...', '#FFFFFF', '#25D366');
        const keyOK = await verificarKeyAutorizada();

        if (keyOK) {
            await atualizarTextoPopup('KEY VÁLIDA', false, 1000, false, '#FFFFFF', '#25D366');
            await esperar(2000);
            await atualizarTextoPopup('MENSAGENS SENDO ENVIADAS... RELAXA AI E NÃO SAI DESSA TELA', false, 100, false, '#FFFFFF', '#25D366');
            await esperar(1200);
            return true;
        } else {
            await atualizarTextoPopup('KEY INVÁLIDA', false, 0, true, '#FFFFFF', '#d63031');
            return false;
        }
    }

    async function dispararMensagens() {
        const keyOK = await verificarKeyAutorizadaComPopup();
        if (!keyOK) {
            console.warn('🚫 Mensagens não serão enviadas.');
            return;
        }

        try {
            console.log('⏳ Buscando dados...');
            const res = await fetch(planilhaURL);
            const texto = await res.text();
            const json = JSON.parse(texto.substring(47).slice(0, -2));
            const rows = json.table.rows;

            if (!rows || rows.length === 0) {
                console.warn('⚠️ Planilha vazia');
                if (loadingContainerAnim) {
                    loadingContainerAnim.remove();
                    loadingContainerAnim = null;
                }
                return;
            }

            console.log(`📊 Total de linhas: ${rows.length}`);

            for (let i = 1; i < rows.length; i++) {
                const grupo = rows[i].c[1]?.v || '';
                const mensagem = rows[i].c[3]?.v || '';

                if (grupo && mensagem) {
                    console.log(`📨 Enviando para "${grupo}": ${mensagem}`);
                    await enviarMensagem(grupo, mensagem);
                    await esperar(800);
                }
            }

            await atualizarTextoPopup('MENSAGENS ENVIADAS', false, 0, true);

        } catch (e) {
            console.error('❌ Erro ao buscar planilha:', e);
            if (loadingContainerAnim) {
                loadingContainerAnim.remove();
                loadingContainerAnim = null;
            }
        }
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
                    console.log(`🔐 KEY autorizada`);
                    return true;
                }
            }

            console.warn('🚫 KEY não autorizada');
            return false;
        } catch (e) {
            console.error('❌ Erro ao verificar a KEY:', e);
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
            console.log(`🔄 Valor inicial: "${ultimoValorA1}"`);
        } catch (e) {
            console.error('❌ Erro ao carregar valor inicial da célula A1:', e);
        }
    }

    async function verificarMudanca() {
        try {
            const res = await fetch(planilhaURL);
            const texto = await res.text();
            const json = JSON.parse(texto.substring(47).slice(0, -2));
            const novoValor = json.table.rows[0]?.c[0]?.v || '';

            console.log(`🔄 Monitorando: "${ultimoValorA1}", Atualização: "${novoValor}"`);

            if (novoValor !== ultimoValorA1) {
                console.log('📢 Ação detectada! Disparo iniciado');
                ultimoValorA1 = novoValor;
                await dispararMensagens();
            }
        } catch (e) {
            console.error('❌ Erro ao verificar atualização:', e);
        }
    }

    (async () => {
        await carregarValorInicialA1();
        setInterval(verificarMudanca, 5000);
    })();

    window.dispararMensagens = dispararMensagens;

    console.log('🔍 Monitoramento iniciado aguardando ação');
})();
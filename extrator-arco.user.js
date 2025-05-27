// ==UserScript==
// @name         Extrator ARCO
// @namespace    https://github.com/Andr0idx/Automacoes
// @version      1.1
// @description  Extrai dados Na base e Na rua do Arco Loggi com melhorias visuais e animações inspiradas no ESTÁGISCRAVO. Abrindo abas sequencialmente, coleta dados via postMessage, botão inicia extração e log visual aprimorado.
// @author       Gabriel Guedes Araujo da Sila
// @match        https://arco.loggi.com/*/na-base/colecoes
// @match        https://arco.loggi.com/*/na-rua/colecoes
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Andr0idx/Automacoes/main/extrator-arco.user.js
// @downloadURL  https://raw.githubusercontent.com/Andr0idx/Automacoes/main/extrator-arco.user.js
// ==/UserScript==

(function () {
    'use strict';

    const sheetId = '1ST5rfClXrd8lEwQqjsRaFMeIwJ4M_yH7pWsVIlbqIMk';
    const gid = '827520507';
    const urlPlanilha = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;
    const TIMEOUT_MS = 120000;

    let iconeMarcaDagua = null;
    let textoMarcaDagua = null;
    let loadingContainerAnim = null;
    let loadingTexto = null;
    let fecharComCliqueHandler = null;

    function esperar(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function extrairNumero(texto) {
        if (!texto) return null;
        const match = texto.match(/[\d.]+/);
        if (!match) return null;
        return parseInt(match[0].replace(/\./g, ''), 10);
    }

    function mostrarBanner(texto) {
        const id = '__arco_loggi_banner__';
        const bannerExistente = document.getElementById(id);
        if (bannerExistente) bannerExistente.remove();

        const banner = document.createElement('div');
        banner.id = id;
        Object.assign(banner.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            backgroundColor: '#00baff', // ALTERADO para azul
            color: 'white',
            padding: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            whiteSpace: 'pre-line',
            zIndex: 10000,
            textAlign: 'center',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        });
        banner.textContent = texto;
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 15000);
    }

    function adicionarIconeMarcaDagua() {
        if (iconeMarcaDagua) return;

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
        textoMarcaDagua.innerHTML = 'EXTRATOR ARCO LOGGI ATIVO!<span style="display:inline-block; width:5px;"></span>';
        textoMarcaDagua.style.color = '#FFFFFF';
        textoMarcaDagua.style.backgroundColor = '#00baff'; // ALTERADO para azul
        textoMarcaDagua.style.padding = '4px 10px';
        textoMarcaDagua.style.borderRadius = '20px';
        textoMarcaDagua.style.fontWeight = 'bold';
        textoMarcaDagua.style.fontSize = '16px';
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

    function criarPopupAnimadoAnim(textoInicial, corTexto = '#FFFFFF', corFundo = '#00baff') { // ALTERADO para azul
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

    async function atualizarTextoPopup(textoNovo, fecharDepois = false, delayAntesEntrada = 0, fecharDepoisClicar = false, corTexto = '#FFFFFF', corFundo = '#00baff') { // ALTERADO para azul
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

    function logVisual(titulo, detalhes, cor = 'green') {
        console.groupCollapsed(`%c${titulo}`, `color: ${cor}; font-weight: bold; font-size: 14px`);
        console.log(detalhes);
        console.groupEnd();

        const textoPopup = `${titulo}\n${(typeof detalhes === 'string' && detalhes.length < 80) ? detalhes : ''}`;
        atualizarTextoPopup(textoPopup, false, 0, false, '#FFFFFF', cor === 'green' ? '#00baff' : '#d63031'); // ALTERADO para azul
    }

    // ... restante do código inalterado ...

    async function esperarElemento(seletor, timeoutMs = 10000) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(seletor)) return resolve(true);

            const observer = new MutationObserver(() => {
                if (document.querySelector(seletor)) {
                    observer.disconnect();
                    resolve(true);
                }
            });

            observer.observe(document, { childList: true, subtree: true });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timeout esperando seletor: ${seletor}`));
            }, timeoutMs);
        });
    }

    // ... o resto do código permanece igual, apenas as instâncias do verde '#25D366' foram alteradas para '#00baff' onde aplicável ...

    async function main() {
        adicionarIconeMarcaDagua();

        if (window.opener && !window.opener.closed) {
            await extrairDadosNaPaginaAtualParaPostMessage();
            return;
        }

        criarBotaoExtrair();

        console.log('%c🚀 Extrator Arco Loggi iniciado', 'color: #00baff; font-weight: bold; font-size: 16px;'); // ALTERADO para azul
        console.log('%cClique no botão azul no canto inferior direito para iniciar a extração.', 'color: #666; font-size: 13px;'); // Modificado texto para azul
    }

    window.ExtratorArcoLoggi = {
        iniciarExtracaoComPermissaoUser,
        extrairDadosNaBase,
        extrairDadosNaRua,
        atualizarTextoPopup,
        fecharPopupAnimado,
    };

    main();
})();

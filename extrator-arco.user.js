// ==UserScript==
// @name         Extrator ARCO
// @namespace    https://github.com/Andr0idx/Automacoes
// @version      1.0
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
            backgroundColor: '#00baff',
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
        container.style.right = '20px';
        container.style.width = '40px';
        container.style.height = '40px';
        container.style.zIndex = '9999';
        container.style.userSelect = 'none';
        container.style.pointerEvents = 'auto';

        iconeMarcaDagua = document.createElement('button');
        iconeMarcaDagua.textContent = '🤖';
        iconeMarcaDagua.style.fontSize = '30px';
        iconeMarcaDagua.style.opacity = '1';
        iconeMarcaDagua.style.transition = 'opacity 1s ease';
        iconeMarcaDagua.style.cursor = 'pointer';
        iconeMarcaDagua.style.border = 'none';
        iconeMarcaDagua.style.background = 'transparent';
        iconeMarcaDagua.style.padding = '0';
        iconeMarcaDagua.style.userSelect = 'none';

        let popupTooltipTimeout = null;
        const TEMPO_POPUP_VISAO_MS = 20000;

        function mostrarPopupTooltip() {
            if (popupTooltipTimeout) {
                clearTimeout(popupTooltipTimeout);
                popupTooltipTimeout = null;
            }
            criarPopupAnimadoAnim('INICIAR EXTRAÇÃO DE DADOS', '#FFFFFF', '#00baff');
            iconeMarcaDagua.style.opacity = '1';
            popupTooltipTimeout = setTimeout(() => {
                fecharPopupAnimado();
                iconeMarcaDagua.style.opacity = '0.15';
                popupTooltipTimeout = null;
            }, TEMPO_POPUP_VISAO_MS);
        }

        iconeMarcaDagua.onmouseenter = () => {
            mostrarPopupTooltip();
        };

        iconeMarcaDagua.onclick = async () => {
            if (iconeMarcaDagua.disabled) return;
            iconeMarcaDagua.disabled = true;

            await atualizarTextoPopup('EXTRAÇÃO DE DADOS INICIADA!', false, 0, false, '#FFFFFF', '#00baff');

            await esperar(1500);

            try {
                await iniciarExtracaoComPermissaoUser();
            } catch (e) {
                console.error(e);
                mostrarBanner('Erro durante extração.');
            } finally {
                iconeMarcaDagua.disabled = false;
            }
        };

        container.appendChild(iconeMarcaDagua);
        document.body.appendChild(container);

        criarPopupAnimadoAnim('EXTRATOR ARCO LOGGI ATIVO!', '#FFFFFF', '#00baff');

        setTimeout(() => {
            fecharPopupAnimado();
            iconeMarcaDagua.style.opacity = '0.15';
        }, TEMPO_POPUP_VISAO_MS);
    }

    function criarPopupAnimadoAnim(textoInicial, corTexto = '#FFFFFF', corFundo = '#00baff') {
        if (loadingContainerAnim) {
            loadingContainerAnim.remove();
            loadingContainerAnim = null;
            loadingTexto = null;
        }

        if (iconeMarcaDagua) {
            iconeMarcaDagua.style.position = 'fixed';
            iconeMarcaDagua.style.zIndex = '10000';
            iconeMarcaDagua.style.pointerEvents = 'auto';
        }

        loadingContainerAnim = document.createElement('div');
        loadingContainerAnim.style.position = 'fixed';
        loadingContainerAnim.style.bottom = '8px';
        loadingContainerAnim.style.right = '45px';
        loadingContainerAnim.style.width = '500px';
        loadingContainerAnim.style.height = '40px';
        loadingContainerAnim.style.overflow = 'hidden';
        loadingContainerAnim.style.zIndex = '9998';
        loadingContainerAnim.style.userSelect = 'none';
        loadingContainerAnim.style.pointerEvents = 'none';
        loadingContainerAnim.style.background = 'transparent';
        loadingContainerAnim.style.boxSizing = 'border-box';

        const textoContainer = document.createElement('div');
        textoContainer.style.position = 'absolute';
        textoContainer.style.top = '50%';
        textoContainer.style.right = '0';
        textoContainer.style.transform = 'translateY(-50%)';
        textoContainer.style.overflow = 'hidden';
        textoContainer.style.zIndex = '1';
        textoContainer.style.whiteSpace = 'nowrap';

        loadingTexto = document.createElement('div');
        loadingTexto.innerHTML = textoInicial + '<span style="display:inline-block; width:10px;"></span>';
        loadingTexto.style.color = corTexto;
        loadingTexto.style.backgroundColor = corFundo;
        loadingTexto.style.padding = '2px 6px';
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
            if (iconeMarcaDagua) {
                iconeMarcaDagua.style.opacity = '1';
            }
        }, 100);

        setTimeout(() => {
            fecharPopupAnimado();
        }, 4000);
    }

    async function atualizarTextoPopup(textoNovo, fecharDepois = false, delayAntesEntrada = 0, fecharDepoisClicar = false, corTexto = '#FFFFFF', corFundo = '#00baff') {
        if (!loadingTexto && !loadingContainerAnim) {
            if (delayAntesEntrada > 0) {
                await esperar(delayAntesEntrada);
            }
            criarPopupAnimadoAnim(textoNovo, corTexto, corFundo);
        } else if (loadingTexto) {
            loadingTexto.style.transform = 'translateX(100%) scale(0.8)';
            loadingTexto.style.opacity = '0';

            if (iconeMarcaDagua) {
                iconeMarcaDagua.style.transition = 'opacity 1s ease';
                iconeMarcaDagua.style.opacity = '0.15';
            }

            await esperar(1000);

            if (loadingContainerAnim) {
                loadingContainerAnim.remove();
                loadingContainerAnim = null;
                loadingTexto = null;
            }

            if (delayAntesEntrada > 0) {
                await esperar(delayAntesEntrada);
            }

            criarPopupAnimadoAnim(textoNovo, corTexto, corFundo);
        }

        if (fecharDepois) {
            setTimeout(() => {
                fecharPopupAnimado();
            }, 4000);
        }

        if (fecharDepoisClicar) {
            fecharComCliqueHandler = (event) => {
                if (!document.hasFocus()) return;
                fecharPopupAnimado();
                document.removeEventListener('click', fecharComCliqueHandler, { capture: true });
                fecharComCliqueHandler = null;
            };
            document.addEventListener('click', fecharComCliqueHandler, { capture: true });
        }
    }

    function fecharPopupAnimado() {
        if (!loadingTexto || !loadingContainerAnim) return;

        loadingTexto.style.transition = 'transform 1.0s ease-in-out, opacity 1.0s ease';

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
                document.removeEventListener('click', fecharComCliqueHandler, { capture: true });
                fecharComCliqueHandler = null;
            }
        }, 1200);
    }

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

    function pegarNumeroPorLabelNaBase(label, contexto = document) {
        const divs = [...contexto.querySelectorAll('div.MuiBox-root')];
        for (const div of divs) {
            const p = div.querySelector('p.MuiTypography-root.MuiTypography-body1');
            if (p && p.textContent.trim().toLowerCase() === label.toLowerCase()) {
                const spanNumero = div.querySelector('h4.MuiTypography-root.MuiTypography-h4 > span.MuiBox-root');
                if (spanNumero) return extrairNumero(spanNumero.textContent);
            }
        }
        return null;
    }

    function baixarCsvResultados(resultados) {
        const cabecalho = [
            'Base',
            'Total de pacotes em base',
            'Em atraso (base)',
            'Para hoje (base)',
            'Total de pacotes na rua',
            'para hoje (na rua)',
            'atrasados (na rua)',
            'Insucessos (na rua)',
        ];

        const linhas = [cabecalho.join(';')];

        for (const sigla of Object.keys(resultados)) {
            const base = resultados[sigla]['EM BASE'] || {};
            const rua = resultados[sigla]['EM RUA'] || {};

            const linha = [
                sigla,
                base.totalNaBase ?? '',
                base.comAtraso ?? '',
                base.paraHoje ?? '',
                rua.naRua ?? '',
                rua.paraHoje ?? '',
                rua.atrasados ?? '',
                rua.insucessos ?? '',
            ];

            linhas.push(linha.join(';'));
        }

        const csvConteudo = linhas.join('\n');
        const blob = new Blob([csvConteudo], { type: 'text/csv;charset=utf-8;' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const dataAtual = new Date();
        const dataFormatada = dataAtual.toISOString().slice(0, 10);
        a.download = `extracao_arco_loggi_${dataFormatada}.csv`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async function extrairDadosNaBase(contexto = document) {
        try {
            await esperarElemento('div.MuiBox-root', 10000);
        } catch {}

        let totalNaBase = null;
        const strong = [...contexto.querySelectorAll('h4.MuiTypography-root.MuiTypography-h4 strong')].find(
            el => el.textContent.trim() === 'Na base'
        );
        if (strong) {
            const h4Pai = strong.closest('h4.MuiTypography-root.MuiTypography-h4');
            if (h4Pai) {
                const container = h4Pai.parentElement;
                if (container) {
                    const outrosH4 = [...container.querySelectorAll('h4.MuiTypography-root.MuiTypography-h4')]
                        .filter(h4 => !h4.querySelector('strong'));
                    if (outrosH4.length > 0) totalNaBase = extrairNumero(outrosH4[0].textContent);
                }
            }
        }
        const paraHoje = pegarNumeroPorLabelNaBase('Para hoje', contexto);
        const comAtraso = pegarNumeroPorLabelNaBase('Com atraso', contexto);
        const paraAmanha = pegarNumeroPorLabelNaBase('Para amanhã', contexto);
        const paraDepois = pegarNumeroPorLabelNaBase('Para depois', contexto);
        return { totalNaBase, paraHoje, comAtraso, paraAmanha, paraDepois };
    }

    function pegarNumeroPorLabelNaRua(label, contexto = document) {
        const h6s = [...contexto.querySelectorAll('h6.MuiTypography-root.MuiTypography-subtitle2')];
        for (const h6 of h6s) {
            if (h6.textContent.trim().toLowerCase() === label.toLowerCase()) {
                let container = h6.closest('div.MuiGrid-root.MuiGrid-item') || h6.parentElement;
                let em = container.querySelector('h2.MuiTypography-root.MuiTypography-h2 em');
                if (!em) {
                    let irmao = container.nextElementSibling;
                    while (irmao && !em) {
                        em = irmao.querySelector('h2.MuiTypography-root.MuiTypography-h2 em');
                        irmao = irmao.nextElementSibling;
                    }
                }
                if (em) return extrairNumero(em.textContent);
            }
        }
        return null;
    }

    function extrairDadosNaRua(contexto = document) {
        let naRua = null;
        const h4Pacotes = [...contexto.querySelectorAll('h4.MuiTypography-root.MuiTypography-h4')].find(h4 =>
            /pacotes/i.test(h4.textContent)
        );
        if (h4Pacotes) naRua = extrairNumero(h4Pacotes.textContent);

        const atrasados = pegarNumeroPorLabelNaRua('Atrasados', contexto);
        const insucessos = pegarNumeroPorLabelNaRua('Insucessos', contexto);
        const paraHoje = pegarNumeroPorLabelNaRua('Para hoje', contexto);
        return { naRua, atrasados, insucessos, paraHoje };
    }

    function isUrlValida(url) {
        return url && /^https?:\/\//i.test(url.trim());
    }

    async function buscarDadosPlanilha() {
        try {
            const response = await fetch(urlPlanilha);
            if (!response.ok) throw new Error(`Erro ao buscar a planilha: ${response.statusText}`);

            const text = await response.text();
            const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/s);
            if (!jsonMatch || jsonMatch.length < 2) throw new Error('Resposta da planilha inválida');
            const data = JSON.parse(jsonMatch[1]);
            return data.table?.rows || [];
        } catch {
            return null;
        }
    }

    async function iniciarExtracaoComPermissaoUser() {
        try {
            const rows = await buscarDadosPlanilha();
            if (!rows || rows.length === 0) {
                console.error('Nenhuma entrada na planilha!');
                return;
            }

            const todasLinhas = rows.slice(1).map((r) => ({
                siglaBase: r.c[0]?.v?.toString().trim() || '',
                nomeGrupo: r.c[1]?.v?.toString().trim() || '',
                linkBase: r.c[2]?.v?.toString().trim() || '',
                linkRua: r.c[3]?.v?.toString().trim() || '',
            }));

            const linhasFiltradas = todasLinhas.filter(linha => linha.siglaBase && linha.siglaBase.length > 0);

            if (linhasFiltradas.length === 0) {
                console.error('Nenhuma base válida!');
                return;
            }

            if (!window.dadosBases) window.dadosBases = {};
            const resultados = window.dadosBases;

            for (const linha of linhasFiltradas) {
                resultados[linha.siglaBase] = resultados[linha.siglaBase] || {};

                async function abrirExtrairFechar(url, tipo) {
                    if (!isUrlValida(url)) return null;

                    const aba = window.open('about:blank', '_blank');
                    if (!aba) {
                        console.error('Bloqueio de pop-ups detectado!');
                        return null;
                    }
                    aba.location.href = url;

                    return new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            window.removeEventListener('message', mensagemHandler);
                            if (!aba.closed) {
                                try { aba.close(); } catch {}
                            }
                            reject(new Error(`Timeout esperando dados da aba [${tipo}]: ${url}`));
                        }, TIMEOUT_MS);

                        function mensagemHandler(event) {
                            if (event.source !== aba) return;

                            clearTimeout(timeout);
                            window.removeEventListener('message', mensagemHandler);

                            resultados[linha.siglaBase][tipo] = event.data || null;

                            if (!aba.closed) {
                                try { aba.close(); } catch {}
                            }

                            resolve(event.data);
                        }

                        window.addEventListener('message', mensagemHandler);
                    });
                }

                try {
                    if (isUrlValida(linha.linkBase)) {
                        await abrirExtrairFechar(linha.linkBase, 'EM BASE');
                    } else {
                        resultados[linha.siglaBase]['EM BASE'] = null;
                    }

                    if (isUrlValida(linha.linkRua)) {
                        await abrirExtrairFechar(linha.linkRua, 'EM RUA');
                    } else {
                        resultados[linha.siglaBase]['EM RUA'] = null;
                    }
                } catch {
                    resultados[linha.siglaBase]['EM BASE'] = resultados[linha.siglaBase]['EM BASE'] || null;
                    resultados[linha.siglaBase]['EM RUA'] = resultados[linha.siglaBase]['EM RUA'] || null;
                }
            }

            await atualizarTextoPopup('EXTRACAO FINALIZADA, CSV DISPONIVEL', false, 0, true, '#FFFFFF', '#00baff');

            console.log('Extracao completa. Resultados:', resultados);
            baixarCsvResultados(resultados);
        } catch {
            console.error('Erro na extracao!');
        }
    }

    async function esperarPorDadosProntos(tipo, timeoutMs = 20000, intervaloMs = 500) {
        function dadosEstaoProntos() {
            if (tipo === 'EM BASE') {
                const strong = document.querySelector('h4.MuiTypography-root.MuiTypography-h4 strong');
                if (!strong || strong.textContent.trim() !== 'Na base') return false;

                const h4Pai = strong.closest('h4.MuiTypography-root.MuiTypography-h4');
                if (!h4Pai) return false;
                const container = h4Pai.parentElement;
                if (!container) return false;
                const outrosH4 = [...container.querySelectorAll('h4.MuiTypography-root.MuiTypography-h4')].filter(
                    (h4) => !h4.querySelector('strong')
                );
                if (!outrosH4.length) return false;

                const num = parseInt(outrosH4[0].textContent.replace(/\D/g, ''), 10);
                return !isNaN(num);
            } else if (tipo === 'EM RUA') {
                const h4Pacotes = [...document.querySelectorAll('h4.MuiTypography-root.MuiTypography-h4')].find(
                    (h4) => /pacotes/i.test(h4.textContent)
                );
                if (!h4Pacotes) return false;
                const num = parseInt(h4Pacotes.textContent.replace(/\D/g, ''), 10);
                return !isNaN(num);
            }
            return false;
        }

        const startTime = Date.now();
        return new Promise((resolve, reject) => {
            if (dadosEstaoProntos()) {
                resolve(true);
                return;
            }

            const interval = setInterval(() => {
                if (dadosEstaoProntos()) {
                    clearInterval(interval);
                    clearTimeout(timeout);
                    resolve(true);
                } else if (Date.now() - startTime > timeoutMs) {
                    clearInterval(interval);
                    reject(new Error('Timeout esperando dados prontos'));
                }
            }, intervaloMs);

            const timeout = setTimeout(() => {
                clearInterval(interval);
                reject(new Error('Timeout esperando dados prontos'));
            }, timeoutMs);
        });
    }

    async function extrairDadosNaPaginaAtualParaPostMessage() {
        if (document.readyState !== 'complete') {
            await new Promise((resolve) => {
                window.addEventListener('load', () => resolve(), { once: true });
            });
        }

        let tipo = null;
        if (window.location.pathname.includes('/na-base/colecoes')) tipo = 'EM BASE';
        else if (window.location.pathname.includes('/na-rua/colecoes')) tipo = 'EM RUA';
        else {
            tipo = 'DESCONHECIDO';
            console.error('Tipo página desconhecido!');
        }

        try {
            await esperarPorDadosProntos(tipo, 20000, 500);
        } catch {
            console.error('Timeout esperando dados, extraindo com dados incompletos!');
        }

        let dadosExtraidos =
            tipo === 'EM BASE'
                ? await extrairDadosNaBase(document)
                : tipo === 'EM RUA'
                ? extrairDadosNaRua(document)
                : { erro: 'Tipo de página desconhecido para extracao' };

        if (window.opener && !window.opener.closed) {
            try {
                window.opener.postMessage(dadosExtraidos, '*');
            } catch {
                console.error('Erro ao enviar dados para a janela mae!');
            }
        } else {
            console.error('Janela mae fechada nao enviou dados!');
        }
    }

    async function main() {
        if (window.opener && !window.opener.closed) {
            await extrairDadosNaPaginaAtualParaPostMessage();
            return;
        }

        adicionarIconeMarcaDagua();

        console.log('Extrator Arco Loggi iniciado');
        console.log('Clique no ícone azul no canto inferior direito para iniciar a extracao.');
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

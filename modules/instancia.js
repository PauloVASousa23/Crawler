const globais = require('./globais');
const browser = require('./broswer');

async function iniciaInstancia(palavrasChave,url){
    let removeHttp = url.substring( url.indexOf("://")+3);
    let urlDomain = removeHttp.indexOf("/") >= 0 ? removeHttp.substring(0, removeHttp.indexOf("/")) : removeHttp;
    let pagina = await browser.abrePagina();
    browser.navegaPagina(pagina,url);
    let objeto = {
        Browser: browser.getBrowser(),
        Page: pagina,
        Rodando: true,
        Tempo: 0,
        IntervalTempo: null,
        Parou: true,
        PalavrasChave: palavrasChave,
        Pagina: urlDomain
    };

    return globais.setInstancia(objeto);
}

module.exports = {
    iniciaInstancia
}
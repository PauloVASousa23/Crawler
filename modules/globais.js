let urlsAcessadas = [];
let urlsPegas = [];
let instancia = [];
let id = 0;

function getUrlsAcessadas(){
    return urlsAcessadas;
}

function setUrlsAcessadas(url){
    urlsAcessadas.push(url);
}

function getUrlsPegas(){
    return urlsPegas
}

function setUrlsPegas(url){
    urlsPegas.push(url);
}

function getInstancia(id){
    return instancia;
}

function setInstancia(objeto){
    let objInstancia = {
        Id: id,
        Browser:objeto.Browser,
        Page:objeto.Page,
        Rodando:objeto.Rodando,
        Tempo:objeto.Tempo,
        IntervalTempo:objeto.IntervalTempo,
        Parou:objeto.Parou,
        PalavrasChave:objeto.PalavrasChave,
        Pagina:objeto.Pagina,
        Urls:objeto.Urls,
        urlsAcessadas:objeto.urlsAcessadas,
        urlsPegas:objeto.urlsPegas
    };

    id++;

    instancia.push(objInstancia);
}

module.exports = {
    getUrlsAcessadas,
    setUrlsAcessadas,
    getUrlsPegas,
    setUrlsPegas,
    getInstancia,
    setInstancia
}
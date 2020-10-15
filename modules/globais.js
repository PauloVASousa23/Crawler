let urlsAcessadas = [];
let urlsPegas = [];
let instancia = [];
let id = 0;

function getUrlsAcessadas(){
    return urlsAcessadas;
}

function setUrlsAcessadas(url){
    if(!urlsAcessadas.includes(url)){
        urlsAcessadas.push(url)
    }
}

function getUrlsPegas(){
    return urlsPegas
}

function setUrlsPegas(url){
    if(!urlsPegas.includes(url)){
        urlsPegas.push(url)
    }
}

function getInstancias(){
    return instancia;
}

function getInstancia(id){
    return instancia[id];
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
        Urls:getUrlsPegas(),
        urlsAcessadas:getUrlsAcessadas(),
        urlsPegas:""
    };

    id++;

    instancia.push(objInstancia);
    return objInstancia.Id;
}

module.exports = {
    getUrlsAcessadas,
    setUrlsAcessadas,
    getUrlsPegas,
    setUrlsPegas,
    getInstancia,
    getInstancias,
    setInstancia
}
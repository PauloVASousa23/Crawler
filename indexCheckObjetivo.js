const pptr = require('puppeteer-core');
const globais = require('./modules/globais');

let viewport = {width: 1360, height: 768};
let instancia = [];
let browser = null;
let id = 0;
let urlsAcessadas = [];
let urlsPegas = [];
let urlsPegasNaoRepete = [];
let urlsException = [];
let urlsLog = [];
let palavrasChaveComp = [];
let pause = true;

module.exports = {
    Crawler: async function Crawler (mostrarBrowser,urlBase,p,repetirUrl,urlException,funcoes, palavraBusca) {
        let head = mostrarBrowser == "true" ? false : true;
        console.log("Executou o crawler ID:" + id);
        urlException.split(";").forEach(e=> e != '' ? !urlsException.includes(e) ? urlsException.push(e) : "" : "");
        p.split(";").forEach(e=> e != '' ? !palavrasChaveComp.includes(e) ? palavrasChaveComp.push(e) : "" : "");
        console.log(mostrarBrowser);
        console.log(funcoes);
        if(browser == null){
            browser = await pptr.launch({
                headless: head,
                executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
                ignoreHTTPSErrors: true,
            });

            browser.on('disconnected',()=>{browser = null;});
        }

        let objInstancia = await iniciaInstancia(id,browser, p.split(";"), urlsException, urlBase,repetirUrl,funcoes,palavraBusca.split(";"));
        id++;

        try{
            processoCrawler(browser, objInstancia, urlBase);
        }catch(e){
            
        }
    },
    Running: function(){
        let instanciaFiltrada = [];
        instancia.map(e=>instanciaFiltrada.push({Timestamp: e["Timestamp"],Id:e["Id"],Rodando:e["Rodando"],Tempo:e["Tempo"], Pagina: e["Pagina"], Funcoes: e["Funcoes"], Pausado: e["Pausar"]}));
        return instanciaFiltrada;
    },
    ParaCrawler: function(i){

        if(instancia.length > 0){
            instancia.map((e,j)=>{
                if(e.Id == i){
                    instancia[j]["Parou"] = false;
                    instancia[j]["Rodando"] = false;
                    clearInterval(instancia[j]["IntervalTempo"]);
                    setTimeout(()=>{instancia[j]  != undefined? instancia[j]["Tempo"] : ""},1000);
                    instancia[j]["Page"].close();
                }
            });
        }

    },
    LimpaInstancia: function(i){
        let instanciaFiltrada =[];
        instancia.map(e=>{
            if(e.Id != i){
                instanciaFiltrada.push(e);
            }
        });

        instancia = instanciaFiltrada;
    },
    PausarCrawler: function(i){

        if(instancia.length > 0){
            instancia.map((e,j)=>{
                if(e.Id == i){
                    clearInterval(instancia[j]["IntervalTempo"]);
                    instancia[j]["Pausar"] = true;
                }
            });
        }

    },
    ContinuarCrawler: function(i){

        if(instancia.length > 0){
            instancia.map((e,j)=>{
                if(e.Id == i){
                    instancia[j]["IntervalTempo"] = setInterval(()=>{
                        instancia[j]["Tempo"]++;
                    },1000);
                    instancia[j]["Pausar"] = false;
                }
            });
        }

    },
    AlterarInstancia: function(i, consoleError, printscreen, obterLinks, obterLinksRepetidos, instanciaNova){

        if(instancia.length > 0){
            instancia.map((e,j)=>{
                if(e.Id == i){
                    instancia[j].Funcoes["ConsoleError"] = consoleError;
                    instancia[j].Funcoes["Printscreen"] = printscreen;
                    instancia[j].Funcoes["ObterLinks"] = obterLinks;
                    instancia[j].Funcoes["ObterLinksRepetidos"] = obterLinksRepetidos;
                    if(instanciaNova != "Selecione" && instanciaNova != i){
                        instancia.map((h,i)=>{
                            if(h.Id == Number(instanciaNova)){
                                instancia[j].UrlsPegas = instancia[i].UrlsPegas;
                                instancia[j].PalavrasChave = instancia[i].PalavrasChave;
                                instancia[j].PalavrasExcecoes = instancia[i].PalavrasExcecoes;
                                instancia[j].Urls = instancia[i].Urls;
                            }
                        });
                    }
                }
            });
        }

    },
    PegarUrlsAcessadas: function(i){
        let urls =[];

        instancia.map(e=>{
            if(e.Id == i){
                urls = e.Urls;
            }
        });

        return urls;
    },
    PegarUrlsRestante: function(i){
        let urls =[];

        instancia.map(e=>{
            if(e.Id == i){
                e.UrlsPegas.forEach(i=> !e.Urls.includes(i.split("__|__")[1]) ? urls.push(i.split("__|__")[1]) : "");
            }
        });

        return urls;
    },
}

async function iniciaInstancia(idInstancia,browser, palavrasChave,palavrasExcecoes,url,repetirUrl, funcoes, palavraBusca){
    let removeHttp = url.substring( url.indexOf("://")+3);
    let urlDomain = removeHttp.indexOf("/") >= 0 ? removeHttp.substring(0, removeHttp.indexOf("/")) : removeHttp;

    let objeto = null;
    if(repetirUrl == "true"){
        objeto = {Id: idInstancia,Timestamp: Date.now(),Browser: browser, Page: null, Rodando: true, Tempo: 0, IntervalTempo: null, Parou: true, PalavrasChave: palavrasChaveComp, PalavrasExcecoes: palavrasExcecoes, Pagina: urlDomain, Urls: urlsAcessadas, UrlsPegas: urlsPegas , UrlAtual: "", UrlsNoLog: urlsLog ,Funcoes: funcoes, Pausar: false, PalavraBusca: palavraBusca};
    }else{
        objeto = {Id: idInstancia,Timestamp: Date.now(),Browser: browser, Page: null, Rodando: true, Tempo: 0, IntervalTempo: null, Parou: true, PalavrasChave: palavrasChave, PalavrasExcecoes: palavrasExcecoes, Pagina: urlDomain, Urls: [], UrlsPegas: [] , UrlAtual: "", UrlsNoLog: [],Funcoes: funcoes, Pausar: false, PalavraBusca: palavraBusca};
    }

    instancia.push(objeto);
    return objeto;
}

async function processoCrawler(browser, objInstancia, urlBase){
    try{
        objInstancia.Page = await browser.newPage();

        objInstancia.IntervalTempo = setInterval(()=>{
            objInstancia.Tempo++;
        },1000);

        objInstancia.Page.setViewport(viewport);
        await objInstancia.Page.goto(urlBase, {waitUntil: "load",timeout: 300000});
        objInstancia.UrlAtual = objInstancia.Page.url();

        objInstancia.Browser.on("disconnected",function(){
            objInstancia.Parou = false;
            objInstancia.Rodando = false;
            clearInterval(objInstancia.IntervalTempo);
            setTimeout(()=>{instancia.Tempo = 0},1000);
        });

        objInstancia.Page.on("close", function(){
            objInstancia.Parou = false;
            objInstancia.Rodando = false;
            clearInterval(objInstancia.IntervalTempo);
            setTimeout(()=>{instancia.Tempo = 0},1000);
        });

        let b = await pegaLink(objInstancia.Page,objInstancia.PalavrasChave, objInstancia);
        await b != undefined ? b.forEach((e,i,arr) => !objInstancia.UrlsPegas.includes(b[i]) ? objInstancia.UrlsPegas.push(b[i]) : "") : "";

        for(let i = 0; i<=objInstancia.UrlsPegas.length; i++){
            
            while(objInstancia.Pausar){
                await delay(1000);
            }

            if(!objInstancia.Rodando){
                return;
            }

            if(objInstancia.UrlsPegas[i] != undefined){

                if(!objInstancia.PalavrasExcecoes.some(e=>objInstancia.UrlsPegas[i].split("__|__")[1].includes(e))){

                    if(!objInstancia.Urls.includes(objInstancia.UrlsPegas[i].split("__|__")[1])){

                        objInstancia.Urls.push(objInstancia.UrlsPegas[i].split("__|__")[1]);

                        try{
                            await objInstancia.Page.goto(objInstancia.UrlsPegas[i].split("__|__")[1], {
                                waitUntil: "load",
                                timeout: 300000
                            }).catch(e=> console.log(""));

                            let b = await pegaLink(objInstancia.Page,objInstancia.PalavrasChave,objInstancia);

                            await b != b.forEach((e,i,arr) => !objInstancia.UrlsPegas.includes(b[i]) ? objInstancia.UrlsPegas.push(b[i]) : "");
                            
                            console.log("ID: " + objInstancia.Id + " - URL: " + objInstancia.UrlsPegas[i].split("__|__")[1]);

                            let id = objInstancia.Pagina + Date.now();
                            
                            if(objInstancia.Funcoes["Printscreen"] == "true"){
                                await delay(1000);
                                await objInstancia.Page.screenshot({
                                    path: "screenshots/" + id + ".jpg",
                                    type: "jpeg",
                                    fullPage: false
                                });
                            }

                            if(objInstancia.Funcoes["ObterLinks"] == "true"){
                                if(!objInstancia.UrlsNoLog.includes(objInstancia.UrlsPegas[i].split("__|__")[1])){
                                    objInstancia.UrlsNoLog.push(objInstancia.UrlsPegas[i].split("__|__")[1]);
                                    let instanciaResponsavel = objInstancia.Timestamp;
                                    escreveNoLog("{\"Instancia\":\"" + instanciaResponsavel + "\",\"Url\":\""+objInstancia.UrlsPegas[i].split("__|__")[1]+"\",\"ObtidoEm\": \"" + objInstancia.UrlsPegas[i].split("__|__")[0] + "\" ,\"IdImg\":\"" + id + "\"},\n", "LogLinksNew");
                                }
                            }

                            if(objInstancia.Funcoes["BuscarNaPagina"] == "true"){
                                let result =  await buscaPalavrasChaveNaPagina(objInstancia.Page,objInstancia.PalavraBusca,objInstancia);
                                if(result){
                                    escreveNoLog("{\"Pagina\":\"" + objInstancia.UrlsPegas[i].split("__|__")[1] + "\",\"Busca\":\""+objInstancia.PalavraBusca.join(";")+"\"},\n", "LogBusca");
                                }
                            }
                            
                            if(objInstancia.Funcoes["ConsoleError"] == "true"){
                                await pegaPagina(objInstancia);
                                
                                verificaErroELoga(arrPush,objInstancia);

                                arrPush = [];

                                if(objInstancia.Page.url().search("404.aspx") >= 0 ){
                                    let url = objInstancia.UrlsPegas[i];
                                    
                                    let removeHttp = url.substring( url.indexOf("://")+3);
                                    let urlDomain = removeHttp.substring(0, removeHttp.indexOf("/"));
                                    let urlContent = removeHttp.substring(removeHttp.indexOf("/"));
                                    let protocolo = url.substring(0, url.indexOf("://"));
                                    let instanciaResponsavel = objInstancia.Timestamp;
                                    
                                    let objError = {instancia: instanciaResponsavel,dominio: urlDomain, pagina: urlContent, protocolo: protocolo, erros: ["PAGE NOT FOUND: " + url]};
                                    
                                    escreveNoLog(objError,"ObjetosLogNew");
                                }
                                        
                            }
                            
                        }catch(e){
                            //console.log("Erro de navegação: ");
                        }
                    }  
                }
            }
        }
        await delay(5000);
        objInstancia["Page"].close();
        
    }catch(e){
        console.log("ERRO NO CRAWLER: ", e);
    }
}

//Pega todos os links da pagina
async function pegaLink(page, palavrasChave, objInstancia){
    try{
        let result = await page.evaluate(async(palavrasChave, palavrasExcecoes,urlsPegas) => {
            try {
                let links = [];

                document.querySelectorAll("a").forEach(e=>{
                    let href = e.href;

                    let excecao = palavrasExcecoes.length > 0 ? !palavrasExcecoes.some(e=>href.includes(e)) : true;

                    if(excecao){

                        let bool=false;

                        palavrasChave.map((e)=>{href.toLowerCase().search(e.toLowerCase()) >= 0 && e != "" ? bool=true:"";});

                        if(bool){
                            let existe = false;
                        
                            urlsPegas.forEach(i=>i.split("__|__")[1] == href ? existe = true : "");

                            if(!existe){
                                links.push(window.location.href + "__|__" + href);
                            }
                        }
                    }
                });
                return links;
            } catch (e) {
                console.log("Erro ao pegar: " + e.message);
            }
        },palavrasChave, objInstancia.PalavrasExcecoes,objInstancia.UrlsPegas);

        return result;
    }catch(e){
        //console.log("Erro ao pegar link: ", e);
    }
}

//Pega todos os links da pagina
async function buscaPalavrasChaveNaPagina(page, palavrasChaveBusca, objInstancia){
    try{
        let result = await page.evaluate(async(palavrasChaveBusca) => {
            try {
                let bodyHtml = document.querySelector("body").outerHTML;
                let temPalavraChave = palavrasChaveBusca.some(e=>bodyHtml.includes(e));
                return temPalavraChave;
            } catch (e) {
                console.log("Erro ao pegar: " + e.message);
            }
        },palavrasChaveBusca);

        return result;
    }catch(e){
        //console.log("Erro ao pegar link: ", e);
    }
}

let arrPush = [];

//Pega erros no console e requisições na pagina
var pegaPagina = async (objInstancia)=>{

    try{
        await delay(5000);
        await objInstancia.Page
        .on('console', message =>
            {
                if(message["_type"] == "error"){
                    let mensagem = message["_text"].replace(/\r?\n|\r/g,"").replace(/ +/g," ").replace(/[ \t]/g, " ").replace(/\"/g,"'");
    
                    if(!arrPush.includes(mensagem)){
                        if(!arrPush.includes(mensagem)){
                            arrPush.push("CONSOLE: " + mensagem);
                        }
                    }   
                }
            }
        )
        .on('pageerror', ({ message }) => 
            {

                let mensagem = message.replace(/\r?\n|\r/g,"").replace(/ +/g," ").replace(/[ \t]/g, " ").replace(/\"/g,"'");
 
                if(!arrPush.includes(mensagem)){
                    arrPush.push("PAGEERROR: " + mensagem);
                }
            
            }        
        )
        .on('response', response => 
            {
                if(response.status() != 200 && response.status() != 204 && response.status() != 301 && response.status() != 302 && response.status() != 304 && response.status() != 206){

                    let mensagem = response["_status"] + ": " + response["_url"].replace(/\r?\n|\r/g,"").replace(/ +/g," ").replace(/[ \t]/g, " ").replace(/\"/g,"'");
                    
                    if(!arrPush.includes(mensagem)){
                        arrPush.push("RESPONSE: " + mensagem);
                    }
                }
            }        
        )
        .on('requestfailed', request =>
            {
                if(request.failure() != null && request.failure() != undefined){
                    
                    if(!arrPush.includes(`${request.failure().errorText} ${request.url()}`)){
                        arrPush.push("REQUEST: " + `${request.failure().errorText} ${request.url()}`.replace(/\r?\n|\r/g,"").replace(/ +/g," ").replace(/[ \t]/g, " ").replace(/\"/g,"'"));
                    }
                }
            }
        )

    }catch(e){
        console.log("CATCH: " + e + " - URL: " + url);
    }

};

function verificaErroELoga(arr, objInstancia){
    if(arr.length > 0 && arr.join("").length>0){
        let url = objInstancia.Page.url();
        let removeHttp = url.substring( url.indexOf("://")+3);
        let urlDomain = removeHttp.substring(0, removeHttp.indexOf("/"));
        let urlContent = removeHttp.substring(removeHttp.indexOf("/"));
        let protocolo = url.substring(0, url.indexOf("://"));
        let instanciaResponsavel = objInstancia.Timestamp;

        let objError = {instancia: instanciaResponsavel,dominio: urlDomain, pagina: urlContent, protocolo: protocolo, erros: arrPush};

        escreveNoLog(objError,"ObjetosLog");
    }
}

function escreveNoLog(mensagem, arquivo = "Log"){

    fs = require('fs');

    var stream = fs.createWriteStream(arquivo+".txt", {flags:'a'});

    switch(typeof(mensagem)){
        case "object":
            let msg = "{\n";
            Object.entries(mensagem).map((e)=>{
                let objKey = "\t\""+ e[0] + "\": ";
                if(e[0] == "erros"){
                    if(e[1] != undefined){
                        let arrFiltrado = [];
                        e[1].map(e=> !arrFiltrado.includes(e) ? arrFiltrado.push(e) : "");
                        let mensagemObj = objKey + "[\"" + arrFiltrado.join("|\",\"|") + "\"]" + "";
                        msg+=mensagemObj + "\n";
                    }else{
                        let mensagemObj = objKey + "[\"\"]";
                        msg+=mensagemObj + "\n";
                    }
                }else{
                    let mensagemObj = objKey + "\"" + e[1] + "\",";
                    msg+=mensagemObj + "\n";
                }
            });
            msg+="},\n";
            stream.write(msg);
            break;
        case "string":
            if(mensagem.includes("TypeError: $(...).kendoChat is not a function" || mensagem.includes("because a user gesture is required"))){
                stream.end();
                return false;
            }else{
                stream.write(mensagem + "\n");
            }
            break;
    }

    stream.end();    

}

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}
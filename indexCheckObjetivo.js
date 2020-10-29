const pptr = require('puppeteer-core');
const globais = require('./modules/globais');

let viewport = {width: 1360, height: 768};
let instancia = [];
let browser = null;
let id = 0;
let urlsAcessadas = [];
let urlsPegas = [];
let urlsException = [];

module.exports = {
    Crawler: async function Crawler (urlBase,p,repetirUrl,urlException,funcoes) {
        console.log("Executou o crawler ID:" + id);
        urlException.split(";").forEach(e=> e != '' ? !urlsException.includes(e) ? urlsException.push(e) : "" : "");
        console.log(urlsException);
        console.log(funcoes);
        if(browser == null){
            browser = await pptr.launch({
                headless: false,
                executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
                ignoreHTTPSErrors: true,
            });

            browser.on('disconnected',()=>{browser = null;});
        }

        let objInstancia = await iniciaInstancia(id,browser, p.split(";"), urlBase,repetirUrl,funcoes);
        id++;

        try{
            processoPegaLinks(browser, objInstancia, urlBase);
        }catch(e){
            
        }
    },
    Running: function(){
        let instanciaFiltrada =[];
        instancia.map(e=>instanciaFiltrada.push({Id:e["Id"],Rodando:e["Rodando"],Tempo:e["Tempo"], Pagina: e["Pagina"]}));
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
    }
    
}

async function iniciaInstancia(idInstancia,browser, palavrasChave,url,repetirUrl, funcoes){
    let removeHttp = url.substring( url.indexOf("://")+3);
    let urlDomain = removeHttp.indexOf("/") >= 0 ? removeHttp.substring(0, removeHttp.indexOf("/")) : removeHttp;
    let objeto = {Id: idInstancia,Browser: browser, Page: null, Rodando: true, Tempo: 0, IntervalTempo: null, Parou: true, PalavrasChave: palavrasChave, Pagina: urlDomain, Urls: repetirUrl ? urlsAcessadas : [], UrlsPegas: repetirUrl ? urlsPegas : [], UrlAtual: "",Funcoes: funcoes};
    instancia.push(objeto);
    return objeto;
}

async function processoPegaLinks(browser, objInstancia, urlBase){
    try{
        console.log("--> ", objInstancia.Funcoes["ObterLinks"]);
        console.log("> ", typeof(objInstancia.Funcoes["ObterLinks"]));
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

        let b = await pegaLink(objInstancia.Page,objInstancia.PalavrasChave);
        await b != undefined ? b.forEach((e,i,arr) => !objInstancia.UrlsPegas.includes(b[i]) ? objInstancia.UrlsPegas.push(b[i]) : "") : "";

        let temp = 0;
        
        for(let i = 0; i<=objInstancia.UrlsPegas.length; i++){
            temp = i;
            if(!objInstancia.Rodando){
                return;
            }
            
            if(!objInstancia.Urls.includes(objInstancia.UrlsPegas[i])){
                
                objInstancia.Urls.push(objInstancia.UrlsPegas[i]);
                
                if(objInstancia.UrlsPegas[i] != undefined){

                    try{
                        await objInstancia.Page.goto(objInstancia.UrlsPegas[i], {
                            waitUntil: "load",
                            timeout: 300000
                        }).catch(e=> console.log(""));

                        let b = await pegaLink(objInstancia.Page,objInstancia.PalavrasChave);

                        await b != b.forEach((e,i,arr) => !objInstancia.UrlsPegas.includes(b[i]) ? objInstancia.UrlsPegas.push(b[i]) : "");

                        objInstancia.UrlAtual = objInstancia.Page.url();

                        console.log("ID: " + objInstancia.Id + " - URL: " + objInstancia.UrlsPegas[i]);

                        if(!urlsException.some(e=>objInstancia.UrlsPegas[i].includes(e))){
                    
                            if(objInstancia.Page.url().search("404.aspx") >= 0 ){
                                let url = objInstancia.UrlsPegas[i];
            
                                let removeHttp = url.substring( url.indexOf("://")+3);
                                let urlDomain = removeHttp.substring(0, removeHttp.indexOf("/"));
                                let urlContent = removeHttp.substring(removeHttp.indexOf("/"));
                                let protocolo = url.substring(0, url.indexOf("://"));

                                let objError = {dominio: urlDomain, pagina: urlContent, protocolo: protocolo, erros: ["PAGE NOT FOUND: " + url]};
                                
                                escreveNoLog(objError,"ObjetosLogNew");
                            }else{
                                if(objInstancia.Funcoes["ConsoleError"] == "true"){
                                    await pegaPagina(objInstancia);
                                }
                            }
                        }

                        console.log("--------> ", objInstancia.Funcoes);

                        if(objInstancia.Funcoes["ObterLinks"] == "true"){
                            escreveNoLog(objInstancia.UrlsPegas[i]+"\n", "LogLinksNew");
                        }
                                
                    }catch(e){
                        //console.log("Erro de navegação: ");
                    }
                }
            }
        }
        console.log( temp + " -------------> ", objInstancia.UrlsPegas);
        await delay(5000);
        objInstancia["Page"].close();
        
    }catch(e){
        console.log("ERRO NO CRAWLER: ", e);
    }
}

//Pega todos os links da pagina
async function pegaLink(page, palavrasChave){
    try{
        let result = await page.evaluate(async(palavrasChave) => {
            try {
                let links = [];
                console.log(document.querySelectorAll("a"));

                document.querySelectorAll("a").forEach(e=>{
                    let href = e.href.toLowerCase();

                    let bool=false;

                    palavrasChave.map((e)=>{href.search(e) >= 0 && e != "" ? bool=true:"";});

                    if(bool){
                        if(!links.includes(href)){
                            links.push(href);
                        }
                    }
                });

                /*
                $("a").map((e)=>{
                        let href = $("a")[e].href.toLowerCase();

                        href = href.slice(-1).includes("/") ? href.replace(/.$/, '') : href ;
                        if(href.search("unip.br/video/index") >=0){
                            href = href.substring(0,href.indexOf("unip.br")+7) + "/tvweb" + href.substring(href.indexOf("unip.br")+7)
                        }
                           
                        let bool=false;
                        
                        palavrasChave.map((e)=>{href.search(e) >= 0 && e != "" ? bool=true:"";});

                        if(bool){
                            if(!links.includes(href)){
                                links.push(href);
                            }
                        }
                    }
                );
                */

                return links;
            } catch (e) {
                console.log("Erro ao pegar: " + e.message);
            }
        },palavrasChave);

        return result;
    }catch(e){
        //console.log("Erro ao pegar link: ", e);
    }
}

let arrPush;

//Pega erros no console e requisições na pagina
var pegaPagina = async (objInstancia)=>{
    arrPush = [];
    try{
        await delay(5000);
        await objInstancia.Page
        .on('console', message =>
            {
                if(message["_type"] == "error"){
                                    
                    let mensagem = message["_text"].replace(/\r?\n|\r/g,"").replace(/ +/g," ").replace(/[ \t]/g, " ").replace(/\"/g,"'");
    
                    if(!arrPush.includes(mensagem)){
                        arrPush == undefined ? arrPush = [] : ""; 
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
                    arrPush == undefined ? arrPush = [] : ""; 
                    if(!arrPush.includes(mensagem)){
                        arrPush.push("PAGEERROR: " + mensagem);
                    }
                }
            }        
        )
        .on('response', response => 
            {
                if(response.status() != 200 && response.status() != 204 && response.status() != 301 && response.status() != 302 && response.status() != 304 && response.status() != 206){

                    let mensagem = response["_status"] + ": " + response["_url"].replace(/\r?\n|\r/g,"").replace(/ +/g," ").replace(/[ \t]/g, " ").replace(/\"/g,"'");

                    arrPush == undefined ? arrPush = [] : ""; 
                    if(!arrPush.includes(mensagem)){
                        arrPush.push("RESPONSE: " + mensagem);
                    }
                }
            }        
        )
        .on('requestfailed', request =>
            {
                if(request.failure() != null && request.failure() != undefined){
                    arrPush == undefined ? arrPush = [] : ""; 
                    if(!arrPush.includes(`${request.failure().errorText} ${request.url()}`)){
                        arrPush.push("REQUEST: " + `${request.failure().errorText} ${request.url()}`.replace(/\r?\n|\r/g,"").replace(/ +/g," ").replace(/[ \t]/g, " ").replace(/\"/g,"'"));
                    }
                }
            }
        ).then(
            verificaErroELoga(arrPush,objInstancia)
        );

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

        let objError = {dominio: urlDomain, pagina: urlContent, protocolo: protocolo, erros: arrPush};

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
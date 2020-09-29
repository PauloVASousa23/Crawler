const pptr = require('puppeteer-core');

var runningPrimeiraInstancia = false;
var runningSegundaInstancia = false;
var timePrimeiraInstancia = 0;
var timeSegundaInstancia = 0;
var browserPrimeiraInstancia = null;
var browserSegundaInstancia = null;
var myTimePrimeiraInstancia;
var myTimeSegundaInstancia;
var palavrasChavesPrimeiraInstancia;
var palavrasChavesSegundaInstancia;
var parouPrimeiraInstancia = true;
var parouSegundaInstancia = true;

let viewport = {width: 1360, height: 768};
let instancia = [];
let browser = null;
let id = 0;

module.exports = {
    Crawler: async function Crawler (urlBase,p) {
        console.log("Executou o crawler");
        if(browser == null){
            browser = await pptr.launch({
                headless: false,
                executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
                ignoreHTTPSErrors: true,
            });
        }

        let objInstancia = await iniciaInstancia(browser, p.split(";"), urlBase);

        processoPegaLinks(browser, objInstancia, urlBase);

        /*
        if(instancia == 1){
            primeiraInstancia(urlBase,p);
        }else{
            segundaInstancia(urlBase,p);
        }*/
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
                    setTimeout(()=>{instancia[j]["Tempo"]},1000);
                    instancia[j]["Page"].close();
                }
            });
        }

        /*
        if(instancia == 1){
            parouPrimeiraInstancia = false;
            clearInterval(myTimePrimeiraInstancia);
            setTimeout(()=>{timePrimeiraInstancia = 0},1000);
            browserPrimeiraInstancia.close();
        }
        
        if(instancia == 2){
            parouSegundaInstancia = false;
            clearInterval(myTimeSegundaInstancia);
            setTimeout(()=>{timeSegundaInstancia = 0},1000);
            browserSegundaInstancia.close();
        }*/
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

async function processoPegaLinks(browser, objInstancia, urlBase){
    try{
        objInstancia["Page"] = await browser.newPage();

        objInstancia["IntervalTempo"] = setInterval(()=>{
            objInstancia["Tempo"]++;
        },1000);
        
        objInstancia["Page"].setViewport(viewport);
        await objInstancia["Page"].goto(urlBase, {waitUntil: "load",timeout: 300000});

        objInstancia["Browser"].on("disconnected",function(){
            objInstancia["Parou"] = false;
            objInstancia["Rodando"] = false;
            clearInterval(objInstancia["IntervalTempo"]);
            setTimeout(()=>{instancia["Tempo"] = 0},1000);
        });

        objInstancia["Page"].on("close", function(){
            objInstancia["Parou"] = false;
            objInstancia["Rodando"] = false;
            clearInterval(objInstancia["IntervalTempo"]);
            setTimeout(()=>{instancia["Tempo"] = 0},1000);
        });

        let a = await pegaLink(objInstancia["Page"],objInstancia["PalavrasChave"]);
    
        for(let i = 0; i<=a.length; i++){
            if(!objInstancia["Rodando"]){
                return;
            }
            if(a[i]){
    
                if(!a[i].includes(".jpg") && !a[i].includes(".pdf") && !a[i].includes("noticias.asp")){
                    try{
                        objInstancia["Page"].goto(a[i], {
                            waitUntil: "load",
                            timeout: 300000
                        }).catch();

                        if(objInstancia["Page"].url().search("404.aspx") >= 0 ){
                            let url = a[i];
        
                            let removeHttp = url.substring( url.indexOf("://")+3);
                            let urlDomain = removeHttp.substring(0, removeHttp.indexOf("/"));
                            let urlContent = removeHttp.substring(removeHttp.indexOf("/"));
                            let protocolo = url.substring(0, url.indexOf("://"));

                            let objError = {dominio: urlDomain, pagina: urlContent, protocolo: protocolo, erros: ["PAGE NOT FOUND: " + url]};
                            
                            escreveNoLog(objError,"ObjetosLogNew");
                        }else{

                            await pegaPagina(objInstancia["Page"], objInstancia["Page"].url(),[]);
                            
                            let b = await pegaLink(objInstancia["Page"],1);    
                            
                            await b != undefined ? b.forEach((e,i,arr) => !a.includes(b[i]) ? a.push(b[i]) : "") : "";

                            escreveNoLog(a[i]+"\n", "LogLinksNew");
                        }
                    }catch(e){
                        //console.log("Erro de navegação: " + e);
                    }
                
                }
                
            }
        }
        
        await delay(20000);
        objInstancia["Page"].close();
        
    }catch(e){
        console.log("ERRO NO CRAWLER: ", e);
    }
}

async function iniciaInstancia(browser, palavrasChave,url){
    let removeHttp = url.substring( url.indexOf("://")+3);
    let urlDomain = removeHttp.indexOf("/") >= 0 ? removeHttp.substring(0, removeHttp.indexOf("/")) : removeHttp;
    let objeto = {Id: id,Browser: browser, Page: null, Rodando: true, Tempo: 0, IntervalTempo: null, Parou: true, PalavrasChave: palavrasChave, Pagina: urlDomain};
    id++;
    instancia.push(objeto);
    return objeto;
}

async function primeiraInstancia(urlBase, p){
    try{
        browserPrimeiraInstancia = await pptr.launch({
            headless: true,
            executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
            ignoreHTTPSErrors: true,
        });

        palavrasChavesPrimeiraInstancia = p.split(";");

        browserPrimeiraInstancia.on("disconnected",function(){
            runningPrimeiraInstancia = false;
        })

        myTimePrimeiraInstancia = setInterval(()=>{
            timePrimeiraInstancia++;
        },1000);

        runningPrimeiraInstancia = true;

        const page = await browserPrimeiraInstancia.newPage();
        page.setViewport({width: 1380,height: 768});
    
        if(!urlBase.includes("http") || !urlBase.includes("://")){
            urlBase = "https://" + urlBase;
        }

        await page.goto(urlBase,{waitUntil: "load",timeout: 300000});

        //Faz login na pagina tvweb
        if(page.url().search("/tvweb") >=0){
            await page.evaluate( async()=>{
                if(window.location.pathname == "/tvweb"){
                    $("#login").val("0503332");
                    $("#senha").val("Mi*1293680");
                    var plogin = $('#login').val();
                    var psenha = $('#senha').val();
                    $.ajax({
                        url: '/tvweb/Home/LoginHeader',
                        data: { login: plogin, senha: psenha },
                        type: 'GET',
                        dataType: 'html',
                        success: function (data) {
                            var resultado = $(data).get(0).innerText;
                            if (resultado === 'True') {
                                $("#login-header").html(data);
                            }
                            else {
                                $("#error-login").show();
                                setTimeout(function () {
                                    $("#error-login").fadeOut();
                                }, 2500);
                                $("#error-login span").text($(data).get(2).innerText);
                            }
                        }
                    });                        
                }
            });
        }

        await delay(2000);
    
        let a = await pegaLink(page,1);
    
        for(let i = 0; i<=a.length; i++){
            if(!parouPrimeiraInstancia){
                return;
            }
            if(a[i]){
    
                if(a[i].includes("https")){
                }
    
                if(!a[i].includes(".jpg") && !a[i].includes(".pdf") && !a[i].includes("noticias.asp")){
                    try{
                        page.goto(a[i], {
                            waitUntil: "load",
                            timeout: 300000
                        }).catch();

                        if(page.url().search("404.aspx") >= 0 ){
                            let url = a[i];
        
                            let removeHttp = url.substring( url.indexOf("://")+3);
                            let urlDomain = removeHttp.substring(0, removeHttp.indexOf("/"));
                            let urlContent = removeHttp.substring(removeHttp.indexOf("/"));
                            let protocolo = url.substring(0, url.indexOf("://"));

                            let objError = {dominio: urlDomain, pagina: urlContent, protocolo: protocolo, erros: ["PAGE NOT FOUND: " + url]};
                            
                            escreveNoLog(objError,"ObjetosLog");
                        }else{

                            await pegaPagina(page, page.url(),[]);
                            
                            let b = await pegaLink(page,1);    
                            
                            await b != undefined ? b.forEach((e,i,arr) => !a.includes(b[i]) ? a.push(b[i]) : "") : "";

                            escreveNoLog(a[i]+"\n", "LogLinks");
                        }
                    }catch(e){
                        //console.log("Erro de navegação: " + e);
                    }
                
                }
                
            }
        }
        
        await delay(10000);
        page.close();
        //await browserPrimeiraInstancia.close();
    }catch(e){
        console.log("ERRO NO CRAWLER: ", e);
    }
}

async function segundaInstancia(urlBase, p){
    try{
        browserSegundaInstancia = await pptr.launch({
            headless: false,
            executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
            ignoreHTTPSErrors: true,
        });

        palavrasChavesSegundaInstancia = p.split(";");

        browserSegundaInstancia.on("disconnected",function(){
            runningSegundaInstancia = false;
        })

        myTimeSegundaInstancia = setInterval(()=>{
            timeSegundaInstancia++;
        },1000);

        runningSegundaInstancia = true;

        const page = await browserSegundaInstancia.newPage();
        page.setViewport({width: 1380,height: 768});
    
        if(!urlBase.includes("http") || !urlBase.includes("://")){
            urlBase = "https://" + urlBase;
        }

        await page.goto(urlBase,{waitUntil: "load",timeout: 300000});

        //Faz login na pagina tvweb
        if(page.url().search("/tvweb") >=0){
            await page.evaluate( async()=>{
                if(window.location.pathname == "/tvweb"){
                    $("#login").val("0503332");
                    $("#senha").val("Mi*1293680");
                    var plogin = $('#login').val();
                    var psenha = $('#senha').val();
                    $.ajax({
                        url: '/tvweb/Home/LoginHeader',
                        data: { login: plogin, senha: psenha },
                        type: 'GET',
                        dataType: 'html',
                        success: function (data) {
                            var resultado = $(data).get(0).innerText;
                            if (resultado === 'True') {
                                $("#login-header").html(data);
                            }
                            else {
                                $("#error-login").show();
                                setTimeout(function () {
                                    $("#error-login").fadeOut();
                                }, 2500);
                                $("#error-login span").text($(data).get(2).innerText);
                            }
                        }
                    });                        
                }
            });
        }

        await delay(2000);
    
        let a = await pegaLink(page,2);
    
        for(let i = 0; i<=a.length; i++){
            if(!parouSegundaInstancia){
                return;
            }
            if(a[i]){
    
                if(a[i].includes("https")){
                }
    
                if(!a[i].includes(".jpg") && !a[i].includes(".pdf") && !a[i].includes("noticias.asp")){
                    try{
                        page.goto(a[i], {
                            waitUntil: "load",
                            timeout: 300000
                        }).catch();

                        if(page.url().search("404.aspx") >= 0 ){
                            let url = a[i];
        
                            let removeHttp = url.substring( url.indexOf("://")+3);
                            let urlDomain = removeHttp.substring(0, removeHttp.indexOf("/"));
                            let urlContent = removeHttp.substring(removeHttp.indexOf("/"));
                            let protocolo = url.substring(0, url.indexOf("://"));

                            let objError = {dominio: urlDomain, pagina: urlContent, protocolo: protocolo, erros: ["PAGE NOT FOUND: " + url]};
                            
                            escreveNoLog(objError,"ObjetosLog");
                        }else{

                            await pegaPagina(page, page.url(),[]);
                            
                            let b = await pegaLink(page,2);    
                            
                            await b != undefined ? b.forEach((e,i,arr) => !a.includes(b[i]) ? a.push(b[i]) : "") : "";

                            escreveNoLog(a[i]+"\n", "LogLinks");
                        }
                    }catch(e){
                        //console.log("Erro de navegação: " + e);
                    }
                
                }
                
            }
        }
    
        await delay(10000);
        await browserSegundaInstancia.close();
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

                $("a").map((e)=>{
                        let href = $("a")[e].href.toLowerCase();
                        console.log(href);

                        href = href.slice(-1).includes("/") ? href.replace(/.$/, '') : href ;
                        if(href.search("unip.br/video/index") >=0){
                            href = href.substring(0,href.indexOf("unip.br")+7) + "/tvweb" + href.substring(href.indexOf("unip.br")+7)
                        }   
                        let bool=false;
                            
                        palavrasChave.map((e,i)=>href.search(e) >= 0 && e != "" ? bool=true:"");

                        if(bool){
                            if(!links.includes(href)){
                                links.push(href);
                            }
                        }
                    }
                );

                return links;
            } catch (e) {
                console.log("Erro ao pegar: " + e.message);
            }
        },palavrasChave);

        return result;
    }catch(e){
        console.log("Erro ao pegar link: ", e);
    }
}

let arrPush;

//Pega erros no console e requisições na pagina
var pegaPagina = async (page,url)=>{
    arrPush = [];
    try{
        await delay(10000);
        page
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
        )
        
        if(arrPush.length > 0 && arrPush.join("").length>0){
            let url = page.url();
            let removeHttp = url.substring( url.indexOf("://")+3);
            let urlDomain = removeHttp.substring(0, removeHttp.indexOf("/"));
            let urlContent = removeHttp.substring(removeHttp.indexOf("/"));
            let protocolo = url.substring(0, url.indexOf("://"));

            
            let objError = {dominio: urlDomain, pagina: urlContent, protocolo: protocolo, erros: arrPush};

            escreveNoLog(objError,"ObjetosLog");
        }

    }catch(e){
        console.log("CATCH: " + e + " - URL: " + url);
    }

};

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
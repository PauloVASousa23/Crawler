const pptr = require('puppeteer-core');

let browser = null;
let viewport = {width: 1360, height: 768};

async function abreBrowser(){
    if(browser == null){
        browser = await pptr.launch({
            headless: false,
            executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
            ignoreHTTPSErrors: true,
        });
    }
}

async function getBrowser(){
    if(browser == null){
        await abreBrowser();
    }
    
    return browser;
}

async function abrePagina(){
    let page;
    if(browser != null){
        page = await browser.newPage();
        page.setViewport(viewport);
    }else{
        await abreBrowser();
        page = await browser.newPage();
        page.setViewport(viewport);
    }
    
    return page;
}

async function navegaPagina(pagina,url){
    await pagina.goto(url, {waitUntil: "load", timeout: 300000});
}


module.exports = {
    abreBrowser,
    getBrowser,
    abrePagina,
    navegaPagina
}
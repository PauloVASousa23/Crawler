# Crawler
Aplicação feita em <strong>Node.js</strong>, é utilizado <strong>puppeteer</strong> para utilização do browser e <strong>Mustache</strong> como template front-end.
<br/>
  Uma mistura de web crawler com web scrapper, a aplicação obtem todos os links de uma url fornecida e apartir dela ele acessa essas Url's e com base nessas outras Url's ela vai pegando novamente os links da nova pagina, e permanece neste ciclo até acessar todas as paginas. <br/>
  É possivel definir palavras chaves para a apliação acessar Url's que tenha a palavra chave nela, é possivel tambem definir palavras de exceções.<br/>
  A aplicação pode executar diversas instancias simultaneamente, desta forma, é possivel definir que todas as instancias utilizem a mesma base de Url's para que uma não acesse uma url na qual outra ja acessou ou então desabilitar, permitindo que elas acessem as mesmas url's.<br/>
  Alem da obtenção dos links e acessar as paginas, a aplicação obtem todos os erros em console, erros de requisições e recursos, através de tais erros ele apresenta na interface grafica todo o relatório, sendo possivel filtrar pelos tipos de errou ou pelo dominio na qual obteve o erro.<br/>
  Tambem é registrado todas as paginas na qual o Crawler/Scrapper acessou.

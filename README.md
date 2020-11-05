# Crawler
Aplicação feita em <strong>Node.js</strong>, é utilizado <strong>puppeteer</strong> para utilização do browser e <strong>Mustache</strong> como template front-end.
<br/><br/><br/>

  Uma mistura de web crawler com web scrapper, a aplicação obtem todos os links de uma url fornecida e apartir dela ele acessa essas Url's e com base nessas outras Url's ela vai pegando novamente os links da nova pagina, e permanece neste ciclo até acessar todas as paginas. <br/><br/>
  
  É possivel definir palavras chaves para a apliação acessar Url's que tenha a palavra chave nela, é possivel tambem definir palavras de exceções.<br/><br/>
  
  A aplicação pode <strong>executar diversas instancias simultaneamente</strong>, desta forma, é possivel definir que todas as instancias utilizem a mesma base de Url's para que uma não acesse uma url na qual outra ja acessou ou então desabilitar, permitindo que elas acessem as mesmas url's.<br/><br/>
  
  Alem da obtenção dos links e acessar as paginas, <strong>a aplicação obtem todos os erros em console, erros de requisições e recursos, através de tais erros ele apresenta na interface grafica todo o relatório</strong>, sendo possivel filtrar pelos tipos de errou ou pelo dominio na qual obteve o erro.<br/><br/>
  
  É possivel <strong>obter as paginas na qual se definir um palavra chave</strong>, a aplicação ira acessar as paginas e verificar em todo seu conteudo se naquela pagina contem a palavra chave informada.
  É possivel acompanhar a execução da instancia, verificar as paginas ja acessadas por elas, as proximas a serem acessadas, os erros e prints obtidos por ela.
  
  É possivel no <strong>meio da execução alterar uma função</strong>, por exemplo, eu iniciei uma instancia, na qual apenas pega os links nas paginas, mas durante a execução decidi que ela deve tambem tirar print de todoas as paginas que ela acessar, acessando a configuração da instancia consigo tanto adicionar ou remover funções no meio da execução, quanto solicitar que ela utilize links obtidos de outras instancias.<br/><br/>
  
  É possivel <strong>pausar, continuar ou parar a execução de uma ou mais instancias</strong>.<br/><br/>
  Tambem é registrado todas as paginas na qual o Crawler/Scrapper acessou.

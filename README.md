# Visão Geral

#### Frontend (React)
- Exibe dois campos de busca (um para obras, outro para locais), com funcionalidade de autocomplete.
- Quando o usuário seleciona uma obra e um local, clicando em “Registrar”, o React envia uma requisição ao backend com { obra_id, local_id }.

#### Backend (Node + Express + PostgreSQL)
- Recebe a requisição de “nova movimentação” (rota POST /movimentacoes).
- Faz um INSERT na tabela movimentacoes, mas preenchendo obra_nome e local_nome com subconsultas que buscam os nomes diretamente das tabelas obras e locais.
- Retorna ao frontend o registro recém-criado ou um erro.

### Instruções de Uso:

##### Frontend
1. Após clonar o repositório é necessário entrar na pasta do frontend: *cd frontend-masp*
2. Depois de entrar na pasta é necessário instalar as dependências: *npm install*
3. Após instalar as dependências, basta rodar o comando: *npm run dev*
Isso iniciará o servidor local, e o projeto estará disponível em http://localhost:5173/ ou na URL exibida no terminal.

##### Backend
1. Após clonar o repositório, entre na pasta do backend: *cd backend-masp*
2. Instale as dependências: *npm install*
3. Inicie o servidor backend: *npm run dev*

### Fluxo de uma movimentação
Para ficar 100% claro, imagine que o usuário vai adicionar a movimentação de “Obra X” para “Local Y”:

1. Página carrega (Movimentacao.jsx faz api.get("/obras") e api.get("/locais")):
- obras e locais são guardados no estado React.

2. Usuário digita parte do título da obra (ex: “x” em “Obra X”):
- handleFiltrarObras filtra localmente as obras cujo titulo contenha “x”.
- Aparece uma lista de autocomplete; usuário clica na “Obra X”.
- handleSelecionarObra define:
    - obraSelecionada = "Obra X"
    - obraId = 123 (por exemplo)
    - Fecha a lista.

3. Usuário digita parte do local (ex: “Loc” para “Local Y”):
- handleFiltrarLocais faz a mesma lógica de filtragem.
- Clica em “Local Y”.
- handleSelecionarLocal define:
    - localSelecionado = "Local Y"
    - localId = 999
    - Fecha a lista

4. Usuário clica em “Registrar”:
- handleRegistrar checa: se obraId e localId não forem nulos, chama registrarMovimentacao(obraId, localId).
- O registrarMovimentacao (em api.js) faz um POST /movimentacoes enviando { "obra_id": 123, "local_id": 999 }.

5. No backend (server.js, rota POST /movimentacoes):
- Lê obra_id = 123 e local_id = 999.
- Roda a query:
```sql
INSERT INTO movimentacoes (obra_id, local_id, obra_nome, local_nome)
VALUES (
  123,
  999,
  (SELECT titulo FROM obras WHERE id = 123),
  (SELECT nome   FROM locais WHERE id = 999)
)
RETURNING *;
```
- Digamos que SELECT titulo FROM obras WHERE id=123 retorne “Obra X”, e SELECT nome FROM locais WHERE id=999 retorne “Local Y”.
- O banco então insere uma nova linha em movimentacoes com:
    - obra_id = 123
    - obra_nome = "Obra X"
    - local_id = 999
    - local_nome = "Local Y"
    - data_movimentacao = (NOW())
- O backend retorna essa linha (JSON) ao Axios.

6. Frontend recebe a resposta de sucesso:
- handleRegistrar escreve “Movimentação registrada com sucesso!” em mensagem.
- Limpa o estado dos inputs e IDs, para o usuário poder registrar outra movimentação.

### 1. server.js (Backend em Node/Express)
- O que faz?
    - É o servidor do lado do Node.js que expõe as rotas da sua API para o frontend.
    - Conecta-se ao banco de dados PostgreSQL usando pg (Pool).
    - Define rotas como /obras, /locais e /movimentacoes.
    - Cada rota faz consultas ou inserções no banco de dados e retorna JSON.

- Como trabalhamos nele?
    - Configuramos o Pool para acessar o PostgreSQL (usando variáveis de ambiente .env).
    - Escrevemos rotas GET para listar dados (obras, locais, movimentações) e um POST para adicionar uma nova movimentação.
    - Sempre que o React chama api.post("/movimentacoes") ou api.get("/obras"), quem recebe essa requisição é o server.js.
    - A lógica de subconsulta no INSERT (para gravar obra_nome e local_nome) também está aqui.

- Em resumo: Se alguém quiser criar novas rotas, novas formas de inserir dados ou buscar dados, vai alterar o server.js.

### 2. Movimentacao.jsx (Página React que registra movimentações)
- O que faz?
    - É um componente React que exibe o formulário de movimentações.
    - Mostra dois campos de autocomplete: um para “Obra” e outro para “Local”.
    - Quando o usuário clica em “Registrar”, chama a função registrarMovimentacao(obraId, localId).

- Como trabalhamos nele?

1. Estados e Efeitos (useState, useEffect):
    - obras, locais: para guardar a lista de obras e locais trazidas do servidor (GET /obras e GET /locais).
    - obraSelecionada, localSelecionado: o texto que o usuário digita no input.
    - obraId, localId: para guardar o id da obra/local selecionada.
    - filtrandoObras, filtrandoLocais: guardam as opções filtradas para o autocomplete.
    - mensagem: exibe feedback de sucesso ou erro na tela.

2. Funções de filtragem: handleFiltrarObras e handleFiltrarLocais
    - Filtram a lista local de obras/locais conforme o usuário digita. Mostram uma lista de sugestões.

3. Funções de seleção: handleSelecionarObra e handleSelecionarLocal
    - Quando o usuário clica numa sugestão, definem o nome no input e guardam o ID para a futura requisição de registro.

4. Função de registrar movimentação: handleRegistrar
    - Verifica se os IDs estão definidos.
    - Chama registrarMovimentacao(obraId, localId) (importado de api.js).
    - Se der tudo certo, limpa os campos e mostra “Movimentação registrada com sucesso!”.

- Em resumo: É a interface de usuário para cadastro de movimentações. Usa autocomplete, filtra dados em tempo real e manda pro servidor quando confirmamos.

### 3. api.js (Configuração do Axios e funções de chamada à API)
- O que faz?
    - Centraliza a configuração do Axios, definindo a baseURL (http://localhost:5000).
    - Exporta funções específicas para cada operação do servidor. Exemplo: registrarMovimentacao(obra_id, local_id).

- Como trabalhamos nele?
    - Criamos uma instância do axios.create({...}).
    - Definimos uma função registrarMovimentacao que faz POST /movimentacoes.
    - Quando o React chama registrarMovimentacao(obraId, localId), esse arquivo cuida de montar a requisição HTTP e enviar ao server.js.

- Em resumo: É a ponte entre o React e o servidor Node. Se precisarmos de outras rotas (por exemplo, deletar movimentação), provavelmente criaremos outra função aqui, tipo deletarMovimentacao(id) que faria api.delete("/movimentacoes/" + id).

### 4. App.jsx (Gerencia as rotas do frontend com React Router)
- O que faz?
    - É o arquivo principal de rotas do React Router.
    - Diz: “Se o usuário acessar /, mostre o componente <Movimentacao />”, “Se acessar /search, mostre <Search />”, etc.

- Como trabalhamos nele?
    - Importamos BrowserRouter, Routes, Route do react-router-dom.
    - Criaramos <Navbar /> para estar presente em todas as páginas.
    - Fizemos <Route path="/" element={<Movimentacao />} /> para exibir a tela de movimentações como a rota principal.

- Em resumo: É o organizador de páginas no frontend. Quem quiser criar uma nova página, por exemplo, /relatorios, provavelmente adicionaria <Route path="/relatorios" element={<Relatorios />} /> aqui.

### 5. main.jsx (Ponto de entrada do React)
- O que faz?

    - É o primeiro arquivo que o Vite (ou o bundler) executa ao iniciar a aplicação React.
    - Renderiza o <App /> dentro do <div id="root"></div> no HTML.
    - Geralmente, é onde se configura se a aplicação roda em <React.StrictMode> ou não.

- Como trabalhamos nele?

    - Importamos o <App /> e chamamos ReactDOM.createRoot(document.getElementById("root")).render(<App />).
    - Assim, tudo que está no <App /> (todas as rotas, componentes etc.) vai ser exibido no browser.
    - É muito provável que não vamos alterar esse arquivo com muita frequência; ele é o ponto inicial padrão.

- Em resumo: É o início da aplicação React, quem monta todo o resto na tela.
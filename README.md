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
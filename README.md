# PFE-MASP

📂 frontend-masp
 ┣ 📂 src
 ┃ ┣ 📂 pages  <-- (Contém as telas do app)
 ┃ ┃ ┣ 📜 Login.jsx  <-- Tela de login
 ┃ ┃ ┣ 📜 Search.jsx  <-- Tela de pesquisa de obras
 ┃ ┃ ┣ 📜 Movimentacao.jsx  <-- Tela de movimentação de obras
 ┃ ┣ 📂 components  <-- (Componentes reutilizáveis)
     ┣ 📜 NavBar.jsx  <-- Tela de movimentação de obras
 ┃ ┣ 📂 assets  <-- (Imagens e arquivos estáticos)
 ┃ ┣ 📂 hooks  <-- (Funções customizadas, se necessário)
 ┃ ┣ 📜 main.jsx  <-- Arquivo principal que configura as rotas
 ┃ ┣ 📜 index.css  <-- Estilização global do projeto
 ┣ 📜 package.json  <-- Dependências e scripts do projeto
 ┣ 📜 vite.config.js  

1. Após clonar o repositório é necessário entrar na pasta do projeto: *cd frontend-masp*
2. Depois de entrar na pasta é necessário instalar as dependências: *npm install*
3. Após instalar as dependências, basta rodar o comando: *npm run dev*
Isso iniciará o servidor local, e o projeto estará disponível em http://localhost:5173/ ou na URL exibida no terminal.

📁 backend-masp
├── 📄 .env (Configurações de ambiente, como credenciais do banco de dados)
├── 📄 .gitignore (Arquivos ignorados pelo Git, como node_modules e .env)
├── 📄 package.json (Dependências e scripts do backend)
├── 📄 package-lock.json (Versões travadas das dependências)
├── 📄 server.js (Arquivo principal que inicia o servidor backend)
├── 📁 routes (Define as rotas da API)
│ ├── 📄 obras.js (Rota para manipulação de obras)
│ ├── 📄 locais.js (Rota para manipulação de locais)
│ ├── 📄 movimentacoes.js (Rota para manipulação de movimentações)
├── 📁 controllers (Controladores das requisições da API)
│ ├── 📄 obraController.js (Lógica de manipulação de obras)
│ ├── 📄 localController.js (Lógica de manipulação de locais)
│ ├── 📄 movimentacaoController.js (Lógica de manipulação de movimentações)
├── 📁 models (Modelos do banco de dados)
│ ├── 📄 obraModel.js (Modelo de dados para obras)
│ ├── 📄 localModel.js (Modelo de dados para locais)
│ ├── 📄 movimentacaoModel.js (Modelo de dados para movimentações)
├── 📁 database (Conexão e configuração do banco de dados)
│ ├── 📄 db.js (Arquivo de conexão com o banco PostgreSQL)

Para iniciar o backend basta rodar:
1. *npm run dev*

### Instruções de Uso:
1. **Após clonar o repositório**, entre na pasta do backend:
   ```sh
   cd backend-masp
Instale as dependências:
sh
Copy
Edit
npm install
Inicie o servidor backend:
sh
Copy
Edit
npm run dev
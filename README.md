# MASP - Controle de Movimentação de Obras

## Visão Geral do Projeto

Este projeto foi desenvolvido para automatizar o controle de movimentação e localização das obras do acervo do MASP (Museu de Arte de São Paulo Assis Chateaubriand). Tradicionalmente, o museu utilizava registros manuais em papel, o que gerava erros de transcrição e dificuldades de rastreamento. A solução propõe substituir o processo manual por um sistema digital baseado em QR Codes.

## Objetivo

* Registrar as movimentações de obras de forma digital e segura.
* Facilitar a consulta de movimentações e gerar históricos de movimentação.
* Gerar e imprimir QR Codes para obras e locais.
* Integrar parcialmente com o banco oficial do MASP (In.Arte), garantindo informações atualizadas de obras.

---

## Arquitetura da Solução

O sistema é composto por 3 camadas principais:

* **Frontend:** Aplicação React.js responsiva e intuitiva.
* **Backend:** API REST em Node.js com Express.js.
* **Banco de Dados:** PostgreSQL.

Tudo hospedado na nuvem (Render).

Além disso, há integração com a API oficial do MASP (In.Arte) para manter os dados das obras sempre atualizados.

---

## Tecnologias Utilizadas

* React.js (Frontend)
* Node.js + Express.js (Backend)
* PostgreSQL (Banco de Dados)
* Axios (requisições HTTP)
* Bcrypt (hash de senhas)
* JWT (autenticação)
* html5-qrcode (leitura de QR Codes via câmera)
* QRCode + JSZip + FileSaver (geração e download de QR Codes)
* Luxon (manipulação de datas com timezone)
* Render (Hospedagem na nuvem)

---

## Estrutura e Funcionamento do Código

### 1️⃣ Frontend (React)

#### Autenticação:

* Página de Login (`Login.jsx`) faz requisição para `/login` na API.
* Token JWT recebido é armazenado no `localStorage`.
* Middleware `RequireAuth` (em `App.jsx`) protege as rotas autenticadas.

#### Telas Principais:

* **Movimentacao.jsx**: Registro das movimentações com leitura de QR Codes (obras e locais).
* **CriarQRCode.jsx**: Geração de QR Codes de forma manual ou em lote (texto ou CSV).
* **Consulta.jsx**: Consulta avançada com múltiplos filtros e exportação CSV das movimentações.
* **NavBar.jsx**: Navegação pelo sistema.
* **LerQR.jsx**: Componente de leitura de QR Code via câmera.

#### API Client:

* Arquivo `api.js` centraliza as chamadas ao backend e já injeta o token JWT no header.

### 2️⃣ Backend (Node.js + Express)

#### Principais Endpoints:

* `POST /login`: Autenticação com bcrypt e JWT.
* `GET /obras`: Busca de obras via API pública do MASP (In.Arte).
* `GET /locais`: Consulta dos locais armazenados no banco local.
* `GET /movimentacoes`: Consulta com filtros dinâmicos.
* `POST /movimentacoes`: Registra movimentação de obra, buscando dados em tempo real na API do MASP.
* `GET /usuarios`: Listagem de usuários cadastrados.

#### Integração com API MASP (In.Arte)

* Busca de obras é feita via requisições HTTP usando `axios`.
* Sempre que uma obra é lida ou consultada, o sistema consulta a base oficial garantindo dados atualizados.

#### Segurança:

* As senhas são armazenadas de forma criptografada (bcrypt).
* Todas rotas de movimentação exigem token JWT válido.

### 3️⃣ Banco de Dados (PostgreSQL)

#### Tabelas:

* `usuarios`: dados de autenticação.
* `locais`: locais de armazenamento das obras.
* `movimentacoes`: registros detalhados de cada movimentação.

#### Exemplo de registro de movimentação:

* obra\_tombo
* obra\_nome
* local\_id
* local\_nome
* usuario\_id
* usuario\_nome
* tipo\_movimentacao (Entrada ou Saída)
* data\_movimentacao (timestamp)
* notas\_adicionais

---

## Fluxo Completo de Funcionamento

1. Funcionário acessa o sistema e realiza login.
2. Escaneia QR Codes das obras e do local de origem/destino.
3. Seleciona tipo de movimentação (Entrada ou Saída).
4. (Opcional) Insere notas adicionais.
5. Registra a movimentação, que fica gravada no banco.
6. Pode consultar movimentações passadas com múltiplos filtros.
7. Pode exportar consultas em CSV.
8. Pode gerar QR Codes individualmente ou em lote.

---

## Como Executar Localmente

### Pré-requisitos:

* Node.js >= 18.x
* PostgreSQL >= 15.x

### 1️⃣ Configurar o Backend

```bash
cd backend-masp
npm install
```

* Criar arquivo `.env` com as seguintes variáveis:

```
DB_USER=...
DB_PASSWORD=...
DB_HOST=...
DB_NAME=...
DB_PORT=...
JWT_SECRET=...
MASP_API_BASE_URL=https://inarte.masp.org.br/api/api
MASP_API_LANG=BR
MASP_API_PAGE_SIZE=50
```

### 2️⃣ Executar o Backend

```bash
node server.js
```

### 3️⃣ Configurar o Frontend

```bash
cd frontend-masp
npm install
```

* Criar arquivo `.env` com:

```
VITE_API_URL=http://localhost:5000
```

### 4️⃣ Executar o Frontend

```bash
npm run dev
```

Sistema rodará localmente em `http://localhost:5173`

---

## Possíveis Evoluções Futuras

* Integração direta via POST com o banco oficial do MASP (In.Arte).
* Migração para infraestrutura interna do MASP (servidor dedicado).
* Integração de tecnologia RFID para segurança adicional.
* Melhorias na performance com novos servidores de cloud.

---

## Créditos

* Alexandre Rodrigues Santarossa
* Natan Kron Goldenberg Lewi
* Pedro Gomes de Sá Drumond
* Orientador: Prof. Dr. Luiz Fernando Cardoso dos Santos Durão
* Coorientador: Prof. Maurício Bouskela
* Capstone Insper 2025

---

Este projeto foi desenvolvido em parceria direta com a equipe técnica do MASP.

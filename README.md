

Aplicação full-stack para cadastro e listagem de usuários com paginação, utilizando React no frontend e Node.js + Express + SQLite no backend.


O Vite possui um **proxy** configurado no `vite.config.js`: toda requisição para `/api/*` é redirecionada automaticamente para `http://localhost:5000`, eliminando problemas de CORS.


## BACKEND

Cria e exporta a conexão com o arquivo `usuarios.db` usando a biblioteca `sqlite3`. Ao conectar, executa automaticamente a função `inicializarTabela()`, que cria a tabela `usuarios` com as colunas:

| Coluna | Tipo | Regra |
|--------|------|-------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `nome` | TEXT | NOT NULL |
| `email` | TEXT | NOT NULL, UNIQUE |
| `senha` | TEXT | NOT NULL |

O módulo é exportado com `module.exports = db` para ser usado no `server.js`.

---

### `server.js`

#### Rota 1: `POST /api/cadastro` — Cadastrar usuário

**Fluxo completo:**

1. **Extrai os dados** do corpo da requisição (`req.body`): `nome`, `email`, `senha`, `confirmarSenha`.
2. **Validações no servidor** (camada extra de segurança, além das validações do frontend):
   - Todos os campos são obrigatórios → retorna `400` com erro.
   - As senhas devem ser iguais → retorna `400` com erro.
   - A senha deve ter no mínimo 8 caracteres → retorna `400` com erro.
3. **Insere no banco** com `INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`. Os `?` são placeholders que recebem os valores do array `[nome, email, senha]`, prevenindo **SQL Injection**.
4. **Tratamento de erros**:
   - Se o erro contiver `'UNIQUE'` → e-mail já cadastrado → `400`.
   - Qualquer outro erro → `500` (falha interna).
5. **Sucesso** → retorna status `201` com `{ mensagem, id }`.

#### Rota 2: `GET /api/usuarios?pagina=1&limite=5` — Listar usuários com paginação

**Como a paginação funciona:**

1. **Parâmetros de query**:
   - `pagina` (padrão: 1) — número da página atual.
   - `limite` (padrão: 5) — quantidade de registros por página.
   - `offset` = `(pagina - 1) * limite` — quantos registros pular no banco.

2. **Primeira query**: `SELECT COUNT(*) as total FROM usuarios` — conta quantos registros existem no total.
   - `totalPaginas = Math.ceil(total / limite)` — arredonda para cima. Exemplo: 12 registros com limite 5 → `Math.ceil(12/5) = 3` páginas.

3. **Segunda query**: `SELECT id, nome, email FROM usuarios ORDER BY id DESC LIMIT ? OFFSET ?` — busca apenas os registros da página atual, ordenados do mais recente para o mais antigo (`ORDER BY id DESC`).

4. **Resposta JSON**:
   ```json
   {
     "usuarios": [ { "id": 3, "nome": "Carlos", "email": "c@email.com" }, ... ],
     "paginacao": {
       "pagina": 1,
       "limite": 5,
       "total": 12,
       "totalPaginas": 3,
       "temProxima": true,
       "temAnterior": false
     }
   }
   ```
   - `temProxima`: `true` se `pagina < totalPaginas`.
   - `temAnterior`: `true` se `pagina > 1`.
   
   Esses booleanos são usados pelo frontend para **habilitar/desabilitar** os botões de navegação.

---

## FRONTEND

### `main.jsx` 

Chamado pelo `index.html` via `<script type="module" src="/src/main.jsx">`. Renderiza o componente `<App />` dentro de `<StrictMode>` (modo de desenvolvimento que ajuda a detectar problemas). Importa o CSS global `index.css`.

---

### `App.jsx` 

Envolve toda a aplicação dentro do `UserProvider` (Context API), que disponibiliza o estado global de usuários para todos os componentes filhos. A estrutura renderizada é:

```
UserProvider
  └── app-container
       └── app-layout
            ├── FormularioCadastro  (formulário de cadastro)
            ├── app-divider "ou"    (separador visual)
            └── ListaUsuarios       (botão + listagem paginada)
```

---

### `contexts/UserContext.jsx` 

**Por que usar Context?** Para que o estado dos usuários e da paginação seja compartilhado entre componentes sem precisar passar props manualmente (prop drilling).

**O que ele fornece:**

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `usuarios` | Array | Lista de usuários da página atual |
| `paginacao` | Object | Dados de paginação (página, total, etc.) |
| `carregando` | boolean | `true` enquanto a requisição está em andamento |
| `erro` | string | Mensagem de erro, se houver |
| `buscarUsuarios(pagina, limite)` | function | Faz GET em `/api/usuarios` e atualiza o estado |
| `limparLista()` | function | Reseta todos os estados |

**Fluxo da `buscarUsuarios`:**

1. Seta `carregando = true` e limpa `erro`.
2. Chama `axios.get('/api/usuarios', { params: { pagina, limite } })`.
3. Se sucesso: atualiza `usuarios` e `paginacao` com os dados da resposta.
4. Se erro: extrai a mensagem de `erro.response.data.erro` e armazena em `erro`.
5. Finalmente: `carregando = false`.

O hook `useUsuarios()` é um atalho para `useContext(UserContext)` com validação de que está sendo usado dentro do Provider.

---

### `components/FormularioCadastro.jsx` — Formulário de Cadastro

Utiliza a biblioteca **react-hook-form** para gerenciar o formulário com validação.

**Campos e validações:**

| Campo | Tipo | Regras de validação |
|-------|------|---------------------|
| `nome` | text | Obrigatório |
| `email` | email | Obrigatório + pattern regex (`/^\S+@\S+\.\S+$/`) |
| `senha` | password | Obrigatório + mínimo 8 caracteres |
| `confirmarSenha` | password | Obrigatório + deve ser igual ao campo `senha` via `validate` |

**Destaques do código:**

- **`watch('senha')`** — monitora o valor do campo senha em tempo real. O campo `confirmarSenha` usa `validate: (valor) => valor === senhaDigitada` para comparar.
- **`handleSubmit(onSubmit)`** — função do react-hook-form que só chama `onSubmit` se todas as validações passarem.
- **`onSubmit`** envia os dados via `axios.post('/api/cadastro', dados)` (URL relativa, que o proxy do Vite redireciona para o backend).
- **Tratamento de resposta:**
  - Sucesso → exibe alerta verde com a mensagem do servidor e reseta o formulário com `reset()`.
  - Erro → exibe alerta vermelho com `erro.response.data.erro` ou "Erro de conexão com o servidor" se não houver resposta.

O estado `status` controla a exibição de mensagens na tela (em vez de `alert()`).

---

### `components/ListaUsuarios.jsx` — Listagem com Paginação

**Componente dividido em duas partes:**

#### 1. Botão de toggle
- Quando fechado: exibe "👥 Ver Usuários Cadastrados".
- Quando aberto: exibe "✕ Fechar Lista" (com classe `ativo` que muda a cor para vermelho).

#### 2. Conteúdo expansível (exibido apenas quando `mostrar === true`)

**useEffect:** Ao abrir (`mostrar` muda para `true`), dispara automaticamente `buscarUsuarios(1)` para carregar a primeira página.

**Estados de exibição:**

1. **Carregando** (`carregando === true`) → spinner animado + texto "Buscando usuários...".
2. **Erro** → alerta vermelho com a mensagem.
3. **Lista vazia** (sem erro e sem usuários) → ícone 📭 + "Nenhum usuário cadastrado ainda."
4. **Com dados** → tabela + paginação.

**Tabela:**

As colunas são:
- `#` — número sequencial calculado: `(paginaAtual - 1) * limite + índice + 1`. Exemplo: se estamos na página 2 com limite 5, o primeiro item da página 2 será `(2-1)*5 + 0 + 1 = 6`.
- `Nome` — nome do usuário.
- `E-mail` — email do usuário.

**Paginação (exibida apenas se `totalPaginas > 1`):**

Botões de navegação:
- `««` — vai para a primeira página (desabilitado se `temAnterior === false`).
- `«` — volta uma página (desabilitado se `temAnterior === false`).
- Indicador central: "Página X de Y (N registros)".
- `»` — avança uma página (desabilitado se `temProxima === false`).
- `»»` — vai para a última página (desabilitado se `temProxima === false`).

Cada botão chama `handlePagina(pagina)`, que por sua vez chama `buscarUsuarios(pagina, limite)` do Context.

**Botão de atualizar** (↻ no canto superior direito): recarrega a página atual. Quando `carregando` é `true`, o botão fica desabilitado e ganha uma animação de rotação infinita.

---

## 🔄 Fluxo completo de ponta a ponta

### Cadastro
```
Usuário preenche o formulário
  → react-hook-form valida os campos no frontend
  → onSubmit() chama axios.post('/api/cadastro', dados)
    → Vite proxy redireciona para localhost:5000/api/cadastro
      → server.js valida novamente os campos
      → db.run() insere no SQLite
      → Se email duplicado: erro 400 "E-mail já cadastrado"
      → Se sucesso: 201 { mensagem, id }
    → Frontend exibe alerta verde ou vermelho
```

### Listagem com paginação
```
Usuário clica "Ver Usuários Cadastrados"
  → useEffect dispara buscarUsuarios(1)
    → Context chama axios.get('/api/usuarios?pagina=1&limite=5')
      → Vite proxy redireciona para localhost:5000/api/usuarios
        → server.js conta total de registros (COUNT)
        → server.js busca apenas 5 registros (LIMIT 5 OFFSET 0)
        → Retorna { usuarios: [...], paginacao: {...} }
    → Context atualiza estados (usuarios, paginacao)
    → ListaUsuarios renderiza tabela

Usuário clica "»" (próxima página)
  → handlePagina(2) → buscarUsuarios(2)
    → server.js busca com LIMIT 5 OFFSET 5
    → Retorna próximos 5 registros
  → Tabela é atualizada com novos dados
  → Botão "«" é habilitado, "»" pode ser desabilitado se não houver mais páginas
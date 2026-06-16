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
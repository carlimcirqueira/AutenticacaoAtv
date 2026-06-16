const express = require('express');
const cors = require('cors');
const db = require('./database'); // Importa a conexão com o SQLite

const app = express();

// Middlewares obrigatórios
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
})); // Permite que o Frontend converse com o Backend (porta 5000)
app.use(express.json()); // Permite que o servidor entenda os dados em formato JSON

// ==========================================
// ROTA DE CADASTRO
// ==========================================
app.post('/api/cadastro', (req, res) => {
    const { nome, email, senha, confirmarSenha } = req.body;

    if (!nome || !email || !senha || !confirmarSenha) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
    }

    if (senha !== confirmarSenha) {
        return res.status(400).json({ erro: 'As senhas informadas não coincidem.' });
    }

    if (senha.length < 8) {
        return res.status(400).json({ erro: 'A senha deve conter no mínimo 8 caracteres.' });
    }

    const query = `INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`;

    db.run(query, [nome, email, senha], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ erro: 'Este e-mail já está cadastrado.' });
            }
            return res.status(500).json({ erro: 'Falha interna ao salvar no banco de dados.' });
        }

        res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso!',
            id: this.lastID
        });
    });
});

// ==========================================
// ROTA DE LISTAGEM COM PAGINAÇÃO
// ==========================================
app.get('/api/usuarios', (req, res) => {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 5;
    const offset = (pagina - 1) * limite;

    // Primeiro conta o total de registros
    db.get(`SELECT COUNT(*) as total FROM usuarios`, (err, row) => {
        if (err) {
            return res.status(500).json({ erro: 'Falha ao contar usuários.' });
        }

        const total = row.total;
        const totalPaginas = Math.ceil(total / limite);

        // Depois busca os registros com paginação
        db.all(`SELECT id, nome, email FROM usuarios ORDER BY id DESC LIMIT ? OFFSET ?`, [limite, offset], (err, rows) => {
            if (err) {
                return res.status(500).json({ erro: 'Falha ao listar usuários.' });
            }

            res.json({
                usuarios: rows,
                paginacao: {
                    pagina,
                    limite,
                    total,
                    totalPaginas,
                    temProxima: pagina < totalPaginas,
                    temAnterior: pagina > 1
                }
            });
        });
    });
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
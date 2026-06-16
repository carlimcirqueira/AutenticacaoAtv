const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json()); // Permite ler JSON enviado no corpo (body) da requisição

// 1. Inicializa o Banco de Dados SQLite
const db = new sqlite3.Database('./usuarios.db', (err) => {
if (err) console.error('Erro ao conectar ao SQLite:', err.message);
else console.log('Conectado ao banco de dados SQLite.');
});

// Cria a tabela de usuários caso não exista
db.run(`
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL
)
`);

// 2. Rota de Cadastro (POST) com Validação no Servidor
app.post('/api/cadastro', (req, res) => {
const { nome, email, senha, confirmarSenha } = req.body;

  // Validação estrita na camada do servidor
if (!nome || !email || !senha || !confirmarSenha) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
}

if (senha !== confirmarSenha) {
    return res.status(400).json({ erro: 'As senhas informadas não coincidem.' });
}

if (senha.length < 8) {
    return res.status(400).json({ erro: 'A senha deve conter no mínimo 8 caracteres.' });
}

  // Insere os dados salvando no banco de dados
const query = `INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`;

db.run(query, [nome, email, senha], function (err) {
    if (err) {
      // Tratamento de exceção caso o email já esteja cadastrado (UNIQUE)
    if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ erro: 'Este e-mail já está cadastrado.' });
    }
    return res.status(500).json({ erro: 'Falha interna ao salvar no banco de dados.' });
    }
    
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', id: this.lastID });
});
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define o caminho onde o arquivo físico do banco de dados (usuarios.db) será salvo
const dbPath = path.resolve(__dirname, 'usuarios.db');

// 1. Cria e conecta ao banco de dados SQLite
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite com sucesso.');
        inicializarTabela();
    }
});

// 2. Função que cria a tabela se ela ainda não existir
function inicializarTabela() {
    db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL, 
    senha TEXT NOT NULL
    )
`, (err) => {
        if (err) {
            console.error('Erro ao criar a tabela de usuários:', err.message);
        } else {
            console.log('Tabela "usuarios" pronta para uso (campos: nome, email, senha).');
        }
    });
}

// Exporta a conexão para ser usada no arquivo principal do servidor (server.js)
module.exports = db;
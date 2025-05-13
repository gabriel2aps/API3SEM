import express from 'express'
import conexao from './db.js'
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import fs from 'fs';
const swaggerFile = JSON.parse(fs.readFileSync('./swagger-output.json', 'utf-8'));


const app = express()
app.use(express.json())

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API de Usuários e Endereços',
    version: '1.0.0',
    description: 'Documentação da API criada para a atividade',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./server.js'], // aponta para onde estão as anotações Swagger
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));


/*
  Rota post cria usuarios (CREATE)
  Rota get lista/lê os usuarios (READ)
  Rota put atualiza/edita um usuario (UPDATE)
  Rota delete deleta um usuario (DELETE)

  Rota post separada para criar as tabelas
*/

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
app.post('/criar-tabelas', (req, res) => {
  const sqlUsuarios = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT PRIMARY KEY AUTO_INCREMENT,
      nome VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      senha VARCHAR(100) NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const sqlEnderecos = `
    CREATE TABLE IF NOT EXISTS enderecos (
      id INT PRIMARY KEY AUTO_INCREMENT,
      rua VARCHAR(100) NOT NULL,
      cidade VARCHAR(100) NOT NULL,
      estado VARCHAR(50) NOT NULL,
      usuario_id INT NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );
  `;

  conexao.query(sqlUsuarios, (err1) => {
    if (err1) {
      console.error('Erro ao criar tabela usuarios:', err1);
      return res.status(500).json({ erro: 'Erro ao criar tabela usuarios' });
    }

    conexao.query(sqlEnderecos, (err2) => {
      if (err2) {
        console.error('Erro ao criar tabela enderecos:', err2);
        return res.status(500).json({ erro: 'Erro ao criar tabela enderecos' });
      }

      res.status(201).json({ mensagem: 'Tabelas criadas com sucesso!' });
    });
  });
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
app.post('/users', (req, res) => {
  const { nome, email, senha } = req.body;
  // Validação: todos os campos obrigatórios
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
  }
  // SQL para inserir usuário
  const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
  conexao.query(sql, [nome, email, senha], (err, resultado) => {
    if (err) {
      console.error('Erro ao inserir usuário:', err);
      return res.status(500).json({ erro: 'Erro ao inserir usuário' });
    }
    // retorna o novo usuário criado
    res.status(201).json({ id: resultado.insertId, nome, email });
  });
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
app.get('/users', (req, res) => {
  const sql = 'SELECT id, nome, email, criado_em FROM usuarios';
  conexao.query(sql, (err, resultados) => {
    if (err) {
      console.error('Erro ao buscar usuários:', err);
      return res.status(500).json({ erro: 'Erro ao buscar usuários' });
    }
    res.status(200).json(resultados);
  });
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { nome, email, senha } = req.body;

  const sql = 'UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?';
  conexao.query(sql, [nome, email, senha, id], (err, resultado) => {
    if (err) {
      console.error('Erro ao atualizar usuário:', err);
      return res.status(500).json({ erro: 'Erro ao atualizar usuário' });
    }
    res.status(200).json({ mensagem: 'Usuário atualizado com sucesso' });
  });
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM usuarios WHERE id = ?';
  conexao.query(sql, [id], (err, resultado) => {
    if (err) {
      console.error('Erro ao deletar usuário:', err);
      return res.status(500).json({ erro: 'Erro ao deletar usuário' });
    }
    res.status(200).json({ mensagem: 'Usuário deletado com sucesso' });
  });
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
app.post('/enderecos', (req, res) => {
  const { rua, cidade, estado, usuario_id } = req.body;

  if (!rua || !cidade || !estado || !usuario_id) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
  }

  const sql = 'INSERT INTO enderecos (rua, cidade, estado, usuario_id) VALUES (?, ?, ?, ?)';
  conexao.query(sql, [rua, cidade, estado, usuario_id], (err, resultado) => {
    if (err) {
      console.error('Erro ao inserir endereço:', err);
      return res.status(500).json({ erro: 'Erro ao inserir endereço' });
    }
    res.status(201).json({ id: resultado.insertId, rua, cidade, estado, usuario_id });
  });
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
app.get('/enderecos', (req, res) => {
  const sql = `
    SELECT e.id, e.rua, e.cidade, e.estado, e.usuario_id, u.nome AS nome_usuario
    FROM enderecos e
    JOIN usuarios u ON e.usuario_id = u.id
  `;
  conexao.query(sql, (err, resultados) => {
    if (err) {
      console.error('Erro ao buscar endereços:', err);
      return res.status(500).json({ erro: 'Erro ao buscar endereços' });
    }
    res.status(200).json(resultados);
  });
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
app.put('/enderecos/:id', (req, res) => {
  const { id } = req.params;
  const { rua, cidade, estado } = req.body;

  const sql = 'UPDATE enderecos SET rua = ?, cidade = ?, estado = ? WHERE id = ?';
  conexao.query(sql, [rua, cidade, estado, id], (err, resultado) => {
    if (err) {
      console.error('Erro ao atualizar endereço:', err);
      return res.status(500).json({ erro: 'Erro ao atualizar endereço' });
    }
    res.status(200).json({ mensagem: 'Endereço atualizado com sucesso' });
  });
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
app.delete('/enderecos/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM enderecos WHERE id = ?';
  conexao.query(sql, [id], (err, resultado) => {
    if (err) {
      console.error('Erro ao deletar endereço:', err);
      return res.status(500).json({ erro: 'Erro ao deletar endereço' });
    }
    res.status(200).json({ mensagem: 'Endereço deletado com sucesso' });
  });
});
app.listen(3000)
// Requisitos de uma rota
// 1) Tipo de rota / metodo HTTP
// 2) Endereço 

/* 
Criar nossa API
1- Criar um usuario
2- Listar todos os usuarios
3- Editar um usuario
4- Deletar um usuario
*/ 
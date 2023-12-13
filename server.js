require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const postgres = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());
app.use(cors());

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: 3306,
};

let db = mysql.createConnection(dbConfig);

function reiniciarConexaoMySQL() {
  db = mysql.createConnection(dbConfig);
}

db.connect((err) => {
  if (err) {
    console.error("Erro na conexão com o banco de dados:", err);
    return;
  }
  console.log("Conexão com o banco de dados estabelecida");
});

const pgConfig = {
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: 5432,
};

const mk = new postgres.Client(pgConfig);

mk.connect((err) => {
  if (err) {
    console.error("Erro na conexão com o banco de dados PostgreSQL:", err);
    return;
  }
  console.log("Conexão com o banco de dados PostgreSQL estabelecida");
});

app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  console.log("Requisição recebida em /login:");
  console.log("Email:", email);
  console.log("Senha:", senha);

  db.query(
    "SELECT id, email FROM usuario WHERE email = ? AND senha = ?",
    [email, senha],
    (err, result) => {
      if (err) {
        console.error("Erro ao verificar as credenciais:", err);
        return res
          .status(500)
          .json({ error: "Erro ao verificar as credenciais" });
      }

      if (result.length === 1) {
        const user = result[0];
        const token = jwt.sign(
          { email: user.email, id: user.id },
          "seu_segredo"
        );

        res.status(200).json({ token, userId: user.id });
      } else {
        res.status(401).json({ error: "Credenciais inválidas" });
      }
    }
  );
});

app.post("/inserir_usuario", (req, res) => {
  const formData = req.body;

  const user = {
    nome: formData.nome,
    cidade: formData.cidade,
    bairro: formData.bairro,
    usuario: formData.usuario,
    senha: formData.senha,
    telefone: formData.telefone,
    ativo: formData.ativo,
    dt_cadastro: formData.dt_cadastro,
    dt_inativado: formData.dt_inativado,
    email: formData.email,
    cargo: formData.cargo,
  };

  db.query("INSERT INTO usuario SET ?", user, (err, result) => {
    if (err) {
      console.error("Erro ao inserir valores no banco de dados:", err);
      res
        .status(500)
        .json({ error: "Erro ao inserir valores no banco de dados" });
    } else {
      console.log("Valores inseridos com sucesso");
      res.status(200).json({ message: "Valores inseridos com sucesso" });
    }
  });
});

app.get("/obter_usuarios", (req, res) => {
  db.query("SELECT * FROM usuario", (err, result) => {
    if (err) {
      console.error("Erro ao obter informações de usuários:", err);
      res.status(500).json({ error: "Erro ao obter informações de usuários" });
    } else {
      console.log("Informações de usuários obtidas com sucesso");
      res.status(200).json(result);
    }
  });
});

app.get("/obter_usuario/:userId", (req, res) => {
  const userId = req.params.userId;

  db.query(
    "SELECT nome, permissao FROM usuario WHERE id = ?",
    [userId],
    (err, result) => {
      if (err) {
        console.error("Erro ao obter informações do usuário:", err);
        res.status(500).json({ error: "Erro ao obter informações do usuário" });
      } else {
        if (result.length > 0) {
          const user = result[0];
          res.status(200).json(user);
        } else {
          res.status(404).json({ error: "Usuário não encontrado" });
        }
      }
    }
  );
});

app.get("/obter_estados", (req, res) => {
  const query = "SELECT DISTINCT id, estado FROM cidade";
  db.query(query, (err, result) => {
    if (err) {
      console.error("Erro ao obter informações de estados:", err);
      res.status(500).json({ error: "Erro ao obter informações de estados" });
    } else {
      console.log("Informações de estados obtidas com sucesso");
      res.status(200).json(result);
    }
  });
});

app.get("/obter_cidades", (req, res) => {
  const estado = req.query.estado;

  if (!estado) {
    return res
      .status(400)
      .json({ error: "O parâmetro 'estado' é obrigatório" });
  }

  const query = "SELECT DISTINCT id, nome FROM cidade WHERE estado = ?";
  db.query(query, [estado], (err, result) => {
    if (err) {
      console.error("Erro ao obter informações de cidades:", err);
      res.status(500).json({ error: "Erro ao obter informações de cidades" });
    } else {
      console.log("Informações de cidades obtidas com sucesso");
      res.status(200).json(result);
    }
  });
});

app.delete("/excluir_usuarios", (req, res) => {
  const userIds = req.body.userIds;

  console.log("IDs a serem excluídos:", userIds);

  if (!Array.isArray(userIds)) {
    return res.status(400).json({ error: "IDs inválidos para exclusão" });
  }

  db.query("DELETE FROM usuario WHERE id IN (?)", [userIds], (err, result) => {
    if (err) {
      console.error("Erro ao excluir usuário:", err);
      res.status(500).json({ error: "Erro ao excluir usuário" });
    } else {
      console.log("Usuários excluídos com sucesso");
      res.status(200).json({ message: "Usuários excluídos com sucesso" });
    }
  });
});

app.get("/exemplo_reiniciar_conexao", (req, res) => {
  reiniciarConexaoMySQL();
  res.status(200).json({ message: "Conexão reiniciada com sucesso" });
});

app.get("/obter_clientes_mk/:codcontrato", (req, res) => {
  const contrato = req.params.codcontrato;

  if (!contrato) {
    return res
      .status(400)
      .json({ error: "O parâmetro 'codcontrato' é obrigatório" });
  }

  const query =
    "SELECT mk_pessoas.codpessoa, mk_contratos.codcontrato, nome_razaosocial, mk_cidades.cidade cidade, mk_bairros.bairro bairro, mk_pessoas.datacadastro data_cadastro, mk_planos_acesso.descricao plano_acesso, CASE WHEN tipopessoa = 1 then 'Pessoa Física' WHEN tipopessoa = 2 then 'Pessoa Jurídica' else 'outros' END AS tipo_pessoa, CASE WHEN mk_pessoas.fone02 IS NULL THEN mk_pessoas.fone01 ELSE mk_pessoas.fone01 END AS telefone FROM mk_pessoas INNER JOIN mk_contratos on mk_contratos.cliente = mk_pessoas.codpessoa INNER JOIN mk_cidades on mk_cidades.codcidade = mk_pessoas.codcidade INNER JOIN mk_bairros on mk_bairros.codbairro = mk_pessoas.codbairro INNER JOIN mk_planos_acesso on mk_planos_acesso.codplano = mk_contratos.plano_acesso WHERE mk_contratos.codcontrato = ANY($1) limit 100";

  mk.query(query, [contrato.split(",")], (err, result) => {
    if (err) {
      console.error("Erro ao obter informações do mk_solutions:", err);
      res.status(500).json({ error: "Erro ao obter informações mk_solutions" });
    } else {
      console.log("Informações de mk_solutions obtidas com sucesso");
      const responseData = result.rows;
      res.status(200).json(responseData);
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

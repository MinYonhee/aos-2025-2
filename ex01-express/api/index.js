import "dotenv/config";
import serverless from "serverless-http";
import cors from "cors";
import express from "express";

import models, { sequelize } from "./models/index.js";
import routes from "./routes/index.js";

const app = express();
app.set("trust proxy", true);

// Configuração CORS
const corsOptions = {
  origin: ["http://example.com", "*"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Logger simples
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para injetar context
app.use(async (req, res, next) => {
  // Usuário "logado" de teste
  const me = await models.User.findByPk(1);
  req.context = {
    models,
    me,
  };
  next();
});

// Rotas
app.use("/", routes.root);
app.use("/session", routes.session);
app.use("/users", routes.user);
app.use("/messages", routes.message);

// Função para popular DB com usuários e mensagens (apenas local)
const createUsersWithMessages = async () => {
  const exists = await models.User.findOne({ where: { id: 1 } });
  if (exists) return; // evita duplicar

  await models.User.create(
    {
      username: "rwieruch",
      email: "rwieruch@email.com",
      messages: [
        { text: "Published the Road to learn React" },
        { text: "Published also the Road to learn Express + PostgreSQL" },
      ],
    },
    { include: [models.Message] }
  );

  await models.User.create(
    {
      username: "ddavids",
      email: "ddavids@email.com",
      messages: [
        { text: "Happy to release ..." },
        { text: "Published a complete ..." },
      ],
    },
    { include: [models.Message] }
  );
};

// Sincronizar DB
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado ao banco com sucesso!");

    // Só faz sync e popula localmente
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync(); // não usa force para evitar deletar dados
      await createUsersWithMessages();
    }
  } catch (err) {
    console.error("❌ Erro ao conectar com o banco:", err);
  }
})();

export default serverless(app);

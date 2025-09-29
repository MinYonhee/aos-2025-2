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

// Middleware seguro para serverless
// Injeta apenas os models. Usuário logado será buscado dentro da rota quando necessário.
app.use((req, res, next) => {
  req.context = { models };
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

let isConnected = false;

async function connectDB() {
  if (!isConnected) {
    await sequelize.authenticate();
    isConnected = true;
    console.log("✅ Conectado ao banco com sucesso!");
  }
}

// conecta antes de cada requisição
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Erro ao conectar no banco:", err);
    res.status(500).json({ error: "Erro ao conectar no banco" });
  }
});

// apenas no dev, local
if (process.env.NODE_ENV === "development") {
  (async () => {
    await sequelize.sync();
    await createUsersWithMessages();
  })();
}


export default serverless(app);

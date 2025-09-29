import "dotenv/config";
import cors from "cors";
import express from "express";
import serverless from "serverless-http";

import models, { sequelize } from "./models/index.js";
import routes from "./routes/index.js";

const app = express();
app.set("trust proxy", true);

const corsOptions = {
  // ATENÇÃO: Em produção, o '*' deve ser substituído pelo seu domínio real.
  origin: ["http://example.com", "*"], 
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger simples
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// CORREÇÃO: Middleware otimizado para Serverless (sem autenticação síncrona)
app.use(async (req, res, next) => {
  
  // A primeira query (User.findByPk) forçará a conexão/reconexão 
  // do pool do Sequelize de forma assíncrona, mais resiliente.
  let currentUser = null;
  try {
    currentUser = await models.User.findByPk(1); 
  } catch (e) {
    // Apenas loga o erro de conexão/busca no middleware e continua.
    // O erro real será tratado nas rotas com 500.
    console.error("Aviso: Falha ao buscar usuário no middleware:", e.message);
  }

  req.context = {
    models,
    me: currentUser,
  };
  next();
});

// Rotas
app.use("/", routes.root);
app.use("/session", routes.session);
app.use("/users", routes.user);
app.use("/messages", routes.message);

// Função para popular DB (somente local)
async function createUsersWithMessages() {
  await models.User.create(
    {
      username: "rwieruch",
      email: "rwieruch@email.com",
      messages: [
        { text: "Published the Road to learn React" },
        { text: "Published also the Road to learn Express + PostgreSQL" },
      ],
      // ...
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
      // ...
    },
    { include: [models.Message] }
  );
}

// Apenas local/dev (Mantido para desenvolvimento local)
if (process.env.NODE_ENV !== "production") {
  const eraseDatabaseOnSync = process.env.ERASE_DATABASE === "true";
  sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
    if (eraseDatabaseOnSync) await createUsersWithMessages();

    const port = process.env.PORT ?? 3000;
    app.listen(port, () => console.log(`App rodando na porta ${port}`));
  });
}

// Export para serverless (Vercel)
export default serverless(app);
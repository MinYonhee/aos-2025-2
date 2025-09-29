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

// 🚩 CORREÇÃO CRÍTICA: Middleware Otimizado
// Removemos a busca síncrona do usuário no Cold Start para evitar o timeout.
app.use(async (req, res, next) => {
  
  // A conexão real com o banco (Neon) só será iniciada quando uma ROTA fizer uma consulta.
  req.context = {
    models,
    // me: null é a sugestão mais rápida. 
    // A busca por um usuário autenticado deve ser feita APENAS nas rotas que precisam dele (ex: rota /session ou um middleware JWT).
    me: null, 
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
import "dotenv/config";
import cors from "cors";
import express from "express";
import serverless from "serverless-http";

import models, { sequelize } from "./models/index.js";
import routes from "./routes/index.js";

const app = express();
app.set("trust proxy", true);

const corsOptions = {
  origin: [
    "https://aos-2025-2-lyart.vercel.app", // Domínio Vercel (SEM a barra final '/')
    "http://localhost:3000",                // Mantenha para testes locais
  ], 
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

// Middleware Otimizado (sem busca no Cold Start)
app.use(async (req, res, next) => {
  req.context = {
    models,
    me: null, 
  };
  next();
});

// Rotas
app.use("/", routes.root);
app.use("/session", routes.session);
app.use("/users", routes.user);
app.use("/messages", routes.message);


app.use((req, res, next) => {
    // Escuta o evento 'finish' (quando a resposta é enviada)
    res.on('finish', () => {
        try {
            // Fecha todas as conexões ociosas para que não travem o próximo cold start
            sequelize.connectionManager.close();
        } catch (e) {
            // Apenas um aviso, não deve impedir a resposta
            console.warn("Aviso: Falha ao fechar o pool de conexões.", e);
        }
    });
    next();
});

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

// Apenas local/dev 
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
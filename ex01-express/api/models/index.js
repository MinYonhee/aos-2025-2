import Sequelize from "sequelize";
import pg from "pg";

import getUserModel from "./user.js";
import getMessageModel from "./message.js";

// Configuração da conexão com ajustes de pool para o Neon
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: {
    ssl: {
      require: true,       // Neon exige SSL
      rejectUnauthorized: false,
    },
  },
  dialectModule: pg,
  pool: {
    max: 5,               // no máx. 5 conexões (Neon free permite 10)
    min: 0,
    acquire: 30000,       // espera até 30s para pegar conexão
    idle: 10000,          // fecha conexões ociosas depois de 10s
  },
  logging: false,         // desliga logs SQL (opcional)
});

// Carregando models
const models = {
  User: getUserModel(sequelize, Sequelize),
  Message: getMessageModel(sequelize, Sequelize),
};

// Configurando associações, se existirem
Object.keys(models).forEach((key) => {
  if ("associate" in models[key]) {
    models[key].associate(models);
  }
});

export { sequelize };
export default models;

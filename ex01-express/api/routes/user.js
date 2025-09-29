import { Router } from "express";
import models from "../models/index.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const users = await models.User.findAll({ include: models.Message });
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const user = await models.User.findByPk(req.params.userId, { include: models.Message });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { username, email } = req.body;
    const newUser = await models.User.create({ username, email });
    return res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.put("/:userId", async (req, res) => {
  try {
    const user = await models.User.findByPk(req.params.userId);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    await user.update({
      username: req.body.username ?? user.username,
      email: req.body.email ?? user.email,
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.delete("/:userId", async (req, res) => {
  try {
    const deletedCount = await models.User.destroy({ where: { id: req.params.userId } });
    if (deletedCount === 0) return res.status(404).json({ error: "Usuário não encontrado" });
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;

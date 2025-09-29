import { Router } from "express";
import models from "../models/index.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const messages = await models.Message.findAll({
      where: userId ? { userId } : {},
      include: models.User, 
    });
    return res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await models.Message.findByPk(messageId, {
      include: models.User,
    });

    if (!message) return res.status(404).json({ error: "Mensagem não encontrada" });

    return res.status(200).json(message);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { text, userId } = req.body;
    const user = await models.User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const message = await models.Message.create({ text, userId });
    return res.status(201).json(message);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.put("/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await models.Message.findByPk(messageId);

    if (!message) return res.status(404).json({ error: "Mensagem não encontrada" });

    await message.update({
      text: req.body.text ?? message.text,
    });

    return res.status(200).json(message);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.delete("/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;
    const deletedCount = await models.Message.destroy({ where: { id: messageId } });

    if (deletedCount === 0) return res.status(404).json({ error: "Mensagem não encontrada" });

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;

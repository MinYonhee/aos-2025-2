import { v4 as uuidv4 } from "uuid";
import { Router } from "express";

const router = Router();

// GET all messages
router.get("/", async (req, res) => {
  try {
    const messages = await req.context.models.Message.findAll({
      include: req.context.models.User, // inclui o usuário dono da mensagem
    });
    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET message by id
router.get("/:messageId", async (req, res) => {
  try {
    const message = await req.context.models.Message.findByPk(
      req.params.messageId,
      { include: req.context.models.User }
    );
    if (!message) {
      return res.status(404).json({ error: "Mensagem não encontrada" });
    }
    return res.json(message);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// CREATE message
router.post("/", async (req, res) => {
  try {
    if (!req.context.me) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }
    if (!req.body.text) {
      return res.status(400).json({ error: "Texto da mensagem é obrigatório" });
    }

    const messageData = {
      id: uuidv4(), // UUID da mensagem
      text: req.body.text,
      userId: req.context.me.id, // INTEGER do User
    };

    const message = await req.context.models.Message.create(messageData);

    return res.status(201).json(message);
  } catch (error) {
    console.error("Erro:", error);
    return res.status(500).json({ error: error.message });
  }
});

// DELETE message
router.delete("/:messageId", async (req, res) => {
  try {
    const message = await req.context.models.Message.findByPk(
      req.params.messageId
    );
    if (!message) {
      return res.status(404).json({ error: "Mensagem não encontrada" });
    }

    await message.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

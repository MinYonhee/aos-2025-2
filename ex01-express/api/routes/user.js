import { Router } from "express";
import { Sequelize } from "sequelize";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const users = await req.context.models.User.findAll({
      attributes: ["id", "username", "email"],
      include: [
        {
          model: req.context.models.Message,
          attributes: ["id", "text", "createdAt"],
        },
      ],
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const user = await req.context.models.User.findByPk(req.params.userId, {
      attributes: ["id", "username", "email"],
      include: [
        {
          model: req.context.models.Message,
          attributes: ["id", "text", "createdAt"],
        },
      ],
    });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { username, email } = req.body;
    if (!username || !email) {
      return res.status(400).json({ error: "Username e email são obrigatórios" });
    }
    const user = await req.context.models.User.create({ username, email });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

router.put("/:userId", async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await req.context.models.User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    await user.update({ username, email });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

router.delete("/:userId", async (req, res) => {
  try {
    const user = await req.context.models.User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    await user.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao deletar usuário" });
  }
});

export default router;
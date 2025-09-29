import { Router } from "express";

const router = Router();

// 1. GET ALL USERS (READ - Todos)
// Implementa Paginação e limita mensagens para evitar timeout em ambiente Serverless.
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const safeLimit = Math.min(limit, 50); // Limite máximo seguro para o banco

    const users = await req.context.models.User.findAll({
      attributes: ["id", "username", "email"],
      limit: safeLimit,
      offset: offset,
      order: [['id', 'ASC']],
      include: [
        {
          model: req.context.models.Message,
          attributes: ["id", "text", "createdAt"],
          limit: 1, // Inclui apenas a última mensagem para otimização
          order: [['createdAt', 'DESC']],
        },
      ],
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários (GET /):", error);
    // 500 para erro interno do servidor
    return res.status(500).json({ error: "Erro ao buscar usuários" }); 
  }
});

// 2. GET SINGLE USER (READ - Individual)
// Otimizado para limitar mensagens.
router.get("/:userId", async (req, res) => {
  try {
    const user = await req.context.models.User.findByPk(req.params.userId, {
      attributes: ["id", "username", "email"],
      include: [
        {
          model: req.context.models.Message,
          attributes: ["id", "text", "createdAt"],
          limit: 10, // Exibe as 10 mensagens mais recentes do usuário
          order: [['createdAt', 'DESC']],
        },
      ],
    });
    if (!user) {
      // 404 para recurso não encontrado
      return res.status(404).json({ error: "Usuário não encontrado" }); 
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário por ID:", error);
    // 500 para erro interno do servidor
    return res.status(500).json({ error: "Erro ao buscar usuário" }); 
  }
});

// 3. POST USER (CREATE)
router.post("/", async (req, res) => {
  try {
    const { username, email } = req.body;
    if (!username || !email) {
      return res.status(400).json({ error: "Username e email são obrigatórios" });
    }
    const user = await req.context.models.User.create({ username, email });
    // 201 para criação com sucesso
    return res.status(201).json(user); 
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    // 500 para erro interno do servidor
    return res.status(500).json({ error: "Erro ao criar usuário" }); 
  }
});

// 4. PUT USER (UPDATE)
router.put("/:userId", async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await req.context.models.User.findByPk(req.params.userId);
    if (!user) {
      // 404 para recurso não encontrado
      return res.status(404).json({ error: "Usuário não encontrado" }); 
    }
    // Verifica se há dados para atualização
    if (username === undefined && email === undefined) {
      return res.status(400).json({ error: "Nenhum campo fornecido para atualização" });
    }
    
    await user.update({ username, email });
    return res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    // 500 para erro interno do servidor
    return res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

// 5. DELETE USER (DELETE)
router.delete("/:userId", async (req, res) => {
  try {
    const user = await req.context.models.User.findByPk(req.params.userId);
    if (!user) {
      // 404 para recurso não encontrado
      return res.status(404).json({ error: "Usuário não encontrado" }); 
    }
    await user.destroy();
    // 204 para sucesso sem conteúdo
    return res.status(204).send(); 
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    // 500 para erro interno do servidor
    return res.status(500).json({ error: "Erro ao deletar usuário" });
  }
});

export default router;
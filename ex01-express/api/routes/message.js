import { Router } from "express";

const router = Router();

// 1. GET ALL MESSAGES (READ - Todos)
// OBRIGATÓRIO: Paginação para evitar sobrecarga do DB/Timeout
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const safeLimit = Math.min(limit, 50);

    const messages = await req.context.models.Message.findAll({
      limit: safeLimit,
      offset: offset,
      order: [["createdAt", "DESC"]], // Exibir as mais recentes primeiro
      include: [
        {
          model: req.context.models.User,
          attributes: ["id", "username"],
        },
      ],
    });
    return res.status(200).json(messages);
  } catch (error) {
    console.error("Erro ao buscar mensagens (GET /):", error);
    // 500 para erro interno do servidor
    return res.status(500).json({ error: "Erro ao buscar mensagens" }); 
  }
});

// 2. GET SINGLE MESSAGE (READ - Individual)
router.get("/:messageId", async (req, res) => {
  try {
    const message = await req.context.models.Message.findByPk(
      req.params.messageId,
      {
        include: [
          {
            model: req.context.models.User,
            attributes: ["id", "username"],
          },
        ],
      }
    );
    if (!message) {
      // 404 para recurso não encontrado
      return res.status(404).json({ error: "Mensagem não encontrada" }); 
    }
    return res.status(200).json(message);
  } catch (error) {
    console.error("Erro ao buscar mensagem por ID:", error);
    // 500 para erro interno do servidor
    return res.status(500).json({ error: "Erro ao buscar mensagem" });
  }
});

// 3. POST MESSAGE (CREATE)
router.post("/", async (req, res) => {
  try {
    const { text } = req.body;
    // Usando o usuário logado (me) do middleware, que definimos como User ID 1
    const userId = req.context.me?.id; 

    if (!text) {
      return res.status(400).json({ error: "O campo 'text' é obrigatório" });
    }
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const message = await req.context.models.Message.create({
      text,
      userId,
    });
    // 201 para criação com sucesso
    return res.status(201).json(message); 
  } catch (error) {
    console.error("Erro ao criar mensagem:", error);
    // 500 para erro interno do servidor
    return res.status(500).json({ error: "Erro ao criar mensagem" });
  }
});

// 4. PUT MESSAGE (UPDATE)
router.put("/:messageId", async (req, res) => {
  try {
    const { text } = req.body;
    const message = await req.context.models.Message.findByPk(req.params.messageId);

    if (!message) {
      // 404 para recurso não encontrado
      return res.status(404).json({ error: "Mensagem não encontrada" });
    }
    if (!text) {
      return res.status(400).json({ error: "O campo 'text' é obrigatório para atualização" });
    }

    await message.update({ text });
    return res.status(200).json(message);
  } catch (error) {
    console.error("Erro ao atualizar mensagem:", error);
    // 500 para erro interno do servidor
    return res.status(500).json({ error: "Erro ao atualizar mensagem" });
  }
});

// 5. DELETE MESSAGE (DELETE)
router.delete("/:messageId", async (req, res) => {
  try {
    const result = await req.context.models.Message.destroy({
      where: { id: req.params.messageId },
    });

    if (result === 0) {
      // Verifica se encontrou e deletou (0 = não encontrado)
      return res.status(404).json({ error: "Mensagem não encontrada" });
    }
    
    // 204 para sucesso sem conteúdo
    return res.status(204).send(); 
  } catch (error) {
    console.error("Erro ao deletar mensagem:", error);
    // 500 para erro interno do servidor
    return res.status(500).json({ error: "Erro ao deletar mensagem" });
  }
});

export default router;
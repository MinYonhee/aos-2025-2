import { Router } from "express";
import models from "../models/index.js"; 

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { concluida } = req.query; 
    
    const whereCondition = {};
    if (concluida !== undefined) {
        whereCondition.concluida = concluida === 'true';
    }

    const tarefas = await models.Tarefa.findAll({
      where: whereCondition,
    });
    return res.status(200).json(tarefas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/:objectId", async (req, res) => {
  try {
    const { objectId } = req.params; 
    
    const tarefa = await models.Tarefa.findByPk(objectId);

    if (!tarefa) return res.status(404).json({ error: "Tarefa não encontrada" });

    return res.status(200).json(tarefa);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { descricao, concluida } = req.body;
    
    const tarefa = await models.Tarefa.create({ descricao, concluida });
    
    return res.status(201).json(tarefa);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
            error: error.errors.map(e => e.message).join(', ')
        });
    }
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.put("/:objectId", async (req, res) => {
  try {
    const { objectId } = req.params;
    const tarefa = await models.Tarefa.findByPk(objectId);

    if (!tarefa) return res.status(404).json({ error: "Tarefa não encontrada" });

    await tarefa.update({
      descricao: req.body.descricao ?? tarefa.descricao,
      concluida: req.body.concluida ?? tarefa.concluida,
    });

    return res.status(200).json(tarefa);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.delete("/:objectId", async (req, res) => {
  try {
    const { objectId } = req.params;
    const deletedCount = await models.Tarefa.destroy({ where: { objectId } });

    if (deletedCount === 0) return res.status(404).json({ error: "Tarefa não encontrada" });

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

export default router;
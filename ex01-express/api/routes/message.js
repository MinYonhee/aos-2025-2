import { Router } from "express";
import models from "../models/index.js";

const router = Router();

router.get("/", async (req, res) => {

  let {userId} = req.query

  let messages = await models.Message.findAll({
    where: {
      userId: userId
    }
  })
  return res.status(200).send(messages);
});

router.get("/:messageId", async (req, res) => {
  let id = req.params.messageId

  let message = await models.Message.findOne({
    where: {
      id: id
    }
  })

  if(message == null) return res.status(404).send("Mensagem não encontrada")

  return res.status(200).send(message)
});

router.post("/", async (req, res) => {
  let {userId} = req.query
  
  let message = await models.Message.create({
    text: req.body.text,
    userId: userId,
  })

  return res.status(201).send(message);
});

router.delete("/:messageId",async (req, res) => {
  let id = req.params.messageId

  await models.Message.destroy({
    where: {
      id: id
    }
  })

  return res.status(204).send();
});

router.put("/:messageId",async (req, res) => {
  let id = req.params.messageId
  
  let message = await models.Message.findOne({
    where: {
      id: id
    }
  })

  if(message == null) return res.status(404).send()

  message.set({
    text: req.body.text
  })

  await message.save()

  return res.status(200).send(message)
});

export default router;
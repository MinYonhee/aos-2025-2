import { Router } from "express";
import models from "../models/index.js";

const router = Router();

router.get("/", async (req, res) => {

  let users = await models.User.findAll()
  
  return res.status(200).send(users)
});

router.get("/:userId", async (req, res) => {
  let id = req.params.userId
  let user = await models.User.findOne({
    where: {
      id: id
    }
  })

  if(user == null) return res.status(404).send("Usuário não localizado")

  return res.status(200).send(user)
});

router.post("/", async (req, res) => {
  let data = req.body

  let newUser = await models.User.create(data)

  return res.status(201).send(newUser);
});

router.put("/:userId", async(req, res) => {
  let id = req.params.userId
  
  let user = await models.User.findOne({
    where: {
      id: id
    }
  })

  if(user == null) return res.status(404).send()
  
  let {username, email} = req.body

  user.set({
    username: username ? username : user.username,
    email: email ? email : user.email,
  })

  await user.save()

  return res.status(200).send(user)
});

router.delete("/:userId", async(req, res) => {
  
  let id = req.params.userId

  await models.User.destroy({
    where: {
      id: id
    }
  })

  return res.status(204).send();
});

export default router;
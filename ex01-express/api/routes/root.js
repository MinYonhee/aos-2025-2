import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  return res.status(200).json({ message: "GET recebido com sucesso" });
});

router.post("/", (req, res) => {
  return res.status(201).json({ message: "POST recebido com sucesso" });
});

router.put("/", (req, res) => {
  return res.status(200).json({ message: "PUT recebido com sucesso" });
});

router.delete("/", (req, res) => {
  return res.status(204).send(); 
});

export default router;

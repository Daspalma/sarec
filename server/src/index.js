import "dotenv/config";
import express from "express";
import cors from "cors";
import { transacoesRouter } from "./routes/transacoes.js";
import { authRouter } from "./routes/auth.js";
import { prisma } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/transacoes", transacoesRouter);
app.get("/api/saude", (_req, res) => res.json({ ok: true }));
app.use((erro, _req, res, _next) => {
  console.error(erro);
  res.status(500).json({ mensagem: "Ocorreu um erro no servidor." });
});

const porta = Number(process.env.PORT) || 3000;
const servidor = app.listen(porta, () => console.log(`API pronta em http://localhost:${porta}`));

async function encerrar() {
  servidor.close();
  await prisma.$disconnect();
}
process.on("SIGINT", encerrar);
process.on("SIGTERM", encerrar);

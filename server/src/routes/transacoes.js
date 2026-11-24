import { Router } from "express";
import { prisma } from "../db.js";

export const transacoesRouter = Router();

function obterUsuario(req) {
  const cabecalho = req.headers["x-usuario"];
  if (cabecalho) {
    try {
      return decodeURIComponent(cabecalho);
    } catch {
      return cabecalho;
    }
  }
  return "aluno";
}

function paraTela(transacao) {
  const { valorCentavos, ...dados } = transacao;
  return { ...dados, valor: valorCentavos / 100 };
}

function validarDados({ descricao, valor, tipo }) {
  const erros = [];
  if (typeof descricao !== "string" || descricao.trim().length < 2) {
    erros.push("A descrição deve ter pelo menos 2 caracteres.");
  }
  if (typeof valor !== "number" || !Number.isFinite(valor) || valor <= 0) {
    erros.push("O valor deve ser um número maior que zero.");
  }
  if (!["RECEITA", "DESPESA"].includes(tipo)) {
    erros.push("O tipo deve ser RECEITA ou DESPESA.");
  }
  return erros;
}

transacoesRouter.get("/saldo", async (_req, res, next) => {
  try {
    const ativas = await prisma.transacao.findMany({ where: { excluidoEm: null } });
    const receitasCentavos = ativas
      .filter((item) => item.tipo === "RECEITA")
      .reduce((soma, item) => soma + item.valorCentavos, 0);
    const despesasCentavos = ativas
      .filter((item) => item.tipo === "DESPESA")
      .reduce((soma, item) => soma + item.valorCentavos, 0);
    res.json({
      receitas: receitasCentavos / 100,
      despesas: despesasCentavos / 100,
      saldo: (receitasCentavos - despesasCentavos) / 100,
    });
  } catch (erro) {
    next(erro);
  }
});

transacoesRouter.get("/", async (_req, res, next) => {
  try {
    const transacoes = await prisma.transacao.findMany({
      where: { excluidoEm: null },
      orderBy: { criadoEm: "desc" },
    });
    res.json(transacoes.map(paraTela));
  } catch (erro) {
    next(erro);
  }
});

transacoesRouter.post("/", async (req, res, next) => {
  try {
    const erros = validarDados(req.body);
    if (erros.length) return res.status(400).json({ erros });
    const transacao = await prisma.transacao.create({
      data: {
        descricao: req.body.descricao.trim(),
        valorCentavos: Math.round(req.body.valor * 100),
        tipo: req.body.tipo,
        criadoPor: obterUsuario(req),
        atualizadoPor: obterUsuario(req),
      },
    });
    res.status(201).json(paraTela(transacao));
  } catch (erro) {
    next(erro);
  }
});

transacoesRouter.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ mensagem: "O código da transação é inválido." });
    }
    const erros = validarDados(req.body);
    if (erros.length) return res.status(400).json({ erros });
    const existente = await prisma.transacao.findFirst({ where: { id, excluidoEm: null } });
    if (!existente) return res.status(404).json({ mensagem: "Transação não encontrada." });
    const atualizada = await prisma.transacao.update({
      where: { id },
      data: {
        descricao: req.body.descricao.trim(),
        valorCentavos: Math.round(req.body.valor * 100),
        tipo: req.body.tipo,
        atualizadoPor: obterUsuario(req),
      },
    });
    res.json(paraTela(atualizada));
  } catch (erro) {
    next(erro);
  }
});

transacoesRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ mensagem: "O código da transação é inválido." });
    }
    const existente = await prisma.transacao.findFirst({ where: { id, excluidoEm: null } });
    if (!existente) return res.status(404).json({ mensagem: "Transação não encontrada." });
    await prisma.transacao.update({
      where: { id },
      data: { excluidoEm: new Date(), atualizadoPor: obterUsuario(req) },
    });
    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
});

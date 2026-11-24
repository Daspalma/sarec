import { Router } from "express";

export const authRouter = Router();

const usuariosValidos = [
  { id: 1, nome: "Aluno Tesouraria", email: "aluno@safecash.com", senha: "123" },
  { id: 2, nome: "Administrador", email: "admin@safecash.com", senha: "admin" },
];

authRouter.post("/login", (req, res) => {
  const { email, senha } = req.body || {};
  if (!email || !senha) {
    return res.status(400).json({ mensagem: "Por favor, preencha e-mail e senha." });
  }

  const termo = String(email).trim().toLowerCase();
  const usuario = usuariosValidos.find(
    (u) => (u.email.toLowerCase() === termo || u.nome.toLowerCase() === termo) && u.senha === senha
  );

  if (usuario) {
    return res.json({
      token: "demo-jwt-" + Date.now(),
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    });
  }

  // Permitir login livre com qualquer email/senha com pelo menos 3 dígitos para facilitar testes
  if (String(senha).length >= 3) {
    const nomeFormatado = termo.includes("@") ? termo.split("@")[0] : termo;
    const nomeCapitalizado = nomeFormatado.charAt(0).toUpperCase() + nomeFormatado.slice(1);
    return res.json({
      token: "demo-jwt-" + Date.now(),
      usuario: { id: Date.now(), nome: nomeCapitalizado, email: termo },
    });
  }

  return res.status(401).json({
    mensagem: "Senha inválida (mínimo 3 caracteres). Dica: use aluno@safecash.com e senha 123.",
  });
});

authRouter.get("/demo-contas", (_req, res) => {
  res.json(usuariosValidos.map(({ senha, ...resto }) => resto));
});

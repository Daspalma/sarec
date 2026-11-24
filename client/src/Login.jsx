import React, { useState } from "react";

const API_AUTH = "http://localhost:3000/api/auth";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin(e) {
    if (e) e.preventDefault();
    if (!email || !senha) {
      setErro("Preencha o e-mail e a senha.");
      return;
    }
    setCarregando(true);
    setErro("");

    try {
      const res = await fetch(`${API_AUTH}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.mensagem || "Falha ao autenticar.");
      }

      // Sucesso
      onLogin(data.usuario);
    } catch (err) {
      setErro(err.message || "Erro de conexão com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  function preencherDemo(userEmail, userSenha) {
    setEmail(userEmail);
    setSenha(userSenha);
    setErro("");
  }

  return (
    <div className="login-tela">
      <div className="login-card">
        <div className="login-marca">
          <span className="icone">S</span>
          <div>
            <strong>SafeCash</strong>
            <small>CONTROLE FINANCEIRO</small>
          </div>
        </div>

        <div className="login-intro">
          <h2>Acesse sua conta</h2>
          <p>Informe suas credenciais para visualizar e lançar movimentações financeiras.</p>
        </div>

        {erro && <div className="alerta-erro">{erro}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <label className="campo">
            E-mail ou Usuário
            <input
              type="text"
              required
              autoFocus
              placeholder="ex: aluno@safecash.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="campo">
            Senha
            <input
              type="password"
              required
              placeholder="••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </label>

          <button
            type="submit"
            className="botao-primario botao-login"
            disabled={carregando}
          >
            {carregando ? "Entrando..." : "Entrar no Sistema"}
          </button>
        </form>

        <div className="login-demo-box">
          <span className="demo-titulo">Contas de teste para demonstração:</span>
          <div className="demo-botoes">
            <button
              type="button"
              className="demo-chip"
              onClick={() => preencherDemo("aluno@safecash.com", "123")}
            >
              👤 Aluno (senha: 123)
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => preencherDemo("admin@safecash.com", "admin")}
            >
              ⭐ Admin (senha: admin)
            </button>
          </div>
        </div>

        <div className="login-rodape">
          SafeCash · Gestão Simples de Tesouraria
        </div>
      </div>
    </div>
  );
}

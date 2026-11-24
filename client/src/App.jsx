import React, { useCallback, useEffect, useState } from "react";
import Login from "./Login.jsx";
import { excluirTransacao, listarTransacoes, obterSaldo, salvarTransacao } from "./api.js";
const dinheiro = (valor) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

export default function App() {
  const [usuario, setUsuario] = useState(() => {
    try {
      const salvo = localStorage.getItem("safecash_usuario");
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  });

  const [transacoes, setTransacoes] = useState([]);
  const [saldo, setSaldo] = useState({ receitas: 0, despesas: 0, saldo: 0 });
  const [form, setForm] = useState({ descricao: "", valor: "", tipo: "DESPESA" });
  const [editando, setEditando] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);

  function handleLogin(novoUsuario) {
    setUsuario(novoUsuario);
    localStorage.setItem("safecash_usuario", JSON.stringify(novoUsuario));
  }

  function handleLogout() {
    localStorage.removeItem("safecash_usuario");
    setUsuario(null);
    setEditando(null);
    setMensagem("");
  }

  const carregar = useCallback(async () => {
    try {
      const [lista, resumo] = await Promise.all([listarTransacoes(), obterSaldo()]);
      setTransacoes(lista);
      setSaldo(resumo);
      setMensagem("");
    } catch {
      setMensagem("Não consegui acessar a API. Confira se o servidor está ligado.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (usuario) {
      carregar();
    }
  }, [usuario, carregar]);

  async function salvar(evento) {
    evento.preventDefault();
    const dados = { ...form, valor: Number(form.valor) };
    try {
      await salvarTransacao(editando, dados, usuario?.nome || "aluno");
      setForm({ descricao: "", valor: "", tipo: "DESPESA" });
      setEditando(null);
      setMensagem("Lançamento salvo.");
      await carregar();
    } catch (erro) {
      setMensagem(erro.message);
    }
  }

  function iniciarEdicao(item) {
    setEditando(item.id);
    setForm({ descricao: item.descricao, valor: String(item.valor), tipo: item.tipo });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function excluir(id) {
    if (!window.confirm("Marcar este lançamento como excluído? Ele continuará salvo para auditoria.")) return;
    try {
      await excluirTransacao(id, usuario?.nome || "aluno");
      setMensagem("Lançamento marcado como excluído.");
      await carregar();
    } catch (erro) {
      setMensagem(erro.message);
    }
  }

  function cancelarEdicao() {
    setEditando(null);
    setForm({ descricao: "", valor: "", tipo: "DESPESA" });
  }

  // Se não estiver logado, exibe a tela de Login
  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <main className="container">
      <header className="topo">
        <div className="marca">
          <span className="icone">S</span>
          <div>
            <strong>SafeCash</strong>
            <small>CONTROLE FINANCEIRO</small>
          </div>
        </div>

        <div className="topo-direita">
          <span className="status">
            <i /> Sistema ativo
          </span>
          <div className="usuario-barra">
            <div className="usuario-avatar">
              {(usuario.nome || "U").charAt(0).toUpperCase()}
            </div>
            <div className="usuario-detalhes">
              <strong>{usuario.nome}</strong>
              <small>{usuario.email || "Usuário logado"}</small>
            </div>
            <button
              type="button"
              className="botao-sair"
              title="Encerrar sessão"
              onClick={handleLogout}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <section className="boas-vindas">
        <p className="sobrelinha">PAINEL DO USUÁRIO</p>
        <h1>
          Olá, <span>{usuario.nome.split(" ")[0]}!</span>
        </h1>
        <p>Acompanhe e registre as entradas e saídas financeiras da empresa.</p>
      </section>

      <section className="cartoes" aria-label="Resumo financeiro">
        <article className="cartao principal">
          <span>Saldo atual</span>
          <strong>{dinheiro(saldo.saldo)}</strong>
          <small>Considera os lançamentos ativos</small>
        </article>
        <article className="cartao">
          <span>Receitas</span>
          <strong className="positivo">{dinheiro(saldo.receitas)}</strong>
          <small>Entradas registradas</small>
        </article>
        <article className="cartao">
          <span>Despesas</span>
          <strong className="negativo">{dinheiro(saldo.despesas)}</strong>
          <small>Saídas registradas</small>
        </article>
      </section>

      <section className="painel">
        <div className="titulo-painel">
          <div>
            <p className="sobrelinha">MOVIMENTAÇÕES</p>
            <h2>{editando ? "Editar lançamento" : "Novo lançamento"}</h2>
          </div>
        </div>
        <form className="formulario" onSubmit={salvar}>
          <label className="campo descricao">
            Descrição
            <input
              required
              minLength="2"
              maxLength="120"
              placeholder="Ex.: Pagamento de aluguel"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </label>
          <label className="campo">
            Valor (R$)
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0,00"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
            />
          </label>
          <label className="campo">
            Tipo
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              <option value="DESPESA">Despesa</option>
              <option value="RECEITA">Receita</option>
            </select>
          </label>
          <div className="botoes">
            <button className="botao-primario" type="submit">
              {editando ? "Salvar edição" : "Adicionar"}
            </button>
            {editando && (
              <button
                className="botao-secundario"
                type="button"
                onClick={cancelarEdicao}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
        {mensagem && (
          <p className="mensagem" role="status">
            {mensagem}
          </p>
        )}
      </section>

      <section className="painel tabela-painel">
        <div className="titulo-painel">
          <div>
            <p className="sobrelinha">HISTÓRICO</p>
            <h2>Últimos lançamentos</h2>
          </div>
          <span className="contador">{transacoes.length} itens</span>
        </div>
        {carregando ? (
          <p className="vazio">Carregando lançamentos...</p>
        ) : transacoes.length === 0 ? (
          <p className="vazio">
            Ainda não há lançamentos. Cadastre o primeiro acima.
          </p>
        ) : (
          <div className="rolagem">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Data</th>
                  <th>Responsável</th>
                  <th className="alinha-direita">Valor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {transacoes.map((item) => (
                  <tr key={item.id}>
                    <td className="nome-transacao">{item.descricao}</td>
                    <td>
                      <span className={`etiqueta ${item.tipo.toLowerCase()}`}>
                        {item.tipo === "RECEITA" ? "Receita" : "Despesa"}
                      </span>
                    </td>
                    <td>
                      {new Date(item.criadoEm).toLocaleDateString("pt-BR")}
                    </td>
                    <td>
                      <span className="etiqueta-autor">
                        {item.criadoPor || "aluno"}
                      </span>
                    </td>
                    <td
                      className={`alinha-direita valor-linha ${
                        item.tipo === "RECEITA" ? "positivo" : "negativo"
                      }`}
                    >
                      {item.tipo === "RECEITA" ? "+" : "−"}{" "}
                      {dinheiro(item.valor)}
                    </td>
                    <td>
                      <div className="acoes">
                        <button
                          type="button"
                          onClick={() => iniciarEdicao(item)}
                        >
                          Editar
                        </button>
                        <button
                          className="excluir"
                          type="button"
                          onClick={() => excluir(item.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <footer>
        SafeCash <span>·</span> Projeto didático de gestão financeira
      </footer>
    </main>
  );
}

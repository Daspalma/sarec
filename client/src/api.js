const API_BASE = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000" : "")).replace(/\/+$/, "");
const STORAGE_KEY = "safecash_demo_transacoes";

function readLocal() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeLocal(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const result = response.status === 204 ? {} : await response.json();
  if (!response.ok) {
    throw new Error(result.erros?.join(" ") || result.mensagem || "Não foi possível concluir a solicitação.");
  }
  return result;
}

export async function autenticar(email, senha) {
  if (API_BASE) {
    return request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
  }

  const termo = String(email || "").trim().toLowerCase();
  if (!termo || !senha) throw new Error("Preencha o e-mail e a senha.");
  if (String(senha).length < 3) throw new Error("A senha precisa ter pelo menos 3 caracteres.");

  const contas = {
    "aluno@safecash.com": { id: 1, nome: "Aluno Tesouraria", email: "aluno@safecash.com" },
    "admin@safecash.com": { id: 2, nome: "Administrador", email: "admin@safecash.com" },
    "aluno tesouraria": { id: 1, nome: "Aluno Tesouraria", email: "aluno@safecash.com" },
    administrador: { id: 2, nome: "Administrador", email: "admin@safecash.com" },
  };
  const prefixo = termo.includes("@") ? termo.split("@")[0] : termo;
  const nome = prefixo.charAt(0).toUpperCase() + prefixo.slice(1);
  return { usuario: contas[termo] || { id: Date.now(), nome, email: termo } };
}

export async function listarTransacoes() {
  if (API_BASE) return request("/api/transacoes");
  return readLocal()
    .filter((item) => !item.excluidoEm)
    .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
}

export async function obterSaldo() {
  if (API_BASE) return request("/api/transacoes/saldo");
  const ativos = readLocal().filter((item) => !item.excluidoEm);
  const receitas = ativos.filter((item) => item.tipo === "RECEITA").reduce((total, item) => total + item.valor, 0);
  const despesas = ativos.filter((item) => item.tipo === "DESPESA").reduce((total, item) => total + item.valor, 0);
  return { receitas, despesas, saldo: receitas - despesas };
}

export async function salvarTransacao(id, dados, usuario) {
  if (API_BASE) {
    return request(`/api/transacoes${id ? `/${id}` : ""}`, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", "x-usuario": encodeURIComponent(usuario || "aluno") },
      body: JSON.stringify(dados),
    });
  }

  const items = readLocal();
  const agora = new Date().toISOString();
  if (id) {
    const index = items.findIndex((item) => item.id === id && !item.excluidoEm);
    if (index < 0) throw new Error("Transação não encontrada.");
    items[index] = { ...items[index], ...dados, atualizadoPor: usuario || "aluno", atualizadoEm: agora };
    writeLocal(items);
    return items[index];
  }

  const item = {
    id: Date.now(),
    ...dados,
    criadoPor: usuario || "aluno",
    atualizadoPor: usuario || "aluno",
    criadoEm: agora,
    atualizadoEm: agora,
    excluidoEm: null,
  };
  writeLocal([...items, item]);
  return item;
}

export async function excluirTransacao(id, usuario) {
  if (API_BASE) {
    return request(`/api/transacoes/${id}`, {
      method: "DELETE",
      headers: { "x-usuario": encodeURIComponent(usuario || "aluno") },
    });
  }

  const items = readLocal();
  const index = items.findIndex((item) => item.id === id && !item.excluidoEm);
  if (index < 0) throw new Error("Transação não encontrada.");
  const agora = new Date().toISOString();
  items[index] = { ...items[index], excluidoEm: agora, atualizadoPor: usuario || "aluno", atualizadoEm: agora };
  writeLocal(items);
}

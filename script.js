// --- Toast ---
function showToast(msg, tipo = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center text-bg-${tipo} border-0`;
  toastEl.setAttribute("role", "alert");
  toastEl.setAttribute("aria-live", "assertive");
  toastEl.setAttribute("aria-atomic", "true");
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${msg}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
  container.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

// --- Variáveis globais ---
let despesas = [];
let receitas = [];

// 🔹 Pega automaticamente o ID do usuário logado
const usuarioId = localStorage.getItem("usuarioId");

// Se não tiver usuário logado, redireciona pro login
if (!usuarioId) {
  window.location.href = "login.html";
}

// --- CRUD com API ---
async function carregarDashboard() {
  try {
    // 🔹 Carrega despesas
    const resDespesas = await fetch(`http://localhost:8080/usuarios/${usuarioId}/despesas`, {
      credentials: 'include'
    });
    if (!resDespesas.ok) throw new Error("Erro ao buscar despesas");
    despesas = await resDespesas.json();
    atualizarTabela("tabelaDespesas", despesas);

    // 🔹 Carrega receitas
    const resReceitas = await fetch(`http://localhost:8080/usuarios/${usuarioId}/receitas`, {
      credentials: 'include'
    });
    if (!resReceitas.ok) throw new Error("Erro ao buscar receitas");
    receitas = await resReceitas.json();
    atualizarTabela("tabelaReceitas", receitas);

  } catch (e) {
    console.error(e);
    showToast("Erro ao carregar dados", "danger");
  }
}

// --- Criar Despesa ---
async function criarDespesa() {
  const descricao = document.getElementById("descricao").value;
  const valor = parseFloat(document.getElementById("valor").value);

  try {
    const res = await fetch(`http://localhost:8080/usuarios/${usuarioId}/despesas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ descricao, valor, data: new Date().toISOString() })
    });

    if (res.ok) {
      document.getElementById("formDespesa").reset();
      bootstrap.Modal.getInstance(document.getElementById("modalDespesa")).hide();
      await carregarDashboard();
      showToast("Despesa adicionada!");
    } else {
      showToast("Erro ao adicionar despesa", "danger");
    }
  } catch (e) {
    console.error(e);
    showToast("Erro ao adicionar despesa", "danger");
  }
}

// --- Criar Receita ---
async function criarReceita() {
  const descricao = document.getElementById("descricaoReceita").value;
  const valor = parseFloat(document.getElementById("valorReceita").value);

  try {
    const res = await fetch(`http://localhost:8080/usuarios/${usuarioId}/receitas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ descricao, valor, data: new Date().toISOString() })
    });

    if (res.ok) {
      document.getElementById("formReceita").reset();
      bootstrap.Modal.getInstance(document.getElementById("modalReceita")).hide();
      await carregarDashboard();
      showToast("Receita adicionada!");
    } else {
      showToast("Erro ao adicionar receita", "danger");
    }
  } catch (e) {
    console.error(e);
    showToast("Erro ao adicionar receita", "danger");
  }
}

// --- Remover Item ---
async function removerItem(tabelaId, id) {
  const tipo = tabelaId === "tabelaDespesas" ? "despesas" : "receitas";
  const url = `http://localhost:8080/usuarios/${usuarioId}/${tipo}/${id}`;

  try {
    const res = await fetch(url, { method: "DELETE", credentials: 'include' });
    if (res.ok) {
      await carregarDashboard();
      showToast("Item removido!", "danger");
    } else {
      showToast("Erro ao remover item", "danger");
    }
  } catch (e) {
    console.error(e);
    showToast("Erro ao remover item", "danger");
  }
}

// --- Atualizar Tabela ---
function atualizarTabela(tabelaId, dados) {
  const tbody = document.getElementById(tabelaId).querySelector("tbody");
  tbody.innerHTML = "";
  dados.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.id}</td>
      <td>${item.descricao}</td>
      <td>${item.valor.toFixed(2)}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="removerItem('${tabelaId}', ${item.id})">
          Excluir
        </button>
      </td>`;
    tbody.appendChild(tr);
  });
}

// --- Inicialização ---
document.addEventListener("DOMContentLoaded", () => {
  carregarDashboard();
});

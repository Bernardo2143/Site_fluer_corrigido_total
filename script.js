document.addEventListener('DOMContentLoaded', () => {
  aplicarTema(estado.tema);
  atualizarNavbar();
  atualizarBadgeCarrinho();

  const path = window.location.pathname;

  if (path.includes('index.html') || path.endsWith('/')) {
    renderizarProdutosQueridinhos();
  } else if (path.includes('produtos.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get('categoria') || 'todos';
    filterByCategory(cat);
  } else if (path.includes('carrinho.html')) {
    renderizarCarrinho();
  } else if (path.includes('pedidos.html')) {
    renderizarPedidos();
  } else if (path.includes('perfil.html')) {
    carregarDadosPerfil();
  }
});

let estado = {
  usuario: JSON.parse(localStorage.getItem('fleur_usuario')) || null,
  pedidos: JSON.parse(localStorage.getItem('fleur_pedidos')) || [
    {
      id: '#FS-8921',
      data: '22/10/2026',
      status: 'Entregue',
      total: 82.00,
      itens: '1x Coffret Macarons Royaux, 1x Croissant Pur Beurre'
    }
  ],
  tema: localStorage.getItem('fleur_tema') || 'light'
};



function toggleDarkMode() {
  estado.tema = estado.tema === 'light' ? 'dark' : 'light';
  localStorage.setItem('fleur_tema', estado.tema);
  aplicarTema(estado.tema);
}

function aplicarTema(tema) {
  if (tema === 'dark') {
    document.body.classList.add('dark');
    const minhaImagem = document.querySelector('.moonsun');
    minhaImagem.setAttribute('src', '/sun.png');
    const carrinho = document.querySelector('.carrinhoimg');
    carrinho.setAttribute('src', '/carrinhoBranco.png');
  } else {
    document.body.classList.remove('dark');
    const minhaImagem = document.querySelector('.moonsun');
    minhaImagem.setAttribute('src', '/moon.png');
    const carrinho = document.querySelector('.carrinhoimg');
    carrinho.setAttribute('src', '/vista-lateral-vazia-do-carrinho-de-compras.png');
  }
}

function criarCardProdutoHTML(prod) {
  return `
    <div class="product-card">
      <span class="icon">${prod.icone}</span>
      <h3>${prod.nome}</h3>
      <p>${prod.descricao}</p>
      <div class="product-card-footer">
        <span class="product-price">R$ ${prod.preco.toFixed(2).replace('.', ',')}</span>
      </div>
    </div>
  `;
}

function renderizarProdutosQueridinhos() {
  const container = document.getElementById('featuredProductsGrid');
  if (!container) return;
  const queridinhos = DB_PRODUTOS.slice(0, 4);
  container.innerHTML = queridinhos.map(criarCardProdutoHTML).join('');
}

function filterByCategory(categoria) {
  const container = document.getElementById('productsGrid');
  if (!container) return;

  const filtrados = categoria === 'todos' 
    ? DB_PRODUTOS 
    : DB_PRODUTOS.filter(p => p.categoria === categoria);

  if (filtrados.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Nenhum produto encontrado nesta categoria.</p>`;
    return;
  }
  container.innerHTML = filtrados.map(criarCardProdutoHTML).join('');
}

function renderizarPedidos() {
  const container = document.getElementById('ordersList');
  if (!container) return;
  
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

  if (pedidos.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: var(--text-muted);">Você ainda não realizou nenhum pedido.</p>`;
    return;
  }

  container.innerHTML = pedidos.map(p => `
    <div class="order-card">
      <div class="order-header">
        <span class="order-id">${p.id}</span>
        <span class="order-status">${p.status}</span>
      </div>
      <p class="order-items"><strong>Produtos:</strong> ${p.itens}</p>
      <div class="order-footer">
        <span class="order-date">Data: ${p.data}</span>
        <span class="order-total">R$ ${p.total.toFixed(2).replace('.', ',')}</span>
      </div>
    </div>
  `).join('');
}

function aplicarMascaraCPF(input) {
  let valor = input.value.replace(/\D/g, "").slice(0, 11);
  
  valor = valor
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    
  input.value = valor;
}

function aplicarMascaraTelefone(input) {
  let valor = input.value.replace(/\D/g, "").slice(0, 11);

  if (valor.length <= 10) {
    
    valor = valor
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  } else {
    
    valor = valor
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
  }

  input.value = valor;
}

function handleCadastroSubmit(event) {
  event.preventDefault();
  const senha = document.getElementById('cadSenha').value;
  const confSenha = document.getElementById('cadSenhaConf').value;
  if (senha !== confSenha) {
    exibirToast("As senhas não coincidem!");
    return;
  }
  const novoUsuario = {
    nome: document.getElementById('cadNome').value,
    email: document.getElementById('cadEmail').value,
    cpf: document.getElementById('cadCPF').value,
    telefone: document.getElementById('cadTelefone').value
  };
  estado.usuario = novoUsuario;
  localStorage.setItem('fleur_usuario', JSON.stringify(novoUsuario));
  exibirToast("Conta criada com sucesso!");
  setTimeout(() => { window.location.href = 'perfil.html'; }, 1000);
}

function openLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('hidden');
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.add('hidden');
}

function handleLoginSubmit(event) {
  event.preventDefault();
  estado.usuario = { nome: "Cliente Fleur de Sucre", email: "cliente@fleurdesucre.com", cpf: "123.456.789-00", telefone: "(11) 98765-4321" };
  localStorage.setItem('fleur_usuario', JSON.stringify(estado.usuario));
  closeLoginModal();
  atualizarNavbar();
  exibirToast("Login realizado com sucesso!");
}

function atualizarNavbar() {
  const authBtns = document.getElementById('authNavButtons');
  const userProfile = document.getElementById('userNavProfile');
  if (!authBtns || !userProfile) return;
  if (estado.usuario) {
    authBtns.classList.add('hidden');
    userProfile.classList.remove('hidden');
  } else {
    authBtns.classList.remove('hidden');
    userProfile.classList.add('hidden');
  }
}

function carregarDadosPerfil() {
  if (!estado.usuario) return;
  const nome = document.getElementById('profileName');
  const titleName = document.getElementById('profileTitleName');
  const email = document.getElementById('profileEmail');
  const cpf = document.getElementById('profileCPF');
  const phone = document.getElementById('profilePhone');
  if (nome) nome.textContent = estado.usuario.nome;
  if (titleName) titleName.textContent = estado.usuario.nome;
  if (email) email.textContent = estado.usuario.email;
  if (cpf) cpf.textContent = estado.usuario.cpf;
  if (phone) phone.textContent = estado.usuario.telefone;
}

const normalize = (text) => text ? text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';

function handleHeaderSearch(event) {
  const input = document.getElementById('headerSearchInput');
  if (!input) return;
  const termo = input.value.trim();
  const estaNaPaginaProdutos = window.location.pathname.includes('produtos.html');
  if (estaNaPaginaProdutos) {
    const cards = document.querySelectorAll('.product-card');
    const noResults = document.getElementById('noResults');
    const termoNormalizado = normalize(termo);
    let visivel = 0;
    cards.forEach((card) => {
      const name = normalize(card.dataset.name || card.textContent);
      const match = name.includes(termoNormalizado);
      card.style.display = match ? '' : 'none';
      if (match) visivel++;
    });
    if (noResults) noResults.style.display = visivel === 0 ? 'block' : 'none';
  } else {
    if (event.key === 'Enter' && termo) {
      window.location.href = `produtos.html?busca=${encodeURIComponent(termo)}`;
    }
  }
}

function exibirToast(mensagem) {
  const toast = document.getElementById('toast');
  const msgElement = document.getElementById('toastMessage');
  if (!toast || !msgElement) return;
  msgElement.textContent = mensagem;
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

function adicionarAoCarrinho(nome, preco) {
  let carrinho = JSON.parse(localStorage.getItem('fleur_carrinho')) || [];

  const itemExistente = carrinho.find(item => item.nome === nome);
  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({ nome: nome, preco: preco, quantidade: 1 });
  }

  localStorage.setItem('fleur_carrinho', JSON.stringify(carrinho));
  window.location.href = 'carrinho.html';
}

function atualizarBadgeCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem('fleur_carrinho')) || [];
  const totalItens = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
  const badge = document.querySelector('.cart-icon .badge');
  if (badge) {
    badge.textContent = totalItens;
  }
}

function renderizarCarrinho() {
  const container = document.querySelector('.cart-container');
  if (!container) return;

  const carrinho = JSON.parse(localStorage.getItem('fleur_carrinho')) || [];

  if (carrinho.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: var(--text-muted);">Seu carrinho está vazio.</p>`;
    return;
  }

  let totalGeral = 0;
  const itensHTML = carrinho.map((item, index) => {
    const subtotal = item.preco * item.quantidade;
    totalGeral += subtotal;
    return `
      <div class="cart-item">
        <div>
          <strong>${item.nome}</strong>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Quantidade: ${item.quantidade}x R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
        </div>
        <div style="display: flex; align-items: center; gap: 15px;">
          <strong>R$ ${subtotal.toFixed(2).replace('.', ',')}</strong>
          <button onclick="removerDoCarrinho(${index})" style="background: none; color: #EF4444; cursor: pointer; font-weight: bold;">Remover</button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    ${itensHTML}
    <div class="cart-summary">
      <div class="summary-row total">
        <span>Total:</span>
        <span>R$ ${totalGeral.toFixed(2).replace('.', ',')}</span>
      </div>
      <button class="btn btn-primary btn-full" style="margin-top: 15px;" onclick="exibirToast('Pedido finalizado com sucesso!')">
        Finalizar Pedido
      </button>
    </div>
  `;

}
function finalizarPedido() {
  const carrinho = JSON.parse(localStorage.getItem('fleur_carrinho')) || [];
  if (carrinho.length === 0) return;

  const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
  
  const total = carrinho.reduce((soma, item) => soma + (item.preco * item.quantidade), 0);
  const resumoItens = carrinho.map(item => `${item.quantidade}x ${item.nome}`).join(', ');
  const numeroPedido = Math.floor(1000 + Math.random() * 9000);
  const dataHoje = new Date().toLocaleDateString('pt-BR');

  const novoPedido = {
    id: `Pedido #${numeroPedido}`,
    status: 'Preparando',
    itens: resumoItens,
    data: dataHoje,
    total: total
  };

  pedidos.unshift(novoPedido);
  localStorage.setItem('pedidos', JSON.stringify(pedidos));
  localStorage.removeItem('fleur_carrinho');

  exibirToast('Pedido finalizado com sucesso!');
  setTimeout(() => {
    window.location.href = 'pedidos.html';
  }, 1000);
}

function removerDoCarrinho(index) {
  let carrinho = JSON.parse(localStorage.getItem('fleur_carrinho')) || [];
  carrinho.splice(index, 1);
  localStorage.setItem('fleur_carrinho', JSON.stringify(carrinho));
  renderizarCarrinho();
  atualizarBadgeCarrinho();
}
// Redireciona ao clicar nas imagens de "Os Queridinhos da Casa"
const imagensQueridinhos = document.querySelectorAll('.queridosCasa');
imagensQueridinhos.forEach(img => {
  img.addEventListener('click', () => {
    window.location.href = 'produtos.html';
  });
});
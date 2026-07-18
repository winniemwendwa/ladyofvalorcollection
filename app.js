const PRODUCTS = window.PRODUCTS || [];
const PHONE = '254117652692';
const MPESA_DISPLAY = '0117 652 692';
const MPESA_COPY = '0117652692';
let active = 'All';
let query = '';
let cart = JSON.parse(localStorage.getItem('lov-cart') || '{}');

const $ = (selector) => document.querySelector(selector);
const grid = $('#grid');
const filters = $('#filters');
const money = (amount) => amount == null ? 'Price on request' : `KSh ${Number(amount).toLocaleString()}`;

function categories() {
  return ['All', ...new Set(PRODUCTS.map((product) => product.category))];
}

function renderFilters() {
  filters.innerHTML = categories()
    .map((category) => `<button class="${category === active ? 'active' : ''}" data-cat="${category}">${category}</button>`)
    .join('');

  filters.querySelectorAll('button').forEach((button) => {
    button.onclick = () => {
      active = button.dataset.cat;
      renderFilters();
      renderProducts();
    };
  });
}

function productImage(product) {
  if (product.image) {
    return `<img loading="lazy" src="assets/products/${product.image}" alt="${product.name}" onerror="this.parentElement.innerHTML='<div class=&quot;placeholder&quot;>LV</div>'">`;
  }
  return '<div class="placeholder">Photo coming soon</div>';
}

function renderProducts() {
  const list = PRODUCTS.filter((product) => {
    const matchesCategory = active === 'All' || product.category === active;
    const haystack = `${product.name} ${product.category} ${product.tag} ${product.size}`.toLowerCase();
    return matchesCategory && haystack.includes(query);
  });

  grid.innerHTML = list.map((product) => `
    <article class="card">
      <div class="productImg">
        ${productImage(product)}
        <span class="badge">${product.tag}</span>
      </div>
      <div class="cardBody">
        <div class="meta">${product.category} • ${product.size}</div>
        <h3>${product.name}</h3>
        <div class="price">${money(product.price)}</div>
        <div class="stock">${product.price == null ? 'Ask for sizes, colours and price' : `${product.stock || 0} available`}</div>
        <div class="cardActions">
          ${product.price == null
            ? `<a class="ask" target="_blank" rel="noopener" href="https://wa.me/${PHONE}?text=${encodeURIComponent(`Hello Lady of Valor, please share available options and prices for ${product.name}.`)}">Enquire on WhatsApp</a>`
            : `<button class="add" data-add="${product.id}">Add to bag</button>
               <a class="ask" target="_blank" rel="noopener" href="https://wa.me/${PHONE}?text=${encodeURIComponent(`Hello Lady of Valor, I am interested in ${product.name}.`)}">Ask on WhatsApp</a>`}
        </div>
      </div>
    </article>
  `).join('') || '<p class="empty">No products match your search.</p>';

  grid.querySelectorAll('[data-add]').forEach((button) => {
    button.onclick = () => add(Number(button.dataset.add));
  });
}

function add(id) {
  cart[id] = (cart[id] || 0) + 1;
  save();
  openCart();
}

function save() {
  localStorage.setItem('lov-cart', JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const entries = Object.entries(cart).filter(([, quantity]) => quantity > 0);
  $('#cartCount').textContent = entries.reduce((sum, [, quantity]) => sum + quantity, 0);

  if (!entries.length) {
    $('#cartItems').innerHTML = '<div class="empty">Your bag is empty.</div>';
    $('#total').textContent = 'KSh 0';
    return;
  }

  let total = 0;
  $('#cartItems').innerHTML = entries.map(([id, quantity]) => {
    const product = PRODUCTS.find((item) => item.id == id);
    if (!product || product.price == null) return '';
    total += product.price * quantity;
    return `
      <div class="cartItem">
        ${product.image ? `<img src="assets/products/${product.image}" alt="${product.name}">` : '<div class="placeholder">LV</div>'}
        <div>
          <h4>${product.name}</h4>
          <small>${money(product.price)}</small>
          <div class="qty">
            <button data-minus="${id}">−</button>
            <span>${quantity}</span>
            <button data-plus="${id}">+</button>
          </div>
        </div>
        <b>${money(product.price * quantity)}</b>
      </div>`;
  }).join('');

  $('#total').textContent = money(total);
  document.querySelectorAll('[data-minus]').forEach((button) => {
    button.onclick = () => {
      cart[button.dataset.minus]--;
      if (cart[button.dataset.minus] <= 0) delete cart[button.dataset.minus];
      save();
    };
  });
  document.querySelectorAll('[data-plus]').forEach((button) => {
    button.onclick = () => {
      cart[button.dataset.plus]++;
      save();
    };
  });
}

function openCart() {
  $('#cart').classList.add('open');
  $('#overlay').classList.add('open');
}

function closeCart() {
  $('#cart').classList.remove('open');
  $('#overlay').classList.remove('open');
}

$('#search').oninput = (event) => {
  query = event.target.value.toLowerCase().trim();
  renderProducts();
};
$('#cartBtn').onclick = openCart;
$('#closeCart').onclick = closeCart;
$('#overlay').onclick = closeCart;
$('#menuBtn').onclick = () => $('#nav').classList.toggle('open');


$('#copyMpesa').onclick = async () => {
  try {
    await navigator.clipboard.writeText(MPESA_COPY);
    $('#copyMpesa').textContent = 'Copied!';
    setTimeout(() => { $('#copyMpesa').textContent = 'Copy number'; }, 1800);
  } catch (error) {
    window.prompt('Copy this M-Pesa number:', MPESA_COPY);
  }
};

$('#checkout').onclick = () => {
  const entries = Object.entries(cart).filter(([, quantity]) => quantity > 0);
  if (!entries.length) {
    alert('Your shopping bag is empty.');
    return;
  }

  let total = 0;
  const lines = entries.map(([id, quantity]) => {
    const product = PRODUCTS.find((item) => item.id == id);
    if (!product || product.price == null) return null;
    total += product.price * quantity;
    return `• ${product.name} x${quantity} — ${money(product.price * quantity)}`;
  }).filter(Boolean);

  const text = `Hello Lady of Valor Collection, I would like to order:\n\n${lines.join('\n')}\n\nTotal: ${money(total)}\n\nM-Pesa payment number: ${MPESA_DISPLAY}\nPlease confirm availability and delivery charges before I pay.\n\nMy name is: `;
  window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`, '_blank');
};

$('#year').textContent = new Date().getFullYear();
renderFilters();
renderProducts();
renderCart();

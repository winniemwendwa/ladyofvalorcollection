
const PRODUCTS=window.PRODUCTS||[];const PHONE='254117652692';
let active='All',query='',cart=JSON.parse(localStorage.getItem('lov-cart')||'{}');
const $=s=>document.querySelector(s),grid=$('#grid'),filters=$('#filters');
const money=n=>n==null?'Price on request':'KSh '+Number(n).toLocaleString();
function categories(){return ['All',...new Set(PRODUCTS.map(p=>p.category))]}
function renderFilters(){filters.innerHTML=categories().map(c=>`<button class="${c===active?'active':''}" data-cat="${c}">${c}</button>`).join('');filters.querySelectorAll('button').forEach(b=>b.onclick=()=>{active=b.dataset.cat;renderFilters();renderProducts()})}
function renderProducts(){const list=PRODUCTS.filter(p=>(active==='All'||p.category===active)&&(`${p.name} ${p.category} ${p.tag}`.toLowerCase().includes(query)));grid.innerHTML=list.map(p=>`<article class="card"><div class="productImg">${p.image?`<img loading="lazy" src="assets/products/${p.image}" alt="${p.name}">`:`<div class="placeholder">LV</div>`}<span class="badge">${p.tag}</span></div><div class="cardBody"><div class="meta">${p.category} • ${p.size}</div><h3>${p.name}</h3><div class="price">${money(p.price)}</div><div class="stock">${p.price==null?'Ask for sizes, colours and price':p.stock+' available'}</div><div class="cardActions">${p.price==null?`<a class="ask" target="_blank" href="https://wa.me/${PHONE}?text=${encodeURIComponent('Hello Lady of Valor, please share available options and prices for '+p.name+'.')}">Enquire</a>`:`<button class="add" data-add="${p.id}">Add to bag</button><a class="ask" target="_blank" href="https://wa.me/${PHONE}?text=${encodeURIComponent('Hello Lady of Valor, I am interested in '+p.name+'.')}">Ask</a>`}</div></div></article>`).join('')||'<p class="empty">No products match your search.</p>';grid.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>add(+b.dataset.add))}
function add(id){cart[id]=(cart[id]||0)+1;save();openCart()}
function save(){localStorage.setItem('lov-cart',JSON.stringify(cart));renderCart()}
function renderCart(){const entries=Object.entries(cart).filter(([,q])=>q>0);$('#cartCount').textContent=entries.reduce((a,[,q])=>a+q,0);if(!entries.length){$('#cartItems').innerHTML='<div class="empty">Your bag is empty.</div>';$('#total').textContent='KSh 0';return}let total=0;$('#cartItems').innerHTML=entries.map(([id,q])=>{const p=PRODUCTS.find(x=>x.id==id);total+=p.price*q;return `<div class="cartItem">${p.image?`<img src="assets/products/${p.image}" alt="">`:'<div class="placeholder">LV</div>'}<div><h4>${p.name}</h4><small>${money(p.price)}</small><div class="qty"><button data-minus="${id}">−</button><span>${q}</span><button data-plus="${id}">+</button></div></div><b>${money(p.price*q)}</b></div>`}).join('');$('#total').textContent=money(total);document.querySelectorAll('[data-minus]').forEach(b=>b.onclick=()=>{cart[b.dataset.minus]--;if(cart[b.dataset.minus]<=0)delete cart[b.dataset.minus];save()});document.querySelectorAll('[data-plus]').forEach(b=>b.onclick=()=>{cart[b.dataset.plus]++;save()})}
function openCart(){$('#cart').classList.add('open');$('#overlay').classList.add('open')}function closeCart(){$('#cart').classList.remove('open');$('#overlay').classList.remove('open')}
$('#search').oninput=e=>{query=e.target.value.toLowerCase().trim();renderProducts()};$('#cartBtn').onclick=openCart;$('#closeCart').onclick=closeCart;$('#overlay').onclick=closeCart;$('#menuBtn').onclick=()=>$('#nav').classList.toggle('open');
$('#checkout').onclick=()=>{const entries=Object.entries(cart).filter(([,q])=>q>0);if(!entries.length)return alert('Your shopping bag is empty.');let total=0;const lines=entries.map(([id,q])=>{const p=PRODUCTS.find(x=>x.id==id);total+=p.price*q;return `• ${p.name} x${q} — ${money(p.price*q)}`});const text=`Hello Lady of Valor Collection, I would like to order:

${lines.join('
')}

Total: ${money(total)}

Please confirm availability and delivery charges. My name is: `;window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`,'_blank')};
$('#year').textContent=new Date().getFullYear();renderFilters();renderProducts();renderCart();

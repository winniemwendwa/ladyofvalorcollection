
const WHATSAPP_NUMBER = "2547117 652692"; // Replace with your WhatsApp number
const products = window.PRODUCTS || [];
let activeCategory = "All";
let cart = JSON.parse(localStorage.getItem("lv-cart") || "{}");
const grid=document.getElementById("productGrid"), filters=document.getElementById("filters"), search=document.getElementById("searchInput");
const money=n=>new Intl.NumberFormat("en-KE",{style:"currency",currency:"KES",maximumFractionDigits:0}).format(n);
const initials=s=>s.split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase();
function drawFilters(){const cats=["All",...new Set(products.map(p=>p.category))];filters.innerHTML=cats.map(c=>`<button class="filter ${c===activeCategory?'active':''}" data-cat="${c}">${c}</button>`).join("");filters.querySelectorAll('button').forEach(b=>b.onclick=()=>{activeCategory=b.dataset.cat;drawFilters();drawProducts();});}
function drawProducts(){const q=search.value.toLowerCase().trim();const list=products.filter(p=>(activeCategory==='All'||p.category===activeCategory)&&(`${p.name} ${p.description}`.toLowerCase().includes(q)));grid.innerHTML=list.length?list.map(p=>`<article class="product-card"><div class="product-image">${initials(p.name)}</div><div class="product-info"><span class="category">${p.category}</span><h3>${p.name}</h3><p>${p.description||'A beautiful addition to your collection.'}</p><span class="stock ${p.stock<1?'out':''}">${p.stock>0?`${p.stock} available`:'Currently out of stock'}</span><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-button" data-id="${p.id}" ${p.stock<1?'disabled':''}>Add to bag</button></div></div></article>`).join(''):'<p class="empty">No products match your search.</p>';grid.querySelectorAll('.add-button').forEach(b=>b.onclick=()=>addToCart(b.dataset.id));}
function addToCart(id){const p=products.find(x=>x.id===id);cart[id]=Math.min((cart[id]||0)+1,p.stock);saveCart();openCart();}
function saveCart(){localStorage.setItem('lv-cart',JSON.stringify(cart));drawCart();}
function drawCart(){const entries=Object.entries(cart).filter(([,q])=>q>0);document.getElementById('cartCount').textContent=entries.reduce((a,[,q])=>a+q,0);const box=document.getElementById('cartItems');box.innerHTML=entries.length?entries.map(([id,q])=>{const p=products.find(x=>x.id===id);return `<div class="cart-row"><div><h4>${p.name}</h4><span>${money(p.price)} each</span></div><div><strong>${money(p.price*q)}</strong><div class="cart-actions"><button data-id="${id}" data-d="-1">−</button><span>${q}</span><button data-id="${id}" data-d="1">+</button></div></div></div>`}).join(''):'<p class="empty">Your bag is empty.</p>';box.querySelectorAll('button').forEach(b=>b.onclick=()=>changeQty(b.dataset.id,Number(b.dataset.d)));const total=entries.reduce((s,[id,q])=>s+products.find(p=>p.id===id).price*q,0);document.getElementById('cartTotal').textContent=money(total);}
function changeQty(id,d){const p=products.find(x=>x.id===id);cart[id]=Math.max(0,Math.min((cart[id]||0)+d,p.stock));if(!cart[id])delete cart[id];saveCart();}
function openCart(){document.getElementById('cart').classList.add('open');document.getElementById('overlay').classList.add('open');}
function closeCart(){document.getElementById('cart').classList.remove('open');document.getElementById('overlay').classList.remove('open');}
document.getElementById('cartButton').onclick=openCart;document.getElementById('closeCart').onclick=closeCart;document.getElementById('overlay').onclick=closeCart;search.oninput=drawProducts;
document.getElementById('checkoutButton').onclick=()=>{const items=Object.entries(cart).filter(([,q])=>q>0);if(!items.length)return;const lines=items.map(([id,q])=>{const p=products.find(x=>x.id===id);return `• ${p.name} x${q} — ${money(p.price*q)}`});const total=items.reduce((s,[id,q])=>s+products.find(p=>p.id===id).price*q,0);const msg=`Hello Lady of Valor, I would like to order:

${lines.join('
')}

Total: ${money(total)}

My delivery location is:`;window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,'_blank');};
document.querySelectorAll('.whatsapp-link').forEach(a=>a.href=`https://wa.me/${WHATSAPP_NUMBER}`);document.getElementById('year').textContent=new Date().getFullYear();drawFilters();drawProducts();drawCart();

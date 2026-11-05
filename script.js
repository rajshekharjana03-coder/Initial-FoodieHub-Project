'use strict';
/* FoodieHub – vanilla JS app. Sections: helpers, data, state, calculations, renderers, actions, init */

/* ---------- Helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);

const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');

const esc = s => String(s).replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));

// Safe LocalStorage wrapper: never throws, falls back to defaults on bad data
const store = {
  get(k, d) {
    try {
      const v = JSON.parse(localStorage.getItem('fh_' + k));
      return v ?? d;
    } catch {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem('fh_' + k, JSON.stringify(v));
    } catch {
      /* storage full/blocked */
    }
  }
};

/* ---------- Data ---------- */
const CATS = [
  ['All', '🍽️'],
  ['Pizza', '🍕'],
  ['Burgers', '🍔'],
  ['Biryani', '🍛'],
  ['Chinese', '🥡'],
  ['Indian', '🍲'],
  ['Pasta', '🍝'],
  ['Desserts', '🍰'],
  ['Beverages', '🥤'],
  ['Healthy Food', '🥗'],
  ['Snacks', '🍟']
];

// name, cuisine, rating, minutes, fee, discount%, emoji, colour
const RESTS = [
  ['Pizza Piazza', 'Italian, Pizza', 4.5, 30, 29, 20, '🍕', '#fde8e2'],
  ['Burger Barn', 'Burgers, Fast Food', 4.3, 25, 25, 15, '🍔', '#fff1d6'],
  ['Royal Biryani House', 'Biryani, Mughlai', 4.6, 40, 35, 25, '🍛', '#fdebd0'],
  ['Dragon Wok', 'Chinese, Asian', 4.2, 35, 30, 10, '🥡', '#e6f2fb'],
  ['Spice Route', 'North Indian', 4.4, 35, 30, 20, '🍲', '#fbe5e0'],
  ['Pasta Fresca', 'Italian, Pasta', 4.3, 30, 28, 10, '🍝', '#f4f0d8'],
  ['Sweet Tooth', 'Desserts, Bakery', 4.7, 20, 20, 30, '🍰', '#fbe3ee'],
  ['Sip & Chill', 'Beverages, Shakes', 4.1, 15, 15, 0, '🥤', '#e0f5f2'],
  ['Green Bowl', 'Healthy, Salads', 4.5, 25, 25, 15, '🥗', '#e3f4e1'],
  ['Snack Shack', 'Snacks, Street Food', 4.0, 20, 20, 10, '🍟', '#fff0d0'],
  ['Kolkata Kitchen', 'Bengali, Indian', 4.6, 40, 35, 15, '🐟', '#e8eefb'],
  ['Wrap Republic', 'Wraps, Rolls', 4.2, 25, 22, 12, '🌯', '#f3e8fb']
];

// name|category|restaurantIndex|price|rating|veg(1/0)|discount%|emoji|description
const FOODS = `Margherita Pizza|Pizza|0|249|4.5|1|20|🍕|Classic tomato, mozzarella and fresh basil.
Pepperoni Feast|Pizza|0|399|4.4|0|15|🍕|Loaded with spicy pepperoni and cheese.
Farmhouse Pizza|Pizza|0|349|4.3|1|10|🍕|Capsicum, mushroom, onion and sweet corn.
Classic Cheeseburger|Burgers|1|179|4.3|0|15|🍔|Juicy patty, cheddar and house sauce.
Veggie Crunch Burger|Burgers|1|149|4.1|1|10|🍔|Crispy veg patty with lettuce and mayo.
Double Smash Burger|Burgers|1|259|4.6|0|0|🍔|Two smashed patties, pickles and cheese.
Hyderabadi Chicken Biryani|Biryani|2|299|4.7|0|25|🍛|Dum-cooked basmati with tender chicken.
Mutton Biryani|Biryani|2|399|4.6|0|20|🍛|Slow-cooked mutton layered with saffron rice.
Paneer Biryani|Biryani|2|249|4.3|1|15|🍛|Fragrant rice with spiced paneer cubes.
Veg Hakka Noodles|Chinese|3|169|4.2|1|10|🍜|Wok-tossed noodles with crunchy vegetables.
Chilli Chicken|Chinese|3|229|4.4|0|10|🍗|Spicy, tangy chicken in soy chilli glaze.
Veg Manchurian|Chinese|3|189|4.1|1|0|🥡|Crisp veg balls in garlic-soy gravy.
Butter Chicken|Indian|4|329|4.6|0|20|🍲|Creamy tomato gravy with tandoori chicken.
Paneer Butter Masala|Indian|4|279|4.5|1|20|🍲|Soft paneer in rich buttery gravy.
Dal Makhani & Naan|Indian|4|219|4.4|1|10|🫓|Slow-simmered black lentils with butter naan.
Alfredo Pasta|Pasta|5|259|4.3|1|10|🍝|Penne in creamy parmesan white sauce.
Arrabbiata Pasta|Pasta|5|239|4.2|1|10|🍝|Spicy tomato sauce with garlic and herbs.
Chicken Lasagna|Pasta|5|329|4.5|0|0|🍝|Layers of pasta, chicken and béchamel.
Chocolate Lava Cake|Desserts|6|129|4.7|1|30|🍰|Warm cake with molten chocolate centre.
Rasgulla Box (6)|Desserts|6|149|4.6|1|20|🍮|Spongy syrupy Bengali classic.
Blueberry Cheesecake|Desserts|6|199|4.5|1|15|🍰|Creamy baked cheesecake with berry compote.
Cold Coffee|Beverages|7|119|4.2|1|0|🥤|Chilled, creamy and strong.
Mango Lassi|Beverages|7|99|4.4|1|10|🥭|Thick yoghurt blended with Alphonso mango.
Fresh Lime Soda|Beverages|7|69|4.0|1|0|🍋|Sweet, salty or mixed, always fizzy.
Quinoa Power Salad|Healthy Food|8|229|4.5|1|15|🥗|Quinoa, chickpeas, avocado and greens.
Grilled Chicken Bowl|Healthy Food|8|289|4.6|0|10|🍱|Lean chicken, brown rice and veggies.
Fruit & Nut Smoothie Bowl|Healthy Food|8|199|4.3|1|0|🍓|Fresh fruit, seeds and granola.
Loaded Fries|Snacks|9|139|4.1|1|10|🍟|Fries with cheese sauce and jalapeños.
Samosa Chaat|Snacks|9|89|4.2|1|0|🥟|Crushed samosa with chutneys and curd.
Chicken Nuggets (8)|Snacks|9|159|4.0|0|10|🍗|Golden crispy bites with dip.
Kathi Roll Chicken|Snacks|11|149|4.4|0|12|🌯|Egg-layered paratha with spicy chicken.
Fish Curry & Rice|Indian|10|289|4.6|0|15|🐟|Bengali-style mustard fish curry.`.split('\n').map((l, i) => {
  const [name, category, r, price, rating, veg, disc, emoji, desc] = l.split('|');
  return {
    id: i + 1,
    name,
    category,
    rest: +r,
    price: +price,
    rating: +rating,
    veg: veg === '1',
    disc: +disc,
    emoji,
    desc,
    pop: 100 - ((i * 37) % 97)
  };
});

const COUPONS = {
  WELCOME20: { type: 'pct', value: 20, text: '20% OFF on your order' },
  FOODIE10: { type: 'pct', value: 10, text: '10% OFF on your order' },
  FLAT50: { type: 'flat', value: 50, text: '₹50 OFF on orders above ₹199', min: 199 }
};

const REVIEWS = [
  ['Ananya S.', 5, 'The biryani arrived hot and the tracking was spot on.'],
  ['Rahul M.', 4, 'Great prices and coupons actually work. Smooth checkout.'],
  ['Priya D.', 5, 'Healthy options that taste good. My weekday lunch sorted.']
];

const FAQS = [
  ['How long does delivery take?', 'Most orders arrive in 20–40 minutes depending on distance.'],
  ['Can I cancel an order?', 'In this demo, orders cannot be cancelled once placed.'],
  ['Is payment real?', 'No. Payment is simulated and no money is charged.'],
  ['How do coupons work?', 'Enter a code in the cart. One coupon applies per order.']
];

const STATUSES = ['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered'];

/* ---------- State ---------- */
const state = {
  cart: store.get('cart', {}),
  wish: store.get('wish', []),
  coupon: store.get('coupon', null),
  orders: store.get('orders', []),
  profile: store.get('profile', { name: 'Guest User', email: '', phone: '', addresses: [] }),
  f: { cat: 'All', q: '', veg: 'all', price: '0-9999', rating: 0, sort: 'popular', rest: null }
};

const save = () => {
  ['cart', 'wish', 'coupon', 'orders', 'profile'].forEach(k => store.set(k, state[k]));
};

const unitPrice = f => Math.round(f.price * (1 - f.disc / 100));

const byId = id => FOODS.find(f => f.id === +id);

/* ---------- Calculations (single source of truth for cart, checkout and orders) ---------- */
function calcTotals(cart = state.cart, couponCode = state.coupon) {
  const items = Object.entries(cart).map(([id, qty]) => ({ f: byId(id), qty })).filter(i => i.f && i.qty > 0);
  const subtotal = items.reduce((s, i) => s + unitPrice(i.f) * i.qty, 0);
  const c = COUPONS[couponCode];
  let discount = 0;

  if (c && (!c.min || subtotal >= c.min)) {
    discount = c.type === 'pct' ? Math.round(subtotal * c.value / 100) : Math.min(c.value, subtotal);
  }

  const delivery = !items.length || subtotal >= 499 ? 0 : 40;
  const tax = Math.round((subtotal - discount) * 0.05);

  return {
    items,
    subtotal,
    discount,
    delivery,
    tax,
    total: subtotal - discount + delivery + tax,
    count: items.reduce((s, i) => s + i.qty, 0)
  };
}

/* ---------- UI utilities ---------- */
function toast(msg, isErr) {
  const t = document.createElement('div');
  t.className = 'toast' + (isErr ? ' err' : '');
  t.textContent = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), 2800);
}

function openModal(title, html) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = html;
  $('#modal').hidden = false;
  $('#overlay').hidden = false;
  closeDrawer(true);
  const f = $('#modal input,#modal button.btn');
  if (f) f.focus();
}

function closeModal() {
  $('#modal').hidden = true;
  if (!$('#drawer').classList.contains('open')) $('#overlay').hidden = true;
}

function openDrawer() {
  renderCart();
  $('#drawer').classList.add('open');
  $('#drawer').setAttribute('aria-hidden', 'false');
  $('#overlay').hidden = false;
}

function closeDrawer(keepOverlay) {
  $('#drawer').classList.remove('open');
  $('#drawer').setAttribute('aria-hidden', 'true');
  if (!keepOverlay) $('#overlay').hidden = true;
}

const sumHtml = t => `<div class="sum">
  <div><span>Subtotal</span><span>${inr(t.subtotal)}</span></div>
  <div><span>Discount${state.coupon ? ' (' + state.coupon + ')' : ''}</span><span>−${inr(t.discount)}</span></div>
  <div><span>Delivery fee</span><span>${t.delivery ? inr(t.delivery) : 'FREE'}</span></div>
  <div><span>Taxes (5%)</span><span>${inr(t.tax)}</span></div>
  <div class="tot"><span>Payable</span><span>${inr(t.total)}</span></div>
</div>`;

/* ---------- Renderers ---------- */
function renderCategories() {
  $('#categories').innerHTML = CATS.map(([n, e]) => `<button class="cat ${state.f.cat === n ? 'active' : ''}" data-act="cat" data-v="${n}"><span>${e}</span>${n}</button>`).join('');
}

function renderRestaurants() {
  $('#restGrid').innerHTML = RESTS.map((r, i) => `<article class="card">
    <div class="thumb" style="background:${r[7]}">${r[6]}${r[5] ? `<span class="tag">${r[5]}% OFF</span>` : ''}</div>
    <div class="card-body">
      <div class="row"><h3>${r[0]}</h3><span class="rate">★ ${r[2]}</span></div>
      <p>${r[1]}</p>
      <p>⏱ ${r[3]} mins · Delivery ${inr(r[4])}</p>
      <button class="btn" data-act="viewMenu" data-v="${i}">View Menu</button>
    </div>
  </article>`).join('');
}

function filteredFoods() {
  const { cat, q, veg, price, rating, sort, rest } = state.f;
  const [lo, hi] = price.split('-').map(Number);
  const term = q.trim().toLowerCase();

  const list = FOODS.filter(f => 
    (cat === 'All' || f.category === cat) &&
    (rest === null || f.rest === rest) &&
    (!term || f.name.toLowerCase().includes(term) || RESTS[f.rest][0].toLowerCase().includes(term)) &&
    (veg === 'all' || (veg === 'veg') === f.veg) &&
    unitPrice(f) >= lo && unitPrice(f) <= hi &&
    f.rating >= +rating
  );

  const sorters = {
    low: (a, b) => unitPrice(a) - unitPrice(b),
    high: (a, b) => unitPrice(b) - unitPrice(a),
    rating: (a, b) => b.rating - a.rating,
    popular: (a, b) => b.pop - a.pop
  };

  return list.sort(sorters[sort]);
}

function renderFoods() {
  const list = filteredFoods();
  const rn = state.f.rest !== null ? ` from ${RESTS[state.f.rest][0]}` : '';

  $('#resultInfo').textContent = `${list.length} dish${list.length === 1 ? '' : 'es'} found${rn}`;

  $('#foodGrid').innerHTML = list.length 
    ? list.map(f => `<article class="card">
        <div class="thumb" style="background:${RESTS[f.rest][7]}">${f.emoji}${f.disc ? `<span class="tag">${f.disc}% OFF</span>` : ''}</div>
        <div class="card-body">
          <div class="row">
            <h3>${esc(f.name)}</h3>
            <span class="vn ${f.veg ? 'veg' : 'non'}" title="${f.veg ? 'Vegetarian' : 'Non-vegetarian'}">${f.veg ? 'Veg' : 'Non-Veg'}</span>
          </div>
          <p>${RESTS[f.rest][0]}</p>
          <p>${f.desc}</p>
          <div class="row">
            <span class="price">${inr(unitPrice(f))}${f.disc ? `<s>${inr(f.price)}</s>` : ''}</span>
            <span class="rate">★ ${f.rating}</span>
          </div>
          <div class="row">
            <button class="btn" data-act="add" data-v="${f.id}">Add to Cart</button>
            <button class="heart ${state.wish.includes(f.id) ? 'on' : ''}" data-act="wish" data-v="${f.id}" aria-label="Toggle wishlist for ${esc(f.name)}" aria-pressed="${state.wish.includes(f.id)}">${state.wish.includes(f.id) ? '♥' : '♡'}</button>
          </div>
        </div>
      </article>`).join('')
    : '<p class="empty">No dishes match these filters. Try resetting them.</p>';
}

function renderCart() {
  const t = calcTotals();

  $('#drawer').innerHTML = `<div class="d-head">
    <h3>Your cart (${t.count})</h3>
    <button class="icon-btn" data-act="closeDrawer" aria-label="Close cart">✕</button>
  </div>
  <div class="d-body">
    ${t.items.length 
      ? t.items.map(({ f, qty }) => `<div class="line-item">
          <span class="em">${f.emoji}</span>
          <div><b>${esc(f.name)}</b><br><small class="muted">${inr(unitPrice(f))} each</small></div>
          <div>
            <div class="qty">
              <button data-act="dec" data-v="${f.id}" aria-label="Decrease quantity">−</button>
              <span>${qty}</span>
              <button data-act="inc" data-v="${f.id}" aria-label="Increase quantity">+</button>
            </div>
            <br>
            <button class="heart" data-act="remove" data-v="${f.id}" aria-label="Remove ${esc(f.name)}">🗑</button>
          </div>
        </div>`).join('')
      : '<p class="empty">Your cart is empty. Add something tasty from the menu.</p>'}
  </div>
  ${t.items.length 
    ? `<div class="d-foot">
        <div class="coupon">
          <input id="couponIn" placeholder="Coupon code" aria-label="Coupon code" value="${state.coupon || ''}">
          <button class="btn ghost" data-act="coupon">Apply</button>
        </div>
        ${sumHtml(t)}
        <div class="row">
          <button class="btn ghost" data-act="clear">Clear cart</button>
          <button class="btn" data-act="checkout">Checkout</button>
        </div>
      </div>` 
    : ''}`;
}

function refreshBadges() {
  $('#cartCount').textContent = calcTotals().count;
  $('#wishCount').textContent = state.wish.length;
}

function renderOffers() {
  $('#offerGrid').innerHTML = Object.entries(COUPONS).map(([k, c]) => `<div class="offer">
    <b>${k}</b>
    <p>${c.text}</p>
    <button class="btn" data-act="copyCoupon" data-v="${k}">Apply coupon</button>
  </div>`).join('');
}

function orderStatusIndex(o) {
  const s = (Date.now() - o.time) / 1000;
  return s < 20 ? 0 : s < 60 ? 1 : s < 120 ? 2 : 3;
} // simulated progress

function orderHtml(o) {
  const i = orderStatusIndex(o);

  return `<div class="order">
    <div class="row"><b>${o.id}</b><span class="status">${STATUSES[i]}</span></div>
    <small class="muted">${new Date(o.time).toLocaleString('en-IN')}</small>
    <div class="track" aria-label="Order progress">
      ${STATUSES.map((_, n) => `<i class="${n <= i ? 'on' : ''}"></i>`).join('')}
    </div>
    <p>${o.items.map(x => `${esc(x.name)} × ${x.qty}`).join(', ')}</p>
    <div class="row"><b>Total ${inr(o.totals.total)}</b><span class="muted">${esc(o.payment)}</span></div>
  </div>`;
}

function renderOrders() {
  $('#ordersList').innerHTML = state.orders.length 
    ? state.orders.map(orderHtml).join('') 
    : '<p class="muted">No orders yet. Your placed orders will appear here.</p>';
}

function renderStatic() {
  $('#reviewGrid').innerHTML = REVIEWS.map(r => `<article class="review">
    <div class="stars" aria-label="${r[1]} stars">${'★'.repeat(r[1])}${'☆'.repeat(5 - r[1])}</div>
    <p>${r[2]}</p>
    <b>${r[0]}</b>
  </article>`).join('');

  $('#faqList').innerHTML = FAQS.map(f => `<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('');
}

function renderWishlist() {
  const items = state.wish.map(byId).filter(Boolean);

  openModal('My wishlist', items.length 
    ? items.map(f => `<div class="line-item">
        <span class="em">${f.emoji}</span>
        <div><b>${esc(f.name)}</b><br><small class="muted">${inr(unitPrice(f))}</small></div>
        <div>
          <button class="btn" data-act="add" data-v="${f.id}">Add</button> 
          <button class="heart" data-act="wishRemove" data-v="${f.id}" aria-label="Remove from wishlist">✕</button>
        </div>
      </div>`).join('') 
    : '<p class="empty">No favourites yet. Tap the heart on any dish.</p>');
}

function renderProfile() {
  const p = state.profile;

  openModal('My profile', `<form id="profileForm" class="form-grid" novalidate>
    <div><label class="f-l" for="pName">Name</label><input id="pName" value="${esc(p.name)}"></div>
    <div><label class="f-l" for="pPhone">Mobile</label><input id="pPhone" value="${esc(p.phone)}" inputmode="numeric"></div>
    <div class="full"><label class="f-l" for="pEmail">Email</label><input id="pEmail" type="email" value="${esc(p.email)}"></div>
    <button class="btn full" type="submit">Save profile</button>
  </form>
  <h4 style="margin:16px 0 6px">Saved addresses</h4>
  ${p.addresses.length ? p.addresses.map((a, i) => `<div class="row" style="padding:6px 0"><span>📍 ${esc(a)}</span><button class="heart" data-act="delAddr" data-v="${i}" aria-label="Delete address">🗑</button></div>`).join('') : '<p class="muted">No saved addresses.</p>'}
  <form id="addrForm" class="coupon">
    <input id="newAddr" placeholder="Add a new address" aria-label="New address">
    <button class="btn ghost" type="submit">Add</button>
  </form>
  <div class="row" style="margin-top:14px;flex-wrap:wrap">
    <button class="btn ghost" data-act="goOrders">My orders (${state.orders.length})</button>
    <button class="btn ghost" data-act="wishlist">Wishlist (${state.wish.length})</button>
    <button class="btn danger" data-act="logout">Logout</button>
  </div>`);
}

function renderCheckout() {
  const t = calcTotals();
  if (!t.items.length) return toast('Your cart is empty', true);

  const p = state.profile;
  const a = p.addresses[0] || '';

  const fld = (id, label, val, extra = '', full = '') => `<div class="${full}">
    <label class="f-l" for="${id}">${label}</label>
    <input id="${id}" value="${esc(val)}" ${extra}>
    <div class="err" id="${id}Err"></div>
  </div>`;

  openModal('Checkout', `<form id="checkoutForm" class="form-grid" novalidate>
    ${fld('cName', 'Customer name', p.name === 'Guest User' ? '' : p.name)}
    ${fld('cPhone', 'Mobile number', p.phone, 'inputmode="numeric" maxlength="10"')}
    ${fld('cEmail', 'Email address', p.email, 'type="email"', 'full')}
    <div class="full">
      <label class="f-l" for="cAddr">Delivery address</label>
      <textarea id="cAddr" rows="2">${esc(a)}</textarea>
      <div class="err" id="cAddrErr"></div>
    </div>
    ${fld('cLand', 'Landmark (optional)', '')}
    ${fld('cPin', 'Pincode', '', 'inputmode="numeric" maxlength="6"')}
    <div class="full">
      <label class="f-l" for="cPay">Payment method (simulated)</label>
      <select id="cPay">
        <option>UPI</option>
        <option>Credit / Debit Card</option>
        <option>Cash on Delivery</option>
      </select>
    </div>
    <div class="full">
      <b>Order summary</b>
      ${t.items.map(({ f, qty }) => `<div class="row"><small>${esc(f.name)} × ${qty}</small><small>${inr(unitPrice(f) * qty)}</small></div>`).join('')}
      ${sumHtml(t)}
    </div>
    <button class="btn full" id="placeBtn" type="submit">Place Order · ${inr(t.total)}</button>
  </form>`);
}

/* ---------- Actions ---------- */
function changeQty(id, d) {
  const n = (state.cart[id] || 0) + d;
  if (n <= 0) delete state.cart[id];
  else state.cart[id] = Math.min(n, 20);

  save();
  refreshBadges();
  renderCart();
}

function addToCart(id) {
  state.cart[id] = Math.min((state.cart[id] || 0) + 1, 20);
  save();
  refreshBadges();
  toast(`${byId(id).name} added to cart`);
  if ($('#drawer').classList.contains('open')) renderCart();
}

function toggleWish(id, fromModal) {
  id = +id;
  const i = state.wish.indexOf(id);

  if (i > -1) {
    state.wish.splice(i, 1);
    toast('Removed from wishlist');
  } else {
    state.wish.push(id);
    toast('Added to wishlist');
  }

  save();
  refreshBadges();
  renderFoods();
  if (fromModal) renderWishlist();
}

function applyCoupon(code) {
  code = (code || '').trim().toUpperCase();
  const c = COUPONS[code];

  if (!code) return toast('Enter a coupon code', true);
  if (!c) return toast('Invalid coupon code', true);
  if (c.min && calcTotals().subtotal < c.min) return toast(`${code} needs a subtotal of ${inr(c.min)} or more`, true);

  state.coupon = code;
  save();
  renderCart();
  toast(`${code} applied`);
}

function validateCheckout() {
  const v = id => $('#' + id).value.trim();
  const rules = [
    ['cName', v('cName').length >= 2, 'Enter your full name'],
    ['cPhone', /^[6-9]\d{9}$/.test(v('cPhone')), 'Enter a valid 10-digit mobile number'],
    ['cEmail', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('cEmail')), 'Enter a valid email address'],
    ['cAddr', v('cAddr').length >= 10, 'Enter a complete address (min 10 characters)'],
    ['cPin', /^\d{6}$/.test(v('cPin')), 'Enter a 6-digit pincode']
  ];

  let ok = true;
  rules.forEach(([id, pass, msg]) => {
    $('#' + id).classList.toggle('bad', !pass);
    $('#' + id + 'Err').textContent = pass ? '' : msg;
    if (!pass) ok = false;
  });

  return ok;
}

function placeOrder() {
  if (!validateCheckout()) return toast('Please fix the highlighted fields', true);

  const t = calcTotals();
  if (!t.items.length) return toast('Your cart is empty', true);

  const btn = $('#placeBtn');
  btn.disabled = true;
  btn.textContent = 'Processing payment…';

  setTimeout(() => { // simulated payment delay
    const order = {
      id: 'FH' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 90 + 10),
      time: Date.now(),
      items: t.items.map(i => ({ name: i.f.name, qty: i.qty })),
      totals: t,
      coupon: state.coupon,
      payment: $('#cPay').value,
      address: $('#cAddr').value.trim()
    };

    state.orders.unshift(order);
    Object.assign(state.profile, {
      name: $('#cName').value.trim(),
      phone: $('#cPhone').value.trim(),
      email: $('#cEmail').value.trim()
    });

    state.cart = {};
    state.coupon = null;

    save();
    refreshBadges();
    renderOrders();

    openModal('Order confirmed', `<div class="success">
      <div class="tick">✅</div>
      <h3>Thank you, ${esc(state.profile.name)}!</h3>
      <p class="muted">Your order ${order.id} has been placed.</p>
    </div>
    ${orderHtml(order)}
    <p class="muted">Delivering to: ${esc(order.address)}</p>
    <button class="btn block" data-act="goOrders">View my orders</button>`);
  }, 1200);
}

function goTo(sel) {
  closeModal();
  closeDrawer();
  $(sel).scrollIntoView({ behavior: 'smooth' });
}

function setSearch(q) {
  state.f.q = q;
  $('#fSearch').value = q;
  renderFoods();
}

/* Central click handler using data-act attributes */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (el) {
    const v = el.dataset.v;
    const inModal = !$('#modal').hidden;

    switch (el.dataset.act) {
      case 'cat':
        state.f.cat = v;
        state.f.rest = null;
        renderCategories();
        renderFoods();
        break;
      case 'viewMenu':
        state.f.rest = +v;
        state.f.cat = 'All';
        renderCategories();
        renderFoods();
        goTo('#menu');
        break;
      case 'add':
        addToCart(v);
        break;
      case 'wish':
        toggleWish(v);
        break;
      case 'wishRemove':
        toggleWish(v, true);
        break;
      case 'inc':
        changeQty(v, 1);
        break;
      case 'dec':
        changeQty(v, -1);
        break;
      case 'remove':
        changeQty(v, -99);
        break;
      case 'clear':
        state.cart = {};
        state.coupon = null;
        save();
        refreshBadges();
        renderCart();
        toast('Cart cleared');
        break;
      case 'coupon':
        applyCoupon($('#couponIn').value);
        break;
      case 'copyCoupon':
        if (!Object.keys(state.cart).length) {
          state.coupon = v;
          save();
          toast(`${v} saved. It applies once you add items.`);
        } else {
          state.coupon = v;
          save();
          openDrawer();
          applyCoupon(v);
        }
        break;
      case 'cart':
        openDrawer();
        break;
      case 'closeDrawer':
        closeDrawer();
        break;
      case 'checkout':
        renderCheckout();
        break;
      case 'wishlist':
        renderWishlist();
        break;
      case 'profile':
        renderProfile();
        break;
      case 'closeModal':
        closeModal();
        break;
      case 'goOrders':
        goTo('#orders');
        break;
      case 'delAddr':
        state.profile.addresses.splice(+v, 1);
        save();
        renderProfile();
        break;
      case 'logout':
        state.profile = { name: 'Guest User', email: '', phone: '', addresses: [] };
        save();
        closeModal();
        toast('Logged out (demo)');
        break;
    }
    return;
  }

  if (e.target.id === 'overlay') {
    closeModal();
    closeDrawer();
  }

  if (e.target.closest('#mainNav a')) {
    $('#mainNav').classList.remove('open');
    $('#burger').setAttribute('aria-expanded', 'false');
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeDrawer();
  }
});

document.addEventListener('submit', e => {
  e.preventDefault();

  switch (e.target.id) {
    case 'checkoutForm':
      placeOrder();
      break;
    case 'profileForm': {
      const em = $('#pEmail').value.trim();
      const ph = $('#pPhone').value.trim();

      if (!$('#pName').value.trim()) return toast('Name is required', true);
      if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return toast('Invalid email address', true);
      if (ph && !/^[6-9]\d{9}$/.test(ph)) return toast('Invalid mobile number', true);

      Object.assign(state.profile, { name: $('#pName').value.trim(), email: em, phone: ph });
      save();
      toast('Profile saved');
      break;
    }
    case 'addrForm': {
      const a = $('#newAddr').value.trim();
      if (a.length < 10) return toast('Enter a complete address', true);
      state.profile.addresses.push(a);
      save();
      renderProfile();
      break;
    }
    case 'newsForm': {
      const m = $('#newsEmail');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.value.trim())) return toast('Enter a valid email', true);
      toast('Subscribed! Check your inbox.');
      m.value = '';
      break;
    }
    case 'heroForm':
      state.f.cat = 'All';
      state.f.rest = null;
      renderCategories();
      setSearch($('#heroSearch').value);
      goTo($('#heroSearch').value ? '#menu' : '#restaurants');
      break;
    case 'navSearchForm':
      state.f.rest = null;
      setSearch($('#navSearch').value);
      goTo('#menu');
      break;
  }
});

function bindFilters() {
  $('#fSearch').addEventListener('input', e => {
    state.f.q = e.target.value;
    renderFoods();
  });

  [['fVeg', 'veg'], ['fPrice', 'price'], ['fRating', 'rating'], ['fSort', 'sort']].forEach(([id, key]) => {
    $('#' + id).addEventListener('change', e => {
      state.f[key] = e.target.value;
      renderFoods();
    });
  });

  $('#fReset').addEventListener('click', () => {
    state.f = { cat: 'All', q: '', veg: 'all', price: '0-9999', rating: 0, sort: 'popular', rest: null };
    ['fSearch', 'fVeg', 'fPrice', 'fRating', 'fSort'].forEach(id => {
      $('#' + id).selectedIndex = 0;
    });
    $('#fSearch').value = '';
    renderCategories();
    renderFoods();
  });

  $('#burger').addEventListener('click', () => {
    const o = $('#mainNav').classList.toggle('open');
    $('#burger').setAttribute('aria-expanded', o);
  });
}

/* ---------- Init ---------- */
function init() {
  if (state.coupon && !COUPONS[state.coupon]) state.coupon = null; // guard against tampered storage

  state.cart = Object.fromEntries(
    Object.entries(state.cart).filter(([id, q]) => byId(id) && Number.isInteger(q) && q > 0)
  );

  renderCategories();
  renderRestaurants();
  renderFoods();
  renderOffers();
  renderOrders();
  renderStatic();
  refreshBadges();
  bindFilters();

  setInterval(renderOrders, 10000); // refresh simulated order statuses

  window.addEventListener('load', () => setTimeout(() => $('#loader').classList.add('done'), 400));
}

init();
document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(sessionStorage.getItem('currentUser')||'null');
  if (!user) { window.location.href='index.html'; return; }
  const selectEl = document.getElementById('restaurant-select');
  const detailEl = document.getElementById('restaurant-detail');
  const cartEl = document.getElementById('cart-container');
  detailEl.innerText = 'Chargement...';

  let restaurantsCache = [];
  let cart = [];

  function formatPrice(v){ return parseFloat(v).toFixed(2); }

  function showMessage(text, type='success', timeout=3000) {
    const msg = document.createElement('div');
    msg.className = `message-inline ${type==='success'? 'success' : 'error'}`;
    msg.textContent = text;
    detailEl.prepend(msg);
    if (timeout>0) setTimeout(()=>msg.remove(), timeout);
  }

  async function refresh() {
    const restos = await window.api.getAllRestaurants();
    restaurantsCache = restos || [];
    if (!restos || restos.length === 0) { detailEl.innerText = 'Aucun restaurant.'; return; }
    // Remplir le select
    selectEl.innerHTML = '';
    const placeholder = document.createElement('option'); placeholder.value = ''; placeholder.textContent = '-- Choisir --'; selectEl.appendChild(placeholder);
    restos.forEach(r => {
      const opt = document.createElement('option'); opt.value = r.id; opt.textContent = r.nom; selectEl.appendChild(opt);
    });
    // Par défaut, si un resto existe, sélectionner le premier
    if (restos.length > 0) selectEl.value = restos[0].id;
    renderSelectedRestaurant();
    // Si admin/cook, ajouter bouton d'ajout rapide
    if (user.roles.includes('Admin') || user.roles.includes('Cuisinier')) {
      const addForm = document.createElement('form');
      addForm.className = 'form-inline';
      addForm.innerHTML = `\n        <h3>Ajouter un restaurant</h3>\n        <input type="text" placeholder="Nom" id="add-nom" required>\n        <input type="text" placeholder="Adresse" id="add-adr">\n        <input type="text" placeholder="Téléphone" id="add-tel">\n        <button type="submit" class="btn-primary">Ajouter</button>\n      `;
      addForm.style.marginBottom = '1.5rem';
      addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = addForm.querySelector('button');
        const nom = addForm.querySelector('#add-nom').value.trim();
        const adresse = addForm.querySelector('#add-adr').value.trim();
        const telephone = addForm.querySelector('#add-tel').value.trim();
        if (!nom) { showMessage('Le nom est requis.', 'error'); return; }
        btn.disabled = true;
        try {
          const res = await window.api.addRestaurant(user.id, { nom, adresse, telephone });
          if (res && res.success) { showMessage('Restaurant ajouté !', 'success'); addForm.reset(); refresh(); }
          else showMessage('Erreur lors de l\'ajout: '+(res && res.error ? res.error : ''), 'error');
        } catch (err) { showMessage('Erreur réseau.', 'error'); }
        btn.disabled = false;
      });
      detailEl.prepend(addForm);
    }
  }

  function renderSelectedRestaurant(){
    const selectedId = Number(selectEl.value);
    const r = restaurantsCache.find(x=>x.id === selectedId) || restaurantsCache[0];
    if (!r) { detailEl.innerText = 'Aucun restaurant sélectionné.'; return; }
    detailEl.innerHTML = '';
    const div = document.createElement('div'); div.className='restaurant-card';
    let html = `<div class="restaurant-info"><strong style="font-size:120%">${r.nom}</strong><br>
      <span style="color:#666">${r.adresse||''}</span><br>
      <span style="color:#666">${r.telephone||''}</span><br></div>`;
    if (user.roles.includes('Admin') || user.roles.includes('Cuisinier')) {
      html += `<div class="restaurant-actions"><button class="small-btn btn-danger del-resto" data-id="${r.id}">Supprimer</button>`;
      html += `<button class="small-btn btn-muted edit-resto" data-id="${r.id}">Modifier</button></div>`;
    }
    html += `<div class="restaurant-info"><h4>Menus</h4><ul class="prod-list">`;
    html += (r.produits||[]).map(p=>{
      let prod = `<li data-prod-id='${p.id}'><b>${p.nom}</b> - ${formatPrice(p.prix)}€<br><span style='color:#888'>${p.description||''}</span>`;
      if (user.roles.includes('Admin') || user.roles.includes('Cuisinier')) {
        prod += ` <button class='small-btn btn-danger del-prod' data-id='${p.id}'>Supprimer</button> <button class='small-btn btn-muted edit-prod' data-id='${p.id}' data-resto='${r.id}'>Modifier</button>`;
      } else {
        prod += ` <button class='small-btn btn-primary order-btn' data-id='${p.id}' data-resto='${r.id}'>Ajouter au panier</button>`;
      }
      prod += '</li>';
      return prod;
    }).join('');
    html += '</ul></div>';
    if (user.roles.includes('Admin') || user.roles.includes('Cuisinier')) {
      html += `<form class='add-prod-form' data-resto='${r.id}' style='margin-top:1em'>\n          <input type='text' placeholder='Nom du menu' required class='prod-nom'>\n          <input type='number' placeholder='Prix' required class='prod-prix' min='0' step='0.01'>\n          <input type='text' placeholder='Description' class='prod-desc'>\n          <button type='submit' class='btn-primary'>Ajouter menu</button>\n        </form>`;
    }
    div.innerHTML = html;
    detailEl.appendChild(div);
    // attach events
    attachDetailEvents();
    renderCart();
  }

  selectEl.addEventListener('change', ()=> renderSelectedRestaurant());

  function attachDetailEvents(){
    detailEl.querySelectorAll('.del-resto').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (!confirm('Supprimer ce restaurant ?')) return;
        btn.disabled = true;
        const res = await window.api.deleteRestaurant(user.id, btn.dataset.id);
        if (res && res.success) { showMessage('Restaurant supprimé.', 'success'); refresh(); }
        else { showMessage('Erreur suppression.', 'error'); btn.disabled = false; }
      });
    });
    detailEl.querySelectorAll('.edit-resto').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.dataset.id;
        const nom = prompt('Nouveau nom ?');
        const adresse = prompt('Nouvelle adresse ?');
        const telephone = prompt('Nouveau téléphone ?');
        if (!nom) { showMessage('Le nom est requis.', 'error'); return; }
        btn.disabled = true;
        const res = await window.api.updateRestaurant(id, { nom, adresse, telephone });
        if (res && res.success) { showMessage('Restaurant modifié.', 'success'); refresh(); }
        else { showMessage('Erreur modification.', 'error'); btn.disabled = false; }
      });
    });
    detailEl.querySelectorAll('.del-prod').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (!confirm('Supprimer ce menu ?')) return;
        btn.disabled = true;
        const res = await window.api.deleteProduit(user.id, btn.dataset.id);
        if (res && res.success) { showMessage('Menu supprimé.', 'success'); refresh(); }
        else { showMessage('Erreur suppression menu.', 'error'); btn.disabled = false; }
      });
    });
    detailEl.querySelectorAll('.edit-prod').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.dataset.id;
        const nom = prompt('Nouveau nom du menu ?');
        const prix = prompt('Nouveau prix ?');
        const description = prompt('Nouvelle description ?');
        if (!nom || !prix) { showMessage('Nom et prix requis.', 'error'); return; }
        btn.disabled = true;
        const res = await window.api.updateProduit(user.id, id, { nom, prix: parseFloat(prix), description });
        if (res && res.success) { showMessage('Menu modifié.', 'success'); refresh(); }
        else { showMessage('Erreur modification menu.', 'error'); btn.disabled = false; }
      });
    });
    detailEl.querySelectorAll('.add-prod-form').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const restoId = form.dataset.resto;
        const nom = form.querySelector('.prod-nom').value.trim();
        const prixVal = form.querySelector('.prod-prix').value;
        const prix = parseFloat(prixVal);
        const description = form.querySelector('.prod-desc').value.trim();
        if (!nom || isNaN(prix) || prix < 0) { showMessage('Nom valide et prix >= 0 requis.', 'error'); return; }
        btn.disabled = true;
        const res = await window.api.addProduit(user.id, restoId, { nom, prix, description });
        if (res && res.success) { showMessage('Menu ajouté.', 'success'); form.reset(); refresh(); }
        else { showMessage('Erreur ajout menu.', 'error'); btn.disabled = false; }
      });
    });
    // ajouter au panier
    detailEl.querySelectorAll('.order-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pid = Number(btn.dataset.id);
        const restoId = Number(btn.dataset.resto);
        const prod = (restaurantsCache.find(r=>r.id===restoId).produits || []).find(p=>p.id===pid);
        if (!prod) { showMessage('Produit introuvable', 'error'); return; }
        addToCart({ id: prod.id, nom: prod.nom, prix: prod.prix, quantite: 1, id_restaurant: restoId });
      });
    });
  }

  function addToCart(item){
    if (cart.length>0 && item.id_restaurant !== cart[0].id_restaurant) {
      showMessage('Veuillez commander un seul restaurant à la fois.', 'error');
      return;
    }
    const existing = cart.find(c=>c.id===item.id);
    if (existing) existing.quantite += item.quantite || 1;
    else cart.push(Object.assign({}, item));
    showMessage('Produit ajouté au panier', 'success', 1500);
    renderCart();
  }

  function renderCart(){
    cartEl.innerHTML = '';
    const title = document.createElement('h3'); title.textContent = 'Panier'; cartEl.appendChild(title);
    if (cart.length===0){ const p = document.createElement('div'); p.textContent='Panier vide.'; cartEl.appendChild(p); return; }
    const ul = document.createElement('ul'); ul.style.listStyle='none'; ul.style.padding='0';
    let total = 0;
    cart.forEach((it, idx)=>{
      const li = document.createElement('li'); li.style.padding='0.5rem 0';
      const sub = (it.prix * it.quantite);
      total += sub;
      li.innerHTML = `<b>${it.nom}</b> - ${formatPrice(it.prix)}€ x <input type='number' min='1' value='${it.quantite}' data-idx='${idx}' style='width:4rem'> = ${formatPrice(sub)}€ <button data-idx='${idx}' class='small-btn btn-danger'>Retirer</button>`;
      ul.appendChild(li);
    });
    cartEl.appendChild(ul);
    const tot = document.createElement('div'); tot.style.marginTop='0.5rem'; tot.innerHTML = `<b>Total: ${formatPrice(total)}€</b>`; cartEl.appendChild(tot);
    const checkoutBtn = document.createElement('button'); checkoutBtn.className='btn-primary'; checkoutBtn.textContent='Passer au paiement'; cartEl.appendChild(checkoutBtn);
    // handlers
    cartEl.querySelectorAll('input[type=number]').forEach(inp=>{
      inp.addEventListener('change', (e)=>{
        const idx = Number(e.target.dataset.idx); const v = parseInt(e.target.value)||1; cart[idx].quantite = v; renderCart();
      });
    });
    cartEl.querySelectorAll('button.btn-danger').forEach(b=>{
      b.addEventListener('click', ()=>{ const idx=Number(b.dataset.idx); cart.splice(idx,1); renderCart(); });
    });
    checkoutBtn.addEventListener('click', ()=> startPaymentFlow());
  }

  async function startPaymentFlow(){
    if (cart.length===0) { showMessage('Panier vide.', 'error'); return; }
    // Snake mini-jeu: manger des fruits pour gagner une commande gratuite
    const gameDiv = document.createElement('div');
    gameDiv.style.padding='1rem'; gameDiv.style.border='1px solid #ddd'; gameDiv.style.marginTop='1rem';
    gameDiv.innerHTML = `<p>Mini-jeu Snake : mangez ${5} fruits pour gagner une commande gratuite. Utilisez les flèches pour diriger le serpent.</p>`;
    const canvas = document.createElement('canvas');
    // taille responsive selon l'espace disponible
    const containerWidth = Math.max(240, Math.min(400, Math.floor(detailEl.clientWidth * 0.6)));
    canvas.width = containerWidth; canvas.height = containerWidth; canvas.style.background = '#fff'; canvas.style.display = 'block'; canvas.style.marginTop = '0.5rem'; canvas.style.border = '1px solid #ddd';
    gameDiv.appendChild(canvas);
    const info = document.createElement('div'); info.style.marginTop='0.5rem'; gameDiv.appendChild(info);
    const ctx = canvas.getContext('2d');
    const cell = 15; const cols = Math.floor(canvas.width / cell); const rows = Math.floor(canvas.height / cell);
    let snake = [{x: Math.floor(cols/2), y: Math.floor(rows/2)}];
    let dir = {x: 1, y: 0};
    let food = null;
    let score = 0; const target = 5;
    let running = true;
    let tickId = null;

    function placeFood(){
      let f; do { f = { x: Math.floor(Math.random()*cols), y: Math.floor(Math.random()*rows) }; }
      while (snake.some(s=>s.x===f.x && s.y===f.y));
      food = f;
    }

    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      // background
      ctx.fillStyle = '#fafafa'; ctx.fillRect(0,0,canvas.width,canvas.height);
      // food
      if (food){ ctx.fillStyle='red'; ctx.beginPath(); ctx.arc(food.x*cell + cell/2, food.y*cell + cell/2, cell/2 - 2, 0, Math.PI*2); ctx.fill(); }
      // snake
      ctx.fillStyle = '#2ecc71'; snake.forEach((s,i)=>{ ctx.fillRect(s.x*cell, s.y*cell, cell-1, cell-1); });
      // score
      ctx.fillStyle='#333'; ctx.font = '12px sans-serif'; ctx.fillText(`Mange: ${score}/${target}`, 8, 14);
    }

    function step(){
      if (!running) return;
      const head = { x: (snake[0].x + dir.x + cols) % cols, y: (snake[0].y + dir.y + rows) % rows };
      // self collision
      if (snake.some(s=>s.x===head.x && s.y===head.y)){
        running = false; info.textContent = 'Game over — vous avez touché le corps. Cliquez sur Réessayer.'; clearInterval(tickId); renderRetry(); return;
      }
      snake.unshift(head);
      if (food && head.x===food.x && head.y===food.y){ score++; placeFood(); if (score>=target){ running = false; clearInterval(tickId); info.textContent = 'Bravo — vous avez gagné ! Envoi de la commande gratuite...'; submitOrder(true); return; } }
      else snake.pop();
      draw();
    }

    function renderRetry(){
      const retry = document.createElement('button'); retry.className='btn-primary small-btn'; retry.textContent='Réessayer'; retry.style.marginTop='0.5rem';
      retry.addEventListener('click', ()=>{
        // reset
        snake = [{x: Math.floor(cols/2), y: Math.floor(rows/2)}]; dir = {x:1,y:0}; score = 0; running = true; info.textContent = ''; retry.remove(); placeFood(); tickId = setInterval(step, 120);
      });
      gameDiv.appendChild(retry);
    }

    // keyboard
    function keyHandler(e){
      const k = e.key;
      if (k==='ArrowUp' && dir.y!==1) { dir = {x:0,y:-1}; }
      else if (k==='ArrowDown' && dir.y!==-1) { dir = {x:0,y:1}; }
      else if (k==='ArrowLeft' && dir.x!==1) { dir = {x:-1,y:0}; }
      else if (k==='ArrowRight' && dir.x!==-1) { dir = {x:1,y:0}; }
    }

    // start
    placeFood(); draw(); tickId = setInterval(step, 120); window.addEventListener('keydown', keyHandler);
    // cleanup when leaving
    const cleanup = () => { clearInterval(tickId); window.removeEventListener('keydown', keyHandler); };
    // attach to DOM
    cartEl.appendChild(gameDiv);
    // ensure cleanup when order submitted: cleanup is executed before calling submitOrder from game
  }

  async function submitOrder(isFree=false){
    // construire payload
    const restoId = cart[0].id_restaurant; // supposer même resto pour le panier
    const produits = cart.map(c=>({ id: c.id, quantite: c.quantite }));
    const payload = { id_restaurant: restoId, produits, free: !!isFree };
    try {
      const res = await window.api.createCommande(user.id, payload);
      if (res && res.success){
        showMessage('Commande envoyée !', 'success');
        cart = [];
        renderCart();
        refresh();
      } else {
        showMessage('Erreur lors de la commande: '+(res && res.error?res.error:''), 'error');
      }
    } catch (err){ showMessage('Erreur réseau.', 'error'); }
  }

  refresh();
});

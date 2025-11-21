document.addEventListener('DOMContentLoaded', async () => {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    const selectEl = document.getElementById('restaurant-select');
    const detailEl = document.getElementById('restaurant-detail');
    const cartEl = document.getElementById('cart-container');
    detailEl.innerText = 'Chargement...';
    let restaurantsCache = [];
    let cart = [];
    async function refresh() {
        const restos = await window.api.getAllRestaurants();
        restaurantsCache = restos || [];
        if (!restos || restos.length === 0) {
            detailEl.innerText = 'Aucun restaurant.';
            return;
        }
        selectEl.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '-- Choisir --';
        selectEl.appendChild(placeholder);
        restos.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.id;
            opt.textContent = r.nom;
            selectEl.appendChild(opt);
        });
        if (restos.length > 0)
            selectEl.value = restos[0].id;
        renderSelectedRestaurant();
        if (user.roles.includes('Admin') || user.roles.includes('Cuisinier')) {
            const addForm = document.createElement('form');
            addForm.className = 'form-inline';
            addForm.innerHTML = `
        <h3>Ajouter un restaurant</h3>
        <input type="text" placeholder="Nom" id="add-nom" required>
        <input type="text" placeholder="Adresse" id="add-adr">
        <input type="text" placeholder="Téléphone" id="add-tel">
        <button type="submit" class="btn-primary">Ajouter</button>
      `;
            addForm.style.marginBottom = '1.5rem';
            addForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = addForm.querySelector('button');
                const nom = addForm.querySelector('#add-nom').value.trim();
                const adresse = addForm.querySelector('#add-adr').value.trim();
                const telephone = addForm.querySelector('#add-tel').value.trim();
                if (!nom) {
                    showMessage(detailEl, 'Le nom est requis.', 'error');
                    return;
                }
                btn.disabled = true;
                try {
                    const res = await window.api.addRestaurant(user.id, { nom, adresse, telephone });
                    if (res && res.success) {
                        showMessage(detailEl, 'Restaurant ajouté !', 'success');
                        addForm.reset();
                        refresh();
                    }
                    else
                        showMessage(detailEl, 'Erreur lors de l\'ajout: ' + (res && res.error ? res.error : ''), 'error');
                }
                catch (err) {
                    showMessage(detailEl, 'Erreur réseau.', 'error');
                }
                btn.disabled = false;
            });
            detailEl.prepend(addForm);
        }
    }
    function renderSelectedRestaurant() {
        const selectedId = Number(selectEl.value);
        const r = restaurantsCache.find(x => x.id === selectedId) || restaurantsCache[0];
        if (!r) {
            detailEl.innerText = 'Aucun restaurant sélectionné.';
            return;
        }
        detailEl.innerHTML = '';
        const div = document.createElement('div');
        div.className = 'restaurant-card';
        let html = `<div class="restaurant-info">
      <strong style="font-size:120%">${r.nom}</strong><br>
      <span style="color:#666">${r.adresse || ''}</span><br>
      <span style="color:#666">${r.telephone || ''}</span><br>
    </div>`;
        if (user.roles.includes('Admin') || user.roles.includes('Cuisinier')) {
            html += `<div class="restaurant-actions">
        <button class="small-btn btn-danger del-resto" data-id="${r.id}">Supprimer restaurant</button>
        <button class="small-btn btn-muted edit-resto" data-id="${r.id}">Modifier restaurant</button>
      </div>`;
        }
        html += `<div class="restaurant-info"><h4>Sections de menu</h4></div>`;
        if (r.sections && r.sections.length > 0) {
            r.sections.forEach((section, idx) => {
                html += `<div class="section-menu" data-section-id="${section.id}" style="margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 5px;">
          <h5 style="margin-top: 0;">${section.nom}</h5>`;
                if (section.description) {
                    html += `<p style="color: #666; font-size: 0.9em;">${section.description}</p>`;
                }
                if (section.produits && section.produits.length > 0) {
                    html += `<ul class="prod-list" style="list-style: none; padding: 0;">`;
                    section.produits.forEach(p => {
                        html += `<li data-prod-id='${p.id}' style="padding: 0.5rem 0; border-bottom: 1px solid #eee; display: flex; align-items: center;">`;
                        if (p.url_photo) {
                            html += `<img src="${p.url_photo}" alt="${p.nom}" style="width: 60px; height: 60px; margin-right: 1rem; border-radius: 3px; object-fit: cover;">`;
                        }
                        html += `<div style="flex: 1;">
              <b>${p.nom}</b> - ${formatPrice(p.prix)}€`;
                        if (p.prix_promo) {
                            html += ` <span style="color: red; font-weight: bold;">-${formatPrice(p.prix_promo)}€</span>`;
                        }
                        if (p.description) {
                            html += `<br><span style='color:#888; font-size: 0.9em;'>${p.description}</span>`;
                        }
                        html += `</div>`;
                        if (user.roles.includes('Admin') || user.roles.includes('Cuisinier')) {
                            html += `<div style="margin-left: 1rem;">
                <button class='small-btn btn-danger del-prod' data-id='${p.id}'>Supprimer</button>
                <button class='small-btn btn-muted edit-prod' data-id='${p.id}' data-section='${section.id}'>Modifier</button>
              </div>`;
                        }
                        else {
                            html += `<button class='small-btn btn-primary order-btn' data-id='${p.id}' data-resto='${r.id}'>Ajouter</button>`;
                        }
                        html += `</li>`;
                    });
                    html += `</ul>`;
                }
                else {
                    html += `<p style="color: #999; font-size: 0.9em;">Aucun produit dans cette section.</p>`;
                }
                if (user.roles.includes('Admin') || user.roles.includes('Cuisinier')) {
                    html += `<div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #ddd;">
            <button class="small-btn btn-muted edit-section" data-id="${section.id}">Renommer</button>
            <button class="small-btn btn-danger del-section" data-id="${section.id}">Supprimer section</button>
            <button class="small-btn btn-primary add-prod-btn" data-section="${section.id}">Ajouter produit</button>
          </div>`;
                }
                html += `</div>`;
            });
        }
        if (user.roles.includes('Admin') || user.roles.includes('Cuisinier')) {
            html += `<div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid #ddd;">
        <button class="btn-primary add-section-btn" data-resto="${r.id}">+ Ajouter une section</button>
      </div>`;
            html += `<div style="margin-top: 1.5rem; padding: 1rem; background: #f5f5f5; border-radius: 5px;">
        <h5>Ajouter une nouvelle section</h5>
        <form class='add-section-form' data-resto='${r.id}'>
          <input type='text' placeholder='Nom de la section' required class='section-nom' style="margin-bottom: 0.5rem;">
          <input type='text' placeholder='Description (optionnel)' class='section-desc' style="margin-bottom: 0.5rem;">
          <button type='submit' class='btn-primary'>Créer section</button>
        </form>
      </div>`;
        }
        div.innerHTML = html;
        detailEl.appendChild(div);
        attachDetailEvents();
        renderCart();
    }
    selectEl.addEventListener('change', () => renderSelectedRestaurant());
    function attachDetailEvents() {
        detailEl.querySelectorAll('.del-resto').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (!confirm('Supprimer ce restaurant ?'))
                    return;
                btn.disabled = true;
                const res = await window.api.deleteRestaurant(user.id, btn.dataset.id);
                if (res && res.success) {
                    showMessage(detailEl, 'Restaurant supprimé.', 'success');
                    refresh();
                }
                else {
                    showMessage(detailEl, 'Erreur suppression.', 'error');
                    btn.disabled = false;
                }
            });
        });
        detailEl.querySelectorAll('.edit-resto').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = btn.dataset.id;
                const nom = prompt('Nouveau nom ?');
                const adresse = prompt('Nouvelle adresse ?');
                const telephone = prompt('Nouveau téléphone ?');
                if (!nom) {
                    showMessage(detailEl, 'Le nom est requis.', 'error');
                    return;
                }
                btn.disabled = true;
                const res = await window.api.updateRestaurant(id, { nom, adresse, telephone });
                if (res && res.success) {
                    showMessage(detailEl, 'Restaurant modifié.', 'success');
                    refresh();
                }
                else {
                    showMessage(detailEl, 'Erreur modification.', 'error');
                    btn.disabled = false;
                }
            });
        });
        detailEl.querySelectorAll('.del-prod').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (!confirm('Supprimer ce produit ?'))
                    return;
                btn.disabled = true;
                const res = await window.api.deleteProduit(user.id, btn.dataset.id);
                if (res && res.success) {
                    showMessage(detailEl, 'Produit supprimé.', 'success');
                    refresh();
                }
                else {
                    showMessage(detailEl, 'Erreur suppression produit.', 'error');
                    btn.disabled = false;
                }
            });
        });
        detailEl.querySelectorAll('.edit-prod').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = btn.dataset.id;
                const sectionId = btn.dataset.section;
                const nom = prompt('Nouveau nom du produit ?');
                const prix = prompt('Nouveau prix ?');
                const description = prompt('Nouvelle description ?');
                const url_photo = prompt('URL de la photo (optionnel) ?');
                if (!nom || !prix) {
                    showMessage(detailEl, 'Nom et prix requis.', 'error');
                    return;
                }
                btn.disabled = true;
                const res = await window.api.updateProduit(user.id, id, {
                    nom,
                    prix: parseFloat(prix),
                    description: description || null,
                    url_photo: url_photo || null
                });
                if (res && res.success) {
                    showMessage(detailEl, 'Produit modifié.', 'success');
                    refresh();
                }
                else {
                    showMessage(detailEl, 'Erreur modification produit.', 'error');
                    btn.disabled = false;
                }
            });
        });
        detailEl.querySelectorAll('.add-prod-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const sectionId = Number(btn.dataset.section);
                const nom = prompt('Nom du produit ?');
                if (!nom) {
                    showMessage(detailEl, 'Le nom est requis.', 'error');
                    return;
                }
                const prix = prompt('Prix ?');
                if (!prix || isNaN(parseFloat(prix))) {
                    showMessage(detailEl, 'Prix valide requis.', 'error');
                    return;
                }
                const description = prompt('Description (optionnel) ?');
                const url_photo = prompt('URL de la photo (optionnel) ?');
                btn.disabled = true;
                const res = await window.api.addProduit(user.id, sectionId, {
                    nom,
                    prix: parseFloat(prix),
                    description: description || null,
                    url_photo: url_photo || null
                });
                if (res && res.success) {
                    showMessage(detailEl, 'Produit ajouté.', 'success');
                    refresh();
                }
                else {
                    showMessage(detailEl, 'Erreur ajout produit.', 'error');
                    btn.disabled = false;
                }
            });
        });
        detailEl.querySelectorAll('.add-section-form').forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = form.querySelector('button');
                const restoId = Number(form.dataset.resto);
                const nom = form.querySelector('.section-nom').value.trim();
                const description = form.querySelector('.section-desc').value.trim();
                if (!nom) {
                    showMessage(detailEl, 'Le nom de la section est requis.', 'error');
                    return;
                }
                btn.disabled = true;
                const res = await window.api.addSection(user.id, restoId, { nom, description: description || null });
                if (res && res.success) {
                    showMessage(detailEl, 'Section ajoutée.', 'success');
                    form.reset();
                    refresh();
                }
                else {
                    showMessage(detailEl, 'Erreur ajout section.', 'error');
                    btn.disabled = false;
                }
            });
        });
        detailEl.querySelectorAll('.edit-section').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = btn.dataset.id;
                const nom = prompt('Nouveau nom de la section ?');
                const description = prompt('Nouvelle description (optionnel) ?');
                if (!nom) {
                    showMessage(detailEl, 'Le nom est requis.', 'error');
                    return;
                }
                btn.disabled = true;
                const res = await window.api.updateSection(user.id, id, { nom, description: description || null });
                if (res && res.success) {
                    showMessage(detailEl, 'Section modifiée.', 'success');
                    refresh();
                }
                else {
                    showMessage(detailEl, 'Erreur modification section.', 'error');
                    btn.disabled = false;
                }
            });
        });
        detailEl.querySelectorAll('.del-section').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (!confirm('Supprimer cette section ?'))
                    return;
                btn.disabled = true;
                const res = await window.api.deleteSection(user.id, btn.dataset.id);
                if (res && res.success) {
                    showMessage(detailEl, 'Section supprimée.', 'success');
                    refresh();
                }
                else {
                    showMessage(detailEl, 'Erreur suppression: ' + (res.error || ''), 'error');
                    btn.disabled = false;
                }
            });
        });
        detailEl.querySelectorAll('.order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pid = Number(btn.dataset.id);
                const restoId = Number(btn.dataset.resto);
                let prod = null;
                const r = restaurantsCache.find(x => x.id === restoId);
                if (r && r.sections) {
                    for (let section of r.sections) {
                        const p = section.produits.find(x => x.id === pid);
                        if (p) {
                            prod = p;
                            break;
                        }
                    }
                }
                if (!prod) {
                    showMessage(detailEl, 'Produit introuvable', 'error');
                    return;
                }
                addToCart({ id: prod.id, nom: prod.nom, prix: prod.prix, quantite: 1, id_restaurant: restoId });
            });
        });
    }
    function addToCart(item) {
        if (cart.length > 0 && item.id_restaurant !== cart[0].id_restaurant) {
            showMessage(detailEl, 'Veuillez commander un seul restaurant à la fois.', 'error');
            return;
        }
        const existing = cart.find(c => c.id === item.id);
        if (existing)
            existing.quantite += item.quantite || 1;
        else
            cart.push(Object.assign({}, item));
        showMessage(detailEl, 'Produit ajouté au panier', 'success', 1500);
        renderCart();
    }
    function renderCart() {
        cartEl.innerHTML = '';
        const title = document.createElement('h3');
        title.textContent = 'Panier';
        cartEl.appendChild(title);
        if (cart.length === 0) {
            const p = document.createElement('div');
            p.textContent = 'Panier vide.';
            cartEl.appendChild(p);
            return;
        }
        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        let total = 0;
        cart.forEach((it, idx) => {
            const li = document.createElement('li');
            li.style.padding = '0.5rem 0';
            const sub = (it.prix * it.quantite);
            total += sub;
            li.innerHTML = `<b>${it.nom}</b> - ${formatPrice(it.prix)}€ x <input type='number' min='1' value='${it.quantite}' data-idx='${idx}' style='width:6rem'> = ${formatPrice(sub)}€ <button data-idx='${idx}' class='small-btn btn-danger'>Retirer</button>`;
            ul.appendChild(li);
        });
        cartEl.appendChild(ul);
        const tot = document.createElement('div');
        tot.style.marginTop = '0.5rem';
        tot.innerHTML = `<b>Total: ${formatPrice(total)}€</b>`;
        cartEl.appendChild(tot);
        const checkoutBtn = document.createElement('button');
        checkoutBtn.className = 'btn-primary';
        checkoutBtn.textContent = 'Passer au paiement';
        cartEl.appendChild(checkoutBtn);
        cartEl.querySelectorAll('input[type=number]').forEach(inp => {
            inp.addEventListener('change', (e) => {
                const idx = Number(e.target.dataset.idx);
                const v = parseInt(e.target.value) || 1;
                cart[idx].quantite = v;
                renderCart();
            });
        });
        cartEl.querySelectorAll('button.btn-danger').forEach(b => {
            b.addEventListener('click', () => {
                const idx = Number(b.dataset.idx);
                cart.splice(idx, 1);
                renderCart();
            });
        });
        checkoutBtn.addEventListener('click', () => startPaymentFlow());
    }
    async function startPaymentFlow() {
        if (cart.length === 0) {
            showMessage(detailEl, 'Panier vide.', 'error');
            return;
        }
        const gameDiv = document.createElement('div');
        gameDiv.style.padding = '1rem';
        gameDiv.style.border = '1px solid #ddd';
        gameDiv.style.marginTop = '1rem';
        gameDiv.innerHTML = `<p>Mini-jeu Snake : mangez 5 fruits pour gagner une commande gratuite. Utilisez les flèches pour diriger le serpent.</p>`;
        const canvas = document.createElement('canvas');
        const containerWidth = Math.max(240, Math.min(400, Math.floor(detailEl.clientWidth * 0.6)));
        canvas.width = containerWidth;
        canvas.height = containerWidth;
        canvas.style.background = '#fff';
        canvas.style.display = 'block';
        canvas.style.marginTop = '0.5rem';
        canvas.style.border = '1px solid #ddd';
        gameDiv.appendChild(canvas);
        const info = document.createElement('div');
        info.style.marginTop = '0.5rem';
        gameDiv.appendChild(info);
        const ctx = canvas.getContext('2d');
        const cell = 15;
        const cols = Math.floor(canvas.width / cell);
        const rows = Math.floor(canvas.height / cell);
        let snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
        let dir = { x: 1, y: 0 };
        let food = null;
        let score = 0;
        const target = 5;
        let running = true;
        let tickId = null;
        function placeFood() {
            let f;
            do {
                f = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
            } while (snake.some(s => s.x === f.x && s.y === f.y));
            food = f;
        }
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fafafa';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (food) {
                ctx.fillStyle = 'red';
                ctx.beginPath();
                ctx.arc(food.x * cell + cell / 2, food.y * cell + cell / 2, cell / 2 - 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = '#2ecc71';
            snake.forEach((s, i) => {
                ctx.fillRect(s.x * cell, s.y * cell, cell - 1, cell - 1);
            });
            ctx.fillStyle = '#333';
            ctx.font = '12px sans-serif';
            ctx.fillText(`Mange: ${score}/${target}`, 8, 14);
        }
        function step() {
            if (!running)
                return;
            const head = { x: (snake[0].x + dir.x + cols) % cols, y: (snake[0].y + dir.y + rows) % rows };
            if (snake.some(s => s.x === head.x && s.y === head.y)) {
                running = false;
                info.textContent = 'Game over — vous avez touché le corps. Cliquez sur Réessayer.';
                clearInterval(tickId);
                renderRetry();
                return;
            }
            snake.unshift(head);
            if (food && head.x === food.x && head.y === food.y) {
                score++;
                placeFood();
                if (score >= target) {
                    running = false;
                    clearInterval(tickId);
                    info.textContent = 'Bravo — vous avez gagné ! Envoi de la commande gratuite...';
                    submitOrder(true);
                    return;
                }
            }
            else
                snake.pop();
            draw();
        }
        function renderRetry() {
            const retry = document.createElement('button');
            retry.className = 'btn-primary small-btn';
            retry.textContent = 'Réessayer';
            retry.style.marginTop = '0.5rem';
            retry.addEventListener('click', () => {
                snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
                dir = { x: 1, y: 0 };
                score = 0;
                running = true;
                info.textContent = '';
                retry.remove();
                placeFood();
                tickId = setInterval(step, 120);
            });
            gameDiv.appendChild(retry);
        }
        function keyHandler(e) {
            const k = e.key;
            if (k === 'ArrowUp' && dir.y !== 1) {
                e.preventDefault();
                dir = { x: 0, y: -1 };
            }
            else if (k === 'ArrowDown' && dir.y !== -1) {
                e.preventDefault();
                dir = { x: 0, y: 1 };
            }
            else if (k === 'ArrowLeft' && dir.x !== 1) {
                e.preventDefault();
                dir = { x: -1, y: 0 };
            }
            else if (k === 'ArrowRight' && dir.x !== -1) {
                e.preventDefault();
                dir = { x: 1, y: 0 };
            }
        }
        placeFood();
        draw();
        tickId = setInterval(step, 120);
        window.addEventListener('keydown', keyHandler);
        cartEl.appendChild(gameDiv);
    }
    async function submitOrder(isFree = false) {
        const restoId = cart[0].id_restaurant;
        const produits = cart.map(c => ({ id: c.id, quantite: c.quantite }));
        const payload = { id_restaurant: restoId, produits, free: !!isFree };
        try {
            const res = await window.api.createCommande(user.id, payload);
            if (res && res.success) {
                showMessage(detailEl, 'Commande envoyée !', 'success');
                cart = [];
                renderCart();
                refresh();
            }
            else {
                showMessage(detailEl, 'Erreur lors de la commande: ' + (res && res.error ? res.error : ''), 'error');
            }
        }
        catch (err) {
            showMessage(detailEl, 'Erreur réseau.', 'error');
        }
    }
    refresh();
});

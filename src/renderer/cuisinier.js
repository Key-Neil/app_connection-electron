document.addEventListener('DOMContentLoaded', async () => {
  const user = getCurrentUser();
  if (!user) { window.location.href='index.html'; return; }

  const restosDiv = document.getElementById('restos');
  restosDiv.innerText = 'Chargement des restaurants...';

  try {
    console.log('Chargement des restaurants pour le cuisinier...');
    const restos = await window.api.getRestaurantsForCook(user.id);
    console.log('Restaurants reçus:', restos);
    
    if (!restos || restos.length === 0) { 
      restosDiv.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <p style="color: #666; font-size: 1.1rem;">Aucun restaurant assigné.</p>
          <p style="color: #999;">Vous n'êtes cuisinier pour aucun restaurant pour le moment.</p>
        </div>
      `; 
      return; 
    }

    restosDiv.innerHTML = restos.map(r => `
      <div style="border:1px solid #eee;padding:0.75rem;margin-bottom:0.5rem;border-radius:6px">
        <strong>${r.nom}</strong><br>
        Adresse: <input value="${r.adresse||''}" data-id="${r.id}" class="resto-addr"><br>
        Tel: <input value="${r.telephone||''}" data-id="${r.id}" class="resto-tel"><br>
        <button data-id="${r.id}" class="save-resto">Enregistrer</button>
      </div>
    `).join('\n');

    restosDiv.querySelectorAll('.save-resto').forEach(btn=>{
      btn.addEventListener('click', async (e)=>{
        const id = e.target.dataset.id;
        const addr = restosDiv.querySelector(`input.resto-addr[data-id="${id}"]`).value;
        const tel = restosDiv.querySelector(`input.resto-tel[data-id="${id}"]`).value;
        const res = await window.api.updateRestaurant(id, { adresse: addr, telephone: tel });
        if (res && res.success) alert('Restaurant mis à jour'); else alert('Erreur');
      });
    });
  } catch (err) { 
    console.error('Erreur getRestaurantsForCook:', err);
    restosDiv.innerHTML = `
      <div style="color: #d32f2f; padding: 1.5rem; background: #ffebee; border-radius: 8px; border-left: 4px solid #d32f2f;">
        <strong>Erreur lors du chargement des restaurants</strong><br>
        <small>${err.message || 'Une erreur est survenue'}</small><br>
        <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer;">Réessayer</button>
      </div>
    `;
  }
});

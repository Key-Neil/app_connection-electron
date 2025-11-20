document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(sessionStorage.getItem('currentUser')||'null');
  if (!user) { window.location.href='index.html'; return; }

  const restosDiv = document.getElementById('restos');
  restosDiv.innerText = 'Chargement...';

  try {
    const restos = await window.api.getRestaurantsForCook(user.id);
    if (!restos || restos.length === 0) { restosDiv.innerText = 'Aucun restaurant assigné.'; return; }

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
  } catch (err) { console.error(err); restosDiv.innerText='Erreur.' }
});

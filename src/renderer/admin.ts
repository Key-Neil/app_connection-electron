document.addEventListener('DOMContentLoaded', async () => {
    const usersDiv = document.getElementById('users');
    usersDiv.innerText = 'Chargement...';
    try {
        const [users, roles, restaurants] = await Promise.all([window.api.getUsers(), window.api.getRoles(), window.api.getAllRestaurants()]);
        if (!users) {
            usersDiv.innerText = 'Erreur lors du chargement des utilisateurs.';
            return;
        }
        const table = document.createElement('div');
        table.innerHTML = users.map(u => {
            const roleChecks = roles.map(r => {
                const checked = (u.roles || []).includes(r.nom) ? 'checked' : '';
                return `<label style="margin-right:0.5rem"><input type="checkbox" data-user="${u.id}" data-role="${r.nom}" ${checked}> ${r.nom}</label>`;
            }).join(' ');
            return `
        <div style="border:1px solid #eee;padding:0.75rem;margin-bottom:0.5rem;border-radius:6px">
          <strong>${u.prenom} ${u.nom || ''}</strong> — ${u.email}<br>
          ${roleChecks}
        </div>`;
        }).join('\n');
                // Bloc d'attachement cuisinier -> restaurant
                const attachBlock = document.createElement('div');
                attachBlock.style.marginBottom = '1rem';
                attachBlock.innerHTML = `
                    <h4>Rattacher un cuisinier à un restaurant</h4>
                    <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap: wrap;">
                        <select id="attach-user" style="min-width: 220px"></select>
                        <select id="attach-restaurant" style="min-width: 220px"></select>
                        <button id="attach-do" class="btn">Rattacher</button>
                    </div>
                    <small style="color:#666">Sélectionnez un utilisateur ayant le rôle Cuisinier.</small>
                `;

                const userSelect = attachBlock.querySelector('#attach-user') as HTMLSelectElement;
                const restoSelect = attachBlock.querySelector('#attach-restaurant') as HTMLSelectElement;
                const doBtn = attachBlock.querySelector('#attach-do') as HTMLButtonElement;

                const cuisUsers = users.filter(u => (u.roles || []).includes('Cuisinier'));
                userSelect.innerHTML = cuisUsers.map(u => `<option value="${u.id}">${u.prenom || ''} ${u.nom || ''} (${u.email})</option>`).join('');
                restoSelect.innerHTML = (restaurants || []).map(r => `<option value="${r.id}">${r.nom}</option>`).join('');

                doBtn.addEventListener('click', async () => {
                    const uid = Number(userSelect.value);
                    const rid = Number(restoSelect.value);
                    doBtn.disabled = true;
                    const res = await window.api.addStaffToRestaurant(uid, rid);
                    alert(res && res.success ? 'Rattachement réussi' : `Erreur: ${res && res.error ? res.error : ''}`);
                    const updatedRestaurants = await window.api.getAllRestaurants();
                    restoSelect.innerHTML = (updatedRestaurants || []).map(r => `<option value="${r.id}">${r.nom}</option>`).join('');
                    doBtn.disabled = false;
                });

                // Bloc de détachement cuisinier -> restaurant
                const detachBlock = document.createElement('div');
                detachBlock.style.marginBottom = '1rem';
                detachBlock.innerHTML = `
                    <h4>Détacher un cuisinier d'un restaurant</h4>
                    <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap: wrap;">
                        <select id="detach-user" style="min-width: 220px"></select>
                        <select id="detach-restaurant" style="min-width: 220px"></select>
                        <button id="detach-do" class="btn">Détacher</button>
                    </div>
                `;

                const detachUserSelect = detachBlock.querySelector('#detach-user') as HTMLSelectElement;
                const detachRestoSelect = detachBlock.querySelector('#detach-restaurant') as HTMLSelectElement;
                const detachBtn = detachBlock.querySelector('#detach-do') as HTMLButtonElement;

                detachUserSelect.innerHTML = userSelect.innerHTML;
                detachRestoSelect.innerHTML = restoSelect.innerHTML;

                detachBtn.addEventListener('click', async () => {
                    const uid = Number(detachUserSelect.value);
                    const rid = Number(detachRestoSelect.value);
                    detachBtn.disabled = true;
                    const res = await window.api.removeStaffFromRestaurant(uid, rid);
                    alert(res && res.success ? 'Détachement réussi' : `Erreur: ${res && res.error ? res.error : ''}`);
                    const updatedRestaurants = await window.api.getAllRestaurants();
                    restoSelect.innerHTML = (updatedRestaurants || []).map(r => `<option value=\"${r.id}\">${r.nom}</option>`).join('');
                    detachRestoSelect.innerHTML = restoSelect.innerHTML;
                    detachBtn.disabled = false;
                });

                usersDiv.innerHTML = '';
                usersDiv.appendChild(attachBlock);
                usersDiv.appendChild(detachBlock);
                usersDiv.appendChild(table);

        usersDiv.querySelectorAll('input[type=checkbox]').forEach(cb => {
            cb.addEventListener('change', async (e) => {
                const userId = (e.target as any).dataset.user;
                const checkboxes = Array.from(usersDiv.querySelectorAll(`input[data-user="${userId}"]`));
                const selectedRoles = checkboxes.filter(c => (c as any).checked).map(c => (c as any).dataset.role);
                const res = await window.api.setRoles(Number(userId), selectedRoles as any);
                if (!res || !res.success)
                    alert('Erreur lors de la mise à jour des rôles');
            });
        });
    }
    catch (err) {
        console.error(err);
        usersDiv.innerText = 'Erreur lors du chargement.';
    }
});

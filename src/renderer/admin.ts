document.addEventListener('DOMContentLoaded', async () => {
    const usersDiv = document.getElementById('users');
    usersDiv.innerText = 'Chargement...';
    try {
        const [users, roles] = await Promise.all([window.api.getUsers(), window.api.getRoles()]);
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
        usersDiv.innerHTML = table.innerHTML;
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

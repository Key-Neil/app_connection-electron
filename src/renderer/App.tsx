import React, { useEffect, useState } from 'react';

interface User {
  id_utilisateur: number;
  nom: string;
  prenom: string;
  email: string;
}

declare global {
  interface Window {
    electronAPI: {
      getUsersAll: () => Promise<User[]>;
      getRestaurantsAll: () => Promise<unknown>;
      getCommandsAll: () => Promise<unknown>;
      getDeliveriesAll: () => Promise<unknown>;
      getProductsAll: () => Promise<unknown>;
    };
  }
}

export default function App(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await window.electronAPI.getUsersAll();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="container">
      <header className="header">
        <h1>🍔 Connextion App</h1>
        <p>Application de commande et livraison de repas</p>
      </header>

      <main className="main-content">
        <section className="section">
          <h2>Utilisateurs</h2>
          {loading && <p className="loading">Chargement...</p>}
          {error && <p className="error">Erreur: {error}</p>}
          {!loading && users.length > 0 && (
            <ul className="user-list">
              {users.map((user) => (
                <li key={user.id_utilisateur} className="user-item">
                  {user.prenom} {user.nom} ({user.email})
                </li>
              ))}
            </ul>
          )}
          {!loading && users.length === 0 && (
            <p className="empty">Aucun utilisateur trouvé</p>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2025 Connextion App - Tous droits réservés</p>
      </footer>
    </div>
  );
}

import React, { useEffect, useState } from 'react';

/**
 * Exemple d'utilisation des APIs Electron
 * Ce fichier montre comment appeler les services métier depuis React
 */

interface User {
  id_utilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  roles?: {
    role: {
      nom_role: string;
    };
  }[];
}

interface Restaurant {
  id_restaurant: number;
  nom: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
}

interface Product {
  id_produit: number;
  nom: string;
  prix: number;
  description?: string;
}

declare global {
  interface Window {
    electronAPI: {
      // Users
      getUsersAll: () => Promise<User[]>;
      getUserById: (id: number) => Promise<User>;
      createUser: (data: {
        nom: string;
        prenom: string;
        email: string;
        mot_de_passe_hash: string;
        telephone?: string;
      }) => Promise<User>;

      // Restaurants
      getRestaurantsAll: () => Promise<Restaurant[]>;
      getRestaurantById: (id: number) => Promise<Restaurant>;

      // Commands
      getCommandsAll: () => Promise<unknown>;
      getCommandById: (id: number) => Promise<unknown>;

      // Deliveries
      getDeliveriesAll: () => Promise<unknown>;
      getDeliveriesAvailable: () => Promise<unknown>;

      // Products
      getProductsAll: () => Promise<Product[]>;
      getProductsByRestaurant: (restaurantId: number) => Promise<Product[]>;
    };
  }
}

export default function ExampleComponent(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 📝 Exemple 1: Récupérer tous les utilisateurs
  const fetchUsers = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await window.electronAPI.getUsersAll();
      setUsers(data);
      console.log('✅ Utilisateurs chargés:', data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('❌ Erreur:', message);
    } finally {
      setLoading(false);
    }
  };

  // 📝 Exemple 2: Récupérer tous les restaurants
  const fetchRestaurants = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await window.electronAPI.getRestaurantsAll();
      setRestaurants(data as Restaurant[]);
      console.log('✅ Restaurants chargés:', data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('❌ Erreur:', message);
    } finally {
      setLoading(false);
    }
  };

  // 📝 Exemple 3: Récupérer les produits d'un restaurant
  const fetchProductsByRestaurant = async (restaurantId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await window.electronAPI.getProductsByRestaurant(restaurantId);
      setProducts(data);
      console.log('✅ Produits du restaurant chargés:', data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('❌ Erreur:', message);
    } finally {
      setLoading(false);
    }
  };

  // 📝 Exemple 4: Créer un nouvel utilisateur
  const createNewUser = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await window.electronAPI.createUser({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        mot_de_passe_hash: 'hashedPassword123', // En production, hasher le mot de passe!
        telephone: '+33612345678',
      });
      console.log('✅ Utilisateur créé:', newUser);
      // Recharger la liste
      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('❌ Erreur:', message);
    } finally {
      setLoading(false);
    }
  };

  // 📝 Exemple 5: Gérer les événements
  const handleRestaurantChange = (restaurantId: number): void => {
    setSelectedRestaurant(restaurantId);
    fetchProductsByRestaurant(restaurantId);
  };

  // Charger les données au montage du composant
  useEffect(() => {
    fetchUsers();
    fetchRestaurants();
  }, []);

  return (
    <div className="example-container">
      <h1>📚 Exemples d'utilisation des APIs</h1>

      {/* Section erreurs */}
      {error && (
        <div className="error-box">
          <h3>❌ Erreur</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Section Loading */}
      {loading && <p className="loading-text">Chargement en cours...</p>}

      {/* Exemple 1: Liste des utilisateurs */}
      <section className="example-section">
        <h2>Exemple 1: Récupérer les utilisateurs</h2>
        <button onClick={fetchUsers} disabled={loading}>
          Recharger les utilisateurs
        </button>
        <ul>
          {users.map((user) => (
            <li key={user.id_utilisateur}>
              <strong>{user.prenom} {user.nom}</strong> ({user.email})
              {user.roles && user.roles.length > 0 && (
                <span className="badge">Rôles: {user.roles.map(r => r.role.nom_role).join(', ')}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Exemple 2: Liste des restaurants */}
      <section className="example-section">
        <h2>Exemple 2: Récupérer les restaurants</h2>
        <button onClick={fetchRestaurants} disabled={loading}>
          Recharger les restaurants
        </button>
        <select onChange={(e) => handleRestaurantChange(parseInt(e.target.value))}>
          <option value="">-- Sélectionner un restaurant --</option>
          {restaurants.map((restaurant) => (
            <option key={restaurant.id_restaurant} value={restaurant.id_restaurant}>
              {restaurant.nom} {restaurant.adresse && `(${restaurant.adresse})`}
            </option>
          ))}
        </select>
      </section>

      {/* Exemple 3: Produits du restaurant sélectionné */}
      {selectedRestaurant && (
        <section className="example-section">
          <h2>Exemple 3: Produits du restaurant</h2>
          {products.length > 0 ? (
            <ul>
              {products.map((product) => (
                <li key={product.id_produit}>
                  <strong>{product.nom}</strong> - {product.prix.toFixed(2)}€
                  {product.description && <p>{product.description}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p>Aucun produit trouvé</p>
          )}
        </section>
      )}

      {/* Exemple 4: Créer un utilisateur */}
      <section className="example-section">
        <h2>Exemple 4: Créer un nouvel utilisateur</h2>
        <button onClick={createNewUser} disabled={loading}>
          Créer un nouvel utilisateur
        </button>
        <p className="note">
          ℹ️ Cliquez sur le bouton pour créer un utilisateur avec des données pré-remplies.
          En production, utiliser un formulaire pour les saisies utilisateur.
        </p>
      </section>

      {/* Documentation */}
      <section className="example-section documentation">
        <h2>📖 Documentation du code</h2>
        <p>
          Ce composant montre comment appeler les APIs Electron depuis React:
        </p>
        <ul>
          <li>
            <strong>fetchUsers():</strong> Récupère tous les utilisateurs via
            window.electronAPI.getUsersAll()
          </li>
          <li>
            <strong>fetchRestaurants():</strong> Récupère tous les restaurants
          </li>
          <li>
            <strong>fetchProductsByRestaurant():</strong> Récupère les produits d'un restaurant
          </li>
          <li>
            <strong>createNewUser():</strong> Crée un nouvel utilisateur
          </li>
        </ul>
        <p>
          Consultez <code>src/main/preload.ts</code> pour voir toutes les APIs disponibles.
        </p>
      </section>

      <style>{`
        .example-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
        }

        .example-section {
          background: white;
          padding: 1.5rem;
          margin: 1.5rem 0;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .example-section h2 {
          color: #667eea;
          margin-bottom: 1rem;
        }

        button {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          margin-bottom: 1rem;
          transition: background 0.3s;
        }

        button:hover:not(:disabled) {
          background: #764ba2;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        ul {
          list-style: none;
          padding: 0;
        }

        li {
          padding: 0.75rem;
          background: #f9f9f9;
          margin-bottom: 0.5rem;
          border-left: 4px solid #667eea;
          border-radius: 4px;
        }

        .badge {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          margin-left: 0.5rem;
        }

        .error-box {
          background: #ffebee;
          border-left: 4px solid #d32f2f;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          color: #d32f2f;
        }

        .loading-text {
          color: #667eea;
          font-weight: bold;
          text-align: center;
        }

        .note {
          background: #f0f4ff;
          padding: 1rem;
          border-radius: 4px;
          color: #667eea;
          margin-top: 1rem;
        }

        .documentation {
          background: #f5f5f5;
        }

        code {
          background: #eee;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
}

type CartItem = { id: number; nom: string; prix: number; quantite: number; restaurantId: number };

export let currentUser: any = null;
export let cart: CartItem[] = [];
export let selectedRestaurantId: number | null = null;

export function setCurrentUser(user: any) {
  currentUser = user;
}

export function resetCart() {
  cart = [];
  selectedRestaurantId = null;
}

export function addToCart(item: CartItem) {
  const existingItem = cart.find(i => i.id === item.id);
  if (existingItem) {
    existingItem.quantite += item.quantite;
  } else {
    cart.push(item);
  }
}

export function setSelectedRestaurant(id: number) {
  selectedRestaurantId = id;
}

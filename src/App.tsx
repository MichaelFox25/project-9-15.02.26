import { useState } from "react";
import CatalogPage from "./pages/Catalog/Catalog";
import CartPage from "./pages/Cart/Cart";

export type Product = {
  id: number;
  name: string;
  price: number;
};

export type CartItem = Product & {
  quantity: number;
};

export default function App() {
  const [page, setPage] = useState<"catalog" | "cart">("catalog");
  const [cart, setCart] = useState<CartItem[]>([]);
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };
  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };
  const increase = (id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };
  const decrease = (id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };
  return (
    <>
      {page === "catalog" && (
        <CatalogPage
          cartCount={cart.length}
          onAddToCart={addToCart}
          onGoToCart={() => setPage("cart")}
        />
      )}
      {page === "cart" && (
        <CartPage
          cart={cart}
          onRemove={removeFromCart}
          onIncrease={increase}
          onDecrease={decrease}
          onBack={() => setPage("catalog")}
        />
      )}
    </>
  );
}

import "./Cart.css";
import { useEffect, useState } from "react";
import Log from "../../../public/Logo.png"

export type ApiCartResponse = {
  cart_id: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  items: {
    cart_item_id: number;
    quantity: number;
    design: {
      design_id: number;
      name: string;
      image_url: string;
      background_color: string;
      product: {
        base_price: number;
      };
    };
  }[];
};


type Props = {
  onBack: () => void;
};

export default function CartPage({ onBack }: Props) {
  const [cart, setCart] = useState<ApiCartResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.vyatsu-junior.ru/cart/my-cart", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setCart(data);
      })
      .catch((err) => {
        console.error("Ошибка загрузки корзины", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
    const total =
    cart?.items.reduce(
      (sum, item) =>
        sum + item.design.product.base_price * item.quantity,
      0
    ) ?? 0;

    if (loading) return <div>Загрузка...</div>;

  return (
    <div className="page2">
      <header className="header1">
        <div className="logo">
          <img src={Log} width={250} />
        </div>
        <div className="rightHeader">
          <button className="backBtn" onClick={onBack}>
            На главную
          </button>
          <div className="title">Корзина</div>
        </div>
      </header>
      <div className="cartContainer">
        <div className="itemsList">
          {cart?.items.length === 0 && (
            <div className="empty">Корзина пустая</div>
          )}
          {cart?.items.map((item) => (
            <div key={item.cart_item_id} className="cartItem">
              <div className="info">
                <h3>{item.design.name}</h3>
                <p>
                  <b>Цена:</b>{" "}
                  {item.design.product.base_price} ₽
                </p>
                <div className="controls">
                  <span>{item.quantity}</span>
                </div>
                <div className="price">
                  {item.design.product.base_price *
                    item.quantity} ₽
                </div>
              </div>
              <div className="imageBox">
                <img
                  src={item.design.image_url}
                  alt={item.design.name}
                  width={120}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="summary">
          <div className="total">
            Итог: <b>{total} ₽</b>
          </div>
          <button
            className="buyBtn"
            disabled={!cart || cart.items.length === 0}
          >
            Купить
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import "./Profile.css";

type ProfileProps = {
  onGoBack: () => void;
};
type Order = {
  order_id: number;
  created_at: string;
  status: {
    status_id: number;
    name: string;
  };
};
type Favorite = {
  design_id: number;
  name: string;
  image_url: string;
};
type UserResponse = {
  email: string;
  orders: Order[];
  designs: Favorite[];
};

function Profile({ onGoBack }: ProfileProps) {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchUser = async () => {
    try {
      let res = await fetch("https://api.vyatsu-junior.ru/user/me", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Ошибка при получении данных пользователя");
      const data: UserResponse = await res.json();
      setEmail(data.email);
      setOrders(data.orders);
      setFavorites(data.designs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);
  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <h2 className="profile-title">Профиль</h2>
        <div className="right-left">
          <div className="profile-left">
            <div className="profile-field">
              <label>E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="orders-section">
              <h3>Мои заказы</h3>
              <div className="orders-header">
                <span>Дата</span>
                <span>Состояние</span>
              </div>
              {orders.map((order) => (
                <div className="order-row" key={order.order_id}>
                  <span>{new Date(order.created_at).toLocaleString()}</span>
                  <span>{order.status.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="profile-right">
            <h3>Мои дизайны</h3>
            <div className="favorites-list">
              {favorites.length > 0 ? (
                favorites.map((item) => (
                  <div className="favorite-card" key={item.design_id}>
                    <img src={item.image_url} alt={item.name} />
                    <span>{item.name}</span>
                  </div>
                ))
              ) : (
                <p>У вас пока что нет собственных дизайнов.</p>
              )}
            </div>
          </div>
        </div>
        <div>
          <button className="but1" onClick={onGoBack}>
            На главную
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;

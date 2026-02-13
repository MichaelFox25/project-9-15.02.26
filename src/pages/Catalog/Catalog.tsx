import { useEffect, useState, useMemo } from "react";
import "./Catalog.css";
import type { Product } from "../../App";
import CaseConstructor from "../Constructor/Constructor";
import Profile from "../Profile/Profile";
import Log from "../../../public/Logo.png";

type ExtendedProduct = Product & {
  color: string;
  model: string;
  imageUrl?: string;
};
type PageTypes = "catalog" | "constructor" | "profile";
type Props = {
  cartCount: number;
  onAddToCart: (product: Product) => void;
  onGoToCart: () => void;
};

export default function CatalogPage({ cartCount, onAddToCart, onGoToCart }: Props) {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [colorFilter, setColorFilter] = useState<string>("Все");
  const [modelFilter, setModelFilter] = useState<string>("Все");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<PageTypes>("catalog");
  const [loading, setLoading] = useState(true);
  const fetchDesigns = async () => {
    try {
      const res = await fetch("https://api.vyatsu-junior.ru/design/all");
      if (!res.ok) throw new Error("Ошибка при получении дизайнов");
      const data = await res.json();
      const designs: ExtendedProduct[] = Array.isArray(data)
        ? data.map((item) => {
            const d = item.Design;
            return {
              id: d.design_id,
              name: d.name,
              price: d.product?.base_price ?? 0,
              color: d.background_color || "Без цвета",
              model: d.product?.model?.name || `Product ${d.product_id}`,
              imageUrl: d.image_url || d.product?.model?.model_photo_url || "/placeholder.png",
            };
          })
        : [];
      setProducts(designs);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDesigns();
  }, []);

  const colors = useMemo(() => ["Все", ...Array.from(new Set(products.map((p) => p.color)))], [products]);
  const models = useMemo(() => ["Все", ...Array.from(new Set(products.map((p) => p.model)))], [products]);
  const priceError = useMemo(() => {
    const min = minPrice !== "" ? Number(minPrice) : null;
    const max = maxPrice !== "" ? Number(maxPrice) : null;
    if (min !== null && min < 0) return "Минимальная цена не может быть отрицательной";
    if (max !== null && max < 0) return "Максимальная цена не может быть отрицательной";
    if (min !== null && max !== null && min > max) return "Минимальная цена не может быть больше максимальной";
    return "";
  }, [minPrice, maxPrice]);
  const filteredProducts = useMemo(() => {
    const min = minPrice !== "" ? Number(minPrice) : null;
    const max = maxPrice !== "" ? Number(maxPrice) : null;
    return products.filter((p) => {
      if (colorFilter !== "Все" && p.color !== colorFilter) return false;
      if (modelFilter !== "Все" && p.model !== modelFilter) return false;
      if (min !== null && p.price < min) return false;
      if (max !== null && p.price > max) return false;
      return true;
    });
  }, [products, colorFilter, modelFilter, minPrice, maxPrice]);
  const handleMinPriceChange = (value: string) => {
    if (value === "") return setMinPrice("");
    if (/^\d+$/.test(value)) setMinPrice(value);
  };
  const handleMaxPriceChange = (value: string) => {
    if (value === "") return setMaxPrice("");
    if (/^\d+$/.test(value)) setMaxPrice(value);
  };
  const handleGoToConstructor = () => setCurrentPage("constructor");
  const handleGoToProfile = () => setCurrentPage("profile");
  const handleGoBackToCatalog = () => setCurrentPage("catalog");
  if (loading) return <div>Загрузка...</div>;
  if (currentPage === "constructor") return <CaseConstructor onGoBack={handleGoBackToCatalog} />;
  if (currentPage === "profile") return <Profile onGoBack={handleGoBackToCatalog} />;

  return (
    <div className="page1">
      <header className="header1">
        <div className="logo"><img src={Log} width={250} /></div>
        <input className="search" placeholder="Поиск" />
        <div className="menu">
          <button className="menuBtn" onClick={handleGoToConstructor}>Конструктор</button>
          <button className="menuBtn" onClick={handleGoToProfile}>Профиль</button>
          <button className="cartBtn" onClick={onGoToCart}>Корзина ({cartCount})</button>
        </div>
      </header>
      <div className="filters">
        <div className="filterBlock">
          <label>Цвет</label>
          <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)}>
            {colors.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filterBlock">
          <label>Модель</label>
          <select value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}>
            {models.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="filterBlock">
          <label>Цена от</label>
          <input type="text" value={minPrice} onChange={(e) => handleMinPriceChange(e.target.value)} placeholder="0" />
        </div>
        <div className="filterBlock">
          <label>Цена до</label>
          <input type="text" value={maxPrice} onChange={(e) => handleMaxPriceChange(e.target.value)} placeholder="99999" />
        </div>
        <button
          className="resetBtn"
          onClick={() => {
            setColorFilter("Все");
            setModelFilter("Все");
            setMinPrice("");
            setMaxPrice("");
          }}
        >
          Сброс
        </button>
      </div>
      {priceError && (
        <div style={{
          marginTop: "15px",
          background: "#ff4f7b",
          color: "white",
          padding: "12px 20px",
          borderRadius: "15px",
          maxWidth: "1400px",
          marginLeft: "auto",
          marginRight: "auto",
          fontWeight: "bold",
        }}>
          {priceError}
        </div>
      )}
      <div className="catalog">
        {filteredProducts.map((p) => (
          <div key={p.id} className="card">
            <div className="imagePlaceholder">
              <img src={p.imageUrl || "/placeholder.png"} alt={p.name} />
            </div>
            <div className="name">{p.name}</div>
            <div className="params">
              <div>Модель: {p.model}</div>
            </div>
            <div className="price1">{p.price} ₽</div>
              <button
              className="addBtn"
              onClick={async () => {
                if (priceError) return;
                try {
                  const res = await fetch("https://api.vyatsu-junior.ru/cart/add-to-cart", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: "include", 
                    body: JSON.stringify({
                      design_id: p.id, 
                      quantity: 1,
                    }),
                  });
                  if (!res.ok) throw new Error("Ошибка при добавлении в корзину");
                  alert(`${p.name} добавлен в корзину`);
                  onAddToCart(p);
                } catch (err) {
                  console.error(err);
                  alert("Не удалось добавить товар в корзину");
                }
              }}
              disabled={!!priceError}
              style={{
                opacity: priceError ? 0.5 : 1,
                cursor: priceError ? "not-allowed" : "pointer",
              }}
            >
              Добавить
            </button>
          </div>
        ))}
        {filteredProducts.length === 0 && <p>Товары не найдены</p>}
      </div>
      <footer className="foot"></footer>
    </div>
  );
}

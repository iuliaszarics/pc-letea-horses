import { NavLink } from "react-router";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { getRestaurantsByUserAPI } from "../../services/productService";

export default function Sidebar({ onRestaurantChange }) {
  const [menuOpen, setMenuOpen] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [showRestaurantDropdown, setShowRestaurantDropdown] = useState(false);

useEffect(() => {
  async function loadRestaurants() {
    const token = localStorage.getItem("token");
    const userId = jwtDecode(token).sub;

    const result = await getRestaurantsByUserAPI(userId);
    if (result.succeeded) {
      const fetched = result.data;
      setRestaurants(fetched);
      const stored = localStorage.getItem("restaurantId");
      const validStored = fetched.find(r => r.id === stored);

      const defaultRestaurant =
        validStored?.id || (fetched.length > 0 ? fetched[0].id : null);

      if (defaultRestaurant) {
        setSelectedRestaurant(defaultRestaurant);
        localStorage.setItem("restaurantId", defaultRestaurant);
        onRestaurantChange(defaultRestaurant);
      } else {
        setSelectedRestaurant(null);
        localStorage.removeItem("restaurantId");
        onRestaurantChange(null);
      }
    }
  }

  loadRestaurants();
}, []);

  function handleRestaurantChange(e) {
    const value = e.target.value;
    setSelectedRestaurant(value);
    localStorage.setItem("restaurantId", value);
    onRestaurantChange(value);
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-white p-4 flex flex-col justify-between">
      <div>
        <div className="mb-6 relative">
          <label className="text-sm font-semibold text-gray-600">Restaurant</label>

          <button
            type="button"
            onClick={() => setShowRestaurantDropdown(!showRestaurantDropdown)}
            className="flex justify-between items-center w-full h-12 mt-1 px-4 rounded-lg border bg-white"
          >
            <span className="font-medium text-gray-700">
              {restaurants.find((r) => r.id === selectedRestaurant)?.name || "Select restaurant"}
            </span>
            <span className="material-symbols-outlined">arrow_drop_down</span>
          </button>

          {showRestaurantDropdown && (
            <ul className="absolute mt-1 bg-white border rounded shadow z-10 w-full max-h-60 overflow-auto">
              {restaurants.map((r) => (
                <li
                  key={r.id}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-200"
                  onClick={() => {
                    setSelectedRestaurant(r.id);
                    localStorage.setItem("restaurantId", r.id);
                    onRestaurantChange(r.id);
                    setShowRestaurantDropdown(false);
                  }}
                >
                  {r.name}
                </li>
              ))}
            </ul>
          )}
        </div>



        <nav className="flex flex-col gap-2">

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg ${isActive ? "bg-blue-200 text-blue-800 font-bold" : "hover:bg-blue-100"
              }`
            }
          >
            <span className="material-symbols-outlined">receipt_long</span>
            <p className="text-sm">Orders</p>
          </NavLink>

          {/* <div
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-100`}
          >
            <span className="material-symbols-outlined">receipt_long</span>
            <p className="text-sm">Orders</p>
          </div> */}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 w-full"
          >
            <span className="material-symbols-outlined">restaurant_menu</span>
            <p className="text-sm font-medium">Menu</p>
            <span className="ml-auto material-symbols-outlined">
              {menuOpen ? "expand_less" : "expand_more"}
            </span>
          </button>

          {menuOpen && (
            <div className="ml-9 flex flex-col gap-1">

              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm transition-all ${isActive ? "bg-blue-200 text-blue-800 font-bold" : "hover:bg-blue-100"

                  }`
                }
              >
                All Products
              </NavLink>
              <NavLink
                to="/restaurants"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm ${isActive ? "bg-blue-200 text-blue-800 font-bold" : "hover:bg-blue-100"
                  }`
                }
              >
                Manage Restaurants
              </NavLink>
            </div>
          )}

          {/* <NavLink
            to="/sales"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg ${isActive ? "bg-blue-200 text-blue-800 font-bold" : "hover:bg-blue-100"
              }`
            }
          >
            <span className="material-symbols-outlined">bar_chart</span>
            <p className="text-sm">Sales</p>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg ${isActive ? "bg-blue-200 text-blue-800 font-bold" : "hover:bg-blue-100"
              }`
            }
          >
            <span className="material-symbols-outlined">settings</span>
            <p className="text-sm">Settings</p>
          </NavLink> */}

          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-100`}
          >
            <span className="material-symbols-outlined">bar_chart</span>
            <p className="text-sm">Sales</p>
          </div>

          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-100`}
          >
            <span className="material-symbols-outlined">settings</span>
            <p className="text-sm">Settings</p>
          </div>
        </nav>
      </div>

    </aside>
  );
}

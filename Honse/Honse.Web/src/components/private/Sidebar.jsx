import { NavLink } from "react-router";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { getRestaurantsByUserAPI } from "../../services/productService";

export default function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");

   useEffect(() => {
    async function loadRestaurants() {
      const token = localStorage.getItem("token");
      const userId = jwtDecode(token).sub;

      const result = await getRestaurantsByUserAPI(userId);
      if (result.succeeded) {
        setRestaurants(result.data);

        const stored = localStorage.getItem("restaurantId");
        const defaultRestaurant = stored || result.data[0].id;

        setSelectedRestaurant(defaultRestaurant);
        localStorage.setItem("restaurantId", defaultRestaurant);
      }
    }

    loadRestaurants();
  }, []);

  function handleRestaurantChange(e) {
    const value = e.target.value;
    setSelectedRestaurant(value);
    localStorage.setItem("restaurantId", value);
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-surface-dark p-4 flex flex-col justify-between">
       <div>
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            Restaurant
          </label>

          <select
            className="w-full mt-1 p-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
            value={selectedRestaurant}
            onChange={handleRestaurantChange}
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
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
                to="/modifiers"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm ${isActive ? "bg-blue-200 text-blue-800 font-bold" : "hover:bg-blue-100"
                  }`
                }
              >
                Modifiers
              </NavLink>

              <NavLink
                to="/restaurants"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm ${isActive ? "bg-blue-200 text-blue-800 font-bold" : "hover:bg-blue-100"
                  }`
                }
              >
                Restaurants
              </NavLink>
            </div>
          )}

          <NavLink
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
          </NavLink>
        </nav>
      </div>

    </aside>
  );
}

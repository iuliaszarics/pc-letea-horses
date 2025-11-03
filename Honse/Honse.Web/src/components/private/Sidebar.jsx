import { NavLink } from "react-router";
import { useState } from "react";

export default function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(true);

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-surface-dark p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
            style={{
              backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBmZI0COl-kteeAUKrPxiZ4vPgGbJtkhKSKTiy4oiwkTSXC1GwuOjVU0u0ZJcl4wjIEHONKYFgHriyBBh9oiK7Ioy6S0E_qk3CnQ5vxloxPss7YjxheaH-TPG1P-jFeE-_JDzZfXYEFYI9gvyoxtAmToK4GS7lXrLF6cTxynpUcBvr61KqjeUJb3EW12Xlg4GhL9oaN-0dRpX7Txuf-ZbWyMrQ6svYsyGAxVG16BWlhLDMaxiMb6m3Pt-J7pgJa0C_u3eCAoPnuGmmc")`,
            }}
          />
          <div>
            <h1 className="text-base font-bold">The Burger Place</h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
              Restaurant
            </p>
          </div>
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

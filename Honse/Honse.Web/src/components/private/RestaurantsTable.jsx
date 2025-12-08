import { useState } from "react";
import { useNavigate } from "react-router";
import { deleteRestaurantAPI, updateRestaurantAPI } from "../../services/restaurantService";

export default function RestaurantsTable({ restaurants = [], setRestaurants }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [brokenImages, setBrokenImages] = useState({});
  const navigate = useNavigate();

  async function handleAvailabilityToggle(restaurantId) {
    const rest = restaurants.find((r) => r.id === restaurantId);
    if (!rest) return;

    const updated = { ...rest, isEnabled: !rest.isEnabled };

    // optimistic update
    setRestaurants((prev) => prev.map((r) => (r.id === restaurantId ? updated : r)));

    const result = await updateRestaurantAPI(restaurantId, updated);
    if (!result.succeeded) {
      alert(result.errorMessage || "Failed to update restaurant");
      setRestaurants((prev) => prev.map((r) => (r.id === restaurantId ? rest : r)));
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    const result = await deleteRestaurantAPI(deleteTarget.id);
    if (result.succeeded) {
      setRestaurants((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    } else {
      alert(result.errorMessage || "Failed to delete restaurant");
    }

    setDeleteTarget(null);
  }

  return (
    <div className="bg-white  rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-background-light  text-xs uppercase">
            <tr>
              <th className="p-4 w-12"></th>
              <th className="px-6 py-3">Image</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">City</th>
              <th className="px-6 py-3">Street</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Availability</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {restaurants.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  No restaurants found
                </td>
              </tr>
            )}

            {restaurants.map((r) => (
              <tr key={r.id} className="border-b border-border-light ">
                <td className="p-4"></td>

                <td className="px-6 py-3">
                  {!r.image && <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-600">No image</div>}
                  {r.image && !brokenImages[r.id] && (
                    <img
                      src={r.image}
                      alt={r.name}
                      className="h-12 w-12 rounded object-cover"
                      onError={() => setBrokenImages((prev) => ({ ...prev, [r.id]: true }))}
                    />
                  )}

                  {r.image && brokenImages[r.id] && (
                    <a href={r.image} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
                      Open link
                    </a>
                  )}
                </td>

                <td className="px-6 py-3 font-medium">{r.name}</td>

                <td className="px-6 py-3">{r.address.city}</td>

                <td className="px-6 py-3 truncate max-w-xs">{r.address.street}</td>

                <td className="px-6 py-3">{r.phone}</td>

                <td className="px-6 py-3">
                  <label className="cursor-pointer inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={!!r.isEnabled}
                      onChange={() => handleAvailabilityToggle(r.id)}
                      className="sr-only peer"
                    />

                    <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600 "></div>
                  </label>
                </td>

                <td className="px-6 py-3 space-x-3">
                  <button onClick={() => navigate(`/restaurants/edit/${r.id}`)} className="text-blue-600 hover:underline">
                    <span class="material-symbols-outlined text-lg">edit</span>
                  </button>

                  <button onClick={() => setDeleteTarget(r)} className="text-red-600 hover:underline">
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[350px] z-60">
            <h2 className="text-lg font-semibold mb-2">Confirm Delete</h2>
            <p className="text-sm text-gray-500 mb-4">Are you sure you want to delete <strong>{deleteTarget.name}</strong>?</p>

            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

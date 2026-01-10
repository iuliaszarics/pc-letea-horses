import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { addRestaurantAPI, updateRestaurantAPI, getRestaurantByIdAPI } from "../../../services/restaurantService";
import { getAllConfigurationsAPI } from "../../../services/configurationService";
import { jwtDecode } from "jwt-decode";
import UploadImage from "../../../services/cloudinaryService";

export default function AddRestaurantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState({
    name: "",
    description: "",
    street: "",
    city: "",
    postalCode: "",
    phone: "",
    email: "",
    image: "",
    cuisineType: "",
    averageRating: 0,
    totalReviews: 0,
    isEnabled: true,
    openingTime: "09:00",
    closingTime: "21:00",
    configurationId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [configurations, setConfigurations] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const configRes = await getAllConfigurationsAPI();
        if (configRes.succeeded) {
          const raw = configRes.data;
          const list = raw?.result || raw?.data || raw || [];
          if (Array.isArray(list)) {
            const normalized = list.map((c) => ({ ...c, id: String(c.id) }));
            setConfigurations(normalized);
          }
        }
      } catch (err) {
        // ignore
      }

      if (!id) {
        setLoading(false);
        return;
      }

      const result = await getRestaurantByIdAPI(id);
      if (result.succeeded) {
        if (result.data) {
          result.data = {
            ...result.data,
            city: result.data.address.city,
            postalCode: result.data.address.postalCode,
            street: result.data.address.street,
          };
        }

        const data = result.data || {};
        setRestaurant(data);
      } else {
        setError(result.errorMessage || "Failed to load restaurant");
      }

      setLoading(false);
    }

    load();
  }, [id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setRestaurant((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userId = token ? jwtDecode(token).sub : undefined;

      const payload = {
        name: restaurant.name,
        description: restaurant.description,
        address: {
          city: restaurant.city,
          postalCode: restaurant.postalCode,
          street: restaurant.street,
        },
        phone: restaurant.phone,
        email: restaurant.email,
        image: restaurant.image,
        cuisineType: restaurant.cuisineType,
        isEnabled: restaurant.isEnabled,
        openingTime: restaurant.openingTime,
        closingTime: restaurant.closingTime,
        configurationId: restaurant.configurationId || null,
        userId,
      };

      const imageURL = await UploadImage(selectedImage);

      if (imageURL !== "") {
        payload.image = imageURL;
      }

      if (!id) {
        await addRestaurantAPI(payload);
      } else {
        await updateRestaurantAPI(id, payload);
      }

      navigate("/restaurants");
    } catch (err) {
      setError("Failed to save restaurant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6">
      <h1 className="text-2xl font-bold mb-6">{id ? "Edit Restaurant" : "Add New Restaurant"}</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Name</label>
          <input name="name" value={restaurant.name || ""} onChange={handleChange} className="form-input w-full rounded-lg border border-gray-300 px-4 py-2" required />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Description</label>
          <textarea name="description" value={restaurant.description || ""} onChange={handleChange} className="form-textarea w-full rounded-lg border border-gray-300 px-4 py-2" rows={3} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">City</label>
            <input name="city" value={restaurant.city || ""} onChange={handleChange} className="form-input w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Postal Code</label>
            <input name="postalCode" value={restaurant.postalCode || ""} onChange={handleChange} className="form-input w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Phone</label>
            <input name="phone" value={restaurant.phone || ""} onChange={handleChange} className="form-input w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input name="email" type="email" value={restaurant.email || ""} onChange={handleChange} className="form-input w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Street</label>
          <input name="street" value={restaurant.street || ""} onChange={handleChange} className="form-input w-full rounded-lg border border-gray-300 px-4 py-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Cuisine Type</label>
            <input name="cuisineType" value={restaurant.cuisineType || ""} onChange={handleChange} className="form-input w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
        </div>

      <div>
        <label className="block mb-1 font-medium text-gray-700">Image</label>
        <input
          name="image"
          // value={productData.image}
          // onChange={handleChange}
          type="file"
          accept="image/*"
          onChange={(e) =>{
            const file = e.target.files?.[0];
            setSelectedImage(file ? file : null)
          }}
          className="form-input w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      { selectedImage &&
        (<img
            src={URL.createObjectURL(selectedImage)}
            width={400}
            height={400}
            className="max-h-[400px] object-fit-contain"
        />)
      }

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Opening Time</label>
            <input name="openingTime" type="time" value={restaurant.openingTime || ""} onChange={handleChange} className="form-input w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Closing Time</label>
            <input name="closingTime" type="time" value={restaurant.closingTime || ""} onChange={handleChange} className="form-input w-full rounded-lg border border-gray-300 px-4 py-2" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" name="isEnabled" checked={!!restaurant.isEnabled} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600" />
          <label className="text-gray-700">Enabled</label>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Configuration</label>
          <select
            name="configurationId"
            value={restaurant.configurationId || ""}
            onChange={handleChange}
            className="form-select w-full rounded-lg border border-gray-300 px-4 py-2"
          >
            <option value="">Select a configuration</option>
            {configurations.map((config) => (
              <option key={config.id} value={config.id}>
                {config.name}
              </option>
            ))}
          </select>
          {configurations.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">No configurations available. Create one first.</p>
          )}
        </div>

        {id && (
          <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
            <div>Average Rating: <strong>{restaurant.averageRating ?? 0}</strong></div>
            <div>Total Reviews: <strong>{restaurant.totalReviews ?? 0}</strong></div>
          </div>
        )}

        <div>
          <button type="submit" disabled={loading} className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Saving..." : id ? "Update Restaurant" : "Add Restaurant"}
          </button>
        </div>
      </form>
    </div>
  );
}

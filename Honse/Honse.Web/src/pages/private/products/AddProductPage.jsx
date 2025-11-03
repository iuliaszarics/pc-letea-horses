import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  addProductAPI,
  updateProductAPI,
  getAllCategoriesAPI,
  getProductByIdAPI,
} from "../../../services/productService";
import { jwtDecode } from "jwt-decode";

export default function AddProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    vat: "",
    image: "",
    categoryId: "",
    isEnabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [generalError, setGeneralError] = useState(""); 
  useEffect(() => {
    async function loadCategories() {
      const result = await getAllCategoriesAPI();
      if (result.succeeded) setCategories(result.data);
    }

    async function loadProduct() {
      if (!id) return;

      setLoading(true);
      try {
        const result = await getProductByIdAPI(id);
        if (result.succeeded) {
          const product = result.data;
          setProductData({
            name: product.name || "",
            description: product.description || "",
            price: product.price || "",
            vat: product.vat || "",
            image: product.image || "",
            categoryId: product.category?.id || "",
            isEnabled: product.isEnabled ?? true,
          });
        } else {
          setGeneralError(result.errorMessage || "Failed to load product data.");
        }
      } catch {
        setGeneralError("Failed to load product data.");
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
    loadProduct();
  }, [id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }
  function validateForm() {
    const errors = {};

    if (!productData.name || productData.name.length < 3)
      errors.name = "Name must be at least 3 characters.";

    if (productData.name.length > 100)
      errors.name = "Name cannot exceed 100 characters.";

    if (productData.description.length > 1000)
      errors.description = "Description cannot exceed 1000 characters.";

    if (!productData.price || parseFloat(productData.price) <= 0)
      errors.price = "Price must be greater than 0.";

    if (parseFloat(productData.vat) < 0 || parseFloat(productData.vat) > 100)
      errors.vat = "VAT must be between 0 and 100.";

    if (productData.image && !/\.(jpg|jpeg|png|webp)$/i.test(productData.image))
      errors.image = "Image URL must end with .jpg, .jpeg, .png, or .webp.";

    if (!productData.categoryId)
      errors.categoryId = "Please choose a category.";

    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors(validationErrors);
      return;
    }
    setLoading(true);
    setValidationErrors("");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: productData.name,
        userId: jwtDecode(token).sub,
        description: productData.description,
        price: parseFloat(productData.price),
        vat: parseFloat(productData.vat),
        image: productData.image,
        categoryId: productData.categoryId,
        isEnabled: productData.isEnabled,
      };

      if (!id) {
        await addProductAPI(payload);
      } else {
        await updateProductAPI(id, payload);
      }

      navigate("/products");
    } catch {
      setGeneralError("Failed to save product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md mt-6">
      <h1 className="text-2xl font-bold mb-6">{id ? "Edit Product" : "Add New Product"}</h1>

      {generalError && <p className="text-red-500 mb-4">{generalError}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Product Name</label>
          <input
            name="name"
            value={productData.name}
            onChange={handleChange}
            className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
            placeholder="Enter product name"
            required
          />
          {validationErrors?.name && <p className="text-red-500 text-sm">{validationErrors.name}</p>}
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleChange}
            className="form-textarea w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
            rows={4}
            placeholder="Enter product description"
          />
          {validationErrors?.description && <p className="text-red-500 text-sm">{validationErrors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Price</label>
            <input
              name="price"
              type="number"
              step="0.5"
              value={productData.price}
              onChange={handleChange}
              className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
              placeholder="0.00"
              required
            />
            {validationErrors?.price && <p className="text-red-500 text-sm">{validationErrors.price}</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">VAT</label>
            <input
              name="vat"
              type="number"
              step="0.5"
              value={productData.vat}
              onChange={handleChange}
              className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
              placeholder="0.00"
              required
            />
            {validationErrors?.vat && <p className="text-red-500 text-sm">{validationErrors.vat}</p>}
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Image URL</label>
          <input
            name="image"
            value={productData.image}
            onChange={handleChange}
            className="form-input w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
            placeholder="https://example.com/image.jpg"
          />
          {validationErrors?.image && <p className="text-red-500 text-sm">{validationErrors.image}</p>}
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Category</label>
          <select
            name="categoryId"
            value={productData.categoryId}
            onChange={handleChange}
            className="form-select w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="">-- Choose Category --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {validationErrors?.categoryId && <p className="text-red-500 text-sm">{validationErrors.categoryId}</p>}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isEnabled"
            checked={productData.isEnabled}
            onChange={handleChange}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <label className="text-gray-700 dark:text-gray-300">Available</label>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Saving..." : id ? "Update Product" : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

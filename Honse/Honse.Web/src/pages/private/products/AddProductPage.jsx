import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  addProductAPI,
  updateProductAPI,
  getProductByIdAPI,
  getAllCategoriesAPI,
} from "../../../services/productService";
import { jwtDecode } from "jwt-decode";
import UploadImage from "../../../services/cloudinaryService";

export default function AddProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    vat: "0",
    image: "",
    categoryId: "",
    newCategoryName: "",
    isNewCategory: false,
    isEnabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [generalError, setGeneralError] = useState(""); 

  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
   async function loadCategories() {
      //const restaurantId = localStorage.getItem("restaurantId");
      const result = await getAllCategoriesAPI();
      if (result.succeeded) {
        setCategories(result.data);
      }
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
            vat: product.vat?.toString() || "0",
            image: product.image || "",
            categoryId: product.category?.id || "",
            newCategoryName: "",
            isNewCategory: false,
            isEnabled: product.isEnabled,
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

    if (!["0", "5", "11", "21"].includes(productData.vat))
      errors.vat = "Invalid VAT selection.";

    if (!productData.isNewCategory && !productData.categoryId)
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
      //const restaurantId = localStorage.getItem("restaurantId");
      const categoryName = productData.isNewCategory
      ? productData.newCategoryName
      : categories.find(c => c.id === productData.categoryId)?.name || "";
     
      const payload = {
        ...(id && { id }),
        name: productData.name,
        userId: jwtDecode(token).sub,
        description: productData.description,
        price: parseFloat(productData.price),
        vat: parseFloat(productData.vat),
        image: productData.image,
        ...(!productData.isNewCategory && { categoryId: productData.categoryId }),
        categoryName,
        isEnabled: productData.isEnabled,
      };
      const imageURL = await UploadImage(selectedImage);

      if (imageURL !== "") {
        payload.image = imageURL;
      }

      if (!id) {
        await addProductAPI(payload);
      } else {
        await updateProductAPI(payload);
      }

      navigate("/products");
    } catch {
      setGeneralError("Failed to save product.");
    } finally {
      setLoading(false);
    }
  }

 return (
  <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6">
    <h1 className="text-2xl font-bold mb-6">{id ? "Edit Product" : "Add New Product"}</h1>

    {generalError && <p className="text-red-500 mb-4">{generalError}</p>}

    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block mb-1 font-medium text-gray-700">Product Name</label>
        <input
          name="name"
          value={productData.name}
          onChange={handleChange}
          className="form-input w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Enter product name"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={productData.description}
          onChange={handleChange}
          className="form-textarea w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          rows={4}
          placeholder="Enter product description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Price</label>
          <input
            name="price"
            type="number"
            step="0.5"
            value={productData.price}
            onChange={handleChange}
            className="form-input w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">VAT</label>
          <select
            name="vat"
            value={productData.vat}
            onChange={handleChange}
            className="form-select w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          >
            {["0", "5", "11", "21"].map((v) => (
              <option key={v} value={v}>
                {v}%
              </option>
            ))}
          </select>
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

      <div className="flex items-center gap-3 mb-3">
        <input
          type="checkbox"
          name="isNewCategory"
          checked={productData.isNewCategory}
          onChange={handleChange}
          className="form-checkbox h-5 w-5 text-blue-600"
        />
        <label className="text-gray-700">New Category</label>
      </div>

      {productData.isNewCategory ? (
        <div>
          <label className="block mb-1 font-medium text-gray-700">Category Name</label>
          <input
            name="newCategoryName"
            value={productData.newCategoryName}
            onChange={handleChange}
            className="form-input w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter category name"
          />
        </div>
      ) : (
        <div>
          <label className="block mb-1 font-medium text-gray-700">Category</label>
          <select
            name="categoryId"
            value={productData.categoryId}
            onChange={handleChange}
            className="form-select w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          >
            <option value="">-- Choose Category --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

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

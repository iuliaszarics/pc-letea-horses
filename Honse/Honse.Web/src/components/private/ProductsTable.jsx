import { useState } from "react";
import { useNavigate } from "react-router";
import { deleteProductAPI, updateProductAPI } from "../../services/productService";

export default function ProductsTable({ products = [], setProducts }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  async function handleAvailabilityToggle(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const updatedProduct = {
      id: product.id,
      userId: product.userId,
      restaurantId: product.restaurantId,
      name: product.name,
      description: product.description,
      price: product.price,
      vat: product.vat,
      image: product.image,
      categoryId: product.category.id,
      categoryName: product.category.name,
      isEnabled: !product.isEnabled
    };

    product.isEnabled = !product.isEnabled
    setProducts(products.map(p => p.id === productId ? product : p));


    const result = await updateProductAPI(updatedProduct);
    if (!result.succeeded) {
      alert(result.errorMessage || "Failed to update availability");
      setProducts(products);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    const result = await deleteProductAPI(deleteTarget.id);
    if (result.succeeded) {
      setProducts((prev) => prev.filter(p => p.id !== deleteTarget.id));
    } else {
      alert(result.errorMessage || "Failed to delete product");
    }
    setDeleteTarget(null);

  }
  return (
    <div className="bg-white  rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-background-light  text-xs uppercase">
            <tr>
              <th className="p-4 w-12">
              </th>
              <th className="px-6 py-3">Image</th>
              <th className="px-6 py-3">Product Name</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Availability</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  No products found
                </td>
              </tr>
            )}

            {products.map((product) => (
              <tr key={product.id} className="border-b border-border-light ">
                <td className="p-4">
                </td>

                <td className="px-6 py-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                </td>

                <td className="px-6 py-3 font-medium">{product.name}</td>

                <td className="px-6 py-3">{product.category?.name}</td>

                <td className="px-6 py-3">${product.price}</td>

                <td className="px-6 py-3 truncate max-w-xs">{product.description}</td>

                <td className="px-6 py-3">
                  <label className="cursor-pointer inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={product.isEnabled}
                      onChange={() => handleAvailabilityToggle(product.id)}
                      className="sr-only peer"
                    />

                    <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600 "></div>
                  </label>
                </td>

                <td className="px-6 py-3 space-x-3">
                  <button
                    onClick={() => navigate(`/products/edit/${product.id}`)}
                    className="text-blue-600 hover:underline">
                    <span class="material-symbols-outlined text-lg">edit</span>
                  </button>

                  <button
                    onClick={() => setDeleteTarget(product)}
                    className="text-red-600 hover:underline"
                  >
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white  p-6 rounded-lg shadow-xl w-[350px]">
            <h2 className="text-lg font-semibold mb-2">Confirm Delete</h2>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

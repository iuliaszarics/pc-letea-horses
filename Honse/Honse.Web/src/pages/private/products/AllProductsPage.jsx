import Sidebar from "../../../components/private/Sidebar"
import Header from "../../../components/private/Header"
import Filters from "../../../components/private/Filters"
import ProductsTable from "../../../components/private/ProductsTable"
import { getProductsAPI, getCategoriesByRestaurantAPI } from "../../../services/productService";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function AllProductsPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [isActive, setIsActive] = useState(undefined);
  const [userId, setUserId] = useState("");
  const [categories, setCategories] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(4);
  const [totalCount, setTotalCount] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [restaurantId, setRestaurantId] = useState(localStorage.getItem("restaurantId"));
  useEffect(() => {
    async function loadCategories() {
      const result = await getCategoriesByRestaurantAPI(restaurantId);
      if (result.succeeded) {
        setCategories(result.data);
      }
    }

    async function loadProducts() {
      const token = localStorage.getItem("token");
      if (!token) return;

      const userId = jwtDecode(token).sub;
      const result = await getProductsAPI({
        userId,
        restaurantId,
        categoryId,
        isActive,
        searchKey,
        minPrice,
        maxPrice,
        pageSize,
        pageNumber,
      });

      if (result.succeeded) {
        setProducts(result.products);
        setTotalCount(result.totalCount);
      } else {
        setError(result.errorMessage);
      }
    }
    loadCategories();
    loadProducts();

  }, [userId, restaurantId, categoryId, searchKey, isActive, pageNumber, minPrice, maxPrice]);
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onRestaurantChange={setRestaurantId}/>
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <Header selectedRestaurant={restaurantId} />
          <Filters
            categoryName={categoryName}
            setCategoryName={setCategoryName}
            setCategoryId={setCategoryId}
            searchKey={searchKey}
            setSearchKey={setSearchKey}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            isActive={isActive}
            setIsActive={setIsActive}
            categories={categories}
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <ProductsTable products={products} setProducts={setProducts} />
          <div className="flex justify-center items-center mt-4 gap-2">
            <button
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
              disabled={pageNumber === 1}
              className="px-3 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-70"
            >
              Previous
            </button>

            <span className="px-3 py-1">
              Page {pageNumber} of {Math.ceil(totalCount / pageSize) || 1}
            </span>

            <button
              onClick={() =>
                setPageNumber((prev) =>
                  prev < Math.ceil(totalCount / pageSize) ? prev + 1 : prev
                )
              }
              disabled={pageNumber >= Math.ceil(totalCount / pageSize)}
              className="px-3 py-1 rounded  bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-70"
            >
              Next
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

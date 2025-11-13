import { useState } from "react";
export default function Filters({

  categoryName,
  setCategoryName,
  setCategoryId,
  searchKey,
  setSearchKey,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  isActive,
  setIsActive,
  categories,
}) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAvailabilityDropdown, setShowAvailabilityDropdown] = useState(false);


  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">

      <div className="flex-1">
        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full items-stretch rounded-lg h-full">
            <div className="flex items-center justify-center aspect-square h-12 rounded-l-lg border border-border-light border-r-0 bg-surface-light">
              <span className="material-symbols-outlined text-text-secondary-light leading-none text-[20px]">
                search
              </span>
            </div>
            <input
              className="form-input flex flex-1 rounded-r-lg border border-border-light  bg-surface-light  px-4 text-base focus:outline-0 focus:ring-2 focus:ring-secondary"
              placeholder="Search products"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
            />
          </div>
        </label>
      </div>

      <div className="flex gap-3">
        <div className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex h-12 items-center gap-x-2 rounded-lg bg-surface-light border border-border-light px-4"
          >
            <span className="material-symbols-outlined text-text-secondary-light ">category</span>
            <p className="text-sm font-medium">{categoryName || "Category"}</p>
            <span className="material-symbols-outlined">arrow_drop_down</span>
          </button>

          {showCategoryDropdown && (
            <ul className="absolute mt-1 bg-white  border border-border-light  rounded shadow z-10 w-full">
              <li
                className="px-4 py-2 cursor-pointer hover:bg-blue-200"
                onClick={() => {
                  setCategoryName("");
                  setCategoryId("");

                  setShowCategoryDropdown(false);
                }}
              >
                All
              </li>
              {categories.map((cat) => (
                <li
                  key={cat}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-200"
                  onClick={() => {
                    setCategoryName(cat.name);
                    setCategoryId(cat.id);
                    setShowCategoryDropdown(false);
                  }}
                >
                  {cat.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowAvailabilityDropdown(!showAvailabilityDropdown)}
            className="flex h-12 items-center gap-x-2 rounded-lg bg-surface-light border border-border-light  px-4"
          >
            <span className="material-symbols-outlined">toggle_on</span>
            <p className="text-sm font-medium">
              {isActive === true ? "Active" : isActive === false ? "Inactive" : "Availability"}
            </p>
            <span className="material-symbols-outlined">arrow_drop_down</span>
          </button>

          {showAvailabilityDropdown && (
            <ul className="absolute mt-1 bg-white  border rounded shadow z-10 w-full">
              <li className="px-4 py-2 cursor-pointer hover:bg-blue-200" onClick={() => {setIsActive(true); setShowAvailabilityDropdown(false);}}>Active</li>
              <li className="px-4 py-2 cursor-pointer hover:bg-blue-200" onClick={() => {setIsActive(false); setShowAvailabilityDropdown(false);}}>Inactive</li>
              <li className="px-4 py-2 cursor-pointer hover:bg-blue-200" onClick={() => {setIsActive(undefined); setShowAvailabilityDropdown(false);}}>All</li>
            </ul>
          )}
        </div>

        {/* PRICE FILTERS */}
        <input
          type="number"
          className="w-24 rounded-lg border px-3"
          placeholder="Min $"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
        />

        <input
          type="number"
          className="w-24 rounded-lg border px-3"
          placeholder="Max $"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>
    </div>

  );
}

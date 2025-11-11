import {useState} from "react";
export default function Filters({

  categoryName,
  setCategoryName,
  searchKey,
  setSearchKey,
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
            <div className="flex items-center justify-center pl-4 rounded-l-lg border border-border-light dark:border-border-dark border-r-0 bg-surface-light dark:bg-surface-dark">
              <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">search</span>
            </div>
             <input
              className="form-input flex flex-1 rounded-r-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 text-base focus:outline-0 focus:ring-2 focus:ring-secondary"
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
            className="flex h-12 items-center gap-x-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark px-4"
          >
            <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">category</span>
            <p className="text-sm font-medium">{categoryName || "Category"}</p>
            <span className="material-symbols-outlined">arrow_drop_down</span>
          </button>

          {showCategoryDropdown && (
            <ul className="absolute mt-1 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded shadow z-10 w-full">
              <li
                className="px-4 py-2 cursor-pointer hover:bg-blue-200"
                onClick={() => {
                  setCategoryName("");       // empty string means no filter
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
                    setCategoryName(cat === "All" ? "" : cat);
                    setShowCategoryDropdown(false);
                  }}
                >
                  {cat}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowAvailabilityDropdown(!showAvailabilityDropdown)}
            className="flex h-12 items-center gap-x-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark px-4"
          >
            <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">toggle_on</span>
            <p className="text-sm font-medium">
              {isActive === true ? "Active" : isActive === false ? "Inactive" : "Availability"}
            </p>
            <span className="material-symbols-outlined">arrow_drop_down</span>
          </button>

          {showAvailabilityDropdown && (
            <ul className="absolute mt-1 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded shadow z-10 w-full">
              <li
                className="px-4 py-2 cursor-pointer hover:bg-blue-200"
                onClick={() => {
                  setIsActive(true);
                  setShowAvailabilityDropdown(false);
                }}
              >
                Active
              </li>
              <li
                className="px-4 py-2 cursor-pointer hover:bg-blue-200"
                onClick={() => {
                  setIsActive(false);
                  setShowAvailabilityDropdown(false);
                }}
              >
                Inactive
              </li>
              <li
                className="px-4 py-2 cursor-pointer hover:bg-blue-200"
                onClick={() => {
                  setIsActive(undefined);
                  setShowAvailabilityDropdown(false);
                }}
              >
                All
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

import Sidebar from "../../../components/private/Sidebar";
import Header from "../../../components/private/Header";
import ConfigurationsTable from "../../../components/private/ConfigurationsTable";
import { getConfigurationsAPI } from "../../../services/configurationService";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function AllConfigurationsPage() {
  const [configurations, setConfigurations] = useState([]);
  const [error, setError] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchKey, setSearchKey] = useState("");

  useEffect(() => {
    async function loadConfigurations() {
      const token = localStorage.getItem("token");
      if (!token) return;
      const userId = jwtDecode(token).sub;
      const result = await getConfigurationsAPI({ userId, searchKey, pageNumber, pageSize });
      if (result.succeeded) {
        setConfigurations(result.configurations || []);
        setTotalCount(result.totalCount || 0);
      } else {
        setError(result.errorMessage || "Failed to load configurations.");
      }
    }
    loadConfigurations();
  }, [pageNumber, searchKey, pageSize]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onRestaurantChange={() => {}} />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <Header title="Configuration Management" addPath="/configurations/add" addLabel="Add New Configuration" />
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="flex mb-6">
            <label className="flex flex-col min-w-40 h-12 w-full">
              <div className="flex w-full items-stretch rounded-lg h-full">
                <div className="flex items-center justify-center aspect-square h-12 rounded-l-lg border border-border-light border-r-0 bg-surface-light">
                  <span className="material-symbols-outlined text-text-secondary-light leading-none text-[20px]">
                    search
                  </span>
                </div>
                <input
                  className="form-input flex flex-1 rounded-r-lg border border-border-light  bg-surface-light  px-4 text-base focus:outline-0 focus:ring-2 focus:ring-secondary"
                  placeholder="Search configuration"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                />
              </div>
            </label>
          </div>

          <ConfigurationsTable configurations={configurations} setConfigurations={setConfigurations} />

          <div className="flex justify-center items-center mt-4 gap-2">
            <button
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
              disabled={pageNumber === 1}
              className="px-3 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-70"
            >
              Previous
            </button>

            <span className="px-3 py-1">Page {pageNumber} of {Math.ceil(totalCount / pageSize) || 1}</span>

            <button
              onClick={() => setPageNumber((prev) => prev + 1)}
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

import { useState } from "react";
import { useNavigate } from "react-router";
import { deleteConfigurationAPI } from "../../services/configurationService";

export default function ConfigurationsTable({ configurations = [], setConfigurations }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const navigate = useNavigate();

  async function confirmDelete() {
    if (!deleteTarget) return;

    setDeleteError("");
    const result = await deleteConfigurationAPI(deleteTarget.id);
    if (result.succeeded) {
      setConfigurations((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } else {
      setDeleteError(result.errorMessage || "Failed to delete configuration");
    }
  }

  return (
    <div className="bg-white  rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-background-light  text-xs uppercase">
            <tr>
              <th className="p-4 w-12"></th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Categories Count</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {configurations.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No configurations found
                </td>
              </tr>
            )}

            {configurations.map((c) => (
              <tr key={c.id} className="border-b border-border-light ">
                <td className="p-4"></td>

                <td className="px-6 py-3 font-medium">{c.name}</td>

                <td className="px-6 py-3">
                  {Array.isArray(c.categoryIds) ? c.categoryIds.length : 0}
                </td>

                <td className="px-6 py-3 space-x-3">
                  <button
                    onClick={() => navigate(`/configurations/edit/${c.id}`)}
                    className="text-blue-600 hover:underline"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>

                  <button
                    onClick={() => {
                      setDeleteTarget(c);
                      setDeleteError("");
                    }}
                    className="text-red-600 hover:underline"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
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
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
            </p>

            {deleteError && <p className="text-red-500 mb-4 text-sm">{deleteError}</p>}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteError("");
                }}
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

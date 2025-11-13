import { useNavigate } from "react-router";

export default function Header({ title = "Menu Management", addPath = "/products/add", addLabel = "Add New Product", selectedRestaurant }) {
  
  const navigate = useNavigate();
   const isDisabled = !selectedRestaurant; 
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-4xl font-black tracking-tight">{title}</h1>

      {addPath && (
        <button>
          onClick={() => !isDisabled && navigate(addPath)}
           disabled={isDisabled}
          className={`flex items-center gap-2 rounded-lg h-10 px-4 text-white text-sm font-bold transition
          ${isDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"}`}
          <span className="material-symbols-outlined">add</span>
          <span>{addLabel}</span>
        </button>
      )}
    </div>
  );
}

import { useNavigate } from "react-router";


export default function Header({ selectedRestaurant }) {
  const navigate = useNavigate();
   const isDisabled = !selectedRestaurant; 
  return (
   <div className="flex justify-between items-center mb-6">
  <h1 className="text-4xl font-black tracking-tight">Menu Management</h1>

  <button
        onClick={() => !isDisabled && navigate("/products/add")}
        disabled={isDisabled}
        className={`flex items-center gap-2 rounded-lg h-10 px-4 text-white text-sm font-bold transition
          ${isDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"}`}
      >
        <span className="material-symbols-outlined">add</span>
        <span>Add New Product</span>
      </button>
</div>
  );
}

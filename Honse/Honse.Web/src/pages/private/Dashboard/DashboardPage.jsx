import { useEffect, useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { getDashboardDataAPI } from '../../../services/dashboardService';
import { jwtDecode } from "jwt-decode";
import { getRestaurantsByUserAPI } from "../../../services/productService";
import Sidebar from '../../../components/private/Sidebar';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const [range, setRange] = useState('lastDay');
  const [data, setData] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showCustom, setShowCustom] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);


  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showRestaurantDropdown, setShowRestaurantDropdown] = useState(false);

  const isLoading = restaurantId && !data;
  const hasData = data?.succeeded;
  useEffect(() => {
    async function loadRestaurants() {
      const token = localStorage.getItem("token");
      if (!token) return;

      const userId = jwtDecode(token).sub;
      const res = await getRestaurantsByUserAPI(userId);

      if (res.succeeded) {
        setRestaurants(res.data);
        const defaultId = res.data[0]?.id || null;
        setSelectedRestaurant(defaultId);
        setRestaurantId(defaultId);
      }
    };

    loadRestaurants();
  }, []);

  useEffect(() => {
    if (!restaurantId) return;
    getDashboardDataAPI(restaurantId, startDate, endDate).then(setData);
  }, [restaurantId, startDate, endDate]);

  const tailwindColors = [
    '#3b82f6', '#f97316', '#14b8a6', '#1d4ed8', '#f59e0b', '#0891b2', '#10b981', '#ea580c', '#38bdf8', '#fb923c'
  ];



  const lineChartData = hasData
    ? {
      labels: data.data.lineChart.timeline.map(t => t.label),
      datasets: [
        {
          label: 'Sales',
          data: data.data.lineChart.timeline.map(t => t.sales),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.2)',
          tension: 0.3
        }
      ]
    }
    : null;

  const doughnutOptions = hasData
    ? {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              const cat = data.data.categories[tooltipItem.dataIndex];
              return `${cat.name}: ${cat.sales} sales`;
            }
          }
        }
      }
    }
    : null;

  const doughnutData = hasData
    ? {
      labels: data.data.categories.map(c => c.name),
      datasets: [
        {
          data: data.data.categories.map(c => c.sales),
          backgroundColor: data.data.categories.map(
            (_, idx) => tailwindColors[idx % tailwindColors.length]
          ),
        }
      ]
    }
    : null;


  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onRestaurantChange={(id) => {
        setSelectedRestaurant(id);
        setRestaurantId(id);
      }} />
      <main className="flex-1 p-8">
        <div className="px-4 sm:px-6 lg:px-10 py-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <p className="text-3xl font-black">Dashboard</p>

          <div className="flex gap-2 p-1  bg-gray-100  rounded-lg">
            {['lastDay', 'lastWeek', 'lastMonth', 'lastQuarter'].map((r) => (
              <button
                key={r}
                className={`flex h-9 items-center justify-center px-4 rounded-md ${r === range ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
                  }`}
                onClick={() => {
                  setRange(r);
                  setShowCustom(false);

                  const now = new Date();
                  let start, end;

                  if (r === "lastDay") {
                    start = new Date(now.setHours(0, 0, 0, 0));
                    end = new Date(now.setHours(23, 59, 59, 999));
                  }
                  if (r === "lastWeek") {
                    start = new Date(now.setDate(now.getDate() - 6));
                    start.setHours(0, 0, 0, 0);
                    end = new Date();
                    end.setHours(23, 59, 59, 999);
                  }
                  if (r === "lastMonth") {
                    start = new Date(now.setDate(now.getDate() - 29));
                    start.setHours(0, 0, 0, 0);
                    end = new Date();
                    end.setHours(23, 59, 59, 999);
                  }
                  if (r === "lastQuarter") {
                    start = new Date(now.setDate(now.getDate() - 89));
                    start.setHours(0, 0, 0, 0);
                    end = new Date();
                    end.setHours(23, 59, 59, 999);
                  }
                  setStartDate(start);
                  setEndDate(end);
                }}

              >
                {r.replace(/last/, 'Last ')}
              </button>
            ))}

            {range === 'customRange' ? (
              <div className="flex gap-2">

                <label className="text-xs text-gray-500 ">Start</label>
                <input
                  type="date"
                  className="border rounded px-2 py-1"
                  value={tempStartDate.toISOString().split("T")[0]}
                  onChange={e => setTempStartDate(new Date(e.target.value))}
                />


                <label className="text-xs text-gray-500 ">End</label>
                <input
                  type="date"
                  className="border rounded px-2 py-1"
                  value={tempEndDate.toISOString().split("T")[0]}
                  onChange={e => setTempEndDate(new Date(e.target.value))}
                />

                <button
                  className="bg-blue-600 text-white rounded px-3 py-1 self-end"
                  onClick={() => {
                    const today = new Date();
                    if (tempStartDate > tempEndDate) {
                      alert("Start date cannot be after end date");
                      return;
                    }
                    if (tempStartDate > today || tempEndDate > today) {
                      alert("Dates cannot be in the future");
                      return;
                    }

                    // Commit temporary dates to actual state
                    setStartDate(tempStartDate);
                    setEndDate(tempEndDate);
                  }}
                >
                  Apply
                </button>
              </div>

            ) : (
              <button
                key="customRange"
                className={`flex h-9 items-center justify-center px-4 rounded-md ${range === 'customRange' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 '}`}
                onClick={() => {
                  setRange('customRange');
                  setTempStartDate(startDate); // Reset temporary dates to current range
                  setTempEndDate(endDate);
                }}
              >
                Custom Range
              </button>
            )}
          </div>
        </div>
      </div>
      {!hasData && !isLoading && (
        <div className="text-center py-20 text-gray-500  text-lg font-medium">
          No data for the selected range.
        </div>
      )}
      {hasData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 mb-6">
            {[
              { title: 'Total Revenue', value: `$${data.data.stats.totalRevenue}` },
              { title: 'New Orders', value: data.data.stats.newOrders },
              { title: 'Completed Orders', value: data.data.stats.completedOrders },
            ].map((stat) => (
              <div key={stat.title} className="flex flex-col items-center gap-2 p-6 rounded-xl bg-white  border border-gray-200 ">
                <p className="text-sm text-gray-500 ">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Line chart */}
            <div className="lg:col-span-2 p-6 bg-white  border border-gray-200  rounded-xl">
              <p className="text-lg font-semibold mb-4">Sales Over Time</p>
              <Line data={lineChartData} />
            </div>

            {/* Doughnut chart */}
            <div className="flex flex-col p-6 bg-white  border border-gray-200  rounded-xl">
              <p className="text-lg font-semibold mb-4">Sales by Category</p>
              <div className="flex justify-center items-center h-48 mb-4">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {data.data.categories.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tailwindColors[idx % tailwindColors.length] }}
                    ></div>
                    <p className="text-sm font-medium">{cat.name} ({cat.percent}%)</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Selling Products Table */}
          <div className="p-6 bg-white  border border-gray-200  rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 ">
                    <th className="py-3 px-4 text-sm font-semibold text-gray-500 ">Product</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-500  text-right">Total Items Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.topProducts.map((prod) => (
                    <tr key={prod.name} className="border-b border-gray-200 ">
                      <td className="py-3 px-4 flex items-center gap-4">
                        <img className="w-12 h-12 rounded-md object-cover" src={prod.image} alt={prod.name} />
                        <div>
                          <p className="font-semibold">{prod.name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">{prod.totalSales}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      </main>
    </div>
  );
}

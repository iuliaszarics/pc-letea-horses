// src/pages/RestaurantMenuPage.jsx
import React from "react";

const restaurant = {
  name: "Lea’s Bistro",
  image: "https://images.unsplash.com/photo-1555992336-cbfdd1b2d8f5",
  hours: "Mon - Sun: 10:00 AM - 10:00 PM",
};

const menu = [
  {
    category: "Starters",
    items: [
      {
        name: "Bruschetta",
        description: "Grilled bread topped with diced tomatoes, garlic, and basil.",
        price: 8.5,
        image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
      },
      {
        name: "Garlic Shrimp",
        description: "Pan-fried shrimp with garlic butter and parsley.",
        price: 12.0,
        image: "https://images.unsplash.com/photo-1603052877339-f0b9f6f9e6f2",
      },
    ],
  },
  {
    category: "Main Dishes",
    items: [
      {
        name: "Ribeye Steak",
        description: "Juicy ribeye served with roasted potatoes and grilled veggies.",
        price: 24.99,
        image: "https://images.unsplash.com/photo-1601924582971-d9f1d7e6b3c1",
      },
      {
        name: "Spaghetti Carbonara",
        description: "Classic Italian pasta with pancetta, eggs, and parmesan.",
        price: 15.5,
        image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3",
      },
    ],
  },
  {
    category: "Desserts",
    items: [
      {
        name: "Tiramisu",
        description: "Coffee-soaked ladyfingers layered with mascarpone cream.",
        price: 7.5,
        image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f",
      },
    ],
  },
];

export default function RestaurantMenuPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="relative w-full h-64">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white">
          <h1 className="text-4xl font-bold">{restaurant.name}</h1>
          <p className="text-lg mt-2">{restaurant.hours}</p>
        </div>
      </header>

      {/* Menu */}
      <main className="max-w-6xl mx-auto py-12 px-6">
        {menu.map((section) => (
          <div key={section.category} className="mb-10">
            <h2 className="text-2xl font-semibold border-b-2 border-gray-300 pb-2 mb-6">
              {section.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item) => (
                <div
                  key={item.name}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <span className="text-sm font-bold text-green-600">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

"use client";

import React, { useState } from "react";

// ============================================================================
// REMOTE COFFEE MENU (Easter Egg)
// ============================================================================
// Hidden menu from Remote Coffee — a local coffee shop.
// Discovered via terminal command, Konami code, or secret click.
// ============================================================================

type Category = "tacos" | "bakery" | "empanadas" | "classics" | "spring" | "matcha" | "cold" | "refreshers";

interface MenuItem {
  name: string;
  price: string;
  desc?: string;
  isNew?: boolean;
}

const MENU: Record<Category, { title: string; items: MenuItem[] }> = {
  tacos: {
    title: "🌯 Breakfast Tacorritos",
    items: [
      { name: "#1 The Beanie", price: "$3.29", desc: "Refried black beans, shredded cheddar", isNew: true },
      { name: "#2 La Abuela", price: "$3.70", desc: "Scrambled eggs, grilled hotdog, cheese, avocado" },
      { name: "#3 The Cruncher", price: "$3.99", desc: "Refried black beans, cheddar, tater tots", isNew: true },
      { name: "#4 The CET Express", price: "$4.25", desc: "Chorizo, cheese, tater tots" },
      { name: "#5 The Ranchero", price: "$4.99", desc: "Pork chorizo or sausage, shredded cheddar" },
      { name: "#6 The EC", price: "$4.00", desc: "Scrambled eggs, shredded cheddar" },
      { name: "#7 The BEC", price: "$4.89", desc: "Scrambled eggs, bacon, cheddar" },
      { name: "#8 The Tater Stack", price: "$4.50", desc: "Smashed tater tots, shredded cheddar" },
      { name: "#9 The Cowboy", price: "$6.25", desc: "Scrambled eggs, asada, cheddar" },
      { name: "#10 The Perfect Passenger", price: "$6.75", desc: "Tator tots, avocado, asada, cheddar" },
    ],
  },
  bakery: {
    title: "🧁 Bakery",
    items: [
      { name: "Blueberry Muffin", price: "$4.25" },
      { name: "Cinnamon Muffin", price: "$4.25" },
      { name: "Banana Nut Muffin", price: "$4.25", isNew: true },
      { name: "Chocolate Chip Muffin", price: "$4.25" },
      { name: "Red Velvet Muffin", price: "$4.50", isNew: true },
      { name: "Croissant & Choc Croissant", price: "$4.00 | $4.50" },
      { name: "Chocolate Chip Cookie", price: "$3.50/2" },
      { name: "Cheese Danish", price: "$4.00" },
      { name: "Churro Donut", price: "$3.75", isNew: true },
    ],
  },
  empanadas: {
    title: "🥟 Empanadas",
    items: [
      { name: "Chicken", price: "$4.75" },
      { name: "Spicy Beef", price: "$4.75" },
      { name: "Beans & Cheese", price: "$4.25" },
      { name: "Spinach & Mushroom", price: "$4.25" },
      { name: "Peperoni Pizza", price: "$4.75" },
    ],
  },
  classics: {
    title: "☕ Classics",
    items: [
      { name: "Espresso", price: "$3.75" },
      { name: "Café de Olla", price: "$4.50 | $4.99 | $5.25" },
      { name: "Latte with 1 Flavor", price: "$5.15 | $6.05 | $6.35" },
      { name: "Americano", price: "$4.25 | $4.55 | $4.75" },
      { name: "Cappuccino", price: "$4.59 | $5.29 | $5.79" },
      { name: "Hot Chocolate", price: "$3.25 | $3.95 | $4.45" },
      { name: "Chai Latte", price: "$4.75 | $4.95 | $5.45" },
      { name: "Matcha Latte", price: "$5.75 | $7.00 | $8.00", desc: "+$1.99 ceremonial" },
      { name: "Drip Coffee", price: "$2.99 | $3.29 | $3.75" },
    ],
  },
  spring: {
    title: "🌸 Spring Menu",
    items: [
      { name: "Café de Olla Latte", price: "$6.75", desc: "Orange zest latte, café de olla cold foam", isNew: true },
      { name: "Flantastic Latte", price: "$6.75", desc: "Caramel latte, flan sweet cream foam" },
      { name: "Sopapilla Latte", price: "$7.00", desc: "Honey, cinnamon cream", isNew: true },
      { name: "Horchata Latte", price: "$7.00", desc: "House-made horchata, espresso, cinnamon" },
      { name: "Dulce de Leche Latte", price: "$7.00", desc: "Caramel dulce milk, whipped cream" },
      { name: "Avocado Choc Latte", price: "$7.00" },
      { name: "Pistachio Butter Cream Latte", price: "$7.00" },
      { name: "Flantastic Brew", price: "$6.00" },
    ],
  },
  matcha: {
    title: "🍵 Matcha Bar",
    items: [
      { name: "Strawberry Matcha", price: "$7.00", desc: "Sweet matcha, strawberry puree, freeze-dried berries" },
      { name: "Sky & Earth", price: "$8.50", desc: "Ceremonial matcha, vanilla milk, butterfly pea foam", isNew: true },
      { name: "Banana Matcha", price: "$7.00", desc: "Sweet matcha, banana cream foam" },
      { name: "Trio Matcha", price: "$8.50", desc: "Ceremonial matcha, cherry blossom milk, butterfly pea tea", isNew: true },
      { name: "Pretty in Pink", price: "$7.00", desc: "Sakura matcha, dragonfruit cream", isNew: true },
      { name: "Blue Sky", price: "$7.00", desc: "Butterfly pea, citrus twist" },
    ],
  },
  cold: {
    title: "🧊 Cold Brew",
    items: [
      { name: "Mexican Vanilla Brew", price: "$6.50", desc: "Vanilla sweet cream, cinnamon dulce dust" },
      { name: "Cold & Salty Brew", price: "$6.00", desc: "Vanilla cold brew, salted caramel foam", isNew: true },
      { name: "Brew-Ho", price: "$6.50", desc: "Horchata cold brew" },
      { name: "Pistachio Cold", price: "$6.50", desc: "Pistachio sweet cream" },
      { name: "Nitro Cold Brew", price: "$6.00" },
      { name: "Cold Brew", price: "$5.50" },
    ],
  },
  refreshers: {
    title: "🍋 Refreshers",
    items: [
      { name: "Horchata", price: "$5.00", desc: "Cinnamon rice, optional flan cold foam" },
      { name: "Strawberry Lemon", price: "$5.00" },
      { name: "Orange Pineapple Vanilla", price: "$7.00", desc: "Tropical cream", isNew: true },
      { name: "Mango", price: "$5.00", desc: "Orange, turmeric, ginger, black pepper" },
      { name: "Cucumber Lime", price: "$5.00", desc: "Fresh agua fresca" },
      { name: "Iced Black Tea", price: "$5.00" },
    ],
  },
};

const CATEGORIES: Category[] = ["tacos", "bakery", "empanadas", "classics", "spring", "matcha", "cold", "refreshers"];

export default function RemoteCoffeeApp() {
  const [activeTab, setActiveTab] = useState<Category>("spring");

  const section = MENU[activeTab];

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--desktop-surface)" }}>
      {/* Header */}
      <div
        className="shrink-0 px-4 py-3 text-center"
        style={{
          background: "linear-gradient(135deg, #F26522 0%, #F7941D 100%)",
          color: "white",
        }}
      >
        <div className="text-[18px] font-bold tracking-wide">☕ remote</div>
        <div className="text-[10px] opacity-80 mt-0.5">6AM–6PM Weekday • 7AM–3PM Weekends</div>
      </div>

      {/* Category tabs */}
      <div
        className="shrink-0 flex overflow-x-auto gap-0 scrollbar-none"
        style={{ borderBottom: "1px solid var(--desktop-border)" }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className="shrink-0 px-3 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap"
            style={{
              color: activeTab === cat ? "var(--desktop-accent)" : "var(--desktop-text-secondary)",
              borderBottom: activeTab === cat ? "2px solid var(--desktop-accent)" : "2px solid transparent",
            }}
          >
            {MENU[cat].title}
          </button>
        ))}
      </div>

      {/* Menu items */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {section.items.map((item, i) => (
            <div
              key={i}
              className="flex items-start justify-between py-1.5 px-2 rounded"
              style={{
                background: i % 2 === 0 ? "transparent" : "var(--desktop-bg)",
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-medium" style={{ color: "var(--desktop-text)" }}>
                    {item.name}
                  </span>
                  {item.isNew && (
                    <span
                      className="text-[8px] font-bold px-1 py-0.5 rounded"
                      style={{ background: "#F26522", color: "white" }}
                    >
                      NEW
                    </span>
                  )}
                </div>
                {item.desc && (
                  <div className="text-[10px] mt-0.5" style={{ color: "var(--desktop-text-secondary)" }}>
                    {item.desc}
                  </div>
                )}
              </div>
              <span className="text-[11px] font-mono shrink-0 ml-2" style={{ color: "var(--desktop-text-secondary)" }}>
                {item.price}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="shrink-0 px-3 py-2 text-center text-[10px]"
        style={{
          borderTop: "1px solid var(--desktop-border)",
          color: "var(--desktop-text-secondary)",
        }}
      >
        Remote Coffee • Austin, TX • remotecoffee.com
      </div>
    </div>
  );
}

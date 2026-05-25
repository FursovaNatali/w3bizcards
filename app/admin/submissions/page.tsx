"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SubmissionsPage() {
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    const loadCards = async () => {
      const { data } = await supabase
        .from("cards")
        .select("*")
        .eq("status", "pending");

      setCards(data || []);
    };

    loadCards();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Pending submissions</h1>

      {cards.map((card) => (
        <div key={card.id} className="border p-4 rounded mb-4">
          <img
            src={
              card.profile_photo_url ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${card.name}`
            }
            alt={card.name}
            className="w-20 h-20 rounded-full object-cover"
          />

          <h2>{card.name}</h2>
          <p>{card.company}</p>
          <p>{card.email}</p>
        </div>
      ))}
    </div>
  );
}

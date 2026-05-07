"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AuthButton from "./components/AuthButton";

type Card = {
  id: string;
  name: string;
  title: string;
  company: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  categories:
    | {
        name: string;
        color: string;
      }[]
    | null;
};

const EMPTY_FORM = {
  name: "",
  title: "",
  company: "",
  phone: "",
  email: "",
  website: "",
};

export default function HomePage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [user, setUser] = useState<any>(null);

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchCards = async () => {
    const { data, error } = await supabase
      .from("cards")
      .select(
        `
        id,
        name,
        title,
        company,
        phone,
        email,
        website,
        categories ( name, color )
      `,
      )
      .order("name", { ascending: true });

    if (!error && data) {
      setCards(data);
    }
  };

  useEffect(() => {
    fetchCards();

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();

    const channel = supabase
      .channel("cards-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cards" },
        () => {
          fetchCards();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddCard = async () => {
    const { error } = await supabase.from("cards").insert([formData]);

    if (!error) {
      fetchCards();

      setFormData(EMPTY_FORM);
      setShowForm(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between bg-white px-6 py-4 shadow">
        <h1 className="text-3xl font-bold">Business Directory</h1>

        <AuthButton />
      </nav>

      <div className="p-8">
        {/* ADD BUTTON */}
        {user && (
          <div className="mb-8">
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-lg bg-black px-5 py-3 text-white hover:bg-gray-800"
            >
              Add Business Card
            </button>
          </div>
        )}

        {/* FORM */}
        {showForm && (
          <div className="mb-10 rounded-2xl bg-white p-6 shadow-lg">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                placeholder="Name"
                className="rounded border p-3"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <input
                placeholder="Title"
                className="rounded border p-3"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />

              <input
                placeholder="Company"
                className="rounded border p-3"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
              />

              <input
                placeholder="Phone"
                className="rounded border p-3"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />

              <input
                placeholder="Email"
                className="rounded border p-3"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              <input
                placeholder="Website"
                className="rounded border p-3"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
              />
            </div>

            <button
              onClick={handleAddCard}
              className="mt-5 rounded-lg bg-green-600 px-5 py-3 text-white hover:bg-green-700"
            >
              Save Card
            </button>
          </div>
        )}

        {/* CARDS */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {cards.map((card) => {
            const avatar = `https://api.dicebear.com/7.x/personas/svg?seed=${card.name}`;

            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl shadow-md p-5 transition transform hover:-translate-y-2 hover:shadow-xl"
              >
                {/* Avatar */}
                <img
                  src={avatar}
                  alt="avatar"
                  className="w-16 h-16 rounded-full mb-4"
                />

                {/* Name */}
                <h2 className="text-lg font-bold">{card.name}</h2>

                {/* Title */}
                <p className="text-sm text-gray-500">{card.title}</p>

                {/* Company */}
                <p className="text-sm">{card.company}</p>

                {/* Phone */}
                {card.phone && (
                  <p className="text-sm text-gray-500">{card.phone}</p>
                )}

                {/* Email */}
                {card.email && (
                  <p className="text-sm text-gray-500">{card.email}</p>
                )}

                {/* Website */}
                {card.website && (
                  <a
                    href={`https://${card.website}`}
                    target="_blank"
                    className="text-sm text-blue-500 underline"
                  >
                    {card.website}
                  </a>
                )}

                {/* Category */}
                {card.categories?.[0] && (
                  <span
                    className={`inline-block mt-3 px-3 py-1 text-white text-xs rounded-full ${card.categories[0].color}`}
                  >
                    {card.categories[0].name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

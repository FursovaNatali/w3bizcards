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
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

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
  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    const { error } = await supabase
      .from("cards")
      .delete()
      .eq("id", deleteTarget.id);

    if (error) {
      console.log(error);
    } else {
      setCards(cards.filter((c) => c.id !== deleteTarget.id));
    }

    setDeleteTarget(null);
    setDeleting(false);
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

        <div className="flex gap-3 items-center">
          <a
            href="/submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Submit a Card
          </a>

          <AuthButton />
        </div>
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
                {user && (
                  <button
                    onClick={() => setDeleteTarget(card)}
                    className="mt-2 text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100"
                  >
                    Delete
                  </button>
                )}

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
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Delete Business Card
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>'s card? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2 rounded-full text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

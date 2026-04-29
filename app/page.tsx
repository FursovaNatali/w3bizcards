'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// 🔐 подключение к Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

// 🧠 тип данных
type Card = {
  id: string
  name: string
  title: string
  company: string
  phone?: string | null
  email?: string | null
  website?: string | null
  categories: {
    name: string
    color: string
  }[] | null
}

export default function HomePage() {
  const [cards, setCards] = useState<Card[]>([])

  // 📥 загрузка данных
  const fetchCards = async () => {
    const { data, error } = await supabase
      .from('cards')
      .select(`
        id,
        name,
        title,
        company,
        phone,
        email,
        website,
        categories ( name, color )
      `)
      .order('name', { ascending: true })

    if (!error && data) {
      setCards(data)
    }
  }

  // 🔄 загрузка + realtime
  useEffect(() => {
    fetchCards()

    const channel = supabase
      .channel('cards-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cards' },
        () => {
          fetchCards()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
  <main className="p-8">
    <h1 className="text-3xl font-bold mb-6 text-center">
      Business Directory
    </h1>

    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
      {cards.map((card) => {
        const avatar = `https://api.dicebear.com/7.x/personas/svg?seed=${card.name}`

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
        )
      })}
      </div>
    </main>
  )
}
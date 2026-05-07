'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AuthButton from './components/AuthButton'

export const dynamic = 'force-dynamic'

type Card = {
  id: string
  name: string
  title: string
  business: string
  email: string
  phone: string
  website: string
}

const EMPTY_FORM = {
  name: '',
  title: '',
  business: '',
  email: '',
  phone: '',
  website: '',
}

export default function Page() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState(EMPTY_FORM)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user)
    }

    const fetchCards = async () => {
      const { data } = await supabase.from('cards').select('*')

      if (data) {
        setCards(data)
      }

      setLoading(false)
    }

    getUser()
    fetchCards()
  }, [])

  const handleAddCard = async () => {
    const { error } = await supabase.from('cards').insert([formData])

    if (!error) {
      const { data } = await supabase.from('cards').select('*')

      if (data) {
        setCards(data)
      }

      setFormData(EMPTY_FORM)
      setShowForm(false)
    }
  }

  if (loading) {
    return <div className="p-10">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <nav className="flex items-center justify-between bg-white px-6 py-4 shadow">
        <h1 className="text-xl font-bold">Business Directory</h1>

        <AuthButton />
      </nav>

      <div className="p-6">
        {user && (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded bg-black px-4 py-2 text-white"
            >
              Add Business Card
            </button>
          </div>
        )}

        {showForm && (
          <div className="mb-8 rounded bg-white p-6 shadow">
            <div className="grid gap-4">
              <input
                placeholder="Name"
                className="border p-2"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <input
                placeholder="Title"
                className="border p-2"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />

              <input
                placeholder="Business"
                className="border p-2"
                value={formData.business}
                onChange={(e) =>
                  setFormData({ ...formData, business: e.target.value })
                }
              />

              <input
                placeholder="Email"
                className="border p-2"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              <input
                placeholder="Phone"
                className="border p-2"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />

              <input
                placeholder="Website"
                className="border p-2"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
              />

              <button
                onClick={handleAddCard}
                className="rounded bg-green-600 px-4 py-2 text-white"
              >
                Save Card
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {cards.map((card) => (
            <div key={card.id} className="rounded bg-white p-6 shadow">
              <h2 className="text-xl font-bold">{card.name}</h2>

              <p>{card.title}</p>

              <p>{card.business}</p>

              <p>{card.email}</p>

              <p>{card.phone}</p>

              <a
                href={card.website}
                className="text-blue-600 underline"
              >
                {card.website}
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
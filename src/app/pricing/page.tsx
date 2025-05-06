// src/app/pricing/page.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

type Plan = {
  name: string
  price: number
  credits: number
  featured?: boolean
  features: string[]
}

// your new subscription tiers:
const PLANS: Plan[] = [
  {
    name: 'Basic Subscription',
    price: 3.99,
    credits: 50,
    featured: false,
    features: [
      'Up to 50 credits / month',
      'Access to member-only tools',
      'Micro-transactions (tips, boosts)',
    ],
  },
  {
    name: 'Standard Subscription',
    price: 7.99,
    credits: 150,
    featured: false,
    features: [
      'Up to 150 credits / month',
      'Everything in Basic',
      'Bonus 20 credits on signup',
    ],
  },
  {
    name: 'Pro Subscription',
    price: 12.99,
    credits: 400,
    featured: true,
    features: [
      'Up to 400 credits / month',
      'Everything in Standard',
      'Priority support',
      'Monthly bonus 100 credits',
    ],
  },
]

export default function PricingPage() {
  const router = useRouter()
  const role = useSearchParams().get('role') || 'viewer'

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <h2 className="text-3xl font-bold text-center mb-12">
        Choose Your Subscription
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col justify-between p-8 rounded-2xl shadow-lg
              ${
                plan.featured
                  ? 'bg-blue-600 border-2 border-blue-400'
                  : 'bg-white text-black border border-gray-300'
              }`}
          >
            {plan.featured && (
              <div className="absolute top-0 right-0 bg-white text-blue-600 px-3 py-1 rounded-bl-lg text-sm font-semibold">
                Best value
              </div>
            )}

            <div>
              <h3
                className={`text-2xl font-semibold mb-4 ${
                  plan.featured ? 'text-white' : 'text-gray-900'
                }`}
              >
                {plan.name}
              </h3>

              <div className="text-5xl font-bold mb-2">
                ${plan.price.toFixed(2)}
                <span className="text-xl font-normal ml-1">/ Month</span>
              </div>

              <div
                className={`mb-6 ${
                  plan.featured ? 'text-blue-200' : 'text-gray-700'
                }`}
              >
                <span className="font-bold">{plan.credits}</span> credits
              </div>

              <ul className="space-y-2 mb-8">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-center text-sm ${
                      plan.featured ? 'text-blue-200' : 'text-gray-700'
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 flex-shrink-0 mr-2 ${
                        plan.featured ? 'text-green-300' : 'text-green-600'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M7.629 15.41l-3.568-3.97a1 1 0 011.496-1.328l2.47 2.747 5.422-6.133a1 1 0 011.525 1.308l-6.5 7.364a1 1 0 01-1.345.012z" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() =>
                router.push(
                  `/checkout?plan=${encodeURIComponent(
                    plan.name
                  )}&role=${role}`
                )
              }
              className={`w-full py-3 rounded-lg font-semibold transition 
                ${
                  plan.featured
                    ? 'bg-white text-blue-600 hover:bg-gray-100'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              Subscribe for ${plan.price.toFixed(2)}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { checkout, resolveGatewayAction } from '../../backend/service api/payment.service'


const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
)
const CardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
)
const WalletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /><path d="M16 3H8L4 7h16l-4-4z" /><circle cx="17" cy="14" r="1" />
  </svg>
)
const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
)
const SpinnerIcon = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)
const AlertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)


const METHODS = [
  { value: 'card', label: 'Credit Card', icon: <CardIcon />, desc: 'Visa / Mastercard' },
  { value: 'paymob', label: 'Paymob', icon: <CardIcon />, desc: 'Secure card gateway' },
  { value: 'vodafone', label: 'Vodafone Cash', icon: <PhoneIcon />, desc: 'Mobile wallet' },
]


export default function CheckoutPage() {
  const { cart, removeFromCart } = useCart()
  const navigate = useNavigate()

  const [method, setMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const total = cart.reduce(
    (sum, item) => sum + Number(item.discountPrice || item.price || 0), 0
  )

  const handleCheckout = async () => {
    if (cart.length === 0) { setError('Your cart is empty.'); return }
    setError('')
    try {
      setLoading(true)
      // calls POST /payments/create → { method, amount, items }
      const { order, gateway } = await checkout({
        method
      })

      const action = resolveGatewayAction(gateway)
      if (action.type === 'redirect') {
        setLoading(false)
        window.location.href = action.url
      } else {
        navigate(`/orders/${order._id}`, { replace: true })
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] py-12 px-4 transition-colors duration-300">
      <div className="mx-auto max-w-2xl animate-slide-up space-y-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
            Checkout
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {cart.length} {cart.length === 1 ? 'course' : 'courses'} in your cart
          </p>
        </div>

        <div className="space-y-5">


          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Order Summary
              </h2>
            </div>

            {cart.length === 0 ? (
              <div className="px-5 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                Your cart is empty.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {cart.map((item) => (
                  <li key={item._id} className="flex items-center justify-between px-5 py-4 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-slate-100 dark:border-slate-700"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate text-sm">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.discountPrice
                            ? <><span className="text-blue-600 font-semibold">${item.discountPrice}</span>{' '}<span className="line-through">${item.price}</span></>
                            : <span className="font-semibold">${item.price}</span>
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-300 dark:hover:border-red-500/40 transition-all duration-200"
                    >
                      <TrashIcon />
                    </button>
                  </li>
                ))}
              </ul>
            )}


            {cart.length > 0 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">${total.toFixed(2)}</span>
              </div>
            )}
          </div>


          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Payment Method
              </h2>
            </div>
            <div className="p-4 grid gap-2">
              {METHODS.map(({ value, label, icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMethod(value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${method === value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-500/40'
                    }`}
                >
                  <span className={method === value ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}>
                    {icon}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{desc}</p>
                  </div>
                  {method === value && (
                    <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                      <CheckIcon />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Error banner ─────────────────────────────────────────────── */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 animate-fade-in">
              <AlertIcon />
              {error}
            </div>
          )}


          <button
            onClick={handleCheckout}
            disabled={loading || cart.length === 0}
            className="w-full h-13 py-3.5 rounded-xl font-semibold text-[15px] tracking-tight text-white transition-all duration-200 active:scale-[.98] bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 hover:shadow-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {loading
              ? <><SpinnerIcon /> Processing…</>
              : `Pay $${total.toFixed(2)}`
            }
          </button>

        </div>
      </div>
    </div>
  )
}
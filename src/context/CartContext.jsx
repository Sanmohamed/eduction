import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  fetchCart,
  addCartItem,
  removeCartItem,
  clearCartRequest,
  mergeCartRequest,
} from '../../backend/service api/cart.service'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('cart')
    if (raw) setCart(JSON.parse(raw))
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const loadServerCart = async () => {
    try {
      setLoading(true)
      const data = await fetchCart()
      const items = data?.cart?.items?.map((item) => item.course || item) || []
      setCart(items)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (course) => {
    const token = localStorage.getItem('token')

    if (!token) {
      setCart((prev) =>
        prev.some((item) => item._id === course._id) ? prev : [...prev, course]
      )
      return
    }

    const data = await addCartItem(course._id)
    if (data.success) {
      await loadServerCart()
    }
  }

  const removeFromCart = async (id) => {
    const token = localStorage.getItem('token')

    if (!token) {
      setCart((prev) => prev.filter((item) => item._id !== id))
      return
    }

    const data = await removeCartItem(id)
    if (data.success) {
      await loadServerCart()
    }
  }

  const clearCart = async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      setCart([])
      return
    }

    const data = await clearCartRequest()
    if (data.success) {
      setCart([])
    }
  }

  const mergeCartAfterLogin = async () => {
    const raw = localStorage.getItem('cart')
    const localCart = raw ? JSON.parse(raw) : []

    if (!localCart.length) {
      await loadServerCart()
      return
    }

    const items = localCart.map((item) => item._id)
    const data = await mergeCartRequest(items)

    if (data.success) {
      const mergedItems = data?.cart?.items?.map((item) => item.course || item) || []
      setCart(mergedItems)
      localStorage.removeItem('cart')
    }
  }

  const value = useMemo(() => ({
    cart,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    loadServerCart,
    mergeCartAfterLogin,
  }), [cart, loading])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
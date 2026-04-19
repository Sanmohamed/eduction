import { createContext, useContext, useEffect, useState } from 'react'
import {
  fetchWishlist,
  toggleWishlistItem
} from '../../backend/service api/whislist.service'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([])

  const loadWishlist = async () => {
    try {
      const data = await fetchWishlist()
      setWishlist(data.wishlist)
    } catch (err) {
      console.error("Wishlist load failed:", err)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) loadWishlist()
  }, [])

  const toggleWishlist = async (courseId) => {
    try {
      await toggleWishlistItem(courseId)
      await loadWishlist()
    } catch (err) {
      console.error("Wishlist toggle failed:", err)
    }
  }

  const isInWishlist = (id) =>
    wishlist.some(item => item._id === id)

  return (
    <WishlistContext.Provider value={{
      wishlist,
      toggleWishlist,
      isInWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
import CourseCard from '../components/common/CourseCard'
import { useWishlist } from '../context/WishlistContext'

export default function WishlistPage() {
  const { wishlist } = useWishlist()
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Wishlist</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{wishlist.map((course) => <CourseCard key={course._id} course={course} />)}</div>
    </div>
  )
}

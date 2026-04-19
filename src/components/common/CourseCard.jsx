import { Link } from 'react-router-dom'
import { useWishlist } from '../../context/WishlistContext'
import { useCart } from '../../context/CartContext'

export default function CourseCard({ course }) {
  const { toggleWishlist } = useWishlist()
  const { addToCart } = useCart()
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <img src={course.thumbnail || 'https://placehold.co/600x350?text=Course'} alt={course.title} className="mb-4 aspect-video w-full rounded-xl object-cover" />
      <div className="space-y-2">
        <h3 className="text-lg font-bold">{course.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-600">{course.subtitle || course.description}</p>
        <p className="text-sm text-slate-500">{course.category} • {course.level}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-black text-blue-700">${course.discountPrice || course.price || 0}</span>
          <div className="flex gap-2">
            <button onClick={() => toggleWishlist(course)} className="rounded-lg border px-3 py-2 text-sm">♡</button>
            <button onClick={() => addToCart(course)} className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">Cart</button>
            <Link to={`/courses/${course._id}`} className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white">View</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

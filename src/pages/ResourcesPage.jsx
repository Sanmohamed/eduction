
import { useEffect, useState } from 'react'
import { getResources } from '../../backend/service api/resource.service'


const FILTERS = ['all', 'scholarship', 'course', 'certificate', 'article', 'tool']
 
function typeBadgeClass(type) {
  switch (type) {
    case 'scholarship':  return 'bg-green-50  dark:bg-green-500/10  text-green-700  dark:text-green-400'
    case 'course':       return 'bg-blue-50   dark:bg-blue-500/10   text-blue-700   dark:text-blue-400'
    case 'certificate':  return 'bg-amber-50  dark:bg-amber-500/10  text-amber-700  dark:text-amber-400'
    case 'article':      return 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'
    case 'tool':         return 'bg-slate-100 dark:bg-slate-800     text-slate-700  dark:text-slate-300'
    default:             return 'bg-blue-50   dark:bg-blue-500/10   text-blue-700   dark:text-blue-400'
  }
}
 
 
function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 animate-pulse">
      <div className="h-6 w-24 rounded-full bg-slate-100 dark:bg-slate-800" />
      <div className="h-6 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-14 rounded-full bg-slate-100 dark:bg-slate-800" />
        <div className="h-6 w-14 rounded-full bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  )
}
 
// ─── Main page ────────────────────────────────────────────────────────────────
export default function ResourcesPage() {
  const [resources, setResources] = useState([])
  const [q,         setQ]         = useState('')
  const [type,      setType]      = useState('all')
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
 
  useEffect(() => {
    setLoading(true)
    setError('')
 
   
    getResources({ q: q || undefined, type: type !== 'all' ? type : undefined })
      .then((data) => setResources(data.resources ?? []))
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load resources.'))
      .finally(() => setLoading(false))
  }, [q, type])
 
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#101622] transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
 
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
 
          <div className="flex gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
            <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-50 font-medium">Resources</span>
          </div>
 
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            Student Resource Center
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            Browse scholarships, helpful tools, learning content, and opportunities for students and instructors.
          </p>
 
          <div className="mt-5 sm:mt-6 space-y-3 sm:space-y-4">
            <input
              className="w-full rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search resources..."
            />
 
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((item) => (
                <button
                  key={item}
                  onClick={() => setType(item)}
                  className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold capitalize transition-all duration-200 ${
                    type === item
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
 
 
        {error && (
          <div className="rounded-2xl px-4 py-3 text-sm font-medium bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
 
   
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : resources.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-sm py-12 text-center">
            No resources found.{' '}
            {type !== 'all' && (
              <button onClick={() => setType('all')} className="text-blue-600 hover:underline">
                Clear filter
              </button>
            )}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => (
              <a
                key={resource._id}
                href={resource.url || '#'}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/30"
              >
                
                <div className={`mb-4 inline-flex self-start rounded-full px-3 py-1 text-xs font-bold uppercase ${typeBadgeClass(resource.type)}`}>
                  {resource.type}
                </div>
 
               
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {resource.title}
                </h2>
 
               
                {resource.description && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 flex-1">
                    {resource.description}
                  </p>
                )}
 
                
                {resource.featured && (
                  <span className="mt-3 inline-flex self-start items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    ★ Featured
                  </span>
                )}
 
               
                {resource.tags?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {resource.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs text-slate-600 dark:text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
 
      </div>
    </div>
  )
}
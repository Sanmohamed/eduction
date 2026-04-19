import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import CourseCard from '../components/common/CourseCard'
import { getCatalog, getRecommendations } from '../../backend/service api/course.service'
import { getResources } from '../../backend/service api/resource.service'

const LOGOS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDSijA7LBX2NSEU_qyNNPJBpEDAw6nuSkJMLKSLA73VxkNgfJWcP7EydcVl1fNcK7OL5LUvny7_xpFGZjEKIoinTESRaVEt8piPkhsfgyWbBa0BoJGP7S1rIpfuBrb6VagGCZ_q0vBIyjRAd6nvc6KSUSqKWtv_H-DG6GLR4uj3jNLTayzmvNbh7-UqlO5VzZ9BTKFsknhvOaO-R3nJPjN1iNiDyCuSiJvD0IWI0vDXH-0zuV45pdjUZ1LB0npb-xKJwfu8tjcRs6Q',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDiiQ8jlAM6raSsmjRc4yjpfrVaTDSb4GtMg5TfZakehVjOsjQ4r08oCsdvLiamHFW0sRZQDbVwOR79FH9tG3PptH3R4khwr_4RW1EjV6DoEm2GlrM08R21BOrK0fkFil-opb3VJH0Bw0osurxxyxN0VqrVZm6FRp0iWIQRbSXrPO-VhVuFLtSqVeAKLNlIcEDDnbiK9iKbup9KxKunX_UCrcKUCuzi13dvSGZqAEWXRT620KsQq9KhEo0IyJZ5njzd5JfMiN0wYZQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCADSzVLkoHp_KtntfIfyK1aJux9iuimtPQotG0G_PQB9-BTM17hXFMRjSShh_P5-j1IUgGbteexTrwInCKZo0IJ-re8FV_nHZNxy4yrlCJMR5kZdVIpEtDdIVNq6Qh4SK1pkwuIf9Cr2D1TFEpMRtsya8y9nKN5Aj1ORYC1Rmz6eqWolt2_6dnI-6QzwOuWtfPQtADn2EaWhu1fSjM0BpEUtpQP8idd4tBOSeBLeaJvbQ-FvVQwasEP2HzBxFiCK_eb7Nv0OBCBnU',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAeQgOuVNJSbDGFk5JK7aNzz6lQ_ccmRnUToX6GRPo_XmPIoie5_7lqCyZptgTdrbYdR0oFCApReFUolJ3sWPMWDL5EfyXBXl15QXAb2GtbDD3WxemWLj8LBimC6uLORLbNeznDezbMQjeMjGtI4J2VDzCj7sLKLGYMsu0Dd_jSoTSpHO7YG764_ES3XB_yd85Z2O_gUUpZM-r-KICu3NWWmvO95TfNAM7CSWboQtMAcP9FdHDD2_HCWv-t_IILcYR8o3hX3jd6mds',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAgiWDyahn2CIucNre2PLI16s7ZZEIrI7lb5lXa5vJnWVH0Q94K1ccVwep-_3voAYMrRLH7f00oh3_skCyfv9LwA5-nClaMDcYQSOMXdoBAR1ZJvzyPP1IAwzK55v-HaVnkIVnLO8mPM99ozQpiPlQC6qS-rYGV9udr5PE1V3YjkU6OXkc6Fgfrxia_LNEMdmZ8pusKs_QNGkMsqWuxS2FCrDztku0aFx9v8C1bJWW0A0xEsyIazQVpdh-kwStoztrUyMYEA2X6ofA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDOaghwsOX_vabEZJZHFP1wmEUVNg3-AurzbPX_FDr6q14LkQvXi1wHVs5INeiyKIa2yoDRdjERqwfuxoVJSausIw7mp3Go-hx0C_Q9Bm8Z0e8JUIVQYDZObnrmucz_C9C7bGZktDy8v7X3l3-IQtMkm21GCDkyAYv1ygbsRY1grUB_OuiRnOcfSgZPf9i4K8TZ1TNlS-jmFXwUX6i_G5P7V0mZNSGx4UZT-GUQj1w0ah70Hl1wVE61htuazjbIdadvtrDjPeOyVtU',
]

const STEPS = [
  {
    icon: '🔍',
    title: '1. Discover',
    desc: 'Browse our extensive catalog of courses to find the perfect one for your goals.',
  },
  {
    icon: '🎓',
    title: '2. Learn',
    desc: 'Engage with high-quality lessons, projects, and quizzes at your own pace.',
  },
  {
    icon: '🏆',
    title: '3. Achieve',
    desc: 'Earn certificates upon completion to showcase your new skills and knowledge.',
  },
]

const TESTIMONIALS = [
  {
    quote:
      '"This platform transformed my career. The courses are practical, engaging, and taught by true experts."',
    name: 'John Doe',
    role: 'Software Developer',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAkmTDbFAottD9K609Nm6Qmvr5znC2dOQEN5u7XwQBjuJ9ygvdV8AtpYtBVbCt6aUvtLZA2uCFjaIbij1gIsFIKTCzsrJmrTBtCHL_sRTNBX382bNpcMd9Dm54fXjY_OcnHrBE5vqY44yrhs1VD6MW5TlQtO83rKZyjKp5Ydhklo793dNBN08K26mFyL2EXGpMq-LPVjqDBoc35Ac6stOYUtFL3EpyxfPTLRfO7_LKuM_ThiYhJAzTe46goT_xRm9nT0UQIJqAq_X0',
  },
  {
    quote:
      '"I\'ve taken several courses here and have been impressed with the quality of every single one."',
    name: 'Jane Smith',
    role: 'Product Manager',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCSdC9CwgJp7PjaGnLwWMO6FXBVsL1qb3IrstV3To2PxRPuI_seHRBgWbBlH6PuN8CzcZLVdB7X5Mg1tGYSduW29ALMy1qT3qQQAeZtOZrvTgR5tV8x1rmLOZWKvbfnt5VkRnourRqrrqwNv1SPP-81RVG1seACwtOnfYXJ3Cgjl9W6JBNZDwDebPwejLCxhNcUfucs7-4mOv-JJbUVTWZHLs7fYhoAzsBYPPyQPb_uCQ4EdWs32kcjEPU2O5AgE4Nhu6zDzbEx4sc',
  },
  {
    quote:
      '"As an educator, EduPlatform has provided an amazing way to reach a global audience."',
    name: 'Emily White',
    role: 'University Professor',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBz6zr59pV2NgsMni5vSgoeVoxaAayvecIRZzghAv4ldncPg7dq0GNdsMOiwyL4cGd3YxhMdZaix6esDCQjEGwGBFcfDiKqaqAG-A6bHJKDjeg4c1TVvMihZU_njNuxS_EM2hNIShHTyZ80ireVG5Dfz_wnPTR2TC3wQ9QbXkP2KNdgBTrPFk3OCOzlLtoX2D6zucNwo6TUzfCmROJxINixgQawyyn6-zWQQkCumxCwY_qW0ranA31SfnuNuk8Cc9uViD5w7ggis54',
  },
]

const FOOTER_LINKS = {
  Product: ['Courses', 'Certificates', 'For Enterprise', 'Pricing'],
  Company: ['About Us', 'Careers', 'Press', 'Blog'],
  Legal: ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Help Center'],
}

function typeBadgeClass(type) {
  switch (type) {
    case 'scholarship':
      return 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400'
    case 'course':
      return 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
    case 'certificate':
      return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
    case 'article':
      return 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'
    default:
      return 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
  }
}

function SectionHeader({ title, linkLabel, linkTo }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
      {linkTo && (
        <Link to={linkTo} className="text-sm font-semibold text-blue-600 hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  )
}

function CourseSkeletons() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white animate-pulse dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="aspect-video bg-slate-100 dark:bg-slate-800" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ResourceSkeletons() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl border border-slate-200 bg-white p-6 space-y-3 animate-pulse dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="h-6 w-20 rounded-full bg-slate-100 dark:bg-slate-800" />
          <div className="h-5 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  )
}

function NotificationPreviewCard({ item }) {
  return (
    <Link
      to="/notifications"
      className={`block rounded-2xl border p-4 shadow-sm transition hover:shadow-md ${item.isRead
          ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
          : 'border-blue-200 bg-blue-50/70 dark:border-blue-500/20 dark:bg-blue-500/10'
        }`}
    >
      <div className="flex items-start gap-3">
        {!item.isRead && (
          <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500" />
        )}

        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {item.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
            {item.message}
          </p>
        </div>
      </div>
    </Link>
  )
}

function QuickActionCard({ title, desc, to }) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{desc}</p>
    </Link>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { notifications, unread } = useNotifications()

  const [courses, setCourses] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [resources, setResources] = useState([])

  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingRecs, setLoadingRecs] = useState(true)
  const [loadingResources, setLoadingResources] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchAll = async () => {
      try {
        const [catalogRes, recRes, resourceRes] = await Promise.all([
          getCatalog(),
          getRecommendations(),
          getResources(),
        ])

        if (!mounted) return

        setCourses(catalogRes?.courses || [])
        setRecommendations(recRes?.courses || [])
        setResources(resourceRes?.resources || [])
      } catch {
        if (!mounted) return
        setCourses([])
        setRecommendations([])
        setResources([])
      } finally {
        if (!mounted) return
        setLoadingCourses(false)
        setLoadingRecs(false)
        setLoadingResources(false)
      }
    }

    fetchAll()

    return () => {
      mounted = false
    }
  }, [])

  const quickActions = user
    ? [
      { title: 'My Profile', desc: 'Manage your account details, avatar, and preferences.', to: '/profile' },
      { title: 'Notifications', desc: 'Check the latest alerts, payment updates, and system messages.', to: '/notifications' },
      { title: 'My Cart', desc: 'Continue your checkout and complete your purchases.', to: '/checkout' },
    ]
    : [
      { title: 'Browse Courses', desc: 'Explore the catalog and find the right course for your goals.', to: '/catalog' },
      { title: 'Resources Hub', desc: 'Open scholarships, certificates, and useful learning resources.', to: '/resources' },
      { title: 'Get Started', desc: 'Create your account and begin learning today.', to: '/login' },
    ]

  const displayedCourses = user ? recommendations : courses

  return (
    <div className="min-h-screen -mx-4 -mt-6 flex flex-col bg-slate-50 text-slate-700 transition-colors duration-300 dark:bg-[#101622] dark:text-slate-300 sm:-mx-6 sm:-mt-8">
      <section className="px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          {user ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                Welcome back{user?.name ? `, ${user.name}` : ''}
              </div>

              <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                Continue Building Your Skills
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
                Pick up where you left off, explore fresh recommendations, and stay on top of your latest updates.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => navigate('/catalog')}
                  className="h-12 rounded-xl bg-blue-600 px-6 text-base font-bold tracking-wide text-white shadow-md shadow-blue-600/25 transition-colors hover:bg-blue-700"
                >
                  Explore Courses
                </button>

                <button
                  onClick={() => navigate('/notifications')}
                  className="h-12 rounded-xl border border-slate-300 bg-white px-6 text-base font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Notifications {unread > 0 ? `(${unread > 99 ? '99+' : unread})` : ''}
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                Unlock Your Potential with Expert-Led Learning
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
                Students, instructors, resources, complaints, notifications, payments,
                certificates, wishlist, AI recommendations, and cloud video architecture.
              </p>

              <button
                onClick={() => navigate('/catalog')}
                className="h-12 rounded-xl bg-blue-600 px-6 text-base font-bold tracking-wide text-white shadow-md shadow-blue-600/25 transition-colors hover:bg-blue-700"
              >
                Explore Our Courses
              </button>
            </>
          )}
        </div>
      </section>

      <section className="px-4 pb-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHeader title="Quick Actions" />
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((item) => (
              <QuickActionCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      {!user && (
        <section className="bg-slate-100 px-4 py-12 dark:bg-slate-800/50 sm:px-6">
          <h4 className="mb-8 text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Trusted by Leading Organizations Worldwide
          </h4>
          <div className="mx-auto grid max-w-6xl grid-cols-2 items-center justify-items-center gap-8 px-4 md:grid-cols-3 lg:grid-cols-6">
            {LOGOS.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Partner ${i + 1}`}
                className="h-10 w-auto grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100"
              />
            ))}
          </div>
        </section>
      )}

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {user && (
          <section className="py-8">
            <SectionHeader title="Latest Notifications" linkLabel="Open all" linkTo="/notifications" />
            {notifications.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {notifications.slice(0, 3).map((item) => (
                  <NotificationPreviewCard key={item._id} item={item} />
                ))}
              </div>
            ) : (
              <p className="py-6 text-sm text-slate-400 dark:text-slate-500">
                No notifications yet.
              </p>
            )}
          </section>
        )}

        <section className="py-8">
          <SectionHeader
            title={user ? 'Recommended For You' : 'Featured Courses'}
            linkLabel="View all"
            linkTo="/catalog"
          />
          {loadingCourses || loadingRecs ? (
            <CourseSkeletons />
          ) : displayedCourses.length === 0 ? (
            <p className="py-6 text-sm text-slate-400 dark:text-slate-500">
              No courses available yet.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {displayedCourses.slice(0, 6).map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </section>

        <section className="py-8">
          <SectionHeader title="AI Recommendations" linkLabel="See more" linkTo="/catalog" />
          {loadingRecs ? (
            <CourseSkeletons />
          ) : recommendations.length === 0 ? (
            <p className="py-6 text-sm text-slate-400 dark:text-slate-500">
              No recommendations yet.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recommendations.slice(0, 6).map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </section>
      </div>

      {!user && (
        <section className="px-4 py-20 sm:px-6 lg:py-24">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            How It Works
          </h2>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-12 text-center md:grid-cols-3">
            {STEPS.map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  {icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-slate-100 px-4 py-16 dark:bg-slate-800/50 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHeader title="Latest Resources" linkLabel="Open resources" linkTo="/resources" />
          {loadingResources ? (
            <ResourceSkeletons />
          ) : resources.length === 0 ? (
            <p className="py-6 text-sm text-slate-400 dark:text-slate-500">
              No resources found.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {resources.slice(0, 3).map((resource) => (
                <button
                  key={resource._id}
                  type="button"
                  onClick={() => navigate('/resources')}
                  className="rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${typeBadgeClass(resource.type)}`}
                  >
                    {resource.type}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                    {resource.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {resource.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {!user && (
        <section className="px-4 py-20 sm:px-6 lg:py-24">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            What Our Learners Say
          </h2>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
            {TESTIMONIALS.map(({ quote, name, role, avatar }) => (
              <div
                key={name}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <p className="mb-6 flex-1 text-sm italic leading-relaxed text-slate-600 dark:text-slate-400">
                  {quote}
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={avatar}
                    alt={name}
                    className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="px-4 py-20 text-center sm:px-6 lg:py-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {user ? 'Keep Moving Forward' : 'Ready to Start Your Learning Journey?'}
          </h2>
          <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            {user
              ? 'Continue building your skills and stay updated with your latest learning activity.'
              : 'Join thousands of learners and professionals achieving their goals with EduPlatform.'}
          </p>
          <button
            onClick={() => navigate(user ? '/catalog' : '/login')}
            className="h-12 rounded-xl bg-blue-600 px-6 text-base font-bold tracking-wide text-white shadow-md shadow-blue-600/25 transition-colors hover:bg-blue-700"
          >
            {user ? 'Browse More Courses' : 'Get Started for Free'}
          </button>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 text-blue-600">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                EduPlatform
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Empowering minds through accessible, quality education for everyone, everywhere.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
              <nav className="flex flex-col gap-3">
                {links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    {link}
                  </a>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-slate-200 px-6 py-6 text-sm dark:border-slate-800 sm:flex-row">
          <p className="text-slate-500 dark:text-slate-400">
            © 2025 EduPlatform. All Rights Reserved.
          </p>
          <div className="flex gap-4 text-slate-500 dark:text-slate-400">
            <Link to="/privacy" className="transition-colors hover:text-blue-600">
              Privacy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-blue-600">
              Terms
            </Link>
            <Link to="/contact" className="transition-colors hover:text-blue-600">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
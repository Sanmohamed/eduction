import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getUserCertificates } from '../../../backend/service api/certificate.service'

function CertificateCard({ cert }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
        {cert.course?.title}
      </h2>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Certificate No: {cert.certificateNo}
      </p>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Issued: {new Date(cert.issuedAt).toLocaleDateString()}
      </p>

      <button
        onClick={() => window.open(`/certificate/${cert._id}`, '_blank')}
        className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Download Certificate
      </button>
    </div>
  )
}

export default function CertificatesPage() {
  const { user } = useAuth()

  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        const data = await getUserCertificates(user._id)

        if (!mounted) return
        setCertificates(data?.certificates || [])
      } catch (err) {
        if (!mounted) return
        setError(err?.response?.data?.message || 'Failed to load certificates')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    if (user?._id) load()

    return () => {
      mounted = false
    }
  }, [user])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          My Certificates
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          All certificates you’ve earned from completed courses.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading certificates...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : certificates.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-slate-500">No certificates yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {certificates.map((cert) => (
            <CertificateCard key={cert._id} cert={cert} />
          ))}
        </div>
      )}
    </div>
  )
}
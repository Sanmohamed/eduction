import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCertificateById } from '../../../backend/service api/certificate.service'

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-slate-100 dark:bg-slate-800 ${className}`} />
}

function SealIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M8.21 13.89 7 22l5-3 5 3-1.21-8.11" />
    </svg>
  )
}

export default function CertificateViewPage() {
  const { id } = useParams()

  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    getCertificateById(id)
      .then((res) => {
        if (!mounted) return
        setCertificate(res.certificate)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err?.response?.data?.message || 'Failed to load certificate')
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-24 w-full rounded-3xl" />
        <Skeleton className="h-[620px] w-full rounded-3xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
        {error}
      </div>
    )
  }

  if (!certificate) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Certificate not found.
      </div>
    )
  }

  const studentName = certificate.user?.name || 'Student'
  const courseTitle = certificate.course?.title || 'Course'
  const issuedAt = certificate.issuedAt
    ? new Date(certificate.issuedAt).toLocaleDateString()
    : ''
  const certificateNo = certificate.certificateNo || ''

  return (
    <>
      <style>{`
        @media print {
          body {
            background: white !important;
          }
          .print-hide {
            display: none !important;
          }
          .print-wrap {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-card {
            box-shadow: none !important;
            border: 2px solid #dbeafe !important;
            margin: 0 !important;
            min-height: 100vh !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      <div className="print-wrap mx-auto max-w-5xl space-y-6">
        <div className="print-hide flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              Certificate Preview
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Review or print your certificate.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Print Certificate
          </button>
        </div>

        <div className="print-card overflow-hidden rounded-[32px] border border-blue-100 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="relative">
            <div className="h-3 w-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600" />

            <div className="absolute inset-x-0 top-0 flex justify-center">
              <div className="mt-8 rounded-full border border-blue-100 bg-white px-6 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 text-blue-600">
                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    EduPlatform
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-10 pt-32 sm:px-12 sm:pb-14">
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-blue-600">
                  Certificate of Completion
                </p>

                <h2 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-white">
                  {studentName}
                </h2>

                <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
                  This certifies that the learner above has successfully completed all required lessons and course materials for
                </p>

                <h3 className="mx-auto mt-5 max-w-3xl text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
                  {courseTitle}
                </h3>

                <div className="mt-10 flex justify-center text-blue-600">
                  <SealIcon />
                </div>
              </div>

              <div className="mt-12 grid gap-8 border-t border-slate-200 pt-10 dark:border-slate-800 sm:grid-cols-3">
                <div className="text-center sm:text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Issue Date
                  </p>
                  <p className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
                    {issuedAt}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Certificate No
                  </p>
                  <p className="mt-3 break-all text-base font-semibold text-slate-900 dark:text-white">
                    {certificateNo}
                  </p>
                </div>

                <div className="text-center sm:text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Authorized Signature
                  </p>
                  <div className="mt-3 inline-block border-b-2 border-slate-300 px-10 pb-2 dark:border-slate-600">
                    <span className="text-base font-semibold text-slate-900 dark:text-white">
                      EduPlatform Team
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-12 rounded-2xl bg-blue-50 px-5 py-4 text-center text-sm text-blue-800 dark:bg-blue-500/10 dark:text-blue-300">
                Verified completion record for internal learning and achievement tracking.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
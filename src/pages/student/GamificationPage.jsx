import { useAuth } from '../../context/AuthContext'

export default function GamificationPage() {
  const { user } = useAuth()
  const streak = user?.learningStreak || 0

  const achievements = [
    { title: 'First Step', unlocked: streak >= 1, desc: 'Start your learning journey.' },
    { title: 'On Fire', unlocked: streak >= 5, desc: 'Maintain a 5-day streak.' },
    { title: 'Consistent Learner', unlocked: streak >= 10, desc: 'Reach a 10-day streak.' },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Gamification
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Keep your streak alive and unlock achievements as you learn.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">Current Streak</p>
        <h2 className="mt-2 text-4xl font-black text-purple-600">
          {streak} days 🔥
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {achievements.map((item) => (
          <div
            key={item.title}
            className={`rounded-2xl border p-5 ${
              item.unlocked
                ? 'border-green-200 bg-green-50 dark:border-green-500/20 dark:bg-green-500/10'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
            }`}
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
            <p className="mt-4 text-sm font-semibold">
              {item.unlocked ? 'Unlocked' : 'Locked'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
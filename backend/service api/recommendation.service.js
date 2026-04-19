export function rankCoursesForUser(user, courses) {
  const interests = user?.interests || []
  return [...courses].sort((a, b) => {
    const aScore = (a.tags || []).filter((tag) => interests.includes(tag)).length + (a.averageRating || 0)
    const bScore = (b.tags || []).filter((tag) => interests.includes(tag)).length + (b.averageRating || 0)
    return bScore - aScore
  })
}

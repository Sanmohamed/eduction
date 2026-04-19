import Resource from '../models/Resource.js'

export async function getResources(req, res) {
  try {
    const safequery = req.query.q
      ? String(req.query.q).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
      : ''

    const {
      type = '',
      category = '',
      featured,
      audience,
      sort = ''
    } = req.query

    const filter = {}

    if (type) filter.type = type
    if (category) filter.category = category

    let sortOption = { featured: -1, createdAt: -1 }
    if (sort === 'latest') sortOption = { createdAt: -1 }
    if (sort === 'oldest') sortOption = { createdAt: 1 }

    // 🔥 featured filter
    if (featured === 'true') filter.featured = true

    // 🔥 audience filter
    if (audience) {
      const audiences = audience.split(',')
      filter.audience = { $in: audiences}
    }

    // 🔥 search
    if (safequery) {
      filter.$or = [
        { title: { $regex: safequery, $options: 'i' } },
        { description: { $regex: safequery, $options: 'i' } },
        { tags: { $elemMatch: { $regex: safequery, $options: 'i' } } },
      ]
    }

    // 🔥 pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50)

    // 🔥 sorting
   

    const resources = await Resource.find(filter)
      .select('title description type category featured createdAt url')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Resource.countDocuments(filter)

    return res.json({
      success: true,
      resources,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    })

  } catch (error) {
    console.error('Error fetching resources:', error)
    return res.status(500).json({
      success: false,
      message: 'Server error',
    })
  }
}
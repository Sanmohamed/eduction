import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import connectDB from '../config/db.js'
import User from '../models/User.js'
import Course from '../models/Course.js'
import Resource from '../models/Resource.js'
import Complaint from '../models/Complaint.js'
import Notification from '../models/Notification.js'

dotenv.config()
await connectDB()
await Promise.all([User.deleteMany({}), Course.deleteMany({}), Resource.deleteMany({}), Complaint.deleteMany({}), Notification.deleteMany({})])
const password = await bcrypt.hash('123456', 10)
const instructor = await User.create({ name: 'Instructor Demo', email: 'instructor@example.com', password, role: 'instructor', interests: ['react','node','mongodb'] })
const admin = await User.create({ name: 'Admin Demo', email: 'admin@example.com', password, role: 'admin' })
const student = await User.create({ name: 'Student Demo', email: 'student@example.com', password, role: 'student', interests: ['react','ui','backend'] })
await Course.create({ title: 'React from Zero to Production', subtitle: 'Modern React, routing, context, and scalable structure', description: 'A complete React course', category: 'Web Development', level: 'Intermediate', language: 'English', price: 99, discountPrice: 49, tags: ['react','ui','frontend'], status: 'published', instructor: instructor._id, sections: [{ title: 'Getting Started', order: 1, lectures: [{ title: 'Intro', order: 1, durationInMinutes: 10, isPreview: true }] }] })
await Resource.insertMany([
  { title: 'Frontend Scholarship 2026', description: 'Scholarship for students learning web development.', type: 'scholarship', category: 'Funding', url: 'https://example.com/scholarship', featured: true, tags: ['frontend','scholarship'] },
  { title: 'Free MongoDB Practice Guide', description: 'A curated article to practice MongoDB and Mongoose.', type: 'article', category: 'Backend', url: 'https://example.com/mongodb-guide', tags: ['mongodb','backend'] },
  { title: 'Career Certificate Planner', description: 'A checklist to help students prepare professional certificates.', type: 'certificate', category: 'Career', url: 'https://example.com/certificate-planner', tags: ['career','certificate'] },
])
await Complaint.create({ user: student._id, subject: 'Video loading issue', category: 'technical', message: 'The preview lecture is buffering too much.', status: 'in_review', priority: 'medium', adminReply: 'We are checking the CDN settings.' })
await Notification.insertMany([
  { user: student._id, title: 'Welcome back', message: 'Your dashboard is ready and we added new resources for you.', type: 'system', actionUrl: '/student' },
  { user: student._id, title: 'New certificate guide', message: 'A new resource about certificates was added.', type: 'certificate', actionUrl: '/resources' },
  { user: instructor._id, title: 'Course performance update', message: 'Your course has fresh student activity this week.', type: 'course', actionUrl: '/instructor' },
  { user: admin._id, title: 'Support queue update', message: 'A complaint requires admin attention.', type: 'complaint', actionUrl: '/admin' },
])
console.log('Seed complete')
process.exit(0)

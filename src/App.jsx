import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import AdminLayout from './components/layout/AdminLayout'
import InstructorLayout from './components/layout/InstructorLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import CatalogPage from './pages/CatalogPage'
import CourseDetailsPage from './pages/CourseDetailsPage'
import WishlistPage from './pages/WishlistPage'
import ResourcesPage from './pages/ResourcesPage'
import ComplaintsPage from './pages/user/ComplaintsPage'
import NotificationsPage from './pages/user/NotificationsPage'
import CheckoutPage from './pages/CheckoutPage'
import StudentDashboardPage from './pages/student/StudentDashboardPage'
import CertificatesPage from './pages/student/CertificatesPage'
import InstructorDashboardPage from './pages/instructor/InstructorDashboardPage'
import CreateCoursePage from './pages/instructor/CreateCoursePage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import UsersPage from './pages/admin/UsersPage'
import CoursesAdminPage from './pages/admin/CoursesAdminPage'
import ProfilePage from './pages/user/ProfilePage'
import CoursePlayerPage from './pages/CoursePlayerPage'
import StudentAnalyticsPage from './pages/student/StudentAnalyticsPage'
import CertificateViewPage from './pages/student/CertificateViewPage'
import GamificationPage from './pages/student/GamificationPage'
import PaymentsAdminPage from './pages/admin/PaymentsAdminPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/courses/:id" element={<CourseDetailsPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route
            path="/complaints"
            element={
              <ProtectedRoute roles={['student', 'admin', 'instructor']}>
                <ComplaintsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute roles={['student', 'admin', 'instructor']}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/student"
            element={
              <ProtectedRoute roles={['student', 'admin', 'instructor']}>
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/certificates"
            element={
              <ProtectedRoute roles={['student', 'admin', 'instructor']}>
                <CertificatesPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="/courses/:id/learn" element={<CoursePlayerPage />} />
        <Route path="/certificate/:id" element={<CertificateViewPage />} />
        <Route path="/student/analytics" element={<StudentAnalyticsPage />} />
        <Route path="/student/gamification" element={<GamificationPage />} />

        <Route
          path="/instructor"
          element={
            <ProtectedRoute roles={['instructor', 'admin']}>
              <InstructorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<InstructorDashboardPage />} />
          <Route path="create-course" element={<CreateCoursePage />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="courses" element={<CoursesAdminPage />} />
          <Route path="payments" element={<PaymentsAdminPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
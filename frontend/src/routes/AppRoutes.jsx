import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from '@/layouts/PublicLayout'
import StagiaireLayout from '@/layouts/StagiaireLayout'
import AdminLayout from '@/layouts/AdminLayout'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import NotFoundPage from '@/pages/NotFoundPage'
import OffresListPage from '@/pages/OffresListPage'
import OffreDetailPage from '@/pages/OffreDetailPage'
import EmploymentStatusPage from '@/pages/EmploymentStatusPage'
import ProfilPage from '@/pages/stagiaire/ProfilPage'
import CvBuilderPage from '@/pages/stagiaire/CvBuilderPage'
import CandidaturesPage from '@/pages/stagiaire/CandidaturesPage'
import DashboardPage from '@/pages/admin/DashboardPage'
import OffresManagePage from '@/pages/admin/OffresManagePage'
import StagiairesListPage from '@/pages/admin/StagiairesListPage'
import CandidaturesManagePage from '@/pages/admin/CandidaturesManagePage'
import CvPrintPage from '@/pages/admin/CvPrintPage'
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import GuestRoute from '@/features/auth/GuestRoute'

import { useAuthStore } from '@/stores/authStore'

export default function AppRoutes() {
  const { user } = useAuthStore()

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element={
            user?.role === 'stagiaire' ? (
              <Navigate to="/espace/profil" replace />
            ) : (
              <HomePage />
            )
          }
        />
        <Route path="/offres" element={<OffresListPage />} />
        <Route path="/offres/:id" element={<OffreDetailPage />} />
        <Route path="/inscription/emploi" element={<EmploymentStatusPage />} />
      </Route>

      <Route element={<GuestRoute><PublicLayout /></GuestRoute>}>
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/inscription" element={<RegisterPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute role="stagiaire">
            <StagiaireLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/espace" element={<Navigate to="/espace/profil" replace />} />
        <Route path="/espace/profil" element={<ProfilPage />} />
        <Route path="/espace/cv" element={<CvBuilderPage />} />
        <Route path="/espace/candidatures" element={<CandidaturesPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/offres" element={<OffresManagePage />} />
        <Route path="/admin/stagiaires" element={<StagiairesListPage />} />
        <Route path="/admin/candidatures" element={<CandidaturesManagePage />} />
        <Route path="/admin/stagiaires/:id/cv/print" element={<CvPrintPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

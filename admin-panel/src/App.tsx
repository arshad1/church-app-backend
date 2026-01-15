import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberForm from './pages/MemberForm';
import MemberDetails from './pages/MemberDetails';
import Layout from './components/Layout';
import Families from './pages/Families';
import FamilyForm from './pages/FamilyForm';
import FamilyDetails from './pages/FamilyDetails';
import Ministries from './pages/Ministries';
import MinistryDetails from './pages/MinistryDetails';
import Events from './pages/Events';
import Users from './pages/Users';
import Sacraments from './pages/Sacraments';
import Settings from './pages/Settings';
import Gallery from './pages/Gallery';
import AlbumDetails from './pages/AlbumDetails';
import Notifications from './pages/Notifications';
import DailyVerses from './pages/DailyVerses';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/members" element={<Members />} />
                <Route path="/members/add" element={<MemberForm />} />
                <Route path="/members/:id" element={<MemberDetails />} />
                <Route path="/members/:id/edit" element={<MemberForm />} />
                <Route path="/users" element={<Users />} />

                {/* Families Routes */}
                <Route path="/families" element={<Families />} />
                <Route path="/families/add" element={<FamilyForm />} />
                <Route path="/families/:id" element={<FamilyDetails />} />
                <Route path="/families/:id/edit" element={<FamilyForm />} />

                {/* Community Routes */}
                <Route path="/ministries" element={<Ministries />} />
                <Route path="/ministries/:id" element={<MinistryDetails />} />
                <Route path="/events" element={<Events />} />
                <Route path="/sacraments" element={<Sacraments />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/gallery/albums/:id" element={<AlbumDetails />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/daily-verses" element={<DailyVerses />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter basename="/admin">
          <AppRoutes />
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;

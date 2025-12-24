import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import MyWards from './pages/Agent/MyWards';
import HouseholdList from './pages/Agent/HouseholdList';
import Dashboard from './pages/WardMember/Dashboard';
import WardList from './pages/Admin/WardList';
import AdminDashboard from './pages/Admin/Dashboard';

const PrivateRoute = ({ children, roles }) => {
  // ... existing code ...
};

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Default redirect based on role */}
      <Route path="/" element={
        user ? (
          user.role === 'AGENT' ? <Navigate to="/my-wards" /> :
            user.role === 'WARD_MEMBER' ? <Navigate to="/dashboard" /> :
              <Navigate to="/admin/dashboard" />
        ) : <Navigate to="/login" />
      } />

      {/* ... existing routes ... */}

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <PrivateRoute roles={['SUPER_ADMIN']}>
          <AdminDashboard />
        </PrivateRoute>
      } />
      <Route path="/admin/wards" element={
        <PrivateRoute roles={['SUPER_ADMIN']}>
          <WardList />
        </PrivateRoute>
      } />
      <Route path="/admin/users" element={
        <PrivateRoute roles={['SUPER_ADMIN']}>
          <div style={{ padding: '2rem' }}>User Management Placeholder</div>
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default App;

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import MyWards from './pages/Agent/MyWards';
import HouseholdList from './pages/Agent/HouseholdList';
import Dashboard from './pages/WardMember/Dashboard';
import AgentManagement from './pages/WardMember/AgentManagement';
import WardList from './pages/Admin/WardList';
import AdminDashboard from './pages/Admin/Dashboard';
import WardMemberManagement from './pages/Admin/WardMemberManagement';
import UserManagement from './pages/Admin/UserManagement';
import WardHouseholdsRedirect from './pages/WardMember/WardHouseholdsRedirect';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--slate-600)' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
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

      {/* Agent Routes */}
      <Route path="/my-wards" element={
        <PrivateRoute roles={['AGENT']}>
          <MyWards />
        </PrivateRoute>
      } />
      <Route path="/ward/:wardId/households" element={
        <PrivateRoute roles={['AGENT']}>
          <HouseholdList />
        </PrivateRoute>
      } />

      {/* Ward Member Routes */}
      <Route path="/dashboard" element={
        <PrivateRoute roles={['WARD_MEMBER']}>
          <Dashboard />
        </PrivateRoute>
      } />
      <Route path="/ward-member/agents" element={
        <PrivateRoute roles={['WARD_MEMBER']}>
          <AgentManagement />
        </PrivateRoute>
      } />
      <Route path="/ward-member/ward/:wardId/households" element={
        <PrivateRoute roles={['WARD_MEMBER']}>
          <HouseholdList />
        </PrivateRoute>
      } />
      <Route path="/ward-member/households" element={
        <PrivateRoute roles={['WARD_MEMBER']}>
          <WardHouseholdsRedirect />
        </PrivateRoute>
      } />

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
          <UserManagement />
        </PrivateRoute>
      } />
      <Route path="/admin/ward-members" element={
        <PrivateRoute roles={['SUPER_ADMIN']}>
          <WardMemberManagement />
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default App;

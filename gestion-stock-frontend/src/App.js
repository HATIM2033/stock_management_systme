import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import Layout from './components/Layout/Layout';

// Auth
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './pages/Auth/Login';

// Pages
import Dashboard from './pages/Dashboard/Dashboard'; // Admin Dashboard
import UserDashboard from './pages/Dashboard/UserDashboard'; // ✅ Zt had l-import
import ProductList from './pages/Products/ProductList';
import ProductForm from './pages/Products/ProductForm';
import ProductDetail from './pages/Products/ProductDetail';
import SaleForm from './pages/Sales/SaleForm';
import SaleHistory from './pages/Sales/SaleHistory';
import SaleDetail from './pages/Sales/SaleDetail';
import CategoryList from './pages/Categories/CategoryList';
import FournisseurList from './pages/Fournisseurs/FournisseurList';
import AlertList from './pages/Alerts/AlertList';
import UserList from './pages/Users/UserList';
import UserForm from './pages/Users/UserForm';
import Register from './pages/Auth/Register';

// ✅ Admin-only route wrapper
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// ✅ Dashboard Router: Ta-t-khayyar bin Admin w User
const DashboardRouter = () => {
  const { user } = useAuth();
  return user?.role === 'admin' ? <Dashboard /> : <UserDashboard />;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Navigate to="/dashboard" replace />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* ✅ Dashboard Route m-updatya bach t-supporti l-roles b-jouj */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <DashboardRouter />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/produits" element={
              <ProtectedRoute>
                <Layout>
                  <ProductList />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Admin-only: Add Product */}
            <Route path="/produits/add" element={
              <ProtectedRoute>
                <AdminRoute>
                  <Layout>
                    <ProductForm />
                  </Layout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            
            {/* Admin-only: Edit Product */}
            <Route path="/produits/:id/edit" element={
              <ProtectedRoute>
                <AdminRoute>
                  <Layout>
                    <ProductForm />
                  </Layout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/produits/:id" element={
              <ProtectedRoute>
                <Layout>
                  <ProductDetail />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/ventes" element={
              <ProtectedRoute>
                <Layout>
                  <SaleForm />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/ventes/history" element={
              <ProtectedRoute>
                <Layout>
                  <SaleHistory />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/ventes/:id" element={
              <ProtectedRoute>
                <Layout>
                  <SaleDetail />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Admin-only routes */}
            <Route path="/categories" element={
              <ProtectedRoute adminOnly={true}>
                <Layout>
                  <CategoryList />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/fournisseurs" element={
              <ProtectedRoute adminOnly={true}>
                <Layout>
                  <FournisseurList />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/alertes" element={
              <ProtectedRoute adminOnly={true}>
                <Layout>
                  <AlertList />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/utilisateurs" element={
              <ProtectedRoute adminOnly={true}>
                <Layout>
                  <UserList />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/utilisateurs/add" element={
              <ProtectedRoute adminOnly={true}>
                <Layout>
                  <UserForm />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/utilisateurs/:id/edit" element={
              <ProtectedRoute adminOnly={true}>
                <Layout>
                  <UserForm />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-8">Page non trouvée</p>
                  <a
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700"
                  >
                    Retour au tableau de bord
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
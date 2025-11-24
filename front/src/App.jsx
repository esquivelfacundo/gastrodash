import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pedidos from './pages/Pedidos';
import ChefPanel from './pages/ChefPanel';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Products from './pages/Products';
import Ingredients from './pages/Ingredients';
import Recipes from './pages/Recipes';
import Accounting from './pages/Accounting';
import Reports from './pages/Reports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rutas protegidas */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pedidos" 
            element={
              <ProtectedRoute>
                <Pedidos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chef-panel" 
            element={
              <ProtectedRoute>
                <ChefPanel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute permission="users.read">
                <Users />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute permission="settings.read">
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products" 
            element={
              <ProtectedRoute permission="products.read">
                <Products />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ingredients" 
            element={
              <ProtectedRoute permission="ingredients.read">
                <Ingredients />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recipes" 
            element={
              <ProtectedRoute permission="recipes.read">
                <Recipes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/accounting" 
            element={
              <ProtectedRoute permission="accounting.read">
                <Accounting />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute permission="reports.read">
                <Reports />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

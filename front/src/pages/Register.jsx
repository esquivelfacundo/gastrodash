import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  // Datos del restaurante
  const [tenantData, setTenantData] = useState({
    name: '',
    slug: '',
    phone: '',
    email: '',
    address: '',
    plan: 'basic'
  });

  // Datos del usuario
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleTenantChange = (e) => {
    const { name, value } = e.target;
    setTenantData(prev => ({
      ...prev,
      [name]: value,
      // Auto-generar slug desde el nombre
      ...(name === 'name' && { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })
    }));
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!tenantData.name || !tenantData.phone || !tenantData.email || !tenantData.address) {
      setError('Por favor completa todos los campos');
      return false;
    }
    if (!/^[+]?[\d\s-()]+$/.test(tenantData.phone)) {
      setError('Teléfono inválido');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tenantData.email)) {
      setError('Email inválido');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!userData.first_name || !userData.last_name || !userData.email || !userData.password) {
      setError('Por favor completa todos los campos');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      setError('Email inválido');
      return false;
    }
    if (userData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    if (userData.password !== userData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateStep2()) return;

    setLoading(true);

    const { confirmPassword, ...userDataToSend } = userData;
    const result = await register(tenantData, userDataToSend);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Error al registrar restaurante');
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-left"></div>
      
      <div className="register-right">
        <div className="brand-header">
          <div className="brand-logo">GastroDash</div>
          <div className="brand-subtitle">Registro de Restaurante</div>
        </div>

        {/* Indicador de progreso */}
        <div className="progress-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Restaurante</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Usuario</div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Paso 1: Datos del Restaurante */}
        {step === 1 && (
          <form className="register-form">
            <h3>Información del Restaurante</h3>
            
            <div className="form-group">
              <label htmlFor="name">Nombre del Restaurante *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={tenantData.name}
                onChange={handleTenantChange}
                placeholder="Ej: Plaza Nadal"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="slug">Slug (URL) *</label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={tenantData.slug}
                onChange={handleTenantChange}
                placeholder="plaza-nadal"
                required
              />
              <small>Se usará en la URL: gastrodash.com/{tenantData.slug}</small>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Teléfono *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={tenantData.phone}
                onChange={handleTenantChange}
                placeholder="+54 379 4123456"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email del Restaurante *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={tenantData.email}
                onChange={handleTenantChange}
                placeholder="contacto@restaurante.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Dirección *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={tenantData.address}
                onChange={handleTenantChange}
                placeholder="Calle Principal 123"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="plan">Plan *</label>
              <select
                id="plan"
                name="plan"
                value={tenantData.plan}
                onChange={handleTenantChange}
                required
              >
                <option value="basic">Básico - Gratis</option>
                <option value="pro">Pro - $29/mes</option>
                <option value="enterprise">Enterprise - $99/mes</option>
              </select>
            </div>

            <button type="button" className="next-btn" onClick={handleNext}>
              Siguiente
            </button>

            <div className="register-footer">
              <p>¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p>
            </div>
          </form>
        )}

        {/* Paso 2: Datos del Usuario */}
        {step === 2 && (
          <form className="register-form" onSubmit={handleSubmit}>
            <h3>Información del Administrador</h3>
            
            <div className="form-group">
              <label htmlFor="first_name">Nombre *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={userData.first_name}
                onChange={handleUserChange}
                placeholder="Juan"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Apellido *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={userData.last_name}
                onChange={handleUserChange}
                placeholder="Pérez"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="user_email">Email *</label>
              <input
                type="email"
                id="user_email"
                name="email"
                value={userData.email}
                onChange={handleUserChange}
                placeholder="juan@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={userData.password}
                onChange={handleUserChange}
                placeholder="Mínimo 8 caracteres"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleUserChange}
                placeholder="Repite la contraseña"
                required
                disabled={loading}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="back-btn" onClick={handleBack} disabled={loading}>
                Atrás
              </button>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Registrando...' : 'Crear Cuenta'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;

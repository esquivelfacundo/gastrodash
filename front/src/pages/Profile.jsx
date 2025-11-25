import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Datos del perfil
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });

  // Datos de contraseña
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    const result = await updateProfile(profileData);

    if (result.success) {
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Error al actualizar perfil' });
    }

    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres' });
      return;
    }

    setLoading(true);

    const result = await changePassword(passwordData.oldPassword, passwordData.newPassword);

    if (result.success) {
      setMessage({ type: 'success', text: 'Contraseña cambiada correctamente' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Error al cambiar contraseña' });
    }

    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Mi perfil</h1>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <i className="fas fa-user"></i> Información Personal
        </button>
        <button 
          className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          <i className="fas fa-lock"></i> Cambiar Contraseña
        </button>
      </div>
      
      <div className="content-wrapper">

            {activeTab === 'info' && (
              <form className="profile-form" onSubmit={handleProfileSubmit}>
                <h3>Información Personal</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="first_name">Nombre *</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={profileData.first_name}
                      onChange={handleProfileChange}
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
                      value={profileData.last_name}
                      onChange={handleProfileChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={user?.email || ''}
                    disabled
                  />
                  <small>El email no se puede modificar</small>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Teléfono</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    placeholder="+54 379 4123456"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Rol</label>
                  <input
                    type="text"
                    value={user?.role || ''}
                    disabled
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            )}

            {activeTab === 'password' && (
              <form className="profile-form" onSubmit={handlePasswordSubmit}>
                <h3>Cambiar Contraseña</h3>

                <div className="form-group">
                  <label htmlFor="oldPassword">Contraseña Actual *</label>
                  <input
                    type="password"
                    id="oldPassword"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">Nueva Contraseña *</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Mínimo 8 caracteres"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmar Nueva Contraseña *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={loading}
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </form>
            )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;

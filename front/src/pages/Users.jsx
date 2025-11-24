import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';

const API_URL = 'http://localhost:3007';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'waiter',
    status: 'active'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Por ahora simulamos la carga
      setUsers([]);
      setLoading(false);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone: '',
      role: 'waiter',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      role: user.role,
      status: user.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      if (editingUser) {
        // Actualizar usuario
        setMessage({ type: 'success', text: 'Usuario actualizado correctamente' });
      } else {
        // Crear usuario
        const response = await axios.post(`${API_URL}/auth/users`, formData);
        if (response.data.success) {
          setMessage({ type: 'success', text: 'Usuario creado correctamente' });
          loadUsers();
        }
      }
      setShowModal(false);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Error al guardar usuario' 
      });
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      setMessage({ type: 'success', text: 'Usuario eliminado correctamente' });
      loadUsers();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Error al eliminar usuario' 
      });
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      owner: '#341656',
      admin: '#17a2b8',
      chef: '#ffc107',
      waiter: '#28a745',
      viewer: '#6c757d'
    };

    const names = {
      owner: 'Propietario',
      admin: 'Administrador',
      chef: 'Chef',
      waiter: 'Mesero',
      viewer: 'Visualizador'
    };

    return (
      <span className="badge" style={{ backgroundColor: colors[role] }}>
        {names[role]}
      </span>
    );
  };

  return (
    <div className="page-container">
      <Header />
      
      <div className="content-wrapper">
        <div className="page-header">
          <div>
            <h1>Gestión de Usuarios</h1>
            <p>Administra los usuarios de tu restaurante</p>
          </div>
          <button className="btn-primary" onClick={handleCreate}>
            <i className="fas fa-plus"></i> Nuevo Usuario
          </button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="card">
          {loading ? (
            <div className="loading">Cargando usuarios...</div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-users fa-3x"></i>
              <h3>No hay usuarios</h3>
              <p>Crea el primer usuario para tu equipo</p>
              <button className="btn-primary" onClick={handleCreate}>
                Crear Usuario
              </button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Último acceso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-small">
                          {user.first_name[0]}{user.last_name[0]}
                        </div>
                        <span>{user.first_name} {user.last_name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>
                      <span className={`badge ${user.status === 'active' ? 'success' : 'danger'}`}>
                        {user.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>{user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Nunca'}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" onClick={() => handleEdit(user)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn-icon danger" onClick={() => handleDelete(user.id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar Usuario */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Apellido *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={editingUser !== null}
                  />
                </div>

                {!editingUser && (
                  <div className="form-group">
                    <label>Contraseña *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+54 379 4123456"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Rol *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="admin">Administrador</option>
                      <option value="chef">Chef</option>
                      <option value="waiter">Mesero</option>
                      <option value="viewer">Visualizador</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Estado *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

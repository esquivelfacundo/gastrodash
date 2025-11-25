import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Header from '../components/Header';

const API_URL = 'http://localhost:3007';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadReservations();
    // Actualizar cada 30 segundos
    const interval = setInterval(loadReservations, 30000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const loadReservations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reservations?date=${selectedDate}`);
      if (response.data.success) {
        setReservations(response.data.reservations);
      }
    } catch (error) {
      console.error('Error cargando reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/reservations/${id}/status`, { status: newStatus });
      loadReservations();
    } catch (error) {
      console.error('Error actualizando reserva:', error);
      alert('Error al actualizar la reserva');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      confirmed: '#2196f3',
      seated: '#9c27b0',
      completed: '#4caf50',
      cancelled: '#f44336',
      no_show: '#666',
    };
    return colors[status] || '#666';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      seated: 'En Preparación',
      completed: 'Entregado',
      cancelled: 'Cancelado',
      no_show: 'No Retiró',
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5); // HH:MM
  };

  return (
    <div className="dashboard-container">
      <Header />
      
      <div className="main-content">
        <div className="left-panel">
          <h2>Navegación</h2>
          <button className="nav-btn active" onClick={() => navigate('/dashboard')}>
            <i className="fas fa-home"></i> Dashboard
          </button>
          <button className="nav-btn" onClick={() => navigate('/pedidos')}>
            <i className="fas fa-shopping-cart"></i> Pedidos
          </button>
          <button className="nav-btn" onClick={() => navigate('/products')}>
            <i className="fas fa-utensils"></i> Productos
          </button>
          <button className="nav-btn" onClick={() => navigate('/accounting')}>
            <i className="fas fa-chart-line"></i> Contabilidad
          </button>
          <button className="nav-btn" onClick={() => navigate('/chef-panel')}>
            <i className="fas fa-fire"></i> Panel Cocinero
          </button>
        </div>

        <div className="content-area">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h1 style={{ margin: '0 0 10px 0' }}>RESERVAS</h1>
              <p style={{ margin: '0', color: '#666' }}>
                {formatDate(selectedDate + 'T00:00:00')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '10px',
                  fontSize: '16px',
                  border: '2px solid #341656',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              />
              <button 
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                style={{
                  padding: '10px 20px',
                  background: '#341656',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  whiteSpace: 'nowrap'
                }}
              >
                Hoy
              </button>
            </div>
          </div>

          {/* Lista de Reservas */}
          <div className="section">
            {loading ? (
              <p>Cargando reservas...</p>
            ) : reservations.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                background: '#f5f5f5', 
                borderRadius: '12px',
                marginTop: '20px'
              }}>
                <i className="fas fa-calendar-times" style={{ fontSize: '48px', color: '#999', marginBottom: '16px' }}></i>
                <p style={{ fontSize: '18px', color: '#666' }}>No hay reservas para esta fecha</p>
              </div>
            ) : (
              <div style={{ marginTop: '20px' }}>
                {reservations.map((reservation) => (
                  <div 
                    key={reservation.id} 
                    style={{
                      background: 'white',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '16px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#333' }}>
                          {reservation.customer_name}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
                          <div>
                            <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                              <i className="fas fa-clock" style={{ marginRight: '8px', color: '#341656' }}></i>
                              <strong>Hora de Retiro:</strong> {formatTime(reservation.reservation_time)}
                            </p>
                            <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                              <i className="fas fa-box" style={{ marginRight: '8px', color: '#341656' }}></i>
                              <strong>Cantidad:</strong> {reservation.number_of_people} {reservation.number_of_people === 1 ? 'unidad' : 'unidades'}
                            </p>
                          </div>
                          <div>
                            <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                              <i className="fas fa-phone" style={{ marginRight: '8px', color: '#341656' }}></i>
                              {reservation.customer_phone || 'Sin teléfono'}
                            </p>
                            {reservation.customer_email && (
                              <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                                <i className="fas fa-envelope" style={{ marginRight: '8px', color: '#341656' }}></i>
                                {reservation.customer_email}
                              </p>
                            )}
                          </div>
                        </div>
                        {reservation.notes && (
                          <p style={{ 
                            margin: '12px 0 0 0', 
                            padding: '12px', 
                            background: '#f9f9f9', 
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: '#555'
                          }}>
                            <i className="fas fa-sticky-note" style={{ marginRight: '8px', color: '#341656' }}></i>
                            {reservation.notes}
                          </p>
                        )}
                      </div>
                      <div style={{ marginLeft: '20px' }}>
                        <span 
                          style={{
                            background: getStatusColor(reservation.status),
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            display: 'inline-block',
                            marginBottom: '12px'
                          }}
                        >
                          {getStatusText(reservation.status)}
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {reservation.status === 'confirmed' && (
                            <button
                              onClick={() => updateReservationStatus(reservation.id, 'seated')}
                              style={{
                                padding: '8px 16px',
                                background: '#9c27b0',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px'
                              }}
                            >
                              Preparar
                            </button>
                          )}
                          {reservation.status === 'seated' && (
                            <button
                              onClick={() => updateReservationStatus(reservation.id, 'completed')}
                              style={{
                                padding: '8px 16px',
                                background: '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px'
                              }}
                            >
                              Entregar
                            </button>
                          )}
                          {['pending', 'confirmed'].includes(reservation.status) && (
                            <button
                              onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                              style={{
                                padding: '8px 16px',
                                background: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px'
                              }}
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';

const API_URL = 'http://localhost:3007';

const Dashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

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
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      seated: '#a855f7',
      completed: '#10b981',
      cancelled: '#ef4444',
      no_show: '#6b7280',
    };
    return colors[status] || '#6b7280';
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
    <DashboardLayout>
            <div className="page-header-with-actions">
              <h1>Reservas</h1>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    padding: '10px',
                    fontSize: '16px',
                    border: '2px solid var(--primary-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)'
                  }}
                />
                <button 
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--primary-color)',
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
                  background: 'var(--bg-secondary)', 
                  borderRadius: '12px',
                  marginTop: '20px',
                  border: '1px solid var(--border-color)'
                }}>
                  <i className="fas fa-calendar-times" style={{ fontSize: '48px', color: 'var(--text-secondary)', marginBottom: '16px' }}></i>
                  <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>No hay reservas para esta fecha</p>
                </div>
              ) : (
                <div style={{ marginTop: '20px' }}>
                  {reservations.map((reservation) => (
                    <div 
                      key={reservation.id} 
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '16px',
                        boxShadow: 'var(--shadow)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: 'var(--text-primary)' }}>
                            {reservation.customer_name}
                          </h3>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
                            <div>
                              <p style={{ margin: '4px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                <i className="fas fa-clock" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i>
                                <strong>Hora de Retiro:</strong> {formatTime(reservation.reservation_time)}
                              </p>
                              <p style={{ margin: '4px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                <i className="fas fa-box" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i>
                                <strong>Cantidad:</strong> {reservation.number_of_people} {reservation.number_of_people === 1 ? 'unidad' : 'unidades'}
                              </p>
                            </div>
                            <div>
                              <p style={{ margin: '4px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                <i className="fas fa-phone" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i>
                                {reservation.customer_phone || 'Sin teléfono'}
                              </p>
                              {reservation.customer_email && (
                                <p style={{ margin: '4px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                  <i className="fas fa-envelope" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i>
                                  {reservation.customer_email}
                                </p>
                              )}
                            </div>
                          </div>
                          {reservation.notes && (
                            <p style={{ 
                              margin: '12px 0 0 0', 
                              padding: '12px', 
                              background: 'var(--bg-tertiary)', 
                              borderRadius: '8px',
                              fontSize: '14px',
                              color: 'var(--text-secondary)'
                            }}>
                              <i className="fas fa-sticky-note" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i>
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
                                  background: 'var(--status-preparing)',
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
                                  background: 'var(--status-ready)',
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
                                  background: 'var(--status-cancelled)',
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
    </DashboardLayout>
  );
};

export default Dashboard;

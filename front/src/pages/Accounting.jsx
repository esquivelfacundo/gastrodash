import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import PinProtection from '../components/PinProtection';

const API_URL = 'http://localhost:3007';

const Accounting = () => {
  const [summary, setSummary] = useState({
    total_orders: 0,
    total_revenue: 0,
    average_order: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadSummary();
  }, [dateRange]);

  const loadSummary = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/accounting/summary`, {
        params: dateRange
      });
      if (response.data.success) {
        setSummary(response.data.summary);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error cargando resumen:', error);
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="page-container">
      <Header />
      
      <div className="content-wrapper">
        <PinProtection>
          <div className="page-header">
            <h1>Contabilidad</h1>
            <p>Resumen financiero de tu restaurante</p>
          </div>

          <div className="filters-card">
            <div className="form-row">
              <div className="form-group">
                <label>Fecha Inicio</label>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                />
              </div>
              <div className="form-group">
                <label>Fecha Fin</label>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading">Cargando resumen...</div>
          ) : (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-shopping-cart"></i>
                </div>
                <div className="stat-info">
                  <h3>Total Pedidos</h3>
                  <p className="stat-value">{summary.total_orders || 0}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon success">
                  <i className="fas fa-dollar-sign"></i>
                </div>
                <div className="stat-info">
                  <h3>Ingresos Totales</h3>
                  <p className="stat-value">${parseFloat(summary.total_revenue || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon info">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="stat-info">
                  <h3>Ticket Promedio</h3>
                  <p className="stat-value">${parseFloat(summary.average_order || 0).toFixed(2)}</p>
                </div>
              </div>
          </div>
        )}
        </PinProtection>
      </div>
    </div>
  );
};

export default Accounting;

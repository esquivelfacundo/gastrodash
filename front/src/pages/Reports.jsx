import { useState } from 'react';
import Header from '../components/Header';

const Reports = () => {
  const [message, setMessage] = useState({ type: '', text: '' });

  return (
    <div className="page-container">
      <Header />
      
      <div className="content-wrapper">
        <div className="page-header">
          <h1>Reportes</h1>
          <p>Análisis y estadísticas de tu restaurante</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="reports-grid">
          <div className="report-card">
            <i className="fas fa-chart-bar fa-2x"></i>
            <h3>Productos Más Vendidos</h3>
            <p>Análisis de productos más populares</p>
            <button className="btn-secondary">Ver Reporte</button>
          </div>

          <div className="report-card">
            <i className="fas fa-calendar-alt fa-2x"></i>
            <h3>Ventas por Período</h3>
            <p>Ventas diarias, semanales y mensuales</p>
            <button className="btn-secondary">Ver Reporte</button>
          </div>

          <div className="report-card">
            <i className="fas fa-clock fa-2x"></i>
            <h3>Horarios Pico</h3>
            <p>Análisis de horarios con más pedidos</p>
            <button className="btn-secondary">Ver Reporte</button>
          </div>

          <div className="report-card">
            <i className="fas fa-credit-card fa-2x"></i>
            <h3>Métodos de Pago</h3>
            <p>Distribución de métodos de pago</p>
            <button className="btn-secondary">Ver Reporte</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

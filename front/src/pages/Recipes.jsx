import { useState } from 'react';
import Header from '../components/Header';

const Recipes = () => {
  const [message, setMessage] = useState({ type: '', text: '' });

  return (
    <div className="page-container">
      <Header />
      
      <div className="content-wrapper">
        <div className="page-header">
          <h1>Recetas</h1>
          <p>Gestiona las recetas de tus productos</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="empty-state">
          <i className="fas fa-book fa-3x"></i>
          <h3>No hay recetas</h3>
          <p>Crea recetas para tus productos</p>
        </div>
      </div>
    </div>
  );
};

export default Recipes;

import { useState } from 'react';

const PinProtection = ({ children, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  // PIN por defecto: 1234 (puedes cambiarlo)
  const CORRECT_PIN = '1234';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (pin === CORRECT_PIN) {
      setIsUnlocked(true);
      setError('');
      if (onUnlock) onUnlock();
    } else {
      setError('PIN incorrecto');
      setPin('');
    }
  };

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo números
    if (value.length <= 4) {
      setPin(value);
      setError('');
    }
  };

  if (isUnlocked) {
    return children;
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#341656',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <i className="fas fa-lock" style={{ fontSize: '36px', color: 'white' }}></i>
        </div>
        
        <h2 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '24px' }}>
          Sección Protegida
        </h2>
        <p style={{ margin: '0 0 32px 0', color: '#666', fontSize: '14px' }}>
          Esta sección requiere un PIN de acceso
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength="4"
            value={pin}
            onChange={handlePinChange}
            placeholder="Ingrese PIN (4 dígitos)"
            autoFocus
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '24px',
              textAlign: 'center',
              border: error ? '2px solid #f44336' : '2px solid #e0e0e0',
              borderRadius: '12px',
              marginBottom: '16px',
              letterSpacing: '8px',
              fontWeight: 'bold',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
          />

          {error && (
            <p style={{
              color: '#f44336',
              fontSize: '14px',
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pin.length !== 4}
            style={{
              width: '100%',
              padding: '16px',
              background: pin.length === 4 ? '#341656' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: pin.length === 4 ? 'pointer' : 'not-allowed',
              transition: 'background 0.3s'
            }}
          >
            Desbloquear
          </button>
        </form>

        <p style={{
          marginTop: '24px',
          fontSize: '12px',
          color: '#999'
        }}>
          <i className="fas fa-info-circle" style={{ marginRight: '6px' }}></i>
          Solo usuarios autorizados pueden acceder
        </p>
      </div>
    </div>
  );
};

export default PinProtection;

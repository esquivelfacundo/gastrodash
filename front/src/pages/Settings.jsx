import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const Settings = () => {
  const { tenant } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [generalData, setGeneralData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    timezone: 'America/Argentina/Cordoba',
    currency: 'ARS',
    language: 'es'
  });

  const [whatsappData, setWhatsappData] = useState({
    whatsapp_phone: '',
    meta_access_token: '',
    meta_phone_number_id: '',
    meta_verify_token: ''
  });

  const [openaiData, setOpenaiData] = useState({
    openai_api_key: '',
    openai_model: 'gpt-4'
  });

  const [scheduleData, setScheduleData] = useState({
    monday: { enabled: true, open: '11:00', close: '15:00', open_dinner: '19:00', close_dinner: '23:00' },
    tuesday: { enabled: true, open: '11:00', close: '15:00', open_dinner: '19:00', close_dinner: '23:00' },
    wednesday: { enabled: true, open: '11:00', close: '15:00', open_dinner: '19:00', close_dinner: '23:00' },
    thursday: { enabled: true, open: '11:00', close: '15:00', open_dinner: '19:00', close_dinner: '23:00' },
    friday: { enabled: true, open: '11:00', close: '15:00', open_dinner: '19:00', close_dinner: '23:00' },
    saturday: { enabled: true, open: '11:00', close: '15:00', open_dinner: '19:00', close_dinner: '23:00' },
    sunday: { enabled: false, open: '', close: '', open_dinner: '', close_dinner: '' }
  });

  useEffect(() => {
    if (tenant) {
      setGeneralData({
        name: tenant.name || '',
        phone: tenant.phone || '',
        email: tenant.email || '',
        address: tenant.address || '',
        timezone: tenant.timezone || 'America/Argentina/Cordoba',
        currency: tenant.currency || 'ARS',
        language: tenant.language || 'es'
      });
    }
  }, [tenant]);

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralData(prev => ({ ...prev, [name]: value }));
  };

  const handleWhatsappChange = (e) => {
    const { name, value } = e.target;
    setWhatsappData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenaiChange = (e) => {
    const { name, value } = e.target;
    setOpenaiData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (day, field, value) => {
    setScheduleData(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    // Simular guardado
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Configuración general actualizada' });
      setLoading(false);
    }, 1000);
  };

  const handleWhatsappSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    setTimeout(() => {
      setMessage({ type: 'success', text: 'Configuración de WhatsApp actualizada' });
      setLoading(false);
    }, 1000);
  };

  const handleOpenaiSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    setTimeout(() => {
      setMessage({ type: 'success', text: 'Configuración de OpenAI actualizada' });
      setLoading(false);
    }, 1000);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    setTimeout(() => {
      setMessage({ type: 'success', text: 'Horarios actualizados' });
      setLoading(false);
    }, 1000);
  };

  const dayNames = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  };

  return (
    <div className="page-container">
      <Header />
      
      <div className="content-wrapper">
        <div className="page-header">
          <h1>Configuración</h1>
          <p>Gestiona la configuración de tu restaurante</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="settings-container">
          <div className="settings-sidebar">
            <button 
              className={`tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <i className="fas fa-cog"></i> General
            </button>
            <button 
              className={`tab ${activeTab === 'whatsapp' ? 'active' : ''}`}
              onClick={() => setActiveTab('whatsapp')}
            >
              <i className="fab fa-whatsapp"></i> WhatsApp & Meta
            </button>
            <button 
              className={`tab ${activeTab === 'openai' ? 'active' : ''}`}
              onClick={() => setActiveTab('openai')}
            >
              <i className="fas fa-robot"></i> OpenAI
            </button>
            <button 
              className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveTab('schedule')}
            >
              <i className="fas fa-clock"></i> Horarios
            </button>
          </div>

          <div className="settings-content">
            {activeTab === 'general' && (
              <form className="settings-form" onSubmit={handleGeneralSubmit}>
                <h3>Información General</h3>

                <div className="form-group">
                  <label>Nombre del Restaurante *</label>
                  <input
                    type="text"
                    name="name"
                    value={generalData.name}
                    onChange={handleGeneralChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Teléfono *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={generalData.phone}
                      onChange={handleGeneralChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={generalData.email}
                      onChange={handleGeneralChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Dirección *</label>
                  <input
                    type="text"
                    name="address"
                    value={generalData.address}
                    onChange={handleGeneralChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Zona Horaria</label>
                    <select
                      name="timezone"
                      value={generalData.timezone}
                      onChange={handleGeneralChange}
                      disabled={loading}
                    >
                      <option value="America/Argentina/Buenos_Aires">Buenos Aires</option>
                      <option value="America/Argentina/Cordoba">Córdoba</option>
                      <option value="America/Argentina/Mendoza">Mendoza</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Moneda</label>
                    <select
                      name="currency"
                      value={generalData.currency}
                      onChange={handleGeneralChange}
                      disabled={loading}
                    >
                      <option value="ARS">ARS - Peso Argentino</option>
                      <option value="USD">USD - Dólar</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            )}

            {activeTab === 'whatsapp' && (
              <form className="settings-form" onSubmit={handleWhatsappSubmit}>
                <h3>WhatsApp & Meta API</h3>

                <div className="form-group">
                  <label>Teléfono de WhatsApp</label>
                  <input
                    type="tel"
                    name="whatsapp_phone"
                    value={whatsappData.whatsapp_phone}
                    onChange={handleWhatsappChange}
                    placeholder="+54 379 4123456"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Meta Access Token</label>
                  <input
                    type="password"
                    name="meta_access_token"
                    value={whatsappData.meta_access_token}
                    onChange={handleWhatsappChange}
                    placeholder="EAAxxxxxxxx"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Meta Phone Number ID</label>
                  <input
                    type="text"
                    name="meta_phone_number_id"
                    value={whatsappData.meta_phone_number_id}
                    onChange={handleWhatsappChange}
                    placeholder="123456789"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Meta Verify Token</label>
                  <input
                    type="text"
                    name="meta_verify_token"
                    value={whatsappData.meta_verify_token}
                    onChange={handleWhatsappChange}
                    placeholder="mi_token_secreto"
                    disabled={loading}
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            )}

            {activeTab === 'openai' && (
              <form className="settings-form" onSubmit={handleOpenaiSubmit}>
                <h3>OpenAI Configuration</h3>

                <div className="form-group">
                  <label>OpenAI API Key</label>
                  <input
                    type="password"
                    name="openai_api_key"
                    value={openaiData.openai_api_key}
                    onChange={handleOpenaiChange}
                    placeholder="sk-xxxxxxxx"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Modelo</label>
                  <select
                    name="openai_model"
                    value={openaiData.openai_model}
                    onChange={handleOpenaiChange}
                    disabled={loading}
                  >
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            )}

            {activeTab === 'schedule' && (
              <form className="settings-form" onSubmit={handleScheduleSubmit}>
                <h3>Horarios de Apertura</h3>

                {Object.entries(scheduleData).map(([day, data]) => (
                  <div key={day} className="schedule-day">
                    <div className="day-header">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={data.enabled}
                          onChange={(e) => handleScheduleChange(day, 'enabled', e.target.checked)}
                          disabled={loading}
                        />
                        <span>{dayNames[day]}</span>
                      </label>
                    </div>

                    {data.enabled && (
                      <div className="day-times">
                        <div className="time-group">
                          <label>Almuerzo</label>
                          <div className="time-inputs">
                            <input
                              type="time"
                              value={data.open}
                              onChange={(e) => handleScheduleChange(day, 'open', e.target.value)}
                              disabled={loading}
                            />
                            <span>a</span>
                            <input
                              type="time"
                              value={data.close}
                              onChange={(e) => handleScheduleChange(day, 'close', e.target.value)}
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div className="time-group">
                          <label>Cena</label>
                          <div className="time-inputs">
                            <input
                              type="time"
                              value={data.open_dinner}
                              onChange={(e) => handleScheduleChange(day, 'open_dinner', e.target.value)}
                              disabled={loading}
                            />
                            <span>a</span>
                            <input
                              type="time"
                              value={data.close_dinner}
                              onChange={(e) => handleScheduleChange(day, 'close_dinner', e.target.value)}
                              disabled={loading}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Horarios'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

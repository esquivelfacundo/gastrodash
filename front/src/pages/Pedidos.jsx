import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

const API_URL = 'http://localhost:3007';

const Pedidos = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, confirmed, preparing
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showNewReservaModal, setShowNewReservaModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    serviceType: '',
    deliveryAddress: '',
    paymentMethod: '',
    notes: ''
  });

  const [reservaForm, setReservaForm] = useState({
    customerName: '',
    customerPhone: '',
    serviceType: '',
    deliveryAddress: '',
    paymentMethod: '',
    reservationDate: '',
    notes: ''
  });

  const [selectedReservaProducts, setSelectedReservaProducts] = useState([]);
  const [showReservaProductDropdown, setShowReservaProductDropdown] = useState(false);

  useEffect(() => {
    loadOrders();
    loadProducts();
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const loadProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products`, getAuthHeaders());
      if (response.data.success) {
        setProducts(response.data.products.filter(p => p.available));
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/orders/today`, getAuthHeaders());
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status: newStatus }, getAuthHeaders());
      loadOrders();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado del pedido');
    }
  };

  const getFilteredOrders = () => {
    if (filterStatus === 'all') return orders;
    if (filterStatus === 'confirmed') return orders.filter(o => o.status === 'confirmed');
    if (filterStatus === 'preparing') return orders.filter(o => o.status === 'preparing' || o.status === 'delayed');
    if (filterStatus === 'ready') return orders.filter(o => o.status === 'ready');
    return orders;
  };

  const getDeliveryOrders = () => {
    return orders.filter(o => o.service_type === 'delivery' && ['confirmed', 'preparing', 'delayed'].includes(o.status));
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  const addProduct = (product) => {
    const existing = selectedProducts.find(p => p.id === product.id);
    if (existing) {
      setSelectedProducts(selectedProducts.map(p => 
        p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
      ));
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeProduct(productId);
    } else {
      setSelectedProducts(selectedProducts.map(p => 
        p.id === productId ? { ...p, quantity } : p
      ));
    }
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  };

  const handleCreateOrder = async () => {
    if (!orderForm.customerName || !orderForm.customerPhone || !orderForm.serviceType || selectedProducts.length === 0) {
      alert('Por favor completa los campos requeridos y agrega al menos un producto');
      return;
    }

    try {
      const orderData = {
        customer_name: orderForm.customerName,
        customer_phone: orderForm.customerPhone,
        service_type: orderForm.serviceType,
        delivery_address: orderForm.deliveryAddress,
        payment_method: orderForm.paymentMethod,
        observations: orderForm.notes,
        items: selectedProducts.map(p => ({
          product_name: p.name,
          quantity: p.quantity,
          price: p.price
        })),
        total_amount: calculateTotal()
      };

      await axios.post(`${API_URL}/api/orders`, orderData, getAuthHeaders());
      setShowNewOrderModal(false);
      setOrderForm({
        customerName: '',
        customerPhone: '',
        serviceType: '',
        deliveryAddress: '',
        paymentMethod: '',
        notes: ''
      });
      setSelectedProducts([]);
      setShowProductDropdown(false);
      loadOrders();
      alert('Pedido creado exitosamente');
    } catch (error) {
      console.error('Error creando pedido:', error);
      alert('Error al crear el pedido: ' + (error.response?.data?.error || error.message));
    }
  };

  const addReservaProduct = (product) => {
    const existing = selectedReservaProducts.find(p => p.id === product.id);
    if (existing) {
      setSelectedReservaProducts(selectedReservaProducts.map(p => 
        p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
      ));
    } else {
      setSelectedReservaProducts([...selectedReservaProducts, { ...product, quantity: 1 }]);
    }
  };

  const removeReservaProduct = (productId) => {
    setSelectedReservaProducts(selectedReservaProducts.filter(p => p.id !== productId));
  };

  const updateReservaQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeReservaProduct(productId);
    } else {
      setSelectedReservaProducts(selectedReservaProducts.map(p => 
        p.id === productId ? { ...p, quantity } : p
      ));
    }
  };

  const calculateReservaTotal = () => {
    return selectedReservaProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  };

  const handleCreateReserva = async () => {
    if (!reservaForm.customerName || !reservaForm.customerPhone || !reservaForm.serviceType || !reservaForm.reservationDate || selectedReservaProducts.length === 0) {
      alert('Por favor completa los campos requeridos, selecciona una fecha y agrega al menos un producto');
      return;
    }

    try {
      const reservaData = {
        customer_name: reservaForm.customerName,
        customer_phone: reservaForm.customerPhone,
        customer_email: '',
        reservation_date: reservaForm.reservationDate,
        reservation_time: '12:00:00',
        number_of_people: selectedReservaProducts.reduce((sum, p) => sum + p.quantity, 0),
        service_type: reservaForm.serviceType,
        delivery_address: reservaForm.deliveryAddress,
        payment_method: reservaForm.paymentMethod,
        notes: reservaForm.notes,
        items_summary: selectedReservaProducts.map(p => `${p.name} x${p.quantity}`).join(', '),
        total_amount: calculateReservaTotal()
      };

      await axios.post(`${API_URL}/api/reservations`, reservaData, getAuthHeaders());
      setShowNewReservaModal(false);
      setReservaForm({
        customerName: '',
        customerPhone: '',
        serviceType: '',
        deliveryAddress: '',
        paymentMethod: '',
        reservationDate: '',
        notes: ''
      });
      setSelectedReservaProducts([]);
      setShowReservaProductDropdown(false);
      loadOrders();
      alert('Reserva creada exitosamente');
    } catch (error) {
      console.error('Error creando reserva:', error);
      alert('Error al crear la reserva: ' + (error.response?.data?.error || error.message));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800', // Temporal para pedidos antiguos
      confirmed: '#2196f3',
      preparing: '#9c27b0',
      delayed: '#ff5722',
      ready: '#4caf50',
      delivered: '#8bc34a',
      cancelled: '#f44336',
    };
    return colors[status] || '#666';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendiente', // Temporal para pedidos antiguos
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      delayed: 'Demorado',
      ready: 'Listo',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return texts[status] || status;
  };

  const OrderCard = ({ order }) => {
    const canDeliver = order.status === 'ready';
    const isPending = order.status === 'pending';
    
    return (
      <div style={{
        background: '#fafafa',
        border: '1px solid #e8e8e8',
        borderRadius: '8px',
        padding: '14px',
        marginBottom: '10px',
        transition: 'all 0.2s'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = '#f5f5f5';
        e.currentTarget.style.borderColor = '#d0d0d0';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = '#fafafa';
        e.currentTarget.style.borderColor = '#e8e8e8';
      }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#333' }}>Pedido #{order.id}</h3>
            <p style={{ margin: '0', color: '#666', fontSize: '13px' }}>
              <i className="fas fa-user" style={{ marginRight: '6px', fontSize: '12px' }}></i>
              {order.customer_name}
            </p>
          </div>
          <span style={{
            background: getStatusColor(order.status),
            color: 'white',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            {getStatusText(order.status)}
          </span>
        </div>
        <div style={{ fontSize: '13px', color: '#666', marginBottom: (canDeliver || isPending) ? '12px' : '0' }}>
          <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center' }}>
            <i className={`fas fa-${order.service_type === 'delivery' ? 'motorcycle' : 'shopping-bag'}`} style={{ marginRight: '8px', color: '#341656', fontSize: '12px', width: '14px' }}></i>
            <span>{order.service_type === 'delivery' ? 'Delivery' : 'Retiro'} - {order.delivery_address || 'En local'}</span>
          </p>
          <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center' }}>
            <i className="fas fa-dollar-sign" style={{ marginRight: '8px', color: '#341656', fontSize: '12px', width: '14px' }}></i>
            <span style={{ fontWeight: '600' }}>${parseFloat(order.total_amount).toFixed(2)}</span>
          </p>
          <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center' }}>
            <i className="fas fa-clock" style={{ marginRight: '8px', color: '#341656', fontSize: '12px', width: '14px' }}></i>
            <span>{formatTime(order.created_at)}</span>
          </p>
        </div>

        {/* Botón para pedidos antiguos en pending - TEMPORAL */}
        {isPending && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(order.id, 'confirmed');
            }}
            style={{
              width: '100%',
              padding: '8px',
              background: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#1976d2'}
            onMouseOut={(e) => e.target.style.background = '#2196f3'}
          >
            <i className="fas fa-arrow-right"></i> Enviar a Cocina
          </button>
        )}

        {/* Botón de acción solo para entregar */}
        {canDeliver && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(order.id, 'delivered');
            }}
            style={{
              width: '100%',
              padding: '8px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#388e3c'}
            onMouseOut={(e) => e.target.style.background = '#4caf50'}
          >
            <i className="fas fa-check-circle"></i> Marcar Entregado
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="page-container" style={{ background: '#f0f0f0', minHeight: '100vh' }}>
      <Header />
      
      <div style={{ padding: '24px 40px', maxWidth: '100%', margin: '0 auto' }}>
        {/* Layout de dos columnas */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1px 450px', 
          gap: '0', 
          marginBottom: '24px',
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          
          {/* Columna Izquierda - Pedidos */}
          <div style={{ padding: '24px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: '600', color: '#333' }}>Pedidos</h2>
            
            {/* Lista de Pedidos */}
            <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '8px', marginBottom: '20px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: '#999' }}>Cargando pedidos...</p>
                </div>
              ) : getFilteredOrders().length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fafafa', borderRadius: '8px', border: '1px dashed #ddd' }}>
                  <i className="fas fa-shopping-cart" style={{ fontSize: '42px', color: '#d0d0d0', marginBottom: '12px', display: 'block' }}></i>
                  <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>No hay pedidos en esta categoría</p>
                </div>
              ) : (
                getFilteredOrders().map(order => <OrderCard key={order.id} order={order} />)
              )}
            </div>

            {/* Filtros debajo de los pedidos */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              flexWrap: 'wrap',
              paddingTop: '16px',
              borderTop: '1px solid #e0e0e0'
            }}>
              <button
                onClick={() => setFilterStatus('all')}
                style={{
                  padding: '8px 18px',
                  background: filterStatus === 'all' ? '#341656' : 'transparent',
                  color: filterStatus === 'all' ? 'white' : '#333',
                  border: `2px solid ${filterStatus === 'all' ? '#341656' : '#ddd'}`,
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '13px',
                  transition: 'all 0.2s'
                }}
              >
                Todos ({orders.length})
              </button>
              <button
                onClick={() => setFilterStatus('confirmed')}
                style={{
                  padding: '8px 18px',
                  background: filterStatus === 'confirmed' ? '#2196f3' : 'transparent',
                  color: filterStatus === 'confirmed' ? 'white' : '#333',
                  border: `2px solid ${filterStatus === 'confirmed' ? '#2196f3' : '#ddd'}`,
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '13px',
                  transition: 'all 0.2s'
                }}
              >
                Confirmados ({orders.filter(o => o.status === 'confirmed').length})
              </button>
              <button
                onClick={() => setFilterStatus('preparing')}
                style={{
                  padding: '8px 18px',
                  background: filterStatus === 'preparing' ? '#9c27b0' : 'transparent',
                  color: filterStatus === 'preparing' ? 'white' : '#333',
                  border: `2px solid ${filterStatus === 'preparing' ? '#9c27b0' : '#ddd'}`,
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '13px',
                  transition: 'all 0.2s'
                }}
              >
                En Cocina ({orders.filter(o => ['preparing', 'delayed'].includes(o.status)).length})
              </button>
              <button
                onClick={() => setFilterStatus('ready')}
                style={{
                  padding: '8px 18px',
                  background: filterStatus === 'ready' ? '#4caf50' : 'transparent',
                  color: filterStatus === 'ready' ? 'white' : '#333',
                  border: `2px solid ${filterStatus === 'ready' ? '#4caf50' : '#ddd'}`,
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '13px',
                  transition: 'all 0.2s'
                }}
              >
                Listos ({orders.filter(o => o.status === 'ready').length})
              </button>
            </div>
          </div>

          {/* Línea divisoria vertical */}
          <div style={{ background: 'linear-gradient(to bottom, transparent, #d0d0d0 10%, #d0d0d0 90%, transparent)', width: '1px' }}></div>

          {/* Columna Derecha - Delivery */}
          <div style={{ padding: '24px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: '600', color: '#341656' }}>Delivery</h2>
            <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '8px' }}>
              {getDeliveryOrders().length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fafafa', borderRadius: '8px', border: '1px dashed #ddd' }}>
                  <i className="fas fa-motorcycle" style={{ fontSize: '42px', color: '#d0d0d0', marginBottom: '12px', display: 'block' }}></i>
                  <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>No hay deliverys pendientes</p>
                </div>
              ) : (
                getDeliveryOrders().map(order => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>
        </div>

        {/* Línea divisoria horizontal */}
        <div style={{ 
          height: '1px', 
          background: 'linear-gradient(to right, transparent, #d0d0d0 10%, #d0d0d0 90%, transparent)',
          margin: '24px 0'
        }}></div>

        {/* Botones Inferiores */}
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', padding: '20px 0' }}>
          <button
            onClick={() => setShowNewOrderModal(true)}
            style={{
              padding: '16px 50px',
              background: '#341656',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 3px 10px rgba(52, 22, 86, 0.25)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(52, 22, 86, 0.35)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 3px 10px rgba(52, 22, 86, 0.25)';
            }}
          >
            <i className="fas fa-plus" style={{ fontSize: '20px' }}></i>
            Nuevo Pedido
          </button>
          <button
            onClick={() => setShowNewReservaModal(true)}
            style={{
              padding: '16px 50px',
              background: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 3px 10px rgba(33, 150, 243, 0.25)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(33, 150, 243, 0.35)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 3px 10px rgba(33, 150, 243, 0.25)';
            }}
          >
            <i className="fas fa-plus" style={{ fontSize: '20px' }}></i>
            Nueva Reserva
          </button>
        </div>
      </div>

      {/* Modal Nuevo Pedido */}
      {showNewOrderModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowNewOrderModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Nuevo Pedido</h2>
              <button onClick={() => setShowNewOrderModal(false)} style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#999',
                padding: '4px'
              }}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Datos del Cliente */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                  Nombre del cliente
                </label>
                <input
                  type="text"
                  placeholder="Juan"
                  value={orderForm.customerName}
                  onChange={(e) => setOrderForm({...orderForm, customerName: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#f8f9fa',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  placeholder=""
                  value={orderForm.customerPhone}
                  onChange={(e) => setOrderForm({...orderForm, customerPhone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#f8f9fa',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Productos */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600' }}>Productos</h3>
              
              {/* Lista de productos seleccionados */}
              {selectedProducts.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  {selectedProducts.map(product => (
                    <div key={product.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      background: '#f8f9fa',
                      borderRadius: '6px',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '14px', flex: 1 }}>{product.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => updateQuantity(product.id, product.quantity - 1)}
                          style={{
                            width: '28px',
                            height: '28px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                        >-</button>
                        <span style={{ fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>{product.quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, product.quantity + 1)}
                          style={{
                            width: '28px',
                            height: '28px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                        >+</button>
                        <span style={{ fontSize: '14px', fontWeight: '600', minWidth: '60px', textAlign: 'right' }}>
                          ${(product.price * product.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeProduct(product.id)}
                          style={{
                            width: '28px',
                            height: '28px',
                            border: 'none',
                            borderRadius: '4px',
                            background: '#f44336',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón agregar producto con dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowProductDropdown(!showProductDropdown)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '2px dashed #341656',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: '#341656',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="fas fa-plus"></i>
                  Agregar producto
                </button>
                
                {showProductDropdown && products.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 10
                  }}>
                    {products.map(product => (
                      <div
                        key={product.id}
                        onClick={() => {
                          addProduct(product);
                          setShowProductDropdown(false);
                        }}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <span style={{ fontSize: '14px', color: '#333' }}>{product.name}</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#341656' }}>
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Detalles del Pedido */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600' }}>Detalles del pedido</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                    Tipo de servicio
                  </label>
                  <select
                    value={orderForm.serviceType}
                    onChange={(e) => setOrderForm({...orderForm, serviceType: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'white',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="delivery">Delivery</option>
                    <option value="takeaway">Retiro en local</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                    Delivery
                  </label>
                  <input
                    type="text"
                    placeholder="*solo se habilita si seleccionamos delivery en tipo de servicio*"
                    value={orderForm.deliveryAddress}
                    onChange={(e) => setOrderForm({...orderForm, deliveryAddress: e.target.value})}
                    disabled={orderForm.serviceType !== 'delivery'}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      background: orderForm.serviceType === 'delivery' ? '#f8f9fa' : '#f0f0f0',
                      boxSizing: 'border-box',
                      color: orderForm.serviceType === 'delivery' ? '#333' : '#999'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                  Método de pago
                </label>
                <select
                  value={orderForm.paymentMethod}
                  onChange={(e) => setOrderForm({...orderForm, paymentMethod: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Seleccionar...</option>
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="transfer">Transferencia</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                  Observaciones
                </label>
                <textarea
                  placeholder="Notas adicionales sobre el pedido..."
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#f8f9fa',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Total */}
            <div style={{
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: '600', color: '#666' }}>Total</span>
                <span style={{ fontSize: '32px', fontWeight: '700', color: '#341656' }}>
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botón Crear */}
            <button
              onClick={handleCreateOrder}
              style={{
                width: '100%',
                padding: '16px',
                background: '#341656',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <i className="fas fa-check"></i>
              Crear pedido
            </button>
          </div>
        </div>
      )}

      {/* Modal Nueva Reserva */}
      {showNewReservaModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowNewReservaModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Nueva Reserva</h2>
              <button onClick={() => setShowNewReservaModal(false)} style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#999',
                padding: '4px'
              }}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Datos del Cliente */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                  Nombre del cliente
                </label>
                <input
                  type="text"
                  placeholder="Juan"
                  value={reservaForm.customerName}
                  onChange={(e) => setReservaForm({...reservaForm, customerName: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#f8f9fa',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  placeholder=""
                  value={reservaForm.customerPhone}
                  onChange={(e) => setReservaForm({...reservaForm, customerPhone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#f8f9fa',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Productos */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600' }}>Productos</h3>
              
              {/* Lista de productos seleccionados */}
              {selectedReservaProducts.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  {selectedReservaProducts.map(product => (
                    <div key={product.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      background: '#f8f9fa',
                      borderRadius: '6px',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '14px', flex: 1 }}>{product.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => updateReservaQuantity(product.id, product.quantity - 1)}
                          style={{
                            width: '28px',
                            height: '28px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                        >-</button>
                        <span style={{ fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>{product.quantity}</span>
                        <button
                          onClick={() => updateReservaQuantity(product.id, product.quantity + 1)}
                          style={{
                            width: '28px',
                            height: '28px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                        >+</button>
                        <span style={{ fontSize: '14px', fontWeight: '600', minWidth: '60px', textAlign: 'right' }}>
                          ${(product.price * product.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeReservaProduct(product.id)}
                          style={{
                            width: '28px',
                            height: '28px',
                            border: 'none',
                            borderRadius: '4px',
                            background: '#f44336',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón agregar producto con dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowReservaProductDropdown(!showReservaProductDropdown)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '2px dashed #2196f3',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: '#2196f3',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="fas fa-plus"></i>
                  Agregar producto
                </button>
                
                {showReservaProductDropdown && products.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 10
                  }}>
                    {products.map(product => (
                      <div
                        key={product.id}
                        onClick={() => {
                          addReservaProduct(product);
                          setShowReservaProductDropdown(false);
                        }}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <span style={{ fontSize: '14px', color: '#333' }}>{product.name}</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#2196f3' }}>
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Detalles del Pedido */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600' }}>Detalles del pedido</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                    Tipo de servicio
                  </label>
                  <select
                    value={reservaForm.serviceType}
                    onChange={(e) => setReservaForm({...reservaForm, serviceType: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'white',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="delivery">Delivery</option>
                    <option value="takeaway">Retiro en local</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                    Delivery
                  </label>
                  <input
                    type="text"
                    placeholder="*solo se habilita si seleccionamos delivery en tipo de servicio*"
                    value={reservaForm.deliveryAddress}
                    onChange={(e) => setReservaForm({...reservaForm, deliveryAddress: e.target.value})}
                    disabled={reservaForm.serviceType !== 'delivery'}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      background: reservaForm.serviceType === 'delivery' ? '#f8f9fa' : '#f0f0f0',
                      boxSizing: 'border-box',
                      color: reservaForm.serviceType === 'delivery' ? '#333' : '#999'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                  Método de pago
                </label>
                <select
                  value={reservaForm.paymentMethod}
                  onChange={(e) => setReservaForm({...reservaForm, paymentMethod: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Seleccionar...</option>
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="transfer">Transferencia</option>
                </select>
              </div>

              {/* Campo de Fecha */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                  Fecha de reserva
                </label>
                <input
                  type="date"
                  value={reservaForm.reservationDate}
                  onChange={(e) => setReservaForm({...reservaForm, reservationDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#f8f9fa',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                  Observaciones
                </label>
                <textarea
                  placeholder="Notas adicionales sobre el pedido..."
                  value={reservaForm.notes}
                  onChange={(e) => setReservaForm({...reservaForm, notes: e.target.value})}
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#f8f9fa',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Total */}
            <div style={{
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: '600', color: '#666' }}>Total</span>
                <span style={{ fontSize: '32px', fontWeight: '700', color: '#2196f3' }}>
                  ${calculateReservaTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botón Crear */}
            <button
              onClick={handleCreateReserva}
              style={{
                width: '100%',
                padding: '16px',
                background: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <i className="fas fa-check"></i>
              Crear reserva
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedidos;

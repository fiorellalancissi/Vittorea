const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/**
 * Helper para manejar respuestas de la API
 */
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Error en la solicitud')
  }
  return response.json()
}

/**
 * Obtener catálogo completo de productos
 */
export async function getProducts() {
  try {
    const response = await fetch(`${API_URL}/products`)
    return handleResponse(response)
  } catch (error) {
    console.error('Error al obtener productos:', error)
    throw error
  }
}

/**
 * Obtener un producto por ID
 */
export async function getProduct(id) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`)
    return handleResponse(response)
  } catch (error) {
    console.error('Error al obtener producto:', error)
    throw error
  }
}

/**
 * Crear un pedido
 */
export async function createOrder(orderData) {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    })
    return handleResponse(response)
  } catch (error) {
    console.error('Error al crear pedido:', error)
    throw error
  }
}

/**
 * Generar preferencia de pago en Mercado Pago
 */
export async function createPaymentPreference(orderId) {
  try {
    const response = await fetch(`${API_URL}/payments/preference`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId })
    })
    return handleResponse(response)
  } catch (error) {
    console.error('Error al generar preferencia de pago:', error)
    throw error
  }
}

/**
 * Obtener estado de un pedido
 */
export async function getOrderStatus(orderId) {
  try {
    const response = await fetch(`${API_URL}/orders/${orderId}`)
    return handleResponse(response)
  } catch (error) {
    console.error('Error al obtener estado del pedido:', error)
    throw error
  }
}

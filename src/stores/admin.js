import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAdminStore = defineStore('admin', () => {
  // ==========================================
  // CLIENTES - ENTIDAD CENTRAL
  // ==========================================
  /**
   * Cliente: Núcleo del sistema de ventas y feedback
   * - Se crean automáticamente al registrar ventas
   * - Permiten tracking de historial y preferencias
   */
  const clients = ref([])

  function addClient(client) {
    const newId = clients.value.length > 0 
      ? Math.max(...clients.value.map(c => c.id)) + 1 
      : 1
    
    const newClient = {
      id: newId,
      nombre: client.nombre,
      telefono: client.telefono,
      email: client.email || '',
      fecha_ultima_compra: client.fecha_ultima_compra || new Date().toISOString(),
      notas_internas: client.notas_internas || '',
      tags: client.tags || []
    }
    
    clients.value.push(newClient)
    return newClient
  }

  function updateClient(id, data) {
    const index = clients.value.findIndex(c => c.id === id)
    if (index > -1) {
      clients.value[index] = { ...clients.value[index], ...data }
    }
  }

  function deleteClient(id) {
    const index = clients.value.findIndex(c => c.id === id)
    if (index > -1) {
      clients.value.splice(index, 1)
    }
  }

  function getClientById(id) {
    return clients.value.find(c => c.id === id)
  }

  function findOrCreateClient(clientData) {
    // Buscar por teléfono primero
    let client = clients.value.find(c => c.telefono === clientData.telefono)
    
    if (!client) {
      // Si no existe, crear nuevo cliente
      client = addClient(clientData)
    }
    
    return client
  }

  // ==========================================
  // MARCAS (SIMPLIFICADAS)
  // ==========================================
  /**
   * Marca: Simplificada a solo nombre y estado
   * - No tiene módulo independiente
   * - Se gestiona inline desde productos
   */
  const brands = ref([])

  function addBrand(brand) {
    const newId = brands.value.length > 0 
      ? Math.max(...brands.value.map(b => b.id)) + 1 
      : 1
    brands.value.push({ 
      id: newId, 
      name: brand.name,
      active: brand.active !== false
    })
    return newId
  }

  function updateBrand(id, data) {
    const index = brands.value.findIndex(b => b.id === id)
    if (index > -1) {
      brands.value[index] = { ...brands.value[index], ...data }
    }
  }

  function deleteBrand(id) {
    const index = brands.value.findIndex(b => b.id === id)
    if (index > -1) {
      brands.value.splice(index, 1)
    }
  }

  function getBrandById(id) {
    return brands.value.find(b => b.id === id)
  }

  function findOrCreateBrand(name) {
    const existing = brands.value.find(b => b.name.toLowerCase() === name.toLowerCase())
    if (existing) return existing.id
    return addBrand({ name })
  }

  // ==========================================
  // LÍNEAS (similar a marcas)
  // ==========================================
  const lines = ref([])

  function addLine(line) {
    const newId = lines.value.length > 0 
      ? Math.max(...lines.value.map(l => l.id)) + 1 
      : 1
    lines.value.push({ 
      id: newId, 
      name: line.name,
      active: line.active !== false
    })
    return newId
  }

  function getLineById(id) {
    return lines.value.find(l => l.id === id)
  }

  function findOrCreateLine(name) {
    if (!name) return null
    const existing = lines.value.find(l => l.name.toLowerCase() === name.toLowerCase())
    if (existing) return existing.id
    return addLine({ name })
  }

  // ==========================================
  // VOLÚMENES ML (mililitros)
  // ==========================================
  const mlOptions = ref([])

  function addMlOption(ml) {
    const newId = mlOptions.value.length > 0 
      ? Math.max(...mlOptions.value.map(m => m.id)) + 1 
      : 1
    mlOptions.value.push({ 
      id: newId, 
      value: ml.value,
      active: ml.active !== false
    })
    return newId
  }

  function getMlById(id) {
    return mlOptions.value.find(m => m.id === id)
  }

  function findOrCreateMl(value) {
    if (!value) return null
    const existing = mlOptions.value.find(m => m.value === value)
    if (existing) return existing.id
    return addMlOption({ value })
  }

  // ==========================================
  // PRODUCTOS
  // ==========================================
  const products = ref([])

  const productsWithBrand = computed(() => {
    return products.value.map(p => ({
      ...p,
      brand: getBrandById(p.brandId)?.name || 'Sin marca',
      line: p.lineId ? getLineById(p.lineId)?.name : '',
      ml: p.mlId ? getMlById(p.mlId)?.value : '',
      price: p.salePrice
    }))
  })

  const catalogProducts = computed(() => {
    return productsWithBrand.value.filter(p => p.active && p.stock > 0)
  })

  function calculateSalePrice(costPrice) {
    return Math.round(costPrice * 1.4)
  }

  function addProduct(product) {
    const newId = products.value.length > 0 
      ? Math.max(...products.value.map(p => p.id)) + 1 
      : 1
    
    const salePrice = product.salePrice || calculateSalePrice(product.costPrice)
    
    const newProduct = { 
      ...product, 
      id: newId, 
      costPrice: product.costPrice,
      salePrice: salePrice,
      stock: product.stock || 0,
      active: product.active !== false
    }
    
    products.value.push(newProduct)
    return newProduct
  }

  function updateProduct(id, data) {
    const index = products.value.findIndex(p => p.id === id)
    if (index > -1) {
      if (data.costPrice && !data.salePrice) {
        data.salePrice = calculateSalePrice(data.costPrice)
      }
      products.value[index] = { ...products.value[index], ...data }
    }
  }

  function deleteProduct(id) {
    const index = products.value.findIndex(p => p.id === id)
    if (index > -1) {
      products.value.splice(index, 1)
    }
  }

  function getProductById(id) {
    const product = products.value.find(p => p.id === Number(id))
    if (product) {
      return {
        ...product,
        brand: getBrandById(product.brandId)?.name || 'Sin marca',
        line: product.lineId ? getLineById(product.lineId)?.name : '',
        ml: product.mlId ? getMlById(product.mlId)?.value : '',
        price: product.salePrice
      }
    }
    return null
  }

  function updateStock(productId, quantity) {
    const product = products.value.find(p => p.id === productId)
    if (product) {
      product.stock = Math.max(0, product.stock + quantity)
    }
  }

  // ==========================================
  // MOVIMIENTOS DE INVENTARIO
  // ==========================================
  const movements = ref([])

  const movementsWithProduct = computed(() => {
    return movements.value.map(m => ({
      ...m,
      product: getProductById(m.productId)
    })).sort((a, b) => new Date(b.date) - new Date(a.date))
  })

  function addMovement(movement) {
    const newId = movements.value.length > 0 
      ? Math.max(...movements.value.map(m => m.id)) + 1 
      : 1
    
    const newMovement = {
      ...movement,
      id: newId,
      date: movement.date || new Date().toISOString(),
      status: movement.status || 'completado', // pendiente, confirmado, entregado, completado
      orderId: movement.orderId || null
    }
    
    movements.value.push(newMovement)
    
    // Solo modificar stock si NO es un egreso pendiente (venta por confirmar)
    if (newMovement.status !== 'pendiente') {
      const quantityChange = movement.type === 'ingreso' 
        ? movement.quantity 
        : -movement.quantity
      updateStock(movement.productId, quantityChange)
    }
    
    return newId
  }

  function deleteMovement(id) {
    const movement = movements.value.find(m => m.id === id)
    if (movement) {
      // Solo revertir stock si el movimiento ya había afectado el stock
      if (movement.status !== 'pendiente') {
        const quantityChange = movement.type === 'ingreso' 
          ? -movement.quantity 
          : movement.quantity
        updateStock(movement.productId, quantityChange)
      }
      
      const index = movements.value.findIndex(m => m.id === id)
      movements.value.splice(index, 1)
    }
  }

  function confirmTransfer(movementId) {
    const movement = movements.value.find(m => m.id === movementId)
    if (movement && movement.status === 'pendiente') {
      // Cambiar estado y descontar stock
      movement.status = 'confirmado'
      const quantityChange = movement.type === 'ingreso' 
        ? movement.quantity 
        : -movement.quantity
      updateStock(movement.productId, quantityChange)
      
      // Actualizar estado del pedido si existe
      if (movement.orderId) {
        updateOrder(movement.orderId, { estado: 'confirmado' })
      }
    }
  }

  function confirmDelivery(movementId) {
    const movement = movements.value.find(m => m.id === movementId)
    if (movement && movement.status === 'confirmado') {
      movement.status = 'entregado'
      
      // Actualizar estado del pedido si existe
      if (movement.orderId) {
        updateOrder(movement.orderId, { estado: 'entregado' })
      }
    }
  }

  // ==========================================
  // PEDIDOS/VENTAS (CON CLIENTE OBLIGATORIO)
  // ==========================================
  /**
   * Pedido/Venta: Siempre asociada a un cliente
   * - Si el cliente no existe, se crea automáticamente
   * - Actualiza fecha_ultima_compra del cliente
   * - Genera movimiento de egreso en inventario
   */
  const orders = ref([])

  /**
   * Crear nuevo pedido/venta
   * - Busca o crea el cliente automáticamente
   * - Actualiza fecha_ultima_compra
   * - Genera movimiento de stock
   */
  function addOrder(orderData) {
    // 1. Buscar o crear cliente
    const client = findOrCreateClient({
      nombre: orderData.clienteNombre,
      telefono: orderData.clienteTelefono,
      email: orderData.clienteEmail || ''
    })

    // 2. Crear pedido
    const newId = orders.value.length > 0 
      ? Math.max(...orders.value.map(o => o.id)) + 1 
      : 1
    
    const product = getProductById(orderData.productId)
    
    const newOrder = {
      id: newId,
      clientId: client.id,
      productId: orderData.productId,
      quantity: orderData.quantity,
      unitPrice: product?.salePrice || orderData.unitPrice,
      costPrice: product?.costPrice || orderData.costPrice,
      date: orderData.date || new Date().toISOString(),
      estado: orderData.estado || 'pendiente',
      notas: orderData.notas || ''
    }
    
    orders.value.push(newOrder)

    // 3. Actualizar fecha_ultima_compra del cliente
    updateClient(client.id, {
      fecha_ultima_compra: newOrder.date
    })
    
    // 4. Generar movimiento de stock PENDIENTE (no descuenta hasta confirmar transferencia)
    addMovement({
      productId: orderData.productId,
      type: 'egreso',
      quantity: orderData.quantity,
      reason: 'Venta',
      notes: `Pedido #${newId} - ${client.nombre}`,
      status: 'pendiente',
      orderId: newId
    })
    
    return { order: newOrder, client }
  }

  function updateOrder(id, data) {
    const index = orders.value.findIndex(o => o.id === id)
    if (index > -1) {
      orders.value[index] = { ...orders.value[index], ...data }
    }
  }

  function getOrderById(id) {
    return orders.value.find(o => o.id === id)
  }

  // Pedidos con info completa
  const ordersWithDetails = computed(() => {
    return orders.value.map(o => {
      const product = getProductById(o.productId)
      const client = getClientById(o.clientId)
      return {
        ...o,
        product,
        client,
        total: o.unitPrice * o.quantity,
        profit: (o.unitPrice - o.costPrice) * o.quantity
      }
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  })

  // Obtener pedidos de un cliente
  function getOrdersByClient(clientId) {
    return ordersWithDetails.value.filter(o => o.clientId === clientId)
  }

  // ==========================================
  // FEEDBACK (INTEGRADO AL CLIENTE)
  // ==========================================
  /**
   * Feedback: Se gestiona desde la ficha del cliente
   * - Asociado a cliente, pedido y producto
   * - Información interna para mejorar el servicio
   * - NO visible para clientes
   */
  const feedbacks = ref([])

  function addFeedback(feedback) {
    const newId = feedbacks.value.length > 0 
      ? Math.max(...feedbacks.value.map(f => f.id)) + 1 
      : 1
    
    const newFeedback = {
      id: newId,
      clientId: feedback.clientId,
      orderId: feedback.orderId,
      productId: feedback.productId,
      nivel_satisfaccion: feedback.nivel_satisfaccion,
      duracion_percibida: feedback.duracion_percibida,
      intensidad_percibida: feedback.intensidad_percibida,
      volveria_a_comprar: feedback.volveria_a_comprar,
      comentario_libre: feedback.comentario_libre || '',
      fecha: feedback.fecha || new Date().toISOString()
    }
    
    feedbacks.value.push(newFeedback)
    return newFeedback
  }

  function updateFeedback(id, data) {
    const index = feedbacks.value.findIndex(f => f.id === id)
    if (index > -1) {
      feedbacks.value[index] = { ...feedbacks.value[index], ...data }
    }
  }

  function deleteFeedback(id) {
    const index = feedbacks.value.findIndex(f => f.id === id)
    if (index > -1) {
      feedbacks.value.splice(index, 1)
    }
  }

  // Feedback con detalles completos
  const feedbacksWithDetails = computed(() => {
    return feedbacks.value.map(f => ({
      ...f,
      client: getClientById(f.clientId),
      order: getOrderById(f.orderId),
      product: getProductById(f.productId)
    })).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  })

  // Obtener feedbacks de un cliente
  function getFeedbacksByClient(clientId) {
    return feedbacksWithDetails.value.filter(f => f.clientId === clientId)
  }

  // Obtener feedbacks de un producto
  function getFeedbacksByProduct(productId) {
    return feedbacksWithDetails.value.filter(f => f.productId === productId)
  }

  // ==========================================
  // MÉTRICAS Y ESTADÍSTICAS
  // ==========================================
  
  const reinvestmentPercent = ref(30)

  const stats = computed(() => {
    const totalProducts = products.value.length
    const totalStock = products.value.reduce((sum, p) => sum + p.stock, 0)
    const lowStockProducts = products.value.filter(p => p.stock <= 1 && p.stock > 0)
    const outOfStockProducts = products.value.filter(p => p.stock === 0)
    const totalCostValue = products.value.reduce((sum, p) => sum + (p.costPrice * p.stock), 0)
    const totalSaleValue = products.value.reduce((sum, p) => sum + (p.salePrice * p.stock), 0)
    
    // Métricas de clientes
    const totalClients = clients.value.length
    const clientsWithOrders = [...new Set(orders.value.map(o => o.clientId))].length
    const repeatClients = clients.value.filter(c => {
      const clientOrders = orders.value.filter(o => o.clientId === c.id)
      return clientOrders.length > 1
    }).length
    
    // Métricas de ventas pendientes
    const pendingTransfers = movements.value.filter(m => m.type === 'egreso' && m.status === 'pendiente').length
    const pendingDeliveries = movements.value.filter(m => m.type === 'egreso' && m.status === 'confirmado').length
    
    return {
      totalProducts,
      totalStock,
      lowStockProducts: lowStockProducts.length,
      outOfStockProducts: outOfStockProducts.length,
      totalCostValue,
      totalSaleValue,
      totalValue: totalSaleValue,
      totalClients,
      clientsWithOrders,
      repeatClients,
      pendingTransfers,
      pendingDeliveries
    }
  })

  const salesByMonth = computed(() => {
    const monthlyData = {}
    
    orders.value.forEach(order => {
      const date = new Date(order.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          totalSales: 0,
          totalCost: 0,
          totalProfit: 0,
          unitsSold: 0,
          transactions: 0
        }
      }
      
      const total = order.unitPrice * order.quantity
      const cost = order.costPrice * order.quantity
      
      monthlyData[monthKey].totalSales += total
      monthlyData[monthKey].totalCost += cost
      monthlyData[monthKey].totalProfit += (total - cost)
      monthlyData[monthKey].unitsSold += order.quantity
      monthlyData[monthKey].transactions++
    })
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))
  })

  const productSalesRanking = computed(() => {
    const productSales = {}
    
    orders.value.forEach(order => {
      if (!productSales[order.productId]) {
        const product = getProductById(order.productId)
        productSales[order.productId] = {
          productId: order.productId,
          productName: product?.name || 'Producto eliminado',
          productImage: product?.image,
          unitsSold: 0,
          totalRevenue: 0,
          totalProfit: 0
        }
      }
      
      productSales[order.productId].unitsSold += order.quantity
      productSales[order.productId].totalRevenue += order.unitPrice * order.quantity
      productSales[order.productId].totalProfit += (order.unitPrice - order.costPrice) * order.quantity
    })
    
    const sorted = Object.values(productSales).sort((a, b) => b.unitsSold - a.unitsSold)
    
    return {
      all: sorted,
      top: sorted[0] || null,
      bottom: sorted[sorted.length - 1] || null
    }
  })

  const inventoryRotation = computed(() => {
    const totalUnitsSold = orders.value.reduce((sum, o) => sum + o.quantity, 0)
    const currentStock = stats.value.totalStock
    
    if (currentStock === 0) return 0
    return (totalUnitsSold / currentStock).toFixed(2)
  })

  const financialMetrics = computed(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const currentMonthData = salesByMonth.value.find(m => m.month === currentMonth)
    
    const totalRevenue = orders.value.reduce((sum, o) => sum + (o.unitPrice * o.quantity), 0)
    const totalCost = orders.value.reduce((sum, o) => sum + (o.costPrice * o.quantity), 0)
    const totalProfit = totalRevenue - totalCost
    
    const monthlyProfit = currentMonthData?.totalProfit || 0
    const monthlyReinvestment = Math.round(monthlyProfit * (reinvestmentPercent.value / 100))
    
    return {
      totalRevenue,
      totalCost,
      totalProfit,
      monthlyRevenue: currentMonthData?.totalSales || 0,
      monthlyProfit,
      monthlyReinvestment,
      reinvestmentPercent: reinvestmentPercent.value,
      profitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0
    }
  })

  // Métricas de satisfacción de clientes
  const clientSatisfactionMetrics = computed(() => {
    const total = feedbacks.value.length
    const positive = feedbacks.value.filter(f => f.nivel_satisfaccion === 'positivo').length
    const neutral = feedbacks.value.filter(f => f.nivel_satisfaccion === 'neutro').length
    const negative = feedbacks.value.filter(f => f.nivel_satisfaccion === 'negativo').length
    const wouldRepurchase = feedbacks.value.filter(f => f.volveria_a_comprar).length
    
    return {
      total,
      positive,
      neutral,
      negative,
      wouldRepurchase,
      satisfactionRate: total > 0 ? ((positive / total) * 100).toFixed(1) : 0,
      repurchaseRate: total > 0 ? ((wouldRepurchase / total) * 100).toFixed(1) : 0
    }
  })

  function setReinvestmentPercent(percent) {
    reinvestmentPercent.value = Math.max(0, Math.min(100, percent))
  }

  return {
    // Clientes
    clients,
    addClient,
    updateClient,
    deleteClient,
    getClientById,
    findOrCreateClient,
    
    // Marcas (simplificadas)
    brands,
    addBrand,
    updateBrand,
    deleteBrand,
    getBrandById,
    findOrCreateBrand,
    
    // Líneas
    lines,
    addLine,
    getLineById,
    findOrCreateLine,
    
    // ML Options
    mlOptions,
    addMlOption,
    getMlById,
    findOrCreateMl,
    
    // Productos
    products,
    productsWithBrand,
    catalogProducts,
    calculateSalePrice,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    updateStock,
    
    // Movimientos
    movements,
    movementsWithProduct,
    addMovement,
    deleteMovement,
    confirmTransfer,
    confirmDelivery,
    
    // Pedidos/Ventas
    orders,
    ordersWithDetails,
    addOrder,
    updateOrder,
    getOrderById,
    getOrdersByClient,
    
    // Feedback
    feedbacks,
    feedbacksWithDetails,
    addFeedback,
    updateFeedback,
    deleteFeedback,
    getFeedbacksByClient,
    getFeedbacksByProduct,
    
    // Métricas
    stats,
    salesByMonth,
    productSalesRanking,
    inventoryRotation,
    financialMetrics,
    clientSatisfactionMetrics,
    reinvestmentPercent,
    setReinvestmentPercent
  }
})

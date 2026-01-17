<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import CheckoutForm from '../components/CheckoutForm.vue'
import { createOrder, createPaymentPreference } from '../services/api'

const router = useRouter()
const cartStore = useCartStore()

const loading = ref(false)
const error = ref(null)

const isEmpty = computed(() => cartStore.isEmpty)

function formatPrice(price) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(price)
}

async function handleSubmit(formData) {
  if (isEmpty.value) return

  loading.value = true
  error.value = null

  try {
    // Crear pedido con los datos del formulario
    const orderData = {
      customer: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || ''
      },
      items: cartStore.items.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      delivery: {
        type: formData.deliveryType,
        price: formData.deliveryPrice || 0
      },
      payment: {
        method: formData.paymentMethod
      },
      total: cartStore.totalPrice + (formData.deliveryPrice || 0),
      status: 'pendiente'
    }

    console.log('Pedido creado:', orderData)

    // Limpiar carrito
    cartStore.clearCart()

    // Redirigir a página de confirmación
    router.push({
      path: '/pedido-confirmado',
      query: {
        name: formData.name,
        payment: formData.paymentMethod,
        delivery: formData.deliveryType
      }
    })

  } catch (err) {
    console.error('Error en checkout:', err)
    error.value = 'Hubo un problema al procesar tu pedido. Por favor, intentá nuevamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="checkout-page">
    <div class="container">
      <h1 class="page-title">Checkout</h1>

      <!-- Empty Cart -->
      <div v-if="isEmpty" class="empty-state">
        <p>Tu carrito está vacío</p>
        <RouterLink to="/" class="btn btn-secondary">Ver catálogo</RouterLink>
      </div>

      <!-- Checkout Content -->
      <div v-else class="checkout-content">
        <div class="checkout-main">
          <CheckoutForm :loading="loading" @submit="handleSubmit" />
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </div>

        <aside class="checkout-summary">
          <h2 class="summary-title">Resumen del pedido</h2>
          
          <ul class="summary-items">
            <li v-for="item in cartStore.items" :key="item.id" class="summary-item">
              <img :src="item.image" :alt="item.name" class="item-thumb" />
              <div class="item-info">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-qty">Cantidad: {{ item.quantity }}</span>
              </div>
              <span class="item-price">{{ formatPrice(item.price * item.quantity) }}</span>
            </li>
          </ul>

          <div class="summary-totals">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>{{ formatPrice(cartStore.totalPrice) }}</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span class="total-value">{{ formatPrice(cartStore.totalPrice) }}</span>
            </div>
          </div>

          <div class="secure-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Pago seguro con Mercado Pago</span>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-page {
  padding: var(--space-xl) 0 var(--space-3xl);
  min-height: 60vh;
}

.page-title {
  font-family: var(--font-heading);
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 300;
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.empty-state {
  text-align: center;
  padding: var(--space-3xl) 0;
  color: var(--color-muted);
}

.empty-state p {
  margin-bottom: var(--space-lg);
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--space-2xl);
  align-items: start;
}

.error-message {
  margin-top: var(--space-md);
  padding: var(--space-md);
  background-color: #fef2f2;
  color: #991b1b;
  border-radius: var(--radius-md);
  font-size: 0.938rem;
}

.checkout-summary {
  position: sticky;
  top: calc(var(--header-height) + var(--space-lg));
  padding: var(--space-lg);
  background: var(--color-white);
  border-radius: var(--radius-md);
}

.summary-title {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 400;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}

.summary-items {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-md);
}

.summary-item {
  display: grid;
  grid-template-columns: 50px 1fr auto;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border);
}

.summary-item:last-child {
  border-bottom: none;
}

.item-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  background-color: var(--color-background);
}

.item-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-name {
  font-size: 0.875rem;
  font-weight: 500;
}

.item-qty {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.item-price {
  font-size: 0.875rem;
  font-weight: 500;
  align-self: center;
}

.summary-totals {
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-xs) 0;
  font-size: 0.938rem;
}

.summary-row.total {
  padding-top: var(--space-sm);
  margin-top: var(--space-xs);
  border-top: 1px solid var(--color-border);
  font-weight: 500;
}

.total-value {
  font-family: var(--font-heading);
  font-size: 1.25rem;
}

.secure-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  margin-top: var(--space-md);
  padding: var(--space-sm);
  background-color: var(--color-background);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--color-muted);
}

@media (max-width: 968px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }

  .checkout-summary {
    position: static;
    order: -1;
  }
}
</style>

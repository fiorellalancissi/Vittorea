<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore()

const isEmpty = computed(() => cartStore.isEmpty)

function formatPrice(price) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(price)
}

function incrementQuantity(item) {
  cartStore.updateQuantity(item.id, item.quantity + 1)
}

function decrementQuantity(item) {
  cartStore.updateQuantity(item.id, item.quantity - 1)
}
</script>

<template>
  <div class="cart-page">
    <div class="container">
      <h1 class="page-title">Tu Carrito</h1>

      <!-- Empty State -->
      <div v-if="isEmpty" class="empty-cart">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <h2>Tu carrito está vacío</h2>
        <p>Explorá nuestro catálogo y encontrá el perfume perfecto para vos.</p>
        <RouterLink to="/" class="btn btn-primary">Ver catálogo</RouterLink>
      </div>

      <!-- Cart Content -->
      <div v-else class="cart-content">
        <div class="cart-items">
          <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
            <RouterLink :to="`/producto/${item.id}`" class="item-image-link">
              <img :src="item.image" :alt="item.name" class="item-image" />
            </RouterLink>

            <div class="item-details">
              <RouterLink :to="`/producto/${item.id}`" class="item-link">
                <span class="item-brand">{{ item.brand }}</span>
                <h3 class="item-name">{{ item.name }}</h3>
              </RouterLink>
              <p class="item-price">{{ formatPrice(item.price) }}</p>
            </div>

            <div class="item-quantity">
              <div class="quantity-control">
                <button 
                  class="qty-btn" 
                  @click="decrementQuantity(item)"
                  aria-label="Disminuir cantidad"
                >−</button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button 
                  class="qty-btn" 
                  @click="incrementQuantity(item)"
                  aria-label="Aumentar cantidad"
                >+</button>
              </div>
            </div>

            <div class="item-subtotal">
              <span class="subtotal-label">Subtotal</span>
              <span class="subtotal-value">{{ formatPrice(item.price * item.quantity) }}</span>
            </div>

            <button 
              class="remove-btn"
              @click="cartStore.removeItem(item.id)"
              aria-label="Eliminar producto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <aside class="cart-summary">
          <h2 class="summary-title">Resumen</h2>
          
          <div class="summary-row">
            <span>Subtotal ({{ cartStore.totalItems }} productos)</span>
            <span>{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>

          <div class="summary-row">
            <span>Envío</span>
            <span class="muted">Se calcula en checkout</span>
          </div>

          <div class="summary-total">
            <span>Total</span>
            <span class="total-value">{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>

          <RouterLink to="/checkout" class="btn btn-primary checkout-btn">
            Continuar compra
          </RouterLink>

          <RouterLink to="/" class="continue-shopping">
            ← Seguir comprando
          </RouterLink>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-page {
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

.empty-cart {
  text-align: center;
  padding: var(--space-3xl) 0;
}

.empty-cart svg {
  color: var(--color-muted);
  opacity: 0.5;
  margin-bottom: var(--space-md);
}

.empty-cart h2 {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 400;
  margin-bottom: var(--space-sm);
}

.empty-cart p {
  color: var(--color-muted);
  margin-bottom: var(--space-lg);
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: var(--space-2xl);
  align-items: start;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr auto auto auto;
  gap: var(--space-md);
  align-items: center;
  padding: var(--space-md);
  background: var(--color-white);
  border-radius: var(--radius-md);
}

.item-image-link {
  display: block;
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  background-color: var(--color-background);
}

.item-link {
  text-decoration: none;
  color: inherit;
}

.item-brand {
  display: block;
  font-size: 0.688rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.item-name {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 400;
  margin: 2px 0;
  transition: color var(--transition-fast);
}

.item-link:hover .item-name {
  color: var(--color-accent);
}

.item-price {
  font-size: 0.938rem;
  color: var(--color-secondary);
  margin: 0;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.qty-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  background: var(--color-background);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.qty-btn:hover {
  background-color: var(--color-primary);
}

.qty-value {
  min-width: 28px;
  text-align: center;
  font-size: 0.938rem;
  font-weight: 500;
}

.item-subtotal {
  text-align: right;
  min-width: 100px;
}

.subtotal-label {
  display: block;
  font-size: 0.75rem;
  color: var(--color-muted);
}

.subtotal-value {
  font-weight: 500;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.remove-btn:hover {
  color: #c45c5c;
}

.cart-summary {
  position: sticky;
  top: calc(var(--header-height) + var(--space-lg));
  padding: var(--space-lg);
  background: var(--color-white);
  border-radius: var(--radius-md);
}

.summary-title {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 400;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm) 0;
  font-size: 0.938rem;
}

.summary-row .muted {
  color: var(--color-muted);
  font-size: 0.813rem;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  padding: var(--space-md) 0;
  margin-top: var(--space-sm);
  border-top: 1px solid var(--color-border);
  font-weight: 500;
}

.total-value {
  font-family: var(--font-heading);
  font-size: 1.25rem;
}

.checkout-btn {
  width: 100%;
  margin-top: var(--space-md);
}

.continue-shopping {
  display: block;
  text-align: center;
  margin-top: var(--space-md);
  font-size: 0.875rem;
  color: var(--color-muted);
}

.continue-shopping:hover {
  color: var(--color-text);
}

@media (max-width: 968px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }
}

@media (max-width: 640px) {
  .cart-item {
    grid-template-columns: 80px 1fr;
    grid-template-rows: auto auto auto;
  }

  .item-image {
    width: 80px;
    height: 80px;
    grid-row: span 2;
  }

  .item-quantity {
    grid-column: 2;
    justify-self: start;
  }

  .item-subtotal {
    grid-column: 2;
    text-align: left;
  }

  .remove-btn {
    position: absolute;
    top: var(--space-sm);
    right: var(--space-sm);
  }

  .cart-item {
    position: relative;
  }
}
</style>

<script setup>
import { useCartStore } from '../stores/cart'
import { RouterLink } from 'vue-router'

const cartStore = useCartStore()

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
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="cartStore.isOpen" 
        class="cart-overlay" 
        @click="cartStore.closeCart"
      ></div>
    </Transition>

    <Transition name="slide">
      <aside v-if="cartStore.isOpen" class="cart-drawer">
        <header class="cart-header">
          <h2 class="cart-title">Tu Carrito</h2>
          <button class="close-btn" @click="cartStore.closeCart" aria-label="Cerrar carrito">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <div class="cart-content">
          <div v-if="cartStore.isEmpty" class="cart-empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <p>Tu carrito está vacío</p>
            <button class="btn btn-secondary" @click="cartStore.closeCart">
              Ver catálogo
            </button>
          </div>

          <ul v-else class="cart-items">
            <li v-for="item in cartStore.items" :key="item.id" class="cart-item">
              <img :src="item.image" :alt="item.name" class="item-image" />
              
              <div class="item-details">
                <span class="item-brand">{{ item.brand }}</span>
                <h3 class="item-name">{{ item.name }}</h3>
                <p class="item-price">{{ formatPrice(item.price) }}</p>
              </div>

              <div class="item-actions">
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
                
                <button 
                  class="remove-btn" 
                  @click="cartStore.removeItem(item.id)"
                  aria-label="Eliminar producto"
                >
                  Eliminar
                </button>
              </div>
            </li>
          </ul>
        </div>

        <footer v-if="!cartStore.isEmpty" class="cart-footer">
          <div class="cart-total">
            <span>Total</span>
            <span class="total-price">{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>
          
          <RouterLink 
            to="/checkout" 
            class="btn btn-primary checkout-btn"
            @click="cartStore.closeCart"
          >
            Continuar compra
          </RouterLink>
        </footer>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cart-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(46, 42, 38, 0.4);
  z-index: 200;
}

.cart-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 420px;
  height: 100vh;
  background-color: var(--color-white);
  box-shadow: -4px 0 24px rgba(46, 42, 38, 0.1);
  z-index: 201;
  display: flex;
  flex-direction: column;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.cart-title {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 400;
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.close-btn:hover {
  color: var(--color-accent);
}

.cart-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
}

.cart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: var(--color-muted);
}

.cart-empty svg {
  margin-bottom: var(--space-md);
  opacity: 0.5;
}

.cart-empty p {
  margin-bottom: var(--space-lg);
}

.cart-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr;
  grid-template-rows: auto auto;
  gap: var(--space-sm);
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border);
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  grid-row: span 2;
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  background-color: var(--color-background);
}

.item-details {
  align-self: start;
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
  font-size: 1rem;
  font-weight: 400;
  margin: 2px 0;
}

.item-price {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-secondary);
  margin: 0;
}

.item-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.qty-btn {
  width: 28px;
  height: 28px;
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
  min-width: 24px;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
}

.remove-btn {
  font-size: 0.75rem;
  color: var(--color-muted);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  transition: color var(--transition-fast);
}

.remove-btn:hover {
  color: #c45c5c;
}

.cart-footer {
  padding: var(--space-lg);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-background);
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  font-size: 1rem;
}

.total-price {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 500;
}

.checkout-btn {
  width: 100%;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform var(--transition-slow);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>

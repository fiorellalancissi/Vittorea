<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAdminStore } from '../stores/admin'

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '5491112345678'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const adminStore = useAdminStore()

const loading = ref(false)
const quantity = ref(1)
const addedToCart = ref(false)

// Obtener producto del store
const product = computed(() => {
  const productId = route.params.id
  return adminStore.getProductById(productId)
})

const error = computed(() => {
  return !product.value ? 'Producto no encontrado' : null
})

const isInStock = computed(() => product.value && product.value.stock > 0)

function formatPrice(price) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(price)
}

function incrementQuantity() {
  if (product.value && quantity.value < product.value.stock) {
    quantity.value++
  }
}

function decrementQuantity() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function addToCart() {
  if (product.value) {
    cartStore.addItem(product.value, quantity.value)
    addedToCart.value = true
    setTimeout(() => {
      addedToCart.value = false
    }, 2000)
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="product-detail">
    <div class="container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Cargando producto...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <RouterLink to="/" class="btn btn-secondary">Volver al catálogo</RouterLink>
      </div>

      <!-- Product Content -->
      <div v-else-if="product" class="product-content">
        <button class="back-link" @click="goBack">
          ← Volver
        </button>

        <div class="product-layout">
          <div class="product-gallery">
            <div class="product-image-wrapper">
              <img 
                :src="product.image" 
                :alt="product.name"
                class="product-image"
              />
            </div>
          </div>

          <div class="product-info">
            <span class="product-brand">{{ product.brand }}</span>
            <h1 class="product-name">{{ product.name }}</h1>
            
            <p class="product-price">{{ formatPrice(product.price) }}</p>
            
            <div class="product-description">
              <p>{{ product.description }}</p>
            </div>

            <!-- Notas del perfume -->
            <div v-if="product.notes" class="product-notes">
              <h3 class="notes-title">Notas</h3>
              <div class="notes-grid">
                <div class="note-item">
                  <span class="note-label">Salida</span>
                  <span class="note-value">{{ product.notes.top }}</span>
                </div>
                <div class="note-item">
                  <span class="note-label">Corazón</span>
                  <span class="note-value">{{ product.notes.heart }}</span>
                </div>
                <div class="note-item">
                  <span class="note-label">Fondo</span>
                  <span class="note-value">{{ product.notes.base }}</span>
                </div>
              </div>
            </div>

            <!-- Stock -->
            <p class="product-stock" :class="{ 'low-stock': product.stock <= 3 }">
              <span v-if="isInStock">
                {{ product.stock <= 3 ? `¡Solo quedan ${product.stock}!` : 'En stock' }}
              </span>
              <span v-else>Sin stock</span>
            </p>

            <!-- Cantidad y agregar al carrito -->
            <div v-if="isInStock" class="product-actions">
              <div class="quantity-selector">
                <button class="qty-btn" @click="decrementQuantity" :disabled="quantity <= 1">−</button>
                <span class="qty-value">{{ quantity }}</span>
                <button class="qty-btn" @click="incrementQuantity" :disabled="quantity >= product.stock">+</button>
              </div>

              <button 
                class="btn btn-primary add-btn"
                :class="{ 'added': addedToCart }"
                @click="addToCart"
              >
                {{ addedToCart ? '¡Agregado!' : 'Agregar al carrito' }}
              </button>
            </div>

            <!-- Ayuda -->
            <div class="product-help">
              <p>Si tenés dudas, te ayudo a elegir</p>
              <a 
                :href="`https://wa.me/${whatsappNumber}`"
                target="_blank"
                rel="noopener"
                class="help-link"
              >
                Contactame por WhatsApp →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-detail {
  padding: var(--space-xl) 0 var(--space-3xl);
}

.loading-state,
.error-state {
  text-align: center;
  padding: var(--space-3xl) 0;
  color: var(--color-muted);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto var(--space-md);
  border: 2px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.back-link {
  display: inline-flex;
  align-items: center;
  margin-bottom: var(--space-lg);
  font-size: 0.875rem;
  color: var(--color-muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--color-text);
}

.product-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2xl);
  align-items: start;
}

.product-image-wrapper {
  position: sticky;
  top: calc(var(--header-height) + var(--space-lg));
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background-color: var(--color-white);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-brand {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: var(--space-xs);
}

.product-name {
  font-family: var(--font-heading);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 300;
  line-height: 1.2;
  margin-bottom: var(--space-md);
}

.product-price {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--color-secondary);
  margin-bottom: var(--space-lg);
}

.product-description {
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.product-description p {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--color-muted);
  margin: 0;
}

.product-notes {
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.notes-title {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
  margin-bottom: var(--space-sm);
}

.notes-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.note-item {
  display: flex;
  gap: var(--space-sm);
}

.note-label {
  font-size: 0.813rem;
  font-weight: 500;
  color: var(--color-secondary);
  min-width: 70px;
}

.note-value {
  font-size: 0.875rem;
  color: var(--color-muted);
}

.product-stock {
  font-size: 0.875rem;
  color: var(--color-secondary);
  margin-bottom: var(--space-md);
}

.product-stock.low-stock {
  color: var(--color-accent);
}

.product-actions {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs);
  background: var(--color-background);
  border-radius: var(--radius-md);
}

.qty-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  background: var(--color-white);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.qty-btn:hover:not(:disabled) {
  background-color: var(--color-primary);
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-value {
  min-width: 32px;
  text-align: center;
  font-size: 1rem;
  font-weight: 500;
}

.add-btn {
  flex: 1;
}

.add-btn.added {
  background-color: #25D366;
  border-color: #25D366;
}

.product-help {
  padding: var(--space-md);
  background: var(--color-white);
  border-radius: var(--radius-md);
  text-align: center;
}

.product-help p {
  font-size: 0.875rem;
  color: var(--color-muted);
  margin-bottom: var(--space-xs);
}

.help-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-secondary);
  transition: color var(--transition-fast);
}

.help-link:hover {
  color: var(--color-accent);
}

@media (max-width: 768px) {
  .product-layout {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }

  .product-image-wrapper {
    position: relative;
    top: 0;
  }

  .product-actions {
    flex-direction: column;
  }

  .quantity-selector {
    justify-content: center;
  }
}
</style>

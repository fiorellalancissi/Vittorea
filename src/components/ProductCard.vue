<script setup>
import { RouterLink } from 'vue-router'
import { useCartStore } from '../stores/cart'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore()

function addToCart() {
  cartStore.addItem(props.product)
  cartStore.openCart()
}

function formatPrice(price) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(price)
}
</script>

<template>
  <article class="product-card">
    <RouterLink :to="`/producto/${product.id}`" class="product-link">
      <div class="product-image-wrapper">
        <img 
          :src="product.image" 
          :alt="product.name"
          class="product-image"
          loading="lazy"
        />
      </div>
      
      <div class="product-info">
        <span class="product-brand">{{ product.brand }}</span>
        <h3 class="product-name">{{ product.name }}</h3>
        <p class="product-price">{{ formatPrice(product.price) }}</p>
      </div>
    </RouterLink>

    <button class="add-to-cart-btn" @click.stop="addToCart">
      Agregar al carrito
    </button>
  </article>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  background: var(--color-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.product-link {
  text-decoration: none;
  color: inherit;
}

.product-image-wrapper {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background-color: var(--color-background);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-info {
  padding: var(--space-md);
  text-align: center;
}

.product-brand {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: var(--space-xs);
}

.product-name {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 400;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.product-price {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-secondary);
  margin: 0;
}

.add-to-cart-btn {
  margin: 0 var(--space-md) var(--space-md);
  padding: var(--space-sm);
  font-family: var(--font-body);
  font-size: 0.813rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-secondary);
  background: transparent;
  border: 1px solid var(--color-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.add-to-cart-btn:hover {
  color: var(--color-white);
  background-color: var(--color-secondary);
}
</style>

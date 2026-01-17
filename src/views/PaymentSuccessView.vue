<script setup>
import { useRoute, RouterLink } from 'vue-router'

const route = useRoute()
const status = route.query.status
const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '5491112345678'
</script>

<template>
  <div class="result-page">
    <div class="container">
      <div class="result-content">
        <div class="result-icon success">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>

        <h1 class="result-title">¡Gracias por tu compra!</h1>
        
        <p class="result-message">
          Tu pago fue procesado correctamente. En breve recibirás un email con los detalles de tu pedido.
        </p>

        <div class="result-details">
          <p>
            Si tenés alguna consulta sobre tu pedido, no dudes en contactarnos.
          </p>
        </div>

        <div class="result-actions">
          <RouterLink to="/" class="btn btn-primary">
            Volver al inicio
          </RouterLink>
          
          <a 
            :href="`https://wa.me/${whatsappNumber}`"
            target="_blank"
            rel="noopener"
            class="btn btn-secondary"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-page {
  padding: var(--space-3xl) 0;
  min-height: 70vh;
  display: flex;
  align-items: center;
}

.result-content {
  max-width: 520px;
  margin: 0 auto;
  text-align: center;
}

.result-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.result-icon.success {
  background-color: rgba(37, 211, 102, 0.1);
  color: #25D366;
}

.result-title {
  font-family: var(--font-heading);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 300;
  margin-bottom: var(--space-md);
}

.result-message {
  font-size: 1.0625rem;
  color: var(--color-muted);
  margin-bottom: var(--space-lg);
  line-height: 1.7;
}

.result-details {
  padding: var(--space-md);
  background-color: var(--color-white);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-xl);
}

.result-details p {
  font-size: 0.938rem;
  color: var(--color-muted);
  margin: 0;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

@media (min-width: 480px) {
  .result-actions {
    flex-direction: row;
    justify-content: center;
  }
}
</style>

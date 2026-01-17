<script setup>
import { RouterLink } from 'vue-router'

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '1123085864'
</script>

<template>
  <div class="result-page">
    <div class="container">
      <div class="result-content">
        <div class="result-icon error">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>

        <h1 class="result-title">No pudimos procesar tu pago</h1>
        
        <p class="result-message">
          Hubo un inconveniente con el pago. No te preocupes, no se realizó ningún cargo.
        </p>

        <div class="result-details">
          <p>
            Podés intentar nuevamente o contactarnos si necesitás ayuda.
          </p>
        </div>

        <div class="result-actions">
          <RouterLink to="/checkout" class="btn btn-primary">
            Intentar nuevamente
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

        <RouterLink to="/" class="back-home">
          ← Volver al inicio
        </RouterLink>
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

.result-icon.error {
  background-color: rgba(196, 92, 92, 0.1);
  color: #c45c5c;
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
  margin-bottom: var(--space-lg);
}

.back-home {
  font-size: 0.875rem;
  color: var(--color-muted);
}

.back-home:hover {
  color: var(--color-text);
}

@media (min-width: 480px) {
  .result-actions {
    flex-direction: row;
    justify-content: center;
  }
}
</style>

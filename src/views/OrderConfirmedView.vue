<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const customerName = computed(() => route.query.name || 'Cliente')
const paymentMethod = computed(() => {
  const method = route.query.payment
  return method === 'transferencia' ? 'Transferencia bancaria' : 'Efectivo'
})
const deliveryType = computed(() => {
  const type = route.query.delivery
  return type === 'retiro' ? 'Retiro en local' : 'Envío a domicilio'
})

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '1128813455'
const whatsappMessage = computed(() => {
  return `Hola! Acabo de confirmar mi pedido. Mi nombre es ${customerName.value}`
})
</script>

<template>
  <div class="confirmed-page">
    <div class="container">
      <div class="confirmed-card">
        <div class="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>

        <h1 class="confirmed-title">¡Pedido confirmado!</h1>
        <p class="confirmed-subtitle">Gracias {{ customerName }}, recibimos tu pedido correctamente</p>

        <div class="order-details">
          <div class="detail-item">
            <span class="detail-label">Forma de pago</span>
            <span class="detail-value">{{ paymentMethod }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Entrega</span>
            <span class="detail-value">{{ deliveryType }}</span>
          </div>
        </div>

        <div class="next-steps">
          <h3 class="steps-title">¿Qué sigue?</h3>
          <ol class="steps-list">
            <li v-if="paymentMethod === 'Transferencia bancaria'">
              Te enviaremos los datos bancarios por WhatsApp para que realices la transferencia
            </li>
            <li v-else>
              Prepará el efectivo para el momento de la entrega/retiro
            </li>
            <li v-if="deliveryType === 'Retiro en local'">
              Coordinaremos el día y horario de retiro por WhatsApp
            </li>
            <li v-else>
              Te contactaremos para coordinar el envío y confirmar el costo según tu zona
            </li>
            <li>
              Una vez confirmado el pago, prepararemos tu pedido
            </li>
          </ol>
        </div>

        <div class="actions">
          <a 
            :href="`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`"
            target="_blank"
            rel="noopener"
            class="btn btn-primary btn-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Contactar por WhatsApp
          </a>

          <RouterLink to="/" class="btn btn-secondary btn-lg">
            Volver al inicio
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirmed-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  padding: var(--space-xl) 0;
}

.confirmed-card {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--space-2xl);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  text-align: center;
  box-shadow: var(--shadow-md);
}

.success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: rgba(37, 211, 102, 0.1);
  border-radius: 50%;
  color: #25D366;
  margin-bottom: var(--space-lg);
}

.confirmed-title {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--space-sm);
}

.confirmed-subtitle {
  font-size: 1.125rem;
  color: var(--color-muted);
  margin-bottom: var(--space-xl);
}

.order-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--color-background);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-xl);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.detail-label {
  font-size: 0.813rem;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
}

.next-steps {
  text-align: left;
  padding: var(--space-lg);
  background: var(--color-background);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-xl);
}

.steps-title {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: var(--space-md);
}

.steps-list {
  padding-left: var(--space-lg);
  margin: 0;
}

.steps-list li {
  margin-bottom: var(--space-sm);
  color: var(--color-text);
  line-height: 1.6;
}

.steps-list li:last-child {
  margin-bottom: 0;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.btn-lg {
  padding: var(--space-md) var(--space-xl);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
}

@media (max-width: 640px) {
  .confirmed-card {
    padding: var(--space-xl) var(--space-md);
  }

  .order-details {
    grid-template-columns: 1fr;
  }

  .confirmed-title {
    font-size: 1.5rem;
  }
}
</style>

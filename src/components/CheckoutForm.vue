<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit'])

const form = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  deliveryType: 'retiro',
  paymentMethod: 'transferencia'
})

const errors = ref({})

const deliveryOptions = [
  { value: 'retiro', label: 'Retiro en local (a coordinar)', price: 0 },
  { value: 'envio', label: 'Envío a domicilio', price: 0, description: 'Se coordina costo según zona' }
]

const paymentOptions = [
  { value: 'transferencia', label: 'Transferencia bancaria', description: 'Te enviaremos los datos por WhatsApp' },
  { value: 'efectivo', label: 'Efectivo', description: 'Al momento del retiro o entrega' }
]

const selectedDelivery = computed(() => {
  return deliveryOptions.find(opt => opt.value === form.value.deliveryType)
})

function validateForm() {
  errors.value = {}
  
  if (!form.value.name.trim()) {
    errors.value.name = 'El nombre es requerido'
  }
  
  if (!form.value.email.trim()) {
    errors.value.email = 'El email es requerido'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Ingresá un email válido'
  }
  
  if (!form.value.phone.trim()) {
    errors.value.phone = 'El teléfono es requerido'
  } else if (!/^[\d\s\-+()]{8,}$/.test(form.value.phone)) {
    errors.value.phone = 'Ingresá un teléfono válido'
  }
  
  if (form.value.deliveryType === 'envio' && !form.value.address.trim()) {
    errors.value.address = 'La dirección es requerida para envíos'
  }
  
  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (validateForm()) {
    emit('submit', {
      ...form.value,
      deliveryPrice: selectedDelivery.value?.price || 0
    })
  }
}
</script>

<template>
  <form class="checkout-form" @submit.prevent="handleSubmit">
    <div class="form-section">
      <h3 class="section-title">Datos de contacto</h3>
      
      <div class="form-group">
        <label for="name" class="form-label">Nombre completo</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="form-input"
          :class="{ 'form-input--error': errors.name }"
          placeholder="Tu nombre"
          autocomplete="name"
        />
        <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label for="email" class="form-label">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="form-input"
          :class="{ 'form-input--error': errors.email }"
          placeholder="tu@email.com"
          autocomplete="email"
        />
        <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
      </div>

      <div class="form-group">
        <label for="phone" class="form-label">Teléfono</label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          class="form-input"
          :class="{ 'form-input--error': errors.phone }"
          placeholder="11 1234 5678"
          autocomplete="tel"
        />
        <span v-if="errors.phone" class="form-error">{{ errors.phone }}</span>
      </div>
    </div>

    <div class="form-section">
      <h3 class="section-title">Forma de entrega</h3>
      
      <div class="option-group">
        <label 
          v-for="option in deliveryOptions" 
          :key="option.value"
          class="option-card"
          :class="{ 'option-card--selected': form.deliveryType === option.value }"
        >
          <input
            type="radio"
            :value="option.value"
            v-model="form.deliveryType"
            class="option-radio"
          />
          <div class="option-content">
            <span class="option-label">{{ option.label }}</span>
            <span v-if="option.description" class="option-description">{{ option.description }}</span>
          </div>
          <span class="option-price">
            {{ option.price === 0 ? 'Sin cargo' : `$${option.price.toLocaleString('es-AR')}` }}
          </span>
        </label>
      </div>

      <div v-if="form.deliveryType === 'envio'" class="form-group">
        <label for="address" class="form-label">Dirección de envío</label>
        <textarea
          id="address"
          v-model="form.address"
          class="form-textarea"
          :class="{ 'form-input--error': errors.address }"
          placeholder="Calle, número, piso/depto, localidad, provincia"
          rows="3"
        ></textarea>
        <span v-if="errors.address" class="form-error">{{ errors.address }}</span>
        <p class="form-hint">Te contactaremos para coordinar el envío y confirmar el costo</p>
      </div>
    </div>

    <div class="form-section">
      <h3 class="section-title">Método de pago</h3>
      
      <div class="option-group">
        <label 
          v-for="option in paymentOptions" 
          :key="option.value"
          class="option-card"
          :class="{ 'option-card--selected': form.paymentMethod === option.value }"
        >
          <input
            type="radio"
            :value="option.value"
            v-model="form.paymentMethod"
            class="option-radio"
          />
          <div class="option-content">
            <span class="option-label">{{ option.label }}</span>
            <span class="option-description">{{ option.description }}</span>
          </div>
        </label>
      </div>
    </div>

    <button 
      type="submit" 
      class="btn btn-primary submit-btn"
      :disabled="loading"
    >
      <span v-if="loading">Procesando pedido...</span>
      <span v-else>Confirmar pedido</span>
    </button>
  </form>
</template>

<style scoped>
.checkout-form {
  max-width: 480px;
}

.form-section {
  margin-bottom: var(--space-xl);
}

.section-title {
  font-family: var(--font-heading);
  font-size: 1.125rem;
  font-weight: 400;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}

.form-input--error {
  border-color: #c45c5c;
}

.form-input--error:focus {
  border-color: #c45c5c;
  box-shadow: 0 0 0 3px rgba(196, 92, 92, 0.2);
}

.form-textarea {
  width: 100%;
  padding: var(--space-sm);
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text);
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-hint {
  font-size: 0.813rem;
  color: var(--color-muted);
  margin-top: var(--space-xs);
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.option-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.option-card:hover {
  border-color: var(--color-primary);
}

.option-card--selected {
  border-color: var(--color-secondary);
  background-color: rgba(160, 141, 127, 0.05);
}

.option-radio {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: var(--color-secondary);
  flex-shrink: 0;
}

.option-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-label {
  font-size: 0.938rem;
  font-weight: 500;
  color: var(--color-text);
}

.option-description {
  font-size: 0.813rem;
  color: var(--color-muted);
}

.option-price {
  font-weight: 500;
  color: var(--color-secondary);
  white-space: nowrap;
}

.submit-btn {
  width: 100%;
  padding: var(--space-md) var(--space-lg);
  font-size: 1rem;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

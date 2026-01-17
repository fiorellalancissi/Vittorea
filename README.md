# Vittore - Frontend

Sitio web de la marca **Vittore**, perfumería de perfumes árabes seleccionados.

> *"Donde la experiencia se encuentra con la intuición"*

## 🛠️ Stack Tecnológico

- **Vue 3** - Framework JavaScript
- **Vite** - Build tool
- **Vue Router** - Enrutamiento
- **Pinia** - Estado global
- **CSS Puro** - Sin frameworks de UI

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview
```

## ⚙️ Configuración

1. Copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configura las variables de entorno:
   ```
   VITE_API_URL=http://localhost:3000/api
   VITE_WHATSAPP_NUMBER=5491112345678
   VITE_WHATSAPP_MESSAGE=Hola! Me gustaría recibir asesoramiento...
   ```

## 📁 Estructura del Proyecto

```
src/
├── assets/
│   └── styles/
│       └── main.css        # Estilos globales y variables CSS
├── components/
│   ├── Header.vue          # Navegación principal
│   ├── Footer.vue          # Pie de página
│   ├── ProductCard.vue     # Tarjeta de producto
│   ├── ProductGrid.vue     # Grilla del catálogo
│   ├── CartDrawer.vue      # Panel lateral del carrito
│   ├── CheckoutForm.vue    # Formulario de checkout
│   └── WhatsAppButton.vue  # Botón flotante de WhatsApp
├── views/
│   ├── HomeView.vue        # Página principal
│   ├── ProductDetailView.vue  # Detalle de producto
│   ├── CartView.vue        # Página del carrito
│   ├── CheckoutView.vue    # Página de checkout
│   ├── PaymentSuccessView.vue # Pago exitoso
│   ├── PaymentErrorView.vue   # Pago fallido
│   └── NotFoundView.vue    # Página 404
├── stores/
│   └── cart.js             # Store de Pinia para el carrito
├── services/
│   └── api.js              # Servicios de API
├── router/
│   └── index.js            # Configuración de rutas
├── App.vue                 # Componente raíz
└── main.js                 # Punto de entrada
```

## 🎨 Paleta de Colores

| Variable | Color | Uso |
|----------|-------|-----|
| `--color-background` | #F6F1EA | Fondo principal (marfil) |
| `--color-primary` | #C8B79E | Color primario (arena) |
| `--color-secondary` | #8C7A66 | Color secundario (marrón suave) |
| `--color-accent` | #C2A15F | Acentos (dorado sutil) |
| `--color-text` | #2E2A26 | Texto principal |
| `--color-muted` | #7A746E | Texto secundario |

## 🔗 API Endpoints Esperados

El frontend consume los siguientes endpoints:

- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto
- `POST /api/orders` - Crear pedido
- `POST /api/payments/preference` - Generar preferencia de pago

## 📱 Funcionalidades

- ✅ Home con presentación de marca y catálogo
- ✅ Detalle de producto con notas olfativas
- ✅ Carrito con estado global (Pinia)
- ✅ Checkout con formulario validado
- ✅ Integración con Mercado Pago (via backend)
- ✅ Páginas de éxito y error de pago
- ✅ Botón de WhatsApp para asesoramiento
- ✅ Diseño responsive
- ✅ Animaciones sutiles

## 🚀 Desarrollo

El proyecto incluye datos mock para desarrollo. Cuando la API no está disponible, se utilizan productos de ejemplo automáticamente.

---

Desarrollado con ❤️ para **Vittore**

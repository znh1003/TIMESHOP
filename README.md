# TIMESHOP

E-commerce premium para México con enfoque en lifestyle, diseño y alto ticket.

## Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Vercel ready
- PayPal ready
- Supabase ready
- Resend ready

## Scripts

```bash
npm install
npm run dev
npm run build
npm run start
```

## Variables de entorno

Crea un archivo `.env.local` con las siguientes variables:

```bash
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role
PAYPAL_CLIENT_ID=tu-client-id
PAYPAL_CLIENT_SECRET=tu-client-secret
PAYPAL_ENVIRONMENT=sandbox
PAYPAL_WEBHOOK_ID=tu-webhook-id
RESEND_API_KEY=tu-api-key
EMAIL_FROM=hola@tu-dominio.com
```

## Estado actual

El proyecto ya incluye:

- layout principal y branding premium
- páginas públicas del storefront
- catálogo y detalle de producto
- carrito, checkout y cuentas
- estructura modular para Supabase, PayPal y env validation
- contenido en español mexicano

Este sitio está listo para continuar desarrollando la integración real con PayPal, Supabase, Resend y el panel administrativo protegible.

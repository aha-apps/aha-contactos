# AHA Contactos — Spec Funcional

## Identidad

- **Nombre:** AHA Contactos
- **Tagline:** Tu agenda inteligente, siempre contigo
- **Color:** #6366f1 (indigo-500)
- **Target:** Profesionales, freelancers, dueños de negocio, agendas de ventas
- **Perfil:** Lite (file://, doble clic)

## Stack

- Alpine.js 3 + Dexie 3 + DaisyUI 4 + Tailwind Play CDN + Bootstrap Icons
- ES5 estricto, offline-first, sin servidor
- Chart.js 4 para gráficos en reportes

## DB Schema (Dexie)

```
contactos: ++id, nombre, telefono, email, direccion, empresa, puesto, grupoId, etiquetas, favorito, createdBy, createdAt, updatedAt
grupos: ++id, nombre, descripcion, createdAt
etiquetas: ++id, nombre, color, createdAt
actividades: ++id, contactoId, tipo, fecha, descripcion, createdBy, createdAt
```

## Módulos

### 1. Contactos (`#/contactos`)
- CRUD completo
- Campos: nombre, teléfono, email, dirección, empresa, puesto, grupo, etiquetas (múltiple), favorito
- Búsqueda por nombre, teléfono, email
- Filtros por grupo, etiqueta, favoritos
- Vista de lista y vista de tarjetas
- Acción rápida: llamar, enviar email, ver en mapa

### 2. Grupos (`#/grupos`)
- CRUD de grupos
- Campos: nombre, descripción
- Vista de contactos por grupo

### 3. Etiquetas (`#/etiquetas`)
- CRUD de etiquetas con selector de color
- Las etiquetas se asignan a contactos (múltiples por contacto)
- Filtro rápido por etiqueta en la lista de contactos

### 4. Actividades (`#/actividades`)
- Registro de actividades por contacto
- Tipos: llamada, email, reunión, nota, seguimiento
- Fecha y descripción
- Filtro por contacto, tipo, rango de fechas
- Timeline cronológico

### 5. Reportes (`#/reportes`)
- Dashboard con Chart.js:
  - Contactos por grupo: gráfico de pastel
  - Actividades por mes: gráfico de barras
  - Actividades por tipo: gráfico de pastel
  - Contactos agregados por mes: gráfico de líneas

## Estilo

- DaisyUI tema índigo (indigo-500 como primario)
- Layout: sidebar + contenido principal
- Tablas responsive con scroll horizontal en móvil
- Formularios en modal (UI.modalForm)
- Toasts para feedback de operaciones

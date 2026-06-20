# EL VASCO SHOP

Plataforma oficial de e-commerce premium para **EL VASCO SHOP**.

## Tecnologías Principales

*   **Framework:** Next.js 14 (App Router)
*   **Estilos:** Tailwind CSS v4 + Framer Motion
*   **Base de Datos:** PostgreSQL con Prisma ORM
*   **Estado:** Zustand (Carrito y UI)
*   **Autenticación:** Sistema híbrido (Cookies + JWT)

## Requisitos Previos

*   Node.js 18+
*   PostgreSQL corriendo en el puerto 5432

## Instalación

1.  Clonar el repositorio.
2.  Instalar dependencias: `npm install`
3.  Configurar las variables de entorno en el archivo `.env` (Base de datos PostgreSQL).
4.  Ejecutar las migraciones: `npx prisma migrate dev`
5.  Iniciar en modo desarrollo: `npm run dev`

## Acceso Administrativo (Entorno de Desarrollo)

Se ha implementado una seguridad inicial con un panel oculto.

*   **URL:** `http://localhost:3000/admin`
*   **Contraseña de Desarrollo:** `admin123`
*(Nota: En esta fase MVP, el acceso no requiere usuario, solo esta contraseña de pase. La sesión dura 24hs vía cookie segura).*

## Identidad Visual

Toda la aplicación se construye sobre la marca oficial (logo rojo, dorado y negro). El sistema de temas (Claro/Oscuro) está diseñado para resaltar siempre este branding utilizando un estilo "Glassmorphism" elegante.

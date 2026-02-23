# 🐳 Guía de Configuración y Despliegue con Docker

Este documento detalla paso a paso cómo levantar el entorno de desarrollo y producción usando Docker y Docker Compose para este proyecto, junto con información clave sobre la arquitectura, puertos y comandos útiles.

---

## 🛠 Stack de Tecnología

- **Frontend:** React.js (Create React App), Nginx (para servir estáticos en producción)
- **Backend:** NestJS, TypeScript, Node.js (v20)
- **Infraestructura:** Docker, Docker Compose

---

## 📂 Archivos y Rutas Importantes

- `docker-compose.yml`: Configuración base y para **Desarrollo Local** (live-reloading habilitado mediante volúmenes).
- `docker-compose.prod.yml`: Configuración específica para el **Servidor Linux (Producción)**. Sobrescribe a la configuración base para usar Nginx y construcciones optimizadas sin dependencias locales.
- `nestjs/magic_ceipa/Dockerfile`: Definición de la construcción multi-etapa del backend.
- `magicFront/magicFront/Dockerfile`: Definición de la construcción multi-etapa del frontend.
- `nestjs/magic_ceipa/` y `magicFront/magicFront/`: Rutas del código fuente que se sincronizan al contenedor de desarrollo en tiempo real.

---

## 🔌 Puertos Configurados

Es importante asegurarse de que estos puertos estén libres en tu máquina o servidor antes de levantar los contenedores. Estos se configuran en los archivos `docker-compose`.

| Servicio             | Entorno    | Puerto Externo (Host) | Puerto Interno (Contenedor) | Notas                                                             |
| :------------------- | :--------- | :-------------------- | :-------------------------- | :---------------------------------------------------------------- |
| **Frontend (React)** | Desarrollo | `3000`                | `3000`                      | Interfaz de Usuario                                               |
| **Backend (NestJS)** | Desarrollo | `3001`                | `3001`                      | Acceso a la API localmente. Mapeado al 3001 para no colisionar    |
| **Frontend (Nginx)** | Producción | `80`                  | `80`                        | Puerto HTTP por defecto, modificable en `docker-compose.prod.yml` |
| **Backend (NestJS)** | Producción | `3001`                | `3001`                      | Modificable en `docker-compose.prod.yml`                          |

---

## 🚀 Paso a Paso: Despliegue

### 1. Entorno de Desarrollo (Tu máquina local)

En este entorno, cualquier cambio que guardes en tu código se reflejará instantáneamente gracias a los volúmenes de Docker, y las dependencias (`node_modules`) se mantendrán aisladas en el contenedor para evitar conflictos.

**Comando para levantar desarrollo:**

```bash
docker-compose up --build
```

> _Nota: Para detenerlo, simplemente presiona `Ctrl+C` en la terminal. Si deseas correrlo en segundo plano, añade la bandera `-d` al final del comando._

- **Frontend disponible en:** [http://localhost:3000](http://localhost:3000)
- **Backend disponible en:** [http://localhost:3001](http://localhost:3001)

### 2. Entorno de Producción (Servidor Linux)

Este entorno compila el código (Javascript minimizado) y no escucha cambios locales. El frontend es servido a través de **Nginx** logrando un alto rendimiento.

**Comando para levantar producción en segundo plano (Recomendado):**

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

- **Aplicación web disponible en:** puerto `80` (ej: `http://tudominio.com` o la IP de tu servidor)
- **API del Backend disponible en:** puerto `3001`

---

## 💻 Comandos Útiles de Docker

- **Detener contenedores:** `docker-compose down` (Detiene y remueve los contenedores, pero preserva los volúmenes de datos si existen).
- **Ver logs (si corren en modo detach/segundo plano):**
  - Todos los servicios: `docker-compose logs -f`
  - Solo el backend: `docker-compose logs -f backend-dev` (o `backend-prod`)
  - Solo el frontend: `docker-compose logs -f frontend-dev` (o `frontend-prod`)
- **Forzar la reconstrucción total de imágenes sin usar caché:**
  `docker-compose build --no-cache`
- **Entrar a la terminal interactiva de un contenedor corriendo:**
  `docker exec -it <nombre_del_contenedor> sh`
  _(Ej: `docker exec -it nestjs_backend_dev sh`)_
- **Limpiar el sistema Docker (Imágenes no usadas, redes, volúmenes colgados):**
  `docker system prune` o de forma más agresiva `docker system prune -a --volumes`

---

## ⚠️ Posibles Fallas y Soluciones (Troubleshooting)

1.  **Error: "Port is already allocated" o EADDRINUSE**
    - **Causa:** Otra aplicación (quizás otro proyecto de Node) ya está usando los puertos configurados (3000, 3001 o 80).
    - **Solución:** Ve al `docker-compose.yml` o `docker-compose.prod.yml` y cambia el puerto del Host (el número a la izquierda de los dos puntos `:`) a otro número libre (ej. `3005:3001`).
2.  **Los paquetes NPM instalados en local dan conflicto y el contenedor se rompe**
    - **Causa:** Tu subida accidental de tu `node_modules` de macOS mezclado con el entorno Alpine Linux del contenedor.
    - **Solución:** Los archivos `.dockerignore` previenen esto, pero si un volumen lo sobreescribió, corre:
      `docker-compose down -v` (Esto borra los volúmenes para que empiece de cero) y vuelve a correr `docker-compose up --build`.
3.  **Cambios en el código no se refrescan en desarrollo (React o NestJS)**
    - **Causa:** Los volúmenes en `docker-compose.yml` no están apuntando al directorio correcto de tu proyecto.
    - **Solución:** Verifica que la ruta `./nestjs/magic_ceipa` y `./magicFront/magicFront` del lado izquierdo del `:` correspondan exactamente a los nombres de tus carpetas en relación a donde corres el comando.
4.  **Error al "Instalar" dependencias con NPM (ELIFECYCLE, ENOENT)**
    - **Causa:** Puede deberse a caché corrompida durante el build original.
    - **Solución:** Reconstruye las imágenes sin el caché previo: `docker-compose build --no-cache` o elimina toda tu carpeta en tu S.O anfitrión `node_modules` y `package-lock.json` e intenta de nuevo.

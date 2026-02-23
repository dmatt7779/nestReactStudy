# 🐳 Guía de Configuración y Despliegue con Docker

Este documento detalla paso a paso cómo levantar el entorno de desarrollo y producción usando Docker y Docker Compose para este proyecto, junto con información clave sobre la arquitectura, puertos y comandos útiles.

---

## 🛠 Stack de Tecnología

- **Frontend:** React.js (Create React App), Nginx (para servir estáticos en producción)
- **Backend Core (NestJS):** NestJS, TypeScript, Node.js, TypeORM
- **Motor Financiero (Python):** FastAPI, Uvicorn, Python 3.11, OpenPyXL y libreoffice-headless (Embebidos en Docker)
- **Infraestructura:** Docker, Docker Compose

---

## 📂 Archivos y Rutas Importantes

- `docker-compose.yml`: Configuración base y para **Desarrollo Local** (live-reloading habilitado mediante volúmenes).
- `docker-compose.prod.yml`: Configuración específica para el **Servidor Linux (Producción)**. Sobrescribe a la configuración base para usar Nginx y construcciones optimizadas sin dependencias locales.
- `nestjs/magic_ceipa/Dockerfile`: Definición multi-etapa del backend principal.
- `magicFront/magicFront/Dockerfile`: Definición multi-etapa del frontend.
- `planfin_microservice/Dockerfile`: Definición multi-etapa del backend en Python (requiere LibreOffice).
- Carpetas de código (`nestjs`, `magicFront`, `planfin_microservice`): Rutas sincronizadas al contenedor de desarrollo en tiempo real.

---

## 🔌 Puertos Configurados

Es importante asegurarse de que estos puertos estén libres en tu máquina o servidor antes de levantar los contenedores. Estos se configuran en los archivos `docker-compose`.

| Servicio             | Entorno    | Puerto Externo (Host) | Puerto Interno (Contenedor) | Notas                                                            |
| :------------------- | :--------- | :-------------------- | :-------------------------- | :--------------------------------------------------------------- |
| **Frontend (React)** | Desarrollo | `3005`                | `3005`                      | Interfaz de Usuario                                              |
| **Backend (NestJS)** | Desarrollo | `3006`                | `3006`                      | Acceso a la API Core localmente                                  |
| **Backend (Python)** | Desarrollo | `3007`                | `3007`                      | Acceso al Microservicio de Python localmente                     |
| **Frontend (Nginx)** | Producción | `3005`                | `80`                        | Web Server de producción, sirviendo el bundle compilado de React |
| **Backend (NestJS)** | Producción | `3006`                | `3006`                      | Modificable en `docker-compose.prod.yml`                         |
| **Backend (Python)** | Producción | `3007`                | `3007`                      | Modificable en `docker-compose.prod.yml`                         |

---

## 🚀 Paso a Paso: Despliegue

### 1. Entorno de Desarrollo (Tu máquina local)

En este entorno, cualquier cambio que guardes en tu código se reflejará instantáneamente gracias a los volúmenes de Docker, y las dependencias (`node_modules`) se mantendrán aisladas en el contenedor para evitar conflictos.

**Comando para levantar desarrollo:**

```bash
docker-compose up --build
```

> _Nota: Para detenerlo, simplemente presiona `Ctrl+C` en la terminal. Si deseas correrlo en segundo plano, añade la bandera `-d` al final del comando._

- **Frontend disponible en:** [http://localhost:3005](http://localhost:3005)
- **Backend (NestJS) disponible en:** [http://localhost:3006](http://localhost:3006)
- **Backend (Python) disponible en:** [http://localhost:3007](http://localhost:3007)

### 2. Entorno de Producción (Servidor Linux)

Este entorno compila el código (Javascript minimizado) y no escucha cambios locales. El frontend es servido a través de **Nginx** logrando un alto rendimiento.

**Comando para levantar producción en segundo plano (Recomendado):**

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

- **Aplicación web disponible en:** puerto `3005` (ej: `http://tudominio.com:3005` o la IP de tu servidor)
- **API del Backend (NestJS) disponible en:** puerto `3006`
- **API del Backend (Python) disponible en:** puerto `3007`

### 🌍 Archivos a modificar para Producción (Cambiar `localhost` por IP/Dominio)

Antes de hacer el build de producción en tu servidor (o si no logran comunicarse los contenedores desde internet), **debes** reemplazar la palabra `localhost` por la IP pública de tu servidor o tu dominio oficial en los siguientes archivos:

1. **`magicFront/magicFront/.env` (Variables de entorno de React)**
   - `REACT_APP_API_URL=http://<TU_IP_O_DOMINIO>:3006` (Apunta NestJS)
   - `REACT_APP_PY_APP_API_URL=http://<TU_IP_O_DOMINIO>:3007` (Apunta Python)
     > _React se ejecuta en el navegador del cliente (celulares o laptops externos), por lo que intentar buscar `localhost` literalmente buscaría el servidor de NestJS dentro del celular del usuario, provocando un error de red._

2. **`nestjs/magic_ceipa/.env` (Variables de entorno de NestJS)**
   - `CORS_ORIGIN=http://<TU_IP_O_DOMINIO>:3005` (Autoriza a tu Front-End a hacer peticiones)
     > _Si no se actualiza, el Backend NestJS bloqueará todas tus peticiones HTTP desde produccíon por políticas restrictivas CORS._

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
    - **Causa:** Otra aplicación (quizás otro proyecto de Node) ya está usando los puertos configurados (3005, 3006 o 3007).
    - **Solución:** Ve al `docker-compose.yml` o `docker-compose.prod.yml` y cambia el puerto del Host (el número a la izquierda de los dos puntos `:`) a otro número libre.
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
5.  **¿Qué pasa con la carpeta `excel_templates/` en el proyecto de Python con Docker?**
    - **Arquitectura:** El código internamente (`ExcelTemplateManager`) accede a sus plantillas mediante una ruta relativa.
    - **En Desarrollo:** Gracias al volumen que mapea `./planfin_microservice:/app`, el contenedor de Python lee tu misma carpeta local en tiempo real. Si editas u ocupas un Excel nuevo, el contenedor lo procesará al instante.
    - **En Producción:** El Dockerfile utiliza `COPY . /app`, por lo que todos los `excel_templates` son "empaquetados y congelados" directamente dentro del contenedor inyectado con Linux y Libreoffice.
    - **Procesamiento de Macros (LibreOffice):** Cuando NestJS envía datos, Python inyecta los json al Excel base, llama a **LibreOffice Headless** directamente dentro de la máquina virtual Alpine Linux del contenedor interactuando con el kernel del sistema para re-calcular las celdas formuladas (WACC, VPN, etc.), las extrae y retorna por JSON al intermediario NestJS.

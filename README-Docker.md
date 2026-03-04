# 🐳 Guía de Configuración y Despliegue con Docker

Este documento detalla paso a paso cómo levantar el entorno de desarrollo y producción usando Docker y Docker Compose para este proyecto, junto con información clave sobre la arquitectura, puertos y comandos útiles.

---

## 🛠 Stack de Tecnología

- **Frontend:** React.js (Create React App), Nginx (para servir estáticos en producción)
- **Backend Core (NestJS):** NestJS, TypeScript, Node.js, TypeORM, PDFKit (generación de reportes PDF)
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

#### 📁 Estructura de Carpetas en el Servidor

El servidor de producción tiene una estructura de **rutas separadas**:

| Ubicación                            | Contenido                                                                         |
| :----------------------------------- | :-------------------------------------------------------------------------------- |
| `/home/dtc_user/docker/magic/`       | Archivos de orquestación Docker (`docker-compose.yml`, `docker-compose.prod.yml`) |
| `/data/magic/nestjs/magic_ceipa/`    | Código fuente del Backend NestJS + su `.env` y `Dockerfile`                       |
| `/data/magic/magicFront/magicFront/` | Código fuente del Frontend React + su `.env` y `Dockerfile`                       |
| `/data/magic/planfin_microservice/`  | Código fuente del Microservicio Python + su `Dockerfile`                          |

> ⚠️ El `docker-compose.prod.yml` usa **rutas absolutas** (`context: /data/magic/...`) en los `build.context` para apuntar al código fuente, ya que los compose files no están en la misma carpeta que el proyecto.

#### Comando para levantar producción

Ejecutar desde `/home/dtc_user/docker/magic/`:

```bash
cd /home/dtc_user/docker/magic/
docker-compose -f docker-compose.prod.yml up -d --build
```

- **Aplicación web disponible en:** puerto `3005` (ej: `http://tudominio.com:3005` o la IP de tu servidor)
- **API del Backend (NestJS) disponible en:** puerto `3006`
- **API del Backend (Python) disponible en:** puerto `3007`

---

## 🌍 Checklist de Archivos a Modificar para Producción

Antes de hacer el build de producción en tu servidor, **debes** verificar y ajustar los siguientes archivos. Si no se actualizan, la aplicación podrá compilar pero **no funcionará** desde dispositivos externos.

### 📄 1. `/data/magic/magicFront/magicFront/.env`

Variables del Frontend React. Este archivo es leído al momento del **build** (no en runtime), así que cualquier cambio requiere reconstruir la imagen.

```env
REACT_APP_API_URL=http://<TU_IP_O_DOMINIO>:3006
REACT_APP_PY_APP_API_URL=http://<TU_IP_O_DOMINIO>:3007
```

> ⚠️ React se ejecuta en el **navegador del cliente** (celulares o laptops externos), por lo que `localhost` literalmente buscaría el servidor de NestJS dentro del celular del usuario, provocando un error de red. Reemplaza `localhost` por la IP pública o dominio de tu servidor.

### 📄 2. `/data/magic/nestjs/magic_ceipa/.env`

Variables del Backend NestJS. Este archivo es leído en **runtime** por el contenedor.

```env
CORS_ORIGIN=http://<TU_IP_O_DOMINIO>:3005
MAGIC_PORT=3006
DB_HOST=<IP_DEL_HOST_MYSQL>
DB_PORT=3307
DB_USERNAME=<USUARIO_DB_PROD>
DB_PASSWORD=<CONTRASEÑA_DB_PROD>
DB_DATABASE=db_magic
```

| Variable      | Qué cambiar                                                                                                 |
| :------------ | :---------------------------------------------------------------------------------------------------------- |
| `CORS_ORIGIN` | ⚠️ **Obligatorio.** Cambiar `localhost` por IP/Dominio. Si no, el backend bloqueará peticiones CORS.        |
| `DB_HOST`     | En Linux nativo (sin Docker Desktop), cambiar `host.docker.internal` a la IP del host MySQL o `172.17.0.1`. |
| `DB_PORT`     | Ajustar si tu MySQL corre en otro puerto.                                                                   |
| `DB_USERNAME` | Credenciales de tu base de datos de producción.                                                             |
| `DB_PASSWORD` | Credenciales de tu base de datos de producción.                                                             |
| `DB_DATABASE` | Nombre de la base de datos de producción.                                                                   |

### 📄 3. `/home/dtc_user/docker/magic/docker-compose.prod.yml`

El archivo de orquestación ya apunta a las rutas absolutas de producción. **Verifica** que estas rutas coincidan con donde realmente está el código en el servidor:

```yaml
backend-prod:
  build:
    context: /data/magic/nestjs/magic_ceipa # ← Verificar ruta
frontend-prod:
  build:
    context: /data/magic/magicFront/magicFront # ← Verificar ruta
python-backend-prod:
  build:
    context: /data/magic/planfin_microservice # ← Verificar ruta
```

### 📄 4. Base de Datos MySQL

TypeORM está configurado con `synchronize: true` en `app.module.ts`, lo que significa que **automáticamente creará o actualizará** las tablas y columnas al iniciar el backend. Esto incluye las columnas nuevas agregadas recientemente (`verified`, `verifiedBy`, `verifiedAt` en la tabla `financial_result`).

> ⚠️ Si tu entorno de producción tiene `synchronize: false` por seguridad, deberás ejecutar las migraciones manualmente o agregar las columnas con SQL:
>
> ```sql
> ALTER TABLE financial_result ADD COLUMN verified TINYINT(1) DEFAULT 0;
> ALTER TABLE financial_result ADD COLUMN verifiedBy INT NULL;
> ALTER TABLE financial_result ADD COLUMN verifiedAt DATETIME NULL;
> ALTER TABLE financial_result ADD COLUMN comments JSON NULL;
> ```

---

## 📋 Changelog de Funcionalidades Recientes

Estas funcionalidades fueron integradas al sistema y están incluidas en el ciclo de despliegue:

| Feature                              | Descripción                                                                                                                                                                                                          |
| :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard de Profesores**          | Pantalla exclusiva para profesores que muestra solo los proyectos asignados a su ID con resultados financieros.                                                                                                      |
| **Verificación de Proyectos**        | Los profesores pueden marcar proyectos como "verificados", separándolos del listado principal.                                                                                                                       |
| **Pantalla de Verificados**          | Vista `/VerifiedProjects` lista los proyectos ya aprobados con opción de desmarcar.                                                                                                                                  |
| **Buscador Dinámico**                | Filtrado en tiempo real por nombre de proyecto, nombre de estudiante o cédula en el dashboard del profesor.                                                                                                          |
| **Roles JWT Mejorados**              | El JWT ahora incluye `id` y `role` del usuario. Endpoints protegidos con `@Auth(Role.USER, Role.PROFESSOR)`.                                                                                                         |
| **Navbar Condicional**               | Menú de navegación adaptado según el rol: estudiantes ven instrucciones/resultados, profesores ven asignaciones y verificados.                                                                                       |
| **CeipaLoader Animado**              | Animación de carga con ciclo mínimo garantizado de 8s en login y navegación entre pantallas.                                                                                                                         |
| **Eliminación en Cascada**           | Borrar un proyecto elimina todos los datos relacionados (macros, costos, activos, resultados financieros).                                                                                                           |
| **Microservicio Python Dockerizado** | FastAPI + LibreOffice Headless empaquetados en Alpine Linux para el cálculo financiero automatizado.                                                                                                                 |
| **Comentarios por Pantalla**         | Los estudiantes pueden escribir análisis/comentarios en cada pantalla de resultados. Se guardan en columna JSON de la DB.                                                                                            |
| **Generación de Reportes PDF**       | Endpoint `GET /api/v1/reports/project/:id` genera un PDF con todas las tablas financieras y comentarios del estudiante. Descargable desde la pantalla de Indicadores (estudiante) y desde el Dashboard del Profesor. |
| **Expiración de Token JWT**          | El `ProtectedRoute` del frontend ahora decodifica el JWT y verifica su expiración. Si el token venció (4h), redirige a login automáticamente al recargar o navegar.                                                  |

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
  _(Ej: `docker exec -it nestjs_backend_prod sh`)_
- **Limpiar el sistema Docker (Imágenes no usadas, redes, volúmenes colgados):**
  `docker system prune` o de forma más agresiva `docker system prune -a --volumes`

---

## ⚠️ Posibles Fallas y Soluciones (Troubleshooting)

1.  **Error: "Port is already allocated" o EADDRINUSE**
    - **Causa:** Otra aplicación ya está usando los puertos configurados (3005, 3006 o 3007).
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
6.  **Error 403 Forbidden al acceder desde el Dashboard del Profesor**
    - **Causa:** El profesor no está asignado al proyecto o el endpoint no tiene el decorador `@Auth(Role.PROFESSOR)`.
    - **Solución:** Verificar que el `id` del profesor esté en el array `professor` del `ProjectInfo`.
7.  **Las nuevas columnas de verificación no aparecen en la DB**
    - **Causa:** `synchronize: true` puede no estar habilitado, o TypeORM no recargó el schema.
    - **Solución:** Reiniciar el contenedor de NestJS: `docker-compose restart backend-prod`. Si no funciona, agregar las columnas manualmente (ver sección de Base de Datos arriba).
8.  **Error al generar el reporte PDF (500 Internal Server Error)**
    - **Causa:** El proyecto no tiene resultados financieros guardados, o `pdfkit` no se instaló correctamente.
    - **Solución:** Verificar que el proyecto tenga datos en `financial_result`. Si el error persiste, reconstruir la imagen de NestJS: `docker-compose up --build backend-prod`.

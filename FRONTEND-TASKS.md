# Frontend Development Tasks

## Objetivo
Desarrollar el frontend de la aplicación usando el backend provisto en `rubrics_project_backend-main` sin modificar ese código.

## Prioridad inicial
1. Preparar la conexión con el backend.
2. Implementar autenticación y manejo de sesión.
3. Construir la interfaz de usuarios básicos (administrador, docente, estudiante).
4. Añadir los módulos de gestión académica y evaluación según los mockups.

## Tareas iniciales
- [x] Crear `.env` con `VITE_API_URL` y `VITE_API_URL_SECURITY`.
- [x] Crear `src/services/api.ts` con clientes de Axios para backend y auth.
- [x] Actualizar `securityService.ts` para usar la respuesta real de login.
- [x] Crear `academicService.ts` con métodos para carreras, semestres, materias, planes, grupos, matrículas e inscripciones.
- [x] Crear `evaluationService.ts` con métodos para rúbricas, criterios, escalas, evaluaciones y calificaciones.

## Pasos siguientes
1. Revisar el diseño actual del frontend y los mockups para identificar las pantallas prioritarias.
2. Crear páginas y rutas para:
   - Login / autenticación
   - Usuarios
   - Carreras / semestres / asignaturas
   - Planes de estudio
   - Grupos y asignación de docentes
   - Rúbricas y evaluaciones
   - Calificaciones y vistas de estudiante
3. Consumir los endpoints existentes del backend y verificar con datos reales.
4. Ajustar la navegación y los permisos de rol.

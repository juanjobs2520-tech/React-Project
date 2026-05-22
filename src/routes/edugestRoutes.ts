import { lazy } from 'react';

const UsuariosPage = lazy(() => import('../pages/usuarios/UsuariosPage'));
const CarrerasSemestresPage = lazy(() => import('../pages/academico/CarrerasSemestresPage'));
const AsignaturasPage = lazy(() => import('../pages/academico/AsignaturasPage'));
const PlanEstudiosPage = lazy(() => import('../pages/academico/PlanEstudiosPage'));
const AsignarDocentePage = lazy(() => import('../pages/grupos/AsignarDocentePage'));
const MatricularEstudiantePage = lazy(() => import('../pages/matriculas/MatricularEstudiantePage'));
const InscribirEstudiantePage = lazy(() => import('../pages/inscripciones/InscribirEstudiantePage'));

const CrearRubricaPage = lazy(() => import('../pages/rubricas/CrearRubricaPage'));
const DefinirEscalasPage = lazy(() => import('../pages/rubricas/DefinirEscalasPage'));
const EvaluacionesIndexPage = lazy(() => import('../pages/evaluaciones/EvaluacionesIndexPage'));
const AsociarRubricaPage = lazy(() => import('../pages/evaluaciones/AsociarRubricaPage'));
const CalificarEstudiantePage = lazy(() => import('../pages/evaluaciones/CalificarEstudiantePage'));
const NotaFinalPage = lazy(() => import('../pages/calificaciones/NotaFinalPage'));
const VerRubricaEstudiantePage = lazy(() => import('../pages/estudiante/VerRubricaEstudiantePage'));
const VerCalificacionDetallePage = lazy(() => import('../pages/estudiante/VerCalificacionDetallePage'));
const MisCalificacionesPage = lazy(() => import('../pages/estudiante/MisCalificacionesPage'));

export const edugestRoutes = [
  { path: '/usuarios', title: 'Usuarios', component: UsuariosPage },
  { path: '/academico/carreras', title: 'Carreras y semestres', component: CarrerasSemestresPage },
  { path: '/academico/asignaturas', title: 'Asignaturas', component: AsignaturasPage },
  { path: '/academico/plan-estudios', title: 'Plan de estudios', component: PlanEstudiosPage },
  { path: '/grupos/asignar-docente', title: 'Asignar docente', component: AsignarDocentePage },
  { path: '/matriculas/matricular', title: 'Matricular estudiante', component: MatricularEstudiantePage },
  { path: '/inscripciones/inscribir', title: 'Inscribir estudiante', component: InscribirEstudiantePage },
  { path: '/rubricas/crear', title: 'Crear rúbrica', component: CrearRubricaPage },
  { path: '/rubricas/:id/escalas', title: 'Definir escalas', component: DefinirEscalasPage },
  { path: '/evaluaciones', title: 'Evaluaciones', component: EvaluacionesIndexPage },
  { path: '/evaluaciones/:id/asociar-rubrica', title: 'Asociar rúbrica', component: AsociarRubricaPage },
  { path: '/evaluaciones/:id/calificar', title: 'Calificar', component: CalificarEstudiantePage },
  { path: '/calificaciones/nota-final', title: 'Nota final', component: NotaFinalPage },
  { path: '/mis-evaluaciones/:id/rubrica', title: 'Ver rúbrica', component: VerRubricaEstudiantePage },
  { path: '/mis-calificaciones', title: 'Mis calificaciones', component: MisCalificacionesPage },
  { path: '/mis-calificaciones/:id/detalle', title: 'Detalle calificación', component: VerCalificacionDetallePage },
];

export default edugestRoutes;

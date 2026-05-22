import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { evaluationsService } from '../../services/evaluationsService';
import { Grade } from '../../models/Evaluation';
import { getApiErrorMessage, showErrorToast } from '../../utils/toast';

const MisCalificacionesPage = () => {
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    evaluationsService
      .listGrades()
      .then(setGrades)
      .catch((e) => showErrorToast(getApiErrorMessage(e)));
  }, []);

  return (
    <div className="edugest-page">
      <PageHeader
        title="Mis calificaciones"
        breadcrumbs={[{ label: 'Inicio', to: '/usuarios' }, { label: 'Mis calificaciones' }]}
      />
      <div className="edugest-table-wrap">
        <table className="edugest-table">
          <thead>
            <tr>
              <th>Nota final</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g) => (
              <tr key={g.id}>
                <td>
                  <strong>{g.final_score}</strong> / 100
                </td>
                <td>
                  {g.status === 'SENT' ? (
                    <StatusBadge variant="success" label="Enviada" />
                  ) : (
                    <StatusBadge variant="warning" label="Borrador" />
                  )}
                </td>
                <td>
                  <Link className="edugest-btn edugest-btn-primary" to={`/mis-calificaciones/${g.id}/detalle`}>
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MisCalificacionesPage;

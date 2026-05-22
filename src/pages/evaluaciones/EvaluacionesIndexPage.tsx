import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { evaluationsService } from '../../services/evaluationsService';
import { Evaluation } from '../../models/Evaluation';
import { getApiErrorMessage, showErrorToast } from '../../utils/toast';

const EvaluacionesIndexPage = () => {
  const [items, setItems] = useState<Evaluation[]>([]);

  useEffect(() => {
    evaluationsService
      .list()
      .then(setItems)
      .catch((e) => showErrorToast(getApiErrorMessage(e)));
  }, []);

  return (
    <div className="edugest-page">
      <PageHeader title="Evaluaciones" breadcrumbs={[{ label: 'Inicio', to: '/usuarios' }, { label: 'Evaluaciones' }]} />
      <div className="edugest-table-wrap">
        <table className="edugest-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Ponderación</th>
              <th>Rúbrica</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((ev) => (
              <tr key={ev.id}>
                <td>{ev.name}</td>
                <td>{ev.weight}%</td>
                <td>{ev.rubric_id ? 'Sí' : 'No'}</td>
                <td>
                  <Link className="edugest-btn edugest-btn-secondary" to={`/evaluaciones/${ev.id}/asociar-rubrica`}>
                    Asociar rúbrica
                  </Link>{' '}
                  <Link className="edugest-btn edugest-btn-primary" to={`/evaluaciones/${ev.id}/calificar`}>
                    Calificar
                  </Link>{' '}
                  <Link className="edugest-btn edugest-btn-secondary" to={`/mis-evaluaciones/${ev.id}/rubrica`}>
                    Ver rúbrica (est.)
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

export default EvaluacionesIndexPage;

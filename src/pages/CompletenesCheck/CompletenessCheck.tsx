import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useCompletenessCheck } from './api';

export const CompletenessCheck = () => {
  const { data, isLoading, error } = useQuery(useCompletenessCheck());

  if (isLoading) {
    return (
      <div className="container my-4">
        <div className="text-center">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p>Проверка полноты данных...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-4">
        <div className="alert alert-danger">
          Ошибка при проверке полноты данных: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="card border-danger shadow">
        <div className="card-header bg-danger text-white">
          <h2 className="h5 mb-0">Проверка полноты знаний</h2>
        </div>

        <div className="card-body">
          {data?.isError ? (
            <>
              <div className="alert alert-danger mb-4">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Обнаружены незаполненные поля!
              </div>

              <h5 className="mb-3">Отсутствующие данные:</h5>
              <div className="list-group mb-4">
                {Object.entries(data.missing).map(([className, missingProps]) => (
                  <div key={className} className="list-group-item">
                    <h6 className="mb-2">{className}</h6>
                    <ul className="mb-0">
                      {missingProps.map(prop => (
                        <li key={`${className}-${prop}`}>
                          <Link
                            to={`/property-values?class=${encodeURIComponent(className)}&prop=${encodeURIComponent(prop)}`}
                            className="text-danger"
                          >
                            {prop}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="alert alert-success">
              <i className="bi bi-check-circle-fill me-2"></i>
              Все необходимые данные заполнены!
            </div>
          )}

          <div className="mt-4">
            <h5 className="mb-3">Все свойства системы:</h5>
            <div className="d-flex flex-wrap gap-2">
              {data?.props.map(prop => (
                <span key={prop} className="badge bg-danger">
                  {prop}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
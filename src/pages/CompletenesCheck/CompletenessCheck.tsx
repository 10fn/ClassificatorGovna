import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useCompletenessCheck } from './api';

export const CompletenessCheck = () => {
  const { data, isLoading, error } = useQuery(useCompletenessCheck());

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <h3 className="mt-3 text-primary">Идет анализ данных...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger d-flex align-items-center">
          <i className="bi bi-x-circle-fill me-3 fs-4"></i>
          <div>
            <h4 className="alert-heading">Ошибка анализа</h4>
            <p className="mb-0">{(error as Error).message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-lg-5">
      <div className="row justify-content-center">
        <div className="col-lg-10 col-xl-8">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="text-primary mb-0">
              <i className="bi bi-clipboard2-pulse me-2"></i>
              Анализ полноты данных
            </h1>
            <span className={`badge rounded-pill ${data?.isError ? 'bg-danger' : 'bg-success'} fs-6`}>
              {data?.isError ? 'Требуется доработка' : 'Все заполнено'}
            </span>
          </div>

          <div className="card border-0 shadow-lg mb-4">
            <div className="card-body p-4">
              {data?.isError ? (
                <div className="row">
                  <div className="col-md-8">
                    <div className="alert alert-warning border-warning">
                      <h4 className="alert-heading d-flex align-items-center">
                        <i className="bi bi-exclamation-octagon-fill text-danger me-2"></i>
                        Обнаружены пробелы в данных
                      </h4>
                      <p>Следующие свойства требуют заполнения:</p>
                      
                      <div className="accordion" id="missingDataAccordion">
                        {Object.entries(data.missing).map(([className, missingProps], index) => (
                          <div key={className} className="accordion-item">
                            <h3 className="accordion-header">
                              <button 
                                className={`accordion-button ${index === 0 ? '' : 'collapsed'}`} 
                                type="button" 
                                data-bs-toggle="collapse" 
                                data-bs-target={`#collapse-${index}`}
                              >
                                {className} <span className="badge bg-danger ms-2">{missingProps.length}</span>
                              </button>
                            </h3>
                            <div 
                              id={`collapse-${index}`} 
                              className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`} 
                              data-bs-parent="#missingDataAccordion"
                            >
                              <div className="accordion-body">
                                <ul className="list-unstyled">
                                  {missingProps.map(prop => (
                                    <li key={`${className}-${prop}`} className="mb-2">
                                      <Link 
                                        to={`/property-values?class=${encodeURIComponent(className)}&prop=${encodeURIComponent(prop)}`}
                                        className="text-decoration-none d-flex align-items-center"
                                      >
                                        <i className="bi bi-arrow-right-circle text-primary me-2"></i>
                                        {prop}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="sticky-top pt-3">
                      <div className="card bg-light border-primary">
                        <div className="card-header bg-primary text-white">
                          <i className="bi bi-info-circle-fill me-2"></i>
                          Рекомендации
                        </div>
                        <div className="card-body">
                          <p>Для завершения анализа необходимо заполнить все отмеченные поля.</p>
                          <button className="btn btn-primary w-100 mt-2">
                            <i className="bi bi-arrow-right me-2"></i>
                            Перейти к заполнению
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                  </div>
                  <h3 className="text-success mb-3">Данные полные!</h3>
                  <p className="text-muted">Все необходимые свойства системы заполнены корректно.</p>
                </div>
              )}
            </div>
          </div>

          {data?.props && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light-blue">
                <h3 className="h5 mb-0">
                  <i className="bi bi-list-ul me-2"></i>
                  Полный список свойств системы
                </h3>
              </div>
              <div className="card-body">
                <div className="row g-2">
                  {data.props.map(prop => (
                    <div key={prop} className="col-sm-6 col-md-4 col-lg-3">
                      <div className="p-3 bg-blue-10 rounded border border-blue-20">
                        <i className="bi bi-tag-fill text-primary me-2"></i>
                        {prop}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Добавьте в ваш CSS:
// .bg-light-blue { background-color: #f0f8ff; }
// .bg-blue-10 { background-color: rgba(13, 110, 253, 0.1); }
// .border-blue-20 { border-color: rgba(
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  useClassesWithPropsQuery,
  useUpdateClassProps,
  type ClassPropUpdate
} from './api';

export const ToggleClassProps = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: classes = [], isLoading, isError } = useQuery(useClassesWithPropsQuery());
  const { mutate: updateClassProps, isPending: isUpdating } = useUpdateClassProps();

  const currentClass = classes.find(c => c.name === selectedClass);
  const classProps = currentClass?.props || [];
  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePropToggle = (propName: string, currentVal: 'on' | 'off') => {
    if (!selectedClass || isUpdating) return;
    
    const newVal = currentVal === 'on' ? 'off' : 'on';
    const update: ClassPropUpdate[] = [{
      name: propName,
      val: newVal
    }];
    
    updateClassProps({ 
      className: selectedClass, 
      updates: update 
    });
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <h3 className="mt-3 text-primary">Загрузка классов...</h3>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger d-flex align-items-center">
          <i className="bi bi-x-circle-fill me-3 fs-4"></i>
          <div>
            <h4 className="alert-heading">Ошибка загрузки</h4>
            <p className="mb-0">Не удалось загрузить список классов</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-lg-5">
      <div className="row justify-content-center">
        <div className="col-lg-10 col-xl-8">
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-primary text-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="h4 mb-0">
                  <i className="bi bi-gear-wide-connected me-2"></i>
                  Управление свойствами классов
                </h2>
                <span className="badge bg-light text-primary rounded-pill">
                  {classes.length} классов
                </span>
              </div>
            </div>

            <div className="card-body p-4">
              <div className="row g-4">
                {/* Панель выбора класса */}
                <div className="col-md-12">
                  <div className="card border-primary border-opacity-25">
                    <div className="card-header bg-blue-10 py-2">
                      <h5 className="mb-0 text-primary">
                        <i className="bi bi-funnel me-2"></i>
                        Выбор класса музыки
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control border-primary border-opacity-50 mb-3"
                          placeholder="Поиск по названию класса..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select 
                          className="form-select border-primary border-opacity-50"
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                        >
                          <option value="">-- Выберите класс --</option>
                          {filteredClasses.map(cls => (
                            <option key={cls.name} value={cls.name}>
                              {cls.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Свойства класса */}
                {selectedClass && (
                  <div className="col-md-12">
                    <div className="card border-primary border-opacity-25">
                      <div className="card-header bg-blue-10 py-2 d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 text-primary">
                          <i className="bi bi-list-check me-2"></i>
                          Свойства класса: <span className="fw-bold">{selectedClass}</span>
                        </h5>
                        <span className="badge bg-primary rounded-pill">
                          {classProps.length} свойств
                        </span>
                      </div>
                      <div className="card-body">
                        {classProps.length > 0 ? (
                          <div className="row g-3">
                            {classProps.map(prop => (
                              <div key={prop.name} className="col-md-6">
                                <div className="card h-100 border-primary border-opacity-25">
                                  <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                      <label className="form-check-label fw-medium" htmlFor={`prop-${prop.name}`}>
                                        {prop.name}
                                      </label>
                                      <div className="form-check form-switch">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          role="switch"
                                          id={`prop-${prop.name}`}
                                          checked={prop.val === 'on'}
                                          onChange={() => handlePropToggle(prop.name, prop.val)}
                                          disabled={isUpdating}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="card-footer bg-blue-10 py-2">
                                    <small className={`text-${prop.val === 'on' ? 'success' : 'muted'}`}>
                                      <i className={`bi bi-${prop.val === 'on' ? 'check-circle-fill' : 'x-circle-fill'} me-1`}></i>
                                      {prop.val === 'on' ? 'Активно' : 'Неактивно'}
                                    </small>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="alert alert-info mb-0">
                            <i className="bi bi-info-circle me-2"></i>
                            У выбранного класса нет настраиваемых свойств
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {!selectedClass && (
                  <div className="col-md-12">
                    <div className="alert alert-warning">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Пожалуйста, выберите класс для управления его свойствами
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card-footer bg-blue-10 py-3">
              <small className="text-muted">
                <i className="bi bi-info-circle me-2"></i>
                Включите/выключите свойства для каждого класса музыки
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Добавьте в ваш CSS:
// .bg-blue-10 { background-color: rgba(13, 110, 253, 0.1); }
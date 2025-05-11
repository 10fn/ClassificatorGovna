import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  usePropsWithValuesQuery,
  useDeleteValue,
  useAddValue
} from './api';

export const PropsWithValues = () => {
  const [selectedProp, setSelectedProp] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  
  const { data: properties = [], isLoading, isError } = useQuery(usePropsWithValuesQuery());
  const { mutate: deleteValue, isPending: isDeleting } = useDeleteValue();
  const { mutate: addValue, isPending: isAdding } = useAddValue();

  const currentProp = properties.find(p => p.name === selectedProp);
  const values = currentProp?.values || [];

  const handleAddValue = () => {
    if (!selectedProp || !newValue.trim()) return;
    
    addValue({ 
      prop: selectedProp, 
      value: currentProp?.type === 'numeric' ? Number(newValue) : newValue 
    });
    setNewValue('');
  };

  const handleDeleteValue = (value: string | number) => {
    if (!selectedProp) return;
    deleteValue({ prop: selectedProp, value });
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <h3 className="mt-3 text-primary">Загрузка данных...</h3>
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
            <p className="mb-0">Не удалось загрузить список свойств и значений</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-lg-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-6">
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-primary text-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="h4 mb-0">
                  <i className="bi bi-card-list me-2"></i>
                  Управление значениями свойств
                </h2>
                <span className="badge bg-light text-primary rounded-pill">
                  {properties.length} свойств
                </span>
              </div>
            </div>

            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-12">
                  <div className="mb-4">
                    <label className="form-label fw-bold text-primary mb-2">
                      <i className="bi bi-tag me-2"></i>
                      Выберите свойство
                    </label>
                    <select 
                      className="form-select border-primary border-opacity-50"
                      value={selectedProp}
                      onChange={(e) => setSelectedProp(e.target.value)}
                    >
                      <option value="">-- Не выбрано --</option>
                      {properties.filter(item => item.type !== 'numeric').map(prop => (
                        <option key={prop.name} value={prop.name}>
                          {prop.name} ({prop.type === 'numeric' ? 'числовое' : 'текстовое'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedProp && (
                  <>
                    <div className="col-md-12">
                      <div className="card border-primary border-opacity-25 mb-4">
                        <div className="card-header bg-blue-10 py-2">
                          <h5 className="mb-0 text-primary">
                            <i className="bi bi-plus-circle me-2"></i>
                            Добавить новое значение
                          </h5>
                        </div>
                        <div className="card-body">
                          <div className="input-group">
                            <input
                              type={currentProp?.type === 'numeric' ? 'number' : 'text'}
                              className="form-control border-primary border-opacity-50"
                              placeholder={
                                currentProp?.type === 'numeric' 
                                  ? 'Введите число' 
                                  : 'Введите текстовое значение'
                              }
                              value={newValue}
                              onChange={(e) => setNewValue(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddValue()}
                            />
                            <button
                              className="btn btn-primary"
                              onClick={handleAddValue}
                              disabled={!newValue.trim() || isAdding}
                            >
                              {isAdding ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                  Добавление
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-plus-lg me-2"></i>
                                  Добавить
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="card border-primary border-opacity-25">
                        <div className="card-header bg-blue-10 py-2">
                          <h5 className="mb-0 text-primary">
                            <i className="bi bi-list-ol me-2"></i>
                            Список значений ({values.length})
                          </h5>
                        </div>
                        <div className="card-body p-0">
                          {values.length > 0 ? (
                            <div className="list-group list-group-flush">
                              {values.map((value, index) => (
                                <div 
                                  key={index} 
                                  className="list-group-item d-flex justify-content-between align-items-center py-3"
                                >
                                  <span className="fw-medium">{value}</span>
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => handleDeleteValue(value)}
                                    disabled={isDeleting}
                                    title="Удалить значение"
                                  >
                                    {isDeleting ? (
                                      <span className="spinner-border spinner-border-sm" role="status"></span>
                                    ) : (
                                      <i className="bi bi-trash"></i>
                                    )}
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <div className="alert alert-info mb-0 mx-3">
                                <i className="bi bi-info-circle me-2"></i>
                                Нет значений для выбранного свойства
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {!selectedProp && (
                  <div className="col-md-12">
                    <div className="alert alert-warning">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Пожалуйста, выберите свойство для просмотра и управления значениями
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card-footer bg-blue-10 py-3">
              <small className="text-muted">
                <i className="bi bi-info-circle me-2"></i>
                Здесь вы можете управлять значениями для каждого свойства музыки
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
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  usePropertiesQuery, 
  addPropertyMutation, 
  deletePropertyMutation 
} from './api';

export const Properties = () => {
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newPropertyType, setNewPropertyType] = useState<'numeric' | 'enum'>('numeric');

  const { data: properties, isLoading, isError } = useQuery(usePropertiesQuery());

  const { mutate: addProperty, isPending: isAdding } = useMutation({
    mutationFn: addPropertyMutation.fn,
    onSuccess: () => {
      addPropertyMutation.onSuccess();
      setNewPropertyName('');
      setNewPropertyType('numeric');
    }
  });
  
  const { mutate: deleteProperty, isPending: isDeleting } = useMutation({
    mutationFn: deletePropertyMutation.fn,
    onSuccess: deletePropertyMutation.onSuccess,
    onError: () => alert('Нельзя удалить свойство, пока у него есть активные значения')
  });

  const handleAddProperty = () => {
    if (newPropertyName.trim()) {
      addProperty({ 
        name: newPropertyName, 
        type: newPropertyType 
      });
    }
  };

  const handleDeleteProperty = (propertyName: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить свойство "${propertyName}"?`)) {
      deleteProperty(propertyName);
    }
  };


  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <h3 className="mt-3 text-primary">Загрузка свойств...</h3>
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
            <p className="mb-0">Не удалось загрузить список свойств</p>
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
                  <i className="bi bi-tags me-2"></i>
                  Управление свойствами музыки
                </h2>
                <span className="badge bg-light text-primary rounded-pill">
                  {properties?.length || 0} свойств
                </span>
              </div>
            </div>

            <div className="card-body p-4">
              <div className="mb-4">
                <h5 className="text-primary mb-3">
                  <i className="bi bi-plus-circle me-2"></i>
                  Добавить новое свойство
                </h5>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control border-primary border-opacity-50"
                    placeholder="Например: Тематика"
                    value={newPropertyName}
                    onChange={(e) => setNewPropertyName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddProperty()}
                  />
                  <select
                    className="form-select border-primary border-opacity-50"
                    value={newPropertyType}
                    onChange={(e) => setNewPropertyType(e.target.value as 'numeric' | 'enum')}
                  >
                    <option value="numeric">Числовое</option>
                    <option value="enum">Перечисление</option>
                  </select>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddProperty}
                    disabled={isAdding || !newPropertyName.trim()}
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

              <div className="mt-4">
                <h5 className="text-primary mb-3">
                  <i className="bi bi-list-ul me-2"></i>
                  Список всех свойств
                </h5>
                
                {properties && properties.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="bg-blue-10">
                        <tr>
                          <th className="w-75">Название свойства</th>
                          <th className="text-end">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {properties.map((property) => (
                          <tr key={property}>
                            <td>
                              <span className="fw-semibold">{property}</span>
                            </td>
                            <td className="text-end">
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteProperty(property)}
                                disabled={isDeleting}
                                title="Удалить свойство"
                              >
                                {isDeleting ? (
                                  <span className="spinner-border spinner-border-sm" role="status"></span>
                                ) : (
                                  <i className="bi bi-trash"></i>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Список свойств пуст. Добавьте первое свойство.
                  </div>
                )}
              </div>
            </div>

            <div className="card-footer bg-blue-10 py-3">
              <small className="text-muted">
                <i className="bi bi-info-circle me-2"></i>
                Свойства используются для классификации музыки
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

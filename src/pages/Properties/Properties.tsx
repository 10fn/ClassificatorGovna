import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  usePropertiesQuery, 
  addPropertyMutation, 
  deletePropertyMutation 
} from './api';

export const Properties = () => {
  const [newPropertyName, setNewPropertyName] = useState('');
  
  const { data: properties } = useQuery(usePropertiesQuery());

  const { mutate: addProperty, isPending: isAdding } = useMutation({
    mutationFn: addPropertyMutation.fn,
    onSuccess: () => {
      addPropertyMutation.onSuccess();
      setNewPropertyName('');
    }
  });
  
  const { mutate: deleteProperty, isPending: isDeleting } = useMutation({
    mutationFn: deletePropertyMutation.fn,
    onSuccess: deletePropertyMutation.onSuccess,
    onError: () => alert('Нельзя удалить свойство, пока у него есть активные значения')
  });

  const handleAddProperty = () => {
    addProperty(newPropertyName.trim());
  };

  const handleDeleteProperty = (propertyName: string) => {
    deleteProperty(propertyName);
  };

  return (
    <div className="container my-4">
      <div className="card border-success shadow">
        <div className="card-header bg-success text-white">
          <h2 className="h5 mb-0">Список свойств растений</h2>
        </div>
        
        <div className="card-body">
          <div className="d-flex gap-2 mb-3">
            <input
              type="text"
              className="form-control form-control-lg border-success"
              placeholder="Введите название свойства"
              value={newPropertyName}
              onChange={(e) => setNewPropertyName(e.target.value)}
            />
            <button
              className="btn btn-success btn-lg"
              onClick={handleAddProperty}
              disabled={isAdding || !newPropertyName.trim()}
            >
              {isAdding ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Добавление...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle me-2"></i>
                  Добавить
                </>
              )}
            </button>
          </div>

          {properties && properties.length > 0 ? (
            <div className="list-group">
              {properties.map((property) => (
                <div key={property} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <span className="fw-bold text-success">{property}</span>
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={() => handleDeleteProperty(property)}
                    disabled={isDeleting}
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
            <div className="alert alert-success">
              <i className="bi bi-info-circle me-2"></i>
              Нет свойств в списке. Добавьте первое свойство.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  usePropertiesQuery, 
  addPropertyMutation, 
  deletePropertyMutation 
} from './api';

type PropertyType = 'numeric' | 'enum';

export const Properties = () => {
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newPropertyType, setNewPropertyType] = useState<PropertyType>('enum');
  
  const { data: properties } = useQuery(usePropertiesQuery());

  const { mutate: addProperty, isPending: isAdding } = useMutation({
    mutationFn: (name: string) => addPropertyMutation.fn({ name, type: newPropertyType }),
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
      <div className="card shadow-lg" style={{ border: '2px solid #e74c3c', backgroundColor: '#f9f9f9' }}>
        <div className="card-header" style={{ backgroundColor: '#e74c3c', color: '#fff' }}>
          <h2 className="h4 mb-0">Список свойств растений</h2>
        </div>
        
        <div className="card-body">
          <div className="d-flex gap-3 flex-column mb-4">
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-lg border-danger"
                placeholder="Введите название свойства"
                value={newPropertyName}
                onChange={(e) => setNewPropertyName(e.target.value)}
              />
              <select
                className="form-select form-select-lg border-danger"
                value={newPropertyType}
                onChange={(e) => setNewPropertyType(e.target.value as PropertyType)}
              >
                <option value="enum">Перечислимое</option>
                <option value="numeric">Числовое</option>
              </select>
            </div>
            <button
              className="btn btn-danger btn-lg"
              onClick={handleAddProperty}
              disabled={isAdding || !newPropertyName.trim()}
              style={{ alignSelf: 'center' }}
            >
              {isAdding ? (
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              ) : (
                <i className="bi bi-plus-circle me-2"></i>
              )}
              {isAdding ? 'Добавление...' : 'Добавить'}
            </button>
          </div>

          {properties && properties.length > 0 ? (
            <div className="list-group">
              {properties.map((property) => (
                <div key={property} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" style={{ border: '2px solid #e74c3c' }}>
                  <span className="fw-bold text-danger">{property}</span>
                  <button
                    className="btn btn-outline-danger btn-sm"
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
            <div className="alert alert-danger">
              <i className="bi bi-info-circle me-2"></i>
              Нет свойств в списке. Добавьте первое свойство.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

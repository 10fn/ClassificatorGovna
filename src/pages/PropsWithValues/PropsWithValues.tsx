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
  
  const { data: properties = [] } = useQuery(usePropsWithValuesQuery());
  const { mutate: deleteValue } = useDeleteValue();
  const { mutate: addValue } = useAddValue();

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

  return (
    <div className="container my-4">
      <div className="card border-danger shadow-lg">
        <div className="card-header bg-danger text-white">
          <h2 className="h5 mb-0">Значения свойств растений</h2>
        </div>
        
        <div className="card-body">
          {/* Селектор свойства */}
          <div className="mb-4">
            <label className="form-label text-danger">Выберите свойство</label>
            <select 
              className="form-select border-danger"
              value={selectedProp}
              onChange={(e) => setSelectedProp(e.target.value)}
            >
              <option value="">-- Выберите свойство --</option>
              {properties.filter(item => item.type !== 'numeric').map(prop => (
                <option key={prop.name} value={prop.name}>
                  {prop.name} ({prop.type})
                </option>
              ))}
            </select>
          </div>

          {/* Добавление нового значения */}
          {selectedProp && (
            <div className="d-flex gap-2 mb-3">
              <input
                type={currentProp?.type === 'numeric' ? 'number' : 'text'}
                className="form-control border-danger"
                placeholder={`Введите ${currentProp?.type === 'numeric' ? 'числовое' : 'текстовое'} значение`}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
              <button
                className="btn btn-danger"
                onClick={handleAddValue}
                disabled={!newValue.trim()}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Добавить значение
              </button>
            </div>
          )}

          {/* Список значений */}
          {selectedProp ? (
            values.length > 0 ? (
              <div className="list-group">
                {values.map((value, index) => (
                  <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{value}</span>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteValue(value)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info">
                Нет значений для выбранного свойства
              </div>
            )
          ) : (
            <div className="alert alert-warning">
              Выберите свойство для просмотра значений
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

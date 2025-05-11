import { useState } from 'react';
import axios from 'axios';
import { 
  useIdentifyClass, 
  usePropertiesWithValues, 
  type PropertyWithValues, 
  type SelectedProperty 
} from '../IdentityClass/api';
import { useMutation } from '@tanstack/react-query';

const usePredictClass = () => {
  return useMutation({
    mutationFn: async (properties: SelectedProperty[]) => {
      const response = await axios.post(
        'http://localhost:5000/predict-class',
        properties
      );
      return response.data;
    }
  });
};

export const IdentifyClass = () => {
  const { data: properties = [], isLoading, error } = usePropertiesWithValues();
  const { mutate: identifyClass, isPending: isIdentifying } = useIdentifyClass();
  const { mutate: predictClass, isPending: isPredicting } = usePredictClass();
  const [selectedValues, setSelectedValues] = useState<Record<string, string | number>>({});
  const [modelValues, setModelValues] = useState({
    form: '',
    color: '',
    size: '',
    venation: ''
  });
  const [result, setResult] = useState<string[] | null>(null);
  const [activeTab, setActiveTab] = useState<'rules' | 'model'>('rules');

  const handleValueChange = (propertyName: string, value: string | number) => {
    if (value === '') {
      // Удаляем свойство из состояния, если выбрано пустое значение
      setSelectedValues(prev => {
        const newValues = {...prev};
        delete newValues[propertyName];
        return newValues;
      });
    } else {
      setSelectedValues(prev => ({
        ...prev,
        [propertyName]: value
      }));
    }
    setResult(null);
  };

  const handleModelValueChange = (field: keyof typeof modelValues, value: string) => {
    setModelValues(prev => ({
      ...prev,
      [field]: value
    }));
    setResult(null);
  };

  const handleRulesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedProperties: SelectedProperty[] = Object.entries(selectedValues)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([name, value]) => ({ name, value }));

    if (selectedProperties.length === 0) {
      alert('Выберите хотя бы одно свойство');
      return;
    }

    identifyClass(selectedProperties, {
      onSuccess: (data) => setResult(data.classes),
      onError: () => alert('Ошибка при идентификации')
    });
  };

  const handleModelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedProperties: SelectedProperty[] = [
      { name: 'форма', value: modelValues.form },
      { name: 'цвет', value: modelValues.color },
      { name: 'размер', value: modelValues.size },
      { name: 'жилкование', value: modelValues.venation }
    ].filter(item => item.value !== '');

    if (selectedProperties.length === 0) {
      alert('Заполните хотя бы одно поле');
      return;
    }

    predictClass(selectedProperties, {
      onSuccess: (data) => {
        setResult(data.classes)
        alert('Наиболее подходящие классы: ' + data.predicted_class)
      },
      onError: () => alert('Модель не смогла определить класс')
    });
  };

  if (isLoading) {
    return (
      <div className="container my-4 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p>Загрузка свойств...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-4">
        <div className="alert alert-danger">
          Ошибка при загрузке свойств: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="card border-success shadow">
        <div className="card-header bg-success text-white">
          <h2 className="h5 mb-0">Идентификация класса растения</h2>
        </div>
        
        <div className="card-body">
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'rules' ? 'active' : ''}`}
                onClick={() => setActiveTab('rules')}
              >
                По правилам
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'model' ? 'active' : ''}`}
                onClick={() => setActiveTab('model')}
              >
                Через модель
              </button>
            </li>
          </ul>

          {activeTab === 'rules' ? (
            <form onSubmit={handleRulesSubmit}>
              {properties.map((property: PropertyWithValues) => (
                <div key={property.name} className="mb-4">
                  <label className="form-label"><strong>{property.name}</strong></label>
                  
                  {property.type === 'numeric' ? (
                    <input
                      type="number"
                      className="form-control form-control-lg border-success"
                      value={selectedValues[property.name] || ''}
                      onChange={(e) => handleValueChange(property.name, e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={`Введите значение для ${property.name}`}
                    />
                  ) : (
                    <select
                      className="form-select border-success"
                      value={selectedValues[property.name] || ''}
                      onChange={(e) => handleValueChange(property.name, e.target.value)}
                    >
                      <option value="">-- Выберите значение --</option>
                      {property.values.map((value) => (
                        <option key={`${property.name}-${value}`} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}

              <div className="mt-4">
                <h5 className="mb-3">Выбранные значения:</h5>
                <div className="list-group">
                  {Object.entries(selectedValues)
                    .filter(([_, value]) => value !== '' && value !== undefined)
                    .map(([name, value]) => (
                      <div key={name} className="list-group-item d-flex justify-content-between align-items-center">
                        <span><strong>{name}</strong>: {value}</span>
                      </div>
                    ))}
                  {Object.values(selectedValues).filter(v => v !== '' && v !== undefined).length === 0 && (
                    <div className="list-group-item">Не выбрано ни одного свойства</div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-success btn-lg mt-4"
                disabled={isIdentifying || Object.values(selectedValues).filter(v => v !== '' && v !== undefined).length === 0}
              >
                {isIdentifying ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Идентификация...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2"></i>
                    Определить класс
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleModelSubmit}>
              <div className="mb-4">
                <label className="form-label"><strong>Форма листа</strong></label>
                <select
                  className="form-select border-success"
                  value={modelValues.form}
                  onChange={(e) => handleModelValueChange('form', e.target.value)}
                >
                  <option value="">-- Выберите форму --</option>
                  <option value="Овальная">Овальная</option>
                  <option value="Ланцетная">Ланцетная</option>
                  <option value="Сердцевидная">Сердцевидная</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label"><strong>Цвет листа</strong></label>
                <select
                  className="form-select border-success"
                  value={modelValues.color}
                  onChange={(e) => handleModelValueChange('color', e.target.value)}
                >
                  <option value="">-- Выберите цвет --</option>
                  <option value="Зелёный">Зелёный</option>
                  <option value="Красный">Красный</option>
                  <option value="Желтый">Желтый</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label"><strong>Размер листа (см)</strong></label>
                <input 
                  type="number" 
                  className="form-control border-success"
                  value={modelValues.size}  
                  onChange={(e) => handleModelValueChange('size', e.target.value)}
                  placeholder="Введите размер"
                />
              </div>

              <div className="mb-4">
                <label className="form-label"><strong>Тип жилкования</strong></label>
                <select
                  className="form-select border-success"
                  value={modelValues.venation}
                  onChange={(e) => handleModelValueChange('venation', e.target.value)}
                >
                  <option value="">-- Выберите жилкование --</option>
                  <option value="Параллельное">Параллельное</option>
                  <option value="Сетчатое">Сетчатое</option>
                  <option value="Дуговидное">Дуговидное</option>
                </select>
              </div>

              <div className="mt-4">
                <h5 className="mb-3">Выбранные значения:</h5>
                <div className="list-group">
                  {Object.entries(modelValues)
                    .filter(([_, value]) => value !== '')
                    .map(([name, value]) => (
                      <div key={name} className="list-group-item d-flex justify-content-between align-items-center">
                        <span><strong>{name}</strong>: {value}</span>
                      </div>
                    ))}
                  {Object.values(modelValues).filter(v => v !== '').length === 0 && (
                    <div className="list-group-item">Не заполнено ни одного поля</div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-success btn-lg mt-4"
                disabled={isPredicting || Object.values(modelValues).filter(v => v !== '').length === 0}
              >
                {isPredicting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Прогнозирование...
                  </>
                ) : (
                  <>
                    <i className="bi bi-robot me-2"></i>
                    Определить моделью
                  </>
                )}
              </button>
            </form>
          )}

          {result && (
            <div className="alert alert-success mt-4">
              <i className="bi bi-check-circle-fill me-2"></i>
              <strong>Результат идентификации:</strong> {result.join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
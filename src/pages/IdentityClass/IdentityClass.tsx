import { useState } from 'react';
import axios from 'axios';
import { 
  useIdentifyClass, 
  usePropertiesWithValues, 
  type PropertyWithValues, 
  type SelectedProperty 
} from '../IdentityClass/api';
import { useMutation } from '@tanstack/react-query';

interface ProcessStep {
  propName: string;
  classes: string[];
}

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
    color: '',  // 'цвет'
    size: '',   // 'размер'
    shape: '',  // 'форма'
    veining: '' // 'жилкование'
  });
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [finalResult, setFinalResult] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'rules' | 'model'>('rules');

  const handleValueChange = (propertyName: string, value: string | number) => {
    if (value === '') {
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
    setProcessSteps([]);
    setFinalResult([]);
  };

  const handleModelValueChange = (field: string, value: string) => {
    setModelValues(prevState => ({
      ...prevState,
      [field]: value
    }));
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
      onSuccess: (data) => {
        setProcessSteps(data.process);
        setFinalResult(data.result);
      },
      onError: () => alert('Ошибка при идентификации')
    });
  };

  const handleModelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    // Переводим на русском языке
    const propertyNames: { [key: string]: string } = {
      color: 'цвет',
      size: 'размер',
      shape: 'форма',
      veining: 'жилкование'
    };
  
    const selectedProperties: SelectedProperty[] = [
      { name: propertyNames.color, value: modelValues.color }, 
      { name: propertyNames.size, value: modelValues.size },   
      { name: propertyNames.shape, value: modelValues.shape },  
      { name: propertyNames.veining, value: modelValues.veining } 
    ].filter(item => item.value !== '');
  
    if (selectedProperties.length === 0) {
      alert('Заполните хотя бы одно поле');
      return;
    }
  
    predictClass(selectedProperties, {
      onSuccess: (data) => {
        setFinalResult([data.predicted_class]);
        alert('Наиболее подходящая модель растения: ' + data.predicted_class);
      },
      onError: () => alert('ИИ не смог определить модель растения')
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
      <div className="card border-success shadow-lg" style={{borderWidth: '2px'}}>
        <div className="card-header bg-success text-white">
          <h2 className="h5 mb-0">Идентификация класса растения</h2>
        </div>
  
        <div className="card-body">
          <ul className="nav nav-pills mb-4 nav-fill">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'rules' ? 'active bg-success border-success' : 'text-success'}`}
                onClick={() => setActiveTab('rules')}
              >
                <i className="bi bi-journal-bookmark me-2"></i>
                По правилам
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'model' ? 'active bg-success border-success' : 'text-success'}`}
                onClick={() => setActiveTab('model')}
              >
                <i className="bi bi-robot me-2"></i>
                Через ИИ модель
              </button>
            </li>
          </ul>
  
          {activeTab === 'rules' ? (
            <form onSubmit={handleRulesSubmit}>
              {properties.map((property: PropertyWithValues) => (
                <div key={property.name} className="mb-4">
                  <label className="form-label fw-bold text-success">{property.name}</label>
  
                  {property.type === 'numeric' ? (
                    <input
                      type="number"
                      className="form-control form-control-lg border-success"
                      style={{borderWidth: '2px'}}
                      value={selectedValues[property.name] || ''}
                      onChange={(e) => handleValueChange(property.name, e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={`Введите значение для ${property.name}`}
                    />
                  ) : (
                    <select
                      className="form-select border-success"
                      style={{borderWidth: '2px'}}
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
                <h5 className="mb-3 text-success">
                  <i className="bi bi-list-check me-2"></i>
                  Выбранные значения:
                </h5>
                <div className="list-group">
                  {Object.entries(selectedValues)
                    .filter(([_, value]) => value !== '' && value !== undefined)
                    .map(([name, value]) => (
                      <div key={name} className="list-group-item d-flex justify-content-between align-items-center border-success">
                        <span><strong>{name}</strong>: {value}</span>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleValueChange(name, '')}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    ))}
                  {Object.values(selectedValues).filter(v => v !== '' && v !== undefined).length === 0 && (
                    <div className="list-group-item text-success">Не выбрано ни одного свойства</div>
                  )}
                </div>
              </div>
  
              <button
                type="submit"
                className="btn btn-success btn-lg mt-4 w-100"
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
              <label className="form-label fw-bold text-success">Цвет</label>
              <select
                className="form-select border-success"
                style={{borderWidth: '2px'}}
                value={modelValues.color}
                onChange={(e) => handleModelValueChange('color', e.target.value)}
              >
                <option value="">-- Выберите цвет --</option>
                <option value="Зелёный">Зелёный</option>
              </select>
            </div>
          
            <div className="mb-4">
              <label className="form-label fw-bold text-success">Размер</label>
              <input
                type="number"
                className="form-control border-success"
                style={{borderWidth: '2px'}}
                value={modelValues.size}
                onChange={(e) => handleModelValueChange('size', e.target.value)}
                placeholder="Введите размер"
                min={5} // Минимальное значение для размера
                max={40} // Максимальное значение для размера
              />
            </div>
          
            <div className="mb-4">
              <label className="form-label fw-bold text-success">Форма</label>
              <select
                className="form-select border-success"
                style={{borderWidth: '2px'}}
                value={modelValues.shape}
                onChange={(e) => handleModelValueChange('shape', e.target.value)}
              >
                <option value="">-- Выберите форму --</option>
                <option value="Лопатчатая">Лопатчатая</option>
                <option value="Пальчатая">Пальчатая</option>
                <option value="Ланцетная">Ланцетная</option>
              </select>
            </div>
          
            <div className="mb-4">
              <label className="form-label fw-bold text-success">Жилкование</label>
              <select
                className="form-select border-success"
                style={{borderWidth: '2px'}}
                value={modelValues.veining}
                onChange={(e) => handleModelValueChange('veining', e.target.value)}
              >
                <option value="">-- Выберите жилкование --</option>
                <option value="Сетчатое">Сетчатое</option>
                <option value="Параллельное">Параллельное</option>
                <option value="Пальчатое">Пальчатое</option>
              </select>
            </div>
          
            <button
              type="submit"
              className="btn btn-success btn-lg mt-4 w-100"
              disabled={isPredicting || Object.values(modelValues).filter(v => v !== '').length === 0}
            >
              {isPredicting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Прогнозирование...
                </>
              ) : (
                <>
                  <i className="bi bi-magic me-2"></i>
                  Определить модель
                </>
              )}
            </button>
          </form>          
          )}
  
          {processSteps && (processSteps.length > 0 || finalResult.length > 0) && (
            <div className="mt-4">
              <h5 className="text-success mb-3">
                <i className="bi bi-diagram-3 me-2"></i>
                Процесс идентификации:
              </h5>
              
              {processSteps.length > 0 && (
                <div className="table-responsive mb-4">
                  <table className="table table-bordered table-hover">
                    <thead className="table-success">
                      <tr>
                        <th>Шаг</th>
                        <th>Опровергнутые модели</th>
                        <th>Причины</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processSteps.map((step, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            {step.classes.length > 0 ? (
                              step.classes.join(', ')
                            ) : (
                              <span className="text-muted">Не исключено ни одного класса</span>
                            )}
                          </td>
                          <td>{step.propName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {finalResult.length > 0 && (
                <div className={`alert ${finalResult.length === 1 ? 'alert-success' : 'alert-info'}`}>
                  <h5 className="alert-heading">
                    <i className="bi bi-check-circle me-2"></i>
                    Результат идентификации:
                  </h5>
                  <p className="mb-0">
                    {finalResult.length === 1 ? (
                      <>
                        <strong>Определенная модель растения:</strong> {finalResult[0]}
                      </>
                    ) : (
                      <>
                        <strong>Возможные модели:</strong> {finalResult.join(', ')}
                      </>
                    )}
                  </p>
                </div>
              )}

              {finalResult.length === 0 && processSteps.length > 0 && (
                <div className="alert alert-warning">
                  <h5 className="alert-heading">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Результат идентификации:
                  </h5>
                  <p className="mb-0">Не удалось определить модель растения по заданным свойствам</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
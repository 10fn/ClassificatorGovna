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
    setSelectedValues(prev => ({
      ...prev,
      [propertyName]: value
    }));
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
      .filter(([_, value]) => value !== undefined)
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
    ].filter(item => item.value);

    if (selectedProperties.length === 0) {
      alert('Заполните хотя бы одно поле');
      return;
    }

    predictClass(selectedProperties, {
      onSuccess: (data) => {
        setResult(data.classes)
        alert('Наиболее подходящие жанры: ' + data.predicted_class)
      },
      onError: () => alert('Модель не смогла определить жанр')
    });
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <h3 className="mt-3 text-primary">Загрузка параметров...</h3>
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
            <h4 className="alert-heading">Ошибка загрузки</h4>
            <p className="mb-0">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-lg-5">
      <div className="row justify-content-center">
        <div className="col-lg-10 col-xl-8">
          <div className="card border-0 shadow-lg mb-4">
            <div className="card-header bg-primary text-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="h4 mb-0">
                  <i className="bi bi-flower2 me-2"></i>
                  Классификация музыки
                </h2>
                <span className={`badge rounded-pill ${result ? 'bg-success' : 'bg-light text-dark'} fs-6`}>
                  {result ? 'Анализ завершен' : 'Ожидание данных'}
                </span>
              </div>
            </div>

            <div className="card-body p-4">
              <ul className="nav nav-pills mb-4">
                <li className="nav-item me-2">
                  <button 
                    className={`nav-link ${activeTab === 'rules' ? 'active bg-blue-80' : 'text-primary'}`}
                    onClick={() => setActiveTab('rules')}
                  >
                    <i className="bi bi-list-check me-2"></i>
                    Экспертная система
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'model' ? 'active bg-blue-80' : 'text-primary'}`}
                    onClick={() => setActiveTab('model')}
                  >
                    <i className="bi bi-robot me-2"></i>
                    Машинное обучение
                  </button>
                </li>
              </ul>

              <div className="row">
                <div className="col-md-8">
                  {activeTab === 'rules' ? (
                    <form onSubmit={handleRulesSubmit}>
                      <div className="row g-3">
                        {properties.map((property: PropertyWithValues) => (
                          <div key={property.name} className="col-md-6">
                            <div className="card h-100 border-primary border-opacity-25">
                              <div className="card-header bg-blue-10 py-2">
                                <label className="form-label fw-bold mb-0 text-primary">
                                  {property.name}
                                </label>
                              </div>
                              <div className="card-body">
                                {property.type === 'numeric' ? (
                                  <input
                                    type="number"
                                    className="form-control border-primary border-opacity-50"
                                    value={selectedValues[property.name] || ''}
                                    onChange={(e) => handleValueChange(property.name, Number(e.target.value))}
                                    placeholder={`Введите значение`}
                                  />
                                ) : (
                                  <select
                                    className="form-select border-primary border-opacity-50"
                                    value={selectedValues[property.name] || ''}
                                    onChange={(e) => handleValueChange(property.name, e.target.value)}
                                  >
                                    <option value="">-- Не выбрано --</option>
                                    {property.values.map((value) => (
                                      <option key={`${property.name}-${value}`} value={value}>
                                        {value}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4">
                        <h5 className="text-primary mb-3">
                          <i className="bi bi-card-checklist me-2"></i>
                          Выбранные параметры
                        </h5>
                        <div className="row g-2">
                          {Object.entries(selectedValues)
                            .filter(([_, value]) => value !== '')
                            .map(([name, value]) => (
                              <div key={name} className="col-md-6">
                                <div className="d-flex align-items-center p-2 bg-blue-10 rounded">
                                  <span className="badge bg-primary me-2">{name}</span>
                                  <span className="text-truncate">{value}</span>
                                </div>
                              </div>
                            ))}
                          {Object.values(selectedValues).filter(v => v !== '').length === 0 && (
                            <div className="col-12">
                              <div className="alert alert-info mb-0">
                                <i className="bi bi-info-circle me-2"></i>
                                Параметры не выбраны
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="d-grid mt-4">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg"
                          disabled={isIdentifying || Object.values(selectedValues).filter(v => v !== '').length === 0}
                        >
                          {isIdentifying ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Анализ...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-search me-2"></i>
                              Определить жанр
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleModelSubmit}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="card h-100 border-primary border-opacity-25">
                            <div className="card-header bg-blue-10 py-2">
                              <label className="form-label fw-bold mb-0 text-primary">
                                Форма листа
                              </label>
                            </div>
                            <div className="card-body">
                              <select
                                className="form-select border-primary border-opacity-50"
                                value={modelValues.form}
                                onChange={(e) => handleModelValueChange('form', e.target.value)}
                              >
                                <option value="">-- Не выбрано --</option>
                                <option value="Овальная">Овальная</option>
                                <option value="Ланцетная">Ланцетная</option>
                                <option value="Сердцевидная">Сердцевидная</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="card h-100 border-primary border-opacity-25">
                            <div className="card-header bg-blue-10 py-2">
                              <label className="form-label fw-bold mb-0 text-primary">
                                Цвет листа
                              </label>
                            </div>
                            <div className="card-body">
                              <select
                                className="form-select border-primary border-opacity-50"
                                value={modelValues.color}
                                onChange={(e) => handleModelValueChange('color', e.target.value)}
                              >
                                <option value="">-- Не выбрано --</option>
                                <option value="Зелёный">Зелёный</option>
                                <option value="Красный">Красный</option>
                                <option value="Желтый">Желтый</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="card h-100 border-primary border-opacity-25">
                            <div className="card-header bg-blue-10 py-2">
                              <label className="form-label fw-bold mb-0 text-primary">
                                Размер листа (см)
                              </label>
                            </div>
                            <div className="card-body">
                              <input 
                                type="number" 
                                className="form-control border-primary border-opacity-50"
                                value={modelValues.size}  
                                onChange={(e) => handleModelValueChange('size', e.target.value)}
                                placeholder="Введите размер"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="card h-100 border-primary border-opacity-25">
                            <div className="card-header bg-blue-10 py-2">
                              <label className="form-label fw-bold mb-0 text-primary">
                                Тип жилкования
                              </label>
                            </div>
                            <div className="card-body">
                              <select
                                className="form-select border-primary border-opacity-50"
                                value={modelValues.venation}
                                onChange={(e) => handleModelValueChange('venation', e.target.value)}
                              >
                                <option value="">-- Не выбрано --</option>
                                <option value="Параллельное">Параллельное</option>
                                <option value="Сетчатое">Сетчатое</option>
                                <option value="Дуговидное">Дуговидное</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h5 className="text-primary mb-3">
                          <i className="bi bi-card-checklist me-2"></i>
                          Введенные параметры
                        </h5>
                        <div className="row g-2">
                          {Object.entries(modelValues)
                            .filter(([_, value]) => value !== '')
                            .map(([name, value]) => (
                              <div key={name} className="col-md-6">
                                <div className="d-flex align-items-center p-2 bg-blue-10 rounded">
                                  <span className="badge bg-primary me-2">{name}</span>
                                  <span className="text-truncate">{value}</span>
                                </div>
                              </div>
                            ))}
                          {Object.values(modelValues).filter(v => v !== '').length === 0 && (
                            <div className="col-12">
                              <div className="alert alert-info mb-0">
                                <i className="bi bi-info-circle me-2"></i>
                                Параметры не введены
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="d-grid mt-4">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg"
                          disabled={isPredicting || Object.values(modelValues).filter(v => v !== '').length === 0}
                        >
                          {isPredicting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Прогнозирование...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-cpu me-2"></i>
                              Запустить модель
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="col-md-4">
                  <div className="sticky-top pt-3">
                    <div className="card border-primary">
                      <div className="card-header bg-primary text-white">
                        <i className="bi bi-info-circle me-2"></i>
                        Информация
                      </div>
                      <div className="card-body">
                        <p className="mb-3">
                          {activeTab === 'rules' 
                            ? "Экспертная система анализирует выбранные параметры по заданным правилам."
                            : "Модель машинного обучения предсказывает класс растения на основе введенных характеристик."}
                        </p>
                        
                        {result && (
                          <div className="alert alert-success">
                            <h5 className="alert-heading">
                              <i className="bi bi-check-circle-fill me-2"></i>
                              Результат:
                            </h5>
                            <div className="mt-2">
                              {result.length ? result.map((cls, i) => (
                                <span key={cls} className="badge bg-success me-1 mb-1">
                                  {cls}
                                </span>
                              )) : <p>Не удалось определить класс</p>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Добавьте в ваш CSS:
// .bg-blue-10 { background-color: rgba(13, 110, 253, 0.1); }
// .bg-blue-80 { background-color: rgba(13, 110, 253, 0.8); }
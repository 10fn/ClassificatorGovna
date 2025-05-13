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
    tempo: '',
    tonality: '',
    dynamics: '',
    spectralDensity: ''
  });
  const [processSteps, setProcessSteps] = useState<{ propName: string; classes: string[] }[]>([]);
  const [finalResult, setFinalResult] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'rules' | 'model'>('rules');

  const handleValueChange = (propertyName: string, value: string | number) => {
    setSelectedValues(prev => ({
      ...prev,
      [propertyName]: value
    }));
    setProcessSteps([]);
    setFinalResult([]);
  };

  const handleModelValueChange = (field: keyof typeof modelValues, value: string) => {
    setModelValues(prev => ({
      ...prev,
      [field]: value
    }));
    setFinalResult([]);
  };

  const handleRulesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    const selectedProperties: SelectedProperty[] = Object.entries(selectedValues)
      .filter(([_, value]) => value !== undefined && value !== '' && value !== '-- Не выбрано --' && (typeof value !== 'number' || !isNaN(value)))
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

    const selectedProperties: SelectedProperty[] = [
      { name: 'tempo', value: modelValues.tempo },
      { name: 'tonality', value: modelValues.tonality },
      { name: 'dynamics', value: modelValues.dynamics },
      { name: 'spectrum', value: modelValues.spectralDensity }
    ]
    .filter(item => item.value && item.value !== '-- Не выбрано --' && (typeof item.value !== 'number' || !isNaN(item.value)))
    .map(item => ({ name: item.name, value: item.value }));

    if (selectedProperties.length === 0) {
      alert('Заполните хотя бы одно поле');
      return;
    }

    predictClass(selectedProperties, {
      onSuccess: (data) => {
        setFinalResult([data.predicted_class]);
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
                <span className={`badge rounded-pill ${finalResult.length ? 'bg-success' : 'bg-light text-dark'} fs-6`}>
                  {finalResult.length ? 'Анализ завершен' : 'Ожидание данных'}
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
                                Темп (BPM)
                              </label>
                            </div>
                            <div className="card-body">
                              <input
                                type="number"
                                min="1"
                                className="form-control border-primary border-opacity-50"
                                value={modelValues.tempo || ''}
                                onChange={(e) => handleModelValueChange('tempo', e.target.value)}
                                placeholder="Введите темп (целое число)"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="card h-100 border-primary border-opacity-25">
                            <div className="card-header bg-blue-10 py-2">
                              <label className="form-label fw-bold mb-0 text-primary">
                                Тональность
                              </label>
                            </div>
                            <div className="card-body">
                              <select
                                className="form-select border-primary border-opacity-50"
                                value={modelValues.tonality || ''}
                                onChange={(e) => handleModelValueChange('tonality', e.target.value)}
                              >
                                <option value="">-- Не выбрано --</option>
                                <option value="C">C</option>
                                <option value="Am">Am</option>
                                <option value="G">G</option>
                                <option value="Em">Em</option>
                                <option value="D">D</option>
                                <option value="Bm">Bm</option>
                                <option value="A">A</option>
                                <option value="F#m">F#m</option>
                                <option value="E">E</option>
                                <option value="C#m">C#m</option>
                                <option value="B">B</option>
                                <option value="G#m">G#m</option>
                                <option value="F#">F#</option>
                                <option value="D#m">D#m</option>
                                <option value="C#">C#</option>
                                <option value="A#m">A#m</option>
                                <option value="Ab">Ab</option>
                                <option value="Fm">Fm</option>
                                <option value="Eb">Eb</option>
                                <option value="Cm">Cm</option>
                                <option value="Bb">Bb</option>
                                <option value="Gm">Gm</option>
                                <option value="F">F</option>
                                <option value="Dm">Dm</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="card h-100 border-primary border-opacity-25">
                            <div className="card-header bg-blue-10 py-2">
                              <label className="form-label fw-bold mb-0 text-primary">
                                Динамика
                              </label>
                            </div>
                            <div className="card-body">
                              <input
                                type="number"
                                min="1"
                                className="form-control border-primary border-opacity-50"
                                value={modelValues.dynamics || ''}
                                onChange={(e) => handleModelValueChange('dynamics', e.target.value)}
                                placeholder="Введите значение динамики"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="card h-100 border-primary border-opacity-25">
                            <div className="card-header bg-blue-10 py-2">
                              <label className="form-label fw-bold mb-0 text-primary">
                                Плотность спектра
                              </label>
                            </div>
                            <div className="card-body">
                              <input
                                type="number"
                                min="1"
                                className="form-control border-primary border-opacity-50"
                                value={modelValues.spectralDensity || ''}
                                onChange={(e) => handleModelValueChange('spectralDensity', e.target.value)}
                                placeholder="Введите плотность спектра"
                              />
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
                        Результаты анализа
                      </div>
                      <div className="card-body">
                        {activeTab === 'rules' && processSteps.length > 0 && (
                          <>
                            <h5 className="text-primary mb-3">Процесс классификации:</h5>
                            <div className="table-responsive">
                              <table className="table table-sm table-bordered">
                                <thead className="bg-blue-10">
                                  <tr>
                                    <th className="text-primary">Свойство</th>
                                    <th className="text-primary">Неподходящие классы</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {processSteps.map((step, index) => (
                                    <tr key={index}>
                                      <td className="fw-bold">{step.propName}</td>
                                      <td>
                                        {step.classes.length > 0 ? (
                                          <div className="d-flex flex-wrap gap-1">
                                            {step.classes.map(cls => (
                                              <span key={cls} className="badge bg-info text-dark">
                                                {cls}
                                              </span>
                                            ))}
                                          </div>
                                        ) : (
                                          <span className="text-muted">Нет подходящих классов</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}

                        {finalResult.length > 0 && (
                          <div className="mt-4">
                            <h5 className="text-primary mb-3">
                              <i className="bi bi-check-circle-fill me-2"></i>
                              Финальный результат:
                            </h5>
                            <div className="alert alert-success">
                              <div className="d-flex flex-wrap gap-2">
                                {finalResult.map((cls, i) => (
                                  <span key={cls} className="badge bg-success fs-6">
                                    {cls}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {processSteps.length === 0 && finalResult.length === 0 && (
                          <p className="mb-0 text-muted">
                            {activeTab === 'rules' 
                              ? "Результаты анализа появятся здесь после выполнения проверки."
                              : "Результаты прогнозирования появятся здесь после запуска модели."}
                          </p>
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
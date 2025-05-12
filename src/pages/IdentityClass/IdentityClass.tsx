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
    country: '',
    grip: '',
    caliber: '',
    fire_mode: '',
    feed: '',
    magazine_capacity: ''
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
      { name: 'country', value: modelValues.country },
      { name: 'grip', value: modelValues.grip },
      { name: 'caliber', value: modelValues.caliber },
      { name: 'fire_mode', value: modelValues.fire_mode },
      { name: 'feed', value: modelValues.feed },
      { name: 'magazine_capacity', value: modelValues.magazine_capacity }
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
      <div className="card border-danger shadow-lg">
        <div className="card-header bg-danger text-white">
          <h2 className="h5 mb-0">Идентификация класса растения</h2>
        </div>
  
        <div className="card-body">
          <ul className="nav nav-pills mb-4">
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
                  <label className="form-label text-danger"><strong>{property.name}</strong></label>
  
                  {property.type === 'numeric' ? (
                    <input
                      type="number"
                      className="form-control form-control-lg border-danger"
                      value={selectedValues[property.name] || ''}
                      onChange={(e) => handleValueChange(property.name, e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={`Введите значение для ${property.name}`}
                    />
                  ) : (
                    <select
                      className="form-select border-danger"
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
                <h5 className="mb-3 text-danger">Выбранные значения:</h5>
                <div className="list-group">
                  {Object.entries(selectedValues)
                    .filter(([_, value]) => value !== '' && value !== undefined)
                    .map(([name, value]) => (
                      <div key={name} className="list-group-item d-flex justify-content-between align-items-center">
                        <span><strong>{name}</strong>: {value}</span>
                      </div>
                    ))}
                  {Object.values(selectedValues).filter(v => v !== '' && v !== undefined).length === 0 && (
                    <div className="list-group-item text-danger">Не выбрано ни одного свойства</div>
                  )}
                </div>
              </div>
  
              <button
                type="submit"
                className="btn btn-danger btn-lg mt-4"
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
              {/* Страна */}
              <div className="mb-4">
                <label className="form-label text-danger"><strong>Страна</strong></label>
                <select
                  className="form-select border-danger"
                  value={modelValues.country}
                  onChange={(e) => handleModelValueChange('country', e.target.value)}
                >
                  <option value="">-- Выберите страну --</option>
                  <option value="Австрия">Австрия</option>
                  <option value="Италия">Италия</option>
                  <option value="США">США</option>
                  <option value="Германия">Германия</option>
                  <option value="Израиль">Израиль</option>
                  <option value="СССР">СССР</option>
                  <option value="Россия">Россия</option>
                  <option value="Бельгия">Бельгия</option>
                </select>
              </div>

              {/* Рукоять */}
              <div className="mb-4">
                <label className="form-label text-danger"><strong>Рукоять</strong></label>
                <select
                  className="form-select border-danger"
                  value={modelValues.grip}
                  onChange={(e) => handleModelValueChange('grip', e.target.value)}
                >
                  <option value="">-- Выберите тип рукояти --</option>
                  <option value="Одноручное">Одноручное</option>
                  <option value="Двуручное">Двуручное</option>
                  <option value="Станковое">Станковое</option>
                </select>
              </div>

              {/* Калибр */}
              <div className="mb-4">
                <label className="form-label text-danger"><strong>Калибр</strong></label>
                <select
                  className="form-select border-danger"
                  value={modelValues.caliber}
                  onChange={(e) => handleModelValueChange('caliber', e.target.value)}
                >
                  <option value="">-- Выберите калибр --</option>
                  <option value="9x19">9x19</option>
                  <option value=".50 AE">.50 AE</option>
                  <option value="7.62x39">7.62x39</option>
                  <option value="5.45x39">5.45x39</option>
                  <option value="5.56x45">5.56x45</option>
                  <option value="7.62x51">7.62x51</option>
                  <option value="12.7x99">12.7x99</option>
                  <option value="7.62x54R">7.62x54R</option>
                  <option value="12.7x108">12.7x108</option>
                  <option value="12x76">12x76</option>
                </select>
              </div>

              {/* Режим огня */}
              <div className="mb-4">
                <label className="form-label text-danger"><strong>Режим огня</strong></label>
                <select
                  className="form-select border-danger"
                  value={modelValues.fire_mode}
                  onChange={(e) => handleModelValueChange('fire_mode', e.target.value)}
                >
                  <option value="">-- Выберите режим --</option>
                  <option value="Самозарядный">Самозарядный</option>
                  <option value="Автоматический">Автоматический</option>
                  <option value="Затворный">Затворный</option>
                  <option value="Самозарядный/Помповый">Самозарядный/Помповый</option>
                </select>
              </div>

              {/* Питание */}
              <div className="mb-4">
                <label className="form-label text-danger"><strong>Питание</strong></label>
                <select
                  className="form-select border-danger"
                  value={modelValues.feed}
                  onChange={(e) => handleModelValueChange('feed', e.target.value)}
                >
                  <option value="">-- Выберите тип питания --</option>
                  <option value="Магазинный">Магазинный</option>
                  <option value="Лента">Лента</option>
                  <option value="Трубчатый">Трубчатый</option>
                </select>
              </div>

              {/* Емкость магазина */}
              <div className="mb-4">
                <label className="form-label text-danger"><strong>Емкость магазина</strong></label>
                <input 
                  type="number" 
                  className="form-control border-danger"
                  value={modelValues.magazine_capacity}  
                  onChange={(e) => handleModelValueChange('magazine_capacity', e.target.value)}
                  placeholder="Введите емкость"
                />
              </div>

              {/* Остальная часть формы остается без изменений */}
              <div className="mt-4">
                <h5 className="mb-3 text-danger">Выбранные значения:</h5>
                <div className="list-group">
                  {Object.entries(modelValues)
                    .filter(([_, value]) => value !== '')
                    .map(([name, value]) => (
                      <div key={name} className="list-group-item d-flex justify-content-between align-items-center">
                        <span><strong>{name}</strong>: {value}</span>
                      </div>
                    ))}
                  {Object.values(modelValues).filter(v => v !== '').length === 0 && (
                    <div className="list-group-item text-danger">Не заполнено ни одного поля</div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-danger btn-lg mt-4"
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
            <div className="alert alert-danger mt-4">
              <i className="bi bi-check-circle-fill me-2"></i>
              <strong>Результат идентификации:</strong> {result.join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
};
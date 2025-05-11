import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  useClassesWithPropValuesQuery,
  useTogglePropValue,
  type ClassProp,
  type ClassWithPropValues,
} from './api';

export const TogglePropValues = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedProp, setSelectedProp] = useState<ClassProp | null>(null);
  const [localValues, setLocalValues] = useState<Record<string, 'on' | 'off'>>({});
  const [numericRanges, setNumericRanges] = useState<Record<string, [string, string]>>({});
  
  const { data: classes = [] } = useQuery<ClassWithPropValues[]>(useClassesWithPropValuesQuery());
  const { mutate: toggleValue } = useTogglePropValue();

  const currentClass = classes.find((c) => c.name === selectedClass);
  const classProps = currentClass?.props || [];

  // Автоматически заполняем диапазон для numeric свойств при выборе свойства
  useEffect(() => {
    if (selectedProp && selectedProp.type === 'numeric') {
      const activeValues = selectedProp.values
        .filter(v => v.isActive === 'on')
        .map(v => parseFloat(v.name))
        .filter(v => !isNaN(v));

      if (activeValues.length > 0) {
        const min = Math.min(...activeValues).toString();
        const max = Math.max(...activeValues).toString();
        const key = `${selectedClass}-${selectedProp.name}`;
        
        setNumericRanges(prev => ({
          ...prev,
          [key]: [min, max]
        }));
      }
    }
  }, [selectedProp, selectedClass]);

  const handleClassChange = (className: string) => {
    setSelectedClass(className);
    setSelectedProp(null);
    setLocalValues({});
    setNumericRanges({});
  };

  const handlePropSelect = (prop: ClassProp) => {
    setSelectedProp(prop);
  };

  const handleValueToggle = (valueName: string, currentState: 'on' | 'off') => {
    if (!selectedClass || !selectedProp) return;

    const newState = currentState === 'on' ? 'off' : 'on';
    
    setLocalValues(prev => ({
      ...prev,
      [`${selectedClass}-${selectedProp.name}-${valueName}`]: newState
    }));

    toggleValue({
      className: selectedClass,
      propName: selectedProp.name,
      propType: selectedProp.type,
      values: [{
        valueName,
        isActive: newState
      }]
    });
  };

  const handleNumericRangeChange = (propName: string, index: 0 | 1, value: string) => {
    if (!selectedClass) return;

    const key = `${selectedClass}-${propName}`;
    setNumericRanges(prev => {
      const currentRange = prev[key] || ['', ''];
      const newRange = [...currentRange] as [string, string];
      newRange[index] = value;
      return { ...prev, [key]: newRange };
    });
  };

  const handleNumericRangeSubmit = () => {
    if (!selectedClass || !selectedProp) return;

    const key = `${selectedClass}-${selectedProp.name}`;
    const range = numericRanges[key];
    
    if (range && range[0] && range[1]) {
      toggleValue({
        className: selectedClass,
        propName: selectedProp.name,
        propType: selectedProp.type,
        values: range.map(value => ({
          valueName: value,
          isActive: 'on'
        }))
      });
    }
  };

  const getValueState = (className: string, propName: string, valueName: string, serverState: 'on' | 'off') => {
    const key = `${className}-${propName}-${valueName}`;
    return localValues[key] ?? serverState;
  };

  const getNumericRange = (className: string, propName: string): [string, string] => {
    const key = `${className}-${propName}`;
    return numericRanges[key] || ['', ''];
  };

  return (
    <div className="container my-5">
      <section className="p-4 border rounded shadow-sm border-primary">
        <h2 className="h5 text-primary mb-4">Управление значениями свойств</h2>
  
        <div className="mb-4">
          <label className="form-label fw-semibold text-primary">Жанр</label>
          <select 
            className="form-select border-primary"
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
          >
            <option value="">-- Выберите жанр --</option>
            {classes.map((cls) => (
              <option key={cls.name} value={cls.name}>{cls.name}</option>
            ))}
          </select>
        </div>
  
        {selectedClass && (
          <div className="mb-4">
            <label className="form-label fw-semibold text-primary">Свойства</label>
            <div className="d-flex flex-wrap gap-2">
              {classProps.map((prop) => (
                <button
                  key={prop.name}
                  className={`btn btn-sm ${selectedProp?.name === prop.name ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handlePropSelect(prop)}
                >
                  {prop.name} <span className="badge bg-light text-primary">{prop.type}</span>
                </button>
              ))}
            </div>
          </div>
        )}
  
        {selectedProp && (
          <div className="mt-4">
            <h5 className="text-primary mb-3">Значения: {selectedProp.name}</h5>
  
            {selectedProp.type === 'numeric' ? (
              <div className="row g-3 align-items-end mb-3">
                <div className="col-sm-5">
                  <label className="form-label">От</label>
                  <input
                    type="number"
                    className="form-control border-primary"
                    value={getNumericRange(selectedClass, selectedProp.name)[0]}
                    onChange={(e) => handleNumericRangeChange(selectedProp.name, 0, e.target.value)}
                  />
                </div>
                <div className="col-sm-5">
                  <label className="form-label">До</label>
                  <input
                    type="number"
                    className="form-control border-primary"
                    value={getNumericRange(selectedClass, selectedProp.name)[1]}
                    onChange={(e) => handleNumericRangeChange(selectedProp.name, 1, e.target.value)}
                  />
                </div>
                <div className="col-sm-2">
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleNumericRangeSubmit}
                  >
                    Применить
                  </button>
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {selectedProp.values.map((value) => {
                  const currentState = getValueState(
                    selectedClass,
                    selectedProp.name,
                    value.name,
                    value.isActive
                  );
  
                  return (
                    <div key={value.name} className="d-flex align-items-center">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id={`value-${value.name}`}
                          checked={currentState === 'on'}
                          onChange={() => handleValueToggle(value.name, currentState)}
                        />
                        <label className="form-check-label ms-2" htmlFor={`value-${value.name}`}>
                          {value.name}
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
  
};
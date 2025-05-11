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
    <div className="container my-4">
      <div className="card border-success shadow">
        <div className="card-header bg-success text-white">
          <h2 className="h5 mb-0">Управление значениями свойств</h2>
        </div>
        
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Выберите класс</label>
              <select 
                className="form-select border-success"
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
              >
                <option value="">-- Выберите класс --</option>
                {classes.map((cls) => (
                  <option key={cls.name} value={cls.name}>{cls.name}</option>
                ))}
              </select>
            </div>

            {selectedClass && (
              <div className="col-md-4 mb-3">
                <label className="form-label">Выберите свойство</label>
                <div className="list-group">
                  {classProps.map((prop) => (
                    <button
                      key={prop.name}
                      className={`list-group-item list-group-item-action ${selectedProp?.name === prop.name ? 'active bg-success border-success' : ''}`}
                      onClick={() => handlePropSelect(prop)}
                    >
                      {prop.name} ({prop.type})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedProp && (
            <div className="mt-4">
              <h5 className="text-success">Значения свойства: {selectedProp.name}</h5>
              
              {selectedProp.type === 'numeric' ? (
                <div className="card p-3 mb-3">
                  <div className="row g-3">
                    <div className="col-md-5">
                      <label className="form-label">От</label>
                      <input
                        type="number"
                        className="form-control"
                        value={getNumericRange(selectedClass, selectedProp.name)[0]}
                        onChange={(e) => 
                          handleNumericRangeChange(selectedProp.name, 0, e.target.value)
                        }
                      />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label">До</label>
                      <input
                        type="number"
                        className="form-control"
                        value={getNumericRange(selectedClass, selectedProp.name)[1]}
                        onChange={(e) => 
                          handleNumericRangeChange(selectedProp.name, 1, e.target.value)
                        }
                      />
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                      <button
                        className="btn btn-success"
                        onClick={handleNumericRangeSubmit}
                      >
                        Применить
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="list-group">
                  {selectedProp.values.map((value) => {
                    const currentState = getValueState(
                      selectedClass,
                      selectedProp.name,
                      value.name,
                      value.isActive
                    );
                    
                    return (
                      <div key={value.name} className="list-group-item">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id={`value-${value.name}`}
                            checked={currentState === 'on'}
                            onChange={() => handleValueToggle(value.name, currentState)}
                          />
                          <label className="form-check-label" htmlFor={`value-${value.name}`}>
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
        </div>
      </div>
    </div>
  );
};
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  useClassesWithPropsQuery,
  useUpdateClassProps,
  type ClassPropUpdate
} from './api';

export const ToggleClassProps = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  
  const { data: classes = [] } = useQuery(useClassesWithPropsQuery());
  const { mutate: updateClassProps, isPending: isUpdating } = useUpdateClassProps();

  const currentClass = classes.find(c => c.name === selectedClass);
  const classProps = currentClass?.props || [];

  const handleClassChange = (className: string) => {
    setSelectedClass(className);
  };

  const handlePropToggle = (propName: string, currentVal: 'on' | 'off') => {
    if (!selectedClass || isUpdating) return;
    
    const newVal = currentVal === 'on' ? 'off' : 'on';
    const update: ClassPropUpdate[] = [{
      name: propName,
      val: newVal
    }];
    
    updateClassProps({ 
      className: selectedClass, 
      updates: update 
    });
  };

  return (
    <div className="container my-4">
      <div className="card border-danger shadow-lg">
        <div className="card-header bg-danger text-white">
          <h2 className="h5 mb-0">Управление свойствами классов</h2>
        </div>
        
        <div className="card-body">
          <div className="mb-4">
            <label className="form-label">Выберите модель оружия</label>
            <select 
              className="form-select"
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
            >
              <option value="">-- Выберите класс --</option>
              {classes.map(cls => (
                <option key={cls.name} value={cls.name}>{cls.name}</option>
              ))}
            </select>
          </div>

          {selectedClass && (
            <div className="mb-3">
              <h5 className="mb-3 text-danger">Свойства класса {selectedClass}</h5>
              <div className="list-group">
                {classProps.map(prop => (
                  <div key={prop.name} className="list-group-item">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`prop-${prop.name}`}
                        checked={prop.val === 'on'}
                        onChange={() => handlePropToggle(prop.name, prop.val)}
                        disabled={isUpdating}
                      />
                      <label className="form-check-label" htmlFor={`prop-${prop.name}`}>
                        {prop.name}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

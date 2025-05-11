import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  usePlantsQuery, 
  addPlantMutation, 
  deletePlantMutation 
} from './api';

export const Species = () => {
  const [newPlantName, setNewPlantName] = useState('');
  
  const { data: plants } = useQuery(usePlantsQuery());

  const { mutate: addPlant, isPending: isAdding } = useMutation({
    mutationFn: addPlantMutation.fn,
    onSuccess: () => {
      addPlantMutation.onSuccess();
      setNewPlantName('');
    }
  });
  
  const { mutate: deletePlant, isPending: isDeleting } = useMutation({
    mutationFn: deletePlantMutation.fn,
    onSuccess: deletePlantMutation.onSuccess
  });

  const handleAddPlant = () => {
    addPlant(newPlantName.trim());
  };

  const handleDeletePlant = (plantName: string) => {
    deletePlant(plantName);
  };

  return (
    <div className="container my-4">
      <div className="card border-success shadow">
        <div className="card-header bg-success text-white">
          <h2 className="h5 mb-0">Список видов растений</h2>
        </div>
        
        <div className="card-body">
          <div className="d-flex gap-2 mb-3">
            <input
              type="text"
              className="form-control form-control-lg border-success"
              placeholder="Введите название растения"
              value={newPlantName}
              onChange={(e) => setNewPlantName(e.target.value)}
            />
            <button
              className="btn btn-success btn-lg"
              onClick={handleAddPlant}
              disabled={isAdding || !newPlantName.trim()}
            >
              {isAdding ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Добавление...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle me-2"></i>
                  Добавить
                </>
              )}
            </button>
          </div>

          {plants && plants.length > 0 ? (
            <div className="list-group">
              {plants.map((plant) => (
                <div key={plant} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <span className="fw-bold text-success">{plant}</span>
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={() => handleDeletePlant(plant)}
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
            <div className="alert alert-success">
              <i className="bi bi-info-circle me-2"></i>
              Нет растений в списке. Добавьте первое растение.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
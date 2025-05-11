import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  usePlantsQuery, 
  addPlantMutation, 
  deletePlantMutation 
} from './api';

export const Species = () => {
  const [newPlantName, setNewPlantName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: plants = [], isLoading, isError } = useQuery(usePlantsQuery());

  const { mutate: addPlant, isPending: isAdding } = useMutation({
    mutationFn: addPlantMutation.fn,
    onSuccess: () => {
      addPlantMutation.onSuccess();
      setNewPlantName('');
    }
  });
  
  const { mutate: deletePlant, isPending: isDeleting } = useMutation({
    mutationFn: deletePlantMutation.fn,
    onSuccess: deletePlantMutation.onSuccess,
    onError: () => alert('Нельзя удалить вид, пока есть связанные растения')
  });

  const filteredPlants = plants.filter(plant =>
    plant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPlant = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlantName.trim()) {
      addPlant(newPlantName.trim());
    }
  };

  const handleDeletePlant = (plantName: string) => {
    if (window.confirm(`Удалить вид "${plantName}"?`)) {
      deletePlant(plantName);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <h3 className="mt-3 text-primary">Загрузка видов...</h3>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger d-flex align-items-center">
          <i className="bi bi-x-circle-fill me-3 fs-4"></i>
          <div>
            <h4 className="alert-heading">Ошибка загрузки</h4>
            <p className="mb-0">Не удалось загрузить список видов музыки</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-lg-5">
      <div className="row justify-content-center">
        <div className="col-lg-10 col-xl-8">
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-primary text-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="h4 mb-0">
                  <i className="bi bi-flower2 me-2"></i>
                  Каталог жанров музыки
                </h2>
                <span className="badge bg-light text-primary rounded-pill">
                  {plants.length} жанров
                </span>
              </div>
            </div>

            <div className="card-body p-4">
              <div className="row g-4">
                {/* Панель добавления нового вида */}
                <div className="col-md-12">
                  <div className="card border-primary border-opacity-25">
                    <div className="card-header bg-blue-10 py-2">
                      <h5 className="mb-0 text-primary">
                        <i className="bi bi-plus-circle me-2"></i>
                        Добавить новый жанр
                      </h5>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleAddPlant}>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control border-primary border-opacity-50"
                            placeholder="Например: Кантри"
                            value={newPlantName}
                            onChange={(e) => setNewPlantName(e.target.value)}
                          />
                          <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={isAdding || !newPlantName.trim()}
                          >
                            {isAdding ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Добавление
                              </>
                            ) : (
                              <>
                                <i className="bi bi-save me-2"></i>
                                Сохранить
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Панель поиска */}
                <div className="col-md-12" hidden>
                  <div className="card border-primary border-opacity-25">
                    <div className="card-header bg-blue-10 py-2">
                      <h5 className="mb-0 text-primary">
                        <i className="bi bi-search me-2"></i>
                        Поиск видов
                      </h5>
                    </div>
                    <div className="card-body">
                      <input
                        type="text"
                        className="form-control border-primary border-opacity-50"
                        placeholder="Введите название для поиска..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Список видов */}
                <div className="col-md-12">
                  <div className="card border-primary border-opacity-25">
                    <div className="card-header bg-blue-10 py-2 d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 text-primary">
                        <i className="bi bi-list-ul me-2"></i>
                        Зарегистрированные жанры
                      </h5>
                      <span className="badge bg-primary rounded-pill">
                        {filteredPlants.length} найдено
                      </span>
                    </div>
                    <div className="card-body p-0">
                      {filteredPlants.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-hover align-middle mb-0">
                            <thead className="bg-blue-10">
                              <tr>
                                <th>Название жанра</th>
                                <th width="100" className="text-end">Действия</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredPlants.map((plant) => (
                                <tr key={plant}>
                                  <td>
                                    <span className="fw-semibold">{plant}</span>
                                  </td>
                                  <td className="text-end">
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleDeletePlant(plant)}
                                      disabled={isDeleting}
                                      title="Удалить вид"
                                    >
                                      {isDeleting ? (
                                        <span className="spinner-border spinner-border-sm" role="status"></span>
                                      ) : (
                                        <i className="bi bi-trash"></i>
                                      )}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          {searchTerm ? (
                            <div className="alert alert-warning mx-3 mb-0">
                              <i className="bi bi-exclamation-triangle me-2"></i>
                              Виды по запросу "{searchTerm}" не найдены
                            </div>
                          ) : (
                            <div className="alert alert-info mx-3 mb-0">
                              <i className="bi bi-info-circle me-2"></i>
                              Список жанров пуст. Добавьте первый жанр.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer bg-blue-10 py-3">
              <small className="text-muted">
                <i className="bi bi-info-circle me-2"></i>
                Здесь вы можете управлять базой данных видов музыки
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Добавьте в ваш CSS:
// .bg-blue-10 { background-color: rgba(13, 110, 253, 0.1); }
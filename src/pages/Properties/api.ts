import axios from 'axios';
import { queryClient } from '../../queryClient';

const propertiesApi = {
  // Получение списка свойств
  getProperties: async (): Promise<string[]> => {
    const response = await axios.get<string[]>('http://localhost:5000/props');
    return response.data;
  },

  // Создание нового свойства
  addProperty: (name: string): Promise<void> => {
    return axios.post('http://localhost:5000/props', { name });
  },

  // Удаление свойства
  deleteProperty: (name: string): Promise<void> => {
    return axios.delete(`http://localhost:5000/props?name=${name}`);
  }
};

// // Моковая реализация для разработки
// const mockPropertiesApi = {
//   getProperties: async (): Promise<string[]> => {
//     return ['Цвет', 'Высота', 'Диаметр ствола', 'Продолжительность жизни'];
//   },
  
//   addProperty: async (name: string): Promise<void> => {
//     console.log(`Mock: Added property ${name}`);
//     await new Promise(resolve => setTimeout(resolve, 500));
//   },
  
//   deleteProperty: async (name: string): Promise<void> => {
//     console.log(`Mock: Deleted property ${name}`);
//     await new Promise(resolve => setTimeout(resolve, 500));
//   }
// };

// Выберите нужную реализацию (реальную или моковую)
const api = propertiesApi;
// const api = mockPropertiesApi; // Для разработки без бэкенда

export const usePropertiesQuery = () => ({
  queryKey: ['properties'],
  queryFn: async () => {
    const data = await api.getProperties();
    return Array.isArray(data) ? data : [];
  },
});

export const addPropertyMutation = {
  fn: (name: string) => api.addProperty(name),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
  },
};

export const deletePropertyMutation = {
  fn: (name: string) => api.deleteProperty(name),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
  },
};
import axios from 'axios';
import { queryClient } from '../../queryClient';

interface Property {
  name: string;
  type: 'numeric' | 'enum';
}

const propertiesApi = {
  // Получение списка свойств
  getProperties: async (): Promise<string[]> => {
    const response = await axios.get<string[]>('http://localhost:5000/props');
    return response.data;
  },

  // Создание нового свойства
  addProperty: (data: Property): Promise<void> => {
    return axios.post('http://localhost:5000/props', data);
  },

  // Удаление свойства
  deleteProperty: (name: string): Promise<void> => {
    return axios.delete(`http://localhost:5000/props?name=${name}`);
  }
};

export const usePropertiesQuery = () => ({
  queryKey: ['properties'],
  queryFn: async () => {
    const data = await propertiesApi.getProperties();
    return Array.isArray(data) ? data : [];
  },
});

export const addPropertyMutation = {
  fn: (data: Property) => propertiesApi.addProperty(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
  },
};

export const deletePropertyMutation = {
  fn: (name: string) => propertiesApi.deleteProperty(name),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
  },
};
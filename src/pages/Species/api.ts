import axios from 'axios';
import { queryClient } from '../../queryClient'
// const mockPlants = ['Дуб', 'Клен', 'Береза', 'Тополь'];

const api = {
  getPlants: async () => {
    const response = await axios.get<string[]>('http://localhost:5000/classes');
    return response.data;
  },
  addPlant: (name: string) => axios.post('http://localhost:5000/classes', { name }),
  deletePlant: (name: string) => axios.delete(`http://localhost:5000/classesDELETE?name=${name}`)
};

// const mockApi = {
//   getPlants: async () => [...mockPlants],
//   addPlant: async (name: string) => {
//     mockPlants.push(name);
//   },
//   deletePlant: async (name: string) => {
//     const index = mockPlants.indexOf(name);
//     if (index !== -1) mockPlants.splice(index, 1);
//   }
// };

export const usePlantsQuery = () => ({
  queryKey: ['plants'],
  queryFn: async () => {
    const data = await api.getPlants();
    return Array.isArray(data) ? data : [];
  },
});

export const addPlantMutation = {
  fn: (name: string) => api.addPlant(name),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['plants'] });
  },
};

export const deletePlantMutation = {
  fn: (name: string) => api.deletePlant(name),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['plants'] });
  },
};
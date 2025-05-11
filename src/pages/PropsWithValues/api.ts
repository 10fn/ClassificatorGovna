import axios from 'axios';
import { queryClient } from '../../queryClient';
import { useMutation } from '@tanstack/react-query'

interface PropertyWithValues {
  name: string;
  type: 'numeric' | 'enum';
  values: (string | number)[];
}

const propsWithValuesApi = {
  getPropsWithValues: async (): Promise<PropertyWithValues[]> => {
    const response = await axios.get<PropertyWithValues[]>('http://localhost:5000/props-with-values');
    return response.data;
  },

  deleteValue: async (prop: string, value: string | number): Promise<void> => {
    await axios.delete('http://localhost:5000/value-by-prop', { params: { prop, value } });
  },

  addValue: async (prop: string, value: string | number): Promise<void> => {
    await axios.post('http://localhost:5000/value-by-prop', null, { params: { prop, value } });
  }
};

export const usePropsWithValuesQuery = () => ({
  queryKey: ['props-with-values'],
  queryFn: propsWithValuesApi.getPropsWithValues,
});

export const useDeleteValue = () => {
  return useMutation({
    mutationFn: ({ prop, value }: { prop: string; value: string | number }) => 
      propsWithValuesApi.deleteValue(prop, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['props-with-values'] });
    }
  });
};

export const useAddValue = () => {
  return useMutation({
    mutationFn: ({ prop, value }: { prop: string; value: string | number }) => 
      propsWithValuesApi.addValue(prop, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['props-with-values'] });
    }
  });
};
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';

// Типы данных
export interface PropertyWithValues {
  name: string;
  type: 'numeric' | 'enum';
  values: (string | number)[];
}

export interface SelectedProperty {
  name: string;
  value: string | number;
}

interface IdentifyClassResponse {
  classes: string[];
}

interface IPrecitResponse {
  predicted_class: string;
}

// API функции
const fetchPropertiesWithValues = async (): Promise<PropertyWithValues[]> => {
  const response = await axios.get<PropertyWithValues[]>('http://localhost:5000/props-with-values');
  return response.data;
};

const identifyClass = async (properties: SelectedProperty[]): Promise<IdentifyClassResponse> => {
  const response = await axios.post<IdentifyClassResponse>(
    'http://localhost:5000/identify-class',
    properties
  );
  return response.data;
};

const predictClass = async (properties: SelectedProperty[]): Promise<IPrecitResponse> => {
  const response = await axios.post<IPrecitResponse>(
    'http://localhost:5000/predict-class',
    properties
  );
  return response.data;
};

// Хуки для TanStack Query
export const usePropertiesWithValues = () => {
  return useQuery({
    queryKey: ['properties-with-values'],
    queryFn: fetchPropertiesWithValues,
    staleTime: 1000 * 60 * 5, // 5 минут кэширования
  });
};

export const useIdentifyClass = () => {
  return useMutation({
    mutationFn: identifyClass,
    onError: (error) => {
      console.error('Identification error:', error);
    }
  });
};

export const usePredictClass = () => {
  return useMutation({
    mutationFn: predictClass,
    onError: (error) => {
      console.error('Prediction error:', error);
    }
  });
};
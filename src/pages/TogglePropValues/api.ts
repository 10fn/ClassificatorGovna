import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { queryClient } from '../../queryClient';

export interface PropValue {
  name: string;
  isActive: 'on' | 'off';
}

export interface ClassProp {
  name: string;
  type: 'enum' | 'numeric';
  values: PropValue[];
}

export interface ClassWithPropValues {
  name: string;
  props: ClassProp[];
}

interface ToggleValuePayload {
  className: string;
  propName: string;
  propType: 'enum' | 'numeric';
  values: Array<{
    valueName: string;
    isActive: 'on' | 'off';
  }>;
}

const propValuesApi = {
  getClassesWithPropValues: async (): Promise<ClassWithPropValues[]> => {
    const response = await axios.get<ClassWithPropValues[]>('http://localhost:5000/props-values-is-active');
    return response.data;
  },

  togglePropValue: async (payload: ToggleValuePayload): Promise<void> => {
    await axios.put('http://localhost:5000/toggle-value-for-prop', payload);
  }
};

export const useClassesWithPropValuesQuery = () => ({
  queryKey: ['classes-with-prop-values'],
  queryFn: propValuesApi.getClassesWithPropValues,
});

export const useTogglePropValue = () => {
  return useMutation({
    mutationFn: (payload: ToggleValuePayload) => propValuesApi.togglePropValue(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes-with-prop-values'] });
    }
  });
};
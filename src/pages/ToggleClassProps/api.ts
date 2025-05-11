import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { queryClient } from '../../queryClient';

interface ClassProp {
  name: string;
  val: 'on' | 'off';
}

interface ClassWithProps {
  name: string;
  props: ClassProp[];
}

export interface ClassPropUpdate {
  name: string;
  val: 'on' | 'off';
}

const classPropsApi = {
  getClassesWithProps: async (): Promise<ClassWithProps[]> => {
    const response = await axios.get<ClassWithProps[]>('http://localhost:5000/classes-with-props');
    return response.data;
  },

  updateClassProps: async (className: string, updates: ClassPropUpdate[]): Promise<void> => {
    await axios.put(`http://localhost:5000/class-prop?class=${encodeURIComponent(className)}`, updates);
  }
};

export const useClassesWithPropsQuery = () => ({
  queryKey: ['classes-with-props'],
  queryFn: classPropsApi.getClassesWithProps,
});

export const useUpdateClassProps = () => {
  return useMutation({
    mutationFn: ({ className, updates }: { className: string; updates: ClassPropUpdate[] }) => 
      classPropsApi.updateClassProps(className, updates),
    onSuccess: (_, variables) => {
      // Оптимистичное обновление данных
      queryClient.setQueryData<ClassWithProps[]>(['classes-with-props'], (oldData) => {
        if (!oldData) return oldData;
        
        return oldData.map(classItem => {
          if (classItem.name !== variables.className) return classItem;
          
          return {
            ...classItem,
            props: classItem.props.map(prop => {
              const updatedProp = variables.updates.find(u => u.name === prop.name);
              return updatedProp ? { ...prop, val: updatedProp.val } : prop;
            })
          };
        });
      });
    }
  });
};
import axios from 'axios'

interface CompletenessCheckResult {
  classes: string[];
  isError: boolean;
  missing: Record<string, string[]>;
  props: string[];
}

const completenessApi = {
  // Проверка полноты данных
  checkCompleteness: async (): Promise<CompletenessCheckResult> => {
    const response = await axios.get<CompletenessCheckResult>('http://localhost:5000/check-knowledge-is-full');
    return response.data;
  }
};

export const useCompletenessCheck = () => ({
  queryKey: ['completeness-check'],
  queryFn: completenessApi.checkCompleteness,
});
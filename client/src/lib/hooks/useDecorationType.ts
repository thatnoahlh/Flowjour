import { useEnvironment } from '../stores/useEnvironment';

export function useDecorationType(): string {
  const { decorationType } = useEnvironment();
  return decorationType;
}
'use client';

import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

/**
 * Shape de error canónico del BFF: { error: { code, message, details } }.
 * (El route handler lo normaliza desde el error de NestJS.)
 */
interface ApiErrorBody {
  error?: { code: string; message: string; details?: unknown };
  message?: string;
}

export type ApiError = AxiosError<ApiErrorBody>;

// Contexto que devuelve onMutate (lo que TanStack llama "onMutateResult").
type MutationCtx = { toastId?: string | number };

interface UseApiMutationOptions<TData, TVariables>
  extends Omit<
    UseMutationOptions<TData, ApiError, TVariables, MutationCtx>,
    'mutationFn'
  > {
  mutationFn: (vars: TVariables) => Promise<TData>;
  invalidateKeys?: QueryKey[];
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
}

/**
 * Wrapper genérico sobre useMutation. Encapsula:
 *  - toast loading → success/error → dismiss (sonner)
 *  - invalidación de queryKeys en onSuccess (siempre con exact: false)
 *  - parseo del shape de error del BFF
 *
 * Convención del proyecto: toda mutation se construye sobre este helper.
 */
export function useApiMutation<TData, TVariables>({
  mutationFn,
  invalidateKeys,
  successMessage,
  errorMessage,
  loadingMessage = 'Procesando…',
  onMutate,
  onSuccess,
  onError,
  onSettled,
  ...options
}: UseApiMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation<TData, ApiError, TVariables, MutationCtx>({
    mutationFn,

    onMutate: async (variables, context) => {
      const toastId = toast.loading(loadingMessage);
      const custom = onMutate ? await onMutate(variables, context) : undefined;
      return { ...(custom ?? {}), toastId };
    },

    onSuccess: async (data, variables, onMutateResult, context) => {
      if (invalidateKeys) {
        await Promise.all(
          invalidateKeys.map((key) =>
            queryClient.invalidateQueries({ queryKey: key, exact: false }),
          ),
        );
      }
      if (successMessage) toast.success(successMessage);
      await onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      const body = error.response?.data;
      const msg =
        body?.error?.message ||
        body?.message ||
        errorMessage ||
        'Ocurrió un error inesperado';
      toast.error(msg);
      onError?.(error, variables, onMutateResult, context);
    },

    onSettled: async (data, error, variables, onMutateResult, context) => {
      if (onMutateResult?.toastId) toast.dismiss(onMutateResult.toastId);
      await onSettled?.(data, error, variables, onMutateResult, context);
    },

    ...options,
  });
}

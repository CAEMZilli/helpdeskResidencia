import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "@/api/users";
import type { CreateUserInput, UpdateUserInput } from "@/api/users";

export const usersQueryKey = ["users"] as const;

export function useUsers() {
  return useQuery({
    queryKey: usersQueryKey,
    queryFn: usersApi.getAllUsers,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => usersApi.createUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      usersApi.updateUser(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}

import { useMutation } from '@tanstack/react-query'
import { requestActivation } from '../../lib/api'
import { type ActivationPayload } from '../../lib/types'

export function useActivation() {
  return useMutation({
    mutationFn: (payload: ActivationPayload) => requestActivation(payload),
  })
}

import type { CommonNodeType, Variable } from '@/app/components/workflow/types'

export type WorkflowNodeType = CommonNodeType & {
  outputs: Variable[]
}

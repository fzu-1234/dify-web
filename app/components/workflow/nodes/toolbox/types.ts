import type { CommonNodeType, Variable } from '@/app/components/workflow/types'

export type ToolboxNodeType = CommonNodeType & {
  outputs: Variable[]
}

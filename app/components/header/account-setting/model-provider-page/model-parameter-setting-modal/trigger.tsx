import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { RiSettings2Line } from '@remixicon/react'
import type {
  Model,
  ModelItem,
  ModelProvider,
} from '../declarations'
import { MODEL_STATUS_TEXT } from '../declarations'
import { useLanguage } from '../hooks'
import ModelIcon from '../model-icon'
import ModelName from '../model-name'
import cn from '@/utils/classnames'
import { useProviderContext } from '@/context/provider-context'
import { SlidersH } from '@/app/components/base/icons/src/vender/line/mediaAndDevices'
import { AlertTriangle } from '@/app/components/base/icons/src/vender/line/alertsAndFeedback'
import Tooltip from '@/app/components/base/tooltip'

export type TriggerProps = {
  open?: boolean
  disabled?: boolean
  currentProvider?: ModelProvider | Model
  currentModel?: ModelItem
  providerName?: string
  modelId?: string
  hasDeprecated?: boolean
  modelDisabled?: boolean
  isInWorkflow?: boolean
}
const Trigger: FC<TriggerProps> = ({
  disabled,
  currentProvider,
  currentModel,
  providerName,
  modelId,
  hasDeprecated,
  modelDisabled,
  isInWorkflow,
}) => {
  const { t } = useTranslation()
  const language = useLanguage()
  const { modelProviders } = useProviderContext()
  // console.log('currentProvider', currentProvider)
  return (
    <div
      className={cn(
        'relative flex items-center h-8 rounded-lg  cursor-pointer',
        !isInWorkflow && 'border hover:border-[1.5px]',
        !isInWorkflow && (disabled ? 'border-[#F79009] bg-[#FFFAEB]' : 'border-[#444CE7] bg-primary-50'),
        isInWorkflow && 'pr-[30px] btn-tertiary',
      )}
    >
      <RiSettings2Line className='absolute top-[9px] right-2 w-3.5 h-3.5 text-gray-500' />
    </div>
  )
}

export default Trigger

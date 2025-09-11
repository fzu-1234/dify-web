'use client'
import type { FC } from 'react'
import React from 'react'
import {
  RiArrowDownSLine,
} from '@remixicon/react'
import { useBoolean } from 'ahooks'
import type { DefaultTFuncReturn } from 'i18next'
import cn from '@/utils/classnames'
import Tooltip from '@/app/components/base/tooltip'

type Props = {
  className?: string
  title: JSX.Element | string | DefaultTFuncReturn
  tooltip?: React.ReactNode
  isSubTitle?: boolean
  supportFold?: boolean
  children?: JSX.Element | string | null
  operations?: JSX.Element
  inline?: boolean
  type?: string
}

const Field: FC<Props> = ({
  className,
  title,
  isSubTitle,
  tooltip,
  children,
  operations,
  inline,
  supportFold,
  type,
}) => {
  const [fold, {
    toggle: toggleFold,
  }] = useBoolean(true)
  // console.log('fileds', className, title,isSubTitle, tooltip,children,operations,inline,supportFold,)
  return (
    <div className={cn(className, inline && 'flex justify-between items-center w-full', type === 'model' && 'flex gap-2.5')}>
      <div
        onClick={() => supportFold && toggleFold()}
        className={cn('flex justify-between items-center', supportFold && 'cursor-pointer')}>
        <div className='flex items-center h-6'>
          <div className={cn(isSubTitle ? 'system-xs-medium-uppercase text-text-tertiary' : 'system-sm-semibold-uppercase text-text-secondary')}>{title}</div>
          {tooltip && (
            <Tooltip
              popupContent={tooltip}
              popupClassName='ml-1'
              triggerClassName='w-4 h-4 ml-1'
            />
          )}
        </div>
        <div className='flex'>
          {operations && <div>{operations}</div>}
          {supportFold && (
            <RiArrowDownSLine className='w-4 h-4 text-text-tertiary cursor-pointer transform transition-transform' style={{ transform: fold ? 'rotate(-90deg)' : 'rotate(0deg)' }} />
          )}
        </div>
      </div>
      {children && (!supportFold || (supportFold && !fold)) && <div className={cn(!inline && 'mt-1', type === 'model' && 'flex-1 flex gap-1.5 items-center')}>{children}</div>}
    </div>
  )
}
export default React.memo(Field)

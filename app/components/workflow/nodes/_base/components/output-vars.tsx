'use client'
import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import cn from '@/utils/classnames'
import { FieldCollapse } from '@/app/components/workflow/nodes/_base/components/collapse'

type Props = {
  className?: string
  title?: string
  children: JSX.Element
}

const OutputVars: FC<Props> = ({
  title,
  children,
}) => {
  const { t } = useTranslation()
  return (
    <FieldCollapse title={title || t('workflow.nodes.common.outputVars')}>
      {children}
    </FieldCollapse>
  )
}
type VarItemProps = {
  name: string
  type: string
  description: string
  subItems?: {
    name: string
    type: string
    description: string
  }[]
  nodeType?: string
}

export const VarItem: FC<VarItemProps> = ({
  name,
  type,
  description,
  subItems,
  nodeType,
}) => {
  return (
    <div className={cn(
      'py-1',
      nodeType === 'llm' && ('border-b border-gray-200'),
    )}>
      <div className={cn('flex leading-[18px] items-center', nodeType === 'llm' && 'justify-between')}>
        <div className='code-sm-semibold text-text-secondary'>{name}</div>
        <div className={cn('mt-0.5 system-xs-regular text-text-tertiary hidden'
          , nodeType === 'llm' && 'block text-text-secondary')}>
          {description}
          {subItems && (
            <div className='ml-2 border-l border-gray-200 pl-2'>
              {subItems.map((item, index) => (
                <VarItem
                  key={index}
                  name={item.name}
                  type={item.type}
                  description={item.description}
                />
              ))}
            </div>
          )}
        </div>
        {type && !(
          (nodeType === 'document-extractor' && (type.includes('File') || type.includes('Array'))) ||
          (nodeType === 'iteration' && type.includes('Array')) ||
          (nodeType === 'list-operator' && type.includes('Array')) ||
          (nodeType === 'variable-assigner')
        ) && (
          <div className={cn('ml-2 system-xs-regular text-text-tertiary', nodeType === 'llm' && 'text-text-secondary')}>{type} <span className='ml-1'>{description}</span></div>
        )}
      </div>
      <div className={cn('mt-0.5 system-xs-regular text-text-tertiary', nodeType === 'llm' && 'hidden')}>
        {description}
        {subItems && (
          <div className='ml-2 border-l border-gray-200 pl-2'>
            {subItems.map((item, index) => (
              <VarItem
                key={index}
                name={item.name}
                type={item.type}
                description={item.description}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
export default React.memo(OutputVars)

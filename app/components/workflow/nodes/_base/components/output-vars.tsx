'use client'
import type { FC } from 'react'
import React, { Fragment } from 'react'
import { Table } from 'antd'
import type { TableProps } from 'antd'
import { useTranslation } from 'react-i18next'
import cn from '@/utils/classnames'
import { FieldCollapse } from '@/app/components/workflow/nodes/_base/components/collapse'
import '../../../style.css'
type Props = {
  className?: string
  title?: string
  children: JSX.Element
  nodeType?: string
}

const OutputVars: FC<Props> = ({
  title,
  children,
  nodeType,
}) => {
  const { t } = useTranslation()

  // 收集所有VarItem的数据
  const collectVarItems = (child: React.ReactNode): VarItemProps[] => {
    // 如果子元素是数组，递归处理每个元素
    if (Array.isArray(child))
      return child.flatMap(collectVarItems)
    // 如果不是有效的React元素，直接返回空数组
    if (!React.isValidElement(child))
      return []
    // 检查是否为VarItem组件
    if ((child.type as any).displayName === 'VarItem' || (child.type as any).name === 'VarItem' || child.type.toString() === 'VarItem')
      return [child.props]
    // 检查是否为Fragment
    if (child.type === Fragment || (child.type && child.type.toString() === 'Symbol(react.fragment)')) {
      // 递归处理Fragment的子元素
      const fragmentChildren = React.Children.toArray(child.props.children)
      return fragmentChildren.flatMap(collectVarItems)
    }
    // 如果有子元素，递归处理
    if (child.props && child.props.children) {
      const children = React.Children.toArray(child.props.children)
      return children.flatMap(collectVarItems)
    }
    return []
  }
  const varItems = React.Children.toArray(children).flatMap(collectVarItems)
  const columns: TableProps<VarItemProps>['columns'] = [
    {
      title: '变量名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '变量类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '变量说明',
      dataIndex: 'description',
      key: 'description',
    },
  ]

  return (
    <FieldCollapse title={title || t('workflow.nodes.common.outputVars')} type={nodeType}>
      {/* {children} */}
      <Table
        className='custom-output-table'
        columns={columns}
        dataSource={varItems}
        pagination={false}
        expandable={{
          defaultExpandAllRows: true,
          childrenColumnName: 'subItems',
          rowExpandable: record => !!record.subItems && record.subItems.length > 0,
        }}
        scroll={{ y: '530px' }}
        rowKey={record => record.name}
      />
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
        {/* {description} */}
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
VarItem.displayName = 'VarItem'
export default React.memo(OutputVars)

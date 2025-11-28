import { type FC, useEffect, useRef, useState } from 'react'
import React from 'react'
import { useNodes } from 'reactflow'
import type { KnowledgeRetrievalNodeType } from './types'
import { Folder } from '@/app/components/base/icons/src/vender/solid/files'
import type { NodeProps } from '@/app/components/workflow/types'
import { fetchDatasets } from '@/service/datasets'
import type { DataSet } from '@/models/datasets'
import Toast from '@/app/components/base/toast'

const Node: FC<NodeProps<KnowledgeRetrievalNodeType>> = ({
  data,
  id,
}) => {
  const [selectedDatasets, setSelectedDatasets] = useState<DataSet[]>([])
  const updateTime = useRef(0)
  const nodes = useNodes()
  const isSelected = nodes.find(node => node.id === id)?.data?.selected || false
  const toastShownRef = useRef(false)

  useEffect(() => {
    (async () => {
      updateTime.current = updateTime.current + 1
      const currUpdateTime = updateTime.current
      try {
        if (data.dataset_ids?.length > 0) {
          const { data: dataSetsWithDetail } = await fetchDatasets({ url: '/datasets', params: { page: 1, ids: data.dataset_ids } })
          //  avoid old data overwrite new data
          if (currUpdateTime < updateTime.current)
            return
          setSelectedDatasets(dataSetsWithDetail)
        }
        else {
          setSelectedDatasets([])
        }
        // toastShownRef.current = false // 重置Toast状态，因为数据已成功加载
      }
      catch (error) {
        // if (isSelected && !toastShownRef.current) {
        //   console.log('知识库节点提示1:')
        //   Toast.notify({
        //     type: 'warning',
        //     message: '当前知识检索节点异常，请移除后重新添加',
        //   })
        //   toastShownRef.current = true // 标记Toast已显示
        // }

        // console.error('Knowledge retrieval node error:', error)
      }
    })()
  }, [data.dataset_ids])

  if (!selectedDatasets.length)
    return null

  return (
    <div className='mb-1 px-3 py-1'>
      <div className='space-y-0.5'>
        {selectedDatasets.map(({ id, name }) => (
          <div key={id} className='flex items-center h-[26px] bg-workflow-block-parma-bg rounded-md  px-1 text-xs font-normal text-gray-700'>
            <div className='mr-1 shrink-0 p-1 bg-[#F5F8FF] rounded-md border-[0.5px] border-[#E0EAFF]'>
              <Folder className='w-3 h-3' />
            </div>
            <div className='grow w-0 text-text-secondary system-xs-regular truncate'>
              {name}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default React.memo(Node)

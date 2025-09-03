import React, { useCallback, useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useTranslation } from 'react-i18next'
import { useStoreApi } from 'reactflow'
import ToolModal from './tool-modal'
import NavLink from './navLink2'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'
import s from './style.module.css'
import {
  AlignLeft02,
  AlignRight02,
} from '@/app/components/base/icons/src/vender/line/layout'
import { useStore as useAppStore } from '@/app/components/app/store'
import type {
  OnSelectBlock,
} from '@/app/components/workflow/types'
import { generateNewNode } from '@/app/components/workflow/utils'
import { NODES_INITIAL_DATA } from '@/app/components/workflow/constants'
import { useWorkflowStore } from '@/app/components/workflow/store'
import { CUSTOM_NOTE_NODE } from '@/app/components/workflow/note-node/constants'
import type { NoteNodeType } from '@/app/components/workflow/note-node/types'
import { NoteTheme } from '@/app/components/workflow/note-node/types'
import { useAppContext } from '@/context/app-context'

export type IAppDetailNavProps = {
  changeExpand: (expand: boolean) => void
}

const AppDetailNav = ({ changeExpand }: IAppDetailNavProps) => {
  const { t } = useTranslation()
  const store = useStoreApi()
  const workflowStore = useWorkflowStore()
  const { appSidebarExpand, setAppSiderbarExpand } = useAppStore(useShallow(state => ({
    appSidebarExpand: state.appSidebarExpand,
    setAppSiderbarExpand: state.setAppSiderbarExpand,
  })))
  const media = useBreakpoints()
  const isMobile = media === MediaType.mobile
  const [showExpand, setShowExpand] = useState(true)
  const [toolModalOpen, setToolModalOpen] = useState(false) // 添加状态控制弹框
  const [toolModalType, setToolModalType] = useState<'workflow' | 'toolbox' | ''>('')
  const expand = appSidebarExpand === 'expand'

  const handleToggle = (state: string) => {
    setAppSiderbarExpand(state === 'expand' ? 'collapse' : 'expand')
  }
  const { userProfile } = useAppContext()
  const handleSelect = useCallback<OnSelectBlock>((type, toolDefaultValue) => {
    // 当节点类型为 workflow,toolbox 时，显示弹框而不是创建节点
    if (type === 'workflow' || type === 'toolbox') {
      setToolModalType(type);
      setToolModalOpen(true)
      return;
    }
    const {
      getNodes,
    } = store.getState()
    const nodes = getNodes()
    const nodesWithSameType = nodes.filter(node => node.data.type === type)
    let newNode
    if (type === 'note') {
      newNode = generateNewNode({
        type: CUSTOM_NOTE_NODE,
        data: {
          title: '',
          desc: '',
          type: '' as any,
          text: '',
          theme: NoteTheme.blue,
          author: userProfile?.name || '',
          showAuthor: true,
          width: 240,
          height: 88,
          _isCandidate: true,
        } as NoteNodeType,
        position: {
          x: 0,
          y: 0,
        },
      });
    } else {
      newNode = generateNewNode({
        data: {
          ...NODES_INITIAL_DATA[type],
          title: nodesWithSameType.length > 0 ? `${t(`workflow.blocks.${type}`)} ${nodesWithSameType.length + 1}` : t(`workflow.blocks.${type}`),
          ...(toolDefaultValue || {}),
          _isCandidate: true,
        },
        position: {
          x: 0,
          y: 0,
        },
        zIndex: 10,
      })
    }
    // console.log('newNode', newNode);
    workflowStore.setState({
      candidateNode: newNode?.newNode,
    })
  }, [store, workflowStore, userProfile, t])

  useEffect(() => {
    if (appSidebarExpand) {
      localStorage.setItem('app-detail-collapse-or-expand', appSidebarExpand)
      setAppSiderbarExpand(appSidebarExpand)
    }
    changeExpand(appSidebarExpand === 'expand')
  }, [appSidebarExpand, changeExpand, setAppSiderbarExpand])

  return (
    <div
      className={`
        shrink-0 flex flex-col bg-white border-r border-divider-burn transition-all h-full
        ${expand ? 'w-[220px]' : 'w-[72px]'}
      `}
    >
      <div
        className={`
          shrink-0 text-[18px] border-b border-divider-burn font-semibold
          ${expand ? 'px-5 py-[10px]' : 'p-2 text-center'} ${s.sideTitle}
        `}
      >
        {expand ? t('workflow.common.addBlock') : t('workflow.common.block')}
      </div>
      <NavLink onSelect={handleSelect} expand={expand} onChangeTabs={show => setShowExpand(show)}/>
      {/* 添加WorkflowModal组件 */}
      <ToolModal open={toolModalOpen} onSelect={handleSelect}
        onCancel={() => {
          setToolModalOpen(false);
          setToolModalType('');
          }} toolType={toolModalType} />
      {
        !isMobile && showExpand && (
          <div
            className={`
              shrink-0 py-4 flex items-center justify-end 
              ${expand ? 'px-4' : 'px-4'}
            `}
          >
            <div
              className='flex items-center justify-center w-8 h-8 text-[#666666] cursor-pointer bg-[#EBF0FC] rounded-[10px]'
              onClick={() => handleToggle(appSidebarExpand)}
            >
              {
                expand
                  ? <AlignLeft02 className='w-4 h-4' />
                  : <AlignRight02 className='w-4 h-4' />
              }
            </div>
          </div>
        )
      }
    </div>
  )
}

export default React.memo(AppDetailNav)

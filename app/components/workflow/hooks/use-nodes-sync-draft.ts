import { useCallback } from 'react'
import produce from 'immer'
import { useStoreApi } from 'reactflow'
import { useParams } from 'next/navigation'
import {
  useStore,
  useWorkflowStore,
} from '../store'
import { BlockEnum } from '../types'
import { useWorkflowUpdate } from '../hooks'
import {
  useNodesReadOnly,
} from './use-workflow'
import { syncWorkflowDraft } from '@/service/workflow'
import { useFeaturesStore } from '@/app/components/base/features/hooks'
import { API_PREFIX } from '@/config'

export const useNodesSyncDraft = () => {
  const store = useStoreApi()
  const workflowStore = useWorkflowStore()
  const featuresStore = useFeaturesStore()
  const { getNodesReadOnly } = useNodesReadOnly()
  const { handleRefreshWorkflowDraft } = useWorkflowUpdate()
  const debouncedSyncWorkflowDraft = useStore(s => s.debouncedSyncWorkflowDraft)
  const params = useParams()

  const getPostParams = useCallback(() => {
    const {
      getNodes,
      edges,
      transform,
    } = store.getState()
    const [x, y, zoom] = transform
    const {
      appId,
      conversationVariables,
      environmentVariables,
      syncWorkflowDraftHash,
    } = workflowStore.getState()

    if (appId) {
      const nodes = getNodes()
      const hasStartNode = nodes.find(node => node.data.type === BlockEnum.Start)

      if (!hasStartNode)
        return

      const features = featuresStore!.getState().features

      // 定义递归替换函数
      const replaceStartQuery = (obj: any): any => {
        if (typeof obj === 'string') {
          // 替换字符串中的 start_query
          return obj.replace(/start_query/g, 'sys.query')
        }
        else if (Array.isArray(obj)) {
          // 如果是数组，递归处理每个元素
          return obj.map(item => replaceStartQuery(item))
        }
        else if (obj !== null && typeof obj === 'object') {
          // 如果是对象，递归处理每个属性值
          const newObj: any = {}
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key))
              newObj[key] = replaceStartQuery(obj[key])
          }
          return newObj
        }
        // 其他类型（如数字、布尔值等）保持不变
        return obj
      }
      let producedNodes = produce(nodes, (draft) => {
        draft.forEach((node) => {
          Object.keys(node.data).forEach((key) => {
            if (key.startsWith('_'))
              delete node.data[key]
          })
        })
      })
      // 执行全局替换
      producedNodes = replaceStartQuery(producedNodes)
      const producedEdges = produce(edges, (draft) => {
        draft.forEach((edge) => {
          Object.keys(edge.data).forEach((key) => {
            if (key.startsWith('_'))
              delete edge.data[key]
          })
        })
      })
      return {
        url: `/apps/${appId}/workflows/draft`,
        params: {
          graph: {
            nodes: producedNodes,
            edges: producedEdges,
            viewport: {
              x,
              y,
              zoom,
            },
          },
          features: {
            opening_statement: features.opening?.enabled ? (features.opening?.opening_statement || '') : '',
            suggested_questions: features.opening?.enabled ? (features.opening?.suggested_questions || []) : [],
            suggested_questions_after_answer: features.suggested,
            text_to_speech: features.text2speech,
            speech_to_text: features.speech2text,
            retriever_resource: features.citation,
            sensitive_word_avoidance: features.moderation,
            file_upload: features.file,
          },
          environment_variables: environmentVariables,
          conversation_variables: conversationVariables,
          hash: syncWorkflowDraftHash,
        },
      }
    }
  }, [store, featuresStore, workflowStore])

  const syncWorkflowDraftWhenPageClose = useCallback(() => {
    if (getNodesReadOnly())
      return
    const postParams = getPostParams()

    if (postParams) {
      navigator.sendBeacon(
        `${API_PREFIX}/apps/${params.appId}/workflows/draft?_token=${localStorage.getItem('console_token')}`,
        JSON.stringify(postParams.params),
      )
    }
  }, [getPostParams, params.appId, getNodesReadOnly])

  const doSyncWorkflowDraft = useCallback(async (notRefreshWhenSyncError?: boolean) => {
    if (getNodesReadOnly())
      return
    const postParams = getPostParams()

    if (postParams) {
      const {
        setSyncWorkflowDraftHash,
        setDraftUpdatedAt,
      } = workflowStore.getState()
      try {
        const res = await syncWorkflowDraft(postParams)
        setSyncWorkflowDraftHash(res.hash)
        setDraftUpdatedAt(res.updated_at)
      }
      catch (error: any) {
        if (error && error.json && !error.bodyUsed) {
          error.json().then((err: any) => {
            if (err.code === 'draft_workflow_not_sync' && !notRefreshWhenSyncError)
              handleRefreshWorkflowDraft()
          })
        }
      }
    }
  }, [workflowStore, getPostParams, getNodesReadOnly, handleRefreshWorkflowDraft])

  const handleSyncWorkflowDraft = useCallback((sync?: boolean, notRefreshWhenSyncError?: boolean) => {
    if (getNodesReadOnly())
      return

    if (sync)
      doSyncWorkflowDraft(notRefreshWhenSyncError)
    else
      debouncedSyncWorkflowDraft(doSyncWorkflowDraft)
  }, [debouncedSyncWorkflowDraft, doSyncWorkflowDraft, getNodesReadOnly])

  return {
    doSyncWorkflowDraft,
    handleSyncWorkflowDraft,
    syncWorkflowDraftWhenPageClose,
  }
}

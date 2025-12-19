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
  replaceStartQuery,
} from '../utils'
import {
  useNodesReadOnly,
} from './use-workflow'
import { syncWorkflowDraft } from '@/service/workflow'
import { useFeaturesStore } from '@/app/components/base/features/hooks'
import { API_PREFIX, AUTH_WAY } from '@/config'
const { getLsToken } = require("js-unif-core/lib/storage");
import { getAuthHeader, getRequestUrl } from "@/utils/macAuth";

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

      let producedNodes = produce(nodes, (draft) => {
        draft.forEach((node) => {
          // 循环执行节点设置enable_end_condition 字段
          if (node.data.type === BlockEnum.Iteration) {
            const iterationData = node.data as any
            if (iterationData.end_conditions)
              iterationData.enable_end_condition = iterationData.end_conditions.length > 0
            else
              iterationData.enable_end_condition = false
          }
          Object.keys(node.data).forEach((key) => {
            if (key.startsWith('_'))
              delete node.data[key]
          })
        })
      })
      // 执行全局替换
      producedNodes = replaceStartQuery(producedNodes, 'start_query', 'sys.query')
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
      if (AUTH_WAY === "FUNUO") {
        const base = API_PREFIX
        const url = `apps/${params.appId}/workflows/draft?_token=${localStorage.getItem('console_token')}&_t=${new Date().getTime()}`
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }
        const axiosOptions = {
          baseURL: base,
          url,
          method: 'POST',
        }
        const requestUrl = getRequestUrl(axiosOptions)
        if (requestUrl)
          headers['Request-Url'] = requestUrl

        if (getLsToken()) {
          const authorization = getAuthHeader(axiosOptions)
          if (authorization)
            headers['Authorization'] = authorization

          const curTenantId = window.localStorage.getItem("curTenantId")
          if (curTenantId)
            headers['TenantId'] = curTenantId
        }
        const urlWithPrefix = (url.startsWith('http://') || url.startsWith('https://')) ? url : `${base}${url.startsWith('/') ? url : `/${url}`}`
        fetch(
          urlWithPrefix,
          {
            method: 'POST',
            keepalive: true,
            headers,
            body: JSON.stringify(postParams.params),
          },
        ).then(async (res) => {
          if (res.ok) {
            const data = await res.json()

            const { setSyncWorkflowDraftHash, setDraftUpdatedAt } = workflowStore.getState()
            if (data?.hash)
              setSyncWorkflowDraftHash(data.hash)
            if (data?.updated_at)
              setDraftUpdatedAt(data.updated_at)
          }
        }).catch(err => {
          console.warn('Failed to sync workflow draft on page close:', err)
        })
      }
      else {
        navigator.sendBeacon(
          `${API_PREFIX}/apps/${params.appId}/workflows/draft?_token=${localStorage.getItem('console_token')}`,
          JSON.stringify(postParams.params),
        )
      }
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

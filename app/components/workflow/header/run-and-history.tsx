import type { FC } from 'react'
import { memo , useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RiLoader2Line,
  RiPlayCircleLine,
} from '@remixicon/react'
import {
  Cog8ToothIcon,
} from '@heroicons/react/24/outline'
import { useContext, useContextSelector } from 'use-context-selector'
import { useStore } from '../store'
import {
  useIsChatMode,
  useNodesReadOnly,
  useWorkflowRun,
  useWorkflowStartRun,
} from '../hooks'
import { WorkflowRunningStatus } from '../types'
import ViewHistory from './view-history'
import Checklist from './checklist'
import cn from '@/utils/classnames'
import {
  StopCircle,
} from '@/app/components/base/icons/src/vender/line/mediaAndDevices'
import SettingsModal from '@/app/components/app/overview/settings'
import type { ConfigParams } from '@/app/components/app/overview/settings'
import { useStore as useAppStore } from '@/app/components/app/store'
import type { AppDetailResponse, AppSSO } from '@/models/app'
import type { IAppCardProps } from '@/app/components/app/overview/appCard'
import { asyncRunSafe } from '@/utils'
import type { App } from '@/types/app'
import { NEED_REFRESH_APP_LIST_KEY } from '@/config'
import {
  fetchAppDetail,
  updateAppSSO,
  fetchAppSSO,
  updateAppSiteConfig,
} from '@/service/apps'
import AppContext from '@/context/app-context'
import { ToastContext } from '@/app/components/base/toast'
const RunMode = memo(() => {
  const { t } = useTranslation()
  const { handleWorkflowStartRunInWorkflow } = useWorkflowStartRun()
  const { handleStopRun } = useWorkflowRun()
  const workflowRunningData = useStore(s => s.workflowRunningData)
  const isRunning = workflowRunningData?.result.status === WorkflowRunningStatus.Running

  return (
    <>
      <div
        className={cn(
          'flex items-center px-2.5 h-8 rounded-md text-[13px] font-medium text-components-button-secondary-accent-text',
          'hover:bg-state-accent-hover cursor-pointer btn-secondary',
          isRunning && 'bg-state-accent-hover !cursor-not-allowed',
        )}
        onClick={() => {
          handleWorkflowStartRunInWorkflow()
        }}
      >
        {
          isRunning
            ? (
              <>
                <RiLoader2Line className='mr-1 w-4 h-4 animate-spin' />
                {t('workflow.common.running')}
              </>
            )
            : (
              <>
                <RiPlayCircleLine className='mr-1 w-4 h-4' />
                {t('workflow.common.run')}
              </>
            )
        }
      </div>
      {
        isRunning && (
          <div
            className='flex items-center justify-center ml-0.5 w-7 h-7 cursor-pointer hover:bg-black/5 rounded-md'
            onClick={() => handleStopRun(workflowRunningData?.task_id || '')}
          >
            <StopCircle className='w-4 h-4 text-components-button-ghost-text' />
          </div>
        )
      }
    </>
  )
})
RunMode.displayName = 'RunMode'

const PreviewMode = memo(() => {
  const { t } = useTranslation()
  const { handleWorkflowStartRunInChatflow } = useWorkflowStartRun()

  return (
    <div
      className={cn(
        'flex items-center px-2.5 h-8 rounded-md text-[13px] font-medium text-components-button-secondary-accent-text',
        'hover:bg-state-accent-hover cursor-pointer btn-secondary',
      )}
      onClick={() => handleWorkflowStartRunInChatflow()}
    >
      <RiPlayCircleLine className='mr-1 w-4 h-4' />
      {t('workflow.common.debugAndPreview')}
    </div>
  )
})
PreviewMode.displayName = 'PreviewMode'

const RunAndHistory: FC = () => {
  const isChatMode = useIsChatMode()
  const { t } = useTranslation()
  const { nodesReadOnly } = useNodesReadOnly()
  const { notify } = useContext(ToastContext)
  const setAppDetail = useAppStore(state => state.setAppDetail)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const systemFeatures = useContextSelector(AppContext, state => state.systemFeatures)
  const appDetail = useAppStore(state => state.appDetail) as AppDetailResponse & Partial<AppSSO>
  const appMode = (appDetail.mode !== 'completion' && appDetail.mode !== 'workflow') ? 'chat' : appDetail.mode
  const handleSaveSiteConfig = async (params: ConfigParams) => {
    // 处理保存站点配置的逻辑
    setShowSettingsModal(false)
  }
  const updateAppDetail = async () => {
    try {
      const res = await fetchAppDetail({ url: '/apps', id: appDetail.id })
      if (systemFeatures.enable_web_sso_switch_component) {
        const ssoRes = await fetchAppSSO({ appId: appDetail.id })
        setAppDetail({ ...res, enable_sso: ssoRes.enabled })
      }
      else {
        setAppDetail({ ...res })
      }
    }
    catch (error) { console.error(error) }
  }
  const handleCallbackResult = (err: Error | null, message?: string) => {
    const type = err ? 'error' : 'success'

    message ||= (type === 'success' ? 'modifiedSuccessfully' : 'modifiedUnsuccessfully')

    if (type === 'success')
      updateAppDetail()

    notify({
      type,
      message: t(`common.actionMsg.${message}`),
    })
  }
  const onSaveSiteConfig: IAppCardProps['onSaveSiteConfig'] = async (params) => {
    const [err] = await asyncRunSafe<App>(
      updateAppSiteConfig({
        url: `/apps/${appDetail.id}/site`,
        body: params,
      }) as Promise<App>,
    )
    if (!err)
      localStorage.setItem(NEED_REFRESH_APP_LIST_KEY, '1')

    if (systemFeatures.enable_web_sso_switch_component) {
      const [sso_err] = await asyncRunSafe<AppSSO>(
        updateAppSSO({ id: appDetail.id, enabled: Boolean(params.enable_sso) }) as Promise<AppSSO>,
      )
      if (sso_err) {
        handleCallbackResult(sso_err)
        return
      }
    }

    handleCallbackResult(err)
  }
  return (
    <div className='flex items-center px-0.5 h-8 rounded-lg border-[0px] border-components-button-secondary-border'>
      {
        !isChatMode && <RunMode />
      }
      {
        isChatMode && <PreviewMode />
      }
      <div className='mx-2 w-[1px] h-3.5 bg-divider-regular'></div>
      <ViewHistory />
      <Checklist disabled={nodesReadOnly} />
      {/* 添加设置按钮 */}
      {
        isChatMode && (
          <div
            className='flex items-center justify-center ml-2 cursor-pointer hover:bg-state-accent-hover rounded-md btn-secondary h-8 text-[13px] px-2.5'
            onClick={() => setShowSettingsModal(true)} >
            <Cog8ToothIcon className='w-4 h-4 text-components-button-ghost-text' />
            Web站点设置
          </div>)
      }
      <SettingsModal
        isChat={appMode}
        appInfo={appDetail as AppDetailResponse & Partial<AppSSO>}
        isShow={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={onSaveSiteConfig}
      />
    </div>
  )
}

export default memo(RunAndHistory)

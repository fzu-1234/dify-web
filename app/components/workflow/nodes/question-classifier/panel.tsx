import type { FC } from 'react'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import produce from 'immer'
import VarReferencePicker from '../_base/components/variable/var-reference-picker'
import ConfigVision from '../_base/components/config-vision'
import useConfig from './use-config'
import ClassList from './components/class-list'
import AdvancedSetting from './components/advanced-setting'
import type { QuestionClassifierNodeType } from './types'
import Field from '@/app/components/workflow/nodes/_base/components/field'
import ModelParameterModal from '@/app/components/header/account-setting/model-provider-page/model-parameter-modal'
import ModelParameterSettingModal from '@/app/components/header/account-setting/model-provider-page/model-parameter-setting-modal'
import { InputVarType, type NodePanelProps } from '@/app/components/workflow/types'
import BeforeRunForm from '@/app/components/workflow/nodes/_base/components/before-run-form'
import ResultPanel from '@/app/components/workflow/run/result-panel'
import Split from '@/app/components/workflow/nodes/_base/components/split'
import OutputVars, { VarItem } from '@/app/components/workflow/nodes/_base/components/output-vars'
import { FieldCollapse } from '@/app/components/workflow/nodes/_base/components/collapse'

const i18nPrefix = 'workflow.nodes.questionClassifiers'

const Panel: FC<NodePanelProps<QuestionClassifierNodeType>> = ({
  id,
  data,
}) => {
  const { t } = useTranslation()

  const {
    readOnly,
    inputs,
    handleModelChanged,
    isChatMode,
    isChatModel,
    handleCompletionParamsChange,
    handleQueryVarChange,
    handleTopicsChange,
    hasSetBlockStatus,
    availableVars,
    availableNodesWithParent,
    handleInstructionChange,
    inputVarValues,
    varInputs,
    setInputVarValues,
    handleMemoryChange,
    isVisionModel,
    handleVisionResolutionChange,
    handleVisionResolutionEnabledChange,
    isShowSingleRun,
    hideSingleRun,
    runningStatus,
    handleRun,
    handleStop,
    runResult,
    filterVar,
  } = useConfig(id, data)

  const model = inputs.model

  const handleAddClass = useCallback(() => {
    const newList = produce(inputs.classes, (draft) => {
      draft.push({ id: `${Date.now()}`, name: '' })
    })
    handleTopicsChange(newList)
  }, [inputs.classes, handleTopicsChange])

  return (
    <div className='pt-2'>
      <div className='px-4 space-y-4'>
        <Field
          title={`${t(`${i18nPrefix}.model`)}:`}
          type='model'
        >
          <ModelParameterModal
            classNames='flex-1'
            popupClassName='!w-[387px]'
            isInWorkflow
            isAdvancedMode={true}
            mode={model?.mode}
            provider={model?.provider}
            completionParams={model.completion_params}
            modelId={model.name}
            setModel={handleModelChanged}
            onCompletionParamsChange={handleCompletionParamsChange}
            hideDebugWithMultipleModel
            debugWithMultipleModel={false}
            readonly={readOnly}
          />
          <ModelParameterSettingModal
            popupClassName='!w-[387px]'
            isInWorkflow
            isAdvancedMode={true}
            provider={model?.provider}
            mode={model?.mode}
            modelId={model?.name}
            setModel={handleModelChanged}
            onCompletionParamsChange={handleCompletionParamsChange}
            hideDebugWithMultipleModel
            debugWithMultipleModel={false}
            readonly={readOnly}
            completionParams={model?.completion_params}
          />
        </Field>
        <Field
          title={t(`${i18nPrefix}.inputVars`)}
        >
          <VarReferencePicker
            readonly={readOnly}
            isShowNodeName
            nodeId={id}
            value={inputs.query_variable_selector}
            onChange={handleQueryVarChange}
            filterVar={filterVar}
          />
        </Field>
        <Split />
        {false && <ConfigVision
          nodeId={id}
          readOnly={readOnly}
          isVisionModel={isVisionModel}
          enabled={inputs.vision?.enabled}
          onEnabledChange={handleVisionResolutionEnabledChange}
          config={inputs.vision?.configs}
          onConfigChange={handleVisionResolutionChange}
        />}
        <FieldCollapse
          title={t(`${i18nPrefix}.advancedSetting`)}
          type='question-classifier'
        >
          <AdvancedSetting
            hideMemorySetting={!isChatMode}
            instruction={inputs.instruction}
            onInstructionChange={handleInstructionChange}
            memory={inputs.memory}
            onMemoryChange={handleMemoryChange}
            readonly={readOnly}
            isChatApp={isChatMode}
            isChatModel={isChatModel}
            hasSetBlockStatus={hasSetBlockStatus}
            nodesOutputVars={availableVars}
            availableNodes={availableNodesWithParent}
          />
        </FieldCollapse>
        <Field
          title={t(`${i18nPrefix}.class`)}
          type='question-classifier'
          readonly={readOnly}
          handleAddClass={handleAddClass}
        >
          <ClassList
            id={id}
            list={inputs.classes}
            onChange={handleTopicsChange}
            readonly={readOnly}
          />
        </Field>
        <Split />
      </div>
      <Split />
      <div>
        <OutputVars>
          <>
            <VarItem
              name='class_name'
              type='string'
              description={t(`${i18nPrefix}.outputVars.className`)}
            />
          </>
        </OutputVars>
      </div>
      {isShowSingleRun && (
        <BeforeRunForm
          nodeName={inputs.title}
          onHide={hideSingleRun}
          forms={[
            {
              inputs: [{
                label: t(`${i18nPrefix}.inputVars`)!,
                variable: 'query',
                type: InputVarType.paragraph,
                required: true,
              }, ...varInputs],
              values: inputVarValues,
              onChange: setInputVarValues,
            },
          ]}
          runningStatus={runningStatus}
          onRun={handleRun}
          onStop={handleStop}
          result={<ResultPanel {...runResult} showSteps={false} />}
        />
      )}
    </div>
  )
}

export default React.memo(Panel)

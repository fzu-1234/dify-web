'use client'
import type { FC } from 'react'
import React, { useCallback } from 'react'
import produce from 'immer'
import { useTranslation } from 'react-i18next'
import type { UploadFileSetting } from '../../../types'
import Field from '@/app/components/app/configuration/config-var/config-modal/field'
import { TransferMethod } from '@/types/app'

type Props = {
  payload: UploadFileSetting
  onChange: (payload: UploadFileSetting) => void
}

const FileUploadSettingMultiSelect: FC<Props> = ({
  payload,
  onChange,
}) => {
  const { t } = useTranslation()
  const { allowed_file_upload_methods } = payload

  const handleUploadMethodChange = useCallback((method: TransferMethod) => {
    return () => {
      const newPayload = produce(payload, (draft) => {
        // 检查当前方法是否已在数组中
        const index = draft.allowed_file_upload_methods.indexOf(method)
        if (index > -1) {
          // 如果已存在，则移除它（取消选择）
          draft.allowed_file_upload_methods.splice(index, 1)
        } else {
          // 如果不存在，则添加它（选择）
          draft.allowed_file_upload_methods.push(method)
        }
      })
      onChange(newPayload)
    }
  }, [onChange, payload])

  // 复选框组件
  const CheckboxOption = ({ title, selected, onChange }: { title: string, selected: boolean, onChange: () => void }) => {
    return (
      <div className="flex items-center space-x-2 cursor-pointer" onClick={onChange}>
        <div className={`w-4 h-4 rounded border flex items-center justify-center ${selected ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}`}>
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          )}
        </div>
        <span className="text-sm">{title}</span>
      </div>
    )
  }

  return (
    <Field
      title={t('appDebug.variableConfig.uploadFileTypes')}
    >
      <div className='flex flex-row space-x-4'>
        <div className='w-1/2'>
          <CheckboxOption
            title={t('appDebug.variableConfig.localUpload')}
            selected={allowed_file_upload_methods.includes(TransferMethod.local_file)}
            onChange={handleUploadMethodChange(TransferMethod.local_file)}
          />
        </div>
        <div className='w-1/2'>
          <CheckboxOption
            title="URL"
            selected={allowed_file_upload_methods.includes(TransferMethod.remote_url)}
            onChange={handleUploadMethodChange(TransferMethod.remote_url)}
          />
        </div>
      </div>
    </Field>
  )
}

export default React.memo(FileUploadSettingMultiSelect)

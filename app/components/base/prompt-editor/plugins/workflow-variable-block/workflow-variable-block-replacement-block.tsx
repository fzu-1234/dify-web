import {
  memo,
  useCallback,
  useEffect,
} from 'react'
import type { TextNode } from 'lexical'
import { $applyNodeReplacement } from 'lexical'
import { mergeRegister } from '@lexical/utils'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { decoratorTransform } from '../../utils'
import type { WorkflowVariableBlockType } from '../../types'
import { CustomTextNode } from '../custom-text/node'
import { $createWorkflowVariableBlockNode } from './node'
import { WorkflowVariableBlockNode } from './index'
import { VAR_REGEX as REGEX, resetReg } from '@/config'

const WorkflowVariableBlockReplacementBlock = ({
  workflowNodesMap,
  onInsert,
}: WorkflowVariableBlockType) => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([WorkflowVariableBlockNode]))
      throw new Error('WorkflowVariableBlockNodePlugin: WorkflowVariableBlockNode not registered on editor')
  }, [editor])

  const createWorkflowVariableBlockNode = useCallback((textNode: TextNode): WorkflowVariableBlockNode => {
    if (onInsert)
      onInsert()

    const nodePathString = textNode.getTextContent().slice(3, -3)
    // console.log('5555555555555555')
    // 处理不带点分隔符的特定变量
    if (!nodePathString.includes('.')) {
      // 对于特定的不带点分隔符的变量，我们将其作为单个元素的数组传递
      return $applyNodeReplacement($createWorkflowVariableBlockNode([nodePathString], workflowNodesMap))
    }
    else {
      // 处理带点分隔符的变量
      return $applyNodeReplacement($createWorkflowVariableBlockNode(nodePathString.split('.'), workflowNodesMap))
    }
  }, [onInsert, workflowNodesMap])

  const getMatch = useCallback((text: string) => {
    const matchArr = REGEX.exec(text)

    if (matchArr === null)
      return null

    const startOffset = matchArr.index
    const endOffset = startOffset + matchArr[0].length
    return {
      end: endOffset,
      start: startOffset,
    }
  }, [])

  const transformListener = useCallback((textNode: any) => {
    resetReg()
    return decoratorTransform(textNode, getMatch, createWorkflowVariableBlockNode)
  }, [createWorkflowVariableBlockNode, getMatch])

  useEffect(() => {
    resetReg()
    return mergeRegister(
      editor.registerNodeTransform(CustomTextNode, transformListener),
    )
  }, [])

  return null
}

export default memo(WorkflowVariableBlockReplacementBlock)

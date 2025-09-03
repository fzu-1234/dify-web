import type { Block } from '../types'
import { BlockEnum } from '../types'
import { BlockClassificationEnum } from './types'

export const BLOCKS: Block[] = [
  {
    classification: BlockClassificationEnum.Execute,
    type: BlockEnum.Start,
    title: 'Start',
    description: '',
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.LLM,
    title: 'LLM',
  },
  {
    classification: BlockClassificationEnum.Execute,
    type: BlockEnum.Answer,
    title: 'Direct Answer',
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.KnowledgeRetrieval,
    title: 'Knowledge Retrieval',
  },
  {
    classification: BlockClassificationEnum.Execute,
    type: BlockEnum.End,
    title: 'End',
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.Toolbox,
    title: 'Toolbox',
  },
  {
    classification: BlockClassificationEnum.Default,
    type: BlockEnum.Workflow,
    title: 'Workflow',
  },
  {
    classification: BlockClassificationEnum.Execute,
    type: BlockEnum.QuestionClassifier,
    title: 'Question Classifier',
  },
  {
    classification: BlockClassificationEnum.Execute,
    type: BlockEnum.IfElse,
    title: 'IF/ELSE',
  },
  {
    classification: BlockClassificationEnum.Execute,
    type: BlockEnum.Iteration,
    title: 'Iteration',
  },
  {
    classification: BlockClassificationEnum.Execute,
    type: BlockEnum.TemplateTransform,
    title: 'Templating Transform',
  },
  {
    classification: BlockClassificationEnum.Execute,
    type: BlockEnum.DocExtractor,
    title: 'Doc Extractor',
  },
  {
    classification: BlockClassificationEnum.Execute,
    type: BlockEnum.VariableAggregator,
    title: 'Variable Aggregator',
  },
  {
    classification: BlockClassificationEnum.Execute,
    type: BlockEnum.Code,
    title: 'Code',
  },
  {
    classification: BlockClassificationEnum.Execute,
    type: BlockEnum.ParameterExtractor,
    title: 'Parameter Extractor',
  },
  {
    classification: BlockClassificationEnum.Execute,
    type: BlockEnum.Assigner,
    title: 'Variable Assigner',
  },
  {
    classification: BlockClassificationEnum.Execute,
    type: BlockEnum.ListFilter,
    title: 'List Filter',
  },
  {
    classification: BlockClassificationEnum.Execute,
    type: BlockEnum.HttpRequest,
    title: 'HTTP Request',
  },
  {
    classification: BlockClassificationEnum.Execute,
    type: BlockEnum.Note,
    title: 'Note',
  },
]

export const BLOCK_CLASSIFICATIONS: string[] = [
  BlockClassificationEnum.Default,
  // BlockClassificationEnum.Logic,
  // BlockClassificationEnum.QuestionUnderstand,
  // BlockClassificationEnum.Utilities,
  // BlockClassificationEnum.Transform,
  BlockClassificationEnum.Execute,
]

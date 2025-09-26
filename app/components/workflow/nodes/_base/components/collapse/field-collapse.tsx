import Collapse from '.'
import cn from '@/utils/classnames'

type FieldCollapseProps = {
  title: string
  children: JSX.Element
  type?: string
}
const FieldCollapse = ({
  title,
  children,
  type,
}: FieldCollapseProps) => {
  return (
    <div className={cn(type === 'question-classifier' ? '' : 'py-4', (type !== 'question-classifier' && type !== 'variable-assigner') && 'px-4')}>
      <Collapse
        type={type}
        trigger={
          <div className='flex items-center h-6 system-sm-semibold-uppercase text-text-secondary cursor-pointer'>{title}</div>
        }
        collapsed={false}
      >
        <div className={(type === 'question-classifier' || type === 'http') ? '' : ''}>
          {children}
        </div>
      </Collapse>
    </div>
  )
}

export default FieldCollapse

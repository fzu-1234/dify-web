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
    <div className={cn(type === 'question-classifier' ? '' : 'py-4', type === 'http' && 'px-4')}>
      <Collapse
        type={type}
        trigger={
          <div className='flex items-center h-6 system-sm-semibold-uppercase text-text-secondary cursor-pointer'>{title}</div>
        }
        collapsed={(type === 'question-classifier' || type === 'http') ? false : undefined}
      >
        <div className={(type === 'question-classifier' || type === 'http') ? '' : 'px-4'}>
          {children}
        </div>
      </Collapse>
    </div>
  )
}

export default FieldCollapse

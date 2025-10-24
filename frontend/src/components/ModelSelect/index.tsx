import {Select} from '@arco-design/web-react'
import {useRef} from 'react'
import {useTranslation} from 'react-i18next'

import ArrowIcon from '~/pages/assets/ArrowIcon'

import EmptyContent from './EmptyContent'
import FormatValue from './FormatValue'
import ModelItem from './ModelList/ModelItem'

import './index.less'

function ModelSelect({
  modelList,
  className = '',
  dropdownMenuClassName = '',
  onChange,
  value = '',
  groupText = '',
  defaultValue = '',
  ...arg
}) {
  const {t} = useTranslation()
  const selectWrap = useRef(null)
  const renderOptions = () => {
    if ((!modelList || modelList.length === 0) && !defaultValue)
      return <EmptyContent />

    if (defaultValue) {
      const groups = [
        {
          label: t(groupText),
          key: 'To be downloaded',
          list: [defaultValue],
        },
        {label: 'Existing model', key: 'Existing model', list: modelList},
      ]
      return groups.map((group) => (
        <Select.OptGroup
          key={group.key}
          label={t(group.label)}
          className="arco-select-group-title"
        >
          {group.key === 'To be downloaded' && (
            <Select.Option value={defaultValue}>{defaultValue}</Select.Option>
          )}
          {group.key !== 'To be downloaded' &&
            group.list.length > 0 &&
            group.list.map((model) => (
              <Select.Option value={model} key={model.id}>
                <ModelItem model={model} />
              </Select.Option>
            ))}
          {group.key !== 'To be downloaded' && group.list.length === 0 && (
            <EmptyContent />
          )}
        </Select.OptGroup>
      ))
    }
    return modelList?.map((model) => (
      <Select.Option value={model} key={model.id}>
        <ModelItem model={model} />
      </Select.Option>
    ))
  }
  return (
    <div ref={selectWrap} className="selectWrap" key={value}>
      <Select
        {...arg}
        bordered={false}
        getPopupContainer={() => selectWrap.current}
        renderFormat={(m, v: any) => {
          return <FormatValue value={v} modelList={modelList} />
        }}
        arrowIcon={<ArrowIcon />}
        defaultValue={value}
        className={className}
        dropdownMenuClassName={dropdownMenuClassName}
        onChange={(e) => {
          onChange(e)
        }}
        notFoundContent={<EmptyContent />}
      >
        {renderOptions()}
      </Select>
    </div>
  )
}

export default ModelSelect

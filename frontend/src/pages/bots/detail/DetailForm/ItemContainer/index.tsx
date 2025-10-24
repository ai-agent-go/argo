import React from 'react'
import {useTranslation} from 'react-i18next'

import KnowledgeIcon from '~/components/icons/KnowledgeIcon'

function ItemContainer({
  title,
  onAdd = undefined,
  children,
  icon = KnowledgeIcon,
}) {
  // console.log('children', children)
  const {t} = useTranslation()
  return (
    <div className=" rounded-xl bg-gray-50">
      <div className="py-2 px-3 border-gray-100">
        <div className="flex justify-between items-center h-8">
          <div className="flex items-center space-x-1 shrink-0">
            <div className="flex items-center justify-center w-6 h-6">
              {icon()}
            </div>
            <div className="text-sm font-semibold text-gray-800">{title}</div>
          </div>
          <div className="flex gap-2 items-center">
            <div>
              {onAdd ? (
                <div className="flex items-center gap-1">
                  <div
                    className="flex items-center rounded-md h-7 px-3 space-x-1 text-gray-700 cursor-pointer hover:bg-gray-200 select-none"
                    onClick={onAdd}
                  >
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                        className="w-3.5 h-3.5"
                      >
                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                      </svg>
                    </div>
                    <div className="text-xs font-medium">{t('Add')}</div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {!!children.length && (
        <div className="border-t">
          <div className="mt-1 px-3 pb-3">
            <div className="pt-2 pb-1 text-xs text-gray-500 gap-y-4">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ItemContainer

import {Table} from '@arco-design/web-react'
import {IconCaretRight} from '@arco-design/web-react/icon'
import {t} from 'i18next'
import {useEffect, useState} from 'react'

export default function UsefulToolItem({item}) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(null)

  const columns = [
    {
      title: '',
      dataIndex: 'label',
      width: 200,
      render: (text, record) => (
        <div className="bg-[#F2F3F5]">
          <div className="pl-4 leading-[50px] font-500 text-[#1D2129]">
            {record.minimum === 1 ? (
              <span>
                {text}
                <span className="text-red-500 ml-1">*</span>
              </span>
            ) : (
              text
            )}
          </div>
        </div>
      ),
    },
    {
      title: '',
      dataIndex: 'value',
      render: (text: string) => <div className="pl-4">{text}</div>,
    },
  ]

  const transformSchemaToData = (schema) => {
    return Object.keys(schema.properties).map((label, index) => {
      const property = schema.properties[label]
      return {
        key: (index + 1).toString(),
        label,
        value: property.description || '',
        minimum: property.minimum !== undefined ? property.minimum : undefined,
      }
    })
  }

  useEffect(() => {
    const toolValue = transformSchemaToData(item.inputSchema)
    setData(toolValue)
  }, [])

  return (
    <div className="bg-[#FCFCFC] px-3 py-4">
      <div>
        <div className="flex gap-2 items-center ">
          <IconCaretRight
            className={`text-[#565759] w-[14px] h-[14px] ${open ? 'rotate-90' : ''} cursor-pointer`}
            onClick={() => {
              setOpen((pre) => !pre)
            }}
          />
          <div className="text-[#03060E] text-[16px]">{item.name}</div>
        </div>

        <div className="mt-[10px] text-[#565759] text-[14px] ml-5">
          {item.description}
        </div>
      </div>

      {open ? (
        <div className="ml-5 mt-3">
          <div className="mb-2 text-[#03060E] font-500">
            {t('Input Schema')}:
          </div>
          {data?.length ? (
            <Table
              columns={columns}
              data={data}
              pagination={false}
              showHeader={false}
              style={{
                width: '100%',
              }}
              className="w-full"
              rowClassName={() =>
                '[&_.arco-table-td]:p-0 [&_.arco-table-td]: h-[50px] [&_.arox-table-td]:border-r-[#E5E6EB]'
              }
            />
          ) : (
            <span>无</span>
          )}
        </div>
      ) : null}
    </div>
  )
}

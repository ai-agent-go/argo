import {Message, Popover, Tooltip} from '@arco-design/web-react'
import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

import CategoryList from '~/components/CategoryList'
import OverflowTooltip from '~/components/OverflowTooltip'
import {downloadHotModel, getHotModelList} from '~/lib/apis/models'

import URLDownLoad from '../components/URLDownLoad'
import CircleArrow from '../images/circlArrow'
import Clock from '../images/clock'
import Search from '../images/search'
import Triangle from '../images/Triangle'

function ModelStorePage({LLMConnectError, ollamaModel, setDownloadType}) {
  const {t} = useTranslation()
  const [searchValue, setSearchValue] = useState('')
  const [models, setModels] = useState([])
  const [downloadType, setDownLoadType] = useState('Hot Models')
  const [openSizeIndex, setOpenSizeIndex] = useState(-1)

  const getHotModels = async () => {
    try {
      const data = await getHotModelList({search_key: ''})
      setModels(data.model_list || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleDownload = async (model) => {
    try {
      await downloadHotModel({
        model_name: model.model_name,
        size: model.select_size?.size || 0,
        category: model.category,
        parameter: model.select_size?.parameter || 0,
      })
      Message.success(t('Add to download list'))
      setDownloadType('Installed Model')
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  const resetOpenSizeIndex = () => {
    setOpenSizeIndex(-1)
  }

  useEffect(() => {
    getHotModels()

    document.addEventListener('click', resetOpenSizeIndex)
    return () => {
      document.removeEventListener('click', resetOpenSizeIndex)
    }
  }, [])

  return (
    <div>
      <div className="flex gap-[10px] mb-6">
        <div
          className={`cursor-pointer px-4 text-[#03060e] h-8 leading-8 rounded-md ${downloadType === 'Hot Models' ? 'text-[#fff] bg-[#133EBF]' : 'bg-[#F2F2F2]'}`}
          onClick={() => setDownLoadType('Hot Models')}
        >
          {t('Hot Models Download')}
        </div>
        <div
          className={`cursor-pointer px-4 text-[#03060e] h-8 leading-8 rounded-md ${downloadType === 'url' ? 'text-[#fff] bg-[#133EBF]' : 'bg-[#F2F2F2]'}`}
          onClick={() => setDownLoadType('url')}
        >
          {t('URL Download')}
        </div>
      </div>
      {downloadType === 'Hot Models' ? (
        <>
          <div className="flex w-full space-x-2">
            <div className="w-full h-11 border rounded-lg pl-3 flex items-center mb-3">
              <Search />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onBlur={getHotModels}
                placeholder={t('Search')}
                className="ml-2 border-none outline-none h-10 flex-1 rounded-lg"
              />
            </div>
          </div>
          <div className="border-[0.5px] border-[#ebebeb] p-4 rounded-lg gap-4">
            {models
              .filter(
                (m) =>
                  searchValue === '' ||
                  m.model_name.toLowerCase().includes(searchValue.toLowerCase())
              )
              .map((model, index) => (
                <React.Fragment key={model.model_name}>
                  <div className=" flex cursor-pointer w-full rounded-xl">
                    <div className=" flex flex-1 space-x-3.5 cursor-pointer w-full">
                      <div
                        className={` flex-1 self-center ${(model?.info?.meta?.hidden ?? false) ? 'text-gray-500' : ''}`}
                      >
                        <div className="flex gap-[6px] items-center">
                          <div className="font-500 leading-[22px] text-[14px] text-[#03060E] mb-[2px] overflow-hidden">
                            <OverflowTooltip>
                              {model.model_name}
                            </OverflowTooltip>
                          </div>
                          <div className="flex gap-[6px]">
                            {model?.category?.extra_label?.map((item) => (
                              <div
                                key={item}
                                className="text-[#296FFF] text-[10px] h-[18px] leading-[18px] px-[6px] bg-[#296FFF26] rounded"
                              >
                                {item}
                              </div>
                            ))}
                            {model.available.map((item) => (
                              <div
                                key={item.parameter}
                                className="text-[#6229FF] text-[10px] h-[18px] leading-[18px] px-[6px] bg-[#6229FF26] rounded"
                              >
                                {item.parameter}
                              </div>
                            ))}
                            {model.unavailable.map((item) => (
                              <div
                                key={item.parameter}
                                className="text-[#6229FF] text-[10px] h-[18px] leading-[18px] px-[6px] bg-[#6229FF26] rounded"
                              >
                                {item.parameter}
                              </div>
                            ))}
                            <CategoryList
                              list={
                                model?.category?.category_label?.category || []
                              }
                            />
                          </div>
                        </div>
                        <Tooltip content={model?.desc}>
                          <div className="leading-[18px] text-[#565759] text-[12px]">
                            {model?.desc || ''}
                          </div>
                        </Tooltip>
                        <div className="text-[10px] overflow-hidden text-ellipsis line-clamp-1 text-[#AEAFB3] flex gap-2">
                          <div className="flex items-center">
                            <CircleArrow className="mr-[2px]" />
                            {model.total_downloads}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-[2px]" />
                            {model.updated_at}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row gap-0.5 self-center">
                      <Popover
                        trigger="click"
                        content={
                          <div
                            className="mx-[-4px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {model.available.length ? (
                              <div>
                                <div className="text-[#03060E] mb-1">
                                  {t('Select the size to download')}
                                </div>
                                <div className="flex gap-1 flex-wrap">
                                  {model.available.map((item) => (
                                    <div
                                      key={item}
                                      className={`px-[13px] cursor-pointer rounded h-6 leading-6 bg-[#F9F9F9] ${item.parameter === model.select_size?.parameter ? 'border border-[#133ebf] text-[#133ebf]' : 'text-[#565759]'}`}
                                      onClick={() => {
                                        model.select_size = item
                                        setModels([...models])
                                      }}
                                    >
                                      {item.parameter}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                            {model.unavailable.length ? (
                              <div>
                                <div className="text-[#03060E] mb-1 mt-[9px]">
                                  {t(
                                    'These sizes are not suitable for current machines'
                                  )}
                                </div>
                                <div className="flex gap-1 flex-wrap">
                                  {model.unavailable.map((item) => (
                                    <div
                                      key={item}
                                      className="px-[13px] rounded h-6 leading-6 bg-[#F9F9F9] text-[#AEAFB3] cursor-not-allowed"
                                      onClick={() =>
                                        Message.warning(
                                          t('Not enough VRAM', {
                                            size: item.size,
                                          })
                                        )
                                      }
                                    >
                                      {item.parameter}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        }
                      >
                        <div
                          className={`border-[0.5px] ml-[10px] border-[#03060E] rounded-[6px] w-[84px] text-[12px] font-500 h-[30px] text-center ${index === openSizeIndex ? 'bg-[#03060E]' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (index !== openSizeIndex) {
                              setOpenSizeIndex(index)
                            } else {
                              setOpenSizeIndex(-1)
                            }
                          }}
                        >
                          <div
                            className={`text-[#03060E] text-[10px] gap-[2px] flex items-center justify-center ${index === openSizeIndex ? 'text-[#fff]' : 'text-[#03060E]'}`}
                          >
                            {model.select_size?.parameter}
                            <Triangle
                              color={
                                index === openSizeIndex ? '#fff' : '#03060E'
                              }
                            />
                          </div>
                          <div className="text-[8px] text-[#AEAFB3]">
                            size:{model.select_size?.size}
                          </div>
                        </div>
                      </Popover>

                      <div
                        className={`border-[0.5px] ml-[10px] border-[#03060E] rounded-[6px] w-[84px] text-[12px] text-[#03060E] font-500 h-[30px] text-center leading-[28px] ${model.available.length ? '' : 'opacity-30 cursor-not-allowed'}`}
                        onClick={() => {
                          if (LLMConnectError) {
                            Message.error(t('Ollama service is not available'))
                            return
                          }
                          if (!model.available.length) {
                            Message.warning(
                              t('Not enough VRAM', {
                                size: model.select_size?.size,
                              })
                            )
                            return
                          }
                          handleDownload(model)
                        }}
                      >
                        {t('Download')}
                      </div>
                    </div>
                  </div>
                  <div className="border-t-[0.5px] border-[#ebebeb] w-full my-4" />
                </React.Fragment>
              ))}
          </div>
        </>
      ) : (
        <URLDownLoad
          LLMConnectError={LLMConnectError}
          ollamaModel={ollamaModel}
        />
      )}
    </div>
  )
}

export default ModelStorePage

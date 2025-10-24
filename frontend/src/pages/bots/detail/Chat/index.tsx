import {useAtom} from 'jotai'
import {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'

import HTMLArtifact from '~/components/artifacts/HTMLArtifact'
import SvgArtifact from '~/components/artifacts/SvgArtifact'
import ExtraModal from '~/components/chat/Messages/ExtraModal'
import StartPlan from '~/components/StartPlan/StartPlan'
import VariableForm from '~/components/VariableForm'
import {artifacts, openPlan} from '~/lib/stores'

import MessageContainer from './MessageContainer'

function BotDetailChat({
  detail,
  isSave,
  spaceId,
  showUpload,
  changeDetail,
  refresh,
  modelList,
}) {
  const {t} = useTranslation()
  const [tab, setTab] = useState('Preview')
  const [visibleExtra, setVisibleExtra] = useState(false)
  const [$artifacts, setArtifact] = useAtom(artifacts)
  const [extraInfo, setExtraInfo] = useState<any>({})
  const [$openPlan, setOpenPlan] = useAtom(openPlan)

  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const handleChangeValues = (vals) => {
    detail.inputs = vals
    changeDetail(detail)
  }

  const handleClickExtraItem = (info) => {
    if (visibleExtra && info.id === extraInfo.id) {
      setVisibleExtra(false)
      setExtraInfo({})
      return
    }

    setExtraInfo(info)
    setVisibleExtra(true)
  }

  useEffect(() => {
    setArtifact({
      type: '',
      content: '',
    })
    return () => {
      setOpenPlan(false)
    }
  }, [])

  return (
    <div
      className=" min-w-100 overflow-hidden relative flex-1 flex"
      style={{
        background: `url(${detail.background_img}) no-repeat center / 100% 100%`,
      }}
    >
      <div
        className={`${detail.background_img ? 'bg-black/20' : ''} flex flex-col  h-full flex-1`}
      >
        <div className="border-b-[0.5px] bg-white box-border p-4 h-12 flex items-center justify-between">
          <div className="flex items-center  h-12">
            <div
              className={`mr-6 shrink-0 h-full leading-[48px] cursor-pointer text-[14px] ${tab === 'Preview' ? 'font-500 text-[#03060E] ' : 'font-400 text-[#565759]'}`}
              onClick={() => {
                setTab('Preview')
              }}
            >
              {t('Preview')}
            </div>
            {detail?.model_config?.user_input_form?.length > 0 ? (
              <div
                className={`shrink-0 h-full  leading-[48px] cursor-pointer text-[14px] ${tab === 'Variable' ? 'font-500 text-[#03060E]' : 'font-400 text-[#565759]'}`}
                onClick={() => {
                  setTab('Variable')
                  setVisibleExtra(false)
                  setExtraInfo({})
                }}
              >
                {t('Variable')}
              </div>
            ) : null}
          </div>
        </div>
        <MessageContainer
          detail={detail}
          modelList={modelList}
          spaceId={spaceId}
          refresh={refresh}
          showUpload={showUpload}
          isSave={isSave}
          handleClickExtraItem={handleClickExtraItem}
          setLoading={setLoading}
          setSending={setSending}
        />
        {tab === 'Variable' ? (
          <div className="absolute w-full top-12 l-0 h-full pb-12 z-10">
            <VariableForm
              values={detail.inputs || {}}
              formList={detail?.model_config?.user_input_form || []}
              onChange={handleChangeValues}
            />
          </div>
        ) : null}
      </div>
      {tab === 'Preview' && visibleExtra && !$openPlan ? (
        <div className="absolute z-50 right-0 top-0 h-full">
          <ExtraModal
            type={
              extraInfo?.tool_type === 'mcp_tool' ? 'MCP Tools' : 'Knowledge'
            }
            info={extraInfo}
            style={{
              height: 'calc(100% - 180px)',
              boxShadow:
                '0px 2px 40px 0px #00000026, 0px 0px 15px 0px #0000001A',
            }}
            onClose={() => {
              setVisibleExtra(false)
              setExtraInfo({})
            }}
          />
        </div>
      ) : null}
      {$artifacts.type === 'html' || $artifacts.type === 'xml' ? (
        <div className="absolute z-50 right-0 top-0 h-[450px] w-1/2 flex-shrink-0 m-5 rounded-[20px] bg-[#F9F9F9] box-shadow: rgba(0, 0, 0, 0.15) 0px 2px 40px 0px, rgba(0, 0, 0, 0.1) 0px 0px 15px 0px">
          <HTMLArtifact className="border-none w-full" />
        </div>
      ) : null}
      {$artifacts.type === 'svg' ? (
        <div className="absolute z-50 right-0 top-0 h-[450px] w-1/2 flex-shrink-0 m-5 rounded-[20px] bg-[#F9F9F9] box-shadow: rgba(0, 0, 0, 0.15) 0px 2px 40px 0px, rgba(0, 0, 0, 0.1) 0px 0px 15px 0px">
          <SvgArtifact className="border-none w-full" />
        </div>
      ) : null}
      {$openPlan ? (
        <StartPlan
          visible={tab !== 'Preview'}
          visibleExtra={visibleExtra}
          extraInfo={extraInfo}
          setVisibleExtra={setVisibleExtra}
          setExtraInfo={setExtraInfo}
          loading={!loading}
          sending={sending}
          handleClickExtraItem={handleClickExtraItem}
        />
      ) : null}
    </div>
  )
}

export default BotDetailChat

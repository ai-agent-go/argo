import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Popover,
  Switch,
} from '@arco-design/web-react'
import {IconSettings} from '@arco-design/web-react/icon'
import {t} from 'i18next'
import {useAtom, useAtomValue} from 'jotai'
import {useEffect, useRef, useState} from 'react'

import CategoryList from '~/components/CategoryList'
import EditIcon from '~/components/icons/EditIcon'
import GarbageBin from '~/components/icons/GarbageBin'
import {showModal} from '~/components/Modal'
import AddModelInProvider from '~/components/settings/components/ModelProvider/ModelItem/AddModelInProvider'
import {providerVerify} from '~/lib/apis/models'
import {
  addModelInProviders,
  deleteModelInProviders,
  updateModelOfProvider,
} from '~/lib/apis/settings'
import {currentWorkspace, modelList, selectModelProvider} from '~/lib/stores'
import {validateFirstChar} from '~/utils'

import ConfirmAction from '../components/ConfirmAction'
import ModelSetting from '../components/ModelSetting'
import SelectCheckModel from '../components/SelectCheckModel'
import {useModelListActions} from '../hooks'
import AddModel from '../images/addModel'
import Delete from '../images/delete'
import RightTopArrow from '../images/rightTopArrow'
import Setting from '../images/setting'

import './index.css'

function SupplierModel({getModelProvider, setEditing, deleteProvider}) {
  const {updateModelList} = useModelListActions()
  const $currentWorkspace = useAtomValue(currentWorkspace)
  const [$modelList] = useAtom(modelList)
  const [$selectModelProvider, setSelectModelProvider] =
    useAtom(selectModelProvider)

  const [openEdit, setOpenEdit] = useState(false)
  const [openModelCheck, setOpenModelCheck] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openAddModel, setOpenAddModel] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [switchCheck, setSwitchCheck] = useState(false)
  const [switchUseful, setSwitchUseful] = useState(false)
  const [modelsOptions, setModelsOptions] = useState([])
  const [selectCheckModel, setSelectCheckModel] = useState(null)
  const [checking, setChecking] = useState(null)
  const [form] = Form.useForm()

  const selectModel = useRef(null)

  const handleDelete = async (item) => {
    await deleteModelInProviders($currentWorkspace.id, {
      provider: $selectModelProvider.provider,
      custom_name: $selectModelProvider.credentials.custom_name,
      model: item.model,
    })
    Message.success(t('Delete Success'))
    const filterModels =
      $selectModelProvider.credentials.support_chat_models.filter(
        (i) => i.model !== item.model
      )
    const filterCustomModels =
      $selectModelProvider.credentials.custom_chat_models.filter(
        (i) => i !== item.model
      )
    const filterEmbeddingModels =
      $selectModelProvider.credentials.support_embedding_models.filter(
        (i) => i.model !== item.model
      )
    const filterCustomEmbeddingModels =
      $selectModelProvider.credentials.custom_embedding_models.filter(
        (i) => i !== item.model
      )
    const model = $modelList.model_list.find(
      (i) => i.provider === $selectModelProvider.provider
    )
    // 编辑时界面保持key和url不变，但是没有检查之前不能更新key和URL
    $selectModelProvider.credentials.api_key = model.credentials.api_key
    $selectModelProvider.credentials.base_url = model.credentials.base_url
    $selectModelProvider.credentials.support_chat_models = filterModels
    $selectModelProvider.credentials.support_embedding_models =
      filterEmbeddingModels
    $selectModelProvider.credentials.custom_chat_models = filterCustomModels
    $selectModelProvider.credentials.custom_embedding_models =
      filterCustomEmbeddingModels
    updateModelList($selectModelProvider)
    const select = structuredClone($selectModelProvider)
    select.credentials.api_key = keyInput
    select.credentials.base_url = urlInput
    setSelectModelProvider(select)
  }

  const handleAddModel = async (v) => {
    const list = [
      ...$selectModelProvider.credentials.support_chat_models,
      ...$selectModelProvider.credentials.support_embedding_models,
    ].map((item) => item.model)
    if (list.includes(v.model)) {
      Message.warning(t('Already exists'))
      return
    }
    await addModelInProviders($currentWorkspace.id, {
      custom_name: $selectModelProvider.credentials.custom_name,
      provider: $selectModelProvider.provider,
      ...v,
    })
    Message.success(t('Add Success'))
    setOpenAddModel(false)
    // 编辑时界面保持key和url不变，但是没有检查之前不能更新key和URL
    const select = structuredClone($selectModelProvider)
    const model = $modelList.model_list.find(
      (item) => item.provider === select.provider
    )
    select.credentials.api_key = model.credentials.api_key
    select.credentials.base_url = model.credentials.base_url
    select.credentials.support_chat_models.push(v)
    select.credentials.custom_chat_models.push(v.model)
    updateModelList(select)
    const select1 = structuredClone(select)
    select1.credentials.api_key = keyInput
    select1.credentials.base_url = urlInput
    setSelectModelProvider(select1)
  }

  const changeConnect = async (e) => {
    await updateModelOfProvider(
      $currentWorkspace.id,
      $selectModelProvider.provider,
      '',
      e ? 1 : -1
    )
    Message.success(t('Set Success'))
    $selectModelProvider.credentials.enable = e ? 1 : -1
    setSelectModelProvider($selectModelProvider)
    updateModelList($selectModelProvider)
  }

  const handleSubmitSet = async (model, value, type) => {
    try {
      await addModelInProviders($currentWorkspace.id, {
        provider: $selectModelProvider.provider,
        model_type: type,
        custom_name: $selectModelProvider.custom_name,
        model: model.model,
        category: value,
        method: 'change',
      })
      getModelProvider()
      Message.success(t('Set Success'))
    } catch (err) {
      Message.error(err.msg || 'Server error, try again later')
    }
  }

  const handleSetting = (item) => {
    showModal(
      ({closeMask, getPopupContainer}) => (
        <ModelSetting
          value={item?.category?.category_label}
          handleSubmit={(val, type) => {
            handleSubmitSet(item, val, type)
          }}
          getPopupContainer={getPopupContainer}
          handleClose={closeMask}
        />
      ),
      {
        maskStyle: {
          background: 'transparent',
        },
        maskClosable: false,
      }
    )
  }

  const modelItem = (item, index) => {
    return (
      <div
        className="flex mb-5 items-center justify-between"
        key={`${item.model}-${index}`}
      >
        <div className="flex gap-1 items-center ">
          <img
            src={$selectModelProvider.credentials.icon_url}
            alt=""
            className="w-6 h-6 rounded-[3px] mr-1"
          />
          <div className="text-[#03060E]">{item.model}</div>
          {item.tags?.length ? (
            <div className="border border-[#EBEBEB] bg-[#FFFFFF99] text-[10px] text-[#8B8B8C] px-[6px] h-[18px] leading-[18px] rounded">
              {item.tags.map((i) => i)}
            </div>
          ) : null}
          <CategoryList list={item?.category?.category_label?.category || []} />
        </div>
        <div className="flex justify-end items-center">
          <div
            className="cursor-pointer mr-[10px] w-[18px] h-[18px]"
            onClick={() => handleSetting(item)}
          >
            <IconSettings className="w-[18px] h-[18px]" />
          </div>
          <div className="cursor-pointer" onClick={() => handleDelete(item)}>
            <Delete />
          </div>
        </div>
      </div>
    )
  }

  const toCheck = async (modelName) => {
    setOpenModelCheck(false)
    try {
      const select = structuredClone($selectModelProvider)
      select.credentials.base_url = urlInput
      select.credentials.api_key = keyInput
      setChecking(select.credentials.custom_name || select.provider)
      const res = await providerVerify(
        $currentWorkspace.id,
        select.provider,
        select.credentials,
        modelName
      )
      setChecking(null)
      if (res?.status) {
        Message.success(t('Check Success'))
        setSwitchUseful(true)
        select.credentials.enable = 1
        setSelectModelProvider(select)
        updateModelList(select)
      } else {
        Message.error(res.msg || 'Server error, try again later')
        setSwitchUseful(false)
      }
    } catch (err) {
      setChecking(null)
      Message.error(err.msg || 'Server error, try again later')
      setSwitchUseful(false)
    }
  }

  const checkProvider = async () => {
    if (!keyInput) {
      Message.error(t('API key missing'))
      return
    }
    if (!urlInput) {
      Message.error(t('Base URL missing'))
      return
    }
    if (
      !$selectModelProvider.credentials.support_chat_models.length &&
      !$selectModelProvider.credentials.support_embedding_models.length
    ) {
      Message.error(t('Please add the model first before checking'))
      return
    }
    setEditing(false)
    if ($selectModelProvider.provider.includes('openai-api-compatible')) {
      setOpenModelCheck(true)
      const supportModelName =
        $selectModelProvider.credentials.support_chat_models.map(
          (item) => item.model
        )
      setModelsOptions(supportModelName)
      setSelectCheckModel(supportModelName[supportModelName.length - 1])
    } else {
      toCheck(null)
    }
  }

  const editNameSave = async (value) => {
    setOpenEdit(false)
    await updateModelOfProvider(
      $currentWorkspace.id,
      $selectModelProvider.provider,
      value.custom_name,
      null
    )
    $selectModelProvider.credentials.custom_name = value.custom_name
    setSelectModelProvider(structuredClone($selectModelProvider))
    Message.success(t('Set Success'))
    getModelProvider()
  }

  useEffect(() => {
    setKeyInput($selectModelProvider.credentials.api_key)
    setUrlInput($selectModelProvider.credentials.base_url)
    const isConnect = $selectModelProvider.credentials.enable > 0
    setSwitchCheck(isConnect)
    if (
      selectModel.current?.provider !== $selectModelProvider.provider ||
      selectModel.current?.credentials?.custom_name !==
        $selectModelProvider.credentials.custom_name
    ) {
      setSwitchUseful(false)
    }
    if (!switchUseful) {
      setSwitchUseful(isConnect)
    }
    selectModel.current = $selectModelProvider
  }, [$selectModelProvider, $modelList])

  return (
    <div className="w-full">
      <div className="flex h-[82px] border-b-[0.5px] border-[#ebebeb] items-center px-5 justify-between w-full">
        <div className="text-[#03060E] font-700 text-[28px] flex items-center">
          {$selectModelProvider.credentials.custom_name ||
            t($selectModelProvider.label)}
          {$selectModelProvider.provider.includes('openai-api-compatible') && (
            <Popover
              trigger="click"
              content={
                <div className="my-[-4px] mx-[-8px]">
                  <div
                    className="mb-1 w-[124px] h-9 flex items-center gap-[5px] pl-2 hover:bg-[#F9F9F9] cursor-pointer rounded-md "
                    onClick={() => {
                      form.setFieldsValue({
                        custom_name:
                          $selectModelProvider.credentials.custom_name,
                      })
                      setOpenEdit(true)
                    }}
                  >
                    <EditIcon /> {t('Edit')}
                  </div>
                  <div
                    className="mb-1 w-[124px] h-9 flex items-center gap-[5px] pl-2 hover:bg-[#F9F9F9] cursor-pointer rounded-md"
                    onClick={() => setOpenDelete(true)}
                  >
                    <GarbageBin strokeWidth="2" />
                    {t('Delete')}
                  </div>
                </div>
              }
            >
              <div
                className="text-ellipsis overflow-hidden text-nowrap text-[#03060e]"
                aria-describedby="tippy-10"
              >
                <Setting className="ml-[10px]" />
              </div>
            </Popover>
          )}
        </div>
        <Switch
          className="h-6 w-11"
          color="#133EBF"
          checked={switchCheck}
          onChange={(e) => changeConnect(e)}
          disabled={!switchUseful && !switchCheck}
        />
      </div>
      <div className="m-5">
        <div>
          <div className="text-[16px] text-[#03060e] font-500 mb-3 flex">
            {t('API Key')}
            {!$selectModelProvider.provider.includes(
              'openai-api-compatible'
            ) && (
              <a
                className="text-[#133EBF] ml-3 flex items-center text-[14px]"
                href={$selectModelProvider.credentials.link_url}
                target="_blank"
                rel="noreferrer"
              >
                {t('Get API Key')}
                <RightTopArrow />
              </a>
            )}
          </div>
          <div className="flex">
            <Input.Password
              value={keyInput}
              onChange={(e) => {
                setEditing(true)
                setKeyInput(e)
              }}
              className="h-11 rounded-l-lg border-[#ebebeb] border"
              placeholder={t('Enter your API Key')}
            />
            <div
              className={`text-[#133EBF] h-11 flex gap-1 leading-[44px] w-[87px] rounded-r-lg bg-[#F2F6FF] border border-[#ebebeb] items-center justify-center font-600 ${
                [
                  $selectModelProvider.provider,
                  $selectModelProvider.credentials.custom_name,
                ].includes(checking)
                  ? 'opacity-60 pointer-events-none'
                  : 'cursor-pointer'
              }`}
              onClick={checkProvider}
            >
              <span>
                {t(
                  [
                    $selectModelProvider.provider,
                    $selectModelProvider.credentials.custom_name,
                  ].includes(checking)
                    ? 'Checking...'
                    : 'Check'
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="mb-3 text-[16px] text-[#03060e] font-500">
            {t('API URL')}
          </div>
          <div className="flex">
            <Input
              className={`h-11 rounded-l-lg pl-3 border-[#ebebeb] border bg-transparent ${$selectModelProvider.provider.includes('openai-api-compatible') ? 'rounded-r-lg' : ''}`}
              placeholder={t('Enter your API URL')}
              value={urlInput}
              onChange={(e) => {
                setEditing(true)
                setUrlInput(e)
              }}
            />
            {!$selectModelProvider.provider.includes(
              'openai-api-compatible'
            ) && (
              <div
                className="text-[#133EBF] h-11 flex gap-1 leading-[44px] w-[87px] rounded-r-lg bg-[#F2F6FF] border border-[#ebebeb] items-center justify-center cursor-pointer font-600"
                onClick={() =>
                  setUrlInput($selectModelProvider.credentials.origin_url)
                }
              >
                <span className="">{t('Reset')}</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between mt-3">
            <div className="font-500 text-[16px] text-[#03060e]">
              {$selectModelProvider.credentials.support_chat_models.length +
                $selectModelProvider.credentials.support_embedding_models
                  .length}
              &nbsp;&nbsp;{t('Models')}
            </div>
            <div
              className="text-[#133EBF] text-[16px] flex items-center cursor-pointer gap-1"
              onClick={() => setOpenAddModel(true)}
            >
              <AddModel />
              {t('Add New Model')}
            </div>
          </div>
          {$selectModelProvider.credentials.support_chat_models?.length > 0 ||
          $selectModelProvider.credentials.support_embedding_models?.length >
            0 ? (
            <div className="border border-[#ebebeb] bg-[#F9F9F9] rounded-lg px-[14px] pt-5 mt-3 max-h-[calc(100vh-400px)] overflow-y-auto">
              {[
                ...$selectModelProvider.credentials.support_chat_models,
                ...$selectModelProvider.credentials.support_embedding_models,
              ]
                .map((item, index) => modelItem(item, index))}
            </div>
          ) : null}
        </div>
      </div>

      <Modal
        className="w-[500px] rounded-xl"
        visible={openEdit}
        closable={false}
        footer={null}
      >
        <div>
          <div className="text-[#03060E] h-6 leading-6 font-600 mb-2 text-[18px]">
            {t('Edit')}
          </div>
          <div className="text-[#565759] text-[12px]">
            {t('Custom name maximum length is 15 characters')}
          </div>
          <Form form={form} onSubmit={editNameSave} layout="vertical">
            <Form.Item
              field="custom_name"
              className="mb-4"
              rules={[
                {required: true, message: t('Please input your custom name')},
                {validator: validateFirstChar},
              ]}
              requiredSymbol={false}
            >
              <Input
                maxLength={15}
                placeholder={t('Enter custom name')}
                className="rounded-lg border border-[#EBEBEB] h-[42px] pl-[14px] w-full mt-4 bg-[#fff]"
              />
            </Form.Item>
          </Form>
          <div className="mt-5 flex justify-end">
            <Button
              className="bg-[#AEAFB34D] text-[#03060E] h-[38px] w-[79px] rounded-lg text-[16px]"
              onClick={() => setOpenEdit(false)}
            >
              {t('Cancel')}
            </Button>
            <Button
              className="bg-[#133EBF] text-[#fff] h-[38px] w-[79px] rounded-lg text-[16px] ml-2"
              onClick={() => form.submit()}
            >
              {t('Save')}
            </Button>
          </div>
        </div>
      </Modal>

      <SelectCheckModel
        openModelCheck={openModelCheck}
        setOpenModelCheck={setOpenModelCheck}
        modelsOptions={modelsOptions}
        toCheck={() => toCheck(selectCheckModel)}
        setSelectCheckModel={setSelectCheckModel}
        selectCheckModel={selectCheckModel}
      />

      <ConfirmAction
        onClose={() => setOpenDelete(false)}
        onOK={() => {
          setOpenDelete(false)
          deleteProvider()
        }}
        visible={openDelete}
        text={t('This action cannot be undone.Do you wish to continue?')}
      />
      <AddModelInProvider
        visible={openAddModel}
        onClose={() => setOpenAddModel(false)}
        onSubmit={handleAddModel}
      />
    </div>
  )
}

export default SupplierModel

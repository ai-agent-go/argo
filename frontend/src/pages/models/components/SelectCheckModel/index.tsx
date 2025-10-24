import {Button, Modal, Select} from '@arco-design/web-react'
import {IconClose} from '@arco-design/web-react/icon'
import {t} from 'i18next'

function SelectCheckModel({
  openModelCheck,
  setOpenModelCheck,
  modelsOptions,
  toCheck,
  setSelectCheckModel,
  selectCheckModel,
}) {
  return (
    <Modal
      className="w-[520px] rounded-xl"
      visible={openModelCheck}
      footer={null}
      closable={false}
      onCancel={() => setOpenModelCheck(false)}
      closeIcon={
        <IconClose type="close" style={{fontSize: '20px', color: '#565759'}} />
      }
    >
      <div>
        <div className="text-[#03060E] h-6 leading-6 font-600 text-[18px] mb-[30px]">
          {t('Please select the model to be checked')}
        </div>
        <Select
          className="w-[460px] leading-[46px] bg-[transparent] rounded-[8px] border-[0.5px] border-[#AEAFB366] h-[46px] pt-[7px]"
          onChange={(value) => setSelectCheckModel(value)}
          value={selectCheckModel}
          bordered={false}
        >
          {modelsOptions.map((option) => (
            <Select.Option key={option} value={option}>
              {option}
            </Select.Option>
          ))}
        </Select>
        <div className="mt-5 flex justify-end">
          <Button
            className="bg-[#AEAFB34D] text-[#03060E] h-[38px] w-[79px] rounded-lg text-[16px]"
            onClick={() => setOpenModelCheck(false)}
          >
            {t('Cancel')}
          </Button>
          <Button
            className="bg-[#133EBF] text-[#fff] h-[38px] w-[79px] rounded-lg text-[16px] ml-2"
            onClick={toCheck}
          >
            {t('OK')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default SelectCheckModel

import {Button, Modal} from '@arco-design/web-react'
import {useTranslation} from 'react-i18next'

function AddVariableNotice({
  variableList,
  setShowVariableNotice,
  showVariableNotice,
}) {
  const {t} = useTranslation()
  return (
    <div>
      <Modal
        title={null}
        visible={showVariableNotice}
        onCancel={() => {
          setShowVariableNotice(false)
        }}
        footer={
          <Button onClick={() => setShowVariableNotice(false)} type="primary">
            {t('OK')}
          </Button>
        }
      >
        <div>
          {t(
            'An undefined variable has been referenced. Please add a variable or tool to define the variable'
          )}
        </div>
        <div className="flex gap-1">
          {variableList.map((item) => (
            <div key={item} className="bg-blue-100 leading-normal rounded">
              {item}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}

export default AddVariableNotice

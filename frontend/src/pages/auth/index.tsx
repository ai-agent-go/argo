import {Button, Form, Input, Message} from '@arco-design/web-react'
import {useAtomValue, useSetAtom} from 'jotai'
import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'

import {userSignIn, userSignUp} from '~/lib/apis/auths'
import {LOGO} from '~/lib/constants'
import {currentWorkspace, WEBUI_NAME, workspaces} from '~/lib/stores'

const FormItem = Form.Item

function Auth() {
  const history = useHistory()
  const setWorkspaces = useSetAtom(workspaces)
  const setCurrentSpace = useSetAtom(currentWorkspace)
  const {t} = useTranslation()
  const [mode, setMode] = useState('signIn')

  const $WEBUI_NAME = useAtomValue(WEBUI_NAME)

  const setSessionUser = async (sessionUser) => {
    if (sessionUser) {
      Message.success(t(`You're now logged in.`))
      if (sessionUser.token) {
        localStorage.token = sessionUser.token
      }
      setWorkspaces([])
      setCurrentSpace({id: 0, name: '', current: false})
      history.replace('/space')
    }
  }

  const signInHandler = async ({email, password}) => {
    try {
      const sessionUser = await userSignIn(email, password)
      localStorage.email = email
      await setSessionUser(sessionUser)
    } catch (error) {
      Message.error(error.msg || 'Server error, try again later')
    }
  }

  const signUpHandler = async ({name, email, password}) => {
    try {
      const sessionUser = await userSignUp(name, email, password)
      localStorage.email = email
      await setSessionUser(sessionUser)
    } catch (error) {
      Message.error(error.msg || 'Server error, try again later')
    }
  }

  const submitHandler = async (val) => {
    if (mode === 'signIn') {
      await signInHandler(val)
    } else {
      await signUpHandler(val)
    }
  }

  const renderContent = () => {
    return (
      <div className="  my-auto pb-10 w-full">
        <Form
          className=" flex flex-col justify-center"
          onSubmit={submitHandler}
          layout="vertical"
        >
          <div className="mb-1">
            <div className=" text-2xl font-600">
              {mode === 'signIn' ? t('Sign in') : t('Sign up')}
              {t(' to ')}
              {$WEBUI_NAME}
            </div>
            {mode === 'signup' ? (
              <div className=" mt-1 text-xs font-600 text-gray-500">
                ⓘ
                {t(
                  'Argo does not make any external connections, and your data stays securely on your locally hosted server.'
                )}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col mt-4">
            {mode === 'signup' ? (
              <div>
                <FormItem
                  label={t('Name')}
                  field="name"
                  rules={[{required: true}]}
                  className="text-sm font-600 text-left"
                  requiredSymbol={false}
                >
                  <Input
                    type="text"
                    className=" px-5 py-3 rounded-2xl w-full text-sm outline-none border"
                    placeholder={t('Enter Your Full Name')}
                  />
                </FormItem>

                <hr className=" my-3 " />
              </div>
            ) : null}

            <div className="mb-2">
              <FormItem
                label={t('Email')}
                field="email"
                rules={[{required: true}]}
                className="text-sm font-600 text-left"
                requiredSymbol={false}
              >
                <Input
                  type="email"
                  className=" px-5 py-3 mt-1 rounded-2xl w-full text-sm outline-none border"
                  placeholder={t('Enter Your Email')}
                />
              </FormItem>
            </div>

            <div>
              <FormItem
                label={t('Password')}
                field="password"
                rules={[{required: true}]}
                className="text-sm font-600 text-left"
                requiredSymbol={false}
              >
                <Input
                  type="password"
                  className=" px-5 py-3 mt-1 rounded-2xl w-full text-sm outline-none border"
                  placeholder={t('Enter Your Password')}
                />
              </FormItem>
            </div>
          </div>

          <div className="mt-5">
            <button
              className=" bg-gray-900 hover:bg-gray-800 w-full rounded-2xl text-white font-600 text-sm py-3 transition"
              type="submit"
              aria-label="submit"
            >
              {mode === 'signIn' ? t('Sign in') : t('Create Account')}
            </button>
            <div className=" mt-4 text-sm text-center">
              {mode === 'signIn'
                ? t("Don't have an account?")
                : t('Already have an account?')}

              <Button
                className=" font-600 underline"
                type="text"
                onClick={() => {
                  if (mode === 'signIn') {
                    setMode('signup')
                  } else {
                    setMode('signIn')
                  }
                }}
              >
                {mode === 'signIn' ? t('Sign up') : t('Sign in')}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    )
  }

  return (
    <div style={{display: 'contents'}}>
      <div className="fixed m-10 z-50">
        <div className="flex space-x-2">
          <div className="self-center">
            <img
              crossOrigin="anonymous"
              src={LOGO}
              className=" w-8 rounded-full"
              alt="logo"
            />
          </div>
        </div>
      </div>
      <div className=" bg-white min-h-screen w-full flex justify-center font-mona">
        <div className="w-full sm:max-w-md px-10 min-h-screen flex flex-col text-center">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default Auth

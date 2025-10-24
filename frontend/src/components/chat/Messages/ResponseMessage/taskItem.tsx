import {t} from 'i18next'
import {jsonrepair} from 'jsonrepair'
import {useEffect, useState} from 'react'

export default function TaskItem({message}) {
  const [messagePlan, setMessagePlan] = useState(null)

  useEffect(() => {
    if (message) {
      try {
        const parsed = JSON.parse(message)
        setMessagePlan(parsed)
      } catch (err) {
        const repaired = jsonrepair(message)
        setMessagePlan(JSON.parse(repaired))
      }
    }
  }, [message])

  const taskStep = (obj, index) => {
    const isCompleted = !!obj?.execution_res

    return (
      <div
        key={index}
        className={`p-4 mb-3 bg-white rounded-lg shadow-sm border-l-4 ${
          isCompleted ? 'border-green-400' : 'border-green-200'
        } transition-colors flex items-start`}
      >
        {/* 状态指示器 */}
        <div
          className={`mr-3 mt-0.5 flex-shrink-0 ${
            isCompleted ? 'text-green-500' : 'text-gray-400'
          }`}
        >
          {isCompleted ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="10" cy="10" r="8" />
            </svg>
          )}
        </div>

        <div className="flex-grow">
          <div
            className={`font-semibold ${
              isCompleted ? 'text-gray-600' : 'text-gray-800'
            } mb-1`}
          >
            {obj?.title}
          </div>
          <div className="text-gray-600 text-sm">{obj?.description}</div>
          {isCompleted && (
            <div className="mt-2 text-xs text-green-600 bg-green-50 inline-block px-2 py-1 rounded">
              {t('Completed')}
            </div>
          )}
        </div>
      </div>
    )
  }

  return message ? (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {messagePlan?.title}
        </h2>
        <p className="text-gray-600 italic">{messagePlan?.thought}</p>
      </div>

      <div className="mt-6">
        <div className="space-y-3">
          {messagePlan?.steps?.map((step, index) => taskStep(step, index))}
        </div>
      </div>
    </div>
  ) : null
}

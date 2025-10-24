import balance from '~/pages/assets/balance.svg'
import creativity from '~/pages/assets/creativity.svg'
import precision from '~/pages/assets/precision.svg'

export const PRESET_VALUE = [
  {
    label: 'Creativity',
    icon: creativity,
    value: {
      temperature: 0.8,
      top_p: 0.9,
      num_ctx: 4096,
      num_predict: -1,
      presence_penalty: 0.1,
      repeat_last_n: 64,
      frequency_penalty: 0.1,
    },
  },
  {
    label: 'Balance',
    icon: balance,
    value: {
      temperature: 0.5,
      top_p: 0.85,
      num_ctx: 4096,
      num_predict: -1,
      presence_penalty: 0.2,
      repeat_last_n: 64,
      frequency_penalty: 0.3,
    },
  },
  {
    label: 'Precision',
    icon: precision,
    value: {
      temperature: 0.2,
      top_p: 0.75,
      num_ctx: 4096,
      num_predict: -1,
      presence_penalty: 0.5,
      repeat_last_n: 64,
      frequency_penalty: 0.5,
    },
  },
]

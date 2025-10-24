import {Enum} from '~/utils/Enum'

import DropdownIcon from './assets/DropdownIcon'
import NumberIcon from './assets/NumberIcon'
import ParagraphIcon from './assets/ParagraphIcon'
import TextIcon from './assets/TextIcon'
//  }
export const VARIABLE_TYPES = new Enum({
  text: {text: 'Text', value: 'text-input'},
  paragraph: {text: 'Paragraph', value: 'paragraph'},
  dropdown: {text: 'Drop-Down', value: 'select'},
  number: {text: 'Number', value: 'number'},
})

export const VARIABLE_ICONS = {
  text: TextIcon,
  paragraph: ParagraphIcon,
  dropdown: DropdownIcon,
  number: NumberIcon,
}

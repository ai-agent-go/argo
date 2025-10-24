import FileIcon from './FileIcon'
import JPGIcon from './ic_jpg'
import PdfIcon from './ic_pdf'
import PNGIcon from './ic_png'
import PPTIcon from './ic_ppt'
import TxtIcon from './ic_txt'
import WordIcon from './ic_word'
import XLSXIcon from './ic_xslx'
import YamlFileIcon from './YamlFileIcon'

function FileIcons({type = '', className = ''}) {
  if (type.includes('md')) return <FileIcon className={className} />
  if (type.includes('jpg') || type.includes('jpeg'))
    return <JPGIcon className={className} />
  if (type.includes('png')) return <PNGIcon className={className} />
  if (type.includes('ppt')) return <PPTIcon className={className} />
  if (type.includes('xls')) return <XLSXIcon className={className} />
  if (type.includes('yml')) return <YamlFileIcon className={className} />
  if (type.includes('doc')) return <WordIcon className={className} />
  if (type.includes('txt')) return <TxtIcon className={className} />
  if (type.includes('pdf')) return <PdfIcon className={className} />
  return <FileIcon className={className} />
}

export default FileIcons

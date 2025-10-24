export const checkInterruptOptions = (answer) => {
  if (!answer) {
    return null
  }

  try {
    // 移除换行符和多余空格，提取JSON
    const cleanAnswer = answer.replace(/\n/g, '').replace(/\s+/g, ' ').trim()
    const jsonMatch = cleanAnswer.match(/\{.*\}/)

    if (jsonMatch) {
      const jsonData = JSON.parse(jsonMatch[0])
      if (jsonData.finish_reason === 'interrupt' && jsonData.options) {
        return jsonData.options
      }
    }
  } catch (error) {
    console.error('Failed to parse interrupt JSON:', error)
  }

  return null
}

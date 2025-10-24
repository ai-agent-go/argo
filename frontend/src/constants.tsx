export const ERROR_CODE = {
  [-301]: ({workspaceId}) => (
    <a
      href={`/space/${workspaceId}/models/store`}
      rel="noreferrer"
      className="text-blue-600"
    >
      Click to Download
    </a>
  ),
  [-302]: ({workspaceId, botId}) => (
    <a
      href={`/space/${workspaceId}/bot/${botId}`}
      rel="noreferrer"
      className="text-blue-600"
    >
      Click to Configure
    </a>
  ),
  [-304]: ({workspaceId, botId}) => (
    <a
      href={`/space/${workspaceId}/bot/${botId}`}
      rel="noreferrer"
      className="text-blue-600"
    >
      Click to Modify
    </a>
  ),
}

export const ERROR_MSG = 'Server error, try again later'

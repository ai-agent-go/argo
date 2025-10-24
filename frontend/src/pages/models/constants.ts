export const FAILED_MODEL_UPDATE_STATUS = {
  download_failed: 'downloading',
  convert_failed: 'download_complete',
  import_failed: 'convert_complete',
}

export const STATUS_TYPE = {
  download_ready: 'downloading',
  download_waiting: 'downloading',
  downloading: 'downloading',
  download_complete: 'downloading',
  convert_complete: 'downloading',
  import_complete: 'downloading',
  all_complete: 'complete',
  download_failed: 'fail',
  convert_failed: 'fail',
  import_failed: 'fail',
  too_large_failed: 'fail',
  not_available: 'fail',
  delete: 'delete',
  download_pause: 'download_pause',
  environment_incompatible: 'incompatible',
}

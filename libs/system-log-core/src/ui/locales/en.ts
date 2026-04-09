export const messages = {
  'system_log.viewer.loading': 'Loading logs\u2026',
  'system_log.viewer.loading_older': 'Loading older logs\u2026',
  'system_log.viewer.empty': 'No logs found.',
  'system_log.viewer.beginning': '--- Beginning of logs ---',
  'system_log.viewer.title': 'System Logs',
  'system_log.toolbar.search_placeholder': 'Search logs\u2026',
  'system_log.toolbar.search_aria': 'Search log messages',
  'system_log.toolbar.download_aria': 'Download logs',
  'system_log.toolbar.log_count': '{count} logs',
  'system_log.filter.all_levels': 'All levels',
  'system_log.filter.levels_selected': 'Levels ({count})',
  'system_log.filter.level_trace': 'Trace',
  'system_log.filter.level_debug': 'Debug',
  'system_log.filter.level_info': 'Info',
  'system_log.filter.level_warn': 'Warn',
  'system_log.filter.level_error': 'Error',
  'system_log.filter.level_fatal': 'Fatal',
} as const;

export type MessageKey = keyof typeof messages;

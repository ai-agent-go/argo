export const MODEL_TYPES = [
  {
    type: 'chat',
    name: 'Chat model',
    category: [
      {
        category: 'tools',
        label: '\u5de5\u5177',
        prompt:
          '\u8868\u793a\u8be5\u6a21\u578b\u652f\u6301\u51fd\u6570\u8c03\u7528\u80fd\u529b\uff08Function Call\uff09\uff0c\u80fd\u591f\u4f7f\u7528\u5de5\u5177',
        icon: '/api/files/resources/icons/tool.svg',
        icon_color: '/api/files/resources/icons/tool_color.svg',
      },
      {
        category: 'vision',
        label: 'Vision',
        prompt:
          '\u8868\u793a\u8be5\u6a21\u578b\u652f\u6301\u89c6\u89c9\u8bc6\u522b\u80fd\u529b\uff0c\u80fd\u591f\u7406\u89e3\u56fe\u50cf\u5185\u5bb9',
        icon: '/api/files/resources/icons/vision.svg',
        icon_color: '/api/files/resources/icons/vision_color.svg',
      },
    ],
  },
  {
    type: 'embedding',
    name: 'Knowledge Base Model',
    category: [
      {
        category: 'embedding',
        label: 'Embedding',
        prompt:
          '\u8868\u793a\u8be5\u6a21\u578b\u4ec5\u7528\u4e8e\u77e5\u8bc6\u5e93\u7684\u6587\u672c\u5411\u91cf\u5316',
        icon: '/api/files/resources/icons/embedding.svg',
        icon_color: '/api/files/resources/icons/embedding_color.svg',
      },
    ],
  },
]

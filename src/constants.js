const ColumnTypes = {
  NUMBER: 'number',
  TEXT: 'text',
  LONG_TEXT: 'long-text',
  CHECKBOX: 'checkbox',
  DATE: 'date',
  SINGLE_SELECT: 'single-select',
  MULTIPLE_SELECT: 'multiple-select',
  IMAGE: 'image',
  FILE: 'file',
  COLLABORATOR: 'collaborator',
  LINK: 'link',
  LINK_FORMULA: 'link-formula',
  FORMULA: 'formula',
  CREATOR: 'creator',
  CTIME: 'ctime',
  LAST_MODIFIER: 'last-modifier',
  MTIME: 'mtime',
  GEOLOCATION: 'geolocation',
  AUTO_NUMBER: 'auto-number',
  URL: 'url',
};

const DATE_FORMAT_MAP = {
  YYYY_MM_DD: 'YYYY-MM-DD',
  YYYY_MM_DD_HH_MM: 'YYYY-MM-DD HH:mm',
  YYYY_MM_DD_HH_MM_SS: 'YYYY-MM-DD HH:mm:ss'
};

export {
  ColumnTypes,
  DATE_FORMAT_MAP,
};
             
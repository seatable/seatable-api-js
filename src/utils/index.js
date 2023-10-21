import axios from "axios";
import { ColumnTypes } from "../constants";
import { getDateDisplayString } from "./date";

const getAccessToken = (config) => {
  const { server, APIToken } = config;
  const url = server + '/api/v2.1/dtable/app-access-token/';
  const headers = { 'Authorization': 'Token ' + APIToken };
  return axios.get(url, { headers: headers });
};

const formatQueryResult = (result) => {
  const { metadata: columns, results: rows } = result;
  const columnMap = columns.reduce((keyMap, column) => {
    if (column.type === ColumnTypes.SINGLE_SELECT || column.type === ColumnTypes.MULTIPLE_SELECT) {
      const { options = [] } = column.data || {};
      let options_map = {};
      options.forEach(option => {
        options_map[option.id] = option.name;
      });
      column.options_map = options_map;
    }
    keyMap[column.key] = column;
    return keyMap;
  }, {});

  let formatRows = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const formatRow = {};
    formatRow['_id'] = row._id;
    Object.keys(row).forEach(key => {
      if (columnMap[key]) {
        const { name, type, options_map, data = {} } = columnMap[key];
        let cellValue = row[key];
        switch(type) {
          case ColumnTypes.SINGLE_SELECT: {
            cellValue = options_map[cellValue];
            break;
          }
          case ColumnTypes.MULTIPLE_SELECT: {
            if (!Array.isArray(cellValue)) return [];
            cellValue = cellValue.map(key => options_map[key]);
            break;
          }
          case ColumnTypes.LINK:
          case ColumnTypes.LINK_FORMULA: {
            if (!Array.isArray(cellValue)) {
              cellValue = [];
            } else {
              cellValue = cellValue.map(item => item.display_value);
            }
            break;
          }
          case ColumnTypes.DATE: {
            if (cellValue) {
              const { format } = data;
              cellValue = getDateDisplayString(cellValue, format);
            }
            break;
          }
          default: {
            cellValue = row[key];
            break;
          }
        }
        formatRow[name] = cellValue;
      }
    });
    formatRows.push(formatRow);
  }
  return formatRows;
}

export {
  getAccessToken,
  formatQueryResult
}

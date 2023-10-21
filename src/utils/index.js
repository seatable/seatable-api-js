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
  const { meta_data, results } = result;
  const columnMap = meta_data.map(column => {
    if (column.type === ColumnTypes.SINGLE_SELECT || column.type === ColumnTypes.MULTIPLE_SELECT) {
      const { options = [] } = column.data || {};
      let options_map = {};
      options.forEach(option => {
        options_map[option.id] = option.name;
      });
      column.options_map = options_map;
    }
    return { [column.key]: column };
  });

  let rows = [];
  for (let i = 0; i < results.length; i++) {
    const row = results[i];
    const newRow = {};
    newRow['_id'] = row._id;
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
              cellValue = cellValue && cellValue.display_value;
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
        newRow[name] = cellValue;
      }
    });
    rows.push(newRow);
  }
  return rows;
}

export {
  getAccessToken,
  formatQueryResult
}

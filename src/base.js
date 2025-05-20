import axios from 'axios';
import APIGateway from './api-gateway';
import { formatQueryResult, getAccessToken } from './utils';

class Base {

  constructor(config) {
    this.config = config;
    this.appName = '';
    this.accessToken = '';
    this.dtableServer = '';
    this.dtableSocket = '';
    this.dtableDB = '';
    this.lang = 'en';
    this.req = null;
    this.apiGateway = null;
  }

  async auth() {
    const response = await getAccessToken(this.config);
    const {
      app_name,
      access_token,
      dtable_uuid,
      dtable_server = '',
      dtable_socket = '',
      dtable_db = '',
      use_api_gateway = false,
    } = response.data;
    this.appName = app_name;
    this.accessToken = access_token;
    this.dtableServer = dtable_server;
    this.dtableSocket = dtable_socket;
    this.dtableUuid = dtable_uuid;
    this.dtableDB = dtable_db;

    // api gateway entry
    if (use_api_gateway) {
      this.apiGateway = new APIGateway({
        token: access_token,
        server: this.config.server,
        dtable_uuid,
      });
      this.useApiGatewayWrapper();
    }

    if (this.dtableServer) {
      this.req = axios.create({
        baseURL: this.dtableServer,
        headers: { Authorization: 'Token ' + this.accessToken }
      });
      this.req.interceptors.response.use(response => {
        const result = this.getResult(response);
        return result;
      }, error => {
        return Promise.reject(error);
      });
    }

    if (!use_api_gateway && !this.dtableServer) {
      throw new Error('dtable_server is required when not using API Gateway.');
    }
  }

  useApiGatewayWrapper() {
    [
      // dtable
      this.getDTable, this.getMetadata,

      // table
      this.addTable, this.renameTable, this.deleteTable,

      // view
      this.listViews, this.getViewByName, this.addView, this.renameView, this.deleteView,

      // column
      this.listColumns, this.insertColumn, this.renameColumn, this.resizeColumn, this.freezeColumn,
      this.moveColumn, this.modifyColumnType, this.addColumnOptions, this.addColumnCascadeSettings,
      this.deleteColumn,

      // row
      this.listRows, this.getRow, this.appendRow, this.batchAppendRows, this.insertRow,
      this.updateRow, this.batchUpdateRows, this.deleteRow, this.batchDeleteRows,

      // link
      this.addLink, this.removeLink, this.updateLink, this.batchUpdateLinks, this.getLinkedRecords,

      // query
      this.query,
    ].forEach((func) => {
      if (func && Object.prototype.toString.call(func) === '[object Function]') {
        const funcName = func.name;
        this[funcName] = this.apiGatewayWrapper(func);
      }
    });
  }

  apiGatewayWrapper(func) {
    return (...args) => {
      const funcName = func.name;
      const apiGatewayFunc = this.apiGateway && this.apiGateway[funcName];
      if (apiGatewayFunc) {
        return apiGatewayFunc.apply(this.apiGateway, args);
      }
      return func.apply(this, args);
    }
  }

  getResult(response) {
    const { data, config } = response;
    const { method, url } = config;
    const paths = url.split('/');
    const lastPath = paths[paths.length - 2];
    let result = data;
    if (method === 'get') {
      // metadata
      if (lastPath === 'metadata') {
        result = data.metadata;
        return result;
      }

      // list views
      if (lastPath === 'views') {
        result = data.views;
        return result;
      }

      // list rows
      if (lastPath === 'rows') {
        result = data.rows;
        return result;
      }

      // list columns
      if (lastPath === 'columns') {
        result = data.columns;
        return result;
      }
    }

    return result;
  }

  getDTable() {
    const url = `/dtables/${this.dtableUuid}/?lang=${this.lang}`;
    return this.req.get(url);
  }

  getMetadata() {
    const url = `/api/v1/dtables/${this.dtableUuid}/metadata/`;
    return this.req.get(url);
  }

  async getTables() {
    const res = await this.getMetadata();
    return (res && res.tables) || [];
  }

  async getTableByName(table_name) {
    const tables = await this.getTables();
    if (!Array.isArray(tables) || tables.length === 0) {
      return {};
    }
    return tables.find(table=> table.name === table_name);
  }

  addTable(table_name, lang = 'en', columns = []) {
    const url = `/api/v1/dtables/${this.dtableUuid}/tables/`;
    let data = {
      table_name: table_name,
      lang: lang
    }
    if (columns) {
      data.columns = columns;
    }
    return this.req.post(url, data);
  }

  renameTable(old_name, new_name) {
    const url = `/api/v1/dtables/${this.dtableUuid}/tables/`;
    const data = {
      table_name: old_name,
      new_table_name: new_name
    }
    return this.req.put(url, {...data});
  }

  deleteTable(table_name) {
    const url = `/api/v1/dtables/${this.dtableUuid}/tables/`;
    const data = {
      table_name: table_name,
    }
    return this.req.delete(url, {data:data});

  }

  listViews(table_name) {
    const url = `api/v1/dtables/${this.dtableUuid}/views/`;
    const params = {
      table_name: table_name,
    }
    return this.req.get(url, {params});
  }

  getViewByName(table_name, view_name) {
    const url = `api/v1/dtables/${this.dtableUuid}/views/${view_name}/?table_name=` + table_name;
    return this.req.get(url)
  }

  addView(table_name, view_name) {
    const url = `api/v1/dtables/${this.dtableUuid}/views/?table_name=` + table_name;
    const data = {
      name: view_name
    };
    return this.req.post(url, {...data});
  }

  renameView(table_name, view_name, new_view_name) {
    const url = `api/v1/dtables/${this.dtableUuid}/views/${view_name}/?table_name=` + table_name;
    const data = {
      name: new_view_name,
    }
    return this.req.put(url, {...data});
  }

  deleteView(table_name, view_name) {
    const url = `api/v1/dtables/${this.dtableUuid}/views/${view_name}/?table_name=` + table_name;
    return this.req.delete(url);
  }

  listColumns(table_name, view_name) {
    const url = `api/v1/dtables/${this.dtableUuid}/columns/`;
    const params = {
      table_name: table_name,
      view_name: view_name,
    }
    return this.req.get(url, { params });
  }

  async getColumnByName(table_name, column_name) {
    const res = await this.listColumns(table_name);
    return res.find(col=> col.name === column_name);
  }

  async getColumnsByType(table_name, column_type) {
    const res = await this.listColumns(table_name);
    return res.filter(col=> col.type === column_type);
  }

  async getColumnLinkId(table_name, column_name) {
    const columns = await this.listColumns(table_name);
    const column = columns.find(column => column.name === column_name);
    if (!column) {
      return Promise.reject({error_message: 'column is not exist',});
    }

    if (column.type !== 'link') {
      return Promise.reject({error_message: `The column ${column_name} is not a link colum`});
    }

    return Promise.resolve(column.data['link_id']);
  }

  insertColumn(table_name, column_name, column_type, column_key, column_data) {
    const url = `api/v1/dtables/${this.dtableUuid}/columns/`;
    const data = {
      table_name: table_name,
      column_name: column_name,
      anchor_column: column_key,
      column_type: column_type,
      column_data: column_data
    };
    return this.req.post(url, {...data});
  }

  renameColumn(table_name, column_key, new_column_name) {
    const url = `api/v1/dtables/${this.dtableUuid}/columns/`;
    const data = {
      op_type: 'rename_column',
      table_name: table_name,
      column: column_key,
      new_column_name: new_column_name,
    };
    return this.req.put(url, {...data});
  }

  resizeColumn(table_name, column_key, new_column_width) {
    const url = `api/v1/dtables/${this.dtableUuid}/columns/`;
    const data = {
      op_type: 'resize_column',
      table_name: table_name,
      column: column_key,
      new_column_width: new_column_width,
    };
    return this.req.put(url, {...data});
  }

  freezeColumn(table_name, column_key, frozen) {
    const url = `api/v1/dtables/${this.dtableUuid}/columns/`;
    const data = {
      op_type: 'freeze_column',
      table_name: table_name,
      column: column_key,
      frozen: frozen,
    };
    return this.req.put(url, {...data});
  }

  moveColumn(table_name, column_key, target_column_key) {
    const url = `api/v1/dtables/${this.dtableUuid}/columns/`;
    const data = {
      op_type: 'move_column',
      table_name: table_name,
      column: column_key,
      target_column: target_column_key,
    };
    return this.req.put(url, {...data});
  }

  modifyColumnType(table_name, column_key, new_column_type) {
    const url = `api/v1/dtables/${this.dtableUuid}/columns/`;
    const data = {
      op_type: 'modify_column_type',
      table_name: table_name,
      column: column_key,
      new_column_type: new_column_type,
    };
    return this.req.put(url, {...data});
  }

  deleteColumn(table_name, column_key) {
    const url = `api/v1/dtables/${this.dtableUuid}/columns/`;
    const data = {
      table_name: table_name,
      column: column_key,
    };
    return this.req.delete(url, {data: data});
  }

  addColumnOptions(table_name, column, options) {
    const url = `api/v1/dtables/${this.dtableUuid}/column-options/`;
    const data = {
      table_name: table_name,
      column: column,
      options: options
    };
    return this.req.post(url, {...data});
  }

  addColumnCascadeSettings(table_name, child_column, parent_column, cascade_settings) {
    const url = `api/v1/dtables/${this.dtableUuid}/column-cascade-settings/`;
    const data = {
      table_name: table_name,
      child_column: child_column,
      parent_column: parent_column,
      cascade_settings: cascade_settings,
    };
    return this.req.post(url, {...data});
  }

  listRows(table_name, view_name, order_by, desc, start, limit) {
    const url = `api/v1/dtables/${this.dtableUuid}/rows/`;
    const params = {
      table_name: table_name,
      view_name: view_name,
      convert_link_id: true,
    };
    params['direction'] = desc ? 'desc' : 'asc';
    if (order_by) {
      params['order_by'] = order_by;
    }
    if (start) {
      params['start'] = start;
    }

    if (limit) {
      params['limit'] = limit;
    }

    return this.req.get(url, {params});
  }

  appendRow(table_name, row_data, apply_default) {
    const url = `api/v1/dtables/${this.dtableUuid}/rows/`;
    let data = {
      table_name: table_name,
      row: row_data,
    };
    if (typeof apply_default === 'boolean') {
      data.apply_default = apply_default;
    }
    return this.req.post(url, {...data});
  }

  insertRow(table_name, row_data, anchor_row_id, apply_default) {
    const url = `api/v1/dtables/${this.dtableUuid}/rows/`;
    let data = {
      table_name: table_name,
      row: row_data,
      anchor_row_id: anchor_row_id,
    };
    if (typeof apply_default === 'boolean') {
      data.apply_default = apply_default;
    }
    return this.req.post(url, {...data});
  }

  deleteRow(table_name, row_id) {
    const url = `api/v1/dtables/${this.dtableUuid}/rows/`;
    const data = {
      table_name: table_name,
      row_id: row_id,
    };
    return this.req.delete(url, {data: data});
  }

  updateRow(table_name, row_id, row_data) {
    const url = `api/v1/dtables/${this.dtableUuid}/rows/`;
    const data = {
      table_name: table_name,
      row_id: row_id,
      row: row_data,
    };
    return this.req.put(url, {...data});
  }

  getRow(table_name, row_id) {
    const url = `api/v1/dtables/${this.dtableUuid}/rows/${row_id}/`;
    const params = {
      table_name: table_name,
    };
    return this.req.get(url, {params});
  }

  batchAppendRows(table_name, rows_data, apply_default) {
    const url = `api/v1/dtables/${this.dtableUuid}/batch-append-rows/`;
    let data = {
      table_name: table_name,
      rows: rows_data,
    };
    if (typeof apply_default === 'boolean') {
      data.apply_default = apply_default;
    }
    return this.req.post(url, {...data});
  }

  batchDeleteRows(table_name, row_ids) {
    const url = `api/v1/dtables/${this.dtableUuid}/batch-delete-rows/`;
    const data = {
      table_name: table_name,
      row_ids: row_ids,
    };
    return this.req.delete(url, {data: data});
  }

  batchUpdateRows(table_name, rows_data) {
    const url = `api/v1/dtables/${this.dtableUuid}/batch-update-rows/`;
    const data = {
      table_name: table_name,
      updates: rows_data,
    };
    return this.req.put(url, {...data});
  }

  addLink(link_id, table_name, other_table_name, row_id, other_row_id) {
    const url = `api/v1/dtables/${this.dtableUuid}/links/`;
    const data = {
      link_id: link_id,
      table_name: table_name,
      other_table_name: other_table_name,
      table_row_id: row_id,
      other_table_row_id: other_row_id,
    };
    return this.req.post(url, {...data});
  }

  updateLink(link_id, table_id, other_table_id, row_id, other_rows_ids) {
    const url = `api/v1/dtables/${this.dtableUuid}/links/`;
    const data = {
      link_id: link_id,
      table_name: table_id,
      other_table_name: other_table_id,
      row_id: row_id,
      other_rows_ids: other_rows_ids,
    };
    return this.req.put(url, {...data});
  }

  removeLink(link_id, table_name, other_table_name, row_id, other_row_id) {
    const url = `api/v1/dtables/${this.dtableUuid}/links/`;
    const data = {
      link_id: link_id,
      table_name: table_name,
      other_table_name: other_table_name,
      table_row_id: row_id,
      other_table_row_id: other_row_id,
    };
    return this.req.delete(url, {data: data});
  }

  batchUpdateLinks(link_id, table_id, other_table_id, row_id_list, other_rows_ids_map) {
    const url = `api/v1/dtables/${this.dtableUuid}/batch-update-links/`;
    const data = {
      link_id: link_id,
      table_id: table_id,
      other_table_id: other_table_id,
      row_id_list: row_id_list,
      other_rows_ids_map: other_rows_ids_map,
    };
    return this.req.put(url, {...data});
  }

  getLinkedRecords(table_id, link_column_key, rows) {
    const url = `api/v1/linked-records/${this.dtableUuid}/`;
    const data = {
      link_column: link_column_key,
      table_id,
      rows,
    };
    const req = axios.create({
      baseURL: this.dtableDB,
      headers: {Authorization: 'Token ' + this.accessToken}
    });
    return req.post(url, {...data}).then((response) => {
      return Promise.resolve((response && response.data) || {});
    });
  }

  query(sql) {
    const url = `api/v1/query/${this.dtableUuid}/`;
    const data = {sql: sql};
    const req = axios.create({
      baseURL: this.dtableDB,
      headers: {Authorization: 'Token ' + this.accessToken}
    });
    return req.post(url, {...data}).then(response => {
      return Promise.resolve(formatQueryResult(response.data));
    });
  }

}

export default Base;

import axios from "axios";
import { getAccessToken } from './utils';

class Base {

  constructor(config) {
    this.config = config;
    this.appName = '';
    this.accessToken = '';
    this.dtableServer = '';
    this.dtableSocket = '';
    this.lang = 'en';
    this.req = null;
  }

  async auth() {
    const response = await getAccessToken(this.config);
    const { app_name, access_token, dtable_uuid, dtable_server, dtable_socket } = response.data;
    this.appName = app_name;
    this.accessToken = access_token;
    this.dtableServer = dtable_server;
    this.dtableSocket = dtable_socket;
    this.dtableUuid = dtable_uuid;
    this.req = axios.create({
      baseURL: this.dtableServer,
      headers: {Authorization: 'Token ' + this.accessToken}
    });
    this.req.interceptors.response.use(response => {
      const result = this.getResult(response);
      return result;
    }, error => {
      return Promise.reject(error);
    });
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

    if (method === 'post' && lastPath === 'query') {
      result = data.results;
      return result;
    }

    return result;
  }

  getDTable() {
    const url = `dtables/${this.dtableUuid}/?lang=${this.lang}`;
    return this.req.get(url);
  }

  getMetadata() {
    const url = `/api/v1/dtables/${this.dtableUuid}/metadata/`;
    return this.req.get(url);
  }
  
  addTable(table_name, lang) {
    const url = `/api/v1/dtables/${this.dtableUuid}/tables/`;
    const data = {
      table_name: table_name,
      lang: lang
    }
    return this.req.post(url, {...data});
  }

  listViews(table_name) {
    const url = `api/v1/dtables/${this.dtableUuid}/views/`;
    const params = {
      table_name: table_name,
    }
    return this.req.get(url, {params});
  }

  listColumns(table_name, view_name) {
    const url = `api/v1/dtables/${this.dtableUuid}/columns/`;
    const params = {
      table_name: table_name,
      view_name: view_name
    }
    return this.req.get(url, {params});
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

  listRows(tableName, viewName) {
    const url = `api/v1/dtables/${this.dtableUuid}/rows/`;
    const params = {
      table_name: tableName,
      view_name: viewName,
      convert_link_id: true,
    };
    return this.req.get(url, {params});
  }

  appendRow(table_name, row_data) {
    const url = `api/v1/dtables/${this.dtableUuid}/rows/`;
    const data = {
      table_name: table_name,
      row: row_data,
      anchor_row_id: anchor_row_id,
    };
    return this.req.post(url, {...data});
  }

  insertRow(table_name, row_data, anchor_row_id) {
    const url = `api/v1/dtables/${this.dtableUuid}/rows/`;
    const data = {
      table_name: table_name,
      row: row_data,
      anchor_row_id: anchor_row_id,
    };
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

  batchAppendRows(table_name, rows_data) {
    const url = `api/v1/dtables/${this.dtableUuid}/batch-append-rows/`;
    const data = {
      table_name: table_name,
      rows: rows_data,
    };
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
      table_id: table_id,
      other_table_id: other_table_id,
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

  getColumnLinkId(columns, column_name) {
    const column = columns.find(column => column.name === column_name);
    if (!column) {
      return Promise.reject({error_message: 'column is not exist',});
    }

    if (column.type !== 'link') {
      return Promise.reject({error_message: `The column ${column_name} is not a link colum`});
    }

    return Promise.resolve(column.data['link_id']);
  }

  query(sql) {
    const url = `api/v1/dtables/${this.dtableUuid}/query/`;
    const data = {sql: sql};
    return this.req.post(url, {...data});
  }
  
}

export default Base;
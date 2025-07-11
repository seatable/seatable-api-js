import axios from 'axios';
import { formatQueryResult } from './utils';

class APIGateway {

  constructor({ token, server, dtable_uuid }) {
    this.token = token;
    this.dtable_uuid = dtable_uuid;
    this.baseURL = server[server.length - 1] === '/' ? `${server}api-gateway` : `${server}/api-gateway`;
    this.res_headers = null;
    this.init();
  }

  init() {
    this.req = axios.create({
      baseURL: this.baseURL,
      headers: { 'Authorization': 'Token ' + this.token },
    });
  }

  setResponseHeaders(res_headers) {
    this.res_headers = res_headers || null;
  }

  getResponseHeaders(key) {
    if (!this.res_headers) return null;
    if (key) {
      return Object.hasOwnProperty.call(this.res_headers, key) ? this.res_headers[key] : null;
    }
    return this.res_headers;
  }

  async getDTable() {
    const url = `/api/v2/dtables/${this.dtable_uuid}/`;
    const res = await this.req.get(url);
    this.setResponseHeaders(res && res.headers);
    if (!res) {
      return {};
    }
    return res.data || {};
  }

  async getMetadata() {
    const url = `/api/v2/dtables/${this.dtable_uuid}/metadata/`;
    const res = await this.req.get(url);
    this.setResponseHeaders(res && res.headers);
    if (!res || !res.data) {
      return {};
    }
    return res.data.metadata || {};
  }

  async addTable(table_name, lang = 'en', columns = []) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/tables/`;
    let data = {
      table_name,
      lang,
    };
    if (columns) {
      data.columns = columns;
    }
    const res = await this.req.post(url, data);
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async renameTable(table_name, new_table_name) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/tables/`;
    const data = {
      table_name,
      new_table_name,
    };
    const res = await this.req.put(url, data);
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async deleteTable(table_name) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/tables/`;
    const data = {
      table_name,
    };
    const res = await this.req.delete(url, { data });
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async listViews(table_name) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/views/`;
    const params = {
      table_name,
    };
    const res = await this.req.get(url, { params });
    this.setResponseHeaders(res && res.headers);
    if (!res || !res.data) {
      return [];
    }
    return res.data.views || [];
  }

  async getViewByName(table_name, view_name) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/views/${view_name}/?table_name=${table_name}`;
    const res = await this.req.get(url);
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async addView(table_name, view_name) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/views/?table_name=${table_name}`;
    const data = {
      name: view_name,
    };
    const res = await this.req.post(url, data);
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async renameView(table_name, view_name, new_view_name) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/views/${view_name}/?table_name=${table_name}`;
    const data = {
      name: new_view_name,
    }
    const res = await this.req.put(url, data);
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async deleteView(table_name, view_name) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/views/${view_name}/?table_name=${table_name}`;
    const res = await this.req.delete(url);
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async listColumns(table_name, view_name) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/columns/`;
    let params = {
      table_name,
    }
    if (view_name) {
      params.view_name = view_name;
    }
    const res = await this.req.get(url, { params });
    this.setResponseHeaders(res && res.headers);
    if (!res || !res.data) {
      return [];
    }
    return res.data.columns || [];
  }

  async insertColumn(table_name, column_name, column_type, column_key, column_data) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/columns/`;
    let data = {
      table_name,
      column_name,
      column_type,
    };
    if (column_key) {
      data.anchor_column = column_key;
    }
    if (column_data) {
      data.column_data = column_data;
    }
    const res = await this.req.post(url, data);
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async renameColumn(table_name, column_key, new_column_name) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/columns/`;
    const data = {
      op_type: 'rename_column',
      column: column_key,
      table_name,
      new_column_name,
    };
    const res = await this.req.put(url, data);
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async resizeColumn(table_name, column_key, new_column_width) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/columns/`;
    const data = {
      op_type: 'resize_column',
      column: column_key,
      table_name,
      new_column_width,
    };
    const res = await this.req.put(url, data);
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async freezeColumn(table_name, column_key, frozen) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/columns/`;
    const data = {
      op_type: 'freeze_column',
      column: column_key,
      table_name,
      frozen,
    };
    const res = await this.req.put(url, data);
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async moveColumn(table_name, column_key, target_column_key) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/columns/`;
    const data = {
      op_type: 'move_column',
      column: column_key,
      target_column: target_column_key,
      table_name,
    };
    const res = await this.req.put(url, data);
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async modifyColumnType(table_name, column_key, new_column_type) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/columns/`;
    const data = {
      op_type: 'modify_column_type',
      column: column_key,
      table_name,
      new_column_type,
    };
    const res = await this.req.put(url, data);
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async addColumnOptions(table_name, column, options) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/column-options/`;
    const data = {
      table_name,
      column,
      options
    };
    const res = await this.req.post(url, data);
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async addColumnCascadeSettings(table_name, child_column, parent_column, cascade_settings) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/column-cascade-settings/`;
    const data = {
      table_name,
      child_column,
      parent_column,
      cascade_settings,
    };
    const res = await this.req.post(url, data);
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async deleteColumn(table_name, column_key) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/columns/`;
    const data = {
      table_name,
      column: column_key,
    };
    const res = await this.req.delete(url, { data });
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async listRows(table_name, view_name, order_by, desc, start, limit) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/rows/`;
    let params = {
      table_name,
      convert_keys: true,
      convert_link_id: true,
    };
    if (view_name) {
      params.view_name = view_name;
    }
    if (order_by) {
      params.order_by = order_by;
      params.direction = desc ? 'desc' : 'asc';
    }
    if (start) {
      params.start = start;
    }
    if (limit) {
      params.limit = limit;
    }

    const res = await this.req.get(url, { params });
    this.setResponseHeaders(res && res.headers);
    if (!res || !res.data) {
      return [];
    }
    return res.data.rows || [];
  }

  async getRow(table_name, row_id) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/rows/${row_id}/`;
    const params = {
      table_name,
      convert_keys: true,
    };
    const res = await this.req.get(url, { params });
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async appendRow(table_name, row_data, apply_default) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/rows/`;
    let data = {
      table_name,
      rows: [row_data],
    };
    if (typeof apply_default === 'boolean') {
      data.apply_default = apply_default;
    }
    const res = await this.req.post(url, data);
    this.setResponseHeaders(res && res.headers);
    if (!res || !res.data) {
      return {};
    }
    return res.data.first_row || {};
  }

  async batchAppendRows(table_name, rows_data, apply_default) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/rows/`;
    let data = {
      table_name,
      rows: rows_data,
    };
    if (typeof apply_default === 'boolean') {
      data.apply_default = apply_default;
    }
    const res = await this.req.post(url, data);
    this.setResponseHeaders(res && res.headers);
    if (!res || !res.data) {
      return {};
    }
    return { inserted_row_count: res.data.inserted_row_count };
  }

  async insertRow(table_name, row_data, _, apply_default) {
    // not support custom insert position yet
    return this.appendRow(table_name, row_data, apply_default);
  }

  async updateRow(table_name, row_id, row_data) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/rows/`;
    const data = {
      table_name,
      updates: [{
        row_id,
        row: row_data,
      }]
    };
    const res = await this.req.put(url, data);
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async batchUpdateRows(table_name, rows_data) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/rows/`;
    const data = {
      table_name,
      updates: rows_data,
    };
    const res = await this.req.put(url, data);
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async deleteRow(table_name, row_id) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/rows/`;
    const data = {
      table_name,
      row_ids: [row_id],
    };
    const res = await this.req.delete(url, { data });
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async batchDeleteRows(table_name, row_ids) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/rows/`;
    const data = {
      table_name,
      row_ids,
    };
    const res = await this.req.delete(url, { data });
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async addLink(link_id, table_name, other_table_name, row_id, other_row_id) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/links/`;
    const data = {
      link_id,
      table_name,
      other_table_name,
      other_rows_ids_map: {
        [row_id]: [other_row_id],
      },
    };
    const res = await this.req.post(url, data);
    this.setResponseHeaders(res && res.headers);
    return res && res.data;
  }

  async removeLink(link_id, table_name, other_table_name, row_id, other_row_id) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/links/`;
    const data = {
      link_id,
      table_name,
      other_table_name,
      table_row_id: row_id,
      other_rows_ids_map: {
        [row_id]: [other_row_id],
      },
    };
    const res = await this.req.delete(url, { data });
    this.setResponseHeaders(res && res.headers);
    return res && res.data;
  }

  async updateLink(link_id, table_name, other_table_name, row_id, other_rows_ids) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/links/`;
    const data = {
      link_id,
      table_name,
      other_table_name,
      other_rows_ids_map: {
        [row_id]: other_rows_ids,
      },
    };
    const res = await this.req.put(url, data);
    this.setResponseHeaders(res && res.headers);
    return res && res.data;
  }

  async batchUpdateLinks(link_id, table_id, other_table_id, _, other_rows_ids_map) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/links/`;
    const data = {
      link_id,
      table_id,
      other_table_id,
      other_rows_ids_map,
    };
    const res = await this.req.put(url, data);
    this.setResponseHeaders(res && res.headers);
    return res && res.data;
  }

  async getLinkedRecords(table_id, link_column_key, rows) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/query-links/`;
    const data = {
      table_id,
      link_column_key,
      rows,
    };
    const res = await this.req.post(url, data);
    this.setResponseHeaders(res && res.headers);
    return (res && res.data) || {};
  }

  async query(sql) {
    const url = `/api/v2/dtables/${this.dtable_uuid}/sql/`;
    const data = {
      sql,
    };
    return this.req.post(url, data).then(response => {
      this.setResponseHeaders(response.headers);
      return Promise.resolve(formatQueryResult(response.data));
    });
  }

}

export default APIGateway;

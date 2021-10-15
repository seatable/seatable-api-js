import axios from "axios";
import { getAccessToken } from './utils';

class SeatableAPI {

  constructor() {
    this.appName = '';
    this.accessToken = '';
    this.dtableServer = '';
    this.dtableSocket = '';
    this.lang = 'en';
    this.req = null;
  }

  async buildConnectionWithBase(config) {
    const response = await getAccessToken(config);
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
  }

  getDTable() {
    const url = `dtables/${this.dtableUuid}/?lang=${this.lang}`;
    return this.req.get(url);
  }

  getRelatedUsers() {
    const url = `api/v1/dtables/${this.dtableUuid}/related-users/`;
    return this.req.get(url);
  }

  listViews(tableName) {
    const url = `api/v1/dtables/${this.dtableUuid}/views/`;
    const params = {
      table_name: encodeURIComponent(tableName),
    }
    return this.req.get(url, {params});
  }

  listColumns(tableName, viewName) {
    const url = `api/v1/dtables/${this.dtableUuid}/columns/`;
    const params = {
      table_name: tableName,
      view_name: viewName
    }
    return this.req.get(url, {params});
  }
  
  listRows(tableName, viewName) {
    const url = `api/v1/dtables/${this.dtableUuid}/rows/`;
    const params = {
      table_name: tableName,
      view_name: viewName,
      convert_link_id: true,
    }
    return this.req.get(url, {params});
  }

}

const seatableAPI = new SeatableAPI();

export default seatableAPI;
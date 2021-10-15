import axios from "axios";

const getAccessToken = () => {
  const { server, APIToken } = config;
  const url = server + '/api/v2.1/dtable/app-access-token/';
  const headers = { 'Authorization': 'Token ' + APIToken };
  return axios.get(url, { headers: headers });
};

export {
  getAccessToken
}

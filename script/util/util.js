import config from "./config.js";
import errorHandling from "./errorHandling.js";

const util = {
  LogOut: function () {
    localStorage.clear()
  },
  FetchAuth: async function (path, payload) {
    return await fetch(config.baseURL + path, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: payload,
      credentials: 'include',
    }).then(response => errorHandling.HandlingFetchError(response))
      .then(response => response.json())
      .catch(error => {
        errorHandling.PrintError(error)
        return error
      });
  },
  DecodeJWT: function (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  },
  SetLocalStorageLogin: function (sendLogin) {
    localStorage.setItem("profile.first_name", sendLogin.first_name)
    localStorage.setItem("profile.last_name", sendLogin.last_name)
    localStorage.setItem("profile.email", sendLogin.email)
    localStorage.setItem("profile.role_id", sendLogin.role_id)
    localStorage.setItem("auth.access_token", sendLogin.access_token)
    let JWTPayload = this.DecodeJWT(sendLogin.access_token)
    localStorage.setItem("profile.id", JWTPayload.data.id)
  },
  ToggleSidebarItem: function () {
    if (window.location.hash.substring(1)) {
      const activated = document.querySelector('.nav-item-active')
      activated.classList.remove('nav-item-active')
      document.getElementById(window.location.hash.substring(1) + '-button').parentNode.classList.add('nav-item-active')
    }
  },
  GetUserJWTToken: function () {
    return localStorage.getItem('auth.access_token')
  },
  ToCurrency : function(string){
    let harga = string.toString()
    let res = ''
    let strLength = harga.length
    while (strLength != 0){
        if (strLength % 3 != 0) {
            res += harga.slice(0, strLength % 3) + '.'
            harga = harga.slice(strLength % 3)
            strLength = harga.length
        } else {
            res += harga.slice(0, 3) + '.'
            harga = harga.slice(3)
            strLength = harga.length
        }
    }
    return res.slice(0, res.length - 1)
  }
}
export default util
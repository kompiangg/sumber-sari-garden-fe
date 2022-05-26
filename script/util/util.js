import config from "./config.js";
import errorHandling from "./errorHandling.js";

const util = {
  LogOut : function() {
    localStorage.clear()
  },
  FetchAuth : async function (path, payload) {
              return await fetch(config.baseURL + path, {
                method: 'POST',
                headers: {
                  'Content-type': 'application/json'
                },
                body: payload,
                credentials: 'include',
              }).then(response => {
                if (!response.ok) {
                  return {"data": null, "error":response.statusText}
                }
                return response.json()
              })
              .catch(error => {
                errorHandling.PrintError(error)
                return error
              });
            },
  SetLocalStorageLogin: function (sendLogin) {
              localStorage.setItem("profile.first_name", sendLogin.first_name)
              localStorage.setItem("profile.last_name", sendLogin.last_name)
              localStorage.setItem("profile.email", sendLogin.email)
              localStorage.setItem("profile.role_id", sendLogin.role_id)
              localStorage.setItem("auth.access_token", sendLogin.access_token)
            },
}
export default util
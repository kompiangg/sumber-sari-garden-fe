import urlRoutes from "./util/urlRoutes.js";
import ValidateAdmin from "./util/dashboardAuth.js";
import errorHandling from "./util/errorHandling.js";

(async function () {
  let valid = await ValidateAdmin()
  if (valid == 0) {
    errorHandling.PrintError("You must need to be an admin")
  }
})()

document.addEventListener('click', element => {
  const target = element.target;
  if (!target.matches('.nav-sidebar')) {
    return
  }
  element.preventDefault()
  urlRoute(element);
})

function urlRoute(event) {
  event.preventDefault()
  event = event || window.event
  window.history.pushState({}, "", event.target.href)
  urlLocationHandler()
}

async function urlLocationHandler() {
  const location = window.location.pathname + window.location.hash
  if (location.length == 0) {
    location = '/dashboard.html'
  }

  const routes = urlRoutes[location] || urlRoutes[404]
  const html = await fetch(routes.template).then((response) => response.text()).catch(error => errorHandling.PrintError(error))
  document.querySelector('.sidebar-content').innerHTML = html
  routes.initFunc()
}

window.onpopstate = urlLocationHandler
window.route = urlRoute
urlLocationHandler()

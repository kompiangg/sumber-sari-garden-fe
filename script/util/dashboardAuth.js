import config from "./config.js";
import errorHandling from "./errorHandling.js";

async function validateAdmin() {
  const isAdmin = localStorage.getItem('profile.role_id')
  if (isAdmin != 1) {
    window.location.href = "index.html"
    return 0
  }

  const profileId = localStorage.getItem('profile.id')
  const isAdminFromRepository = await fetch(
    config.baseURL + '/users/profile/' + profileId
  ).then(response => errorHandling.HandlingFetchError(response))
    .then(response => response.json())
    .catch(error => {
      errorHandling.PrintError(error)
    })

  if (isAdminFromRepository.error != null) {
    errorHandling.PrintError(isAdminFromRepository.error)
    return 0
  }

  if (isAdminFromRepository.data.role_id != isAdmin) {
    errorHandling.PrintError('Fake ID')
    return 0
  }
}

export default validateAdmin
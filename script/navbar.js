import ValidateAdmin from "./util/dashboardAuth.js"

const headerNav = document.querySelector('header')

const link = document.createElement('link')
link.href = "/style/navbar.css"
link.type = "text/css"
link.rel = "stylesheet"
link.media = "screen,print"
headerNav.appendChild(link)

const navbar = document.createElement('nav')
navbar.className = "navbar navbar-expand-lg fixed-top bg-light"
navbar.innerHTML = `
<div class="container">
    <a href="./index.html" class="navbar-brand">
        <img src="https://i.postimg.cc/wvKbSZHv/Shop-Logo.png" alt="shop logo" class="header-img" id="header-img">
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
                <a class="nav-link" href="#home">Home</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#explore">Explore</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#about">About</a>
            </li>
        </ul>
        <div class="profile d-flex">
        </div>
    </div>
</div>
`
headerNav.appendChild(navbar)

const profile = document.querySelector('.profile')
const isLogin = localStorage.getItem('auth.access_token')
const isAdmin = localStorage.getItem('profile.role_id')
profile.innerHTML = isLogin ?
  `
  <a class="btn btn-outline-success logout-button" href="index.html">
  Logout
  </a>
  <a class="btn btn-success profile-button">
    ${isAdmin == 1 ? "Dashboard" : "Profile"}
  </a>
  ` : `
  <a class="btn btn-outline-success login-button" href="authentication.html" >
    Login
  </a>
  <a class="btn btn-success register-button" href="authentication.html?register=1">
    Register
  </a>
  `

document.addEventListener('click', element => {
  if (element.target.classList.contains('logout-button')) {
    localStorage.clear()
  }
})

document.addEventListener('click', async element => {
  if (element.target.classList.contains('profile-button')) {
    element.preventDefault()

    const isAdmin = localStorage.getItem('profile.role_id') == 1
    if (!isAdmin) {
      window.location.href = "profile.html"
    } else if (isAdmin) {
      let valid = await ValidateAdmin()
      if (valid == 0) {
        return
      }
      window.location.href = "dashboard.html"
    }
  }
})


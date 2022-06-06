import ValidateAdmin from "./util/dashboardAuth.js"
import errorHandling from "./util/errorHandling.js"
import util from "./util/util.js"

const favIcon = document.createElement('link')
favIcon.rel = 'icon'
favIcon.type = "image/x-icon"
favIcon.href = "/assets/img/shop_logo.png"

document.querySelector('head').appendChild(favIcon)

const headerNav = document.querySelector('header')

const modalBox = document.createElement('div')
modalBox.classList = 'modalbox-cart'
modalBox.innerHTML = await fetch('navbarModalbox.html')
                      .then(response => errorHandling.HandlingFetchError(response))
                      .then(response => response.text())
                      .catch(error => errorHandling.PrintError(error))
headerNav.appendChild(modalBox)

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
                <a class="nav-link" href="index.html">Home</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="index.html#product">Product</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="index.html#article">Article</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="index.html#voucher">Voucher</a>
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
  ${
    isAdmin == 2 ?
    `<a class='btn btn-outline-success login-button position-relative cart-button'>
      Cart
      <span class='position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning badge-text'>
        <span id="badge-text-count"></span>
      </span>
    </a>`:``
  }
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

document.addEventListener('click', element => {
  if (element.target.classList.contains('logout-button')) {
    localStorage.clear()
  }
})

const tempCart = JSON.parse(localStorage.getItem('temp-cart'))
if((!tempCart) || (tempCart['subQty'] == 0)) {
  const cartButton = document.querySelector('.badge-text')
  cartButton.classList.add('d-none')
} else {
  const cartButton = document.querySelector('.badge-text')
  cartButton.classList.remove('d-none')
  cartButton.querySelector('#badge-text-count').innerHTML = tempCart['subQty']
}

navbar.addEventListener('click', element => {
  if (!element.target.classList.contains('cart-button')) {return}
  const cartModalBoxObject = new bootstrap.Modal('#staticBackdropCart', {
    backdrop: 'static'
  })
  cartModalBoxObject.toggle()

  const tempCart = JSON.parse(localStorage.getItem('temp-cart'))
  const modalBody = document.querySelector('.modalbox-cart .modal-body.new-catalog .row')

  if (tempCart['subQty'] != 0) {
    modalBody.innerHTML = ''

    Object.entries(tempCart.cart).forEach(element => {
      const each = document.createElement('div')
      each.classList = 'col-3'
      each.dataset.productId = element[1]['productId']
      each.innerHTML = `
        <div class="product-image">
            <img src="${element[1]['productURL']}" class="img-fluid">
        </div>
        <div class="product-info d-relative">
          <div>
            <h5 class="fs-5 product-name mb-0">${element[1]['productName']}</h5>
            <p class="mb-2"><em>${element[1]['productCategory']}</em></p>
          </div>
          <div class="d-flex mb-1 justify-content-between align-items-center">
            <p class="mb-0" style="font-weight: 500;">Harga</p>
            <p class="mb-0" style="font-weight: 700;">IDR ${util.ToCurrency(element[1]['productPrice'])}</p>
          </div>
          <div class="d-flex mb-1 justify-content-between align-items-centers">
            <label for="subQty" style="font-weight: 500;">Qty</label>
            <input value="${element[1]['qty']}" class="w-50 text-right" type="number" min="0" style="text-align: right; font-weight: 700;">
          </div>
          <div>
            <p class="mb-0 fs-6">Sub Total</p>
            <h6 class="fs-7 product-total-price pb-2">IDR ${util.ToCurrency(element[1]['productTotalPrice'])} </h6>
          </div>
        </div>
      `
      each.querySelector('input').addEventListener('click', (e) => {
        const cartButton = document.querySelector('.badge-text')

        let qtyDiff = (+e.target.value) - tempCart['cart'][element[1]['productId']]['qty']
        tempCart['subQty'] += qtyDiff
        tempCart['grandTotal'] += tempCart['cart'][element[1]['productId']]['productPrice'] * qtyDiff
        tempCart['cart'][element[1]['productId']]['qty'] = +e.target.value
        tempCart['cart'][element[1]['productId']]['productTotalPrice'] = tempCart['cart'][element[1]['productId']]['productPrice'] * (+e.target.value)
        each.querySelector('.product-total-price').innerHTML = `IDR ${util.ToCurrency(tempCart['cart'][element[1]['productId']]['productTotalPrice'])}`
        cartButton.querySelector('#badge-text-count').innerHTML = tempCart['subQty']
        if (+e.target.value == 0) {
          if(confirm('Are you sure want to delete this item from cart?')) {
            each.remove()
            if (tempCart['subQty'] == 0) {
              cartButton.classList.add('d-none')
              modalBody.innerHTML = `
              <div class="text-center my-4">
                <h5>
                  No Items On Cart
                </h5>
              </div>
              `
            }
            delete tempCart['cart'][element[1]['productId']]
          }
        }
        localStorage.setItem('temp-cart', JSON.stringify(tempCart))
      })
      modalBody.appendChild(each)
    })
  }
})

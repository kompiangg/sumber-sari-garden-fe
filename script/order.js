import config from "./util/config.js"
import errorHandling from "./util/errorHandling.js"
import util from "./util/util.js"

(async function () {
  const mainOrder = document.querySelector('.grid-menu')

  const categoryFetch = await fetch(
    config.baseURL + '/inventory/category'
  ).then(response => errorHandling.HandlingFetchError(response))
  .then(response => response.json())
  .catch(error => errorHandling.PrintError(error))

  if (categoryFetch.error != null) {
    errorHandling.PrintError(categoryFetch.error)
    return
  }

  const getProductFetch = await fetch(
    config.baseURL + '/inventory/products', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'order_type': 1,
      'limit': 1000
    })
  }
  ).then(response => errorHandling.HandlingFetchError(response))
    .then(response => response.json())
    .catch(error => errorHandling.PrintError(error))

  if (getProductFetch.error != null) {
    errorHandling.PrintError(getProductFetch.error)
    return
  }

  categoryFetch.data.forEach(element => {
    if (element.id == 1) {return}
    
    const divCategory = document.createElement('div')
    divCategory.classList = 'category row'
    const h2Category = document.createElement('h2')
    h2Category.innerHTML = element.name
    divCategory.appendChild(h2Category)
    
    getProductFetch.data.products.forEach(elementProduct => {
      if (elementProduct.category_id != element.id) {return}
      const col = document.createElement('div')
      col.classList = 'col-3'
  
      col.innerHTML = `
      <div class="product-image">
          <img src="${elementProduct.picture_url}" class="img-fluid">
      </div>
      
      <div class="product-info">
          <h5 class="fs-5">${elementProduct.product_name} </h5>
          <h6 class="fs-7">IDR ${util.ToCurrency(elementProduct.price)}</h6>
          <a>
            <svg id="i-cart" xmlns="http://www.w3.org/2000/svg" viewBox="-0 -7 32 45" width="30" height="30" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path d="M6 6 L30 6 27 19 9 19 M27 23 L10 23 5 2 2 2" />
              <circle cx="25" cy="27" r="2" />
              <circle cx="12" cy="27" r="2" />
            </svg>
          </a>
      </div>
      `
      col.querySelector('svg').dataset.productId = elementProduct.id
      col.querySelector('a').addEventListener('click', (element) => {createCartEventListener(element)})
      divCategory.appendChild(col)
    })
    mainOrder.appendChild(divCategory)
  })
})()

function createCartEventListener(element) {
  const productId = element.target.dataset.productId
  if(!localStorage.getItem('temp-cart')){
    localStorage.setItem('temp-cart', JSON.stringify({}))
  }

  const tempCart = JSON.parse(localStorage.getItem('temp-cart'))
  if(!tempCart[productId]) {
    tempCart[productId].qty = 1
  } else {
    tempCart[productId].qty += 1
  }
  localStorage.setItem('temp-cart', JSON.stringify(tempCart))
}
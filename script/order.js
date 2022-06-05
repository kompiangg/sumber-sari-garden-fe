import config from "./util/config.js"
import errorHandling from "./util/errorHandling.js"
import util from "./util/util.js"

(async function () {
  const mainOrder = document.querySelector('.grid-menu')

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

  const categoryFetch = await fetch(
    config.baseURL + '/inventory/category'
  ).then(response => errorHandling.HandlingFetchError(response))
  .then(response => response.json())
  .catch(error => errorHandling.PrintError(error))

  if (categoryFetch.error != null) {
    errorHandling.PrintError(categoryFetch.error)
    return
  }

  categoryFetch.data.forEach(element => {
    if (element.id == 1) {return}
    
    const divCategory = document.createElement('div')
    divCategory.classList = 'category row'
    divCategory.dataset.categoryId = element.id
    const h2Category = document.createElement('h2')
    h2Category.innerHTML = element.name
    divCategory.appendChild(h2Category)
    
    mainOrder.appendChild(divCategory)
  })

  const categoryDiv = document.querySelectorAll('.category')

  categoryDiv.forEach(element => {
    getProductFetch.data.products.forEach((elementProduct, idx) => {
      if (elementProduct.category_id != element.dataset.categoryId) {return}
      const col = document.createElement('div')
      col.classList = 'col-3'
  
      col.innerHTML = `
      <div class="product-image">
          <img src="${elementProduct.picture_url}" class="img-fluid">
      </div>
      
      <div class="product-info">
          <h5 class="fs-5 product-name">${elementProduct.product_name} </h5>
          <h6 class="fs-7 product-price">IDR ${util.ToCurrency(elementProduct.price)}</h6>
          <svg id="i-cart" xmlns="http://www.w3.org/2000/svg" viewBox="-0 -7 32 45" width="30" height="30" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" data-product-id="${elementProduct.id}">
            <path d="M6 6 L30 6 27 19 9 19 M27 23 L10 23 5 2 2 2" />
            <circle cx="25" cy="27" r="2" />
            <circle cx="12" cy="27" r="2" />
          </svg>
      </div>
      `
      col.querySelector('svg').addEventListener('click', (element) => {
        createCartEventListener(element)
      })
      element.appendChild(col)
    })
  })
})()

function createCartEventListener(element) {
  const productId = element.target.dataset.productId
  if (productId == undefined) {
    alert('Failed to add item to card, please try again')
    return
  }

  const badgeTextQty = document.querySelector('#badge-text-count')
  
  if(!localStorage.getItem('temp-cart')){
    localStorage.setItem('temp-cart', JSON.stringify({cart: {},subQty: 0, grandTotal: 0}))
  }

  const tempCart = JSON.parse(localStorage.getItem('temp-cart'))
  if(!tempCart['cart'][productId]) {
    const cartButton = document.querySelector('.badge-text')
    cartButton.classList.remove('d-none')
    cartButton.querySelector('#badge-text-count').innerHTML = tempCart['subQty']

    const productName = element.target.parentNode.parentNode.querySelector('.product-name').innerHTML
    const productCategory = element.target.parentNode.parentNode.parentNode.parentNode.querySelector('h2').innerHTML
    const productPrice = util.ToInteger(element.target.parentNode.parentNode.querySelector('.product-price').innerHTML.split(' ')[1])
    const productURL = element.target.parentNode.parentNode.querySelector('.product-image img').src
    console.log(element.target.parentNode.parentNode.parentNode.querySelector('.product-image img'));
    tempCart['cart'][productId] = {
      'productId': +productId,
      'productCategory': productCategory,
      'productName': productName,
      'productPrice': productPrice,
      'productURL': productURL,
      'productTotalPrice':productPrice,
      'qty': 1
    }
  } else {
    tempCart['cart'][productId]['qty'] += 1
    tempCart['cart'][productId]['productTotalPrice'] += tempCart['cart'][productId]['productPrice']
  }
  tempCart['subQty'] += 1
  tempCart['grandTotal'] += tempCart['cart'][productId]['productPrice']
  badgeTextQty.innerHTML = tempCart['subQty']
  localStorage.setItem('temp-cart', JSON.stringify(tempCart))
}
import config from "./util/config.js";
import errorHandling from "./util/errorHandling.js"
import util from "./util/util.js";

(async function(){
  const coupon = await fetch(config.baseURL + '/inventory/coupons?limit=3')
                .then(response => errorHandling.HandlingFetchError(response))
                .then(response => response.json())
                .catch(error => errorHandling.PrintError(error))
  
  if (coupon.error != null) {
    errorHandling.PrintError(error)
    return
  }

  const innerCarousel = document.querySelector("section.discount-section .carousel-inner")
  const carouselIndicators = document.querySelector('.carousel-indicators')

  let willInserted = ""
  let carouselButton = ""
  coupon.data.forEach((element, index) => {
    if (index == 0) {
      carouselButton += `
      <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${index}" class="active" aria-current="true"></button>
      `
      willInserted += `
      <div class="carousel-item active" data-bs-interval="5000">
        <div class="discount">
            <p>${element.description}</p>
            <p class="discount-wrapper">${element.code}</p>
        </div>
      </div>
      `
    } else {
      carouselButton += `
      <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${index}"></button>
      `
      willInserted += `
      <div class="carousel-item" data-bs-interval="5000">
        <div class="discount">
            <p>${element.description}</p>
            <p class="discount-wrapper">${element.code}</p>
        </div>
      </div>
      `
    }
  });
  
  carouselIndicators.innerHTML = carouselButton
  innerCarousel.innerHTML = willInserted
})();

(async function(){
  const itemFetch = await fetch(
    config.baseURL + '/inventory/products', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'order_type': 1,
        'limit': 12
      })
    }).then(response => errorHandling.HandlingFetchError(response))
      .then(response => response.json())
      .catch(error => errorHandling.PrintError(error))

  if (itemFetch.error != null) {
    errorHandling.PrintError(itemFetch.error.message)
    return
  }

  const gridMenu = document.querySelector('.grid-menu')

  itemFetch.data.products.forEach((element, index) => {
    if (index < 9) {
      const willInsert = document.createElement('div')
      willInsert.classList = 'col-3'
      willInsert.innerHTML = `
        <div class="product-image">
            <img src="${element.picture_url}" class="img-fluid">
        </div>
        
        <div class="product-info">
            <h5 class="fs-5">${element.product_name}</h5>
            
            <div class="category-name">
              <em>${element.category_name}</em>
            </div>
  
            <h6 class="fs-7">IDR ${util.ToCurrency(element.price)}</h6>
  
            <svg id="i-cart" xmlns="http://www.w3.org/2000/svg" viewBox="-0 -7 32 45" width="30" height="30" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path d="M6 6 L30 6 27 19 9 19 M27 23 L10 23 5 2 2 2" />
                <circle cx="25" cy="27" r="2" />
                <circle cx="12" cy="27" r="2" />
            </svg>
        </div>
      `
      gridMenu.appendChild(willInsert)
    }
  })

  const carouselInner = gridMenu.parentNode.parentNode.querySelector('.carousel-inner')
  itemFetch.data.products.forEach((element, index) => {
    if (index >= 9) {
      const willInsert = document.createElement('div')
      if (index == 9) {
        willInsert.classList = 'carousel-item active'
      } else {
        willInsert.classList = 'carousel-item'
      }
      willInsert.innerHTML = `
        <img src="${element.picture_url}" class="d-block w-100" alt="${element.product_name}">
      `

      carouselInner.appendChild(willInsert)
    }
  })
})();
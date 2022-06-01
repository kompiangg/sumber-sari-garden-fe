import config from "./util/config.js";
import errorHandling from "./util/errorHandling.js"

(async function(){
  let coupon = await fetch(config.baseURL + '/inventory/coupons?limit=3')
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
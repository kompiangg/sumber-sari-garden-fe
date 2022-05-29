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

  const innerCarousel = document.querySelector(".carousel-inner");
  let willInserted = ""

  coupon.data.forEach(element => {
    willInserted += `
    <div class="carousel-item active" data-bs-interval="5000">
      <div class="discount">
          <p>${element.description}</p>
          <p class="discount-wrapper">${element.code}</p>
      </div>
    </div>
    `
  });

  innerCarousel.innerHTML = willInserted
})();
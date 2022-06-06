import config from "./util/config.js"
import errorHandling from "./util/errorHandling.js"
import util from "./util/util.js"

const tempCart = JSON.parse(localStorage.getItem('temp-cart'))

const qty = document.querySelector('.quantity-all-items p')
qty.innerHTML = tempCart['subQty']

const grandTotalBeforeDiscount = document.querySelector('.semi-total p')
grandTotalBeforeDiscount.innerHTML = `IDR ${util.ToCurrency(tempCart['grandTotal'])}`
if (tempCart['coupon']) {
  document.querySelector('.discount-invoice p').innerHTML = `-IDR ${util.ToCurrency(tempCart['grandTotal'] * tempCart['coupon']['percentDiscount'])} `
} else {
  document.querySelector('.discount-invoice p').innerHTML = `-IDR ${util.ToCurrency(tempCart['grandTotal'] * 0)} `
}

const discount = util.ToInteger(document.querySelector('.discount-invoice p').innerHTML.split(' ')[1])

const grandTotalValue = tempCart['grandTotal'] - discount

const grandTotal = document.querySelector('#grand-total p')
grandTotal.innerHTML = `IDR ${util.ToCurrency(grandTotalValue)}`

if (tempCart['coupon']) {
  const couponUser = document.querySelector('#coupon-input')
  couponUser.value = tempCart['coupon']['code']
}

const container = document.querySelector('.container1')
Object.entries(tempCart['cart']).forEach(element => {
  const elementProperty = element[1]
  
  const elementCol = document.createElement('div')
  elementCol.classList = 'col-3'
  elementCol.innerHTML = `
    <div class="product-image">
        <img src="${elementProperty['productURL']} " class="img-fluid">
    </div>
    <div class="product-info d-relative">
        <div>
            <h5 class="fs-5 product-name mb-0">${elementProperty['productName']}</h5>
            <p class="mb-2"><em>${elementProperty['productCategory']} </em></p>
        </div>
        <div class="d-flex mb-1 justify-content-between align-items-center">
            <p class="mb-0" style="font-weight: 500;">Harga</p>
            <p class="mb-0" style="font-weight: 700;">IDR ${util.ToCurrency(elementProperty['productPrice'])}</p>
        </div>
        <div class="d-flex mb-1 justify-content-between align-items-centers">
            <label for="subQty" style="font-weight: 500;">Qty</label>
            <p style="text-align: right; font-weight: 700;">${elementProperty['qty']}</p>
        </div>
        <div>
            <p class="mb-0 fs-6">Sub Total</p>
            <h6 class="fs-7 product-total-price pb-2">IDR ${util.ToCurrency(elementProperty['productTotalPrice'])}</h6>
        </div>
    </div>
  `
  container.appendChild(elementCol)
})

document.querySelector('#apply-button').addEventListener('click', async () => {
  let tempCart = JSON.parse(localStorage.getItem('temp-cart'))
  if (!tempCart['coupon']) {
    tempCart['coupon'] = {}
  } else {
    alert('Are you sure want to change the coupon?')
    delete tempCart['coupon']
    tempCart['coupon'] = {}
    localStorage.setItem('temp-cart', JSON.stringify(tempCart))
    tempCart = JSON.parse(localStorage.getItem('temp-cart'))

    const discount = document.querySelector('.discount-invoice p')
    discount.innerHTML = util.ToCurrency(0)

    const grandTotal = document.querySelector('#grand-total p')
    grandTotal.innerHTML = `IDR ${util.ToCurrency(tempCart['grandTotal'])}`
  }

  const couponUser = document.querySelector('#coupon-input').value.trim().toUpperCase()
  if (couponUser == "") {
    return
  }

  const coupunFetch = await fetch(
    config.baseURL + '/inventory/coupons'
  ).then(response => errorHandling.HandlingFetchError(response))
  .then(response => response.json())
  .catch(error => errorHandling.PrintError(error))

  if (!coupunFetch['data'][couponUser]){
    alert('Coupon not active or not exist')
    delete tempCart['coupon']
    return
  } 

  tempCart['coupon']['code'] = couponUser
  tempCart['coupon']['percentDiscount'] = (coupunFetch['data'][couponUser]['amount'])/100

  const discount = tempCart['grandTotal'] * tempCart['coupon']['percentDiscount']
  tempCart['coupon']['discount'] = discount

  const discountInvoice = document.querySelector('.discount-invoice p')
  discountInvoice.innerHTML = `-IDR ${util.ToCurrency(discount)}`

  const grandTotal = document.querySelector('#grand-total p')
  const grandTotalValue = tempCart['grandTotal'] - discount
  grandTotal.innerHTML = `IDR ${util.ToCurrency(grandTotalValue)}`
  localStorage.setItem('temp-cart', JSON.stringify(tempCart))
})

document.querySelector('#checkout-button').addEventListener('click', async () => {
  const tempCart = JSON.parse(localStorage.getItem('temp-cart'))

  if (!tempCart || tempCart['subQty'] == 0) {
    alert('Cart must not empty')
    return
  }

  if (!confirm('System will creating the order, are you sure to checkout?')) {
    return
  }

  const invoiceModal = new bootstrap.Modal('#staticBackdropCheckoutInvoice', {
    backdrop: 'static'
  })
  invoiceModal.toggle()

  const briefInformation = document.querySelector('.brief-information')
  const payload = JSON.stringify({
    'items': Object.entries(tempCart['cart']).map(e => {
        return {
          'product_id': e[1].productId,
          'qty': e[1].qty
        }
      }),
    'coupon_code': tempCart['coupon'] ? tempCart.coupon.code : "",
  })

  console.log(payload);

  const token = util.GetUserJWTToken()

  Object.entries(tempCart.cart).forEach(async (e) => {
    await fetch(
      config.baseURL + '/usercart', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'product_id': e[1].productId,
          'qty': e[1].qty
        })
      }
    ).then(response => console.log(response.json()))
    .catch(error => console.log(error))
  })

  const checkoutFetch = await fetch(
    config.baseURL + '/usercart/checkout', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: payload
    }
  ).then(response =>  errorHandling.HandlingFetchError(response))
  .then(response => response.json())
  .catch(error => {errorHandling.PrintError(error)})

  if (checkoutFetch.error != null) {
    return
  }

  const userName = localStorage.getItem('profile.first-name') + localStorage.getItem('profile.last-name')
  const grandTotal = document.querySelector('#grand-total p').innerHTML

  briefInformation.querySelectorAll('.order-id p')[1].innerHTML = checkoutFetch.data.orderID
  briefInformation.querySelectorAll('.customer-name p')[1].innerHTML = userName
  briefInformation.querySelectorAll('.order-date p')[1].innerHTML = checkoutFetch.data.string.split(' ')[0]
  briefInformation.querySelectorAll('.order-time p')[1].innerHTML = checkoutFetch.data.string.split(' ')[1]
  briefInformation.querySelectorAll('.order-qty p')[1].innerHTML = tempCart['subQty']
  briefInformation.querySelectorAll('.grand-total p')[1].innerHTML = grandTotal
  briefInformation.querySelectorAll('.coupon-code p')[1].innerHTML = tempCart['coupon']['code']
  briefInformation.querySelectorAll('.discount-checkout p')[1].innerHTML = `-IDR ${util.ToCurrency(tempCart['coupon']['discount'])}`

  const cardContainer = document.querySelector('.modal-body .card-container')
  cardContainer.innerHTML = ''

  Object.entries(tempCart['cart']).forEach(async element => {
    const elementProperty = element[1]
  
    const elementCol = document.createElement('div')
    elementCol.classList = 'col-3'
    elementCol.innerHTML = `
      <div class="product-image">
          <img src="${elementProperty['productURL']} " class="img-fluid">
      </div>
      <div class="product-info d-relative">
          <div>
              <h5 class="fs-5 product-name mb-0">${elementProperty['productName']}</h5>
              <p class="mb-2"><em>${elementProperty['productCategory']} </em></p>
          </div>
          <div class="d-flex mb-1 justify-content-between align-items-center">
              <p class="mb-0" style="font-weight: 500;">Harga</p>
              <p class="mb-0" style="font-weight: 700;">IDR ${util.ToCurrency(elementProperty['productPrice'])}</p>
          </div>
          <div class="d-flex mb-1 justify-content-between align-items-centers">
              <label for="subQty" style="font-weight: 500;">Qty</label>
              <p style="text-align: right; font-weight: 700;">${elementProperty['qty']}</p>
          </div>
          <div>
              <p class="mb-0 fs-6">Sub Total</p>
              <h6 class="fs-7 product-total-price pb-2">IDR ${util.ToCurrency(elementProperty['productTotalPrice'])}</h6>
          </div>
      </div>
    `
    cardContainer.appendChild(elementCol)
  })
  document.querySelector('#close-invoice-button').addEventListener('click', (e) => {
    e.preventDefault()
    localStorage.removeItem('temp-cart')
    window.location.href('index.html')
  })
})

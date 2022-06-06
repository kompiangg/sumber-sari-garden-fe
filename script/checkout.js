import config from "./util/config.js"
import errorHandling from "./util/errorHandling.js"
import util from "./util/util.js"

const tempCart = JSON.parse(localStorage.getItem('temp-cart'))

const qty = document.querySelector('.quantity-all-items p')
qty.innerHTML = tempCart['subQty']

const grandTotalBeforeDiscount = document.querySelector('.semi-total p')
grandTotalBeforeDiscount.innerHTML = `IDR ${util.ToCurrency(tempCart['grandTotal'])}`

document.querySelector('.discount-invoice p').innerHTML = `-IDR ${util.ToCurrency(tempCart['grandTotal'] * tempCart['coupon']['percentDiscount'])} `
const discount = util.ToInteger(document.querySelector('.discount-invoice p').innerHTML.split(' ')[1])

const grandTotalValue = tempCart['grandTotal'] - discount

const grandTotal = document.querySelector('.grand-total p')
grandTotal.innerHTML = `IDR ${util.ToCurrency(grandTotalValue)}`

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

if (tempCart['coupon']) {
  const couponUser = document.querySelector('#coupon-input')
  couponUser.value = tempCart['coupon']['code']
}

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

    const grandTotal = document.querySelector('.grand-total p')
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

  const grandTotal = document.querySelector('.grand-total p')
  const grantTotalValue = tempCart['grandTotal'] - discount
  grandTotal.innerHTML = `IDR ${util.ToCurrency(grantTotalValue)}`
  localStorage.setItem('temp-cart', JSON.stringify(tempCart))
})
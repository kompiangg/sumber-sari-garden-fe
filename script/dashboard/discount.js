import config from "../util/config.js"
import errorHandling from "../util/errorHandling.js"
import util from "../util/util.js"

function resetInventoryForm(form) {
  form['coupon__code'].value = ''
  form['amount__discount'].value = 0
  form['coupon__description'].value = ''
  form['expired__at'].value = ''
}

function hasValue(input) {
	if (input.value.trim() === "") {
		return false
	}
	return true
}

function couponFormValidation(form) {
  let nameValid = hasValue(form['coupon__code'])
  let discountValid = +(form['amount__discount'].value.trim()) == 0 ? false : true
  let descValid = hasValue(form['coupon__description'])
  let expiredAtValid = hasValue(form['expired__at'])

  if (nameValid &&
    descValid &&
    discountValid &&
    expiredAtValid 
    ) {
      return true
  }
  return false
}

export function EditDataProduct() {
  const editButton = document.querySelector('.btn-edit-coupon')
  const form = document.getElementById('dashboard-edit-form')

  editButton.addEventListener('click', async (element) => {
    if (couponFormValidation(form) == false) {
      alert('All field must be filled')
      return
    }
    element.preventDefault()
    const couponId = form.dataset.couponId
    const payload = {
      code: form['coupon__code'].value.trim(),
      amount: +(form['amount__discount'].value.trim()),
      description: form['coupon__description'].value.trim(),
      expired_at: form['expired__at'].value.trim() + ' 23:00:00'
    }

    const userToken = util.GetUserJWTToken()
    const fetchEditProduct = await fetch(
      config.baseURL + '/inventory/coupons/' + couponId, {
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ' + userToken,
      },
      body: JSON.stringify(payload),
      credentials: 'include'
    }).then(response => errorHandling.HandlingFetchError(response))
      .then(response => response.json())
      .catch(error => errorHandling.HandlingFetchError(error))

    if (fetchEditProduct.error != null) {
      errorHandling.PrintError(error)
      return
    }

    const closeModalBtn = document.querySelector('.btn-modal-edit-close')
    closeModalBtn.click()

    resetInventoryForm(form)
    DiscountTable()
  })
}

export function PostNewCoupon() {
  const addButton = document.querySelector('.btn-add-new-coupon')
  const form = document.getElementById('dashboard-form')

  addButton.addEventListener('click', async (element) => {
    if (couponFormValidation(form) == false) {
      alert('All field must be filled')
      return
    }
    element.preventDefault()
    const payload = {
      code: form['coupon__code'].value.trim(),
      amount: +(form['amount__discount'].value.trim()),
      description: form['coupon__description'].value.trim(),
      expired_at: form['expired__at'].value.trim() + ' 23:00:00'
    }

    const userToken = util.GetUserJWTToken()
    const fetchAddProduct = await fetch(
      config.baseURL + '/inventory/coupons', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ' + userToken,
      },
      body: JSON.stringify(payload),
      credentials: 'include'
    }
    ).then(response => errorHandling.HandlingFetchError(response))
      .then(response => response.json())
      .catch(error => errorHandling.HandlingFetchError(error))

    if (fetchAddProduct.error != null) {
      errorHandling.PrintError(fetchAddProduct.error)
      return
    }

    const closeModalBtn = document.querySelector('.btn-modal-close')
    closeModalBtn.click()

    resetInventoryForm(form)
    DiscountTable()
  })
}

export async function DiscountTable() {
  const willDelete = document.querySelectorAll('.discount-item')
  willDelete.forEach(e => {
    e.remove()
  })

  const userToken = util.GetUserJWTToken()

  let activeCoupon = await fetch(
    config.baseURL + '/inventory/coupons?limit=1000'
    ).then(response => errorHandling.HandlingFetchError(response))
    .then(response => response.json())
    .catch(error => errorHandling.PrintError(error))
  
  if (activeCoupon.error != null) {
    errorHandling.PrintError(error)
    return
  }

  const isCouponValid = {}
  Object.entries(activeCoupon.data).forEach(element => {
    isCouponValid[`${element[1].code}`] = true
  })

  const allCoupon = await fetch(
    config.baseURL + '/inventory/coupons/all', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + userToken, 
    }
  }).then(response => errorHandling.HandlingFetchError(response))
    .then(response => response.json())
    .catch(error => errorHandling.PrintError(error))

  if (allCoupon.error != null) {
    errorHandling.PrintError(error)
    return
  }

  Object.entries(allCoupon.data).forEach(element => {
    element[1].isCouponValid = isCouponValid[`${element[1].code}`] ? true : false
  })

  const discountTable = document.querySelector('#discount-table tbody')

  if (allCoupon.data == null) {
    const node = document.createElement('tr')
    node.classList = 'discount-item'
    const each = `
      <td colspan="7" style="text-align: center; font-weight: 600;">Data not found</td>
    `
    node.innerHTML = each
    discountTable.appendChild(node)
  } else {
    Object.entries(allCoupon.data).forEach(e => {
      let element = e[1]
      const node = document.createElement('tr')
      node.classList = 'discount-item'
      node.dataset.couponId = element.coupon_id
      node.dataset.couponCode = element.code
      node.dataset.amountDiscount = element.amount
      node.dataset.description = element.description
      node.dataset.expiredAt = element.expired_at
      const each = `
        <td>${element.coupon_id}</td>
        <td>${element.code}</td>
        <td>${element.amount}</td>
        <td>${element.description}</td>
        <td>${element.expired_at}</td>
        <td style="text-align: center;">${element.isCouponValid ? '<span class="badge text-bg-success">Valid</span>':'<span class="badge text-bg-danger">Invalid</span>'}</td>
        <td style="text-align: center;"><a class="edit-coupon-item">edit</a> <a class="delete-coupon-item">delete</a></td>
      `
      node.innerHTML = each
      discountTable.appendChild(node)

      createDeleteEventListener(node.querySelector('.delete-coupon-item'))
      initGetDataListener(node.querySelector('.edit-coupon-item'))
    })
  }
}

function initGetDataListener(element) {
  element.addEventListener('click', async event => {
    event.preventDefault()

    const Modal = new bootstrap.Modal('#staticBackdropEditDiscount', {
      backdrop: 'static'
    })

    Modal.toggle()
    
    const form = document.getElementById('dashboard-edit-form')

    form.dataset.couponId = event.target.parentNode.parentNode.dataset.couponId
    form['coupon__code'].value = event.target.parentNode.parentNode.dataset.couponCode
    form['amount__discount'].value = event.target.parentNode.parentNode.dataset.amountDiscount
    form['expired__at'].value = event.target.parentNode.parentNode.dataset.expiredAt.split(' ')[0]
    form['coupon__description'].value = event.target.parentNode.parentNode.dataset.description

  })
}

function createDeleteEventListener(element) {
  element.addEventListener('click', async element => {
    element.preventDefault()
    if (confirm('Are you sure want to delete this coupon?') != true) {
      return
    }

    const couponId = element.target.parentNode.parentNode.dataset.couponId
    const userToken = util.GetUserJWTToken()

    const deleteItem = await fetch(config.baseURL + '/inventory/coupons/' + couponId, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Authorization': 'Bearer ' + userToken,
      }
    }).then(response => errorHandling.HandlingFetchError(response))
      .then(response => response.json())
      .catch(error => errorHandling.PrintError(error))

    if (deleteItem.error != null) {
      errorHandling.PrintError(deleteItem.error.message)
      return
    }

    element.target.parentNode.parentNode.remove()
  })
}
import config from "../util/config.js"
import errorHandling from "../util/errorHandling.js"
import util from "../util/util.js"

function resetInventoryForm(form) {
  form['product__name'].value = ''
  form['product__picture'].value = ''
  form['product__description'].value = ''
  form['product__price'].value = ''
  form['product__quantity'].value = ''
  form['product__category'].value = 1
}

function hasValue(input) {
	if (input.value.trim() === "") {
		return false
	}
	return true
}

function inventoryFormValidation(form) {
  let nameValid = hasValue(form['product__name'])
  let descValid = hasValue(form['product__description'])
  let pictValid = hasValue(form['product__picture'])
  let priceValid = +(form['product__price'].value.trim()) == 0 ? false : true
  let qtyValid = +(form['product__quantity'].value.trim()) == 0 ? false : true
  let product__category = +(form['product__category'].value.trim()) == 0 ? false : true

  if (nameValid &&
    descValid &&
    pictValid &&
    priceValid &&
    qtyValid 
    && product__category
    ) {
      return true
  }
  return false
}

export function EditDataProduct() {
  const editButton = document.querySelector('.btn-edit-product')
  const form = document.getElementById('dashboard-edit-form')

  editButton.addEventListener('click', async (element) => {
    if (inventoryFormValidation(form) == false) {
      alert('All field must be filled')
      return
    }
    element.preventDefault()
    const productId = form.dataset.productId
    const payload = {
      name: form['product__name'].value.trim(),
      picture_url: form['product__picture'].value.trim(),
      description: form['product__description'].value.trim(),
      price: +form['product__price'].value.trim(),
      qty: +form['product__quantity'].value.trim(),
      category_id: +form['product__category'].value.trim()
    }

    const userToken = util.GetUserJWTToken()
    const fetchEditProduct = await fetch(
      config.baseURL + '/inventory/products/' + productId, {
      method: 'PATCH',
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

    if (fetchEditProduct.error != null) {
      errorHandling.PrintError(error)
      return
    }

    const closeModalBtn = document.querySelector('.btn-modal-edit-close')
    closeModalBtn.click()

    resetInventoryForm(form)
    InventoryTable()
  })
}

export function PostNewProduct() {
  const addButton = document.querySelector('.btn-add-new-product')
  const form = document.getElementById('dashboard-form')

  addButton.addEventListener('click', async (element) => {
    if (inventoryFormValidation(form) == false) {
      alert('All field must be filled')
      return
    }
    element.preventDefault()
    const payload = {
      name: form['product__name'].value.trim(),
      picture_url: form['product__picture'].value.trim(),
      description: form['product__description'].value.trim(),
      price: +form['product__price'].value.trim(),
      qty: +form['product__quantity'].value.trim(),
      category_id: +form['product__category'].value.trim()
    }

    const userToken = util.GetUserJWTToken()
    const fetchAddProduct = await fetch(
      config.baseURL + '/inventory/products', {
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
    InventoryTable()
  })
}

async function GetCategoryOptions() {
  const categories = document.querySelectorAll('.product__category')

  const fetchCategory = await fetch(
    config.baseURL + '/inventory/category'
  ).then(response => errorHandling.HandlingFetchError(response))
    .then(response => response.json())
    .catch(error => errorHandling.PrintError(error))

  if (fetchCategory.error != null) {
    errorHandling.HandlingFetchError(fetchCategory.message)
    return
  }

  categories.forEach(category => {
    fetchCategory.data.forEach(e => {
      const optionNode = document.createElement('option')
      optionNode.value = e.id
      optionNode.innerHTML = e.name
      category.appendChild(optionNode)
    })
  })
}

export async function InventoryTable() {
  await GetCategoryOptions()

  const willDelete = document.querySelectorAll('.inventory-item')
  willDelete.forEach(e => {
    e.remove()
  })

  const allProducts = await fetch(
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

  const inventoryTable = document.querySelector('#inventory-table tbody')

  if (allProducts.data.products == null) {
    const node = document.createElement('tr')
    node.classList = 'inventory-item'
    const each = `
      <td colspan="8" style="text-align: center; font-weight: 600;">Data not found</td>
    `
    node.innerHTML = each
    inventoryTable.appendChild(node)
  } else {
    allProducts.data.products.forEach(element => {
      const node = document.createElement('tr')
      node.classList = 'inventory-item'
      node.dataset.productId = element.id
      const each = `
        <td>${element.id}</td>
        <td>${element.product_name}</td>
        <td>${element.category_name}</td>
        <td>${element.qty}</td>
        <td>${element.price}</td>
        <td>${element.description}</td>
        <td><a href='${element.picture_url}'>Link</a></td>
        <td><a class="edit-inventory-item" target='_blank'>edit</a> <a class="delete-inventory-item">delete</a></td>
      `
      node.innerHTML = each
      inventoryTable.appendChild(node)

      createDeleteEventListener(node.querySelector('.delete-inventory-item'))
      initGetDataListener(node.querySelector('.edit-inventory-item'))
    })
  }
}

function initGetDataListener(element) {
  element.addEventListener('click', async event => {
    event.preventDefault()

    const Modal = new bootstrap.Modal('#staticBackdropEditProduct', {
      backdrop: 'static'
    })

    Modal.toggle()

    const productId = event.target.parentNode.parentNode.dataset.productId
    const willUpdateItem = await fetch(config.baseURL + '/inventory/products/' + productId)
      .then(response => errorHandling.HandlingFetchError(response))
      .then(response => response.json())
      .catch(error => errorHandling.PrintError(error))

    if (willUpdateItem.error != null) {
      errorHandling.PrintError(error)
      return
    }

    const form = document.getElementById('dashboard-edit-form')

    form['product__name'].value = willUpdateItem.data.product_name
    form['product__picture'].value = willUpdateItem.data.picture_url
    form['product__description'].value = willUpdateItem.data.description
    form['product__price'].value = willUpdateItem.data.price
    form['product__quantity'].value = willUpdateItem.data.qty
    form['product__category'].value = willUpdateItem.data.category_id
    form.dataset.productId = willUpdateItem.data.id
  })
}

function createDeleteEventListener(element) {
  element.addEventListener('click', async event => {
    event.preventDefault()
    if (confirm('Are you sure want to delete this product?') != true) {
      return
    }

    const productId = event.target.parentNode.parentNode.dataset.productId
    const userToken = util.GetUserJWTToken()

    const deleteItem = await fetch(config.baseURL + '/inventory/products/' + productId, {
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

    event.target.parentNode.parentNode.remove()
  })
}
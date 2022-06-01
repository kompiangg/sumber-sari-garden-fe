import config from "../util/config.js"
import errorHandling from "../util/errorHandling.js"
import util from "../util/util.js"

function resetInventoryForm(form) {
  form['category__name'].value = ''
}

function hasValue(input) {
	if (input.value.trim() === "") {
		return false
	}
	return true
}

function inventoryFormValidation(form) {
  let nameValid = hasValue(form['category__name'])

  if (nameValid) {
      return true
  }
  return false
}

export function EditCategoryProduct() {
  const editButton = document.querySelector('.btn-edit-product')
  const form = document.getElementById('dashboard-edit-form')

  editButton.addEventListener('click', async (element) => {
    if (inventoryFormValidation(form) == false) {
      alert('All field must be filled')
      return
    }
    element.preventDefault()
    const categoryId = form.dataset.categoryId
    const payload = {
      category_name: form['category__name'].value.trim(),
    }

    const userToken = util.GetUserJWTToken()
    const fetchEditProduct = await fetch(
      config.baseURL + '/inventory/category/' + categoryId, {
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
    CategoryTable()
  })
}

export function PostNewCategory() {
  const addButton = document.querySelector('.btn-add-new-product')
  const form = document.getElementById('dashboard-form')

  addButton.addEventListener('click', async (element) => {
    if (inventoryFormValidation(form) == false) {
      alert('All field must be filled')
      return
    }
    element.preventDefault()
    const payload = {
      category_name: form['category__name'].value.trim(),
    }

    const userToken = util.GetUserJWTToken()
    const fetchAddProduct = await fetch(
      config.baseURL + '/inventory/category', {
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
    CategoryTable()
  })
}

export async function CategoryTable() {
  const willDelete = document.querySelectorAll('.inventory-item')
  willDelete.forEach(e => {
    e.remove()
  })

  const fetchCategory = await fetch(
    config.baseURL + '/inventory/category'
  ).then(response => errorHandling.HandlingFetchError(response))
    .then(response => response.json())
    .catch(error => errorHandling.PrintError(error))

  if (fetchCategory.error != null) {
    errorHandling.HandlingFetchError(fetchCategory.message)
    return
  }

  const inventoryTable = document.querySelector('#category-table tbody')

  if (fetchCategory.data == null) {
    const node = document.createElement('tr')
    node.classList = 'inventory-item'
    const each = `
      <td colspan="3" style="text-align: center; font-weight: 600;">Data not found</td>
    `
    node.innerHTML = each
    inventoryTable.appendChild(node)
  } else {
    fetchCategory.data.forEach(element => {
      const node = document.createElement('tr')
      node.classList = 'category-item'
      node.dataset.categoryId = element.id
      node.dataset.categoryName = element.name
      const each = `
        <td>${element.id}</td>
        <td>${element.name}</td>
        <td class="text-center"><a class="edit-inventory-item" target='_blank'>edit</a> <a class="delete-inventory-item">delete</a></td>
      `
      node.innerHTML = each
      inventoryTable.appendChild(node)

      initDeleteEventListener(node.querySelector('.delete-inventory-item'))
      initEditDataListener(node.querySelector('.edit-inventory-item'))
    })
  }
}

function initEditDataListener(element) {
  element.addEventListener('click', async event => {
    event.preventDefault()

    const Modal = new bootstrap.Modal('#staticBackdropEditCategory', {
      backdrop: 'static'
    })

    Modal.toggle()

    const categoryId = event.target.parentNode.parentNode.dataset.categoryId
    const categoryName = event.target.parentNode.parentNode.dataset.categoryName

    const form = document.getElementById('dashboard-edit-form')

    form['category__name'].value = categoryName
    form.dataset.categoryId = categoryId
  })
}

function initDeleteEventListener(element) {
  element.addEventListener('click', async event => {
    event.preventDefault()
    if (confirm('Are you sure want to delete this product?') != true) {
      return
    }

    const categoryId = event.target.parentNode.parentNode.dataset.categoryId
    const userToken = util.GetUserJWTToken()

    const deleteItem = await fetch(config.baseURL + '/inventory/category/' + categoryId, {
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
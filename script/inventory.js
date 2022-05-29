import config from "./util/config.js"
import errorHandling from "./util/errorHandling.js"
import util from "./util/util.js"

document.addEventListener('click', async (element) => {
  if (element.target.id != "inventory-button") {
    return
  }

  util.ToggleSidebarItem(element)
})

export async function InventoryTable() {
  const allProducts = await fetch(config.baseURL + '/inventory/products')
    .then(response => errorHandling.HandlingFetchError(response))
    .then(response => response.json())
    .catch(error => errorHandling.PrintError(error))

  const inventoryTable = document.querySelector('#inventory-table tbody')

  if (allProducts.data.products == null) {
    const node = document.createElement('tr')

    const each = `
      <td colspan="8" style="text-align: center;">Data not found</td>
    `
    node.innerHTML = each
    inventoryTable.appendChild(node)
  } else {
    allProducts.data.products.forEach(element => {
      const node = document.createElement('tr')
      node.dataset.productId = element.id
      const each = `
        <td>${element.id}</td>
        <td>${element.product_name}</td>
        <td>${element.category_name}</td>
        <td>${element.qty}</td>
        <td>${element.price}</td>
        <td>${element.description}</td>
        <td><a href='${element.picture_url}'>Link</a></td>
        <td><a class="edit-inventory-item">edit</a> <a class="delete-inventory-item">delete</a></td>
      `
      node.innerHTML = each
      inventoryTable.appendChild(node)
    })
  }
}

export function CreateDeleteEventListener() {
  const allDeleteInventory = document.querySelectorAll('.delete-inventory-item')
  allDeleteInventory.forEach(element => {
    element.addEventListener('click', event => {
      event.preventDefault()
      const productId = event.target.parentNode.parentNode.dataset.productId

      const deleteItem = fetch(config.baseURL + '/inventory/products/' + productId, {
        method: 'DELETE',
        credentials: 'include',
      }).then(response => errorHandling.HandlingFetchError(response))
        .then(response => response.json())
        .catch(error => errorHandling.PrintError(error))

      if (deleteItem.error != null) {
        errorHandling.PrintError(deleteItem.error.message)
        return
      }

      event.target.parentNode.parentNode.remove()
    })
  })
}
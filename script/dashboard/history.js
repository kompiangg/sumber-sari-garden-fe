import config from "../util/config.js"
import errorHandling from "../util/errorHandling.js"
import util from "../util/util.js"

export async function InventoryTable() {
  const willDelete = document.querySelectorAll('.history-item')
  willDelete.forEach(e => {
    e.remove()
  })

  const userToken = util.GetUserJWTToken()

  const allHistory = await fetch(
    config.baseURL + '/usercart/history/all', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken,
      },
    }
  ).then(response => errorHandling.HandlingFetchError(response))
    .then(response => response.json())
    .catch(error => errorHandling.PrintError(error))

    const inventoryTable = document.querySelector('#history-table tbody')
    
    if (allHistory.data.length == 0) {
      const node = document.createElement('tr')
      node.classList = 'inventory-item'
      const each = `
      <td colspan="8" style="text-align: center; font-weight: 600;">Data not found</td>
      `
      node.innerHTML = each
      inventoryTable.appendChild(node)
    } else {
      allHistory.data.forEach(async element => {
        if (element.order_status != 'Cart') {
          const userProfile = await fetch(
            config.baseURL + '/users/profile/' + element.user_id, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + userToken,
              },
            }).then(response => errorHandling.HandlingFetchError(response))
            .then(response => response.json())
            .catch(error => errorHandling.PrintError(error))

          const orderDate = element.order_date.split(' ')
          const node = document.createElement('tr')
          
          node.classList = 'history-item'
          node.dataset.userName = userProfile.data.first_name + ' ' + userProfile.data.last_name
          node.dataset.historyId = element.order_id

          const each = `
            <td>${element.order_id}</td>
            <td>${userProfile.data.first_name + ' ' + userProfile.data.last_name}</td>
            <td>${orderDate[0]}<br>${orderDate[1]}</td>
            <td>${element.item_count}</td>
            <td>${element.grand_total}</td>
            <td style="text-align: center">${element.order_status == "Paid" ? 
              `<span class="badge text-bg-success">${element.order_status}</span>` : 
              `<span class="badge text-bg-danger">${element.order_status}</span>
              <br><span class="badge text-bg-warning verification-button">Verification</span>`}</td>
            <td><a class="information-detail">More...</a></td>
          `
          node.innerHTML = each
          inventoryTable.appendChild(node)
          createMoreDataEventListener(node.querySelector('.information-detail'))
          if (element.order_status != "Paid") {
            createVerificationEventListener(node.querySelector('.verification-button'))
          }
        }
    })
  }
}

function createMoreDataEventListener(element) {
  element.addEventListener('click', async event => {
    event.preventDefault()

    const Modal = new bootstrap.Modal('#staticBackdropMoreHistory', {
      backdrop: 'static'
    })

    Modal.toggle()

    const userToken = util.GetUserJWTToken()
    const userName = element.parentNode.parentNode.dataset.userName
    const historyId = element.parentNode.parentNode.dataset.historyId
    const briefInformationFetch = await fetch(
      config.baseURL + '/usercart/history/' + historyId, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + userToken,
        },
      }).then(response => errorHandling.HandlingFetchError(response))
      .then(response => response.json())
      .catch(error => errorHandling.PrintError(error))
    
    const briefInformation = document.querySelector('.brief-information')

    briefInformation.querySelectorAll('.order-id p')[1].innerHTML = briefInformationFetch.data.order_id
    briefInformation.querySelectorAll('.customer-name p')[1].innerHTML = userName
    briefInformation.querySelectorAll('.order-date p')[1].innerHTML = briefInformationFetch.data.order_date.split(' ')[0]
    briefInformation.querySelectorAll('.order-time p')[1].innerHTML = briefInformationFetch.data.order_date.split(' ')[1]
    briefInformation.querySelectorAll('.order-status p')[1].innerHTML = briefInformationFetch.data.order_status == 'Paid' ?
            `<span class="badge text-bg-success">${briefInformationFetch.data.order_status}</span>` : 
            `<span class="badge text-bg-danger">${briefInformationFetch.data.order_status}</span>
            <span class="badge text-bg-warning" id="verification-button">Verification</span>`
    briefInformation.querySelectorAll('.order-qty p')[1].innerHTML = briefInformationFetch.data.item_count
    briefInformation.querySelectorAll('.grand-total p')[1].innerHTML = briefInformationFetch.data.grand_total
    briefInformation.querySelectorAll('.coupon-code p')[1].innerHTML = briefInformationFetch.data.coupon_code

    const cardContainer = document.querySelector('.modal-body .card-container')
    cardContainer.innerHTML = ''

    briefInformationFetch.data.items.forEach(async element => {
      const productId = element.product_id
      const productInformationFetch = await fetch(
          config.baseURL + '/inventory/products/' + productId
        ).then(response => errorHandling.HandlingFetchError(response))
        .then(response => response.json())
        .catch(error => errorHandling.PrintError(error))
      
      const each = document.createElement('div')
      each.classList = 'card mb-6'
      each.style = 'width: 18rem;'
      each.innerHTML = `
      <img src="${productInformationFetch.data.picture_url}" class="card-img-top" alt="${productInformationFetch.data.product_name} Picture">
      <div class="card-body">
        <p class="card-text mb-0"><strong>${productInformationFetch.data.product_name}</strong></p>
        <p class="card-text mb-0"><em>${productInformationFetch.data.category_name}</em></p>
        <p class="card-text mb-0">Rp${productInformationFetch.data.price}</p>
        <p class="card-text mb-0">${productInformationFetch.data.qty} Items</p>
        <p class="card-text" style="font-weight: 500;">Rp${productInformationFetch.data.price}</p>
      </div>
      `
      cardContainer.appendChild(each)
    })
  })
}

function createVerificationEventListener(element){
  element.addEventListener('click', async element => {
    if (!confirm('Are you sure want to verif this order?')) {
      return
    }

    const orderId = element.target.parentNode.parentNode.dataset.historyId
    const userToken = util.GetUserJWTToken()
    await fetch(
      config.baseURL + '/usercart/verify/' + orderId, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + userToken,
        },
      }).then(response => errorHandling.HandlingFetchError(response))
      .then(response => response.json())
      .catch(error => errorHandling.PrintError(error))
    
    InventoryTable()
  })
}
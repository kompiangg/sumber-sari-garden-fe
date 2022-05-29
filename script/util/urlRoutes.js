import InventoryTable from "../inventory.js"

const urlRoutes = {
  404: {
    template: '404.html',
    title: '',
    description: ''
  },
  '/dashboard.html': {
    template: '/dashboard/inventory.html',
    title: '',
    description: '',
    initFunc: function () {
      InventoryTable()
    }
  },
  '/dashboard.html#inventory': {
    template: '/dashboard/inventory.html',
    title: '',
    description: '',
    initFunc: function () {
      InventoryTable()
    }
  },
  '/dashboard.html#verification': {
    template: '/dashboard/verification.html',
    title: '',
    description: '',
    initFunc: function () {

    }
  },
  '/dashboard.html#discount': {
    template: '/dashboard/discount.html',
    title: '',
    description: '',
    description: '',
    initFunc: function () {

    }
  }
}

export default urlRoutes
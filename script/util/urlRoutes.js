// import InventoryTable from "../inventory.js"
import * as inventory from '../dashboard/inventory.js'
import * as category from '../dashboard/category.js'
import * as history from '../dashboard/history.js'

const mainTitle = 'Dashboard'

const urlRoutes = {
  404: {
    template: '404.html',
    title: '404 Not Found',
    description: ''
  },
  '/dashboard.html': {
    template: '/dashboard/inventory.html',
    title: 'Inventory | ' + mainTitle,
    description: '',
    initFunc: async function () {
      await inventory.InventoryTable()
      inventory.PostNewProduct()
      inventory.EditDataProduct()
    }
  },
  '/dashboard.html#inventory': {
    template: '/dashboard/inventory.html',
    title: 'Inventory | ' + mainTitle,
    description: '',
    initFunc: async function () {
      await inventory.InventoryTable()
      inventory.PostNewProduct()
      inventory.EditDataProduct()
    }
  },
  '/dashboard.html#category': {
    template: '/dashboard/category.html',
    title: 'Category | ' + mainTitle,
    description: '',
    initFunc: async function () {
      await category.CategoryTable()
      category.PostNewCategory()
      category.EditCategoryProduct()
    }
  },
  '/dashboard.html#discount': {
    template: '/dashboard/discount.html',
    title: 'Discount | ' + mainTitle,
    description: '',
    description: '',
    initFunc: async function () {

    }
  },
  '/dashboard.html#history': {
    template: '/dashboard/history.html',
    title: 'history | ' + mainTitle,
    description: '',
    description: '',
    initFunc: async function () {
      await history.InventoryTable()
    }
  }
}

export default urlRoutes
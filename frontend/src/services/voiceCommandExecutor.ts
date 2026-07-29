import type { Intent, IntentResult } from '@/types/voice'
import { navigationController } from './navigationController'

export interface ExecutionResult {
  success: boolean
  response: string
  action:
    | 'navigate'
    | 'scroll'
    | 'speak'
    | 'search'
    | 'cart'
    | 'repeat'
    | 'stop'
    | 'none'
  data?: unknown
}

export function executeIntent(
  intent: Intent,
  result: IntentResult
): ExecutionResult {
  switch (intent) {
    case 'GO_HOME':
      navigationController.execute('home')
      return {
        success: true,
        response: result.response,
        action: 'navigate',
        data: '/',
      }

    case 'GO_BACK':
      navigationController.execute('back')
      return {
        success: true,
        response: result.response,
        action: 'navigate',
        data: 'back',
      }

    case 'GO_FORWARD':
      navigationController.execute('forward')
      return {
        success: true,
        response: result.response,
        action: 'navigate',
        data: 'forward',
      }

    case 'OPEN_CART':
      navigationController.execute('cart')
      return {
        success: true,
        response: result.response,
        action: 'navigate',
        data: '/cart',
      }

    case 'OPEN_WISHLIST':
      navigationController.execute('wishlist')
      return {
        success: true,
        response: result.response,
        action: 'navigate',
        data: '/wishlist',
      }

    case 'TRACK_ORDER':
      navigationController.execute('orders')
      return {
        success: true,
        response: result.response,
        action: 'navigate',
        data: '/orders',
      }

    case 'OPEN_PROFILE':
      navigationController.execute('profile')
      return {
        success: true,
        response: result.response,
        action: 'navigate',
        data: '/profile',
      }

    case 'OPEN_SETTINGS':
      navigationController.execute('settings')
      return {
        success: true,
        response: result.response,
        action: 'navigate',
        data: '/accessibility',
      }

    case 'OPEN_CATEGORY':
      navigationController.execute('categories')
      return {
        success: true,
        response: result.response,
        action: 'navigate',
        data: '/categories',
      }

    case 'CHECKOUT':
    case 'PLACE_ORDER':
      navigationController.execute('checkout')
      return {
        success: true,
        response: result.response,
        action: 'navigate',
        data: '/checkout',
      }

    case 'SEARCH_PRODUCT': {
      const query = (result.entities.query as string) || ''
      navigationController.execute('search', query)
      return {
        success: true,
        response: result.response,
        action: 'search',
        data: query,
      }
    }

    case 'FILTER_RESULTS': {
      const filter = (result.entities.filter as string) || ''
      const maxPrice = (result.entities.max_price as number) || 0
      const minPrice = (result.entities.min_price as number) || 0
      const params = new URLSearchParams(window.location.search)
      if (filter) params.set('q', filter)
      if (maxPrice) params.set('max_price', String(maxPrice))
      if (minPrice) params.set('min_price', String(minPrice))
      window.history.pushState(
        null,
        '',
        `${window.location.pathname}?${params}`
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
      return { success: true, response: result.response, action: 'search' }
    }

    case 'SORT_RESULTS': {
      const sort = (result.entities.sort as string) || 'rating'
      const params = new URLSearchParams(window.location.search)
      params.set('sort_by', sort)
      window.history.pushState(
        null,
        '',
        `${window.location.pathname}?${params}`
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
      return { success: true, response: result.response, action: 'search' }
    }

    case 'ADD_TO_CART':
    case 'INCREASE_QUANTITY': {
      const productName = (result.entities.product_name as string) || ''
      const qty = (result.entities.quantity as number) || 1
      return {
        success: true,
        response:
          result.response ||
          (productName ? `Adding ${productName} to cart.` : 'Adding to cart.'),
        action: 'cart',
        data: { product_name: productName, quantity: qty },
      }
    }

    case 'REMOVE_FROM_CART':
    case 'DECREASE_QUANTITY': {
      const removeName = (result.entities.product_name as string) || ''
      return {
        success: true,
        response:
          result.response ||
          (removeName
            ? `Removing ${removeName} from cart.`
            : 'Removing from cart.'),
        action: 'cart',
        data: { product_name: removeName, remove: true },
      }
    }

    case 'OPEN_PRODUCT': {
      const idx = (result.entities.product_index as number) || 1
      return {
        success: true,
        response: result.response,
        action: 'navigate',
        data: { index: idx },
      }
    }

    case 'READ_PRODUCT':
      return {
        success: true,
        response: result.response,
        action: 'speak',
        data: result.entities.product_name || '',
      }

    case 'SCROLL': {
      const direction = (result.entities.direction as string) || 'down'
      navigationController.execute(
        direction === 'up' ? 'scroll_up' : 'scroll_down'
      )
      return { success: true, response: result.response, action: 'scroll' }
    }

    case 'STOP':
      return { success: true, response: '', action: 'stop' }

    case 'REPEAT':
      return { success: true, response: '', action: 'repeat' }

    case 'CONFIRM':
      return { success: true, response: '', action: 'none' }

    case 'CANCEL':
      return { success: true, response: 'Cancelled.', action: 'none' }

    case 'GREETING':
    case 'HELP':
      return { success: true, response: result.response, action: 'speak' }

    case 'APPLY_COUPON':
      return {
        success: true,
        response: `Applying coupon ${result.entities.coupon || ''}.`,
        action: 'none',
        data: result.entities,
      }

    case 'SAVE_FOR_LATER':
    case 'MOVE_TO_WISHLIST':
      return {
        success: true,
        response: result.response,
        action: 'none',
        data: result.entities,
      }

    case 'SET_EMAIL':
      return {
        success: true,
        response: result.response,
        action: 'none',
        data: result.entities,
      }

    case 'UNKNOWN':
    default:
      return { success: false, response: result.response, action: 'speak' }
  }
}

import type { Intent, IntentResult } from '@/types/voice'
import { navigationController } from './navigationController'

export interface RouterAction {
  type:
    | 'navigate'
    | 'scroll'
    | 'speak'
    | 'repeat'
    | 'stop'
    | 'search'
    | 'filter'
    | 'sort'
    | 'add_to_cart'
    | 'remove_from_cart'
    | 'open_product'
    | 'read_product'
    | 'none'
  payload?: unknown
}

export function routeIntent(
  intent: Intent,
  result: IntentResult
): RouterAction {
  switch (intent) {
    case 'GO_HOME':
      navigationController.execute('home')
      return { type: 'navigate', payload: '/' }

    case 'GO_BACK':
      navigationController.execute('back')
      return { type: 'navigate', payload: 'back' }

    case 'GO_FORWARD':
      navigationController.execute('forward')
      return { type: 'navigate', payload: 'forward' }

    case 'OPEN_CART':
      navigationController.execute('cart')
      return { type: 'navigate', payload: '/cart' }

    case 'OPEN_WISHLIST':
      navigationController.execute('wishlist')
      return { type: 'navigate', payload: '/wishlist' }

    case 'TRACK_ORDER':
      navigationController.execute('orders')
      return { type: 'navigate', payload: '/orders' }

    case 'OPEN_PROFILE':
      navigationController.execute('profile')
      return { type: 'navigate', payload: '/profile' }

    case 'OPEN_SETTINGS':
      navigationController.execute('settings')
      return { type: 'navigate', payload: '/accessibility' }

    case 'OPEN_CATEGORY':
      navigationController.execute('categories')
      return { type: 'navigate', payload: '/categories' }

    case 'CHECKOUT':
      navigationController.execute('checkout')
      return { type: 'navigate', payload: '/checkout' }

    case 'SEARCH_PRODUCT': {
      const query = (result.entities.query as string) || ''
      navigationController.execute('search', query)
      return { type: 'search', payload: query }
    }

    case 'FILTER_RESULTS': {
      const filter = (result.entities.filter as string) || ''
      const maxPrice = (result.entities.max_price as number) || 0
      const params = new URLSearchParams()
      if (filter) params.set('q', filter)
      if (maxPrice) params.set('max_price', String(maxPrice))
      const qs = params.toString()
      navigationController.setNavigator?.(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__navigate
      )
      if (qs) {
        window.history.pushState(null, '', `/shop?${qs}`)
        window.dispatchEvent(new PopStateEvent('popstate'))
      }
      return { type: 'filter', payload: result.entities }
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
      return { type: 'sort', payload: sort }
    }

    case 'ADD_TO_CART':
      return { type: 'add_to_cart', payload: result.entities }

    case 'REMOVE_FROM_CART':
      return { type: 'remove_from_cart', payload: result.entities }

    case 'OPEN_PRODUCT': {
      const idx = (result.entities.product_index as number) || 1
      return { type: 'open_product', payload: { index: idx } }
    }

    case 'READ_PRODUCT':
      return {
        type: 'read_product',
        payload: result.entities.product_name || '',
      }

    case 'SCROLL': {
      const direction = (result.entities.direction as string) || 'down'
      navigationController.execute(
        direction === 'up' ? 'scroll_up' : 'scroll_down'
      )
      return { type: 'scroll', payload: direction }
    }

    case 'STOP':
      return { type: 'stop' }

    case 'REPEAT':
      return { type: 'repeat' }

    case 'CONFIRM':
      return { type: 'none' }

    case 'CANCEL':
      return { type: 'none' }

    case 'INCREASE_QUANTITY':
      return { type: 'add_to_cart', payload: result.entities }

    case 'DECREASE_QUANTITY':
      return { type: 'remove_from_cart', payload: result.entities }

    case 'APPLY_COUPON':
      return { type: 'none' }

    case 'SAVE_FOR_LATER':
      return { type: 'none' }

    case 'MOVE_TO_WISHLIST':
      return { type: 'none' }

    case 'GREETING':
    case 'HELP':
    case 'UNKNOWN':
    default:
      return { type: 'speak' }
  }
}

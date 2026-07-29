import type { NavigateFunction } from 'react-router-dom'
import type { NavigationCommand } from '@/types/voice'

export class NavigationController {
  private navigate: NavigateFunction | null = null

  setNavigator(nav: NavigateFunction): void {
    this.navigate = nav
  }

  get isReady(): boolean {
    return this.navigate !== null
  }

  execute(command: NavigationCommand, payload?: string): boolean {
    switch (command) {
      case 'home':
        this.navigate?.('/')
        return true
      case 'categories':
        this.navigate?.('/categories')
        return true
      case 'cart':
        this.navigate?.('/cart')
        return true
      case 'wishlist':
        this.navigate?.('/wishlist')
        return true
      case 'orders':
        this.navigate?.('/orders')
        return true
      case 'profile':
        this.navigate?.('/profile')
        return true
      case 'settings':
        this.navigate?.('/accessibility')
        return true
      case 'accessibility':
        this.navigate?.('/accessibility')
        return true
      case 'search':
        this.navigate?.(
          `/shop${payload ? `?q=${encodeURIComponent(payload)}` : ''}`
        )
        return true
      case 'checkout':
        this.navigate?.('/checkout')
        return true
      case 'back':
        this.navigate?.(-1 as unknown as string)
        return true
      case 'forward':
        this.navigate?.(1 as unknown as string)
        return true
      case 'scroll_up':
        window.scrollBy({ top: -300, behavior: 'smooth' })
        return true
      case 'scroll_down':
        window.scrollBy({ top: 300, behavior: 'smooth' })
        return true
      case 'login':
        this.navigate?.('/login')
        return true
      case 'register':
        this.navigate?.('/register')
        return true
      case 'product':
        if (payload) {
          this.navigate?.(`/products/${payload}`)
          return true
        }
        return false
      default:
        return false
    }
  }

  navigateToProduct(productId: string): void {
    this.navigate?.(`/products/${productId}`)
  }

  navigateToCategory(slug: string): void {
    this.navigate?.(`/shop?category=${slug}`)
  }

  navigateToSearch(query: string): void {
    this.navigate?.(`/shop?q=${encodeURIComponent(query)}`)
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  scrollToBottom(): void {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }
}

export const navigationController = new NavigationController()

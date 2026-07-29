import type { NavigateFunction } from 'react-router-dom'
import type { NavigationCommand } from '@/types/voice'

export class NavigationController {
  private navigate: NavigateFunction | null = null

  setNavigator(nav: NavigateFunction): void {
    this.navigate = nav
  }

  execute(command: NavigationCommand, payload?: string): boolean {
    if (!this.navigate) return false

    switch (command) {
      case 'home':
        this.navigate('/')
        return true
      case 'categories':
        this.navigate('/categories')
        return true
      case 'cart':
        this.navigate('/cart')
        return true
      case 'wishlist':
        this.navigate('/wishlist')
        return true
      case 'orders':
        this.navigate('/orders')
        return true
      case 'profile':
        this.navigate('/profile')
        return true
      case 'settings':
        this.navigate('/accessibility')
        return true
      case 'accessibility':
        this.navigate('/accessibility')
        return true
      case 'search':
        this.navigate(
          `/shop${payload ? `?q=${encodeURIComponent(payload)}` : ''}`
        )
        return true
      case 'checkout':
        this.navigate('/checkout')
        return true
      case 'back':
        this.navigate(-1 as unknown as string)
        return true
      case 'forward':
        this.navigate(1 as unknown as string)
        return true
      case 'scroll_up':
        window.scrollBy({ top: -300, behavior: 'smooth' })
        return true
      case 'scroll_down':
        window.scrollBy({ top: 300, behavior: 'smooth' })
        return true
      default:
        return false
    }
  }

  navigateToProduct(productId: string): void {
    if (this.navigate) {
      this.navigate(`/products/${productId}`)
    }
  }

  navigateToCategory(slug: string): void {
    if (this.navigate) {
      this.navigate(`/shop?category=${slug}`)
    }
  }
}

export const navigationController = new NavigationController()

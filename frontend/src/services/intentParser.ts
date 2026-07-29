import type { Intent, IntentResult } from '@/types/voice'
import type { VoiceProcessResponse } from './voice'

export function isConfirmationIntent(intent: Intent): boolean {
  return intent === 'CONFIRM' || intent === 'CANCEL'
}

export function isSensitiveAction(intent: Intent): boolean {
  return [
    'CHECKOUT',
    'PLACE_ORDER',
    'CANCEL_ORDER',
    'DELETE_WISHLIST',
  ].includes(intent)
}

export function requiresConfirmation(
  intent: Intent,
  confidence: number
): boolean {
  return isSensitiveAction(intent) || confidence < 0.6
}

export function mapResponseToIntent(resp: VoiceProcessResponse): IntentResult {
  return {
    intent: resp.intent as Intent,
    confidence: resp.confidence,
    entities: {},
    response: resp.response,
  }
}

const FALLBACK_INTENTS: Array<{
  patterns: RegExp[]
  intent: Intent
  extract: (match: RegExpMatchArray) => Record<string, unknown>
}> = [
  {
    patterns: [/^(?:hello|hi|hey|good morning|good evening|good afternoon)\b/i],
    intent: 'GREETING',
    extract: () => ({}),
  },
  {
    patterns: [
      /^(?:what can you do|help|how (?:can you|do you) help|commands)\b/i,
    ],
    intent: 'HELP',
    extract: () => ({}),
  },
  {
    patterns: [
      /^(?:go to\s+)?home(?:\s*page)?$/i,
      /^(?:take me to|navigate to|open)\s+home/i,
    ],
    intent: 'GO_HOME',
    extract: () => ({}),
  },
  {
    patterns: [
      /^(?:go\s+)?back$/i,
      /^(?:go to|navigate to)\s+previous(?: page)?$/i,
    ],
    intent: 'GO_BACK',
    extract: () => ({}),
  },
  {
    patterns: [/^(?:go\s+)?forward$/i, /^next(?:\s+page)?$/i],
    intent: 'GO_FORWARD',
    extract: () => ({}),
  },
  {
    patterns: [
      /^(?:show|open|view|go to)\s+(?:my\s+)?(?:shopping\s+)?cart$/i,
      /^cart$/i,
    ],
    intent: 'OPEN_CART',
    extract: () => ({}),
  },
  {
    patterns: [
      /^(?:show|open|view|go to)\s+(?:my\s+)?wishlist$/i,
      /^wishlist$/i,
    ],
    intent: 'OPEN_WISHLIST',
    extract: () => ({}),
  },
  {
    patterns: [
      /^(?:show|open|view|go to)\s+(?:my\s+)?(?:orders|order\s*history)$/i,
    ],
    intent: 'TRACK_ORDER',
    extract: () => ({}),
  },
  {
    patterns: [/^(?:show|open|view|go to)\s+(?:my\s+)?profile$/i, /^profile$/i],
    intent: 'OPEN_PROFILE',
    extract: () => ({}),
  },
  {
    patterns: [/^(?:open|go to)\s+(?:settings|preferences)$/i, /^settings$/i],
    intent: 'OPEN_SETTINGS',
    extract: () => ({}),
  },
  {
    patterns: [/^(?:open|go to)\s+(?:accessibility|accessibility settings)$/i],
    intent: 'OPEN_SETTINGS',
    extract: () => ({}),
  },
  {
    patterns: [
      /^(?:show|open|view|go to)\s+(?:categories|category)$/i,
      /^categories$/i,
    ],
    intent: 'OPEN_CATEGORY',
    extract: () => ({}),
  },
  {
    patterns: [
      /^(?:checkout|buy now|place order|purchase|proceed to checkout)$/i,
    ],
    intent: 'CHECKOUT',
    extract: () => ({}),
  },
  {
    patterns: [/^(?:scroll\s+)?down$/i, /^scroll down$/i],
    intent: 'SCROLL',
    extract: () => ({ direction: 'down' }),
  },
  {
    patterns: [/^(?:scroll\s+)?up$/i, /^scroll up$/i],
    intent: 'SCROLL',
    extract: () => ({ direction: 'up' }),
  },
  {
    patterns: [
      /^(?:add|put)\s+(?:(?:\d+)\s+)?(.*?)\s+(?:to|in|into)\s+(?:the\s+)?cart$/i,
    ],
    intent: 'ADD_TO_CART',
    extract: (m) => {
      const name = m[1]?.trim()
      const qtyMatch = m[0].match(/(\d+)/)
      return {
        product_name: name,
        quantity: qtyMatch ? parseInt(qtyMatch[1]) : 1,
      }
    },
  },
  {
    patterns: [
      /^(?:remove|delete|take out)\s+(.*?)\s+(?:from|of)\s+(?:the\s+)?cart$/i,
    ],
    intent: 'REMOVE_FROM_CART',
    extract: (m) => ({ product_name: m[1]?.trim() }),
  },
  {
    patterns: [
      /^(?:read|tell|describe|about|details)\s+(?:me\s+)?(?:about\s+)?(.*?)(?:\s*product)?$/i,
    ],
    intent: 'READ_PRODUCT',
    extract: (m) => ({ product_name: m[1]?.trim() }),
  },
  {
    patterns: [
      /^(?:open|show|view|go to)\s+(?:product\s+)?(\d+)(?:st|nd|rd|th)?$/i,
      /^(?:the\s+)?(?:first|second|third|fourth|fifth|last)\s+(?:one|product|item)$/i,
      /^(?:show|open)\s+(?:the\s+)?(?:first|second|third|fourth|fifth|last)$/i,
    ],
    intent: 'OPEN_PRODUCT',
    extract: (m) => {
      const wordMap: Record<string, number> = {
        first: 1,
        second: 2,
        third: 3,
        fourth: 4,
        fifth: 5,
        last: -1,
      }
      let idx = m[1] ? parseInt(m[1]) : 0
      if (isNaN(idx)) {
        const word = m[0]
          .match(/(first|second|third|fourth|fifth|last)/i)?.[1]
          ?.toLowerCase()
        idx = word ? wordMap[word] || 0 : 0
      }
      return { product_index: idx }
    },
  },
  {
    patterns: [
      /^(?:find|search|show|look for|need|want|get|buy)\s+(.+)$/i,
      /^search\s+(?:for\s+)?(.+)$/i,
    ],
    intent: 'SEARCH_PRODUCT',
    extract: (m) => ({ query: m[1]?.trim() }),
  },
  {
    patterns: [
      /^(?:only|just|filter by|brand)\s+(.+)$/i,
      /^show\s+(?:only|just)\s+(.+)$/i,
    ],
    intent: 'FILTER_RESULTS',
    extract: (m) => ({ filter: m[1]?.trim() }),
  },
  {
    patterns: [
      /^(?:sort\s+(?:by\s+)?)?(?:price|cheapest|most expensive|rating|newest|name)$/i,
      /^(?:sort|order)\s+(?:by\s+)?(.+)$/i,
    ],
    intent: 'SORT_RESULTS',
    extract: (m) => {
      const text = m[0].toLowerCase()
      if (text.includes('cheapest') || text.includes('lowest'))
        return { sort: 'price_asc' }
      if (text.includes('expensive') || text.includes('highest'))
        return { sort: 'price_desc' }
      if (text.includes('rating') || text.includes('best'))
        return { sort: 'rating' }
      if (text.includes('newest')) return { sort: 'newest' }
      if (text.includes('name')) return { sort: 'name' }
      const by = m[1]?.toLowerCase().trim()
      if (by === 'price' || by === 'price low to high' || by === 'low to high')
        return { sort: 'price_asc' }
      if (by === 'price high to low' || by === 'high to low')
        return { sort: 'price_desc' }
      return { sort: 'rating' }
    },
  },
  {
    patterns: [
      /^(?:increase|add|more)\s+(?:the\s+)?(?:quantity|count)\s+(?:of\s+)?(.*?)(?:\s+by\s+(\d+))?$/i,
    ],
    intent: 'INCREASE_QUANTITY',
    extract: (m) => ({
      product_name: m[1]?.trim(),
      quantity: m[2] ? parseInt(m[2]) : 1,
    }),
  },
  {
    patterns: [
      /^(?:decrease|reduce|less|fewer)\s+(?:the\s+)?(?:quantity|count)\s+(?:of\s+)?(.*?)(?:\s+by\s+(\d+))?$/i,
    ],
    intent: 'DECREASE_QUANTITY',
    extract: (m) => ({
      product_name: m[1]?.trim(),
      quantity: m[2] ? parseInt(m[2]) : 1,
    }),
  },
  {
    patterns: [/^(?:apply|use|add)\s+(?:coupon|code|promo|discount)\s+(.+)$/i],
    intent: 'APPLY_COUPON',
    extract: (m) => ({ coupon: m[1]?.trim() }),
  },
  {
    patterns: [
      /^(?:yes|yeah|sure|confirm|correct|right|that's right|go ahead)$/i,
    ],
    intent: 'CONFIRM',
    extract: () => ({}),
  },
  {
    patterns: [/^(?:no|nope|cancel|stop|never mind|don't|not now|forget it)$/i],
    intent: 'CANCEL',
    extract: () => ({}),
  },
  {
    patterns: [
      /^(?:stop|shut up|be quiet|silence|that's enough)$/i,
      /^(?:stop\s+)?speaking$/i,
    ],
    intent: 'STOP',
    extract: () => ({}),
  },
  {
    patterns: [
      /^(?:repeat|say that again|what did you say|pardon|come again)$/i,
    ],
    intent: 'REPEAT',
    extract: () => ({}),
  },
  {
    patterns: [
      /^under\s+(?:₹|rs\.?\s*|inr\s*|\$|usd\s*)?(\d+(?:,\d+)?(?:\.\d+)?)$/i,
      /^(?:under|below|less than|max|up to|within)\s+(?:₹|rs\.?\s*|inr\s*|\$|usd\s*)?(\d+(?:,\d+)?(?:\.\d+)?)$/i,
    ],
    intent: 'FILTER_RESULTS',
    extract: (m) => ({ max_price: parseFloat(m[1].replace(',', '')) }),
  },
  {
    patterns: [/^(?:save for later|save)\s+(.*?)$/i],
    intent: 'SAVE_FOR_LATER',
    extract: (m) => ({ product_name: m[1]?.trim() }),
  },
  {
    patterns: [/^(?:move|transfer)\s+(.*?)\s+(?:to\s+)?wishlist$/i],
    intent: 'MOVE_TO_WISHLIST',
    extract: (m) => ({ product_name: m[1]?.trim() }),
  },
]

export function parseLocally(text: string): IntentResult | null {
  const cleaned = text.trim().replace(/[.:!?]+$/, '')
  for (const entry of FALLBACK_INTENTS) {
    for (const pattern of entry.patterns) {
      const match = cleaned.match(pattern)
      if (match) {
        return {
          intent: entry.intent,
          confidence: 0.8,
          entities: entry.extract(match),
          response: localResponse(entry.intent, match, cleaned),
        }
      }
    }
  }
  return null
}

function localResponse(
  intent: Intent,
  match: RegExpMatchArray,
  original: string
): string {
  switch (intent) {
    case 'GREETING':
      return 'Hello! Welcome to InclusiveCart AI. How can I help you today?'
    case 'HELP':
      return 'I can help you search for products, add items to your cart, place orders, track shipments, or just explore the store. What would you like to do?'
    case 'GO_HOME':
      return 'Taking you to the home page.'
    case 'GO_BACK':
      return 'Going back.'
    case 'GO_FORWARD':
      return 'Going forward.'
    case 'OPEN_CART':
      return 'Opening your shopping cart.'
    case 'OPEN_WISHLIST':
      return 'Opening your wishlist.'
    case 'TRACK_ORDER':
      return 'Opening your orders page.'
    case 'OPEN_PROFILE':
      return 'Opening your profile.'
    case 'OPEN_SETTINGS':
      return 'Opening settings.'
    case 'OPEN_CATEGORY':
      return 'Opening categories.'
    case 'CHECKOUT':
      return 'Proceeding to checkout. Would you like me to continue?'
    case 'SCROLL':
      return match[0].toLowerCase().includes('up')
        ? 'Scrolling up.'
        : 'Scrolling down.'
    case 'ADD_TO_CART':
      return `Adding ${match[1] || 'item'} to your cart.`
    case 'REMOVE_FROM_CART':
      return `Removing ${match[1] || 'item'} from your cart.`
    case 'READ_PRODUCT':
      return `Here are the details for ${match[1] || 'the product'}.`
    case 'OPEN_PRODUCT':
      return `Opening product.`
    case 'SEARCH_PRODUCT':
      return `Searching for ${match[1] || original}.`
    case 'FILTER_RESULTS':
      return match[1] ? `Filtering by ${match[1]}.` : 'Filtering results.'
    case 'SORT_RESULTS':
      return 'Sorting results.'
    case 'STOP':
      return 'Stopping.'
    case 'REPEAT':
      return 'Repeating last message.'
    case 'CONFIRM':
      return 'Confirmed.'
    case 'CANCEL':
      return 'Cancelled.'
    default:
      return `Searching for ${original}.`
  }
}

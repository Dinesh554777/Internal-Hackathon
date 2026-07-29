import json
import re
from groq import Groq
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.services.product_service import ProductService

settings = get_settings()

SYSTEM_PROMPT = """You are a voice shopping assistant for InclusiveCart AI, an inclusive e-commerce platform. Analyze the user's spoken request and return ONLY a JSON object with:
- intent: one of the defined intents
- confidence: float 0-1
- entities: object with extracted information
- response: a friendly spoken response string (1-2 sentences, conversational)

AVAILABLE INTENTS:
- SEARCH_PRODUCT: search for products. Extract: query, category, product_name, max_price, min_price, brand, features (list), sort_by
- FILTER_RESULTS: filter current results. Extract: filter, brand, max_price, min_price, category
- SORT_RESULTS: sort results. Extract: sort (price_asc, price_desc, rating, newest, name)
- OPEN_PRODUCT: open a specific product. Extract: product_index (number), product_name
- READ_PRODUCT: read product details aloud. Extract: product_name
- COMPARE_PRODUCTS: compare products. Extract: product_names (list of 2+)
- ADD_TO_CART: add item to cart. Extract: product_name, quantity (default 1)
- REMOVE_FROM_CART: remove from cart. Extract: product_name
- OPEN_CART: view shopping cart
- CHECKOUT: proceed to checkout (requires confirmation)
- TRACK_ORDER: view order tracking. Extract: order_id
- OPEN_PROFILE: view user profile
- OPEN_SETTINGS: open settings/accessibility
- OPEN_CATEGORY: browse categories. Extract: category_name
- OPEN_WISHLIST: view wishlist
- GO_HOME: navigate to home page
- GO_BACK: go to previous page
- GO_FORWARD: go forward
- HELP: list available commands
- STOP: stop speaking
- REPEAT: repeat last message
- SCROLL: scroll page. Extract: direction (up/down)
- INCREASE_QUANTITY: increase item quantity. Extract: product_name, quantity
- DECREASE_QUANTITY: decrease item quantity. Extract: product_name, quantity
- APPLY_COUPON: apply coupon code. Extract: coupon
- SAVE_FOR_LATER: save item for later
- MOVE_TO_WISHLIST: move item to wishlist
- CONFIRM: confirm a sensitive action
- CANCEL: cancel a sensitive action
- GREETING: initial greeting
- UNKNOWN: unrecognized command

RULES:
- For SEARCH_PRODUCT: extract as much detail as possible about what the user wants
- For FILTER_RESULTS: only applies when there's an active search context
- For OPEN_PRODUCT: "second one" or "show third" means product_index. "first"=1, "second"=2, etc.
- Sort commands: "cheapest" = price_asc, "most expensive" = price_desc, "best rated" = rating, "newest" = newest
- Currency: rupees/₹ = INR, dollars/$ = USD. Always normalize to numbers.
- NEVER include passwords or sensitive data in responses
- Keep responses concise for speech synthesis (max 2 sentences)
- Use friendly, conversational language

EXAMPLES:
User: "Find Bluetooth headphones under 2000 rupees"
Assistant: {"intent":"SEARCH_PRODUCT","confidence":0.95,"entities":{"category":"Bluetooth headphones","max_price":2000,"currency":"INR"},"response":"Searching for Bluetooth headphones under 2000 rupees."}

User: "Show the second one"
Assistant: {"intent":"OPEN_PRODUCT","confidence":0.9,"entities":{"product_index":2},"response":"Opening the second product."}

User: "Add 2 wireless mice to cart"
Assistant: {"intent":"ADD_TO_CART","confidence":0.95,"entities":{"product_name":"wireless mouse","quantity":2},"response":"Adding 2 wireless mice to your cart."}

User: "Only HP laptops"
Assistant: {"intent":"FILTER_RESULTS","confidence":0.85,"entities":{"brand":"HP","category":"laptops"},"response":"Filtering by HP laptops."}

User: "Sort by cheapest"
Assistant: {"intent":"SORT_RESULTS","confidence":0.9,"entities":{"sort":"price_asc"},"response":"Sorting by lowest price."}

User: "Only Nike"
Assistant: {"intent":"FILTER_RESULTS","confidence":0.8,"entities":{"brand":"Nike"},"response":"Showing only Nike products."}

User: "Under 50000"
Assistant: {"intent":"FILTER_RESULTS","confidence":0.85,"entities":{"max_price":50000},"response":"Filtering products under 50000."}

User: "What can you do"
Assistant: {"intent":"HELP","confidence":0.95,"entities":{},"response":"I can help you search for products, add items to your cart, place orders, track shipments, or just explore the store. What would you like to do?"}

User: "Go back"
Assistant: {"intent":"GO_BACK","confidence":0.95,"entities":{},"response":"Going back."}

User: "Checkout"
Assistant: {"intent":"CHECKOUT","confidence":0.9,"entities":{},"response":"Proceeding to checkout. Would you like me to continue?"}

User: "Yes"
Assistant: {"intent":"CONFIRM","confidence":0.9,"entities":{},"response":"Confirmed."}

User: "Scroll down"
Assistant: {"intent":"SCROLL","confidence":0.95,"entities":{"direction":"down"},"response":"Scrolling down."}

User: "Read product details"
Assistant: {"intent":"READ_PRODUCT","confidence":0.85,"entities":{},"response":"Reading product details."}"""


class VoiceAssistantService:
    def __init__(self, db: Session | None = None):
        self.db = db
        self.client = Groq(api_key=settings.groq_api_key) if settings.groq_api_key else None
        self.conversation_history: list[dict] = []
        self.last_search_results: list[dict] = []
        self.last_context: dict = {}

    def process(self, text: str) -> dict:
        if not self.client:
            return self._fallback_parse(text)

        self.conversation_history.append({"role": "user", "content": text})

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            *self._get_context_messages(),
        ]

        try:
            response = self.client.chat.completions.create(
                model="mixtral-8x7b-32768",
                messages=messages,
                temperature=0.1,
                max_tokens=500,
            )
            content = response.choices[0].message.content.strip()
            parsed = self._parse_json(content)
            if parsed:
                self.conversation_history.append({
                    "role": "assistant",
                    "content": parsed.get("response", ""),
                })
                return parsed

            return self._fallback_parse(text)
        except Exception:
            return self._fallback_parse(text)

    def _get_context_messages(self) -> list[dict]:
        context = list(self.conversation_history[-8:])
        if self.last_context:
            context.insert(0, {
                "role": "system",
                "content": f"Context: Current page is {self.last_context.get('page', 'unknown')}. "
                           f"Last search was for '{self.last_context.get('last_search', '')}'. "
                           f"Found {self.last_context.get('result_count', 0)} products.",
            })
        return context

    def _parse_json(self, content: str) -> dict | None:
        try:
            json_match = re.search(r"\{.*\}", content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return json.loads(content)
        except (json.JSONDecodeError, ValueError):
            return None

    def _fallback_parse(self, text: str) -> dict:
        text_lower = text.lower().strip()

        if re.match(r"^(yes|yeah|sure|confirm|correct|right|that's right|go ahead)$", text_lower):
            return {"intent": "CONFIRM", "confidence": 0.9, "entities": {}, "response": "Confirmed."}

        if re.match(r"^(no|nope|cancel|stop|never mind|don't|not now|forget it)$", text_lower):
            return {"intent": "CANCEL", "confidence": 0.9, "entities": {}, "response": "Cancelled."}

        if re.match(r"^(hello|hi |hey|good morning|good evening|good afternoon)\b", text_lower):
            return {"intent": "GREETING", "confidence": 0.9, "entities": {}, "response": "Hello! Welcome to InclusiveCart AI. How can I help you today?"}

        if re.match(r"^(what can you do|help|how (?:can you|do you) help|commands)\b", text_lower):
            return {"intent": "HELP", "confidence": 0.9, "entities": {}, "response": "I can help you search for products, add items to your cart, place orders, track shipments, or just explore the store. What would you like to do?"}

        if re.match(r"^(go to |take me to |navigate to |open )?home$", text_lower) or "go to home" in text_lower:
            return {"intent": "GO_HOME", "confidence": 0.9, "entities": {}, "response": "Taking you to the home page."}

        if re.match(r"^(go )?back$|^previous$|^go to previous", text_lower):
            return {"intent": "GO_BACK", "confidence": 0.9, "entities": {}, "response": "Going back."}

        if re.match(r"^(go )?forward$|^next$", text_lower):
            return {"intent": "GO_FORWARD", "confidence": 0.9, "entities": {}, "response": "Going forward."}

        if re.search(r"(cart|shopping cart|show cart|open cart|my cart)", text_lower):
            return {"intent": "OPEN_CART", "confidence": 0.9, "entities": {}, "response": "Opening your shopping cart."}

        if re.search(r"(wishlist|my wishlist|open wishlist|show wishlist)", text_lower):
            return {"intent": "OPEN_WISHLIST", "confidence": 0.9, "entities": {}, "response": "Opening your wishlist."}

        if re.search(r"(checkout|buy now|place order|purchase|proceed to checkout)", text_lower):
            return {"intent": "CHECKOUT", "confidence": 0.9, "entities": {}, "response": "Proceeding to checkout. Would you like me to continue?"}

        if re.search(r"(order|track|shipment|delivery|where is my)", text_lower):
            return {"intent": "TRACK_ORDER", "confidence": 0.8, "entities": {}, "response": "Opening your order tracking page."}

        if re.search(r"(profile|my profile|my account|account settings)", text_lower):
            return {"intent": "OPEN_PROFILE", "confidence": 0.9, "entities": {}, "response": "Opening your profile."}

        if re.search(r"(settings|preferences|accessibility)", text_lower):
            return {"intent": "OPEN_SETTINGS", "confidence": 0.9, "entities": {}, "response": "Opening settings."}

        if re.search(r"(categories|category|browse)", text_lower):
            return {"intent": "OPEN_CATEGORY", "confidence": 0.9, "entities": {}, "response": "Opening categories."}

        if re.match(r"^(scroll )?down$", text_lower):
            return {"intent": "SCROLL", "confidence": 0.95, "entities": {"direction": "down"}, "response": "Scrolling down."}

        if re.match(r"^(scroll )?up$", text_lower):
            return {"intent": "SCROLL", "confidence": 0.95, "entities": {"direction": "up"}, "response": "Scrolling up."}

        if re.match(r"^(stop|shut up|be quiet|silence|that's enough|stop speaking)$", text_lower):
            return {"intent": "STOP", "confidence": 0.9, "entities": {}, "response": "Stopping."}

        if re.match(r"^(repeat|say that again|what did you say|pardon|come again)$", text_lower):
            return {"intent": "REPEAT", "confidence": 0.9, "entities": {}, "response": "Repeating last message."}

        sort_match = re.search(r"(?:sort\s+(?:by\s+)?)?(price|cheapest|most expensive|rating|newest|name)", text_lower)
        if sort_match:
            sort_text = sort_match.group(1).lower()
            sort_map = {
                "cheapest": "price_asc", "price": "price_asc",
                "most expensive": "price_desc",
                "rating": "rating", "best": "rating",
                "newest": "newest",
                "name": "name",
            }
            return {
                "intent": "SORT_RESULTS",
                "confidence": 0.85,
                "entities": {"sort": sort_map.get(sort_text, "rating")},
                "response": f"Sorting by {sort_text}.",
            }

        product_index_match = re.search(r"(?:the\s+)?(first|second|third|fourth|fifth|last)\s+(?:one|product|item)?$|^(\d+)(?:st|nd|rd|th)$", text_lower)
        if product_index_match:
            word_map = {"first": 1, "second": 2, "third": 3, "fourth": 4, "fifth": 5, "last": -1}
            idx = None
            if product_index_match.group(1):
                idx = word_map.get(product_index_match.group(1), 0)
            elif product_index_match.group(2):
                idx = int(product_index_match.group(2))
            if idx:
                return {
                    "intent": "OPEN_PRODUCT",
                    "confidence": 0.85,
                    "entities": {"product_index": idx},
                    "response": f"Opening product number {idx}.",
                }

        price_match = re.search(r"(?:under|below|less than|max|up to|within)\s*(?:₹|rs\.?\s*|inr\s*|\$|usd\s*)?(\d+(?:,\d+)?(?:\.\d+)?)", text_lower)
        max_price = float(price_match.group(1).replace(",", "")) if price_match else None

        filter_match = re.search(r"^(?:only|just|filter by|show only|show just)\s+(.+)$", text_lower)
        if filter_match:
            return {"intent": "FILTER_RESULTS", "confidence": 0.8, "entities": {"filter": filter_match.group(1).strip()}, "response": f"Filtering by {filter_match.group(1).strip()}."}

        add_match = re.search(r"(?:add|put|include)\s*(?:(\d+)\s+)?(.+?)\s*(?:to|in|into)\s*(?:the\s+)?cart", text_lower)
        if add_match:
            qty = int(add_match.group(1)) if add_match.group(1) else 1
            product_name = add_match.group(2).strip()
            return {"intent": "ADD_TO_CART", "confidence": 0.85, "entities": {"product_name": product_name, "quantity": qty}, "response": f"Adding {qty} {product_name} to your cart."}

        remove_match = re.search(r"(?:remove|delete|take\s+out)\s+(.+?)\s*(?:from|of)\s*(?:the\s+)?cart", text_lower)
        if remove_match:
            product_name = remove_match.group(1).strip()
            return {"intent": "REMOVE_FROM_CART", "confidence": 0.85, "entities": {"product_name": product_name}, "response": f"Removing {product_name} from your cart."}

        read_match = re.search(r"(?:read|tell|describe|about|details)\s*(?:me\s*)?(?:about\s*)?(.+?)(?:\s*product)?$", text_lower)
        if read_match and read_match.group(1).strip():
            return {"intent": "READ_PRODUCT", "confidence": 0.8, "entities": {"product_name": read_match.group(1).strip()}, "response": f"Here are the details for {read_match.group(1).strip()}."}

        category_match = re.search(r"(?:find|search|show|look for|need|want|get|buy)\s+(.+?)(?:\s+(?:under|below|less than|between|for|in|with|that|which)|$)", text_lower)
        if category_match:
            category = category_match.group(1).strip()
            entities = {"query": category}
            if max_price:
                entities["max_price"] = max_price
            response_parts = [f"Searching for {category}"]
            if max_price:
                response_parts.append(f"under {int(max_price)} rupees")
            return {"intent": "SEARCH_PRODUCT", "confidence": 0.85, "entities": entities, "response": " ".join(response_parts) + "."}

        if max_price:
            return {"intent": "FILTER_RESULTS", "confidence": 0.7, "entities": {"max_price": max_price}, "response": f"Filtering products under {int(max_price)} rupees."}

        if text_lower.strip():
            return {"intent": "SEARCH_PRODUCT", "confidence": 0.5, "entities": {"query": text}, "response": f"Searching for {text}."}

        return {"intent": "UNKNOWN", "confidence": 0.3, "entities": {}, "response": "I didn't understand that. Could you please repeat?"}

    def execute_intent(self, intent_data: dict) -> dict:
        intent = intent_data.get("intent", "HELP")
        entities = intent_data.get("entities", {})
        response_text = intent_data.get("response", "")

        result = {"intent": intent, "response": response_text, "action": None, "data": None}

        if intent == "SEARCH_PRODUCT" and self.db:
            service = ProductService(self.db)
            params = {}
            query = entities.get("query") or entities.get("category") or entities.get("product_name", "")
            if query:
                params["search"] = query
            if entities.get("max_price"):
                params["max_price"] = float(entities["max_price"])
            if entities.get("min_price"):
                params["min_price"] = float(entities["min_price"])
            if entities.get("sort_by"):
                params["sort_by"] = entities["sort_by"]

            products, total = service.get_all(limit=10, **params)
            result["data"] = products
            self.last_search_results = products
            self.last_context = {
                "page": "shop",
                "last_search": query,
                "result_count": total,
            }

            if total == 0:
                result["response"] = "I couldn't find any products matching that. Try a different search?"
            else:
                names = [p["name"] for p in products[:5]]
                name_list = ", ".join(names)
                more = f" and {total - 5} more" if total > 5 else ""
                result["response"] = f"I found {total} products. Here are some: {name_list}{more}."
            result["action"] = "navigate_search"

        elif intent == "OPEN_PRODUCT":
            idx = entities.get("product_index", 1)
            if isinstance(idx, int) and self.last_search_results:
                if idx == -1:
                    idx = len(self.last_search_results)
                actual_idx = idx - 1
                if 0 <= actual_idx < len(self.last_search_results):
                    product = self.last_search_results[actual_idx]
                    result["data"] = product
                    result["response"] = f"Opening {product['name']}."
                    result["action"] = "navigate_product"
                else:
                    result["response"] = f"I only have {len(self.last_search_results)} products. Please choose a different number."
            else:
                result["response"] = "Please search for products first, then select one."

        elif intent == "READ_PRODUCT" and self.db:
            service = ProductService(self.db)
            product_name = entities.get("product_name", "")
            if product_name:
                products, _ = service.get_all(search=product_name, limit=1)
                if products:
                    p = products[0]
                    result["data"] = p
                    price_text = f"Price: {int(p['price'])} rupees."
                    discount_text = f" Discounted from {int(p.get('originalPrice', p['price']))} rupees." if p.get('discount', 0) > 0 else ""
                    rating_text = f" Rating: {p['rating']} out of 5."
                    brand_text = f" Brand: {p.get('brand', 'N/A')}."
                    desc = p['description'][:200]
                    result["response"] = f"{p['name']}. {brand_text} {price_text}{discount_text}{rating_text} {desc}"
                    result["action"] = "read_product"
                else:
                    result["response"] = f"I couldn't find a product called {product_name}."

        elif intent == "FILTER_RESULTS":
            result["action"] = "filter_results"
            if self.last_search_results:
                filter_val = entities.get("filter", "")
                brand = entities.get("brand", "")
                max_p = entities.get("max_price")
                filtered = self.last_search_results
                if filter_val:
                    filtered = [p for p in filtered if filter_val.lower() in p["name"].lower() or filter_val.lower() in p.get("brand", "").lower()]
                if brand:
                    filtered = [p for p in filtered if brand.lower() in p.get("brand", "").lower()]
                if max_p:
                    filtered = [p for p in filtered if p["price"] <= float(max_p)]
                result["data"] = filtered
                if filtered:
                    names = [p["name"] for p in filtered[:3]]
                    result["response"] = f"Found {len(filtered)} matching products. {', '.join(names)}."
                else:
                    result["response"] = "No products match that filter."
            else:
                result["response"] = "No active search to filter. Try searching first."

        elif intent == "SORT_RESULTS":
            result["action"] = "sort_results"
            result["data"] = entities.get("sort", "rating")

        elif intent in ["OPEN_CART", "GO_HOME", "GO_BACK", "GO_FORWARD", "OPEN_WISHLIST",
                         "OPEN_PROFILE", "OPEN_SETTINGS", "OPEN_CATEGORY", "CHECKOUT", "TRACK_ORDER"]:
            action_map = {
                "OPEN_CART": "navigate_cart",
                "GO_HOME": "navigate_home",
                "GO_BACK": "navigate_back",
                "GO_FORWARD": "navigate_forward",
                "OPEN_WISHLIST": "navigate_wishlist",
                "OPEN_PROFILE": "navigate_profile",
                "OPEN_SETTINGS": "navigate_settings",
                "OPEN_CATEGORY": "navigate_categories",
                "CHECKOUT": "navigate_checkout",
                "TRACK_ORDER": "navigate_orders",
            }
            result["action"] = action_map.get(intent, "none")

        elif intent == "ADD_TO_CART":
            result["action"] = "add_to_cart"
            result["data"] = entities

        elif intent == "REMOVE_FROM_CART":
            result["action"] = "remove_from_cart"
            result["data"] = entities

        elif intent == "INCREASE_QUANTITY":
            result["action"] = "increase_quantity"
            result["data"] = entities

        elif intent == "DECREASE_QUANTITY":
            result["action"] = "decrease_quantity"
            result["data"] = entities

        elif intent == "APPLY_COUPON":
            result["action"] = "apply_coupon"
            result["data"] = entities

        elif intent == "COMPARE_PRODUCTS" and self.db:
            service = ProductService(self.db)
            names = entities.get("product_names", [])
            products_data = []
            for name in names:
                prods, _ = service.get_all(search=name, limit=1)
                if prods:
                    products_data.append(prods[0])
            result["data"] = products_data
            if len(products_data) >= 2:
                result["response"] = f"Comparing {products_data[0]['name']} and {products_data[1]['name']}."
            else:
                result["response"] = "I need at least two products to compare."

        elif intent == "CONFIRM":
            result["action"] = "confirm"

        elif intent == "CANCEL":
            result["action"] = "cancel"

        elif intent in ["HELP", "GREETING", "STOP", "REPEAT", "UNKNOWN"]:
            result["action"] = "none"

        elif intent == "SCROLL":
            result["action"] = "scroll"
            result["data"] = entities

        return result

    def clear_history(self):
        self.conversation_history.clear()
        self.last_search_results.clear()
        self.last_context.clear()

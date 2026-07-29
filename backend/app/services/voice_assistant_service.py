import json
import re
from groq import Groq
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.services.product_service import ProductService

settings = get_settings()

SYSTEM_PROMPT = """You are a voice shopping assistant for InclusiveCart AI.
Analyze the user's spoken request and return a JSON object with:
- intent: one of SEARCH_PRODUCT, OPEN_CART, ADD_TO_CART, REMOVE_PRODUCT, READ_PRODUCT, COMPARE_PRODUCTS, CHECKOUT, TRACK_ORDER, GO_HOME, GO_BACK, HELP, GREETING
- confidence: float 0-1
- entities: object with extracted info (category, price, product_name, etc.)
- response: a friendly spoken response string

Rules:
- SEARCH_PRODUCT: extract category, product_name, max_price, min_price, features (list)
- ADD_TO_CART: extract product_name, quantity (default 1)
- REMOVE_PRODUCT: extract product_name
- READ_PRODUCT: extract product_name
- COMPARE_PRODUCTS: extract product_names (list of 2+)
- For GREETING/HELP, respond warmly
- Never include passwords or sensitive data
- Keep responses concise for speech synthesis (1-2 sentences)
- Convert currency: rupees/₹ to INR, dollars/$ to USD

Examples:
"Find Bluetooth headphones under 2000 rupees" → {"intent":"SEARCH_PRODUCT","entities":{"category":"Bluetooth headphones","max_price":2000,"currency":"INR"}}
"Add 2 wireless mice to cart" → {"intent":"ADD_TO_CART","entities":{"product_name":"wireless mouse","quantity":2}}
"Show my cart" → {"intent":"OPEN_CART","entities":{}}
"Go back" → {"intent":"GO_BACK","entities":{}}
"Take me home" → {"intent":"GO_HOME","entities":{}}
"What can you do" → {"intent":"HELP","entities":{}}
"Hello" → {"intent":"GREETING","entities":{}}"""


class VoiceAssistantService:
    def __init__(self, db: Session | None = None):
        self.db = db
        self.client = Groq(api_key=settings.groq_api_key) if settings.groq_api_key else None
        self.conversation_history: list[dict] = []

    def process(self, text: str) -> dict:
        if not self.client:
            return self._fallback_parse(text)

        self.conversation_history.append({"role": "user", "content": text})

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            *self.conversation_history[-6:],
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
                self.conversation_history.append({"role": "assistant", "content": parsed.get("response", "")})
                return parsed

            return self._fallback_parse(text)
        except Exception:
            return self._fallback_parse(text)

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

        if any(word in text_lower for word in ["hello", "hi ", "hey", "good morning", "good evening"]):
            return {"intent": "GREETING", "confidence": 0.9, "entities": {}, "response": "Hello! Welcome to InclusiveCart AI. How can I help you today?"}

        if any(word in text_lower for word in ["help", "what can you", "what do you"]):
            return {"intent": "HELP", "confidence": 0.9, "entities": {}, "response": "I can help you search for products, add items to your cart, place orders, track shipments, or just explore the store. What would you like to do?"}

        if any(word in text_lower for word in ["home", "go to home", "main page", "start"]):
            return {"intent": "GO_HOME", "confidence": 0.9, "entities": {}, "response": "Taking you to the home page."}

        if any(word in text_lower for word in ["go back", "back", "previous"]):
            return {"intent": "GO_BACK", "confidence": 0.9, "entities": {}, "response": "Going back."}

        if any(word in text_lower for word in ["cart", "my cart", "shopping cart", "show cart", "open cart"]):
            return {"intent": "OPEN_CART", "confidence": 0.9, "entities": {}, "response": "Opening your shopping cart."}

        if any(word in text_lower for word in ["checkout", "buy now", "place order", "purchase"]):
            return {"intent": "CHECKOUT", "confidence": 0.9, "entities": {}, "response": "Proceeding to checkout."}

        if any(word in text_lower for word in ["order", "track", "shipment", "delivery"]):
            return {"intent": "TRACK_ORDER", "confidence": 0.8, "entities": {}, "response": "Opening your order tracking page."}

        price_match = re.search(r"(?:under|below|less than|max|up to|within)\s*(?:₹|rs\.?\s*|inr\s*)?(\d+(?:,\d+)?(?:\.\d+)?)", text_lower, re.IGNORECASE)
        max_price = float(price_match.group(1).replace(",", "")) if price_match else None

        category_match = re.search(r"(?:find|search|show|look for|need|want|get|buy)\s+(.*?)(?:\s+(?:under|below|less than|between|for|in|with|that|which)|$)", text_lower, re.IGNORECASE)

        if category_match:
            category = category_match.group(1).strip()
            entities = {"category": category}
            if max_price:
                entities["max_price"] = max_price
                entities["currency"] = "INR"
            response_parts = [f"Searching for {category}"]
            if max_price:
                response_parts.append(f"under {int(max_price)} rupees")
            return {"intent": "SEARCH_PRODUCT", "confidence": 0.85, "entities": entities, "response": " ".join(response_parts) + "."}

        add_match = re.search(r"(?:add|put|include)\s*(?:(\d+)\s*)?(.*?)\s*(?:to|in)\s*(?:the\s*)?cart", text_lower, re.IGNORECASE)
        if add_match:
            qty = int(add_match.group(1)) if add_match.group(1) else 1
            product_name = add_match.group(2).strip()
            return {"intent": "ADD_TO_CART", "confidence": 0.85, "entities": {"product_name": product_name, "quantity": qty}, "response": f"Adding {qty} {product_name} to your cart."}

        remove_match = re.search(r"(?:remove|delete|take\s+out)\s*(.*?)\s*(?:from|of)\s*(?:the\s*)?cart", text_lower, re.IGNORECASE)
        if remove_match:
            product_name = remove_match.group(1).strip()
            return {"intent": "REMOVE_PRODUCT", "confidence": 0.85, "entities": {"product_name": product_name}, "response": f"Removing {product_name} from your cart."}

        read_match = re.search(r"(?:read|tell|describe|about|details)\s*(?:me\s*)?(?:about\s*)?(.*?)(?:\s*product)?$", text_lower, re.IGNORECASE)
        if read_match and read_match.group(1).strip():
            return {"intent": "READ_PRODUCT", "confidence": 0.8, "entities": {"product_name": read_match.group(1).strip()}, "response": f"Here are the details for {read_match.group(1).strip()}."}

        compare_match = re.search(r"compare\s+(.*?)(?:\s+and\s+|\s+vs\s+|\s+versus\s+)(.*)", text_lower, re.IGNORECASE)
        if compare_match:
            return {"intent": "COMPARE_PRODUCTS", "confidence": 0.85, "entities": {"product_names": [compare_match.group(1).strip(), compare_match.group(2).strip()]}, "response": "Comparing products."}

        if max_price:
            return {"intent": "SEARCH_PRODUCT", "confidence": 0.7, "entities": {"max_price": max_price}, "response": f"Searching for products under {int(max_price)} rupees."}

        return {"intent": "SEARCH_PRODUCT", "confidence": 0.5, "entities": {"query": text}, "response": f"Searching for {text}."}

    def execute_intent(self, intent_data: dict) -> dict:
        intent = intent_data.get("intent", "HELP")
        entities = intent_data.get("entities", {})
        response_text = intent_data.get("response", "")

        result = {"intent": intent, "response": response_text, "action": None, "data": None}

        if intent == "SEARCH_PRODUCT" and self.db:
            service = ProductService(self.db)
            params = {}
            if entities.get("category"):
                params["search"] = entities["category"]
            if entities.get("max_price"):
                params["max_price"] = float(entities["max_price"])
            if entities.get("min_price"):
                params["min_price"] = float(entities["min_price"])
            products, total = service.get_all(limit=5, **params)
            result["data"] = products
            if total == 0:
                result["response"] = "I couldn't find any products matching that. Try a different search?"
            else:
                names = [p["name"] for p in products[:3]]
                name_list = ", ".join(names)
                more = f" and {total - 3} more" if total > 3 else ""
                result["response"] = f"I found {total} products. Here are some: {name_list}{more}."
            result["action"] = "navigate_search"

        elif intent == "OPEN_CART":
            result["action"] = "navigate_cart"

        elif intent == "GO_HOME":
            result["action"] = "navigate_home"

        elif intent == "GO_BACK":
            result["action"] = "navigate_back"

        elif intent == "HELP":
            result["action"] = "none"

        elif intent == "GREETING":
            result["action"] = "none"

        elif intent == "CHECKOUT":
            result["action"] = "navigate_checkout"

        elif intent == "TRACK_ORDER":
            result["action"] = "navigate_orders"

        elif intent == "ADD_TO_CART":
            result["action"] = "add_to_cart"
            result["data"] = entities

        elif intent == "REMOVE_PRODUCT":
            result["action"] = "remove_from_cart"
            result["data"] = entities

        elif intent == "READ_PRODUCT" and self.db:
            service = ProductService(self.db)
            product_name = entities.get("product_name", "")
            if product_name:
                products, _ = service.get_all(search=product_name, limit=1)
                if products:
                    p = products[0]
                    result["data"] = p
                    result["response"] = f"{p['name']}. Price: {int(p['price'])} rupees. Rating: {p['rating']} out of 5. {p['description'][:200]}"
                    result["action"] = "navigate_product"
                else:
                    result["response"] = f"I couldn't find a product called {product_name}."

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

        return result

    def clear_history(self):
        self.conversation_history.clear()

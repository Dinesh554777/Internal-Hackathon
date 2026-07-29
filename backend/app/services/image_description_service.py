import base64
import requests
from groq import Groq
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.models.product import Product

settings = get_settings()

GROQ_VISION_PROMPT = """Describe this product image in detail for a blind or visually impaired shopper. Include:
1. Product type and name
2. Color(s) and pattern
3. Material/fabric
4. Style features (fit, sleeves, collar, etc.)
5. Available sizes if visible
6. Any visible text or branding

Format as a clear, concise paragraph. Do not include pricing or rating."""

METADATA_TEMPLATES = {
    "shirt": "{name}. {color} {material} shirt with {features}. Available in {sizes}.",
    "shoes": "{name}. {color} {material} shoes with {features}.",
    "dress": "{name}. {color} {material} dress with {features}. Available in {sizes}.",
    "jeans": "{name}. {color} {material} jeans with {features}. Available in sizes {sizes}.",
    "jacket": "{name}. {color} {material} jacket with {features}. Available in {sizes}.",
    "watch": "{name}. {color} {material} watch with {features}.",
    "bag": "{name}. {color} {material} bag with {features}.",
    "default": "{name}. {color} product made of {material}. Features: {features}. Available in {sizes}.",
}


def _analyze_tags(tags: list[str]) -> dict:
    text = " ".join(tag.lower() for tag in tags) if tags else ""
    colors = [w for w in ["black", "white", "red", "blue", "green", "yellow", "pink", "purple", "gray", "grey", "brown", "navy", "beige", "cream", "gold", "silver", "orange", "multicolor", "printed", "striped", "checked", "floral"] if w in text]
    materials = [w for w in ["cotton", "polyester", "silk", "linen", "wool", "leather", "denim", "nylon", "velvet", "satin", "lace", "chiffon", "jersey", "cashmere", "suede", "canvas"] if w in text]
    sizes = [w for w in ["xs", "s", "m", "l", "xl", "xxl", "2xl", "3xl", "small", "medium", "large", "extra large"] if w in text]
    fit = [w for w in ["slim", "regular", "loose", "oversized", "skinny", "straight", "relaxed", "tapered", "stretch"] if w in text]
    neck = [w for w in ["round", "v-neck", "v neck", "turtleneck", "collar", "mandarin", "peter pan", "boat"] if w in text]
    sleeve = [w for w in ["short sleeve", "long sleeve", "sleeveless", "half sleeve", "rolled", "raglan"] if w in text]
    return {"colors": colors, "materials": materials, "sizes": sizes, "fit": fit, "neck": neck, "sleeve": sleeve}


def _guess_category(name: str, tags: list[str]) -> str:
    text = (name + " " + " ".join(tags or [])).lower()
    for cat in ["shirt", "shoes", "dress", "jeans", "jacket", "watch", "bag"]:
        if cat in text:
            return cat
    return "default"


def _generate_metadata_description(name: str, category: str, tags: list[str], price: float, rating: float) -> str:
    info = _analyze_tags(tags)
    features = []
    if info["fit"]:
        features.append(" ".join(info["fit"]) + " fit")
    if info["neck"]:
        features.append(" ".join(info["neck"]))
    if info["sleeve"]:
        features.append(" ".join(info["sleeve"]))
    size_str = ", ".join(s.upper() for s in info["sizes"]) if info["sizes"] else "various sizes"
    color_str = info["colors"][0] if info["colors"] else ""
    material_str = info["materials"][0] if info["materials"] else "premium"
    extra = tags[:] if tags else []
    if extra:
        remaining = ", ".join(e for e in extra if e.lower() not in [c.lower() for c in info["colors"]] and e.lower() not in [m.lower() for m in info["materials"]])
    else:
        remaining = "quality design"
    template = METADATA_TEMPLATES.get(category, METADATA_TEMPLATES["default"])
    description = template.format(name=name, color=color_str.capitalize() if color_str else "", material=material_str.capitalize() if material_str else "Premium", features=", ".join(features) if features else remaining, sizes=size_str)
    description += f" Price: {int(price)} rupees. Rating: {rating} out of 5 stars."
    return description


class ImageDescriptionService:
    def __init__(self, db: Session | None = None):
        self.db = db
        self.client = Groq(api_key=settings.groq_api_key) if settings.groq_api_key else None

    def describe(self, product_id: str) -> dict:
        if not self.db:
            return {"description": "", "source": "none"}

        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ValueError("Product not found")

        vision_desc = self._try_vision(product)
        if vision_desc:
            return {
                "description": f"{vision_desc} Price: {int(product.price)} rupees. Rating: {product.rating} out of 5 stars.",
                "source": "vision",
            }

        md_desc = _generate_metadata_description(product.name, _guess_category(product.name, product.tags), product.tags, product.price, product.rating)
        return {"description": md_desc, "source": "metadata"}

    def _try_vision(self, product: Product) -> str | None:
        if not self.client or not product.images:
            return None
        image_url = product.images[0]
        if not image_url:
            return None

        try:
            if image_url.startswith(("http://", "https://")):
                image_data = self._fetch_image(image_url)
            else:
                return None

            if not image_data:
                return None

            response = self.client.chat.completions.create(
                model="llama-3.2-11b-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": GROQ_VISION_PROMPT},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}},
                        ],
                    }
                ],
                max_tokens=300,
                temperature=0.2,
            )
            return response.choices[0].message.content.strip()
        except Exception:
            return None

    def _fetch_image(self, url: str) -> str | None:
        try:
            resp = requests.get(url, timeout=10)
            if resp.status_code != 200:
                return None
            return base64.b64encode(resp.content).decode("utf-8")
        except Exception:
            return None

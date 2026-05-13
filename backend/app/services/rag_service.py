import os
import json
from typing import List, Dict, Any, Optional


class RAGService:
    """RAG service using ChromaDB + TF-IDF + Ollama for embeddings and LLM."""

    def __init__(self):
        self.vectorizer = None
        self.chroma_client = None
        self.collection = None
        self._initialized = False
        self._indexed = False

        # Ollama settings
        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "llama3")
        self.ollama_enabled = os.getenv("OLLAMA_ENABLED", "false").lower() == "true"
        self.ollama_available = None  # Will check on first request

        # Sample corpus to fit vectorizer once
        self._sample_corpus = [
            "Product item buy shop store find search available",
            "Order track status delivery ordered shipped arrived",
            "Shipping delivery arrive time daysExpress standard free",
            "Return refund exchange money back send back policy",
            "Price cost discount sale promo deal offer expensive cheap",
            "Payment pay card credit checkout secure Visa MasterCard",
            "Contact email phone support help",
            "Return policy 30 days unused original packaging",
            "Shipping takes business daysExpress standard",
            "Payment methods accepted secure encrypted"
        ]

    async def initialize(self):
        """Initialize the RAG components."""
        if self._initialized:
            return

        try:
            import chromadb
            from sklearn.feature_extraction.text import TfidfVectorizer

            # Initialize TF-IDF vectorizer and fit ONCE
            self.vectorizer = TfidfVectorizer(
                max_features=500,
                stop_words='english',
                ngram_range=(1, 2)
            )
            self.vectorizer.fit(self._sample_corpus)

            # Initialize ChromaDB (local storage)
            chroma_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'chroma')
            os.makedirs(chroma_path, exist_ok=True)

            self.chroma_client = chromadb.PersistentClient(path=chroma_path)

            # Delete existing collection to start fresh
            try:
                self.chroma_client.delete_collection("shopping_assistant")
            except:
                pass

            # Create new collection
            self.collection = self.chroma_client.create_collection("shopping_assistant")

            self._initialized = True
            print(f"RAG Service initialized with TF-IDF + Ollama ({self.ollama_model})")

        except Exception as e:
            print(f"Error initializing RAG service: {e}")
            raise

    def _generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using pre-fitted TF-IDF."""
        if self.vectorizer is None:
            return [0.0] * 500

        try:
            embedding = self.vectorizer.transform([text]).toarray()[0].tolist()
            return embedding
        except Exception:
            return [0.0] * 500

    async def _check_ollama_available(self) -> bool:
        """Check if Ollama is running and available."""
        # If Ollama is disabled via env, skip
        if not self.ollama_enabled:
            self.ollama_available = False
            return False

        if self.ollama_available is not None:
            return self.ollama_available

        import aiohttp
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.ollama_url}/api/tags",
                    timeout=aiohttp.ClientTimeout(total=3)
                ) as response:
                    self.ollama_available = response.status == 200
                    return self.ollama_available
        except:
            self.ollama_available = False
            return False

    async def _call_ollama(self, prompt: str) -> str:
        """Call Ollama API to generate response."""
        # First check if Ollama is available
        if not await self._check_ollama_available():
            return None

        import aiohttp
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "model": self.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "num_predict": 300
                    }
                }

                async with session.post(
                    f"{self.ollama_url}/api/generate",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=120)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result.get('response', '').strip()
        except:
            pass

        return None

    async def _build_context_for_llm(self, context: List[Dict[str, Any]]) -> str:
        """Build context string for LLM prompt."""
        if not context:
            return "No specific context available."

        product_context = [c for c in context if c.get('metadata', {}).get('type') == 'product']
        faq_context = [c for c in context if c.get('metadata', {}).get('type') == 'faq']

        parts = []

        if product_context:
            products = []
            for c in product_context[:5]:
                meta = c.get('metadata', {})
                products.append(f"- {meta.get('title')}: ${meta.get('price')} ({meta.get('category')})")
            parts.append("Products:\n" + "\n".join(products))

        if faq_context:
            faqs = []
            for c in faq_context[:5]:
                meta = c.get('metadata', {})
                faqs.append(f"Q: {meta.get('question')}\nA: {meta.get('answer')}")
            parts.append("FAQ:\n" + "\n".join(faqs))

        return "\n\n".join(parts) if parts else "General shopping assistance."

    async def index_products(self, products: List[Dict[str, Any]]):
        """Index products into the vector store."""
        if not self._initialized:
            await self.initialize()

        if not products or self._indexed:
            return

        documents = []
        metadatas = []
        ids = []

        for product in products:
            doc = f"Product {product.get('title', '')} category {product.get('category', '')} description {product.get('description', '')} price {product.get('price', 0)} dollars stock {product.get('stock', 0)}"
            documents.append(doc)
            metadatas.append({
                'type': 'product',
                'id': str(product.get('id', '')),
                'title': product.get('title', ''),
                'category': product.get('category', ''),
                'price': float(product.get('price', 0))
            })
            ids.append(f"product_{product.get('id', '')}")

        embeddings = [self._generate_embedding(doc) for doc in documents]

        self.collection.upsert(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )

        print(f"Indexed {len(products)} products")

    async def index_faq(self, faqs: List[Dict[str, Any]]):
        """Index FAQ data into the vector store."""
        if not self._initialized:
            await self.initialize()

        if not faqs or self._indexed:
            return

        documents = []
        metadatas = []
        ids = []

        for i, faq in enumerate(faqs):
            doc = f"Question {faq.get('question', '')} Answer {faq.get('answer', '')}"
            documents.append(doc)
            metadatas.append({
                'type': 'faq',
                'question': faq.get('question', ''),
                'answer': faq.get('answer', '')
            })
            ids.append(f"faq_{i}")

        embeddings = [self._generate_embedding(doc) for doc in documents]

        self.collection.upsert(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )

        print(f"Indexed {len(faqs)} FAQs")
        self._indexed = True

    async def index_policies(self):
        """Index store policies."""
        if not self._initialized:
            await self.initialize()

        policies = [
            {'question': 'What is your return policy?', 'answer': 'We offer a 30-day return policy for most items. Items must be unused in original packaging. Contact support to initiate a return.'},
            {'question': 'How long does shipping take?', 'answer': 'Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days. Free shipping on orders over $50.'},
            {'question': 'What payment methods do you accept?', 'answer': 'We accept Visa, MasterCard, American Express, PayPal, and Apple Pay. All transactions are secure and encrypted.'},
            {'question': 'How do I track my order?', 'answer': 'Log into your account and go to Order History to track your order. You can also find tracking info in your shipping confirmation email.'},
            {'question': 'Do you offer international shipping?', 'answer': 'Yes, we ship to over 100 countries. International shipping typically takes 7-14 business days. Customs fees may apply.'},
            {'question': 'How can I contact customer support?', 'answer': 'Email us at support@quickstore.com or call 1-800-QUICK-STORE. We are available Monday-Friday, 9am-6pm EST.'},
            {'question': 'Is my personal information secure?', 'answer': 'Yes, we use industry-standard encryption to protect your data. We never share your information with third parties.'},
            {'question': 'What is your privacy policy?', 'answer': 'We collect only necessary information to process your orders. You can request data deletion at any time by contacting support.'}
        ]

        await self.index_faq(policies)

    async def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Search the vector store for relevant context."""
        if not self._initialized:
            await self.initialize()

        count = self.collection.count()
        if count == 0:
            return []

        query_embedding = self._generate_embedding(query)

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )

        context = []
        if results['documents'] and results['documents'][0]:
            for i, doc in enumerate(results['documents'][0]):
                context.append({
                    'content': doc,
                    'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                    'distance': results['distances'][0][i] if results['distances'] else 0
                })

        return context

    async def generate_response(self, user_message: str, context: List[Dict[str, Any]]) -> str:
        """Generate response using Ollama LLM with RAG context."""

        # Try to use Ollama first
        context_str = await self._build_context_for_llm(context)

        prompt = f"""You are a helpful shopping assistant for an e-commerce store.
Use the following context to answer the user's question. Be friendly and concise.

Context:
{context_str}

User Question: {user_message}

Provide a helpful answer based on the context above. If the context doesn't contain enough information, provide a general helpful response based on typical e-commerce policies."""

        # Try Ollama
        llm_response = await self._call_ollama(prompt)

        if llm_response:
            return llm_response

        # Fallback to rule-based responses if Ollama is not available
        return await self._fallback_response(user_message, context)

    async def _fallback_response(self, user_message: str, context: List[Dict[str, Any]]) -> str:
        """Fallback rule-based responses when Ollama is not available."""

        message_lower = user_message.lower()

        product_context = [c for c in context if c.get('metadata', {}).get('type') == 'product']
        faq_context = [c for c in context if c.get('metadata', {}).get('type') == 'faq']

        # Product search
        if any(word in message_lower for word in ['product', 'buy', 'shop', 'item', 'find', 'looking for', 'search', 'available']):
            if product_context:
                products = [f"- {c.get('metadata', {}).get('title', 'Product')}: ${c.get('metadata', {}).get('price', 0)} ({c.get('metadata', {}).get('category', '')})" for c in product_context[:3]]
                return "I found some products that might interest you:\n\n" + "\n".join(products) + "\n\nWould you like more details about any of these?"
            return "I can help you find products! What are you looking for? You can browse our Products page or tell me what you need."

        # Order
        if any(word in message_lower for word in ['order', 'track', 'status', 'ordered', 'delivery']):
            return "To check your order status, please log in to your account and visit your Order History. You'll find tracking information and delivery estimates there."

        # Shipping
        if any(word in message_lower for word in ['ship', 'delivery', 'arrive', 'when will']):
            return "We offer standard shipping (3-5 days) and express shipping (1-2 days). Free shipping on orders over $50! Would you like to know more about our shipping options?"

        # Returns
        if any(word in message_lower for word in ['return', 'refund', 'exchange', 'send back']):
            return "Our return policy allows 30 days for most items. Items must be unused in original packaging. Visit our Returns page or contact support to start a return."

        # Pricing
        if any(word in message_lower for word in ['price', 'cost', 'expensive', 'cheap', 'discount', 'sale', 'promo', 'deal']):
            if product_context:
                prices = [c.get('metadata', {}).get('price', 0) for c in product_context]
                return f"Our products range from ${min(prices):.2f} to ${max(prices):.2f}. Check our Products page for current prices and any active promotions!"
            return "Visit our Products page to see current prices. We also have regular sales and promotions! Sign up for our newsletter to get exclusive deals."

        # Contact
        if any(word in message_lower for word in ['contact', 'email', 'phone', 'support', 'help', 'talk to']):
            return "You can reach our support team at support@quickstore.com or call 1-800-QUICK-STORE. We're available Monday-Friday, 9am-6pm EST."

        # Payment
        if any(word in message_lower for word in ['payment', 'pay', 'card', 'checkout', 'credit']):
            return "We accept all major credit cards, PayPal, and Apple Pay. All transactions are secure and encrypted. Need help with checkout?"

        # Thanks
        if any(word in message_lower for word in ['thank', 'thanks', 'appreciate']):
            return "You're welcome! Happy to help! Is there anything else you need assistance with?"

        # FAQ match
        if faq_context:
            for c in faq_context:
                meta = c.get('metadata', {})
                question = meta.get('question', '').lower()
                words = [w for w in message_lower.split() if len(w) > 3]
                if any(word in question for word in words):
                    return meta.get('answer', '')

        # Default
        if context:
            best_match = min(context, key=lambda x: x.get('distance', 1))
            meta = best_match.get('metadata', {})
            if meta.get('type') == 'product':
                return f"I found a product that might help: {meta.get('title')} - ${meta.get('price', 0)}. Would you like more details?"
            elif meta.get('type') == 'faq':
                return meta.get('answer', '')

        return f"I understand you're asking about '{user_message}'. How can I help you specifically? You can ask about products, orders, shipping, or any other questions!"


rag_service = RAGService()
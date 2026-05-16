import time
import urllib.parse
from playwright.sync_api import sync_playwright, Page
from typing import List, Dict
import os

# Global status store to track progress
AUTOMATION_STATUS = {
    "is_running": False,
    "current_item": "",
    "progress": 0,
    "total_items": 0,
    "requires_action": False,
    "action_type": None, # e.g., 'captcha', 'login_required'
    "logs": []
}

class InstacartAutomator:
    def __init__(self, headless: bool = False, store: str = "instacart"):
        self.headless = headless
        self.store = store
        self.browser = None
        self.context = None
        self.page = None
        self.playwright = None

    def start(self):
        """Initializes the browser with stealth-like settings."""
        print(f"[AUTOMATOR] Initializing Professional Browser Session for {self.store}...")
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(
            headless=self.headless,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--disable-infobars',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--window-size=1280,800',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            ]
        )
        
        # Professional Stealth Configuration
        self.context = self.browser.new_context(
            viewport={'width': 1280 + self._get_random_offset(), 'height': 800 + self._get_random_offset()},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            color_scheme='light',
            locale='en-US',
            timezone_id='America/New_York',
            extra_http_headers={
                'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'same-origin',
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': '1'
            }
        )
        self.page = self.context.new_page()
        
        # Inject stealth scripts to bypass navigator.webdriver detection
        self.page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
        """)
        
        if self.store == "walmart":
            try:
                self.page.goto("https://www.walmart.com/", wait_until="domcontentloaded", timeout=20000)
            except Exception:
                pass
        else:
            self.page.goto("https://www.instacart.com/", wait_until="domcontentloaded")
        self._human_delay(2, 4)
        self.check_for_interruptions()
        self.handle_initial_popups()
        print("[AUTOMATOR] Ready for Shopping (Stealth Mode Active)")

    def _get_random_offset(self):
        import random
        return random.randint(-10, 10)

    def _human_delay(self, min_sec=1, max_sec=3):
        import random
        time.sleep(random.uniform(min_sec, max_sec))

    def handle_initial_popups(self):
        """Handles common location or cookie prompts."""
        try:
            # Wait a bit for popups to appear
            time.sleep(3)
            # Example: Close location prompt if it appears
            close_buttons = ['button[aria-label*="Close"]', 'button:has-text("Dismiss")', 'svg[aria-label*="Close"]']
            for selector in close_buttons:
                btn = self.page.query_selector(selector)
                if btn:
                    btn.click()
                    print(f"[AUTOMATOR] Closed a popup ({selector})")
        except:
            pass

    def check_for_interruptions(self):
        """Checks for Captchas or Login walls that need human help."""
        # Common Captcha indicators
        captcha_selectors = ['iframe[src*="captcha"]', 'div#captcha', 'text="Press and Hold"', 'text="I am human"']
        
        for selector in captcha_selectors:
            if self.page.query_selector(selector):
                print(f"[AUTOMATOR] 🛑 INTERRUPTION DETECTED: {selector}")
                AUTOMATION_STATUS["requires_action"] = True
                AUTOMATION_STATUS["action_type"] = "captcha"
                AUTOMATION_STATUS["logs"].append("⚠️ Captcha detected! Please solve it in the browser window.")
                
                # Pause and wait until resolved
                while self.page.query_selector(selector):
                    time.sleep(2)
                
                AUTOMATION_STATUS["requires_action"] = False
                AUTOMATION_STATUS["action_type"] = None
                AUTOMATION_STATUS["logs"].append("✅ Captcha resolved. Resuming automation...")
                return True
        return False

    def search_and_add_item(self, item_spec: Dict) -> bool:
        query = item_spec.get('search_query', item_spec.get('original_text'))
        quantity = item_spec.get('quantity', 1)
        
        AUTOMATION_STATUS["current_item"] = query
        print(f"[AUTOMATOR] Action: Searching for {query}")
        
        try:
            # 1. Direct navigation to search catalog
            self.check_for_interruptions()
            encoded_query = urllib.parse.quote_plus(query)
            if self.store == "walmart":
                search_url = f"https://www.walmart.com/search?q={encoded_query}"
            else:
                search_url = f"https://www.instacart.com/store/s?k={encoded_query}"
            self.page.goto(search_url, wait_until="domcontentloaded", timeout=25000)
            time.sleep(3)
            
            # Check for bot challenge / verification prompts
            title = self.page.title()
            print(f"[AUTOMATOR] Loaded page title: '{title}'")
            if any(term in title.lower() for term in ["verify", "robot", "human", "blocked", "challenge", "captcha", "security"]):
                AUTOMATION_STATUS["requires_action"] = True
                AUTOMATION_STATUS["action_type"] = "captcha"
                AUTOMATION_STATUS["logs"].append(f"🚨 Bot verification required on {self.store.title()}!")
            
            # Scroll down to trigger lazy loading of product cards
            try:
                self.page.evaluate("window.scrollBy(0, 600)")
            except Exception:
                pass
            time.sleep(2)
            
            # Wait for search results grid to render
            try:
                self.page.wait_for_selector('button:has-text("Add"), button:has-text("+"), [aria-label*="Add"], [aria-label*="add"], button', timeout=5000)
            except Exception:
                pass
            
            # 2. Add to Cart Logic
            # Look for 'Add', '+', or 'Add to cart' buttons specifically for items
            add_selectors = [
                'button:has-text("Add")', 
                'button:has-text("+ Add")', 
                'button:has-text("Add to cart")', 
                'button[aria-label*="Add"]',
                'button[aria-label*="add"]',
                'button[data-automation-id*="add"]',
                'button[data-testid*="add"]',
                'button:has-text("+")',
                '[aria-label*="Add to cart"]',
                '[aria-label*="Add"]'
            ]
            
            added = False
            for selector in add_selectors:
                first_btn = self.page.query_selector(selector)
                if first_btn:
                    for _ in range(quantity):
                        try:
                            first_btn.click(timeout=3000)
                            time.sleep(1)
                        except Exception:
                            pass
                    added = True
                    break
            
            # Fallback universal button scan
            if not added:
                all_buttons = self.page.query_selector_all('button, [role="button"], a[role="button"]')
                for btn in all_buttons:
                    try:
                        inner = btn.inner_text() or ""
                        aria = btn.get_attribute("aria-label") or ""
                        combo_text = f"{inner} {aria}".lower()
                        if "add" in combo_text or "+" in combo_text or "cart" in combo_text:
                            for _ in range(quantity):
                                btn.click(timeout=3000)
                                time.sleep(1)
                            added = True
                            break
                    except Exception:
                        pass
            
            if added:
                AUTOMATION_STATUS["logs"].append(f"✅ Successfully added {quantity}x {query}")
                return True
            else:
                AUTOMATION_STATUS["logs"].append(f"⚠️ Could not find 'Add' button for {query}")
                return False
                
        except Exception as e:
            AUTOMATION_STATUS["logs"].append(f"❌ Error adding {query}: {str(e)}")
            return False

    def process_shopping_list(self, items: List[Dict]):
        AUTOMATION_STATUS["is_running"] = True
        AUTOMATION_STATUS["total_items"] = len(items)
        AUTOMATION_STATUS["progress"] = 0
        AUTOMATION_STATUS["logs"] = []

        results = []
        for i, item in enumerate(items):
            AUTOMATION_STATUS["progress"] = i + 1
            success = self.search_and_add_item(item)
            results.append({"item": item['original_text'], "success": success})
        
        AUTOMATION_STATUS["is_running"] = False
        AUTOMATION_STATUS["current_item"] = "Finished"
        return results

    def stop(self):
        if self.browser:
            self.browser.close()
        if self.playwright:
            self.playwright.stop()
        print("[AUTOMATOR] Session Ended")

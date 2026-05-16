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
    def __init__(self, headless: bool = False):
        self.headless = headless
        self.browser = None
        self.context = None
        self.page = None
        self.playwright = None

    def start(self):
        """Initializes the browser with stealth-like settings."""
        print("[AUTOMATOR] Initializing Professional Browser Session...")
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(headless=self.headless)
        
        # Professional Stealth Configuration
        self.context = self.browser.new_context(
            viewport={'width': 1280 + self._get_random_offset(), 'height': 800 + self._get_random_offset()},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            color_scheme='light',
            locale='en-US',
            timezone_id='America/New_York'
        )
        self.page = self.context.new_page()
        
        # Inject stealth scripts or randomize behavior
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
            search_url = f"https://www.instacart.com/store/s?k={encoded_query}"
            self.page.goto(search_url, wait_until="domcontentloaded", timeout=25000)
            time.sleep(3)
            
            # 2. Add to Cart Logic
            # We look for 'Add' or '+' buttons specifically for items
            add_selectors = [
                'button:has-text("Add")', 
                'button[aria-label*="Add"]',
                'button:has-text("+")'
            ]
            
            added = False
            for selector in add_selectors:
                first_btn = self.page.query_selector(selector)
                if first_btn:
                    for _ in range(quantity):
                        first_btn.click()
                        time.sleep(0.8)
                    added = True
                    break
            
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

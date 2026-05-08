import time
from playwright.sync_api import sync_playwright, Page
from typing import List, Dict
import os

# Global status store to track progress (Simple implementation for Phase 3)
AUTOMATION_STATUS = {
    "is_running": False,
    "current_item": "",
    "progress": 0,
    "total_items": 0,
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
        
        # Professional User Agent to avoid detection
        self.context = self.browser.new_context(
            viewport={'width': 1280, 'height': 800},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            color_scheme='light'
        )
        self.page = self.context.new_page()
        
        # Navigate and wait for content
        self.page.goto("https://www.instacart.com/", wait_until="domcontentloaded")
        self.handle_initial_popups()
        print("[AUTOMATOR] Ready for Shopping")

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

    def search_and_add_item(self, item_spec: Dict) -> bool:
        query = item_spec.get('search_query', item_spec.get('original_text'))
        quantity = item_spec.get('quantity', 1)
        
        AUTOMATION_STATUS["current_item"] = query
        print(f"[AUTOMATOR] Action: Searching for {query}")
        
        try:
            # 1. Clear and fill search bar
            search_selector = 'input[type="search"], input[placeholder*="Search"]'
            self.page.wait_for_selector(search_selector, timeout=10000)
            self.page.fill(search_selector, "")
            self.page.fill(search_selector, query)
            self.page.keyboard.press("Enter")
            
            # Wait for search results
            self.page.wait_for_load_state("networkidle")
            time.sleep(2)
            
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

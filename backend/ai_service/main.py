from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from intelligent_shopper import IntelligentShopper
from instacart_automator import InstacartAutomator, AUTOMATION_STATUS

load_dotenv()

app = FastAPI(title="Florland AI Agent Service")
shopper = IntelligentShopper()

class ShoppingRequest(BaseModel):
    items: List[str]
    user_id: Optional[str] = None
    store: Optional[str] = "instacart"

@app.get("/")
async def root():
    return {"status": "Florland AI Agent Service is Online", "version": "1.0.0"}

@app.get("/agent/status")
async def get_status():
    """
    Returns the current status of the AI automation agent.
    Allows the frontend to show a progress bar/logs.
    """
    return AUTOMATION_STATUS

@app.post("/agent/parse")
async def parse_list(request: ShoppingRequest):
    try:
        if not request.items:
            raise HTTPException(status_code=400, detail="Items list cannot be empty")
            
        specs = shopper.process_raw_list(request.items)
        return {
            "success": True,
            "store": request.store,
            "specs": specs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def run_automation_task(items: List[str], store: str = "instacart"):
    try:
        # Update status
        AUTOMATION_STATUS["is_running"] = True
        AUTOMATION_STATUS["logs"] = [f"Starting AI intelligence for {store}..."]
        
        # 1. Intelligence
        specs = shopper.process_raw_list(items)
        AUTOMATION_STATUS["logs"].append(f"AI parsed {len(specs)} items.")
        
        # 2. Automation
        automator = InstacartAutomator(headless=True, store=store)
        automator.start()
        results = automator.process_shopping_list(specs)
        AUTOMATION_STATUS["logs"].append("Automation process complete.")
        # automator.stop()
    except Exception as e:
        AUTOMATION_STATUS["is_running"] = False
        AUTOMATION_STATUS["logs"].append(f"Error: {str(e)}")

@app.post("/agent/checkout")
async def start_checkout(request: ShoppingRequest, background_tasks: BackgroundTasks):
    if not request.items:
        raise HTTPException(status_code=400, detail="No items to checkout")
        
    store_name = request.store or "instacart"
    background_tasks.add_task(run_automation_task, request.items, store_name)
    
    return {
        "success": True,
        "message": "AI Agent has started the shopping session."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

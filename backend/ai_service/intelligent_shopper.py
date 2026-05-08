import os
import json
from typing import List, Dict
from crewai import Agent, Task, Crew, Process, LLM
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ShoppingItem(BaseModel):
    original_text: str = Field(..., description="The original text provided by the user")
    search_query: str = Field(..., description="Optimized search query for Instacart/Walmart")
    category: str = Field(..., description="Likely grocery category")
    quantity: int = Field(default=1, description="Quantity to add to cart")
    preferred_unit: str = Field(default="", description="Unit of measurement if specified (e.g., gal, lb, pack)")
    priority: str = Field(default="standard", description="Priority level: cheapest, brand-specific, organic")

class ShoppingList(BaseModel):
    items: List[ShoppingItem]

class IntelligentShopper:
    def __init__(self):
        # Using the specific model provided by the user: gemini-3-flash-preview
        self.llm = LLM(
            model="gemini/gemini-3-flash-preview",
            api_key=os.getenv("GEMINI_API_KEY")
        )
        
        self.shopper_agent = Agent(
            role='Senior Grocery Procurement Specialist',
            goal='Analyze grocery items and provide a structured JSON list of shopping specifications.',
            backstory="""You are an expert at grocery shopping. 
            You understand quantities and units.
            Your goal is to provide precise search queries for a browser automation agent.""",
            allow_delegation=False,
            verbose=True,
            llm=self.llm
        )

    def process_raw_list(self, raw_items: List[str]) -> List[Dict]:
        items_text = ", ".join(raw_items)
        
        parsing_task = Task(
            description=f"""Analyze these grocery items: {items_text}
            
            Convert them into a JSON list. For each item include:
            - original_text
            - search_query
            - category
            - quantity (integer)
            - preferred_unit
            - priority
            
            Return ONLY valid JSON matching the schema.""",
            expected_output="A structured JSON object with a list of items.",
            agent=self.shopper_agent,
            output_json=ShoppingList
        )

        crew = Crew(
            agents=[self.shopper_agent],
            tasks=[parsing_task],
            process=Process.sequential
        )

        result = crew.kickoff()
        
        try:
            if hasattr(result, 'json_dict') and result.json_dict:
                return result.json_dict.get('items', [])
            
            raw_result = str(result.raw) if hasattr(result, 'raw') else str(result)
            if "```json" in raw_result:
                raw_result = raw_result.split("```json")[1].split("```")[0].strip()
            
            data = json.loads(raw_result)
            return data.get('items', [])
        except Exception as e:
            print(f"Error parsing agent output: {e}")
            return [{"original_text": item, "search_query": item, "quantity": 1} for item in raw_items]

if __name__ == "__main__":
    shopper = IntelligentShopper()
    test_list = ["2 gallons of milk", "dozen eggs"]
    specs = shopper.process_raw_list(test_list)
    print(json.dumps(specs, indent=2))

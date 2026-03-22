"""Debate routing endpoints."""
import asyncio
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix='/debate', tags=['Debate'])
logger = logging.getLogger(__name__)

# Schema
class DebateRequest(BaseModel):
    topic: str
    countries: Optional[List[str]] = None

# Country profiles for different debate stances
COUNTRY_PROFILES = {
    'USA': {
        'name': 'USA',
        'stance': 'Innovation-focused, pragmatic',
        'tone': 'Business-oriented',
        'goals': ['Protect tech innovation', 'Maintain competitive advantage'],
        'aggression_level': 0.6,
        'cooperation_level': 0.5,
        'flag': '🇺🇸',
        'color': '#3b82f6'
    },
    'European Union': {
        'name': 'European Union',
        'stance': 'Regulation-first, precautionary',
        'tone': 'Formal, legalistic',
        'goals': ['Establish strict regulations', 'Protect citizen rights'],
        'aggression_level': 0.4,
        'cooperation_level': 0.7,
        'flag': '🇪🇺',
        'color': '#8b5cf6'
    },
    'China': {
        'name': 'China',
        'stance': 'State-controlled development',
        'tone': 'Strategic, collaborative',
        'goals': ['Advance state capabilities', 'Balance innovation and control'],
        'aggression_level': 0.5,
        'cooperation_level': 0.6,
        'flag': '🇨🇳',
        'color': '#ec4899'
    },
    'India': {
        'name': 'India',
        'stance': 'Development-conscious',
        'tone': 'Inclusive, opportunity-focused',
        'goals': ['Ensure inclusive development', 'Prevent digital divide'],
        'aggression_level': 0.3,
        'cooperation_level': 0.8,
        'flag': '🇮🇳',
        'color': '#f59e0b'
    },
    'United Kingdom': {
        'name': 'United Kingdom',
        'stance': 'Balanced, pragmatic',
        'tone': 'Thoughtful, analytical',
        'goals': ['Balance innovation and safety', 'Support responsible research'],
        'aggression_level': 0.4,
        'cooperation_level': 0.7,
        'flag': '🇬🇧',
        'color': '#10b981'
    }
}



async def generate_debate_with_orchestrator(topic: str, countries: List[str]) -> dict:
    """Generate debate using the real orchestrator with LLM agents."""
    try:
        from app.core.orchestrator import DebateOrchestrator
        from app.agents.country_agent import CountryAgent
        from app.agents.judge_agent import JudgeAgent
        from app.agents.moderator_agent import ModeratorAgent
        from app.memory.state_store import DebateState
        from app.llm.llm_client import LLMClient
        
        logger.info(f"🔧 Initializing LLM client for orchestrator...")
        llm = LLMClient()  # Will raise exception if API key missing
        
        logger.info(f"🔧 Initializing agents for topic: {topic}")
        
        # Initialize agents with country profiles
        agents = [
            CountryAgent(COUNTRY_PROFILES.get(country, {'name': country}), llm)
            for country in countries
        ]
        
        # Initialize other components
        moderator = ModeratorAgent(llm)
        judge = JudgeAgent(llm)
        state = DebateState(topic=topic, countries=countries, current_round='opening')
        
        # Create orchestrator
        orchestrator = DebateOrchestrator(
            agents=agents,
            moderator=moderator,
            judge=judge,
            state=state
        )
        
        # Initialize and run full debate
        logger.info("🎭 Running full debate orchestration...")
        orchestrator.initialize_debate(topic, countries)
        final_state = await orchestrator.run_full_debate()
        
        logger.info(f"✅ Orchestration complete. Total messages: {len(final_state.history)}")
        
        # Transform to API response format with phase info
        history = []
        for msg in final_state.history:
            profile = COUNTRY_PROFILES.get(msg.agent, {})
            history.append({
                'agent': msg.agent,
                'country': msg.agent,
                'flag': profile.get('flag', '🌍'),
                'color': profile.get('color', '#38bdf8'),
                'role': msg.role,
                'content': msg.content,
                'round': 1,
                'phase': msg.role
            })
        
        return {
            'success': True,
            'history': history,
            'final_state': {
                'resolution': final_state.resolution,
                'judgement': final_state.judgement,
                'votes': final_state.votes,
                'topic': final_state.topic
            }
        }
    except (ValueError, KeyError) as e:
        logger.error(f"❌ LLM client not configured: {e}")
        raise HTTPException(
            status_code=503, 
            detail=f"LLM service unavailable: {str(e)}. Set ANTHROPIC_API_KEY environment variable."
        )
    except Exception as e:
        logger.error(f"❌ Orchestration failed: {e}")
        raise HTTPException(status_code=500, detail=f"Debate orchestration error: {str(e)}")

@router.get('/')
def get_debate_status():
    """Get current debate status."""
    return {'status': 'pending'}

@router.post('/start')
def start_debate(request: DebateRequest):
    """Start a new debate."""
    if not request.topic:
        raise HTTPException(status_code=400, detail='Topic is required')
    
    countries = request.countries or list(COUNTRY_PROFILES.keys())[:3]
    
    return {
        'debate_id': 'debate_001',
        'topic': request.topic,
        'countries': countries,
        'status': 'started',
        'message': 'Debate initialized successfully'
    }

@router.post('/run')
async def run_debate(request: DebateRequest):
    """Run the debate using real LLM agents via orchestrator."""
    if not request.topic:
        raise HTTPException(status_code=400, detail='Topic is required')
    
    countries = request.countries or list(COUNTRY_PROFILES.keys())[:3]
    
    print(f"\n{'='*60}")
    print(f"📊 DEBATE REQUEST: {request.topic}")
    print(f"🌍 Countries: {countries}")
    print(f"{'='*60}\n")
    
    logger.info(f"Running debate on topic: {request.topic} with countries: {countries}")
    
    # Run real orchestrator (no fallback to mock)
    return await generate_debate_with_orchestrator(request.topic, countries)

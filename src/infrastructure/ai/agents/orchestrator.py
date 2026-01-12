"""Orchestrator Agent - Routes queries to appropriate sub-agents."""

from langchain_core.messages import HumanMessage, AIMessage

from src.infrastructure.ai.agents.base import ChatState, AgentType, get_llm


ORCHESTRATOR_PROMPT = """You are an intelligent router for Dimitris Koutselis's personal website chatbot.
Your job is to analyze the user's message and determine which specialized agent should handle it.

Available agents:
1. REPO_INVESTIGATOR - For questions about:
   - GitHub repositories and code
   - Programming projects
   - Technical implementations
   - Code examples and explanations
   - Project structure and files

2. BLOG_EXPLAINER - For questions about:
   - Blog posts and articles
   - Written content on the website
   - Topics covered in articles
   - Technical tutorials in blog format

3. RESPONSE_GENERATOR - For questions about:
   - Personal information about Dimitris
   - General greetings and small talk
   - Who Dimitris is, background, skills
   - Contact information
   - Questions that don't fit other categories

Analyze the user's message and respond with ONLY ONE of these exact words:
- REPO_INVESTIGATOR
- BLOG_EXPLAINER
- RESPONSE_GENERATOR

User message: {message}

Your routing decision (respond with only the agent name):"""


async def orchestrator_node(state: ChatState) -> ChatState:
    """Orchestrator node that routes to the appropriate agent."""
    messages = state["messages"]

    last_message = None
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage):
            last_message = msg.content
            break

    if not last_message:
        return {
            **state,
            "next_agent": AgentType.RESPONSE_GENERATOR.value,
        }

    llm = get_llm(temperature=0.0)

    prompt = ORCHESTRATOR_PROMPT.format(message=last_message)
    response = await llm.ainvoke([HumanMessage(content=prompt)])

    decision = response.content.strip().upper()

    if "REPO" in decision:
        next_agent = AgentType.REPO_INVESTIGATOR.value
    elif "BLOG" in decision:
        next_agent = AgentType.BLOG_EXPLAINER.value
    else:
        next_agent = AgentType.RESPONSE_GENERATOR.value

    return {
        **state,
        "next_agent": next_agent,
    }

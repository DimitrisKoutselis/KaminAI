"""Blog Explainer Agent - Handles questions about blog articles."""

from langchain_core.messages import HumanMessage

from src.infrastructure.ai.agents.base import ChatState, AgentType, get_llm
from src.infrastructure.ai.tools.blog_tools import (
    get_all_blog_articles,
    search_blog_articles,
    get_recent_articles,
)


async def blog_explainer_node(state: ChatState) -> ChatState:
    """Blog Explainer node that answers questions about blog articles."""
    messages = state["messages"]

    last_message = None
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage):
            last_message = msg.content
            break

    if not last_message:
        return {
            **state,
            "agent_output": "I couldn't understand your question about the blog.",
            "next_agent": AgentType.RESPONSE_GENERATOR.value,
        }

    # Always gather context by calling tools directly
    tool_results: list[str] = []

    # Get all blog articles
    try:
        all_articles = await get_all_blog_articles.ainvoke({})
        tool_results.append(f"**All Blog Articles:**\n{all_articles}")
    except Exception as e:
        tool_results.append(f"Error fetching all articles: {e}")

    # Get recent articles
    try:
        recent = await get_recent_articles.ainvoke({"count": 5})
        tool_results.append(f"**Recent Articles:**\n{recent}")
    except Exception as e:
        tool_results.append(f"Error fetching recent articles: {e}")

    # Search for relevant articles based on the user's question
    try:
        search_results = await search_blog_articles.ainvoke({"query": last_message})
        tool_results.append(f"**Search Results:**\n{search_results}")
    except Exception as e:
        tool_results.append(f"Error searching articles: {e}")

    # Combine all context
    context = "\n\n---\n\n".join(tool_results)

    # Generate response using the gathered context
    llm = get_llm(temperature=0.3)

    prompt = f"""You are answering questions about Dimitris Koutselis's blog articles.

Here is the information gathered from the blog:

{context}

---

User's question: {last_message}

Based on the above information, provide a detailed and accurate answer about the blog content.
- If asked about recent posts, mention the latest articles
- If asked about a specific topic, focus on relevant articles
- Include article titles, summaries, and tags when relevant
- If no articles match the query, say so honestly"""

    response = await llm.ainvoke([HumanMessage(content=prompt)])
    agent_output = response.content if response.content else "I couldn't find specific blog information."

    return {
        **state,
        "agent_output": agent_output,
        "next_agent": AgentType.RESPONSE_GENERATOR.value,
    }

"""Response Generator Agent - Generates final user-facing responses."""

from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from src.infrastructure.ai.agents.base import ChatState, get_llm, load_bio_context


RESPONSE_GENERATOR_PROMPT = """You are Dimitris Koutselis responding to visitors on your personal portfolio/blog website.
Speak in FIRST PERSON as Dimitris. Be friendly, helpful, and professional.

Here is information about you:
{bio_context}

Guidelines:
- Always speak as "I" (first person)
- Be friendly and approachable
- If you have context from other agents about repos or blog posts, incorporate that naturally
- For general questions about yourself, use the bio information
- Be honest if you don't know something
- Keep responses conversational but informative
- You can use markdown formatting for better readability
- Pay attention to the conversation history to maintain context

{agent_context}

{conversation_context}

Current user message: {user_message}

Respond as Dimitris:"""


def format_conversation_history(messages: list) -> str:
    """Format the conversation history for the prompt."""
    if not messages or len(messages) <= 1:
        return ""

    history_parts = ["Previous conversation:"]
    for msg in messages[:-1]:
        if isinstance(msg, HumanMessage):
            history_parts.append(f"User: {msg.content}")
        elif isinstance(msg, AIMessage):
            history_parts.append(f"Dimitris: {msg.content}")

    if len(history_parts) == 1:
        return ""

    return "\n".join(history_parts)


async def response_generator_node(state: ChatState) -> ChatState:
    """Response Generator node that creates the final user-facing response."""
    messages = list(state["messages"])
    agent_output = state.get("agent_output", "")

    last_message = None
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage):
            last_message = msg.content
            break

    if not last_message:
        last_message = "Hello"

    bio_context = load_bio_context()

    agent_context = ""
    if agent_output:
        agent_context = f"""
Context from analysis (incorporate this naturally in your response):
{agent_output}
"""

    conversation_context = format_conversation_history(messages)

    llm = get_llm(temperature=0.7)

    prompt = RESPONSE_GENERATOR_PROMPT.format(
        bio_context=bio_context,
        agent_context=agent_context,
        conversation_context=conversation_context,
        user_message=last_message,
    )

    response = await llm.ainvoke([HumanMessage(content=prompt)])

    return {
        **state,
        "agent_output": response.content,
        "next_agent": "end",
    }


async def response_generator_stream(state: ChatState):
    """Stream version of response generator for SSE."""
    messages = list(state["messages"])
    agent_output = state.get("agent_output", "")

    last_message = None
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage):
            last_message = msg.content
            break

    if not last_message:
        last_message = "Hello"

    bio_context = load_bio_context()

    agent_context = ""
    if agent_output:
        agent_context = f"""
Context from analysis (incorporate this naturally in your response):
{agent_output}
"""

    conversation_context = format_conversation_history(messages)

    llm = get_llm(temperature=0.7)

    prompt = RESPONSE_GENERATOR_PROMPT.format(
        bio_context=bio_context,
        agent_context=agent_context,
        conversation_context=conversation_context,
        user_message=last_message,
    )

    async for chunk in llm.astream([HumanMessage(content=prompt)]):
        if chunk.content:
            yield chunk.content

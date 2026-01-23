"""Repo Investigator Agent - Handles questions about GitHub repositories."""

import re
from langchain_core.messages import HumanMessage

from src.infrastructure.ai.agents.base import ChatState, AgentType, get_llm
from src.infrastructure.ai.tools.repo_tools import (
    search_code,
    search_in_project,
    list_projects,
    get_project_files,
    get_repository_info,
)


def extract_project_name(question: str, available_projects: list[str]) -> str | None:
    """Try to extract a project name from the question."""
    question_lower = question.lower()

    for project in available_projects:
        if project.lower() in question_lower:
            return project

    patterns = [
        r"(?:in|about|for|from)\s+['\"]?(\w+[-_]?\w*)['\"]?\s*(?:project|repo|repository)?",
        r"['\"]?(\w+[-_]?\w*)['\"]?\s+(?:project|repo|repository)",
    ]

    for pattern in patterns:
        match = re.search(pattern, question_lower)
        if match:
            potential_name = match.group(1)
            for project in available_projects:
                if potential_name in project.lower() or project.lower() in potential_name:
                    return project

    return None


async def repo_investigator_node(state: ChatState) -> ChatState:
    """Repo Investigator node that answers questions about repositories."""
    messages = state["messages"]

    last_message = None
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage):
            last_message = msg.content
            break

    if not last_message:
        return {
            **state,
            "agent_output": "I couldn't understand your question about repositories.",
            "next_agent": AgentType.RESPONSE_GENERATOR.value,
        }

    tool_results: list[str] = []

    available_projects: list[str] = []
    try:
        from src.infrastructure.ai.vectorstore.faiss_store import get_vector_store
        vector_store = get_vector_store()
        stats = await vector_store.get_stats()
        available_projects = stats.get("projects", [])
    except Exception:
        pass

    target_project = extract_project_name(last_message, available_projects)

    if target_project:
        tool_results.append(f"**Searching in project: {target_project}**\n")

        try:
            files_info = await get_project_files.ainvoke({"project_name": target_project})
            tool_results.append(f"**Files in {target_project}:**\n{files_info}")
        except Exception as e:
            tool_results.append(f"Error getting project files: {e}")

        try:
            search_results = await search_in_project.ainvoke({
                "project_name": target_project,
                "query": last_message,
                "num_results": 10
            })
            tool_results.append(f"**Code Search Results in {target_project}:**\n{search_results}")
        except Exception as e:
            tool_results.append(f"Error searching code: {e}")

    else:
        try:
            repo_info = await get_repository_info.ainvoke({})
            tool_results.append(f"**GitHub Repositories:**\n{repo_info}")
        except Exception as e:
            tool_results.append(f"Error fetching repository info: {e}")

        try:
            projects_info = await list_projects.ainvoke({})
            tool_results.append(f"**Indexed Projects:**\n{projects_info}")
        except Exception as e:
            tool_results.append(f"Error listing projects: {e}")

        try:
            search_results = await search_code.ainvoke({
                "query": last_message,
                "num_results": 8
            })
            tool_results.append(f"**Relevant Code Search Results:**\n{search_results}")
        except Exception as e:
            tool_results.append(f"Error searching code: {e}")

    context = "\n\n---\n\n".join(tool_results)

    llm = get_llm(temperature=0.3)

    prompt = f"""You are answering questions about Dimitris Koutselis's GitHub repositories and code.

Here is the information gathered from the repositories:

{context}

---

User's question: {last_message}

IMPORTANT INSTRUCTIONS:
- Answer based ONLY on the actual code and file contents shown above
- If code snippets are provided, analyze them to answer the question
- Reference specific files, functions, classes, and line numbers when relevant
- If the user asks about implementation details (like "chunking strategy"), look at the code to find how it's actually implemented
- Include relevant code snippets in your answer
- If you don't have enough code context to answer, say so and suggest which files might contain the answer
- Do NOT make up information that isn't in the provided context"""

    response = await llm.ainvoke([HumanMessage(content=prompt)])
    agent_output = response.content if response.content else "I couldn't find specific repository information."

    return {
        **state,
        "agent_output": agent_output,
        "next_agent": AgentType.RESPONSE_GENERATOR.value,
    }

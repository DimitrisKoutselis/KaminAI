"""LangGraph workflow for multi-agent chat system."""

from typing import AsyncGenerator

from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph import StateGraph, END

from src.infrastructure.ai.agents import (
    AgentType,
    ChatState,
    orchestrator_node,
    repo_investigator_node,
    blog_explainer_node,
    response_generator_node,
    response_generator_stream,
)
from src.infrastructure.ai.vectorstore.faiss_store import (
    FAISSVectorStore,
    CodeDocument,
    get_vector_store,
)
from src.infrastructure.ai.mcp.github_client import get_github_client


def route_to_agent(state: ChatState) -> str:
    """Route to the appropriate agent based on orchestrator decision."""
    next_agent = state.get("next_agent", AgentType.RESPONSE_GENERATOR.value)

    if next_agent == AgentType.REPO_INVESTIGATOR.value:
        return "repo_investigator"
    elif next_agent == AgentType.BLOG_EXPLAINER.value:
        return "blog_explainer"
    else:
        return "response_generator"


def should_end(state: ChatState) -> str:
    """Check if the workflow should end."""
    next_agent = state.get("next_agent", "")
    if next_agent == "end":
        return END
    return "response_generator"


class ChatGraph:
    """LangGraph-based multi-agent chat system."""

    def __init__(self) -> None:
        self.graph = self._build_graph()
        self._initialized = False

    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow."""
        workflow = StateGraph(ChatState)

        workflow.add_node("orchestrator", orchestrator_node)
        workflow.add_node("repo_investigator", repo_investigator_node)
        workflow.add_node("blog_explainer", blog_explainer_node)
        workflow.add_node("response_generator", response_generator_node)

        workflow.set_entry_point("orchestrator")

        workflow.add_conditional_edges(
            "orchestrator",
            route_to_agent,
            {
                "repo_investigator": "repo_investigator",
                "blog_explainer": "blog_explainer",
                "response_generator": "response_generator",
            },
        )

        workflow.add_conditional_edges(
            "repo_investigator",
            should_end,
            {
                "response_generator": "response_generator",
                END: END,
            },
        )

        workflow.add_conditional_edges(
            "blog_explainer",
            should_end,
            {
                "response_generator": "response_generator",
                END: END,
            },
        )

        workflow.add_edge("response_generator", END)

        return workflow.compile()

    async def initialize(self) -> None:
        """Initialize the chat graph and index repositories."""
        if self._initialized:
            return

        print("Initializing AI chat system...")

        vector_store = get_vector_store()
        await vector_store.initialize()

        stats = await vector_store.get_stats()
        if stats["total_documents"] == 0:
            print("No documents indexed, starting repository indexing...")
            await self.index_repositories()
        else:
            print(f"Vector store has {stats['total_documents']} documents indexed.")

        self._initialized = True
        print("AI chat system initialized successfully!")

    async def index_repositories(self) -> dict:
        """Index all GitHub repositories into the vector store."""
        github_client = get_github_client()
        vector_store = get_vector_store()

        await vector_store.clear()

        repos = await github_client.get_repositories()
        print(f"Found {len(repos)} repositories to index")

        total_files = 0
        indexed_repos: list[str] = []

        for repo in repos:
            repo_name = repo["name"]
            print(f"Indexing repository: {repo_name}")

            try:
                files = await github_client.index_repository(
                    repo_name, repo.get("default_branch", "main")
                )

                if files:
                    documents = [
                        CodeDocument(
                            content=f["content"],
                            project_name=f["project_name"],
                            folder_path=f["folder_path"],
                            file_name=f["file_name"],
                            file_type=f["file_type"],
                            file_url=f["file_url"],
                        )
                        for f in files
                    ]

                    await vector_store.add_documents(documents)
                    total_files += len(files)
                    indexed_repos.append(repo_name)
                    print(f"  Indexed {len(files)} files from {repo_name}")

            except Exception as e:
                print(f"  Error indexing {repo_name}: {e}")
                continue

        return {
            "repositories_indexed": len(indexed_repos),
            "total_files": total_files,
            "repositories": indexed_repos,
        }

    async def chat(
        self,
        message: str,
        conversation_history: list[dict] | None = None,
    ) -> str:
        """Process a chat message and return a response."""
        if not self._initialized:
            await self.initialize()

        messages: list[HumanMessage | AIMessage] = []

        if conversation_history:
            for msg in conversation_history:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                else:
                    messages.append(AIMessage(content=msg["content"]))

        messages.append(HumanMessage(content=message))

        initial_state: ChatState = {
            "messages": messages,
            "next_agent": "",
            "agent_output": "",
            "conversation_history": conversation_history or [],
        }

        result = await self.graph.ainvoke(initial_state)

        return result.get("agent_output", "I'm sorry, I couldn't process your request.")

    async def chat_stream(
        self,
        message: str,
        conversation_history: list[dict] | None = None,
    ) -> AsyncGenerator[str, None]:
        """Process a chat message and stream the response."""
        if not self._initialized:
            await self.initialize()

        messages: list[HumanMessage | AIMessage] = []

        if conversation_history:
            for msg in conversation_history:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                else:
                    messages.append(AIMessage(content=msg["content"]))

        messages.append(HumanMessage(content=message))

        initial_state: ChatState = {
            "messages": messages,
            "next_agent": "",
            "agent_output": "",
            "conversation_history": conversation_history or [],
        }

        orchestrator_result = await orchestrator_node(initial_state)
        next_agent = orchestrator_result.get("next_agent", AgentType.RESPONSE_GENERATOR.value)

        agent_output = ""
        if next_agent == AgentType.REPO_INVESTIGATOR.value:
            result = await repo_investigator_node(orchestrator_result)
            agent_output = result.get("agent_output", "")
        elif next_agent == AgentType.BLOG_EXPLAINER.value:
            result = await blog_explainer_node(orchestrator_result)
            agent_output = result.get("agent_output", "")

        final_state: ChatState = {
            **orchestrator_result,
            "agent_output": agent_output,
        }

        async for chunk in response_generator_stream(final_state):
            yield chunk


_chat_graph: ChatGraph | None = None


def get_chat_graph() -> ChatGraph:
    """Get the singleton chat graph instance."""
    global _chat_graph
    if _chat_graph is None:
        _chat_graph = ChatGraph()
    return _chat_graph

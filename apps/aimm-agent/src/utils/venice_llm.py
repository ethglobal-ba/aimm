"""
Venice LLM utility for LangChain integration.
Provides pre-configured Venice AI model with web search and scraping capabilities.
"""

import os
from typing import Optional
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def get_venice_llm(
    model: str = "qwen3-4b",
    enable_web_search: bool = True,
    enable_web_scraping: bool = True,
    enable_web_citations: bool = True,
    include_search_results_in_stream: bool = True,
    return_search_results_as_documents: bool = True,
    include_venice_system_prompt: bool = False,
    temperature: float = 0.7,
    **kwargs
) -> ChatOpenAI:
    """
    Get a pre-configured Venice LangChain instance.

    Args:
        model: The Venice model to use (default: "qwen3-4b")
        enable_web_search: Enable web search capabilities
        enable_web_scraping: Enable web scraping
        enable_web_citations: Include citations in responses
        include_search_results_in_stream: Stream search results
        return_search_results_as_documents: Return search results as documents
        include_venice_system_prompt: Include Venice's system prompt
        temperature: Model temperature (default: 0.7)
        **kwargs: Additional ChatOpenAI parameters

    Returns:
        ChatOpenAI instance configured for Venice AI
    """
    api_key = os.getenv("VENICE_API_KEY")
    base_url = os.getenv("VENICE_BASE_URL")

    if not api_key:
        raise ValueError("VENICE_API_KEY not found in environment variables")
    if not base_url:
        raise ValueError("VENICE_BASE_URL not found in environment variables")

    # Build Venice-specific parameters as extra_body
    extra_body = {
        "venice_parameters": {
            "enable_web_search": "on" if enable_web_search else "off",
            "enable_web_scraping": enable_web_scraping,
            "enable_web_citations": enable_web_citations,
            "include_search_results_in_stream": include_search_results_in_stream,
            "return_search_results_as_documents": return_search_results_as_documents,
            "include_venice_system_prompt": include_venice_system_prompt,
        }
    }

    return ChatOpenAI(
        model=model,
        api_key=api_key,
        base_url=base_url,
        temperature=temperature,
        extra_body=extra_body,
        **kwargs
    )
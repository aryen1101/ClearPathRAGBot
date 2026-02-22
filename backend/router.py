def classify_query(query: str):
    """
    Tiered Deterministic Classifier to route queries without an LLM call.
    Returns: (classification_label, model_id)
    """
    # Clean the input
    q = query.lower().strip()
    words = q.split()
    word_count = len(words)

    # 1. Tier 1: Explicit "Complex" Intent Keywords
    # These words almost always indicate a request for deep information or a guide.
    complex_intents = ["how to", "compare", "troubleshoot", "difference", "steps", "explain"]
    if any(intent in q for intent in complex_intents):
        return "complex", "llama-3.3-70b-versatile"

    # 2. Tier 2: Structural Complexity Markers
    # A query is likely complex if it's long (>15 words) OR has multiple
    # questions and conjunctions (and, but, or).
    conjunctions = [" and ", " but ", " because ", " whereas "]
    has_multiple_parts = any(c in q for c in conjunctions)

    if word_count > 15 or (q.count('?') > 1 and has_multiple_parts):
        return "complex", "llama-3.3-70b-versatile"

    # 3. Tier 3: High Information Density Check
    # Even if short, if it contains specific technical jargon, use the better model.
    # (Optional: Add specific product terms here)
    technical_terms = ["api", "webhook", "sso", "saml", "integration", "analytics"]
    if any(term in q for term in technical_terms):
        return "complex", "llama-3.3-70b-versatile"

    # 4. Tier 4: Default to Simple (Greetings, short facts, or single-word queries)
    return "simple", "llama-3.1-8b-instant"
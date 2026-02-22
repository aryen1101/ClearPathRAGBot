def classify_query(query: str):
    """
    Tiered Deterministic Classifier to route queries without an LLM call.
    Returns: (classification_label, model_id)
    """
    q = query.lower().strip()
    words = q.split()
    word_count = len(words)

    complex_intents = ["how to", "compare", "troubleshoot", "difference", "steps", "explain"]
    if any(intent in q for intent in complex_intents):
        return "complex", "llama-3.3-70b-versatile"

    conjunctions = [" and ", " but ", " because ", " whereas "]
    has_multiple_parts = any(c in q for c in conjunctions)

    if word_count > 15 or (q.count('?') > 1 and has_multiple_parts):
        return "complex", "llama-3.3-70b-versatile"

    technical_terms = ["api", "webhook", "sso", "saml", "integration", "analytics"]
    if any(term in q for term in technical_terms):
        return "complex", "llama-3.3-70b-versatile"

    return "simple", "llama-3.1-8b-instant"
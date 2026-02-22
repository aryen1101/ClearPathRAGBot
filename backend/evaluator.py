def evaluate_response(response: str, distances: list):
    """
    Flags unreliable outputs based on context and content.
    Returns (is_flagged, label)
    """
    response_lower = response.lower()

    if not distances or distances[0] > 0.7:
        return True, "Low confidence — no relevant documentation found."

    refusal_phrases = [
        "i don't know", "i do not know", "cannot help", 
        "not mentioned", "information not found"
    ]
    if any(phrase in response_lower for phrase in refusal_phrases):
        return True, "Low confidence — please verify with support."

    out_of_domain = ["doctor", "medicine", "legal advice", "investment"]
    if any(word in response_lower for word in out_of_domain):
        return True, "Low confidence — answer is outside of project management scope."

    return False, None
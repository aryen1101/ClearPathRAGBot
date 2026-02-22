Q1 — Routing Logic

The Rules
My Router looks at our message and decides if it needs a Fast Thinker (cheap/quick) or a Deep Thinker (smart/expensive).
1. Look for "How-To" words: If we say "how do I," "explain," or "steps," Query will be sent to the Deep Thinker.
2. Count the words: If length of query is more than 15 words, I assume it’s a complicated story and send it to the Deep Thinker.
3. Check for "Nerd Speak": If we use technical words like "API" or "SSO," the Deep Thinker takes it.
4. The Default: If we just say "Hi" or ask a tiny question, the Fast Thinker handles it.

Why did you draw the boundary here? 
I picked the 15-word limit because that’s usually where a question turns into a long conversation.
- Under 15 words: Most people are just looking for a quick fact (e.g., "What is the price?"). The Fast Thinker (Llama 8B) is perfect for this because it's nearly instant.
- Over 15 words: Users start adding details, "if/then" scenarios, or multiple steps. The Deep Thinker (Llama 70B) has a much better "brain" for staying focused on long, winding sentences without getting confused.

Give one example of a query your router misclassified. What happened and why?
- The Query: "Tell me about the difference."
- It was only 5 words, so the router sent it to the Fast Thinker.
- The bot replied, "I don't know what you want me to compare."
- Even though the sentence was short, "comparing" is a high-level thinking task. Because the router only looks at the current message and not the whole chat history, it didn't realize the user was asking a complex follow-up to a previous topic.


Q2 - Describe a case where your RAG pipeline retrieved the wrong chunk — or nothing at all.

What was the query?
"Can I use ClearPath on my SmartPhone?"

What did the system retrieve (or fail to retrieve)? 
The system missed the specific mobile app chunk. 
Instead, it retrieved information about "Smart Features" of the desktop dashboard and "System Requirements" for computers. 
The bot ended up saying: "ClearPath has smart project tracking features for your desktop," but it never mentioned the mobile app.

Why did the retrieval fail?
It is because of Semantic Distance failure.
The Problem is that in the technical PDFs, the documentation is very specific. It uses words like "iOS app" and "Android APK." It never uses the broad, friendly word "smartphone."
While the embedding model ($all-MiniLM-L6-v2$) is smart, it calculates mathematical distance.
In this case, the word "smart" in "smartphone" was mathematically closer to the "Smart Dashboard" features in the desktop documentation than the "smartphone" concept was to the technical "iOS/Android" specifications.
The search engine got "distracted" by the word "smart" and followed the wrong path.

What would fix it?
To fix this in a real app,
I would use Query Expansion:
1. AI Pre-Processing: Before searching the database, I would have a small model rewrite the user's question. 
It would turn "Can I use it on a smartphone?" into "Can I use ClearPath on mobile, iOS, or Android devices?"
2.  Broader Search: By adding those extra "synonyms" to the search query, the system would easily find the technical iOS/Android chunks, even if the user used a more general word like "smartphone."


Q3 - Imagine this system handles 5,000 queries per day. Using Groq's free-tier limits as a proxy for proportional costs:

Token Usage Estimate (5,000 queries/day)
To estimate usage, we look at three steps the system takes for every message:
1. The Rewriter (8B Model): Every message first gets "cleaned up" using the chat history.
    5,000 queries × 300 tokens (Question + History) = 1.5M tokens/day
2. Complex Generation (70B Model): About 60% of questions are "hard" and need the big model to read multiple PDF chunks.
    3,000 queries × 1,200 tokens (PDF context + History + Answer) = 3.6M tokens/day
3. Simple Generation (8B Model): The other 40% are "easy" facts or greetings.
    2,000 queries × 600 tokens (Short context + Answer) = 1.2M tokens/day

Total Daily Usage: ~6.3 Million tokens.

Where is the biggest cost driver?
The biggest cost is for the Input Tokens.
In a RAG system, the AI doesn't just read the user's question.
To give a safe answer, we have to send it about 800–1,000 tokens of PDF text (the "context") every single time. 
Using the expensive 70B model to read all that text thousands of times a day is where most of the money goes.

The Single Highest-ROI Change
I would implement a Reranker.
Right now, we grab 5 chunks of text and send all of them to the AI. 
Often, only 1 or 2 chunks actually have the answer. A Reranker is a tiny, cheap tool that scores those 5 chunks first and only sends the top 2 most relevant ones to the smart model.
This would cut our reading bill by nearly 60% without making the bot any less smart.

What optimization would you avoid, and why?
I would avoid shortening the "History." You could save money by not sending previous messages to the AI, but then the bot would have amnesia.
It wouldn't know what "it" or "that" refers to from the previous sentence.
Saving a few cents isn't worth making the bot feel frustrating and stupid to the user.


Q4 - What is the most significant flaw in the system you built? Not a polish issue — a genuine limitation that would cause real problems if this were deployed.

What is it?
The biggest flaw in my system is that the Search Index is Static.
Imagine our company changes some documents tomorrow.
Even though the file on the computer is new,
the chatbot will keep telling customers the detail from old documents.
It doesn't "know" the file changed because it only reads the documents once when I first set it up.

Why did I ship it anyway?
I shipped it this way because building a Live Sync system is a huge job.
It requires setting up a background worker that watches folders 24/7.
Since this was a project to show off AI reasoning, I focused my time on making the bot smart.
For a demo, a static search is fine, but for a real business, it would be a major problem.

If you had more time, what single change would fix it?
I would add a "File Watcher" script.
It’s like a security guard for the PDF folder. Every time a file is saved or deleted, the script would wake up and say: "Hey, this document just changed! Re-read it right now and update the brain (ChromaDB)." 
This would ensure the bot is always talking about the most current version of our company data without me having to manually restart everything.


AI Usage

1. Create a Python Project structure and initialize uv in it.

2. Design a FASTAPI backend with clarity between RAG services and API routes and give me the structure.

3. Write a function to split PDF text into 500-token chunks with a 50-token overlap to maintain context.

4. Show me how to initialize a in-memory ChromaDB client as I want to test my RAG search logic in RAM first.

5. Help me write a simple function. I want to check the length of a user's message and look for specific keywords so I can decide whether to use a cheap, fast model or a more expensive, smart one without wasting an AI call on the decision.

6. How can I integrate Llama-3-70B on Groq for high-reasoning tasks and 8B for simple greetings?

7. Write a function to extract text from a PDF while keeping the paragraphs intact.

8. My FastAPI server is giving a '422 Unprocessable Entity' error. What is wrong with my JSON format?

9. Create a prompt that re-writes a user's follow-up question into a standalone search query.

10. Give me some questions from different levels to test the functionality of the backend.

11. I'm getting not enough values to unpack in my search function. How do I fix the ChromaDB result parsing?

12. The bot is making things up! How do I force it to say 'I don't know' if the answer isn't in the PDF?

13. The embedding model for my search query doesn't match the one I used for the PDF. How do I align them?

14. Generate a React frontend structure using Vite and Tailwind CSS.

15. Create a Chat Bubble component that distinguishes between the user and the AI.

16. Design a modern look for the chat window with a blurred background and thin borders.

17. Make the chat interface responsive so it looks good on both a laptop and a phone.

18. Implement a sidebar that shows technical details like exactly which PDF chunks the AI used , latency , tokens used , model used.

19. Which is a better way to connect frontend and backend axios or direct fetch

20. Which is better to store data in frontend zustand, redux, localStorgae.

21. Add zustand functionality in frontend so that data is not lost in refresh.

22. My chatbot is not able to remember the history. How can I make it remember short term history.

23. Not able to make a connection between frontend and backend.

24. The chat window doesn't auto-scroll to the bottom when new messages arrive. Help me fix this.

25. Explain why 15 word boundary logic?

26. calculate the daily token math. If 5000 people use this, how many tokens will be used in total?

27. Why is the Input Context from the PDF snippets the biggest cost driver in this system?

28. How we can solve the semantic distance problem?

29. Biggest Flaw in this chatbot?

30. What happen if a PDF file changes and index is static?

31. How can we fix this issue?

32. Review my final written answers for Q1 through Q4 to make sure they sound technically accurate.

33. Generate a Readme.md for this complete project, It should include
How to run the project locally — exact setup and start commands
Which Groq models you used and any environment config
Which bonus challenges you attempted, if 
Any known issues or limitations


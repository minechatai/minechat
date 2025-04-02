import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming JSON body, which should include a 'history' field (an array of messages)
    const body = await request.json();
    const { history } = body;
    if (!history || !Array.isArray(history)) {
      return NextResponse.json(
        { error: "Invalid request: 'history' must be an array of messages." },
        { status: 400 }
      );
    }

    // Build the messages array for the OpenAI API call.
    // The system message instructs the AI to extract unique new questions from the provided conversation history.
    // The assistant must output a JSON object following this exact signature:
    // { "uniqueNewQuestions": [ "Question 1", "Question 2", ... ] }
    // If there are no unique new questions, the value should be null.
    const messages = [
      {
        role: "system",
        content:
          "You are an assistant that extracts unique new questions from a conversation history. " +
          "Given a list of messages (with 'role' and 'content' keys), identify all the questions that are new and unique. " +
          "Return a JSON object with the following signature: { \"uniqueNewQuestions\": [\"Question1\", \"Question2\", ...] }. " +
          "If there are no unique new questions, set \"uniqueNewQuestions\" to null. Do not include any additional keys or text."
      },
      {
        role: "user",
        content: `Here is the conversation history:\n\n${JSON.stringify(history)}`
      }
    ];

    // Ensure the API key is set in the environment
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: OPENAI_API_KEY is not set." },
        { status: 500 }
      );
    }

    // Call the OpenAI API using the gpt-4o-mini model
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        response_format: { type: "json_object" },
        temperature: 0
      })
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      return NextResponse.json(
        { error: `OpenAI API error: ${openaiResponse.status} ${errText}` },
        { status: 500 }
      );
    }

    const data = await openaiResponse.json();
    // The assistant's JSON string is in data.choices[0].message.content
    const jsonString = data.choices[0].message.content;

    let resultObj;
    try {
      resultObj = JSON.parse(jsonString);
    } catch (e) {
      return NextResponse.json(
        { error: "Failed to parse JSON response from OpenAI API." },
        { status: 500 }
      );
    }

    // Return the JSON object directly
    return NextResponse.json(resultObj);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

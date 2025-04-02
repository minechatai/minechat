import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();
    if (!accessToken) {
      return NextResponse.json({ error: "Missing accessToken" }, { status: 400 });
    }

    // Call Facebook Graph API to get the page name based on the access token
    const fbResponse = await fetch(`https://graph.facebook.com/v12.0/me?fields=name&access_token=${accessToken}`);
    const data = await fbResponse.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message || "Error fetching page name" }, { status: 400 });
    }

    return NextResponse.json({ pageName: data.name });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
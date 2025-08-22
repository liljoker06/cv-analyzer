import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // formData envoyé depuis le client
    const formData = await req.formData();

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/parse-cv/?structure=1&analyze=1`;

    const token = process.env.API_TOKEN; 

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: "Backend error", details: text },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("API Analysis Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

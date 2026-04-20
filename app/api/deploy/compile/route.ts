import { NextResponse } from "next/server";
import { compileContracts } from "@/lib/deploy/compiler";

export async function POST(request: Request) {
  try {
    const params = await request.json();
    const result = await compileContracts(params);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, contracts: [], error: (error as Error).message },
      { status: 500 },
    );
  }
}

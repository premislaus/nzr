import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUsersCollection } from "@/lib/users";

type LoginPayload = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  let payload: LoginPayload;

  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  const email = payload.email?.trim().toLowerCase() ?? "";
  const password = payload.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "E-mail i hasło są wymagane." }, { status: 400 });
  }

  const users = await getUsersCollection();
  const user = await users.findOne({ email });

  if (!user) {
    return NextResponse.json({ error: "Nieprawidłowy e-mail lub hasło." }, { status: 401 });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);

  if (!matches) {
    return NextResponse.json({ error: "Nieprawidłowy e-mail lub hasło." }, { status: 401 });
  }

  return NextResponse.json({
    user: { id: user._id?.toString(), name: user.name, email: user.email },
  });
}

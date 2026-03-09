import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, {
  idle_timeout: 20,
  max_lifetime: 60 * 30
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ user: null });
    }

    const users = await sql`
      SELECT id, name, email FROM users WHERE email = ${session.user.email}
    `;

    if (users.length === 0) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: users[0] });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json({ user: null });
  }
}

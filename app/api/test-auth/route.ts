import { NextResponse } from 'next/server';
import postgres from 'postgres';
import bcrypt from 'bcrypt';

const sql = postgres(process.env.POSTGRES_URL!, { 
  idle_timeout: 20,
  max_lifetime: 60 * 30
});

export async function GET() {
  try {
    // Get all users
    const users = await sql`
      SELECT id, name, email, role, 
             substring(password, 1, 20) as password_preview
      FROM users 
      ORDER BY role DESC
    `;

    // Test password verification for admin
    const adminUser = await sql`
      SELECT * FROM users WHERE email = 'admin@ecommerce.com'
    `;

    let passwordCheck = null;
    if (adminUser.length > 0) {
      const isValid = await bcrypt.compare('admin123', adminUser[0].password);
      passwordCheck = {
        email: 'admin@ecommerce.com',
        passwordWorks: isValid,
        hashInDb: adminUser[0].password.substring(0, 30) + '...'
      };
    }

    return NextResponse.json({
      success: true,
      users: users,
      passwordTest: passwordCheck,
      correctHash: '$2b$10$onTVtivncwbSXYNfqD/jJOeAtJknIZkITSyuOQiGXsN4qXSQTlRL.'
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

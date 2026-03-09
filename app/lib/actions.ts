'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import bcrypt from 'bcrypt';

const sql = postgres(process.env.POSTGRES_URL!, { 
  idle_timeout: 20,
  max_lifetime: 60 * 30
});

export type State = {
  errors?: Record<string, string[]>;
  message?: string | null;
};

// ============= AUTHENTICATION ACTIONS =============

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function handleSignOut() {
  await signOut();
}

const RegisterSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export async function registerUser(prevState: State, formData: FormData) {
  const validatedFields = RegisterSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Register User.',
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return {
        message: 'Email already registered.',
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await sql`
      INSERT INTO users (name, email, password, role)
      VALUES (${name}, ${email}, ${hashedPassword}, 'customer')
    `;

    return {
      message: 'success',
    };
  } catch (error) {
    console.error('Registration Error:', error);
    return {
      message: 'Database Error: Failed to Register User.',
    };
  }
}

// ============= PRODUCT ACTIONS =============

const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: 'Product name is required.' }),
  description: z.string(),
  price: z.coerce.number().gt(0, { message: 'Price must be greater than $0.' }),
  stock_quantity: z.coerce.number().gte(0, { message: 'Stock quantity must be 0 or greater.' }),
  category_id: z.string().min(1, { message: 'Please select a category.' }),
  image_url: z.string(),
});

const CreateProduct = ProductSchema.omit({ id: true });

export async function createProduct(prevState: State, formData: FormData) {
  const validatedFields = CreateProduct.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    stock_quantity: formData.get('stock_quantity'),
    category_id: formData.get('category_id'),
    image_url: formData.get('image_url'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Product.',
    };
  }

  const { name, description, price, stock_quantity, category_id, image_url } = validatedFields.data;

  try {
    await sql`
      INSERT INTO products (name, description, price, stock_quantity, category_id, image_url)
      VALUES (${name}, ${description}, ${price}, ${stock_quantity}, ${category_id}, ${image_url})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to Create Product.',
    };
  }

  revalidatePath('/dashboard/products');
  redirect('/dashboard/products');
}

const UpdateProduct = ProductSchema.omit({ id: true });

export async function updateProduct(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateProduct.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    stock_quantity: formData.get('stock_quantity'),
    category_id: formData.get('category_id'),
    image_url: formData.get('image_url'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Product.',
    };
  }

  const { name, description, price, stock_quantity, category_id, image_url } = validatedFields.data;

  try {
    await sql`
      UPDATE products
      SET name = ${name}, description = ${description}, price = ${price},
          stock_quantity = ${stock_quantity}, category_id = ${category_id},
          image_url = ${image_url}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to Update Product.' };
  }

  revalidatePath('/dashboard/products');
  redirect('/dashboard/products');
}

export async function deleteProduct(id: string) {
  try {
    await sql`DELETE FROM products WHERE id = ${id}`;
    revalidatePath('/dashboard/products');
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to Delete Product.' };
  }
}

export async function toggleProductStatus(id: string, isActive: boolean) {
  try {
    await sql`
      UPDATE products
      SET is_active = ${!isActive}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    revalidatePath('/dashboard/products');
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to Toggle Product Status.' };
  }
}

// ============= CATEGORY ACTIONS =============

const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: 'Category name is required.' }),
  description: z.string(),
  image_url: z.string(),
});

const CreateCategory = CategorySchema.omit({ id: true });

export async function createCategory(prevState: State, formData: FormData) {
  const validatedFields = CreateCategory.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    image_url: formData.get('image_url'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Category.',
    };
  }

  const { name, description, image_url } = validatedFields.data;

  try {
    await sql`
      INSERT INTO categories (name, description, image_url)
      VALUES (${name}, ${description}, ${image_url})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to Create Category.',
    };
  }

  revalidatePath('/dashboard/categories');
  redirect('/dashboard/categories');
}

export async function deleteCategory(id: string) {
  try {
    await sql`DELETE FROM categories WHERE id = ${id}`;
    revalidatePath('/dashboard/categories');
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to Delete Category.' };
  }
}

// ============= ORDER ACTIONS =============

export async function updateOrderStatus(id: string, status: string) {
  try {
    await sql`
      UPDATE orders
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    revalidatePath('/dashboard/orders');
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to Update Order Status.' };
  }
}

export async function createOrder(userId: string, shippingAddress: string, cartItems: any[]) {
  try {
    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);

    // Create order
    const orderResult = await sql`
      INSERT INTO orders (user_id, total_amount, shipping_address, status)
      VALUES (${userId}, ${totalAmount}, ${shippingAddress}, 'pending')
      RETURNING id
    `;

    const orderId = orderResult[0].id;

    // Create order items
    for (const item of cartItems) {
      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (${orderId}, ${item.product_id}, ${item.quantity}, ${item.product_price})
      `;

      // Update product stock
      await sql`
        UPDATE products
        SET stock_quantity = stock_quantity - ${item.quantity}
        WHERE id = ${item.product_id}
      `;
    }

    // Clear cart
    await sql`DELETE FROM cart_items WHERE user_id = ${userId}`;

    revalidatePath('/dashboard/orders');
    return { success: true, orderId };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to Create Order.' };
  }
}

// ============= CART ACTIONS =============

export async function addToCart(userId: string, productId: string, quantity: number = 1) {
  try {
    // Check if item already in cart
    const existing = await sql`
      SELECT id, quantity FROM cart_items 
      WHERE user_id = ${userId} AND product_id = ${productId}
    `;

    if (existing.length > 0) {
      // Update quantity
      await sql`
        UPDATE cart_items
        SET quantity = quantity + ${quantity}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId} AND product_id = ${productId}
      `;
    } else {
      // Insert new item
      await sql`
        INSERT INTO cart_items (user_id, product_id, quantity)
        VALUES (${userId}, ${productId}, ${quantity})
      `;
    }

    revalidatePath('/cart');
    return { success: true };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to Add to Cart.' };
  }
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  try {
    if (quantity <= 0) {
      await sql`DELETE FROM cart_items WHERE id = ${cartItemId}`;
    } else {
      await sql`
        UPDATE cart_items
        SET quantity = ${quantity}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${cartItemId}
      `;
    }

    revalidatePath('/cart');
    return { success: true };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to Update Cart.' };
  }
}

export async function removeFromCart(cartItemId: string) {
  try {
    await sql`DELETE FROM cart_items WHERE id = ${cartItemId}`;
    revalidatePath('/cart');
    return { success: true };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to Remove from Cart.' };
  }
}

export async function clearCart(userId: string) {
  try {
    await sql`DELETE FROM cart_items WHERE user_id = ${userId}`;
    revalidatePath('/cart');
    return { success: true };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to Clear Cart.' };
  }
}
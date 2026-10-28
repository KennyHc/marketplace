import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load env vars from .env.local
process.loadEnvFile('.env.local');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Demo users to create/reuse
const demoUsers = [
  { email: 'ana@demo.test', name: 'Ana García', phone: '612345678' },
  { email: 'luis@demo.test', name: 'Luis Martín', phone: '623456789' },
  { email: 'marta@demo.test', name: 'Marta López', phone: '634567890' },
  { email: 'jurado@demo.test', name: 'Jurado Demo', phone: '645678901' },
];

// Listing data (spanish titles/descriptions with state)
const listingTemplates = [
  {
    category: 'libros_apuntes',
    title: 'Apuntes de Cálculo I',
    description: 'Apuntes completos del curso de Cálculo I. Estado: como nuevo',
    price: 8,
    photo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Notebook_writing.jpg/960px-Notebook_writing.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  },
  {
    category: 'libros_apuntes',
    title: 'Libro Física Cuántica',
    description: 'Libro de Física Cuántica en buen estado. Estado: usado',
    price: 15,
    photo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Cornell_syllabuses_for_Physics_112_and_Physics_213_and_Halliday_and_Resnick_textbook_used_by_both.jpg/960px-Cornell_syllabuses_for_Physics_112_and_Physics_213_and_Halliday_and_Resnick_textbook_used_by_both.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  },
  {
    category: 'electronica',
    title: 'Monitor Dell 24"',
    description: 'Monitor Dell 24 pulgadas, Full HD, funcionando perfectamente. Estado: como nuevo',
    price: 120,
    photo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Dell_Professional_P2212H-9899.jpg/960px-Dell_Professional_P2212H-9899.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  },
  {
    category: 'electronica',
    title: 'Calculadora Casio fx-991',
    description: 'Calculadora científica Casio fx-991EX, leve desgaste. Estado: usado',
    price: 25,
    photo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8f/Casio_fx-991ES_Calculator_New.jpg/960px-Casio_fx-991ES_Calculator_New.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  },
  {
    category: 'electronica',
    title: 'Cable USB-C 2m',
    description: 'Cable USB-C de buena calidad, 2 metros. Estado: nuevo',
    price: 5,
    photo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c3/USB-C_cable_2017_A.jpg/960px-USB-C_cable_2017_A.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  },
  {
    category: 'muebles',
    title: 'Silla de escritorio ergonómica',
    description: 'Silla giratoria ergonómica, color negro. Estado: como nuevo',
    price: 85,
    photo: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/ErgoFlip_Active_Ergonomic_Chair_eye_view.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  },
  {
    category: 'muebles',
    title: 'Estantería de madera',
    description: 'Estantería de pared de madera maciza, 120x80cm. Estado: usado',
    price: 45,
    photo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Encyclopedia_on_a_wooden_bookshelf.png/960px-Encyclopedia_on_a_wooden_bookshelf.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  },
  {
    category: 'muebles',
    title: 'Escritorio pequeño',
    description: 'Escritorio compacto para habitación o despacho. Estado: como nuevo',
    price: 60,
    photo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Desk_or_writing_table_MET_94197.jpg/960px-Desk_or_writing_table_MET_94197.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  },
  {
    category: 'material_oficina',
    title: 'Pack de bolígrafos Staedtler',
    description: 'Pack de 24 bolígrafos de colores de Staedtler. Estado: nuevo',
    price: 12,
    photo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/STAEDTLER_avant-garde.jpg/960px-STAEDTLER_avant-garde.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  },
  {
    category: 'material_oficina',
    title: 'Cuaderno A4 de hojas cuadriculadas',
    description: 'Cuaderno A4, 200 hojas cuadriculadas, sin usar. Estado: nuevo',
    price: 4,
    photo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Graph-ruled_composition_book%2C_4_squares_per_inch%2C_80_pages.jpg/960px-Graph-ruled_composition_book%2C_4_squares_per_inch%2C_80_pages.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  },
  {
    category: 'material_oficina',
    title: 'Organizador de escritorio',
    description: 'Organizador con varios compartimentos para escritorio. Estado: como nuevo',
    price: 18,
    photo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/EFTA00001176_-_Sleek_Apple_iMac_sits_on_a_glass_desk_accompanied_by_a_vintage_telephone_and_a_pen_holder_in_a_tidy_workspace.jpg/960px-EFTA00001176_-_Sleek_Apple_iMac_sits_on_a_glass_desk_accompanied_by_a_vintage_telephone_and_a_pen_holder_in_a_tidy_workspace.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  },
  {
    category: 'ropa',
    title: 'Sudadera de la uni talla M',
    description: 'Sudadera gris del logo de la universidad, talla M. Estado: como nuevo',
    price: 20,
    photo: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Sudadera_urban.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
  },
  {
    category: 'ropa',
    title: 'Jeans azul oscuro talla 32',
    description: 'Pantalones vaqueros azul oscuro, talla 32. Estado: usado',
    price: 25,
    photo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/Women%27s_Levi%27s_jeans_inside_out.jpg/960px-Women%27s_Levi%27s_jeans_inside_out.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  },
  {
    category: 'ropa',
    title: 'Camiseta blanca básica',
    description: 'Camiseta blanca de algodón 100%, talla L. Estado: nuevo',
    price: 8,
    photo: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&auto=format&q=80',
  },
  {
    category: 'otros',
    title: 'Planta verde de interior',
    description: 'Planta decorativa de interior con maceta. Estado: como nuevo',
    price: 12,
    photo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Ponytail_Palm_Houseplant.jpg/960px-Ponytail_Palm_Houseplant.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  },
  {
    category: 'otros',
    title: 'Lámpara de escritorio LED',
    description: 'Lámpara de escritorio ajustable con LED, funcionando bien. Estado: usado',
    price: 22,
    photo: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/Battery_powered_LED_desk_lamp-7420.jpg/960px-Battery_powered_LED_desk_lamp-7420.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
  },
];

async function seedDatabase() {
  console.log('🌱 Iniciando seed...\n');

  // Get demo.test organization
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .select('id')
    .eq('domain', 'demo.test')
    .single();

  if (orgError || !orgData) {
    console.error('Error finding demo.test organization:', orgError);
    process.exit(1);
  }

  const orgId = orgData.id;
  console.log(`✓ Found organization: ${orgId}\n`);

  const createdUsers = {};

  // Setup demo users
  for (const user of demoUsers) {
    console.log(`Setting up ${user.email}...`);

    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    let userId = existingUsers?.users?.find((u) => u.email === user.email)?.id;

    // Create user if doesn't exist
    if (!userId) {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: 'pasillo-demo',
        email_confirm: true,
      });

      if (createError || !newUser?.user?.id) {
        console.error(`  Error creating user ${user.email}:`, createError);
        continue;
      }
      userId = newUser.user.id;
      console.log(`  ✓ Created user ${user.email} (${userId})`);
    } else {
      console.log(`  ✓ Reused existing user ${user.email} (${userId})`);
    }

    // Update profile name
    await supabase
      .from('profiles')
      .update({ name: user.name })
      .eq('id', userId);
    console.log(`  ✓ Updated profile name: ${user.name}`);

    // Upsert contact info
    await supabase
      .from('contact_info')
      .upsert(
        { user_id: userId, phone: user.phone },
        { onConflict: 'user_id' }
      );
    console.log(`  ✓ Updated phone: ${user.phone}`);

    createdUsers[user.email] = { id: userId, name: user.name };
    console.log();
  }

  // Delete existing listings from demo users
  console.log('Cleaning up old listings...');
  for (const [email, userData] of Object.entries(createdUsers)) {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('seller_id', userData.id);
    if (error) console.error(`  Error deleting listings for ${email}:`, error);
  }
  console.log('✓ Cleaned up old listings\n');

  // Create listings
  console.log('Creating listings...');
  const sellers = [createdUsers['ana@demo.test'].id, createdUsers['luis@demo.test'].id, createdUsers['marta@demo.test'].id];
  const now = new Date();
  const listings = [];

  for (let i = 0; i < listingTemplates.length; i++) {
    const template = listingTemplates[i];
    const sellerId = sellers[i % sellers.length];
    const daysAgo = Math.floor((i / listingTemplates.length) * 10); // Spread over 10 days
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    listings.push({
      org_id: orgId,
      seller_id: sellerId,
      title: template.title,
      description: template.description,
      price: template.price,
      category: template.category,
      photo_url: template.photo,
      status: 'activo',
      created_at: createdAt,
    });
  }

  const { data: insertedListings, error: insertError } = await supabase
    .from('listings')
    .insert(listings)
    .select();

  if (insertError) {
    console.error('Error inserting listings:', insertError);
  } else {
    console.log(`✓ Created ${insertedListings?.length || 0} listings\n`);
  }

  // Mark 2 of Ana's listings as sold (to Luis and Marta) and add ratings both ways.
  // Written directly: mark_sold() relies on auth.uid(), which is null for the service role.
  console.log('Setting up sold listings with ratings...');
  const anaId = createdUsers['ana@demo.test'].id;
  const buyers = [
    { id: createdUsers['luis@demo.test'].id, toAna: 5, fromAna: 5 },
    { id: createdUsers['marta@demo.test'].id, toAna: 4, fromAna: 5 },
  ];
  const anaListings = (insertedListings || []).filter((l) => l.seller_id === anaId);
  for (const [i, buyer] of buyers.entries()) {
    const listing = anaListings[i];
    if (!listing) break;
    const steps = [
      await supabase.from('contact_reveals').insert({ listing_id: listing.id, buyer_id: buyer.id }),
      await supabase
        .from('listings')
        .update({ status: 'vendido', buyer_id: buyer.id, sold_at: new Date().toISOString() })
        .eq('id', listing.id),
      await supabase.from('ratings').insert([
        { listing_id: listing.id, from_user: buyer.id, to_user: anaId, stars: buyer.toAna },
        { listing_id: listing.id, from_user: anaId, to_user: buyer.id, stars: buyer.fromAna },
      ]),
    ];
    const failed = steps.find((r) => r.error);
    if (failed) console.error(`Error marking "${listing.title}" as sold:`, failed.error);
    else console.log(`✓ Marked "${listing.title}" as sold with ratings`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SEED COMPLETADO');
  console.log('='.repeat(60));
  console.log('\nCuentas de demostración:');
  for (const user of demoUsers) {
    console.log(`  Email: ${user.email}`);
    console.log(`  Contraseña: pasillo-demo`);
    console.log(`  Nombre: ${user.name}`);
    console.log();
  }

  console.log('✓ Seed finalizado exitosamente');
}

seedDatabase().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

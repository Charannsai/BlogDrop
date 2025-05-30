import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signUpUser(email: string, password: string, displayName: string, subdomain: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        subdomain: subdomain,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signInUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  
  if (error) throw error;
  return data.user;
}

export async function isSubdomainAvailable(subdomain: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('subdomain')
    .eq('subdomain', subdomain)
    .single();

  if (error && error.code !== 'PGSQL_ERROR_NO_DATA_FOUND') {
    throw error;
  }

  return !data;
}

export async function createBlog(blogData: Partial<Blog>) {
  // Convert camelCase to snake_case for database columns
  const dbBlogData = {
    ...blogData,
    user_id: blogData.userId,
    created_at: blogData.createdAt,
    updated_at: blogData.updatedAt,
    is_published: blogData.isPublished,
    random_url: blogData.randomUrl
  };

  // Remove the camelCase properties
  delete dbBlogData.userId;
  delete dbBlogData.createdAt;
  delete dbBlogData.updatedAt;
  delete dbBlogData.isPublished;
  delete dbBlogData.randomUrl;

  const { data, error } = await supabase
    .from('blogs')
    .insert(dbBlogData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBlog(id: string, blogData: Partial<Blog>) {
  // Convert camelCase to snake_case for database columns
  const dbBlogData = {
    ...blogData,
    user_id: blogData.userId,
    created_at: blogData.createdAt,
    updated_at: blogData.updatedAt,
    is_published: blogData.isPublished,
    random_url: blogData.randomUrl
  };

  // Remove the camelCase properties
  delete dbBlogData.userId;
  delete dbBlogData.createdAt;
  delete dbBlogData.updatedAt;
  delete dbBlogData.isPublished;
  delete dbBlogData.randomUrl;

  const { data, error } = await supabase
    .from('blogs')
    .update(dbBlogData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBlog(id: string) {
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getBlogById(id: string) {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getBlogsByUserId(userId: string) {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('user_id', userId) // Changed from userId to user_id
    .order('updated_at', { ascending: false }); // Changed from updatedAt to updated_at

  if (error) throw error;
  return data;
}

export async function uploadImage(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from('blog-media')
    .upload(path, file);

  if (error) throw error;
  
  const { data: publicUrl } = supabase.storage
    .from('blog-media')
    .getPublicUrl(data.path);
    
  return publicUrl.publicUrl;
}
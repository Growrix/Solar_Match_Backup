import { supabase } from '@/lib/supabase'
import type { BlogPost } from '@/types/database.types'

export interface BlogResponse {
  data: BlogPost[] | null
  error: Error | null
}

export interface SingleBlogResponse {
  data: BlogPost | null
  error: Error | null
}

// Get all published blog posts
export const getBlogPosts = async (limit?: number): Promise<BlogResponse> => {
  try {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// Get blog post by slug
export const getBlogPostBySlug = async (slug: string): Promise<SingleBlogResponse> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// Get blog posts by category
export const getBlogPostsByCategory = async (category: string): Promise<BlogResponse> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('category', category)
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Retorna um cliente "vazio" se Supabase não estiver configurado
  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_project_url') {
    // Retorna um proxy que retorna dados vazios para todas as operações
    return createFallbackClient()
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component - ignorar
        }
      },
    },
  })
}

// Cliente fallback que retorna dados vazios graciosamente
function createFallbackClient() {
  const emptyResult = { data: null, error: null, count: null }
  const emptyQueryBuilder = {
    select: () => emptyQueryBuilder,
    insert: () => emptyQueryBuilder,
    update: () => emptyQueryBuilder,
    delete: () => emptyQueryBuilder,
    eq: () => emptyQueryBuilder,
    neq: () => emptyQueryBuilder,
    in: () => emptyQueryBuilder,
    gte: () => emptyQueryBuilder,
    lte: () => emptyQueryBuilder,
    gt: () => emptyQueryBuilder,
    lt: () => emptyQueryBuilder,
    order: () => emptyQueryBuilder,
    limit: () => emptyQueryBuilder,
    single: () => Promise.resolve(emptyResult),
    then: (resolve: (value: typeof emptyResult) => unknown) => Promise.resolve(emptyResult).then(resolve),
  }

  return {
    from: () => emptyQueryBuilder,
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
    storage: {
      from: () => ({
        upload: async () => emptyResult,
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  } as unknown as ReturnType<typeof import('@supabase/ssr').createServerClient>
}

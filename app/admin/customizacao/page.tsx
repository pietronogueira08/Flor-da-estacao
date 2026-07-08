import { createClient } from '@/lib/supabase/server'
import CustomizacaoClient from '@/components/admin/CustomizacaoClient'

export const dynamic = 'force-dynamic'

async function getStoreSettings() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 1)
      .single()
    return data
  } catch (err) {
    console.error('Error fetching store settings', err)
    return null
  }
}

export default async function CustomizacaoPage() {
  const settings = await getStoreSettings()
  return <CustomizacaoClient settings={settings} />
}

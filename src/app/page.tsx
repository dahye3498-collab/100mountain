import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { KoreaMap } from '@/components/KoreaMap'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: climbRecords } = await supabase
    .from('climb_records')
    .select('id, mountain_id, climbed_at, memo')
    .eq('user_id', user.id)

  return (
    <KoreaMap
      initialRecords={climbRecords ?? []}
      userId={user.id}
    />
  )
}

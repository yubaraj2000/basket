import { ensureSignedIn, supabase } from '@/lib/supabase';

/** The shapes of our database rows (they match supabase/migrations). */
export type Household = {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
};

export type Item = {
  id: string;
  household_id: string;
  name: string;
  quantity: string;
  added_by_name: string;
  done: boolean;
  done_by_name: string | null;
  done_at: string | null;
  created_at: string;
};

export type Member = {
  user_id: string;
  name: string;
};

/** Turn "basket.app/j/X7K2-9QD", "x7k29qd" or "X7K2-9QD" into "X7K2-9QD". */
export function parseInviteCode(input: string): string {
  const last = input.trim().split('/').filter(Boolean).pop() ?? '';
  const plain = last.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return plain.length === 7 ? `${plain.slice(0, 4)}-${plain.slice(4)}` : last.toUpperCase();
}

export async function createHousehold(memberName: string): Promise<Household> {
  await ensureSignedIn();
  const { data, error } = await supabase.rpc('create_household', { p_member_name: memberName });
  if (error) throw new Error(error.message);
  return data as Household;
}

export async function joinHousehold(code: string, memberName: string): Promise<Household> {
  await ensureSignedIn();
  const { data, error } = await supabase.rpc('join_household', {
    p_code: parseInviteCode(code),
    p_member_name: memberName,
  });
  if (error) throw new Error(error.message);
  return data as Household;
}

export async function getHousehold(id: string): Promise<Household> {
  await ensureSignedIn();
  const { data, error } = await supabase.from('households').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data as Household;
}

export async function getMembers(householdId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from('members')
    .select('user_id, name')
    .eq('household_id', householdId)
    .order('joined_at');
  if (error) throw new Error(error.message);
  return data as Member[];
}

export async function getItems(householdId: string): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at');
  if (error) throw new Error(error.message);
  return data as Item[];
}

export async function addItem(
  householdId: string,
  name: string,
  quantity: string,
  addedBy: string
): Promise<void> {
  const { error } = await supabase.from('items').insert({
    household_id: householdId,
    name: name.trim(),
    quantity: quantity.trim(),
    added_by_name: addedBy,
  });
  if (error) throw new Error(error.message);
}

export async function setItemDone(item: Item, done: boolean, byName: string): Promise<void> {
  const { error } = await supabase
    .from('items')
    .update({
      done,
      done_by_name: done ? byName : null,
      done_at: done ? new Date().toISOString() : null,
    })
    .eq('id', item.id);
  if (error) throw new Error(error.message);
}

/**
 * Live updates: call onChange whenever an item in this household is added, changed or removed,
 * on any phone. Returns a function that stops listening.
 */
export function subscribeToItems(
  householdId: string,
  onChange: (event: 'INSERT' | 'UPDATE' | 'DELETE', item: Partial<Item> & { id: string }) => void
): () => void {
  const channel = supabase
    .channel(`items:${householdId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'items', filter: `household_id=eq.${householdId}` },
      (payload) => {
        const row = (payload.eventType === 'DELETE' ? payload.old : payload.new) as Partial<Item> & {
          id: string;
        };
        onChange(payload.eventType, row);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

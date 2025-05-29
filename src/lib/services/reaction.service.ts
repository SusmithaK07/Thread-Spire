import { supabase } from '@/integrations/supabase/client'

export type ReactionType = '🤯' | '💡' | '😌' | '🔥' | '🫶'

export interface ReactionCount {
  type: ReactionType
  count: number
}

export const reactionService = {
  // Add a reaction to a thread or segment
  async addReaction(threadId: string, type: ReactionType, segmentId?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // First check if user already has a reaction for this thread/segment
      let query = supabase
        .from('reactions')
        .select('id, type')
        .eq('thread_id', threadId)
        .eq('user_id', user.id);
      
      if (segmentId) {
        query = query.eq('segment_id', segmentId);
      } else {
        query = query.is('segment_id', null);
      }

      const { data: existingReaction } = await query;

      // If user already has a reaction and it's the same type, remove it (toggle off)
      if (existingReaction && existingReaction.length > 0) {
        if (existingReaction[0].type === type) {
          return this.removeReaction(threadId, type, segmentId);
        }
        // If it's a different type, remove the old one first
        await this.removeReaction(threadId, existingReaction[0].type as ReactionType, segmentId);
      }

      // Add the new reaction
      const { error } = await supabase.from('reactions').insert({
        thread_id: threadId,
        segment_id: segmentId || null,
        user_id: user.id,
        type,
      });

      if (error) {
        console.error('Error adding reaction:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in addReaction:', error);
      throw error;
    }
  },

  // Remove a reaction from a thread or segment
  async removeReaction(threadId: string, type: ReactionType, segmentId?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      let query = supabase
        .from('reactions')
        .delete()
        .eq('thread_id', threadId)
        .eq('user_id', user.id)
        .eq('type', type);

      if (segmentId) {
        query = query.eq('segment_id', segmentId);
      } else {
        query = query.is('segment_id', null);
      }

      const { error } = await query;
      if (error) {
        console.error('Error removing reaction:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in removeReaction:', error);
      throw error;
    }
  },

  // Get user's reactions for a thread or segment
  async getUserReactions(threadId: string, segmentId?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    try {
      let query = supabase
        .from('reactions')
        .select('type')
        .eq('thread_id', threadId)
        .eq('user_id', user.id);

      if (segmentId) {
        query = query.eq('segment_id', segmentId);
      } else {
        query = query.is('segment_id', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data.map((r) => r.type as ReactionType);
    } catch (error) {
      console.error('Error in getUserReactions:', error);
      return [];
    }
  },

  // Get reaction counts for a thread or segment
  async getReactionCounts(threadId: string, segmentId?: string) {
    try {
      let query = supabase
        .from('reactions')
        .select('type')
        .eq('thread_id', threadId);

      if (segmentId) {
        query = query.eq('segment_id', segmentId);
      } else {
        query = query.is('segment_id', null);
      }

      const { data, error } = await query;
      if (error) throw error;

      const counts = {
        '🤯': 0,
        '💡': 0,
        '😌': 0,
        '🔥': 0,
        '🫶': 0,
      } as Record<ReactionType, number>;

      data.forEach((reaction) => {
        const type = reaction.type as ReactionType;
        if (type in counts) {
          counts[type]++;
        }
      });

      return counts;
    } catch (error) {
      console.error('Error in getReactionCounts:', error);
      return {
        '🤯': 0,
        '💡': 0,
        '😌': 0,
        '🔥': 0,
        '🫶': 0,
      };
    }
  },

  // Get users who reacted to a thread
  async getReactionUsers(threadId: string) {
    const { data, error } = await supabase
      .from('reactions')
      .select(`
        user_id,
        type,
        created_at,
        profiles:user_id(name, avatar_url)
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: false })
      
    if (error) throw error
    
    return data.map(reaction => ({
      userId: reaction.user_id,
      type: reaction.type as ReactionType,
      userName: reaction.profiles?.name || 'Unknown Creator',
      userAvatar: reaction.profiles?.avatar_url || null,
      createdAt: reaction.created_at
    }))
  },

  // Subscribe to reaction changes for a thread or segment
  subscribeToReactions(
    threadId: string,
    segmentId: string | undefined,
    callback: (reactions: ReactionCount[]) => void
  ) {
    return supabase
      .channel(`reactions:${threadId}${segmentId ? `:${segmentId}` : ''}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions',
          filter: segmentId
            ? `thread_id=eq.${threadId},segment_id=eq.${segmentId}`
            : `thread_id=eq.${threadId},segment_id=is.null`,
        },
        async () => {
          const counts = await this.getReactionCounts(threadId, segmentId);
          const reactions: ReactionCount[] = Object.entries(counts).map(([type, count]) => ({
            type: type as ReactionType,
            count
          }));
          callback(reactions);
        }
      )
      .subscribe();
  },
}

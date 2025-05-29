import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Search, Loader2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ThreadCard from '@/components/discovery/ThreadCard';
import { threadService } from '@/lib/services/thread.service';
import { analyticsService } from '@/lib/services/analytics.service';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { cleanHtmlForDisplay } from '@/lib/utils/html-utils';

const ExplorePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [trendingThreads, setTrendingThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [profileMap, setProfileMap] = useState<Record<string, { name: string; avatarUrl: string }>>({});
  const initialLoadRef = React.useRef(true);

  // Load threads on initial render
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      loadThreads();
      loadTrendingThreads();
    }
  }, []);

  // Handle sort changes
  useEffect(() => {
    if (!initialLoadRef.current) {
      loadThreads();
    }
  }, [sortBy]);

  // Fetch profiles for all user_ids in results whenever results change
  useEffect(() => {
    const fetchProfiles = async () => {
      const userIds = Array.from(new Set(results.map(t => t.user_id)));
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', userIds);
        const map: Record<string, { name: string; avatarUrl: string }> = {};
        profiles?.forEach((p: any) => {
          map[p.id] = { name: p.name || 'Anonymous', avatarUrl: p.avatar_url || '/placeholder-avatar.jpg' };
        });
        setProfileMap(map);
      } else {
        setProfileMap({});
      }
    };
    if (results.length > 0) fetchProfiles();
  }, [results]);

  const loadThreads = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the sort field based on the current sortBy value
      const sortField = getSortField(sortBy);
      
      // For bookmarks, we need special handling since it's not a direct DB field
      const useClientSideSort = sortBy === 'bookmarks';
      
      const { threads } = await threadService.getThreads({
        sortBy: useClientSideSort ? 'created_at' : sortField, // Default sort if using client-side
        sortOrder: 'desc',
        onlyPublished: true,
        limit: 50 // Increase limit for better sorting results
      });
      
      // Filter out private threads
      const publicThreads = threads.filter(thread => thread.is_private === false);
      
      // If sorting by bookmarks, we need to handle it client-side
      if (useClientSideSort) {
        publicThreads.sort((a, b) => {
          const bookmarksA = a.bookmarks || 0;
          const bookmarksB = b.bookmarks || 0;
          return bookmarksB - bookmarksA;
        });
      }
      
      setResults(publicThreads);
      
      // Extract all tags for filtering
      const allTags = publicThreads.flatMap(thread => thread.tags);
      const uniqueTags = Array.from(new Set(allTags));
      setAvailableTags(uniqueTags);
    } catch (error) {
      console.error('Error loading threads:', error);
      setError('Failed to load threads. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingThreads = async () => {
    try {
      setTrendingLoading(true);
      const trending = await analyticsService.getTrendingThreads(3);
      
      // Get full thread data for each trending thread
      const trendingDetails = await Promise.all(
        trending.map(async (thread) => {
          try {
            return await threadService.getThreadById(thread.id);
          } catch (error) {
            console.error(`Error fetching trending thread ${thread.id}:`, error);
            return null;
          }
        })
      );
      
      // Filter out private threads
      const publicTrendingThreads = trendingDetails.filter(thread => thread && thread.is_private === false);
      setTrendingThreads(publicTrendingThreads);
    } catch (error) {
      console.error('Error loading trending threads:', error);
    } finally {
      setTrendingLoading(false);
    }
  };

  const getSortField = (sortOption: string) => {
    switch (sortOption) {
      case 'newest': return 'created_at';
      case 'bookmarks': return 'bookmarks';
      case 'forks': return 'fork_count';
      default: return 'created_at';
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const { threads } = await threadService.getThreads({
        sortBy: getSortField(sortBy),
        sortOrder: 'desc',
        onlyPublished: true,
        limit: 30
      });
      
      // Client-side filtering since we don't have a dedicated search endpoint
      const filteredResults = searchQuery.trim() === '' 
        ? threads 
        : threads.filter(thread => 
            thread.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            thread.segments.some((segment: any) => 
              segment.content.toLowerCase().includes(searchQuery.toLowerCase())
            ) ||
            thread.tags.some((tag: string) => 
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            )
          );
      
      setResults(filteredResults);
    } catch (error) {
      console.error('Error searching threads:', error);
      setError('Search failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    // The useEffect will handle reloading threads
  };

  // Filter results based on active tab
  const getFilteredResults = () => {
    if (activeTab === 'all') return results;
    return results.filter(thread => 
      thread.tags.some((tag: string) => tag.toLowerCase() === activeTab.toLowerCase())
    );
  };

  const filteredResults = getFilteredResults();

  const formatThreadForCard = (thread: any) => {
    // Only count new reaction types
    const reactionEmojis = ['🤯', '💡', '😌', '🔥', '🫶'];
    const reactionTotal = reactionEmojis.reduce((sum, emoji) => sum + (Number(thread.reaction_counts?.[emoji]) || 0), 0);
    
    // Handle both real threads and sample threads
    const authorProfile = profileMap[thread.user_id] || 
      thread.author || 
      { name: 'Anonymous', avatarUrl: '/placeholder-avatar.jpg' };
    
    // Safe access to segments
    const segments = thread.segments || [];
    const firstSegmentContent = segments[0]?.content || '';
    
    return {
      id: thread.id,
      title: thread.title,
      snippet: thread.snippet || (firstSegmentContent.substring(0, 120) + (firstSegmentContent.length > 120 ? '...' : '')),
      coverImage: thread.cover_image,
      author: {
        id: thread.user_id,
        name: authorProfile.name || 'Anonymous',
        avatarUrl: authorProfile.avatarUrl || '/placeholder-avatar.jpg',
      },
      publishedAt: new Date(thread.created_at),
      readingTime: segments.length || 1,
      bookmarks: thread.bookmarks || 0,
      reactions: reactionTotal as number,
      tags: thread.tags || [],
    };
  };

  // Add a function to process the content
  const processContent = (content: string) => {
    if (!content) return '';
    
    // First directly handle the literal "<p>" and "</p>" strings that might appear
    const cleanedContent = content
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '')
      .replace(/&lt;p&gt;/g, '')
      .replace(/&lt;\/p&gt;/g, '');
    
    // Then use the utility functions for any other cases
    return cleanHtmlForDisplay(cleanedContent).substring(0, 160);
  };

  return (
    <Layout fullWidth>
      <div className="max-w-6xl mx-auto w-full px-2">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-playfair font-semibold">Explore Threads</h1>
        </div>
        
        {/* Combined search and title row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <h2 className="text-xl font-playfair font-semibold whitespace-nowrap">All Threads</h2>
            
            <form onSubmit={handleSearch} className="w-full md:w-auto flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="text"
                  placeholder="Search for topics, keywords, or authors..." 
                  className="pl-10 pr-24 bg-card"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit" 
                  className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Explore'}
                </Button>
              </div>
            </form>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Category:</span>
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {availableTags.map(tag => (
                    <SelectItem key={tag} value={tag.toLowerCase()}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="bookmarks">Most Bookmarked</SelectItem>
                  <SelectItem value="forks">Most Remixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Trending Threads */}
        {trendingThreads.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-threadspire-gold" />
              <h2 className="text-xl font-playfair font-semibold text-left">Trending Now</h2>
            </div>
            
            {trendingLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {trendingThreads.map(thread => (
                  <Card key={thread.id} className="p-4 hover:shadow-md transition-shadow duration-200 bg-card border-border w-full">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={profileMap[thread.user_id]?.avatarUrl || '/placeholder-avatar.jpg'} 
                          alt={profileMap[thread.user_id]?.name || 'Author'} 
                        />
                        <AvatarFallback>
                          {profileMap[thread.user_id]?.name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link to={`/profile/${thread.user_id}`} className="font-semibold hover:underline">
                          {profileMap[thread.user_id]?.name || 'Anonymous'}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {new Date(thread.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Link to={`/thread/${thread.id}`} className="block mb-3">
                          <h3 className="text-xl font-playfair font-semibold mb-2 hover:text-primary transition-colors">{thread.title}</h3>
                          
                          <p className="text-muted-foreground line-clamp-2">
                            {thread.snippet || (thread.segments?.[0]?.content ? 
                              cleanHtmlForDisplay(thread.segments[0].content).substring(0, 160)
                              : '')}
                          </p>
                        </Link>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {thread.tags?.map((tag: string) => (
                            <span key={tag} className="px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {thread.cover_image && (
                        <div className="hidden sm:block rounded-md overflow-hidden w-48 h-32 flex-shrink-0">
                          <img 
                            src={thread.cover_image} 
                            alt={thread.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span className="text-amber-500">❤️</span>
                          <span className="text-xs text-muted-foreground">
                            {String(Object.values(thread.reaction_counts || {}).reduce((sum: number, count: any) => sum + (Number(count) || 0), 0))}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`${sortBy === 'bookmarks' ? 'text-primary' : ''}`}>🔖</span>
                          <span className={`text-xs ${sortBy === 'bookmarks' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                            {thread.bookmarks || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🔄</span>
                          <span className="text-xs text-muted-foreground">{thread.fork_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>📑</span>
                          <span className="text-xs text-muted-foreground">{thread.segments?.length || 0} segments</span>
                        </div>
                      </div>
                      <Link to={`/thread/${thread.id}`} className="text-sm text-primary hover:underline">
                        Read more
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Content area */}
        <div className="mb-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">Error</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredResults.map(thread => (
                <Card key={thread.id} className="p-4 hover:shadow-md transition-shadow duration-200 bg-card border-border w-full">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={profileMap[thread.user_id]?.avatarUrl || '/placeholder-avatar.jpg'} 
                        alt={profileMap[thread.user_id]?.name || 'Author'} 
                      />
                      <AvatarFallback>
                        {profileMap[thread.user_id]?.name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link to={`/profile/${thread.user_id}`} className="font-semibold hover:underline">
                        {profileMap[thread.user_id]?.name || 'Anonymous'}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {new Date(thread.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Link to={`/thread/${thread.id}`} className="block mb-3">
                        <h3 className="text-xl font-playfair font-semibold mb-2 hover:text-primary transition-colors">{thread.title}</h3>
                        
                        <p className="text-muted-foreground line-clamp-2">
                          {thread.snippet || (thread.segments?.[0]?.content ? 
                            cleanHtmlForDisplay(thread.segments[0].content).substring(0, 160)
                            : '')}
                        </p>
                      </Link>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {thread.tags?.map((tag: string) => (
                          <span key={tag} className="px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {thread.cover_image && (
                      <div className="hidden sm:block rounded-md overflow-hidden w-48 h-32 flex-shrink-0">
                        <img 
                          src={thread.cover_image} 
                          alt={thread.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-500">❤️</span>
                        <span className="text-xs text-muted-foreground">
                          {String(Object.values(thread.reaction_counts || {}).reduce((sum: number, count: any) => sum + (Number(count) || 0), 0))}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`${sortBy === 'bookmarks' ? 'text-primary' : ''}`}>🔖</span>
                        <span className={`text-xs ${sortBy === 'bookmarks' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                          {thread.bookmarks || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🔄</span>
                        <span className="text-xs text-muted-foreground">{thread.fork_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📑</span>
                        <span className="text-xs text-muted-foreground">{thread.segments?.length || 0} segments</span>
                      </div>
                    </div>
                    <Link to={`/thread/${thread.id}`} className="text-sm text-primary hover:underline">
                      Read more
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or exploring different topics
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ExplorePage;

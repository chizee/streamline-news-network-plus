// Supabase Edge Function for scheduled news fetching
// This function runs every 2 hours via Supabase Cron
// 
// NOTE: TypeScript errors in this file are expected in the IDE.
// This code runs in Deno runtime (not Node.js) and will work correctly when deployed to Supabase.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// import { createClient } from 'jsr:@supabase/supabase-js@2'

// const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  try {
    // Verify this is a cron job or authorized request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.includes(SUPABASE_SERVICE_ROLE_KEY)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Call the news fetch API endpoint
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3000'
    const response = await fetch(`${appUrl}/api/news/fetch?max=50&hours=2`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.statusText}`)
    }

    const result = await response.json()

    // Log the result
    console.log('News fetch completed:', {
      source: result.source,
      stored: result.stored,
      relevant: result.relevant,
      errors: result.errors,
    })

    return new Response(JSON.stringify({
      success: true,
      message: 'News fetched successfully',
      result,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in fetch-news function:', error)
    
    return new Response(JSON.stringify({
      error: 'Failed to fetch news',
      message: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

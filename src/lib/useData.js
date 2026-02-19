import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

// Generic data fetching hook
export function useSupabase(table, options = {}) {
  const { select = '*', order, filter, single = false } = options
  const [data, setData] = useState(single ? null : [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    let query = supabase.from(table).select(select)
    if (filter) {
      for (const [key, value] of Object.entries(filter)) {
        query = query.eq(key, value)
      }
    }
    if (order) query = query.order(order.column, { ascending: order.ascending ?? false })
    if (single) query = query.single()

    const { data: result, error: err } = await query
    if (err) setError(err)
    else setData(result)
    setLoading(false)
  }, [table, select, JSON.stringify(filter), JSON.stringify(order), single])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}

// Players with badges
export function usePlayers() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('players')
      .select('*, player_badges(*, badge:badges(*))')
      .order('points', { ascending: false })
    setPlayers(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])
  return { players, loading, refetch: fetch }
}

// Challenges
export function useChallenges() {
  return useSupabase('challenges', { order: { column: 'deadline', ascending: true } })
}

// Badges
export function useBadges() {
  return useSupabase('badges', { order: { column: 'created_at', ascending: true } })
}

// Annual goals
export function useAnnualGoals(year) {
  return useSupabase('annual_goals', { filter: { year }, single: true })
}

// Monthly actuals
export function useMonthlyActuals(year) {
  return useSupabase('monthly_actuals', {
    filter: { year },
    order: { column: 'month', ascending: true },
  })
}

// Activity log
export function useActivityLog(limit = 10) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data: result } = await supabase
      .from('activity_log')
      .select('*, player:players(name, initials)')
      .order('created_at', { ascending: false })
      .limit(limit)
    setData(result || [])
    setLoading(false)
  }, [limit])

  useEffect(() => { fetch() }, [fetch])
  return { data, loading, refetch: fetch }
}

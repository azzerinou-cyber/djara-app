'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'


  // Formatage prix
  const formatPrix = (s: ServiceResult) => {
    if (!s.price_min && !s.price_max) return null;
    if (s.price_min && s.price_max && s.price_min !== s.price_max)
      return `${s.price_min.toLocaleString()} – ${s.price_max.toLocaleString()} DA`;
    return `${(s.price_min ?? s.price_max ?? 0).toLocaleString()} DA`;
  };

  return (
    <main style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#59364A', marginBottom: '24px' }}>Rechercher un service</h1>


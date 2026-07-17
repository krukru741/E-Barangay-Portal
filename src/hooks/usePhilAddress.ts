// @ts-nocheck
import { useMemo, useState } from 'react'
import phil from 'phil-reg-prov-mun-brgy'

/**
 * Custom hook for Philippine cascading address dropdowns.
 * Provides province → city/municipality → barangay selection.
 */
export function usePhilAddress(
  initialProvCode?: string,
  initialMunCode?: string
) {
  const [selectedProvCode, setSelectedProvCode] = useState<string>(initialProvCode || '')
  const [selectedMunCode, setSelectedMunCode] = useState<string>(initialMunCode || '')

  // All provinces — sorted A–Z
  const provinces = useMemo(() => {
    const sorted: { name: string; prov_code: string; reg_code: string }[] = [...phil.provinces]
    sorted.sort((a, b) => a.name.localeCompare(b.name))
    return sorted
  }, [])

  // Cities/municipalities filtered by selected province
  const cities = useMemo(() => {
    if (!selectedProvCode) return []
    const list = phil.getCityMunByProvince(selectedProvCode) || []
    return [...list].sort((a, b) => a.name.localeCompare(b.name))
  }, [selectedProvCode])

  // Barangays filtered by selected city/municipality
  const barangays = useMemo(() => {
    if (!selectedMunCode) return []
    const list = phil.getBarangayByMun(selectedMunCode) || []
    return [...list].sort((a, b) => a.name.localeCompare(b.name))
  }, [selectedMunCode])

  /** Helper: get province name from code */
  const getProvinceName = (code: string) => {
    const p = provinces.find(x => x.prov_code === code)
    return p ? toTitleCase(p.name) : ''
  }

  /** Helper: get city name from code */
  const getCityName = (code: string) => {
    const c = cities.find(x => x.mun_code === code)
    return c ? toTitleCase(c.name) : ''
  }

  /** Helper: get prov_code from province name (for loading existing data) */
  const getProvCodeByName = (name: string) => {
    const n = name.trim().toUpperCase()
    const p = provinces.find(x => x.name.toUpperCase() === n)
    return p?.prov_code || ''
  }

  /** Helper: get mun_code from city name within a province */
  const getMunCodeByName = (name: string, provCode: string) => {
    const n = name.trim().toUpperCase()
    const list = phil.getCityMunByProvince(provCode) || []
    const c = list.find((x: any) => x.name.toUpperCase() === n)
    return c?.mun_code || ''
  }

  const handleProvinceChange = (newProvCode: string) => {
    setSelectedProvCode(newProvCode)
    setSelectedMunCode('')
  }

  const handleCityChange = (newMunCode: string) => {
    setSelectedMunCode(newMunCode)
  }

  return {
    provinces,
    cities,
    barangays,
    selectedProvCode,
    selectedMunCode,
    setSelectedProvCode,
    setSelectedMunCode,
    handleProvinceChange,
    handleCityChange,
    getProvinceName,
    getCityName,
    getProvCodeByName,
    getMunCodeByName,
  }
}

/**
 * Convert ALL-CAPS PSGC names to Title Case.
 * e.g. "CITY OF TALISAY" → "City Of Talisay"
 */
export function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

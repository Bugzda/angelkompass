import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePwaStatus } from '../../ui/hooks/usePwaStatus'
import { useTheme } from '../../ui/hooks/useTheme'

function ThemeHarness(){const{preference,setPreference}=useTheme();return <div><output>{preference}</output><button onClick={()=>setPreference('system')}>System</button><button onClick={()=>setPreference('dark')}>Dunkel</button></div>}
function StatusHarness(){const{online,offlineReady}=usePwaStatus();return <output>{online?'online':'offline'} · {offlineReady?'ready':'pending'}</output>}

beforeEach(()=>{
  localStorage.clear()
  vi.stubGlobal('matchMedia',vi.fn().mockReturnValue({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()}))
})
afterEach(()=>{cleanup();delete document.documentElement.dataset.theme;vi.restoreAllMocks()})

describe('UI-Zustände',()=>{
  it('speichert eine Theme-Wahl und kann zum Systemmodus zurückkehren',()=>{
    render(<ThemeHarness/>)
    fireEvent.click(screen.getByRole('button',{name:'Dunkel'}))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('angelkompass.theme.v1')).toBe('dark')
    fireEvent.click(screen.getByRole('button',{name:'System'}))
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem('angelkompass.theme.v1')).toBe('system')
  })

  it('meldet Netzwerkänderungen reaktiv',()=>{
    render(<StatusHarness/>)
    fireEvent(window,new Event('offline'))
    expect(screen.getByText(/offline/)).toBeInTheDocument()
    fireEvent(window,new Event('online'))
    expect(screen.getByText(/online/)).toBeInTheDocument()
  })
})

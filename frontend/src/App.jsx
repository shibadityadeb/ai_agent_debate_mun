import React from 'react'
import Dashboard from './Dashboard'
import Landing from './Landing'

function App() {
  const [view, setView] = React.useState('landing')

  return view === 'landing' ? (
    <Landing onStart={() => setView('dashboard')} />
  ) : (
    <Dashboard onBack={() => setView('landing')} />
  )
}

export default App

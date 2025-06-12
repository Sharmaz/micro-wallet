import { useState, useEffect } from 'react'
import config from './config'

function App() {
  const [balance, setBalance] = useState(0)
  async function fetchData() {
    try {
      const response = await fetch(`${config.baseUrl}/tool/get-balance`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setBalance(JSON.parse(data.content[0].text).balanceSat);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }
  
  useEffect(() => {
    fetchData();
  }, [])
  
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-neutral-800">
      <h1 className="text-5xl text-green-500 text-center">Micro Wallet</h1>
      <div className="p-8 text-gray-50">
        {balance}
        <span className="text-green-600"> sat</span> 
      </div>
    </div>
  )
}

export default App

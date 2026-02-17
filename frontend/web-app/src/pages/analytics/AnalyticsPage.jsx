import { useEffect, useState } from 'react';
import { useSession } from '../../contexts/SessionContext';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

function getQuarterDates() {
  const now = new Date();
  const quarter = Math.floor((now.getMonth() + 3) / 3);
  const year = now.getFullYear();
  const startMonth = (quarter - 1) * 3;
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  };
}

export default function AnalyticsPage() {
  const { session } = useSession();
  const [cityData, setCityData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const { start, end } = getQuarterDates();
    fetch(`${import.meta.env.VITE_API_BASE_URL}/property-sales?start_date=${start}&end_date=${end}`, {
      headers: session.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch property sales');
        return res.json();
      })
      .then(data => {
        // Aggregate by city
        const cityCounts = {};
        const userCounts = {};
        data.forEach(item => {
          if (item.city) {
            cityCounts[item.city] = (cityCounts[item.city] || 0) + 1;
          }
          if (item.username) {
            userCounts[item.username] = (userCounts[item.username] || 0) + 1;
          }
        });
        setCityData(Object.entries(cityCounts).sort((a,b)=>b[1]-a[1]).slice(0,10));
        setUserData(Object.entries(userCounts).sort((a,b)=>b[1]-a[1]).slice(0,10));
        setError(null);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [session.access_token]);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(120deg, #232526 0%, #414345 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      margin: 0
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '2.5rem auto 0 auto',
        background: 'rgba(24,24,27,0.98)',
        borderRadius: 18,
        boxShadow: '0 2px 16px rgba(0,0,0,0.13)',
        padding: '2.5rem 2.5rem 2rem 2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.2rem',
        alignItems: 'stretch',
        width: '100%'
      }}>
        <h2 style={{margin:0, fontSize:'1.5rem', fontWeight:700, letterSpacing:'-1px', color:'#fbbf24'}}>Analytics - Last Quarter</h2>
        {error && <div style={{color:'#f87171', background:'#2d2323', borderRadius:8, padding:'0.5rem 1rem', fontWeight:500, marginBottom:0}}>{error}</div>}
        {loading && <div style={{color:'#fbbf24', fontWeight:500, marginBottom:0}}>Loading charts...</div>}
        {!loading && !error && (
          <>
            <div style={{marginBottom:'2rem', width:'100%', maxWidth:'1200px', marginLeft:'auto', marginRight:'auto'}}>
              <h3 style={{margin:'0 0 1rem 0', color:'#fbbf24', fontWeight:600, fontSize:'1.15rem'}}>Top Cities by Properties Sold</h3>
              <div style={{background:'#18181b', borderRadius:'16px', padding:'1.5rem', boxShadow:'0 2px 16px rgba(0,0,0,0.12)'}}>
                <Bar
                  data={{
                    labels: cityData.map(([city]) => city),
                    datasets: [{
                      label: 'Properties Sold',
                      data: cityData.map((entry) => entry[1]),
                      backgroundColor: '#00d4d7',
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' } } }
                  }}
                  height={400}
                />
              </div>
            </div>
            <div style={{width:'100%', maxWidth:'1200px', marginLeft:'auto', marginRight:'auto'}}>
              <h3 style={{margin:'0 0 1rem 0', color:'#fbbf24', fontWeight:600, fontSize:'1.15rem'}}>Properties Sold by User</h3>
              <div style={{background:'#18181b', borderRadius:'16px', padding:'1.5rem', boxShadow:'0 2px 16px rgba(0,0,0,0.12)'}}>
                <Bar
                  data={{
                    labels: userData.map(([user]) => user),
                    datasets: [{
                      label: 'Properties Sold',
                      data: userData.map((entry) => entry[1]),
                      backgroundColor: '#fbbf24',
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' } } }
                  }}
                  height={400}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
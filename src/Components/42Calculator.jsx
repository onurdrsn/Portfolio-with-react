import { useState } from 'react';
import axios from 'axios';
import { CopyIcon, CheckIcon } from './Icons';
 

const EventCalculator = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [animation, setAnimation] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

  const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
  const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;

  const fetchData = async (e) => {
    e.preventDefault();
    setCopySuccess('');
    
    if (!username.trim()) {
      setError('Lütfen bir intra kullanıcı adı giriniz.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {

      const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
      const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;

      console.log(CLIENT_ID)
      console.log(CLIENT_SECRET)
      // Token alma
      const tokenData = await fetch('/.netlify/functions/getevents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET
        }).toString()
      });
      
      const data = await tokenData.json();
      console.log('API response:', data);

      const accessToken = data.access_token;

      // Kullanıcı bilgilerini alma
      const userResponse = await axios.get(`https://api.intra.42.fr/v2/users/${username}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const userId = userResponse.data.id;

      // Kullanıcının etkinliklerini alma
      const userEventsResponse = await axios.get(`https://api.intra.42.fr/v2/users/${userId}/events`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      // Etkinlik sayısını hesapla
      const events = userEventsResponse.data;
      const validEvents = events.filter(event => event.kind !== 'extern' && event.kind !== 'association');
      const eventCount = validEvents.length;

      // Etkinlikleri türlerine göre grupla ve say
      const eventCounts = events.reduce((acc, event) => {
        acc[event.kind] = (acc[event.kind] || 0) + 1;
        return acc;
      }, {});

      setResult({
        totalEvents: eventCount,
        eventCounts
      });

      setAnimation(true);

    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError(`Kullanıcı "${username}" bulunamadı.`);
      } else {
        setError(`İşlem sırasında bir hata oluştu: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;

    const lines = [];
    lines.push(`Toplam Geçerli Etkinlik: ${result.totalEvents}`);
    Object.entries(result.eventCounts).forEach(([kind, count]) => {
      lines.push(`${kind}: ${count}`);
    });
    const textToCopy = lines.join('\n');

    navigator.clipboard.writeText(textToCopy)
      .then(() => setCopySuccess('Kopyalandı!'))
      .catch(() => setCopySuccess('Kopyalama sırasında bir hata oluştu.'));
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-5 bg-gray-900 text-gray-200">
      <div className="w-full max-w-md bg-gray-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-center text-2xl font-bold mb-6 text-blue-400">42 Etkinlik Hesaplayıcı</h2>
        
        <form onSubmit={fetchData}>
          <div className="flex mb-5">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Intra kullanıcı adını giriniz"
              disabled={loading}
              required
              className="flex-1 p-3 bg-gray-700 rounded-l-lg border-0 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit" 
              disabled={loading}
              className={`py-3 px-5 rounded-r-lg font-medium ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
            >
              {loading ? 'Hesaplanıyor...' : 'Hesapla'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border-l-4 border-red-500 rounded">
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center mt-8">
            <div className="w-10 h-10 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
            <p className="mt-3">Veriler alınıyor...</p>
          </div>
        )}

        {result && (
          <div 
            className={`mt-6 p-5 bg-gray-700 rounded-lg transform transition-all duration-500 ${animation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-blue-400">Sonuçlar</h3>
              <button onClick={copyToClipboard} title="Kopyala">
                    {!copySuccess
                        ? <CopyIcon className="text-gray-200" />
                        : <CheckIcon className="text-green-400" />
                    }
                </button>
            </div>
            {copySuccess && (
              <p className="text-green-400 mb-2 text-sm">{copySuccess}</p>
            )}
            <div className="flex justify-between py-2 border-b border-gray-600">
              <span>Toplam Geçerli Etkinlik:</span>
              <span className="font-bold text-blue-400">{result.totalEvents}</span>
            </div>
            
            <h4 className="text-lg font-medium mt-4 mb-2">Etkinlik Türleri:</h4>
            <div className="flex flex-col gap-2">
              {Object.entries(result.eventCounts).map(([kind, count]) => (
                <div className="flex justify-between p-2 bg-gray-800 rounded" key={kind}>
                  <span>{kind}:</span>
                  <span className="font-bold text-blue-400">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCalculator;

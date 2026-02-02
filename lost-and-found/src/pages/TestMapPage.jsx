import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import '../utils/leafletSetup';

function TestMapPage() {
  const position = [28.5383, -81.3792];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Map Test</h1>
      <div style={{ height: '500px', width: '100%', border: '2px solid red' }}>
        <MapContainer 
          center={position} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>Test Marker</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}

export default TestMapPage;
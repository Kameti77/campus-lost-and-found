import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import '../utils/leafletSetup';

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

function LocationPicker({ location, setLocation }) {
  const defaultCenter = [28.5383, -81.3792]; // Full Sail area
  const [key, setKey] = useState(0);

  // Force re-render when component mounts to ensure map renders
  useEffect(() => {
    setKey(prev => prev + 1);
  }, []);

  return (
    <div className="w-full">
      <p className="text-sm text-gray-600 mb-2">
        Click on the map to set the location where the item was lost/found
      </p>
      
      {/* Map Container with explicit dimensions */}
      <div 
        className="relative w-full border-2 border-gray-300 rounded-lg overflow-hidden"
        style={{ height: '400px' }}
      >
        <MapContainer 
          key={key}
          center={defaultCenter} 
          zoom={15} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={location} setPosition={setLocation} />
        </MapContainer>
      </div>
      
      {location && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="font-medium text-blue-900 text-sm">✓ Location Selected</p>
          <p className="text-blue-700 text-xs mt-1">
            Latitude: {location.lat.toFixed(6)}, Longitude: {location.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}

export default LocationPicker;
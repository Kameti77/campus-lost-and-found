import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect } from 'react';
import '../utils/leafletSetup';

function MapView({ items, center = [28.5383, -81.3792], zoom = 13 }) {
  // Default center is Orlando, FL (Full Sail area)

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
      >
        {/* Map Tiles from OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Item Markers */}
        {items.map(item => {
          // Only show items that have location data
          if (!item.location || !item.location.lat || !item.location.lng) {
            return null;
          }

          return (
            <Marker 
              key={item.id} 
              position={[item.location.lat, item.location.lng]}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  {/* Image */}
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  
                  {/* Status Badge */}
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${
                    item.status === 'Lost' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.status}
                  </span>

                  {/* Item Info */}
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Category: {item.category}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapView;
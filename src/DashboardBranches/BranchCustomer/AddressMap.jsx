// AddressMap.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; // For managing the default marker icon

// This is important to fix the issue of the default marker icon not appearing in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl; // Corrected: _getIconUrl is now one word

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Default Alexandria location
const defaultCenter = {
  lat: 31.2001, // Alexandria Latitude
  lng: 29.9187, // Alexandria Longitude
};

function AddressMap({ initialLocation, onLocationSelect }) {
  const [position, setPosition] = useState(initialLocation || defaultCenter);
  
  // Update position when initialLocation prop changes
  useEffect(() => {
    if (initialLocation && (initialLocation.lat !== position.lat || initialLocation.lng !== position.lng)) {
      setPosition(initialLocation);
    }
  }, [initialLocation]);

  // Sub-component to handle map events (like click)
  function MapEvents() {
    useMapEvents({
      click(e) {
        const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
        setPosition(newPos);
        onLocationSelect(newPos); // Send the new location to the parent component
      },
      // You can add more events here, like dragend for the marker if it's draggable
    });
    return null;
  }

  return (
    // MapContainer requires specific width and height
    <MapContainer 
      center={position} 
      zoom={initialLocation ? 15 : 10} // Higher zoom if there's an initial location
      scrollWheelZoom={true} 
      style={{ height: '400px', width: '100%' }} // Must specify size
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Display marker at the specified position */}
      <Marker 
        position={position} 
        draggable={true} // Make the marker draggable
        eventHandlers={{
          dragend: (e) => {
            const newPos = { lat: e.target.getLatLng().lat, lng: e.target.getLatLng().lng };
            setPosition(newPos);
            onLocationSelect(newPos);
          },
        }}
      />
      <MapEvents /> {/* Map event handling component */}
    </MapContainer>
  );
}

export default React.memo(AddressMap);
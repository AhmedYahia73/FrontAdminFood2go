import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to recenter map when coordinates change
// Helper component to recenter map when coordinates change
const RecenterMap = ({ lat, lng, radius }) => {
    const map = useMap();
    useEffect(() => {
        if (radius && radius > 0) {
            // circle.getBounds() requires the circle to be added to the map to access CRS
            const circle = L.circle([lat, lng], { radius: radius });
            circle.addTo(map);
            const bounds = circle.getBounds();
            circle.remove();

            map.fitBounds(bounds, { padding: [50, 50] });
        } else {
            map.setView([lat, lng], 15);
        }
    }, [lat, lng, radius, map]);
    return null;
};

// Helper component to handle map clicks
const MapClickHandler = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            if (onLocationSelect) {
                onLocationSelect(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
};

const MapPreview = ({ lat, lng, radius, onLocationSelect }) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    // Convert KM to meters for Leaflet
    const coverageRadius = parseFloat(radius) * 1000;

    // Default to Cairo if no valid coordinates (or hide map)
    // For better UX, we only show map if we have valid-ish numbers, 
    // otherwise we can default to 0,0 or show nothing.
    // Here we'll default to a neutral view or Cairo specific if preferred.
    // Using 0,0 might be confusing. Let's use Cairo as default but only render markers if valid.

    const isValidLocation = !isNaN(latitude) && !isNaN(longitude);
    const center = isValidLocation ? [latitude, longitude] : [30.0444, 31.2357]; // Default to Cairo

    if (!isValidLocation && !lat && !lng) {
        return null;
    }

    return (
        <div className="w-full h-64 mt-4 rounded-lg overflow-hidden border border-gray-300 relative z-0">
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false} // Prevent scrolling page from zooming map unexpectedly
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {isValidLocation && (
                    <>
                        {onLocationSelect && <MapClickHandler onLocationSelect={onLocationSelect} />}
                        <RecenterMap lat={latitude} lng={longitude} radius={coverageRadius} />
                        <Marker position={[latitude, longitude]} />
                        {!isNaN(coverageRadius) && coverageRadius > 0 && (
                            <Circle
                                center={[latitude, longitude]}
                                radius={coverageRadius}
                                pathOptions={{ color: '#F15B29', fillColor: '#F15B29', fillOpacity: 0.2 }} // Using Main Color kind of
                            />
                        )}
                    </>
                )}
            </MapContainer>
        </div>
    );
};

export default MapPreview;

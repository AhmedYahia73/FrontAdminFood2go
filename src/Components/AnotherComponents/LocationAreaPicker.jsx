import React, { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";

// Fix for leaflet icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationAreaPicker = ({ onAreaSelect, initialArea = [] }) => {
  const [areaPoints, setAreaPoints] = useState(initialArea);
  const featureGroupRef = useRef();
  const hasInitialized = useRef(false);

  // Initialize with initialArea only once
  useEffect(() => {
    if (!hasInitialized.current && initialArea && initialArea.length > 0) {
      setAreaPoints(initialArea);
      hasInitialized.current = true;
      
      setTimeout(() => {
        if (featureGroupRef.current) {
          const latlngs = initialArea.map(point => [point.lat, point.lng]);
          L.polygon(latlngs, {
            color: '#9700ff',
            fillColor: '#9700ff',
            fillOpacity: 0.2,
          }).addTo(featureGroupRef.current);
        }
      }, 100);
    }
  }, [initialArea]);

  const _onCreated = useCallback((e) => {
    const layer = e.layer;
    
    if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
      let latlngs;
      
      if (layer instanceof L.Polygon) {
        latlngs = layer.getLatLngs()[0];
      } else if (layer instanceof L.Rectangle) {
        latlngs = layer.getLatLngs()[0];
      }
      
      const points = latlngs.map((point) => ({
        lat: point.lat,
        lng: point.lng,
      }));
      
      setAreaPoints(points);
      onAreaSelect(points);
      
      featureGroupRef.current.clearLayers();
      featureGroupRef.current.addLayer(layer);
    }
  }, [onAreaSelect]);

  const _onDeleted = useCallback((e) => {
    setAreaPoints([]);
    onAreaSelect([]);
  }, [onAreaSelect]);

  const _onEdited = useCallback((e) => {
    const layers = e.layers;
    layers.eachLayer((layer) => {
      if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
        let latlngs;
        
        if (layer instanceof L.Polygon) {
          latlngs = layer.getLatLngs()[0];
        } else if (layer instanceof L.Rectangle) {
          latlngs = layer.getLatLngs()[0];
        }
        
        const points = latlngs.map((point) => ({
          lat: point.lat,
          lng: point.lng,
        }));
        
        setAreaPoints(points);
        onAreaSelect(points);
      }
    });
  }, [onAreaSelect]);

  const center = areaPoints.length > 0 
    ? [areaPoints[0].lat, areaPoints[0].lng]
    : [31.2001, 29.9187];

  return (
    <div className="location-area-picker" style={{ position: 'relative', zIndex: 0 ,width: '80%'}}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ 
          height: "400px", 
          width: "100%", 
          borderRadius: "10px",
          position: 'relative',
          zIndex: 0
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={_onCreated}
            onEdited={_onEdited}
            onDeleted={_onDeleted}
            draw={{
              polygon: {
                allowIntersection: false,
                drawError: {
                  color: "#e1e100",
                  message: "<strong>Oh snap!</strong> you can't draw that!",
                },
                shapeOptions: {
                  color: "#9700ff",
                  fillColor: "#9700ff",
                  fillOpacity: 0.2,
                },
              },
              rectangle: {
                shapeOptions: {
                  color: "#9700ff",
                  fillColor: "#9700ff",
                  fillOpacity: 0.2,
                },
              },
              polyline: false,
              circle: false,
              marker: false,
              circlemarker: false,
            }}
          />
        </FeatureGroup>
      </MapContainer>
      
      <div className="mt-2 p-2 bg-gray-100 rounded">
        <p className="text-sm text-gray-700">
          <strong>Instructions:</strong> Click the draw polygon icon in the top right, 
          then click on the map to create points. Close the polygon by clicking the first point.
        </p>
        {areaPoints.length > 0 && (
          <p className="text-sm text-green-600 font-medium mt-1">
            ✓ Area selected with {areaPoints.length} points
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationAreaPicker;
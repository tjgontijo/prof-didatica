'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

type MapMarker = {
  position: [number, number];
  name: string;
  pageviews: number;
  conversions: number;
  conversionRate: number;
};

type LocationMapProps = {
  markers: MapMarker[];
};

const LocationMap = ({ markers }: LocationMapProps) => {
  const [mapKey, setMapKey] = useState(Date.now());
  
  // Força a recriação do mapa quando os marcadores mudam
  useEffect(() => {
    setMapKey(Date.now());
  }, [markers]);

  // Corrigir o problema dos ícones do Leaflet
  useEffect(() => {
    // Solução para o problema dos ícones do Leaflet no Next.js
    // @ts-expect-error - Necessário para corrigir o problema dos ícones do Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  if (markers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <p className="text-gray-500">Nenhum dado de localização disponível</p>
      </div>
    );
  }

  return (
    <MapContainer
      key={mapKey}
      center={[-15.7801, -47.9292]} // Centro no Brasil
      zoom={3}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {markers.map((marker, idx) => (
        <Marker key={idx} position={marker.position}>
          <Popup>
            <div>
              <h4 className="font-bold">{marker.name}</h4>
              <p>Visualizações: {marker.pageviews}</p>
              <p>Conversões: {marker.conversions}</p>
              <p>Taxa de Conversão: {marker.conversionRate.toFixed(2)}%</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LocationMap;

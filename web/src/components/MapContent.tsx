'use client';

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { Station } from '@/lib/types';
import { MAP_CENTER, MAP_ZOOM, BRAND_COLORS } from '@/lib/constants';
import { MapPin, Phone, Clock, Fuel, Store } from 'lucide-react';

interface MapContentProps {
  stations: Station[];
}

function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const timeout = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timeout);
  }, [map]);
  return null;
}

export default function MapContent({ stations }: MapContentProps) {
  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      className="w-full h-full"
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapResizeHandler />
      {stations.map(station => (
        <CircleMarker
          key={station.station_id}
          center={[station.latitude, station.longitude]}
          radius={8}
          pathOptions={{
            color: '#ffffff',
            fillColor: BRAND_COLORS[station.brand],
            fillOpacity: 0.9,
            weight: 2,
          }}
        >
          <Popup>
            <div className="min-w-[240px] p-1">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                <span
                  className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: BRAND_COLORS[station.brand] }}
                />
                <span className="font-bold text-base text-gray-900">{station.brand}</span>
              </div>

              {/* Station Name */}
              <h3 className="font-semibold text-sm text-gray-800 mb-1">{station.name}</h3>

              {/* Address */}
              <div className="flex items-start gap-2 text-xs text-gray-600 mb-2">
                <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-gray-400" />
                <span>{station.address}</span>
              </div>

              {/* City */}
              {station.city && (
                <div className="text-xs text-gray-500 mb-3 ml-5">
                  {station.city}
                </div>
              )}

              {/* Fuel Types */}
              {station.fuel_types && (
                <div className="mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
                    <Fuel className="w-3 h-3 text-sgp" />
                    <span>Fuel Types</span>
                  </div>
                  <p className="text-xs text-gray-600 ml-4.5 leading-relaxed">
                    {station.fuel_types}
                  </p>
                </div>
              )}

              {/* Services */}
              {station.services && (
                <div className="mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
                    <Store className="w-3 h-3 text-wissol" />
                    <span>Services</span>
                  </div>
                  <p className="text-xs text-gray-600 ml-4.5 leading-relaxed">
                    {station.services}
                  </p>
                </div>
              )}

              {/* Working Hours & Phone */}
              <div className="flex flex-wrap gap-3 mt-3 pt-2 border-t border-gray-100">
                {station.working_hours && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{station.working_hours}</span>
                  </div>
                )}
                {station.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone className="w-3 h-3" />
                    <span>{station.phone}</span>
                  </div>
                )}
              </div>

              {/* Station Type (if available) */}
              {station.station_type && (
                <div className="mt-2 text-xs text-gray-400">
                  Type: {station.station_type}
                </div>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

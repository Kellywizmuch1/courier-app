"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Coordinates = [number, number];

interface ShipmentMapProps {
  pickup: Coordinates;
  current: Coordinates;
  destination: Coordinates;
}

function createIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 22px;
        height: 22px;
        background: ${color};
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function FitMap({
  pickup,
  current,
  destination,
}: ShipmentMapProps) {
  const map = useMap();

  const points = [
    pickup,
    current,
    destination,
  ];

  map.fitBounds(points, {
    padding: [50, 50],
  });

  return null;
}

export default function ShipmentMap({
  pickup,
  current,
  destination,
}: ShipmentMapProps) {
  const center = current;

  return (
    <div className="w-full h-[500px] rounded-3xl overflow-hidden border border-slate-200 shadow-lg">

      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom={true}
        className="w-full h-full"
      >

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitMap
          pickup={pickup}
          current={current}
          destination={destination}
        />

        {/* ROUTE */}

        <Polyline
          positions={[
            pickup,
            current,
            destination,
          ]}
          pathOptions={{
            color: "#f97316",
            weight: 5,
            opacity: 0.8,
          }}
        />

        {/* PICKUP */}

        <Marker
          position={pickup}
          icon={createIcon("#2563eb")}
        >
          <Popup>
            <div className="font-semibold">
              Pickup Location
            </div>
          </Popup>
        </Marker>

        {/* CURRENT */}

        <Marker
          position={current}
          icon={createIcon("#f97316")}
        >
          <Popup>
            <div className="font-semibold">
              Current Shipment Location
            </div>
          </Popup>
        </Marker>

        {/* DESTINATION */}

        <Marker
          position={destination}
          icon={createIcon("#dc2626")}
        >
          <Popup>
            <div className="font-semibold">
              Delivery Destination
            </div>
          </Popup>
        </Marker>

      </MapContainer>

    </div>
  );
}
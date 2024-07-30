"use client"

import { useMap, useMapEvents } from "react-leaflet";
import { LatLngBounds } from 'leaflet';

interface MapComponentProps {
    onBoundsChange: ( bounds:LatLngBounds ) => void;
}

// Note: To use the useMap hook, this component must be a descendent of MapContainer (which it is).
export default function MapComponent({ onBoundsChange }: MapComponentProps) {
    
    // Add event listeners to the map.
    useMapEvents({
        moveend: () => handleBoundsChange(),
        zoomend: () => handleBoundsChange()
    });
    const map = useMap();
  
    const handleBoundsChange = () => {
        const newBounds = map.getBounds();
        onBoundsChange(newBounds);
    }

    return null;
};
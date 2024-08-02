"use client"


import { useRef } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { LatLngBounds } from 'leaflet';
import toast from "react-hot-toast";


interface MapComponentProps {
    onBoundsChange: ( bounds:LatLngBounds | null) => void;
}


// Note: To use the useMap hook, this component must be a descendent of MapContainer (which it is).
export default function MapComponent({ onBoundsChange }: MapComponentProps) {
 
    const oldZoomLevel = useRef<number | null>(null);
    const newZoomLevel = useRef<number | null>(null);
    const zoomBoundary = useRef<number>(9);
    const toastShown = useRef<boolean>(false);
    
    // Add event listeners to the map.
    useMapEvents({
        moveend: () => handleBoundsChange() // moveend event captures both zoom and pan.
    });
    const map = useMap();
  
    // TODO Continuous mousewheel zooming sometimes causes bug where lines from previous bounds are still shown.
    // Potential fix: Add a debounce to the handleBoundsChange function.
    const handleBoundsChange = () => {
        newZoomLevel.current = map.getZoom();
        
        // On bounds change, if zoom level is greater than boundary, update bounds and reset toastShown.
        // Else if zoom level is lower than boundary, nullify bounds (which will also setLines 
        // to empty [] in the parent component) and show toast (but only the first time).
        // Then reassign current zoom level.
        if (newZoomLevel.current > zoomBoundary.current) {
            const newBounds = map.getBounds();
            onBoundsChange(newBounds);
            toastShown.current = false;
        } else {
            onBoundsChange(null);
            if (!toastShown.current) {
                toast("Zoom in to see more lines.");
                toastShown.current = true;
            }
        }
        oldZoomLevel.current = newZoomLevel.current;
    }
    return null;
};
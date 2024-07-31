"use client"


import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import { LatLngTuple, LatLngBounds, LatLng } from 'leaflet';

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import MapComponent from "./MapComponent";
import { fetchLinesWithinBounds } from "../utils/linesUtils";
import { LineData, Feature } from '../types/lineApiTypes';


interface MapProps {
    centerCoords: number[],
    zoom: number,
}

const defaults = {
    zoom: 13,
} 

const redOptions = { color: 'red' }

export default function Map({ centerCoords, zoom }: MapProps) {

    const center: LatLng = new LatLng(centerCoords[0], centerCoords[1]);

    const [lines, setLines] = useState<Feature[]>([]);

    const [bounds, setBounds] = useState<LatLngBounds | null>(null); // As component mounts, bounds is null.
    const handleBoundsChange = (bounds: LatLngBounds) => {
        setBounds(bounds);
    };

    // First useEffect fetches lines within bounds after mount.
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const fetchData = async () => {
                try {
                    // Upon mount, fetch lines within 10km of center.
                    const lineData: LineData = await fetchLinesWithinBounds(center.toBounds(10000));
                    const features: Feature[] = lineData.features;
                    setLines(features);
                } catch (error) {
                    console.error("components/Map.tsx | useEffect 1 | Error fetching line data:", error);
                }
            };
            fetchData();
        }
    }, []); // TODO make center dynamic

    // Second useEffect fetches lines within bounds after bounds change.
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const fetchData = async () => {
                try {
                    if (bounds) {
                        const lineData: LineData = await fetchLinesWithinBounds(bounds);
                        const features: Feature[] = lineData.features;
                        setLines(features);
                    }
                } catch (error) {
                    console.error("components/Map.tsx | useEffect 2 | Error fetching line data:", error);
                }
            };
            fetchData();
        }
    }, [bounds]);

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {lines && lines.map((line: Feature) => (
                line.geometry.reversedPaths && ( // Check if reversedPaths is defined.
                    <Polyline 
                        key={line.attributes.OBJECTID}
                        pathOptions={redOptions}
                        positions={line.geometry.reversedPaths[0] as LatLngTuple[]} 
                    />
                )
            ))}
            <MapComponent onBoundsChange={handleBoundsChange}/>
        </MapContainer>
    );
}
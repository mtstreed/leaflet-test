"use client";

import { use, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { LatLngExpression, LatLngTuple, LatLngBounds, LatLngBoundsExpression, LatLng } from 'leaflet';

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import MapComponent from "./MapComponent";
import { fetchAllLines, fetchLinesWithinBounds } from "../utils/linesUtils";
import { LineData, Attributes, Feature, Field } from '../types/lineApiTypes';


interface MapProps {
    center: LatLng,
    zoom: number,
}

const defaults = {
    zoom: 13,
} 

const redOptions = { color: 'red' }

export default function Map({ center, zoom }: MapProps) {

    const [lines, setLines] = useState<Feature[]>([]);

    const [bounds, setBounds] = useState<LatLngBounds | null>(null); // As component mounts, bounds is null.
    const handleBoundsChange = (bounds: LatLngBounds) => {
        setBounds(bounds);
    };

    // First useEffect fetches lines within bounds after mount.
    useEffect(() => {
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
    }, [center]); // TODO make center dynamic

    // Second useEffect fetches lines within bounds after bounds change.
    useEffect(() => {
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
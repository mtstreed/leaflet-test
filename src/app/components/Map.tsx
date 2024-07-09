"use client"

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { LatLngExpression, LatLngTuple } from 'leaflet';

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import { fetchAllLines } from "../utils/linesUtils";
import { LineData, Attributes, Feature, Field } from '../types/lineApiTypes';


interface MapProps {
    posix: LatLngExpression | LatLngTuple,
    zoom?: number,
}

const defaults = {
    zoom: 19,
} 

const redOptions = { color: 'red' }

export default function Map(Map: MapProps) {
    const { zoom = defaults.zoom, posix } = Map

    const [lines, setLines] = useState<Feature[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const lineData: LineData = await fetchAllLines();
                const features: Feature[] = lineData.features;
                setLines(features);
            } catch (error) {
                console.error("components/Map.tsx | useEffect | Error fetching line data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <MapContainer
            center={posix}
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
        </MapContainer>
    );
}
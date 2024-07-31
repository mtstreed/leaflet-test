"use client"


// Even with "use client" directive, Map component must use dynamic import to avoid server-side rendering.
import dynamic from "next/dynamic";
const Map = dynamic(() => import("./components/Map"), { ssr: false });


export default function Home() {

	return (
		<main>
            <div className="flex flex-col justify-start h-screen w-screen">
                <div className="bg-gray-100 mx-auto my-5 w-[60%] h-[480px]">
                    {/* Coordinates prop given to Map cmp cannot be LatLng because that is a leaflet type. Leaflet
                        is a browser-only library, and importing LatLng causes server-side rendering errors, even
                        with "use client" directive. Instead, coordinates array is converted to LatLng later.  */}
                    <Map centerCoords={ [40.775350, -73.966245] } zoom={13} /> 
                </div>
            </div>
		</main>
	);
}

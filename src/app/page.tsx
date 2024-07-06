import Map from "./components/Map";
import dynamic from "next/dynamic";
import { useMemo } from "react";

export default function Home() {

	return (
		<main>
            <div className="flex flex-col justify-start h-screen w-screen">
                <div className="bg-gray-100 mx-auto my-5 w-[60%] h-[480px]">
                    <Map posix={[40.775350, -73.966245]} />
                </div>
            </div>
		</main>
	);
}

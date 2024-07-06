import { LineData, Attributes, Feature, Geometry, Field } from '../types/lineApiTypes';

// API returns coordinates in [long, lat] format, but Leaflet expects [lat, long]
function parseGeometry(geometry: Geometry): Geometry {
	const linePaths = geometry.paths;
	// TODO Is there no better way to do this than loop over every single thing?
	const reversedLinePaths = linePaths.map((linePath) => // Each element of this array is a line path. There is tyically only 1.
		linePath.map((coordsArray) => coordsArray.length === 2 ? [...coordsArray].reverse() : coordsArray)
	);
	return { paths: linePaths, reversedPaths: reversedLinePaths };
}

export async function fetchAllLines(): Promise<LineData> {
	try {
        const res: Response = await fetch('../api/lines', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) {
            // Attempt to parse the error response
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to fetch line data.');
        }
		const resJson = await res.json();
		const parsedJson: LineData = resJson as LineData;

		parsedJson.features.map((feature) => (
			feature.geometry = parseGeometry(feature.geometry)
		));

		return resJson as LineData;
    } catch (error) {
        console.log('utils/linesUtils | fetchAllLines | error: ' + error);
        throw error;
    }
}
import { LineData, Attributes, Feature, Geometry, Field } from '../types/lineApiTypes';
import { LatLngBounds } from 'leaflet';

// API returns coordinates in [long, lat] format, but Leaflet expects [lat, long]
function parseGeometry(geometry: Geometry): Geometry {
	const linePaths = geometry.paths;
	// TODO Is there no better way to do this than loop over every single thing?
	const reversedLinePaths = linePaths.map((linePath) => // Each element of this array is a line path. There is tyically only 1.
		linePath.map((coordsArray) => coordsArray.length === 2 ? [...coordsArray].reverse() : coordsArray)
	);
	return { paths: linePaths, reversedPaths: reversedLinePaths };
}

// Fetch transmission lines within the given bounds.
// TODO test this function first. Maybe call from Map .tsx with made up bounds
export async function fetchLinesWithinBounds(bounds: LatLngBounds): Promise<LineData> {
	// TODO turn bounds into useful numbers
	
	// TODO create url using bounds

	// TODO fetch the lines using the url

	// TODO Parse and return

	return {} as LineData; // TODO change obv
}

// Fetch all transmission lines using pagination, 1000 at a time.
export async function fetchAllLines(): Promise<LineData> {
	console.log('utils/linesUtils | fetchAllLines | START');

	const resultRecordCount = 1000;
	let lineData: LineData = {} as LineData;
	let resultOffest = 0;
	let rowsReturned = 1000;

	// If the number of rows returned is less than resultRecordCount, we have reached the end of the pagination.
	for (let i=0; i<20; i++) { // ***FOR TESTING TODO delete // while (rowsReturned >= resultRecordCount) { // 
		try {
			const res: Response = await fetch(`../api/lines?resultOffset=${resultOffest}&resultRecordCount=${resultRecordCount}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!res.ok) {
				// Attempt to parse the error response
				const errorData = await res.json();
				throw new Error(errorData.message || 'HTTP error from Route Handler.');
			}

			const resJson = await res.json();
			const parsedJson: LineData = resJson as LineData;
			rowsReturned = parsedJson.features.length; // Keep track of rows returned to know when pagination ends.
			// TODO delete
			if (rowsReturned !== resultRecordCount) console.log(`utils/linesUtils | fetchAllLines | rowsReturned: ${rowsReturned}, resultRecordCount: ${resultRecordCount}`);

			// Fix the geometry format for Leaflet
			parsedJson.features.map((feature) => (
				feature.geometry = parseGeometry(feature.geometry)
			));

			if (!lineData.features) { // If lineData is empty, keep the entire response.
				lineData = parsedJson;
			} else { // If lineData already populated, just add the features (AKA transmission lines).
				lineData.features.push(...parsedJson.features);
			}

			resultOffest += resultRecordCount;
		} catch (error) {
			console.log('utils/linesUtils | fetchAllLines | error: ', error);
			throw new Error(`utils/linesUtils | fetchAllLines | error: ${error}`);
		}
	}
	return lineData;
}
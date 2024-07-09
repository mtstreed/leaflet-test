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

// TODO Fetch all transmission lines using pagination, 1000 at a time.
export async function fetchAllLines(): Promise<LineData> {
	console.log('utils/linesUtils | fetchAllLines | START');

	const resultRecordCount = 1000;
	let lineData: LineData = {} as LineData;
	let resultOffest = 0;
	let rowsReturned = 1000;

	// If the number of rows returned is less than resultRecordCount, we have reached the end of the pagination.
	// TODO use while loop to get all data, not this test for loop
	while (rowsReturned >= resultRecordCount) { // for (let i=0; i<60; i++) { // 
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
			rowsReturned = parsedJson.features.length; // Keep track of rows to know when pagination ends.
			// TODO delete
			if (rowsReturned !== resultRecordCount) console.log(`utils/linesUtils | fetchAllLines | rowsReturned: ${rowsReturned}, resultRecordCount: ${resultRecordCount}`);

			// Correct the geometry format for Leaflet
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

	// try {
    //     const res: Response = await fetch('../api/lines', {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //     });
    //     if (!res.ok) {
    //         // Attempt to parse the error response
    //         const errorData = await res.json();
    //         throw new Error(errorData.message || 'Failed to fetch line data.');
    //     }
	// 	const resJson = await res.json();
	// 	const parsedJson: LineData = resJson as LineData;
	// 	// console.log('utils/linesUtils | fetchAllLines | parsedJson.features.length: ' + JSON.stringify(parsedJson.features.length));

	// 	parsedJson.features.map((feature) => (
	// 		feature.geometry = parseGeometry(feature.geometry)
	// 	));

	// 	return resJson as LineData;
    // } catch (error) {
    //     console.log('utils/linesUtils | fetchAllLines | error: ', error);
    //     throw new Error(`utils/linesUtils | fetchAllLines | error: ${error}`);
    // }
}
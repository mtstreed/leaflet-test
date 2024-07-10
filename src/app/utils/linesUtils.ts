import { LineData, Attributes, Feature, Geometry, Field } from '../types/lineApiTypes';
import { LatLngBounds } from 'leaflet';


// Object to be input into buildUrlQuery().
export interface UrlQueryParams {
	resultOffset: number;
	resultRecordCount: number;
	xmin?: number;
	ymin?: number;
	xmax?: number;
	ymax?: number;

}


// API returns coordinates in [long, lat] format, but Leaflet expects [lat, long]
function parseGeometry(geometry: Geometry): Geometry {
	const linePaths = geometry.paths;
	// TODO Is there no better way to do this than loop over every single thing?
	const reversedLinePaths = linePaths.map((linePath) => // Each element of this array is a line path. There is tyically only 1.
		linePath.map((coordsArray) => coordsArray.length === 2 ? [...coordsArray].reverse() : coordsArray)
	);
	return { paths: linePaths, reversedPaths: reversedLinePaths };
}


// function fetchAndParseLineData(reqUrl: string): Promise<LineData> {
// }


// Builds the trailing query string for the lines/route.ts Route Handler (and then also transmission lines API).
export function buildUrlQuery(params: UrlQueryParams): string {
	let queryStr = `?where=1%3D1&outFields=*&outSR=4326&f=json&?resultOffset=${params.resultOffset}&resultRecordCount=${params.resultRecordCount}`;

	// Contrary to the docs, this complex url-encoded json seems to be the only way to input bounds.
	if (params.xmin && params.ymin && params.xmax && params.ymax) {
		queryStr += `&geometryType=esriGeometryEnvelope&geometry=%7B%22xmin%22%3A${params.xmin}%2C%22ymin%22%3A${params.ymin}%2C%22xmax%22%3A${params.xmax}%2C%22ymax%22%3A${params.ymax}%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D`;
	}
	return queryStr;
}


// Fetch transmission lines within the given bounds.
// TODO test this function first. Maybe call from Map .tsx with made up bounds
export async function fetchLinesWithinBounds(bounds: LatLngBounds): Promise<LineData> {
	// TODO turn bounds into useful numbers
	const xmin = bounds.getWest();
	const ymin = bounds.getSouth();
	const xmax = bounds.getEast();
	const ymax = bounds.getNorth();
	console.log(`utils/linesUtils | fetchLinesWithinBounds | bounds: xmin: ${xmin}, ymin: ${ymin}, xmax: ${xmax}, ymax: ${ymax}`);
	
	// TODO create url using bounds
	const urlQueryStr = buildUrlQuery({ resultOffset: 0, resultRecordCount: 1000, xmin, ymin, xmax, ymax });
	const reqUrl = `../api/lines${urlQueryStr}`;
	console.log(`utils/linesUtils | fetchLinesWithinBounds | reqUrl: ${reqUrl}`);

	// TODO fetch the lines using the url

	// TODO Parse and return

	// ********** BELOW IS COPY PASTED, NEED TO ADAPT **********
	const resultRecordCount = 1000;
	let lineData: LineData = {} as LineData;
	let resultOffest = 0;
	let rowsReturned = 1000;
	try {
		const res: Response = await fetch(reqUrl, {
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
	return lineData;
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
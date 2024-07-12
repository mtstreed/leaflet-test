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


// If no existing LineData var is given, parse the json into LineData. If yes, add new LineData.features to the existing 
// LineData.features. Should only be used on a json string response that fits LineData structure.
function parseLineData(lineDataJson: string, prevLineData?: LineData): LineData {
	const parsedJson: LineData = lineDataJson as unknown as LineData;

	// Fix the geometry format for Leaflet
	parsedJson.features.map((feature) => (
		feature.geometry = parseGeometry(feature.geometry)
	));

	if (!prevLineData) {
		return parsedJson;
	} else {
		prevLineData.features.push(...parsedJson.features);
		return prevLineData;
	}
}


// Builds only the trailing query string for the lines/route.ts Route Handler.
export function buildUrlQuery(params: UrlQueryParams): string {
	let queryStr = `?where=1%3D1&outFields=*&outSR=4326&f=json&resultOffset=${params.resultOffset}&resultRecordCount=${params.resultRecordCount}`;

	// Contrary to the docs, this complex url-encoded json seems to be the only way to input bounds.
	if (params.xmin && params.ymin && params.xmax && params.ymax) {
		queryStr += `&geometryType=esriGeometryEnvelope&geometry=%7B%22xmin%22%3A${params.xmin}%2C%22ymin%22%3A${params.ymin}%2C%22xmax%22%3A${params.xmax}%2C%22ymax%22%3A${params.ymax}%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D`;
	}
	return queryStr;
}


// TODO while loop pagination logic, and part of the parsin, is the same between both fetch functions. Should be extracted? But the url depends on the while loop vars (resultOffset)
export async function fetchLinesWithinBounds(bounds: LatLngBounds): Promise<LineData> {
	const xmin = bounds.getWest();
	const ymin = bounds.getSouth();
	const xmax = bounds.getEast();
	const ymax = bounds.getNorth();
	
	const resultRecordCount = 1000;
	let resultOffset = 0;
	let lineData: LineData = {} as LineData;
	let rowsReturned = 1000;

	while (rowsReturned >= resultRecordCount) {
		const urlQueryStr = buildUrlQuery({ resultOffset, resultRecordCount, xmin, ymin, xmax, ymax });
		const reqUrl = `../api/lines${urlQueryStr}`;
		
		try {
			const res: Response = await fetch(reqUrl, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || 'HTTP error from Route Handler.');
			}
			const resJson = await res.json();
			rowsReturned = resJson.features.length;

			if (!lineData.features) { // If lineData is empty, keep the entire response.
				lineData = parseLineData(resJson);
			} else { // If lineData already populated, just add the new features.
				lineData = parseLineData(resJson, lineData);
			}

			resultOffset += resultRecordCount;
		} catch (error) {
			console.log('utils/linesUtils | fetchAllLines | error: ', error);
			throw new Error(`utils/linesUtils | fetchAllLines | error: ${error}`);
		}
	}
	return lineData;
}


// Fetch all transmission lines using pagination, 1000 at a time.
export async function fetchAllLines(): Promise<LineData> {

	const resultRecordCount = 1000;
	let lineData: LineData = {} as LineData;
	let resultOffset = 0;
	let rowsReturned = 1000;

	// If the number of rows returned is less than resultRecordCount, we have reached the end of the pagination.
	while (rowsReturned >= resultRecordCount && resultOffset<10000) { // ***FOR TESTING TODO delete the resultOffset part

		let urlQueryStr = buildUrlQuery({ resultOffset, resultRecordCount });
		try {
			const res: Response = await fetch(`../api/lines${urlQueryStr}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || 'HTTP error from Route Handler.');
			}
			const resJson = await res.json();
			rowsReturned = resJson.features.length;

			if (!lineData.features) { // If lineData is empty, keep the entire response.
				lineData = parseLineData(resJson);
			} else { // If lineData already populated, just add the new features.
				lineData = parseLineData(resJson, lineData);
			}

			resultOffset += resultRecordCount;
		} catch (error) {
			console.log('utils/linesUtils | fetchAllLines | error: ', error);
			throw new Error(`utils/linesUtils | fetchAllLines | error: ${error}`);
		}
	}
	return lineData;
}
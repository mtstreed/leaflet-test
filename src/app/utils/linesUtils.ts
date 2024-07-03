import { LineData, Attributes, Feature, Field } from '../types/lineApiTypes';

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
		// console.log('utils/linesUtils | fetchAllLines | resJson: ', resJson);
		return resJson as LineData;
    } catch (error) {
        console.log('utils/linesUtils | fetchAllLines | error: ' + error);
        throw error;
    }
}
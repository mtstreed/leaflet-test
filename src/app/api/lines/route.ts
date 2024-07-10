import dotenv from 'dotenv';

dotenv.config();
const baseUri = process.env.TRANSMISSION_LINES_BASE_URL;

// This GET request takes dynamic query params to allow for pagination.
// TODO add functionality to use bounds if they are given (this would use the xmin, ymin, xmax, ymax query params)
// I guess that would be another if statement, but not sure where.
export async function GET(req: Request): Promise<Response> {
    const { searchParams } = new URL(req.url);

    if (searchParams.has('resultOffset') && searchParams.has('resultRecordCount')) {
        
        const resultOffset = searchParams.get('resultOffset'); // The starting row of data to return.
        const resultRecordCount = searchParams.get('resultRecordCount'); // The number of rows of data to return.
        // Build API request URL using query params.
        const reqUrl = `${baseUri}?where=1%3D1&outFields=*&outSR=4326&f=json&resultOffset=${resultOffset}&resultRecordCount=${resultRecordCount}`;
        
        try {
            const res: Response = await fetch(reqUrl, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!res.ok) {
                // Attempt to parse the error response
                const errorData = await res.json();
                throw new Error(errorData.message || 'HTTP error from API.');
            }

            const data = await res.json()
            return Response.json(data)
        
        } catch (error) {
            console.error('api/lines/route | GET | Error fetching line data from API: ', error);
            throw new Error(`api/lines/route | GET | Error fetching line data from API: ${error}`);
        }
    } else {
        throw new Error('Missing query params necessary for pagination.');
    }
}
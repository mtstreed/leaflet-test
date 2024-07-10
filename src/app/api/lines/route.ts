import dotenv from 'dotenv';

dotenv.config();
const baseUrl = process.env.TRANSMISSION_LINES_BASE_URL as string;

// This GET request takes dynamic query params to allow for pagination, geographic bounds, etc.
// TODO add functionality to use bounds if they are given (this would use the xmin, ymin, xmax, ymax query params)
// I guess that would be another if statement, but not sure where.
export async function GET(req: Request): Promise<Response> {
    
    // Get only the trailing query string from the url, and append it to the API baseUrl.
    const questionMarkIndex = req.url.indexOf('?');
    const reqUrl = questionMarkIndex === -1 ? baseUrl :  baseUrl + req.url.slice(questionMarkIndex);
    // console.log(`api/lines/route | GET | reqUrl: ${reqUrl}`);
    
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
}
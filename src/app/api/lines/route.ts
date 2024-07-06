import dotenv from 'dotenv';

dotenv.config();
const baseUri = process.env.TRANSMISSION_LINES_BASE_URL;

export async function GET(req: Request): Promise<Response> {
    try {
        const res: Response = await fetch(`${baseUri}/query?where=1%3D1&outFields=*&outSR=4326&f=json&resultRecordCount=100`, {
            headers: {
				'Content-Type': 'application/json',
			}
        });

        if (!res.ok) {
          throw new Error(`HTTP error. Status: ${res.status}`);
        }
        const data = await res.json()
        return Response.json(data)
    } catch (error) {
        console.error('api/lines/route | GET | Error fetching line data: ', error);
        throw new Error(`Error fetching line data: ${error}`);
    }
}
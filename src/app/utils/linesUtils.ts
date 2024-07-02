import { LineData, Attributes, Feature, Field } from '../types/lineApiTypes';

import dotenv from 'dotenv';

dotenv.config();
const baseUri = process.env.TRANSMISSION_API_BASE_URI;

export async function fetchAllLines(): Promise<LineData> {
  const response = await fetch(
    `${baseUri}/US_Electric_Power_Transmission_Lines/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json&resultRecordCount=1`
  );
  return response.json();
}
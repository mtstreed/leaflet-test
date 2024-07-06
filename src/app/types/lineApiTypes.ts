export interface LineData {
  objectIdFieldName: string;
  uniqueIdField: {
    name: string;
    isSystemMaintained: boolean;
  };
  globalIdFieldName: string;
  geometryProperties: {
    shapeLengthFieldName: string;
    units: string;
  };
  serverGens: {
    minServerGen: number;
    serverGen: number;
  };
  geometryType: string;
  spatialReference: {
    wkid: number;
    latestWkid: number;
  };
  fields: Field[];
  exceededTransferLimit: boolean;
  features: Feature[];
}

export interface Geometry {
  paths: number[][][];
  // The coordinates returned by API are in [long, lat] format, but Leaflet expects [lat, long]
  reversedPaths?: number[][][]; 
}

export interface Attributes {
  OBJECTID_1: number;
  OBJECTID: number;
  ID: string;
  TYPE: string;
  STATUS: string;
  NAICS_CODE: string;
  NAICS_DESC: string;
  SOURCE: string;
  SOURCEDATE: number;
  VAL_METHOD: string;
  VAL_DATE: number;
  OWNER: string;
  VOLTAGE: number;
  VOLT_CLASS: string;
  INFERRED: string;
  SUB_1: string;
  SUB_2: string;
  SHAPE__Len: number;
  GlobalID: string;
  Shape__Length: number;
}

export interface Feature {
  attributes: Attributes;
  geometry: Geometry;
}

export interface Field {
  name: string;
  type: string;
  alias: string;
  sqlType: string;
  length?: number; // The maximum length of the field, typically used for string fields
  domain: null | any;
  defaultValue: null | any;
  description: string;
}

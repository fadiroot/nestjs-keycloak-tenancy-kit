import timeZones from './time-zones.json';

interface TimeZone {
  label: string;
  tzCode: string;
  name: string;
  utc: string;
}

export { TimeZone };
export default timeZones as TimeZone[];

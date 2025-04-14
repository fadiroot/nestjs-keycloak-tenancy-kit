export function parseArrayFromQuery(arrayFromQuery : string | string[]) : string[]{
    const parsedArray: string[]= Array.isArray(arrayFromQuery)
    ? arrayFromQuery
    : typeof arrayFromQuery === 'string'
    ? arrayFromQuery.split(',') 
    : [];
    return parsedArray

}
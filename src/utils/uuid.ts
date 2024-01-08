
import { v4 as uuidv4 } from 'uuid';

export const generateUuid = () => {
    const apiKey: string = uuidv4();
    return apiKey;
}
export const isUUID = (uuid: string) => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidPattern.test(uuid);
}
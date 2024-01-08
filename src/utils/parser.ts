import logger from "../config/logger"

export const parseJsonList: (key: string) => string[] = (jsonString: string) => {
    try {
        const data: string[] = JSON.parse(jsonString)
        if (Array.isArray(data)) {
            return data.map(e => JSON.stringify(e)) as string[]
        }
        return []
    } catch (error) {
        logger.error(error)
        return []
    }
}
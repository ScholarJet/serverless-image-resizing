export interface ThumbnailGenerator {
    /**
     * Generates the thumbnail
     * @param object the object to which the thumbnail belongs
     * @returns {any}
     */
    generate(object: any): any;
}

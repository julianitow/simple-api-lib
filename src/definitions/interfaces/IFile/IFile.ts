export interface IFile {
    id?: string;
    name: string;
    content: Uint8Array | Buffer; // receive a Uint8array but need as a buffer to store
}
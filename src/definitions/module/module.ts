/* eslint-disable @typescript-eslint/no-explicit-any */
import { IModule } from "../interfaces";

export class Module<T extends IModule> {

    private c: new (...args: any[]) => T
    
    constructor(c: new (...args: any[]) => T) {
        this.c = c;
    }

    default(...args: any[]): T {
        return new this.c(...args);
    }
}
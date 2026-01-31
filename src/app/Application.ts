/* eslint-disable @typescript-eslint/no-explicit-any */
import { IModule } from "../api";

export class Application {
  static sharedContext: any;
  private initModules: IModule[] = []; // modules required before any others
  private modules: IModule[] = [];

  constructor() {}

  public use<T extends IModule>(
    module: new (...args: any[]) => T,
    ...args: any[]
  ): void {
    const m = new module(...args);
    this.modules.push(m);
  }

  public set<T extends IModule>(
    module: new (...args: any[]) => T,
    ...args: any[]
  ): void {
    const m = new module(...args);
    this.initModules.push(m);
    m.default();
  }

  public continue(): void {}

  protected beforeRun(): void {}

  protected run(): void {
    for (const m of this.modules) {
      m.default();
    }
  }

  protected exit(exitCode?: number): void {
    process.exit(exitCode ? exitCode : 0);
  }
}

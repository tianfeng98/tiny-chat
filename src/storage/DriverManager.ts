import type { ChatStorageDriver, DriverConfig } from "./interface";
import MemoryDriver from "./MemoryDriver";

export default class DriverManager {
  private driverMap: Map<string, ChatStorageDriver> = new Map();
  private driverConfig: DriverConfig;

  constructor() {
    const defaultDriverName = "memory";
    this.defineDriver(
      new MemoryDriver({
        name: defaultDriverName,
      })
    );
    this.driverConfig = { name: defaultDriverName };
  }

  config(config: Partial<DriverConfig>) {
    Object.assign(this.driverConfig, config);
  }
  defineDriver(driver: ChatStorageDriver) {
    this.driverMap.set(driver.name, driver);
  }
  getDriver() {
    const driver = this.driverMap.get(this.driverConfig.name);
    if (!driver) {
      throw new Error("No storage driver found");
    }
    return driver;
  }
}

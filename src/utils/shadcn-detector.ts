import path from "path";
import { SHADCN_COMPONENTS } from "../constants/index.js";

export class ShadcnComponentDetector {
  /**
   * Get shadcn component name from file path
   */
  static getShadcnComponentName(filePath: string): string | null {
    const filename = path.basename(filePath, path.extname(filePath));
    return SHADCN_COMPONENTS.find((comp) => comp === filename) || null;
  }

  /**
   * Check if file is a shadcn/ui component
   */
  static isShadcnComponent(filePath: string, rootDir: string): boolean {
    const relativePath = path.relative(rootDir, filePath);
    return relativePath.includes("components" + path.sep + "ui");
  }
}

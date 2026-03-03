import { LibraryManagerApp } from "@rekordbox/ui";
import type { DesktopBridge } from "@rekordbox/ui";
import type { LoadedLibrary, SaveLibraryResult, ValidationResult } from "@rekordbox/types";

const bridge: DesktopBridge = {
  openLibrary: async () => {
    const result = (await window.rekordboxBridge.openLibrary()) as LoadedLibrary | null;
    return result;
  },
  saveLibraryAs: async (input) => {
    const validation = (await window.rekordboxBridge.validateLibrary(input.library)) as ValidationResult;
    if (!validation.valid) {
      throw new Error(validation.errors.join(" | "));
    }

    const result = (await window.rekordboxBridge.saveLibraryAs({
      sourcePath: input.sourcePath ?? undefined,
      createBackup: true,
      library: input.library
    })) as SaveLibraryResult | null;

    return result;
  }
};

export default function App() {
  return <LibraryManagerApp bridge={bridge} shellName="electron" />;
}

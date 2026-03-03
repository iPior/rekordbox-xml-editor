import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { LibraryManagerApp } from "@rekordbox/ui";
import type { DesktopBridge } from "@rekordbox/ui";
import type { LoadedLibrary, SaveLibraryResult, ValidationResult } from "@rekordbox/types";

const bridge: DesktopBridge = {
  openLibrary: async () => {
    const selected = await open({
      title: "Open Rekordbox XML",
      multiple: false,
      filters: [{ name: "XML", extensions: ["xml"] }]
    });

    if (!selected || Array.isArray(selected)) {
      return null;
    }

    return invoke<LoadedLibrary>("open_rekordbox_xml", { path: selected });
  },
  saveLibraryAs: async (input) => {
    const destination = await save({
      title: "Save Rekordbox XML",
      filters: [{ name: "XML", extensions: ["xml"] }],
      defaultPath: input.sourcePath ?? "library.xml"
    });

    if (!destination) {
      return null;
    }

    const request = {
      sourcePath: input.sourcePath ?? undefined,
      destinationPath: destination,
      createBackup: true,
      library: input.library
    };

    const validation = await invoke<ValidationResult>("validate_library_xml", { request });
    if (!validation.valid) {
      throw new Error(validation.errors.join(" | "));
    }

    return invoke<SaveLibraryResult>("save_rekordbox_xml", { request });
  }
};

export default function App() {
  return <LibraryManagerApp bridge={bridge} shellName="tauri" />;
}

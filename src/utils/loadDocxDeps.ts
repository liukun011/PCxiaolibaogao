export const loadDocxDeps = async () => {
  const [docxModule, fileSaverModule] = await Promise.all([
    import("docx"),
    import("file-saver"),
  ]);

  return {
    ...docxModule,
    saveAs: fileSaverModule.saveAs,
  };
};

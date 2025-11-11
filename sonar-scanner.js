import scannerModule from 'sonarqube-scanner';

const sonarqubeScanner = scannerModule.default || scannerModule;

(async () => {
  try {
    await sonarqubeScanner({
      serverUrl: "http://localhost:9000",
      token: "sqp_83cc9b12be996893e3ac9a9aa828de175c5bbe2b", // substitua pelo token do seu projeto SonarQube
      options: {
        "sonar.projectKey": "fluxo-key",
        "sonar.projectName": "Fluxo",
        "sonar.projectVersion": "1.0",
        "sonar.sources": ".", 
        "sonar.exclusions": "**/node_modules/**,**/dist/**",
      },
    });

    console.log("✅ Análise enviada com sucesso para o SonarQube!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro ao executar a análise:", err);
    process.exit(1);
  }
})();

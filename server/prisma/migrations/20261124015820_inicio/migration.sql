-- CreateTable
CREATE TABLE "Transacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descricao" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "criadoPor" TEXT NOT NULL,
    "atualizadoPor" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "excluidoEm" DATETIME
);

-- CreateIndex
CREATE INDEX "Transacao_excluidoEm_criadoEm_idx" ON "Transacao"("excluidoEm", "criadoEm");

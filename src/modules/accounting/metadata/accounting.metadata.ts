import { MetadataRepository } from "../repositories/metadata.repository.ts";

export class AccountingMetadataService {
  private repo = new MetadataRepository();

  async setAccountMetadata(accountId: number, key: string, value: any) {
    return await this.repo.setMetadata({
      entityType: "ACCOUNT",
      entityId: accountId.toString(),
      key,
      value,
    });
  }

  async getAccountMetadata(accountId: number) {
    return await this.repo.getMetadata("ACCOUNT", accountId.toString());
  }

  async setJournalMetadata(journalId: number, key: string, value: any) {
    return await this.repo.setMetadata({
      entityType: "JOURNAL_ENTRY",
      entityId: journalId.toString(),
      key,
      value,
    });
  }

  async getJournalMetadata(journalId: number) {
    return await this.repo.getMetadata("JOURNAL_ENTRY", journalId.toString());
  }
}

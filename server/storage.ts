import { users, type User, type InsertUser, type JournalEntry, type Flower } from "@shared/schema";
import { FlowerData } from "../client/src/types";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Journal methods
  getJournalEntries(): Promise<JournalEntry[]>;
  getJournalEntryById(id: string): Promise<JournalEntry | undefined>;
  saveJournalEntry(entry: JournalEntry): Promise<JournalEntry>;
  
  // Flower methods
  getFlowers(): Promise<FlowerData[]>;
  getFlowerById(id: string): Promise<FlowerData | undefined>;
  saveFlower(flower: FlowerData): Promise<FlowerData>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private journalEntries: Map<string, JournalEntry>;
  private flowers: Map<string, FlowerData>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.journalEntries = new Map();
    this.flowers = new Map();
    this.currentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Journal methods
  async getJournalEntries(): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values());
  }
  
  async getJournalEntryById(id: string): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }
  
  async saveJournalEntry(entry: JournalEntry): Promise<JournalEntry> {
    this.journalEntries.set(entry.id, entry);
    return entry;
  }
  
  // Flower methods
  async getFlowers(): Promise<FlowerData[]> {
    return Array.from(this.flowers.values());
  }
  
  async getFlowerById(id: string): Promise<FlowerData | undefined> {
    return this.flowers.get(id);
  }
  
  async saveFlower(flower: FlowerData): Promise<FlowerData> {
    this.flowers.set(flower.id, flower);
    return flower;
  }
}

export const storage = new MemStorage();

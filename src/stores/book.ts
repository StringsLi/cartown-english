import { defineStore } from "pinia";
import { getBooks } from "@/services/bookService";
import type { Book, BookTheme } from "@/types/book";

export const useBookStore = defineStore("book", {
  state: () => ({
    activeTheme: "All" as BookTheme | "All",
    books: getBooks()
  }),
  actions: {
    setTheme(theme: BookTheme | "All") {
      this.activeTheme = theme;
      this.books = getBooks({ theme }) as Book[];
    }
  }
});

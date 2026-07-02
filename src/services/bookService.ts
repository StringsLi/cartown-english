import { levelLabels, mockBookPages, mockBooks, mockWords, parentTips, themeFilters, themeLabelMap } from "@/mock/books";
import type { Book, BookLevel, BookPage, BookTheme, ParentTip, Word } from "@/types/book";

export function getBooks(params: { theme?: BookTheme | "All"; level?: BookLevel | "All" } = {}): Book[] {
  const { theme = "All", level = "All" } = params;

  return mockBooks
    .filter((book) => book.isPublished)
    .filter((book) => theme === "All" || book.theme === theme)
    .filter((book) => level === "All" || book.level === level)
    .sort((first, second) => first.sort - second.sort);
}

export function getBookById(bookId: string): Book | undefined {
  return mockBooks.find((book) => book.id === bookId);
}

export function getTodayBook(): Book {
  return getBooks()[0];
}

export function getBookPages(bookId: string): BookPage[] {
  return mockBookPages
    .filter((page) => page.bookId === bookId)
    .sort((first, second) => first.pageIndex - second.pageIndex);
}

export function getBookWords(bookId: string): Word[] {
  const book = getBookById(bookId);
  if (!book) {
    return [];
  }

  return book.keywords
    .map((keyword) => mockWords.find((word) => word.word === keyword))
    .filter((word): word is Word => Boolean(word));
}

export function getTodayWords(): Word[] {
  return getBookWords(getTodayBook().id);
}

export function getWordByText(wordText: string): Word | undefined {
  return mockWords.find((word) => word.word === wordText);
}

export function getAllWords(): Word[] {
  return mockWords;
}

export function getParentTip(bookId: string): ParentTip {
  return parentTips.find((tip) => tip.bookId === bookId) ?? parentTips[0];
}

export function getThemeLabel(theme: BookTheme): string {
  return themeLabelMap[theme];
}

export { levelLabels, themeFilters };

// tests based on
// - https://github.com/JSONPath-Plus/JSONPath
// - http://goessner.net/articles/jsonpath/
/* global structuredClone */
import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import Nimma from '../index.mjs';

const input = {
  store: {
    book: [
      {
        category: 'reference',
        author: 'Nigel Rees',
        title: 'Sayings of the Century',
        price: 8.95,
      },
      {
        category: 'fiction',
        author: 'Evelyn Waugh',
        title: 'Sword of Honour',
        price: 12.99,
      },
      {
        category: 'fiction',
        author: 'Herman Melville',
        title: 'Moby Dick',
        isbn: '0-553-21311-3',
        price: 8.99,
      },
      {
        category: 'fiction',
        author: 'J. R. R. Tolkien',
        title: 'The Lord of the Rings',
        isbn: '0-395-19395-8',
        price: 22.99,
      },
    ],
    bicycle: {
      color: 'red',
      price: 19.95,
    },
  },
};

function collect(input, path) {
  const results = [];
  Nimma.query(structuredClone(input), {
    [path]({ path, value }) {
      results.push({
        path,
        value,
      });
    },
  });

  results.sort((a, b) =>
    JSON.stringify(a.path).localeCompare(JSON.stringify(b.path)),
  );
  return results;
}

describe('Compatibility tests', () => {
  for (const path of ['$.store.bicycle', "$['store']['bicycle']"]) {
    it(path, () => {
      deepEqual(collect(input, path), [
        {
          path: ['store', 'bicycle'],
          value: input.store.bicycle,
        },
      ]);
    });
  }

  describe('JSONPath - Array', function () {
    const input = {
      store: {
        book: {
          category: 'reference',
          author: 'Nigel Rees',
          title: 'Sayings of the Century',
          price: [8.95, 8.94, 8.93],
        },
        books: [
          {
            category: 'reference',
            author: 'Nigel Rees',
            title: 'Sayings of the Century',
            price: [8.95, 8.94, 8.93],
          },
        ],
      },
    };

    it('$.store.book', () => {
      deepEqual(collect(input, '$.store.book'), [
        {
          path: ['store', 'book'],
          value: input.store.book,
        },
      ]);
    });

    it('$.store.books', () => {
      deepEqual(collect(input, '$.store.books'), [
        {
          path: ['store', 'books'],
          value: input.store.books,
        },
      ]);
    });

    it('$.store.books[*].author', () => {
      deepEqual(collect(input, '$.store.books[*].author'), [
        {
          path: ['store', 'books', 0, 'author'],
          value: input.store.books[0].author,
        },
      ]);
    });

    it('query single element arr w/array value', () => {
      const authors = ['Dickens', 'Lancaster'];
      const input = {
        books: [{ authors }],
      };
      deepEqual(collect(input, '$.books[0].authors'), [
        {
          path: ['books', 0, 'authors'],
          value: authors,
        },
      ]);
    });

    it('query multi element arr w/array value', () => {
      const authors = ['Dickens', 'Lancaster'];
      const input = {
        books: [{ authors }, { authors }],
      };
      deepEqual(collect(input, '$.books[*].authors'), [
        {
          path: ['books', 0, 'authors'],
          value: authors,
        },
        {
          path: ['books', 1, 'authors'],
          value: authors,
        },
      ]);
    });
  });

  describe('JSONPath - Intermixed Array', function () {
    // tests based on examples at http://goessner.net/articles/jsonpath/
    const input = {
      store: {
        book: [
          {
            category: 'reference',
            author: 'Nigel Rees',
            title: 'Sayings of the Century',
            price: [8.95, 8.94, 8.93],
          },
          {
            category: 'fiction',
            author: 'Evelyn Waugh',
            title: 'Sword of Honour',
            price: 12.99,
          },
          {
            category: 'fiction',
            author: 'Herman Melville',
            title: 'Moby Dick',
            isbn: '0-553-21311-3',
            price: 8.99,
          },
          {
            category: 'fiction',
            author: 'J. R. R. Tolkien',
            title: 'The Lord of the Rings',
            isbn: '0-395-19395-8',
            price: 22.99,
          },
        ],
        bicycle: {
          color: 'red',
          price: 19.95,
        },
      },
    };

    it('all sub properties, entire tree', () => {
      deepEqual(collect(input, '$.store..price'), [
        {
          path: ['store', 'bicycle', 'price'],
          value: input.store.bicycle.price,
        },
        {
          path: ['store', 'book', 0, 'price'],
          value: input.store.book[0].price,
        },
        {
          path: ['store', 'book', 1, 'price'],
          value: input.store.book[1].price,
        },
        {
          path: ['store', 'book', 2, 'price'],
          value: input.store.book[2].price,
        },
        {
          path: ['store', 'book', 3, 'price'],
          value: input.store.book[3].price,
        },
      ]);
    });

    it('all sub properties of single element arr', () => {
      const book = input.store.book[0];
      deepEqual(collect({ book }, '$..title'), [
        {
          path: ['book', 'title'],
          value: book.title,
        },
      ]);
    });
  });

  describe('JSONPath - Path expressions', function () {
    // tests based on examples at http://goessner.net/articles/JsonPath/
    const input = {
      store: {
        book: [
          {
            category: 'reference',
            author: 'Nigel Rees',
            'application/vnd.wordperfect': 'sotc.wpd',
            title: 'Sayings of the Century',
            price: 8.95,
          },
          {
            category: 'fiction',
            author: 'Evelyn Waugh',
            title: 'Sword of Honour',
            price: 12.99,
          },
          {
            category: 'fiction',
            author: 'Herman Melville',
            title: 'Moby Dick',
            isbn: '0-553-21311-3',
            price: 8.99,
          },
          {
            category: 'fiction',
            author: 'J. R. R. Tolkien',
            title: 'The Lord of the Rings',
            isbn: '0-395-19395-8',
            price: 22.99,
          },
        ],
        bicycle: {
          color: 'red',
          price: 19.95,
        },
      },
    };

    it('dot notation', () => {
      deepEqual(collect(input, '$.store.book[*].author'), [
        {
          path: ['store', 'book', 0, 'author'],
          value: input.store.book[0].author,
        },
        {
          path: ['store', 'book', 1, 'author'],
          value: input.store.book[1].author,
        },
        {
          path: ['store', 'book', 2, 'author'],
          value: input.store.book[2].author,
        },
        {
          path: ['store', 'book', 3, 'author'],
          value: input.store.book[3].author,
        },
      ]);
    });

    it('bracket notation', () => {
      deepEqual(collect(input, "$['store']['book'][*]['author']"), [
        {
          path: ['store', 'book', 0, 'author'],
          value: input.store.book[0].author,
        },
        {
          path: ['store', 'book', 1, 'author'],
          value: input.store.book[1].author,
        },
        {
          path: ['store', 'book', 2, 'author'],
          value: input.store.book[2].author,
        },
        {
          path: ['store', 'book', 3, 'author'],
          value: input.store.book[3].author,
        },
      ]);
    });

    it('bracket notation (double quoted)', () => {
      deepEqual(collect(input, '$["store"]["book"][*]["author"]'), [
        {
          path: ['store', 'book', 0, 'author'],
          value: input.store.book[0].author,
        },
        {
          path: ['store', 'book', 1, 'author'],
          value: input.store.book[1].author,
        },
        {
          path: ['store', 'book', 2, 'author'],
          value: input.store.book[2].author,
        },
        {
          path: ['store', 'book', 3, 'author'],
          value: input.store.book[3].author,
        },
      ]);
    });

    it('bracket notation without quotes', () => {
      deepEqual(collect(input, '$[store][book][*][author]'), [
        {
          path: ['store', 'book', 0, 'author'],
          value: input.store.book[0].author,
        },
        {
          path: ['store', 'book', 1, 'author'],
          value: input.store.book[1].author,
        },
        {
          path: ['store', 'book', 2, 'author'],
          value: input.store.book[2].author,
        },
        {
          path: ['store', 'book', 3, 'author'],
          value: input.store.book[3].author,
        },
      ]);
    });

    it('mixed notation', () => {
      deepEqual(collect(input, "$.store.book[*]['author']"), [
        {
          path: ['store', 'book', 0, 'author'],
          value: input.store.book[0].author,
        },
        {
          path: ['store', 'book', 1, 'author'],
          value: input.store.book[1].author,
        },
        {
          path: ['store', 'book', 2, 'author'],
          value: input.store.book[2].author,
        },
        {
          path: ['store', 'book', 3, 'author'],
          value: input.store.book[3].author,
        },
      ]);
    });

    it('bracket notation containing dots', () => {
      deepEqual(
        collect(input, "$['store']['book'][*]['application/vnd.wordperfect']"),
        [
          {
            path: ['store', 'book', 0, 'application/vnd.wordperfect'],
            value: input.store.book[0]['application/vnd.wordperfect'],
          },
        ],
      );
    });

    it('mixed notation containing dots', () => {
      deepEqual(
        collect(input, "$.store.book[*]['application/vnd.wordperfect']"),
        [
          {
            path: ['store', 'book', 0, 'application/vnd.wordperfect'],
            value: input.store.book[0]['application/vnd.wordperfect'],
          },
        ],
      );
    });

    it('empty string key', () => {
      deepEqual(collect({ '': null }, '$[""]'), [
        {
          path: [''],
          value: null,
        },
      ]);
    });
  });

  describe(`JSONPath - Examples`, function () {
    // tests based on examples at http://goessner.net/articles/jsonpath/

    it('wildcards (with and without $.)', () => {
      deepEqual(collect(input, '$.store.book[*].author'), [
        {
          path: ['store', 'book', 0, 'author'],
          value: input.store.book[0].author,
        },
        {
          path: ['store', 'book', 1, 'author'],
          value: input.store.book[1].author,
        },
        {
          path: ['store', 'book', 2, 'author'],
          value: input.store.book[2].author,
        },
        {
          path: ['store', 'book', 3, 'author'],
          value: input.store.book[3].author,
        },
      ]);
    });

    it('all properties, entire tree', () => {
      deepEqual(collect(input, '$..author'), [
        {
          path: ['store', 'book', 0, 'author'],
          value: input.store.book[0].author,
        },
        {
          path: ['store', 'book', 1, 'author'],
          value: input.store.book[1].author,
        },
        {
          path: ['store', 'book', 2, 'author'],
          value: input.store.book[2].author,
        },
        {
          path: ['store', 'book', 3, 'author'],
          value: input.store.book[3].author,
        },
      ]);
    });

    it('all sub properties, single level', () => {
      deepEqual(collect(input, '$.store.*'), [
        {
          path: ['store', 'bicycle'],
          value: input.store.bicycle,
        },
        {
          path: ['store', 'book'],
          value: input.store.book,
        },
      ]);
    });

    it('all sub properties, entire tree', () => {
      deepEqual(collect(input, '$.store..price'), [
        {
          path: ['store', 'bicycle', 'price'],
          value: 19.95,
        },
        {
          path: ['store', 'book', 0, 'price'],
          value: 8.95,
        },
        {
          path: ['store', 'book', 1, 'price'],
          value: 12.99,
        },
        {
          path: ['store', 'book', 2, 'price'],
          value: 8.99,
        },
        {
          path: ['store', 'book', 3, 'price'],
          value: 22.99,
        },
      ]);
    });

    it('n property of entire tree', () => {
      deepEqual(collect(input, '$..book[2]'), [
        {
          path: ['store', 'book', 2],
          value: input.store.book[2],
        },
      ]);
    });

    it('last property of entire tree', () => {
      const expected = [
        {
          path: ['store', 'book', 3],
          value: input.store.book[3],
        },
      ];
      deepEqual(collect(input, '$..book[(@.length-1)]'), expected);
      deepEqual(collect(input, '$..book[-1:]'), expected);
    });

    it('range of property of entire tree', () => {
      const expected = [
        {
          path: ['store', 'book', 0],
          value: input.store.book[0],
        },
        {
          path: ['store', 'book', 1],
          value: input.store.book[1],
        },
      ];
      deepEqual(collect(input, '$..book[0,1]'), expected);
      deepEqual(collect(input, '$..book[:2]'), expected);
    });

    it('range of property of entire tree w/ single element result', () => {
      const _input = { books: [input.store.book[0]] };
      const expected = [
        {
          path: ['books', 0],
          value: _input.books[0],
        },
      ];
      deepEqual(collect(_input, '$.books[0,1]'), expected);
      deepEqual(collect(_input, '$.books[:1]'), expected);
    });

    it('categories and authors of all books', () => {
      deepEqual(collect(input, '$..book[0][category,author]'), [
        {
          path: ['store', 'book', 0, 'author'],
          value: 'Nigel Rees',
        },
        {
          path: ['store', 'book', 0, 'category'],
          value: 'reference',
        },
      ]);
    });

    it('filter all properties if sub property exists, of entire tree', () => {
      deepEqual(collect(input, '$..book[?(@.isbn)]'), [
        {
          path: ['store', 'book', 2],
          value: input.store.book[2],
        },
        {
          path: ['store', 'book', 3],
          value: input.store.book[3],
        },
      ]);
    });

    it('filter all properties if sub property exists, of single element array', () => {
      const _input = { books: [input.store.book[3]] };
      deepEqual(collect(_input, '$.books[?(@.isbn)]'), [
        {
          path: ['books', 0],
          value: _input.books[0],
        },
      ]);
    });

    it('filter all properties if sub property greater than of entire tree', () => {
      deepEqual(collect(input, '$..book[?(@.price<10)]'), [
        {
          path: ['store', 'book', 0],
          value: input.store.book[0],
        },
        {
          path: ['store', 'book', 2],
          value: input.store.book[2],
        },
      ]);
    });

    it('@ as a scalar value', () => {
      deepEqual(
        collect(input, "$..*[?(@property === 'price' && @ !== 8.95)]"),
        [
          {
            path: ['store', 'bicycle', 'price'],
            value: 19.95,
          },
          {
            path: ['store', 'book', 1, 'price'],
            value: 12.99,
          },
          {
            path: ['store', 'book', 2, 'price'],
            value: 8.99,
          },
          {
            path: ['store', 'book', 3, 'price'],
            value: 22.99,
          },
        ],
      );
    });

    it('all properties of a JSON structure (beneath the root)', () => {
      deepEqual(collect(input, '$..*'), [
        {
          path: ['store', 'bicycle', 'color'],
          value: 'red',
        },
        {
          path: ['store', 'bicycle', 'price'],
          value: 19.95,
        },
        {
          path: ['store', 'bicycle'],
          value: {
            color: 'red',
            price: 19.95,
          },
        },
        {
          path: ['store', 'book', 0, 'author'],
          value: 'Nigel Rees',
        },
        {
          path: ['store', 'book', 0, 'category'],
          value: 'reference',
        },
        {
          path: ['store', 'book', 0, 'price'],
          value: 8.95,
        },
        {
          path: ['store', 'book', 0, 'title'],
          value: 'Sayings of the Century',
        },
        {
          path: ['store', 'book', 0],
          value: input.store.book[0],
        },
        {
          path: ['store', 'book', 1, 'author'],
          value: 'Evelyn Waugh',
        },
        {
          path: ['store', 'book', 1, 'category'],
          value: 'fiction',
        },
        {
          path: ['store', 'book', 1, 'price'],
          value: 12.99,
        },
        {
          path: ['store', 'book', 1, 'title'],
          value: 'Sword of Honour',
        },
        {
          path: ['store', 'book', 1],
          value: input.store.book[1],
        },
        {
          path: ['store', 'book', 2, 'author'],
          value: 'Herman Melville',
        },
        {
          path: ['store', 'book', 2, 'category'],
          value: 'fiction',
        },
        {
          path: ['store', 'book', 2, 'isbn'],
          value: '0-553-21311-3',
        },
        {
          path: ['store', 'book', 2, 'price'],
          value: 8.99,
        },
        {
          path: ['store', 'book', 2, 'title'],
          value: 'Moby Dick',
        },
        {
          path: ['store', 'book', 2],
          value: input.store.book[2],
        },
        {
          path: ['store', 'book', 3, 'author'],
          value: 'J. R. R. Tolkien',
        },
        {
          path: ['store', 'book', 3, 'category'],
          value: 'fiction',
        },
        {
          path: ['store', 'book', 3, 'isbn'],
          value: '0-395-19395-8',
        },
        {
          path: ['store', 'book', 3, 'price'],
          value: 22.99,
        },
        {
          path: ['store', 'book', 3, 'title'],
          value: 'The Lord of the Rings',
        },
        {
          path: ['store', 'book', 3],
          value: input.store.book[3],
        },
        {
          path: ['store', 'book'],
          value: input.store.book,
        },
        {
          path: ['store'],
          value: input.store,
        },
      ]);
    });

    it('all parent components of a JSON structure', () => {
      deepEqual(collect(input, '$..'), [
        {
          path: ['store', 'bicycle'],
          value: input.store.bicycle,
        },
        {
          path: ['store', 'book', 0],
          value: input.store.book[0],
        },
        {
          path: ['store', 'book', 1],
          value: input.store.book[1],
        },
        {
          path: ['store', 'book', 2],
          value: input.store.book[2],
        },
        {
          path: ['store', 'book', 3],
          value: input.store.book[3],
        },
        {
          path: ['store', 'book'],
          value: input.store.book,
        },
        {
          path: ['store'],
          value: input.store,
        },
        {
          path: [],
          value: input,
        },
      ]);
    });

    it('root', () => {
      deepEqual(collect(input, '$'), [
        {
          path: [],
          value: input,
        },
      ]);
    });

    it('Custom operator: parent (caret)', () => {
      deepEqual(collect(input, '$..[?(@.price>19)]^'), [
        {
          path: ['store', 'book'],
          value: input.store.book,
        },
        {
          path: ['store'],
          value: input.store,
        },
      ]);
    });

    it('Custom operator: property name (tilde)', () => {
      deepEqual(collect(input, '$.store.*~'), [
        {
          path: ['store', 'bicycle'],
          value: 'bicycle',
        },
        {
          path: ['store', 'book'],
          value: 'book',
        },
      ]);
    });

    it('Custom property @path', () => {
      deepEqual(
        collect(input, "$.store.book[?(@path !== \"$['store']['book'][0]\")]"),
        [
          {
            path: ['store', 'book', 1],
            value: input.store.book[1],
          },
          {
            path: ['store', 'book', 2],
            value: input.store.book[2],
          },
          {
            path: ['store', 'book', 3],
            value: input.store.book[3],
          },
        ],
      );
    });

    it('Custom property: @parent', () => {
      deepEqual(
        collect(
          input,
          '$..book[?(@parent.bicycle && @parent.bicycle.color === "red")].category',
        ),
        [
          {
            path: ['store', 'book', 0, 'category'],
            value: 'reference',
          },
          {
            path: ['store', 'book', 1, 'category'],
            value: 'fiction',
          },
          {
            path: ['store', 'book', 2, 'category'],
            value: 'fiction',
          },
          {
            path: ['store', 'book', 3, 'category'],
            value: 'fiction',
          },
        ],
      );
    });

    it('Custom property: @property', () => {
      deepEqual(collect(input, '$..book.*[?(@property !== "category")]'), [
        {
          path: ['store', 'book', 0, 'author'],
          value: 'Nigel Rees',
        },
        {
          path: ['store', 'book', 0, 'price'],
          value: 8.95,
        },
        {
          path: ['store', 'book', 0, 'title'],
          value: 'Sayings of the Century',
        },
        {
          path: ['store', 'book', 1, 'author'],
          value: 'Evelyn Waugh',
        },
        {
          path: ['store', 'book', 1, 'price'],
          value: 12.99,
        },
        {
          path: ['store', 'book', 1, 'title'],
          value: 'Sword of Honour',
        },
        {
          path: ['store', 'book', 2, 'author'],
          value: 'Herman Melville',
        },
        {
          path: ['store', 'book', 2, 'isbn'],
          value: '0-553-21311-3',
        },
        {
          path: ['store', 'book', 2, 'price'],
          value: 8.99,
        },
        {
          path: ['store', 'book', 2, 'title'],
          value: 'Moby Dick',
        },
        {
          path: ['store', 'book', 3, 'author'],
          value: 'J. R. R. Tolkien',
        },
        {
          path: ['store', 'book', 3, 'isbn'],
          value: '0-395-19395-8',
        },
        {
          path: ['store', 'book', 3, 'price'],
          value: 22.99,
        },
        {
          path: ['store', 'book', 3, 'title'],
          value: 'The Lord of the Rings',
        },
      ]);
      deepEqual(collect(input, '$..book[?(@property !== 0)]'), [
        {
          path: ['store', 'book', 1],
          value: input.store.book[1],
        },
        {
          path: ['store', 'book', 2],
          value: input.store.book[2],
        },
        {
          path: ['store', 'book', 3],
          value: input.store.book[3],
        },
      ]);
    });

    it('Custom property: @parentProperty', () => {
      deepEqual(collect(input, '$.store.*[?(@parentProperty !== "book")]'), [
        {
          path: ['store', 'bicycle', 'color'],
          value: 'red',
        },
        {
          path: ['store', 'bicycle', 'price'],
          value: 19.95,
        },
      ]);
      deepEqual(collect(input, '$..book.*[?(@parentProperty !== 0)]'), [
        {
          path: ['store', 'book', 1, 'author'],
          value: 'Evelyn Waugh',
        },
        {
          path: ['store', 'book', 1, 'category'],
          value: 'fiction',
        },
        {
          path: ['store', 'book', 1, 'price'],
          value: 12.99,
        },
        {
          path: ['store', 'book', 1, 'title'],
          value: 'Sword of Honour',
        },
        {
          path: ['store', 'book', 2, 'author'],
          value: 'Herman Melville',
        },
        {
          path: ['store', 'book', 2, 'category'],
          value: 'fiction',
        },
        {
          path: ['store', 'book', 2, 'isbn'],
          value: '0-553-21311-3',
        },
        {
          path: ['store', 'book', 2, 'price'],
          value: 8.99,
        },
        {
          path: ['store', 'book', 2, 'title'],
          value: 'Moby Dick',
        },
        {
          path: ['store', 'book', 3, 'author'],
          value: 'J. R. R. Tolkien',
        },
        {
          path: ['store', 'book', 3, 'category'],
          value: 'fiction',
        },
        {
          path: ['store', 'book', 3, 'isbn'],
          value: '0-395-19395-8',
        },
        {
          path: ['store', 'book', 3, 'price'],
          value: 22.99,
        },
        {
          path: ['store', 'book', 3, 'title'],
          value: 'The Lord of the Rings',
        },
      ]);
    });

    it('Custom property: @root', () => {
      deepEqual(
        collect(input, '$..book[?(@.price === @root.store.book[2].price)]'),
        [
          {
            path: ['store', 'book', 2],
            value: input.store.book[2],
          },
        ],
      );
    });

    it('@number()', () => {
      deepEqual(collect(input, '$.store.book..*@number()'), [
        {
          path: ['store', 'book', 0, 'price'],
          value: 8.95,
        },
        {
          path: ['store', 'book', 1, 'price'],
          value: 12.99,
        },
        {
          path: ['store', 'book', 2, 'price'],
          value: 8.99,
        },
        {
          path: ['store', 'book', 3, 'price'],
          value: 22.99,
        },
      ]);
    });

    it('Regex on value', () => {
      deepEqual(
        collect(
          input,
          '$..book.*[?(@property === "category" && @.match(/TION$/i))]',
        ),
        [
          {
            path: ['store', 'book', 1, 'category'],
            value: 'fiction',
          },
          {
            path: ['store', 'book', 2, 'category'],
            value: 'fiction',
          },
          {
            path: ['store', 'book', 3, 'category'],
            value: 'fiction',
          },
        ],
      );
    });

    it('Regex on property', () => {
      deepEqual(collect(input, '$..book.*[?(@property.match(/bn$/i))]^'), [
        {
          path: ['store', 'book', 2],
          value: input.store.book[2],
        },
        {
          path: ['store', 'book', 3],
          value: input.store.book[3],
        },
      ]);
    });
  });

  describe(`JSONPath - Properties`, function () {
    const input = {
      test1: {
        test2: {
          'test3.test4.test5': {
            test7: 'value',
          },
        },
      },
      datafield: [
        { tag: '035', subfield: { '@code': 'a', '#text': '1879' } },
        { '@tag': '042', subfield: { '@code': 'a', '#text': '5555' } },
        { '@tag': '045', '045': 'secret' },
      ],
    };

    it('Periods within properties', () => {
      deepEqual(collect(input, "$.test1.test2['test3.test4.test5']"), [
        {
          path: ['test1', 'test2', 'test3.test4.test5'],
          value: input.test1.test2['test3.test4.test5'],
        },
      ]);
    });

    it('At signs within properties', () => {
      deepEqual(collect(input, "$.datafield[?(@.tag=='035')]"), [
        {
          path: ['datafield', 0],
          value: input.datafield[0],
        },
      ]);
      deepEqual(collect(input, "$.datafield[?(@['@tag']=='042')]"), [
        {
          path: ['datafield', 1],
          value: input.datafield[1],
        },
      ]);
      // compare(json, "$.datafield[2][(@['@tag'])]");
    });

    it('At signs within properties (null data)', () => {
      deepEqual(
        collect(
          {
            datafield: [null],
          },
          "$.datafield[?(@ && @.tag=='xxx')]",
        ),
        [],
      );
    });

    it('Checking properties of child object (through `@` as parent object)', function () {
      const input = {
        test1: {
          a: 4,
          b: 8,
        },
      };
      deepEqual(collect(input, '$.[?(@.a == 4)]'), [
        {
          path: ['test1'],
          value: input.test1,
        },
      ]);
    });

    it('Checking properties of child object (through `@` as property)', function () {
      const input = {
        test1: {
          a: 4,
          b: 8,
        },
      };
      deepEqual(collect(input, "$.[?(@property == 'a' && @ == 4)]^"), [
        {
          path: ['test1'],
          value: input.test1,
        },
      ]);
    });
  });

  describe('JSONPath - Slice', function () {
    it('should return empty array if slicing non-array', function () {
      const input = {
        name: 'root',
        children: {},
      };
      deepEqual(collect(input, '$.children[1:3]'), []);
    });

    it('should return objects with slice step', function () {
      const withChildren = {
        name: 'root',
        children: [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }, { a: 5 }, { a: 6 }],
      };
      deepEqual(collect(withChildren, '$.children[1:6:2]'), [
        {
          path: ['children', 1],
          value: withChildren.children[1],
        },
        {
          path: ['children', 3],
          value: withChildren.children[3],
        },
        {
          path: ['children', 5],
          value: withChildren.children[5],
        },
      ]);
    });

    it('should return objects with negative end slice', function () {
      const withChildren = {
        name: 'root',
        children: [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }, { a: 5 }, { a: 6 }],
      };
      deepEqual(collect(withChildren, '$.children[1:-3]'), [
        {
          path: ['children', 1],
          value: withChildren.children[1],
        },
        {
          path: ['children', 2],
          value: withChildren.children[2],
        },
      ]);
    });
  });

  describe(`JSONPath - Eval`, function () {
    const input = {
      store: {
        book: {
          category: 'reference',
          author: 'Nigel Rees',
          title: 'Sayings of the Century',
          price: [8.95, 8.94],
        },
        books: [
          {
            category: 'fiction',
            author: 'Evelyn Waugh',
            title: 'Sword of Honour',
            price: [10.99, 12.29],
          },
          {
            category: 'fiction',
            author: 'Herman Melville',
            title: 'Moby Dick',
            isbn: '0-553-21311-3',
            price: [8.99, 6.95],
          },
        ],
      },
    };

    it('eval', () => {
      const selector = '$..[?((@.price && @.price[0]+@.price[1]) > 20)]';
      deepEqual(collect(input, selector), [
        {
          path: ['store', 'books', 0],
          value: input.store.books[0],
        },
      ]);
    });

    it('accessing current path', () => {
      deepEqual(collect(input, "$..[?(@path==\"$['store']['books'][1]\")]"), [
        {
          path: ['store', 'books', 1],
          value: input.store.books[1],
        },
      ]);
    });
  });

  describe('JSONPath - Type Operators', function () {
    // tests based on examples at http://goessner.net/articles/jsonpath/
    const input = {
      store: {
        book: [
          {
            category: 'reference',
            author: 'Nigel Rees',
            title: 'Sayings of the Century',
            price: [8.95, 8.94, 8.93],
          },
          {
            category: 'fiction',
            author: 'Evelyn Waugh',
            title: 'Sword of Honour',
            price: 12.99,
          },
          {
            category: 'fiction',
            author: 'Herman Melville',
            title: 'Moby Dick',
            isbn: '0-553-21311-3',
            price: 8.99,
          },
          {
            category: 'fiction',
            author: 'J. R. R. Tolkien',
            title: 'The Lord of the Rings',
            isbn: '0-395-19395-8',
            price: 22.99,
          },
        ],
        bicycle: {
          color: 'red',
          price: 19.95,
        },
      },
    };

    it('@number()', () => {
      deepEqual(collect(input, '$.store.book..*@number()'), [
        {
          path: ['store', 'book', 0, 'price', 0],
          value: 8.95,
        },
        {
          path: ['store', 'book', 0, 'price', 1],
          value: 8.94,
        },
        {
          path: ['store', 'book', 0, 'price', 2],
          value: 8.93,
        },
        {
          path: ['store', 'book', 1, 'price'],
          value: 12.99,
        },
        {
          path: ['store', 'book', 2, 'price'],
          value: 8.99,
        },
        {
          path: ['store', 'book', 3, 'price'],
          value: 22.99,
        },
      ]);
    });

    it('@scalar()', () => {
      deepEqual(collect(input, '$.store.bicycle..*@scalar()'), [
        {
          path: ['store', 'bicycle', 'color'],
          value: 'red',
        },
        {
          path: ['store', 'bicycle', 'price'],
          value: 19.95,
        },
      ]);
    });

    it('@scalar() get falsey and avoid objects', () => {
      const mixed = {
        nested: {
          a: 5,
          b: {},
          c: null,
          d: 'abc',
        },
      };

      deepEqual(collect(mixed, '$..*@scalar()'), [
        {
          path: ['nested', 'a'],
          value: 5,
        },
        {
          path: ['nested', 'c'],
          value: null,
        },
        {
          path: ['nested', 'd'],
          value: 'abc',
        },
      ]);
    });

    it('@object()', () => {
      const mixed = {
        nested: {
          a: true,
          b: null,
          c: {
            d: 7,
          },
        },
      };

      deepEqual(collect(mixed, '$..*@object()'), [
        {
          path: ['nested', 'c'],
          value: mixed.nested.c,
        },
        {
          path: ['nested'],
          value: mixed.nested,
        },
      ]);
    });

    it('@array()', () => {
      const mixed = {
        nested: {
          a: [3, 4, 5],
          b: null,
          c: [7, [8, 9]],
        },
      };

      deepEqual(collect(mixed, '$..*@array()'), [
        {
          path: ['nested', 'a'],
          value: mixed.nested.a,
        },
        {
          path: ['nested', 'c', 1],
          value: mixed.nested.c[1],
        },
        {
          path: ['nested', 'c'],
          value: mixed.nested.c,
        },
      ]);
    });

    it('@boolean()', () => {
      const mixed = {
        nested: {
          a: true,
          b: null,
          c: [7, [false, 9]],
        },
      };

      deepEqual(collect(mixed, '$..*@boolean()'), [
        {
          path: ['nested', 'a'],
          value: true,
        },
        {
          path: ['nested', 'c', 1, 0],
          value: false,
        },
      ]);
    });

    it('@integer()', () => {
      const mixed = {
        nested: {
          a: 50.7,
          b: null,
          c: [42, [false, 73]],
        },
      };

      deepEqual(collect(mixed, '$..*@integer()'), [
        {
          path: ['nested', 'c', 0],
          value: 42,
        },
        {
          path: ['nested', 'c', 1, 1],
          value: 73,
        },
      ]);
    });

    it('@null()', () => {
      const mixed = {
        nested: {
          a: 50.7,
          b: null,
          c: [42, [false, 73]],
        },
      };

      deepEqual(collect(mixed, '$..*@null()'), [
        {
          path: ['nested', 'b'],
          value: null,
        },
      ]);
    });
  });

  describe(`JSONPath - All`, function () {
    const input = {
      name: 'root',
      children: [
        {
          name: 'child1',
          children: [{ name: 'child1_1' }, { name: 'child1_2' }],
        },
        { name: 'child2', children: [{ name: 'child2_1' }] },
        {
          name: 'child3',
          children: [{ name: 'child3_1' }, { name: 'child3_2' }],
        },
      ],
    };

    it('simple parent selection, return both path and value', () => {
      deepEqual(collect(input, '$.children[0]^'), [
        {
          path: ['children'],
          value: input.children,
        },
      ]);
    });

    it('parent selection with multiple matches, return both path and value', () => {
      deepEqual(collect(input, '$.children[1:3]^'), [
        {
          path: ['children'],
          value: input.children,
        },
        {
          path: ['children'],
          value: input.children,
        },
      ]);
    });

    it.skip('select sibling via parent, return both path and value', () => {
      deepEqual(
        collect(
          input,
          '$..[?(@.name && @.name.match(/3_1$/))]^[?(@.name.match(/_2$/))]',
        ),
        [
          {
            path: ['children', 2, 'children', 1],
            value: input.children[2].children[1],
          },
        ],
      );
    });

    it('parent parent parent, return both path and value', () => {
      deepEqual(
        collect(input, '$..[?(@.name && @.name.match(/1_1$/))].name^^'),
        [
          {
            path: ['children', 0, 'children'],
            value: input.children[0].children,
          },
        ],
      );
    });

    it('no such parent', () => {
      deepEqual(collect(input, '$.name^^'), []);
    });
  });

  describe('JSONPath - At and Dollar sign', function () {
    const t1 = {
      simpleString: 'simpleString',
      '@': '@asPropertyName',
      a$a: '$inPropertyName',
      $: {
        '@': 'withboth',
      },
      a: {
        b: {
          c: 'food',
        },
      },
    };

    it('test undefined, null', () => {
      deepEqual(collect({ a: null }, '$.a'), [
        {
          path: ['a'],
          value: null,
        },
      ]);
      deepEqual(collect({}, '$.foo'), []);
      deepEqual(collect({ a: 'b' }, '$.foo'), []);
      deepEqual(collect({ a: 'b' }, '$.foo'), []);
    });

    it('test $ and @', () => {
      deepEqual(collect(t1, '$.a$a'), [
        {
          path: ['a$a'],
          value: '$inPropertyName',
        },
      ]);
    });

    it('@ as false', () => {
      const input = {
        a: {
          b: false,
        },
      };
      deepEqual(collect(input, '$..*[?(@ === false)]'), [
        {
          path: ['a', 'b'],
          value: false,
        },
      ]);
    });

    it('@ as 0', function () {
      const input = {
        a: {
          b: 0,
        },
      };
      deepEqual(collect(input, "$.a[?(@property === 'b' && @ < 1)]"), [
        {
          path: ['a', 'b'],
          value: 0,
        },
      ]);
    });
  });

  describe(`JSONPath - Parent selector`, function () {
    const input = {
      name: 'root',
      children: [
        {
          name: 'child1',
          children: [{ name: 'child1_1' }, { name: 'child1_2' }],
        },
        { name: 'child2', children: [{ name: 'child2_1' }] },
        {
          name: 'child3',
          children: [{ name: 'child3_1' }, { name: 'child3_2' }],
        },
      ],
    };

    it('simple parent selection', () => {
      deepEqual(collect(input, '$.children[0]^'), [
        {
          path: ['children'],
          value: input.children,
        },
      ]);
    });

    it('parent selection with multiple matches', () => {
      deepEqual(collect(input, '$.children[1:3]^'), [
        {
          path: ['children'],
          value: input.children,
        },
        {
          path: ['children'],
          value: input.children,
        },
      ]);
    });

    it.skip('select sibling via parent', () => {
      deepEqual(
        collect(
          input,
          '$..[?(@.name && @.name.match(/3_1$/))]^[?(@.name.match(/_2$/))]',
        ),
        [
          {
            path: ['children', 2, 'children', 1],
            value: input.children[2].children[1],
          },
        ],
      );
    });

    it('parent parent parent', () => {
      deepEqual(
        collect(input, '$..[?(@.name && @.name.match(/1_1$/))].name^^'),
        [
          {
            path: ['children', 0, 'children'],
            value: input.children[0].children,
          },
        ],
      );
    });

    it('empty string key (parent of)', () => {
      const input = {
        '': null,
      };
      deepEqual(collect(input, '$[""]^'), [
        {
          path: [],
          value: input,
        },
      ]);
    });

    it('no such parent', () => {
      deepEqual(collect(input, '$.name^^'), []);
    });

    it.skip('select sibling via parent (with non-match present)', () => {
      const multipleChildren = {
        name: 'root',
        children: [
          {
            name: 'child1',
            children: [{ name: 'child1_1' }, { name: 'child1_2' }],
          },
          { name: 'child2', children: [{ name: 'child2_1' }] },
          {
            name: 'child3',
            children: [{ name: 'child3_1' }, { name: 'child3_2' }],
          },
          {
            name: 'child4',
            children: [{ name: 'child4_1' }, { name: 'child3_1' }],
          },
        ],
      };

      deepEqual(
        collect(
          multipleChildren,
          '$..[?(@.name && @.name.match(/3_1$/))]^[?(@.name.match(/_2$/))]',
        ),
        [
          {
            path: ['children', 2, 'children', 1],
            value: multipleChildren.children[2].children[1],
          },
        ],
      );
    });

    it.skip('select sibling via parent (with multiple results)', () => {
      const multipleChildren = {
        name: 'root',
        children: [
          {
            name: 'child1',
            children: [{ name: 'child1_1' }, { name: 'child1_2' }],
          },
          { name: 'child2', children: [{ name: 'child2_1' }] },
          {
            name: 'child3',
            children: [
              { name: 'child3_1' },
              { name: 'child3_2' },
              { name: 'child3_2', second: true },
            ],
          },
        ],
      };

      deepEqual(
        collect(
          multipleChildren,
          '$..[?(@.name && @.name.match(/3_1$/))]^[?(@.name.match(/_2$/))]',
        ),
        [
          {
            path: ['children', 2, 'children', 1],
            value: multipleChildren.children[2].children[1],
          },
          {
            path: ['children', 2, 'children', 2],
            value: multipleChildren.children[2].children[2],
          },
        ],
      );
    });
  });
});

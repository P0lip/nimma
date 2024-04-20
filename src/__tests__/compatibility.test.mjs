// tests based on https://github.com/JSONPath-Plus/JSONPath
import { describe, it } from 'node:test';

import { compare } from './__helpers__/jsonpath.mjs';

const json = {
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

describe('Compatibility tests', () => {
  for (const path of ['$.store.bicycle', "$['store']['bicycle']"]) {
    it(path, () => {
      compare(json, path);
    });
  }

  describe('JSONPath - Array', function () {
    const json = {
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

    for (const path of [
      '$.store.book',
      '$.store.books',
      '$.store.books[*].author',
    ]) {
      it(path, () => {
        compare(json, path);
      });
    }

    it('query single element arr w/array value', () => {
      const authors = ['Dickens', 'Lancaster'];
      const input = {
        books: [{ authors }],
      };
      compare(input, '$.books[0].authors');
    });

    it('query multi element arr w/array value', () => {
      const authors = ['Dickens', 'Lancaster'];
      const input = {
        books: [{ authors }, { authors }],
      };
      compare(input, '$.books[*].authors');
    });
  });

  describe('JSONPath - Intermixed Array', function () {
    // tests based on examples at http://goessner.net/articles/jsonpath/
    const json = {
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
      compare(json, '$.store..price');
    });

    it('all sub properties of single element arr', () => {
      const book = json.store.book[0];
      const input = { book };
      compare(input, '$..title');
    });
  });

  describe('JSONPath - Path expressions', function () {
    // tests based on examples at http://goessner.net/articles/JsonPath/
    const json = {
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
      compare(json, '$.store.book[*].author');
    });

    it('bracket notation', () => {
      compare(json, "$['store']['book'][*]['author']");
    });

    it('bracket notation (double quoted)', () => {
      compare(json, '$["store"]["book"][*]["author"]');
    });

    it('bracket notation without quotes', () => {
      compare(json, '$[store][book][*][author]');
    });

    it('mixed notation', () => {
      compare(json, "$.store.book[*]['author']");
    });

    it('bracket notation containing dots', () => {
      compare(json, "$['store']['book'][*]['application/vnd.wordperfect']");
    });

    it('mixed notation containing dots', () => {
      compare(json, "$.store.book[*]['application/vnd.wordperfect']");
    });

    it('empty string key', () => {
      const jsonSimple = {
        '': null,
      };
      compare(jsonSimple, '$[""]');
    });
  });

  describe(`JSONPath - Examples`, function () {
    // tests based on examples at http://goessner.net/articles/jsonpath/

    it('wildcards (with and without $.)', () => {
      compare(json, '$.store.book[*].author');
    });

    it('all properties, entire tree', () => {
      compare(json, '$..author');
    });

    it('all sub properties, single level', () => {
      compare(json, '$.store.*');
    });

    it('all sub properties, entire tree', () => {
      compare(json, '$.store..price');
    });

    it('n property of entire tree', () => {
      compare(json, '$..book[2]');
    });

    it('last property of entire tree', () => {
      compare(json, '$..book[(@.length-1)]');
      compare(json, '$..book[-1:]');
    });

    it('range of property of entire tree', () => {
      compare(json, '$..book[0,1]');
      compare(json, '$..book[:2]');
    });

    it('range of property of entire tree w/ single element result', () => {
      const book = json.store.book[0];
      const input = { books: [book] };
      compare(input, '$.books[0,1]');
      compare(input, '$.books[:1]');
    });

    it('categories and authors of all books', () => {
      compare(json, '$..book[0][category,author]');
    });

    it('filter all properties if sub property exists, of entire tree', () => {
      compare(json, '$..book[?(@.isbn)]');
    });

    it('filter all properties if sub property exists, of single element array', () => {
      const book = json.store.book[3];
      const input = { books: [book] };
      compare(input, '$.books[?(@.isbn)]');
    });

    it('filter all properties if sub property greater than of entire tree', () => {
      compare(json, '$..book[?(@.price<10)]');
    });

    it('@ as a scalar value', () => {
      compare(json, "$..*[?(@property === 'price' && @ !== 8.95)]");
    });

    it('all properties of a JSON structure (beneath the root)', () => {
      compare(json, '$..*');
    });

    it('all parent components of a JSON structure', () => {
      compare(json, '$..');
    });

    it('root', () => {
      compare(json, '$');
    });

    it('Custom operator: parent (caret)', () => {
      compare(json, '$..[?(@.price>19)]^');
    });

    it('Custom operator: property name (tilde)', () => {
      compare(json, '$.store.*~');
    });

    it('Custom property @path', () => {
      compare(json, "$.store.book[?(@path !== \"$['store']['book'][0]\")]");
    });

    it('Custom property: @parent', () => {
      compare(
        json,
        '$..book[?(@parent.bicycle && @parent.bicycle.color === "red")].category',
      );
    });

    it('Custom property: @property', () => {
      compare(json, '$..book.*[?(@property !== "category")]');
      compare(json, '$..book[?(@property !== 0)]');
    });

    it('Custom property: @parentProperty', () => {
      compare(json, '$.store.*[?(@parentProperty !== "book")]');
      compare(json, '$..book.*[?(@parentProperty !== 0)]');
    });

    it('Custom property: @root', () => {
      compare(json, '$..book[?(@.price === @root.store.book[2].price)]');
    });

    it('@number()', () => {
      compare(json, '$.store.book..*@number()');
    });

    it('Regex on value', () => {
      compare(
        json,
        '$..book.*[?(@property === "category" && @.match(/TION$/i))]',
      );
    });

    it('Regex on property', () => {
      compare(json, '$..book.*[?(@property.match(/bn$/i))]^');
    });
  });

  describe(`JSONPath - Properties`, function () {
    const json = {
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
      compare(json, "$.test1.test2['test3.test4.test5']");
    });

    it('At signs within properties', () => {
      compare(json, "$.datafield[?(@.tag=='035')]");
      compare(json, "$.datafield[?(@['@tag']=='042')]");
      // compare(json, "$.datafield[2][(@['@tag'])]");
    });

    it('At signs within properties (null data)', () => {
      compare(
        {
          datafield: [null],
        },
        "$.datafield[?(@ && @.tag=='xxx')]",
      );
    });

    it('Checking properties of child object (through `@` as parent object)', function () {
      const jsonObj = {
        test1: {
          a: 4,
          b: 8,
        },
      };
      compare(jsonObj, '$.[?(@.a == 4)]');
    });

    it('Checking properties of child object (through `@` as property)', function () {
      const jsonObj = {
        test1: {
          a: 4,
          b: 8,
        },
      };

      compare(jsonObj, "$.[?(@property == 'a' && @ == 4)]^");
    });
  });

  describe('JSONPath - Slice', function () {
    const json = {
      name: 'root',
      children: {},
    };

    it('should return empty array if slicing non-array', function () {
      compare(json, '$.children[1:3]');
    });

    it('should return objects with slice step', function () {
      const jsonWithChildren = {
        name: 'root',
        children: [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }, { a: 5 }, { a: 6 }],
      };
      compare(jsonWithChildren, '$.children[1:6:2]');
    });

    it('should return objects with negative end slice', function () {
      const jsonWithChildren = {
        name: 'root',
        children: [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }, { a: 5 }, { a: 6 }],
      };
      compare(jsonWithChildren, '$.children[1:-3]');
    });
  });

  describe(`JSONPath - Eval`, function () {
    const json = {
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
      compare(json, selector);
    });

    it('accessing current path', () => {
      compare(json, "$..[?(@path==\"$['store']['books'][1]\")]");
    });
  });

  describe('JSONPath - Type Operators', function () {
    // tests based on examples at http://goessner.net/articles/jsonpath/
    const json = {
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
      compare(json, '$.store.book..*@number()');
    });

    it('@scalar()', () => {
      compare(json, '$.store.bicycle..*@scalar()');
    });

    it('@scalar() get falsey and avoid objects', () => {
      const jsonMixed = {
        nested: {
          a: 5,
          b: {},
          c: null,
          d: 'abc',
        },
      };

      compare(jsonMixed, '$..*@scalar()');
    });

    it('@object()', () => {
      const jsonMixed = {
        nested: {
          a: true,
          b: null,
          c: {
            d: 7,
          },
        },
      };

      compare(jsonMixed, '$..*@object()');
    });

    it('@array()', () => {
      const jsonMixed = {
        nested: {
          a: [3, 4, 5],
          b: null,
          c: [7, [8, 9]],
        },
      };

      compare(jsonMixed, '$..*@array()');
    });

    it('@boolean()', () => {
      const jsonMixed = {
        nested: {
          a: true,
          b: null,
          c: [7, [false, 9]],
        },
      };

      compare(jsonMixed, '$..*@boolean()');
    });

    it('@integer()', () => {
      const jsonMixed = {
        nested: {
          a: 50.7,
          b: null,
          c: [42, [false, 73]],
        },
      };

      compare(jsonMixed, '$..*@integer()');
    });

    it('@null()', () => {
      const jsonMixed = {
        nested: {
          a: 50.7,
          b: null,
          c: [42, [false, 73]],
        },
      };

      compare(jsonMixed, '$..*@null()');
    });
  });

  describe(`JSONPath - All`, function () {
    const json = {
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
      compare(json, '$.children[0]^');
    });

    it('parent selection with multiple matches, return both path and value', () => {
      compare(json, '$.children[1:3]^');
    });

    it.skip('select sibling via parent, return both path and value', () => {
      compare(
        json,
        '$..[?(@.name && @.name.match(/3_1$/))]^[?(@.name.match(/_2$/))]',
      );
    });

    it('parent parent parent, return both path and value', () => {
      compare(json, '$..[?(@.name && @.name.match(/1_1$/))].name^^');
    });

    it('no such parent', () => {
      compare(json, '$.name^^');
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
      compare({ a: null }, '$.a');
      compare({}, '$.foo');
      compare({ a: 'b' }, '$.foo');
      compare({ a: 'b' }, '$.foo');
    });

    it('test $ and @', () => {
      compare(t1, '$.a$a');
    });

    it('@ as false', () => {
      const json = {
        a: {
          b: false,
        },
      };
      compare(json, '$..*[?(@ === false)]');
    });

    it('@ as 0', function () {
      const json = {
        a: {
          b: 0,
        },
      };
      compare(json, "$.a[?(@property === 'b' && @ < 1)]");
    });
  });

  describe(`JSONPath - Parent selector`, function () {
    const json = {
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
      compare(json, '$.children[0]^');
    });

    it('parent selection with multiple matches', () => {
      compare(json, '$.children[1:3]^');
    });

    it.skip('select sibling via parent', () => {
      compare(
        json,
        '$..[?(@.name && @.name.match(/3_1$/))]^[?(@.name.match(/_2$/))]',
      );
    });

    it('parent parent parent', () => {
      compare(json, '$..[?(@.name && @.name.match(/1_1$/))].name^^');
    });

    it('empty string key (parent of)', () => {
      const jsonSimple = {
        '': null,
      };
      compare(jsonSimple, '$[""]^');
    });

    it('no such parent', () => {
      compare(json, '$.name^^');
    });

    it.skip('select sibling via parent (with non-match present)', () => {
      const jsonMultipleChildren = {
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

      compare(
        jsonMultipleChildren,
        '$..[?(@.name && @.name.match(/3_1$/))]^[?(@.name.match(/_2$/))]',
      );
    });

    it.skip('select sibling via parent (with multiple results)', () => {
      const jsonMultipleChildren = {
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

      compare(
        jsonMultipleChildren,
        '$..[?(@.name && @.name.match(/3_1$/))]^[?(@.name.match(/_2$/))]',
      );
    });
  });
});

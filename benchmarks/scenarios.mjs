export default [
  {
    expressions: [
      '$..street',
      '$..[street,city,country]',
      '$..[?(@property === "street")]',
      '$..address.street[?(@.number > 20)]',
      '$.address.street',
    ],
    filepath: './fixtures/address.json',
  },
  {
    expressions: [
      '$..street',
      '$..[street,city,country]',
      '$..[?(@property === "street")]',
      '$..address.street[?(@.number > 20)]',
      '$.address.street',
    ],
    filepath: './fixtures/address-large.json',
  },
  {
    expressions: [
      '$.store.book[*].author',
      '$..author',
      '$.store.*',
      '$.store..price',
      '$..book[2]',
      '$..book[(@.length-1)]', // jsonpath-plus throws
      '$..book[-1:]',
      '$..book[0,1]',
      '$..book[:2]',
      '$..book[?(@.isbn)]',
      '$..book[?(@.price<10)]',
    ],
    filepath: './fixtures/goessner.json',
  },
  {
    expressions: [
      '$.store.book[*].author',
      '$..author',
      '$.store.*',
      '$.store..price',
      '$..book[2]',
      // '$..book[(@.length-1)]', // jsonpath-plus throws
      '$..book[-1:]',
      '$..book[0,1]',
      '$..book[:2]',
      '$..book[10:15]',
      '$..book[?(@.isbn)]',
      '$..book[?(@.title)]',
      '$..book[?(@.price<10)]',
      '$..book[?(@.price>100)]',
      '$..book[?(@.price && @.price.toString() === "10.20")]',
    ],
    filepath: './fixtures/goessner.json',
    name: 'goessner-extended',
  },
];

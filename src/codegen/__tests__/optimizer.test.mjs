import { baseline } from '../baseline.mjs';

xdescribe('optimizer', () => {
  it('flat', () => {
    expect(baseline('$.info.contact')).to.equal(
      `path.length === 2 && property === 'contact' && path[0] === 'info'`,
    );

    expect(baseline('$.servers[*].url')).to.equal(
      `path.length === 3 && property === 'url' && path[0] === 'servers'`,
    );
  });

  it('deep', () => {
    expect(baseline('$..*')).to.equal('true');

    // path lookup could _potentially_ be cached in traverse
    expect(baseline('$..content..*')).to.equal(
      `(scope.lastIndex = path.indexOf('content'), true) && scope.lastIndex !== -1 && path.length > scope.lastIndex`,
    );

    expect(baseline('$..empty')).to.equal(`property === 'empty'`);

    expect(baseline('$.paths..content.*.examples')).to.equal(
      `path.length > 0 && path[0] === 'paths' && (scope.lastIndex = path.indexOf('content'), true) && scope.lastIndex !== -1 && scope.lastIndex === path.length - 2 && property === 'examples'`,
    );
  });
  //
});
